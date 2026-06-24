const Project = require("../models/Project");

// ── Public ────────────────────────────────────────────────────────────────
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

    if (req.query.featured === "true") filter.featured = true;

    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
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

// ── Admin / write operations ─────────────────────────────────────────────
exports.createProject = async (req, res, next) => {
  try {
    const imageUrl = req.file?.url || req.body.image || "";

    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      image: imageUrl,
      techStack: req.body.techStack || [],
      liveUrl: req.body.liveUrl || "",
      githubUrl: req.body.githubUrl || "",
      featured: req.body.featured === true || req.body.featured === "true",
      status: req.body.status || "published",
      order: req.body.order ?? 0,
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
      techStack: req.body.techStack,
      featured: req.body.featured === true || req.body.featured === "true",
      status: req.body.status,
      order: req.body.order,
    };

    // Drop undefined keys so we don't overwrite existing values with undefined
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    if (req.file?.url) {
      updateData.image = req.file.url;
    } else if (req.body.image) {
      updateData.image = req.body.image;
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

// ── Admin-only listing (full list incl. drafts, with optional limit/featured filter) ──
exports.getAllProjects = async (req, res, next) => {
  try {
    const { limit, featured } = req.query;
    const filter = {};
    if (featured === "true") filter.featured = true;

    const projects = await Project.find(filter)
      .limit(parseInt(limit) || 50)
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};
