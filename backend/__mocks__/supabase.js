module.exports = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({
      data: { url: "https://mocked.image.url/image.jpg" },
      error: null,
    }),
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
};
