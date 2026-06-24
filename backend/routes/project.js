const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { upload, optimizeImage } = require("../middleware/imageUpload");
const { protect } = require("../middleware/authMiddleware");

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);

router.post(
  "/",
  protect,
  upload.single("image"),
  optimizeImage,
  projectController.createProject
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  optimizeImage,
  projectController.updateProject
);

router.delete("/:id", protect, projectController.deleteProject);

module.exports = router;