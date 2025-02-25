const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { signup, login } = require("../src/controllers/authController");
const User = require("../src/models/User");

jest.mock("../src/models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
    req = { body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // Signup Tests
  test("Should create a new user successfully", async () => {
    req.body = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    };

    // Mocking user existence check (should not exist)
    User.findOne.mockResolvedValue(null);

    // Mocking password hashing
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedpassword");

    // Mocking user save
    User.prototype.save = jest.fn().mockResolvedValue({
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
    });

    await signup(req, res);

    // Assertions: Verify correct function calls and response
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
    expect(User.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
    });
  });

  test("Should return error when user already exists", async () => {
    req.body = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    };

    // Mock user already existing
    User.findOne.mockResolvedValue({ email: "john@example.com" });

    await signup(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
  });

  test("Should return 500 on server error during signup", async () => {
    req.body = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    };

    // Mock database failure
    User.findOne.mockRejectedValue(new Error("Database failure"));

    await signup(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });

  // Login Tests
  test("Should login successfully and return token", async () => {
    req.body = { email: "john@example.com", password: "password123" };

    // Mock user existence
    User.findOne.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
    });

    // Mock password comparison (valid password)
    bcrypt.compare.mockResolvedValue(true);

    // Mock JWT token generation
    jwt.sign.mockReturnValue("mocked-token");

    await login(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedpassword"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "1", name: "John Doe" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "mocked-token" });
  });

  test("Should return error for invalid credentials", async () => {
    req.body = { email: "john@example.com", password: "wrongpassword" };

    // Mock user existence
    User.findOne.mockResolvedValue({
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
    });

    // Mock password comparison (invalid password)
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongpassword",
      "hashedpassword"
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("Should return 500 on server error during login", async () => {
    req.body = { email: "john@example.com", password: "password123" };

    // Mock database failure
    User.findOne.mockRejectedValue(new Error("Database failure"));

    await login(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});
