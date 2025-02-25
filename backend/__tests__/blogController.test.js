const blogController = require("../src/controllers/blogController");
const Blog = require("../src/models/Blog");
const client = require("../src/config/redis");

jest.mock("../src/config/supabase");
jest.mock("../src/models/Blog");
jest.mock("../src/utils/imageUpload");
jest.mock("../src/config/redis");

describe("Blog Controller Tests", () => {
  afterEach(() => {
    // Clearing all mock calls after each test
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Ensuring Redis client is properly closed after all tests
    await new Promise((resolve) => setTimeout(resolve, 500));
    await client.quit();
  });

  // Test: Fetch all blogs with pagination
  test("Should fetch all blogs", async () => {
    const req = { query: {} }; // Mock request with empty query params
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking database count and blog retrieval with pagination
    Blog.countDocuments.mockResolvedValueOnce(1);
    Blog.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValueOnce([
              {
                _id: "1",
                title: "Mock Blog 1",
                author: { name: "Author Name" },
              },
            ]),
          }),
        }),
      }),
    });

    await blogController.getBlogs(req, res);

    // Assertions
    expect(Blog.find).toHaveBeenCalled();
    expect(Blog.countDocuments).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      blogs: [
        { _id: "1", title: "Mock Blog 1", author: { name: "Author Name" } },
      ],
      currentPage: 1,
      totalPages: 1,
    });
  });

  // Test: Fetch a single blog by ID
  test("Should fetch a blog by ID", async () => {
    const req = { params: { id: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking database query with population of author details
    const mockPopulate = jest.fn().mockResolvedValue({
      _id: "1",
      title: "Mock Blog 1",
      author: { name: "Author Name", email: "author@example.com" },
    });

    Blog.findById.mockReturnValue({ populate: mockPopulate });

    await blogController.getBlog(req, res);

    // Assertions
    expect(Blog.findById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockPopulate).toHaveBeenCalledWith("author", "name email");
    expect(res.json).toHaveBeenCalledWith({
      _id: "1",
      title: "Mock Blog 1",
      author: { name: "Author Name", email: "author@example.com" },
    });
  });

  // Test: Create a new blog
  test("Should create a new blog", async () => {
    const req = {
      body: { title: "New Blog", content: "This is a new blog" },
      user: { id: "Author ID" }, // Simulating authenticated user
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking new blog creation and saving
    const mockBlog = {
      _id: "1",
      title: "New Blog",
      content: "This is a new blog",
      author: "Author ID",
      save: jest.fn().mockResolvedValue(),
    };

    Blog.mockImplementation(() => mockBlog);

    await blogController.createBlog(req, res);

    // Assertions
    expect(mockBlog.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Blog created successfully!",
      blog: mockBlog,
    });
  });

  // Test: Update an existing blog
  test("Should update a blog by ID", async () => {
    const req = {
      params: { id: "1" },
      body: { title: "Updated Title", content: "Updated content" },
      user: { id: "Author ID" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking existing blog retrieval and updating
    const mockBlog = {
      _id: "1",
      title: "Old Title",
      content: "Old content",
      author: "Author ID",
      save: jest.fn().mockResolvedValue(),
    };

    Blog.findById.mockResolvedValue(mockBlog);

    await blogController.updateBlog(req, res);

    // Assertions
    expect(Blog.findById).toHaveBeenCalledWith("1");
    expect(mockBlog.title).toBe("Updated Title");
    expect(mockBlog.content).toBe("Updated content");
    expect(mockBlog.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Blog updated successfully!",
      blog: mockBlog,
    });
  });

  // Test: Fetch user's submitted blogs
  test("Should fetch user's submissions", async () => {
    const req = {
      user: { id: "Author ID" }, // Simulating authenticated user
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking user-submitted blogs retrieval
    const mockSubmissions = [
      {
        _id: "1",
        title: "User Blog 1",
        content: "Content of blog 1",
        author: "Author ID",
        createdAt: new Date("2024-02-01"),
      },
      {
        _id: "2",
        title: "User Blog 2",
        content: "Content of blog 2",
        author: "Author ID",
        createdAt: new Date("2024-02-02"),
      },
    ];

    Blog.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockSubmissions),
    });

    await blogController.getMySubmissions(req, res);

    // Assertions
    expect(Blog.find).toHaveBeenCalledWith({ author: "Author ID" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSubmissions);
  });

  // Test: Delete a blog by ID
  test("Should delete a blog by ID", async () => {
    const req = {
      params: { id: "1" },
      user: { id: "Author ID" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking blog deletion process
    Blog.findById.mockResolvedValue({
      _id: "1",
      title: "Mock Blog 1",
      author: "Author ID",
      deleteOne: jest.fn().mockResolvedValue(),
    });

    await blogController.deleteBlog(req, res);

    // Assertions
    expect(Blog.findById).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Blog deleted successfully!",
    });
  });
});
