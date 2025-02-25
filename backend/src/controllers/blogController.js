const Blog = require("../models/Blog");
const uploadImage = require("../utils/imageUpload");

const client = require("../config/redis");

// Create a blog post
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    let imageUrl = null;

    if (req.file) {
      const sanitizedFilename = req.file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      req.file.originalname = sanitizedFilename;
      imageUrl = await uploadImage(req.file);
    }

    const newBlog = new Blog({
      title,
      content,
      imageUrl: imageUrl || "",
      author: req.user.id,
    });
    await newBlog.save();
    await client.flushAll();

    res
      .status(201)
      .json({ message: "Blog created successfully!", blog: newBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all blogs
const getBlogs = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;

    const skip = (page - 1) * limit;
    const cacheKey = `blogs_page_${page}_limit_${limit}`;

    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    const responseData = { blogs, totalPages, currentPage: page };

    await client.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// Get a single blog
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a blog
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let imageUrl = blog.imageUrl;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    blog.imageUrl = imageUrl;

    await blog.save();
    await client.flushAll();
    res.status(200).json({ message: "Blog updated successfully!", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await blog.deleteOne();
    await client.flushAll();

    res.status(200).json({ message: "Blog deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all blog posts of the logged-in user
const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Blog.find({ author: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  getMySubmissions,
};
