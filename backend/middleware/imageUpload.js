const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");

const uploadDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

async function optimizeImage(req, res, next) {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const outputFileName = `${path.parse(req.file.filename).name}.webp`;
  const outputPath = path.join(uploadDir, outputFileName);

  try {
    await sharp(inputPath)
      .resize(1400, 1400, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    await fs.unlink(inputPath);

    req.file.optimizedPath = outputPath;
    req.file.url = `/uploads/${outputFileName}`;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, optimizeImage };