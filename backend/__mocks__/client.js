module.exports = {
  get: jest.fn().mockResolvedValue(null),
  setEx: jest.fn().mockResolvedValue("OK"),
  flushAll: jest.fn().mockResolvedValue("OK"),
};
