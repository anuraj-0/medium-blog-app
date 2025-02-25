const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

// Add a comment to a blog
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const blog = await Blog.findById(postId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = new Comment({ blog: postId, user: userId, text });
    await comment.save();

    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all comments for a blog
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ blog: postId }).populate(
      "user",
      "name email"
    );
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment (only by author)
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== userId)
      return res.status(403).json({ message: "Not authorized" });

    comment.text = text;
    await comment.save();

    res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment (only by author)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== userId)
      return res.status(403).json({ message: "Not authorized" });

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addComment, getComments, updateComment, deleteComment };
