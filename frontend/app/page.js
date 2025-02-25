"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (page) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/posts?page=${page}&limit=${limit}`;

      const res = await fetch(url);

      const data = await res.json();

      setPosts(data.blogs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  return (
    <div className="max-w-3xl mx-auto p-5">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-3xl font-bold">Latest Posts</h3>
        <Link href="/create">
          <button className="bg-[#8C7E6C] text-[#F2EFE9] px-4 py-2 rounded-md hover:bg-[#BFBBB4]">
            Create New Post
          </button>
        </Link>
      </div>

      <div className="mt-5 space-y-5">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link href={`/posts/${post._id}`} key={post._id}>
              <div
                className="p-5 border rounded-md bg-[#F2EFE9] 
                hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <p>{post.content.slice(0, 100)}...</p>
                  <span className="text-[#A69F94]">Read More</span>
                </div>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500">No posts available.</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-5">
        {page > 1 ? (
          <button
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-md bg-[#F2EFE9] text-[#403529] hover:bg-[#BFBBB4]"
          >
            &lt; Previous Page
          </button>
        ) : (
          <div></div>
        )}

        <span className="px-4 font-semibold">
          Page {page} of {totalPages}
        </span>

        {page < totalPages ? (
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-md bg-[#F2EFE9] text-[#403529] hover:bg-[#BFBBB4]"
          >
            Next Page &gt;
          </button>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
