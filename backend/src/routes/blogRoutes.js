const express = require("express");
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  getMySubmissions,
} = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

// Create a new blog (protected route with image upload)
router.post("/", authMiddleware, upload.single("image"), createBlog);

// Get all blogs
router.get("/", getBlogs);

// Protected route to get logged-in user's submissions
router.get("/my-submissions", authMiddleware, getMySubmissions);

// Get a single blog by ID
router.get("/:id", getBlog);

// Update a blog (only the author can update, with optional image upload)
router.put("/:id", authMiddleware, upload.single("image"), updateBlog);

// Delete a blog (only the author can delete)
router.delete("/:id", authMiddleware, deleteBlog);

module.exports = router;
