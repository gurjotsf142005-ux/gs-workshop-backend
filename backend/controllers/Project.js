const Project = require("../models/Project");

exports.getProjects = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const imageUrl = req.file?.url || "";

    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      image: imageUrl,
      liveUrl: req.body.liveUrl || "",
      githubUrl: req.body.githubUrl || "",
      featured: req.body.featured === "true",
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      liveUrl: req.body.liveUrl,
      githubUrl: req.body.githubUrl,
      featured: req.body.featured === "true",
    };

    if (req.file?.url) {
      updateData.image = req.file.url;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};