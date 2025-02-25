import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../page";

// Mock the fetch call
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        blogs: [
          {
            _id: "1",
            title: "Sample Blog Title",
            content: "Sample content summary for testing purposes.",
            imageUrl: "https://example.com/sample.jpg",
          },
          {
            _id: "2",
            title: "Second Blog Post",
            content: "Another blog post content summary for testing.",
          },
        ],
        totalPages: 2,
      }),
  })
);

describe("Home Page Tests", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders a list of blog posts", async () => {
    render(<Home />);

    const posts = await screen.findAllByRole("heading", { level: 2 });
    expect(posts.length).toBeGreaterThan(0);
  });

  test("displays blog post elements (title, content)", async () => {
    render(<Home />);

    const title = await screen.findByText(/Sample Blog Title/i);
    const content = await screen.findByText(/Sample content summary/i);

    expect(title).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  test("displays pagination buttons conditionally", async () => {
    render(<Home />);

    // On initial render, "Previous Page" shouldn't appear
    expect(screen.queryByText(/Previous Page/i)).not.toBeInTheDocument();

    // "Next Page" should be visible
    const nextButton = await screen.findByText(/Next Page/i);
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);

    // After clicking, both Previous and Next buttons should appear
    await waitFor(() => {
      expect(screen.getByText(/Previous Page/i)).toBeInTheDocument();
    });

    // Since we have 2 pages, after going to the last page, "Next Page" should disappear
    expect(screen.queryByText(/Next Page/i)).not.toBeInTheDocument();
  });

  test("displays message when no posts are available", async () => {
    // Mock an empty response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            blogs: [],
            totalPages: 1,
          }),
      })
    );

    render(<Home />);
    const noPostsMessage = await screen.findByText(/No posts available/i);
    expect(noPostsMessage).toBeInTheDocument();
  });
});
