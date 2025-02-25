const commentController = require("../src/controllers/commentController");
const Comment = require("../src/models/Comment");
const Blog = require("../src/models/Blog");

jest.mock("../src/models/Comment");
jest.mock("../src/models/Blog");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Comment Controller Tests", () => {
  // Test: Add a comment to a blog
  test("Should add a comment to a blog", async () => {
    const mockSavedComment = {
      _id: "1",
      blog: "1",
      text: "Great blog!",
      user: "user1",
    };

    // Mocking Blog existence check
    Blog.findById.mockResolvedValueOnce({ _id: "1", title: "Test Blog" });

    // Mocking Comment creation and save
    Comment.mockImplementation(() => ({
      _id: "1",
      blog: "1",
      text: "Great blog!",
      user: "user1",
      save: jest.fn().mockResolvedValue(mockSavedComment),
    }));

    const req = {
      params: { postId: "1" },
      body: { text: "Great blog!" },
      user: { id: "user1" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.addComment(req, res);

    expect(Blog.findById).toHaveBeenCalledWith("1");
    expect(Comment).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment added",
      comment: expect.objectContaining(mockSavedComment),
    });
  });

  // Test: Return error if blog is not found
  test("Should return error if blog not found while adding comment", async () => {
    Blog.findById.mockResolvedValue(null);

    const req = {
      params: { postId: "1" },
      body: { text: "Great blog!" },
      user: { id: "user1" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Blog not found" });
  });

  // Test: Get all comments for a blog
  test("Should get all comments for a blog", async () => {
    Comment.find.mockReturnValue({
      populate: jest
        .fn()
        .mockResolvedValue([
          { _id: "1", blog: "1", user: "user1", text: "Great blog!" },
        ]),
    });

    const req = { params: { postId: "1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.getComments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { _id: "1", blog: "1", user: "user1", text: "Great blog!" },
    ]);
  });

  // Test: Update a comment by the author
  test("Should update a comment by the author", async () => {
    Comment.findById.mockResolvedValue({
      _id: "1",
      user: "user1",
      text: "Old comment text",
      save: jest.fn().mockResolvedValue({
        _id: "1",
        user: "user1",
        text: "Updated comment text",
      }),
    });

    const req = {
      params: { commentId: "1" },
      body: { text: "Updated comment text" },
      user: { id: "user1" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment updated",
      comment: expect.objectContaining({
        _id: "1",
        user: "user1",
        text: "Updated comment text",
      }),
    });
  });

  // Test: Return error if comment not found while updating
  test("Should return error if comment not found while updating", async () => {
    Comment.findById.mockResolvedValue(null);

    const req = {
      params: { commentId: "1" },
      body: { text: "Updated comment text" },
      user: { id: "user1" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  // Test: Return error if user is not the author while updating comment
  test("Should return error if user is not the author while updating comment", async () => {
    Comment.findById.mockResolvedValue({
      _id: "1",
      user: "user1",
      text: "Old comment text",
    });

    const req = {
      params: { commentId: "1" },
      body: { text: "Updated comment text" },
      user: { id: "user2" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  // Test: Delete a comment by the author
  test("Should delete a comment by the author", async () => {
    Comment.findById.mockResolvedValue({
      _id: "1",
      user: "user1",
      deleteOne: jest.fn().mockResolvedValue(),
    });

    const req = { params: { commentId: "1" }, user: { id: "user1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment deleted" });
  });

  // Test: Return error if comment not found while deleting
  test("Should return error if comment not found while deleting", async () => {
    Comment.findById.mockResolvedValue(null);

    const req = { params: { commentId: "1" }, user: { id: "user1" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  // Test: Return error if user is not the author while deleting comment
  test("Should return error if user is not the author while deleting comment", async () => {
    Comment.findById.mockResolvedValue({ _id: "1", user: "user1" });

    const req = { params: { commentId: "1" }, user: { id: "user2" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await commentController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });
});
