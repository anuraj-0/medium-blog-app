const express = require("express");
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

// Add a comment to a post
router.post("/", authMiddleware, addComment);

// Get all comments for a post
router.get("/", getComments);

// Update a comment (only by author)
router.put("/:commentId", authMiddleware, updateComment);

// Delete a comment (only by author)
router.delete("/:commentId", authMiddleware, deleteComment);

module.exports = router;
