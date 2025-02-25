const mockSave = jest
  .fn()
  .mockResolvedValue({ _id: "mockId", title: "Test Blog" });

module.exports = {
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([{ _id: "1", title: "Mock Blog 1" }]),
  }),
  findById: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({ _id: "1", title: "Mock Blog 1" }),
  }),
  prototype: {
    save: mockSave,
  },
};
