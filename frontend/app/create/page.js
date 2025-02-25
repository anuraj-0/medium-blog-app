"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [postId, setPostId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    setPostId(postId);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        router.replace("/auth/login");
        return;
      }

      if (postId) {
        fetchExistingPost(postId, token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      localStorage.removeItem("token");
      router.replace("/auth/login");
    }
  }, [router, postId]);

  const fetchExistingPost = async (id, token) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch post");
      const data = await res.json();
      setTitle(data.title);
      setContent(data.content);
      setExistingImage(data.image);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching post: " + error.message);
      router.push("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized - No token found!");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts${
          postId ? `/${postId}` : ""
        }`,
        {
          method: postId ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        router.push("/");
        toast.success(`Post ${postId ? "updated" : "published"} successfully!`);
      } else {
        const data = await res.json();
        toast.error("Error: " + data.message);
      }
    } catch (error) {
      toast.error("🚨 Something went wrong: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F2EFE9] text-[#403529]">
      <div className="bg-[#BFBBB4] p-6 rounded-lg shadow-lg w-full max-w-3xl h-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {postId ? "Edit Post" : "Create a Blog"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border bg-[#F2EFE9] text-[#403529] p-3 rounded-md"
            required
          />
          <textarea
            placeholder="Blog Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border bg-[#F2EFE9] text-[#403529] p-3 rounded-md h-80"
            required
          />
          {existingImage && !image && (
            <div className="flex flex-col items-center">
              <img
                src={existingImage}
                alt="Existing"
                className="w-32 h-32 object-cover"
              />
              <button
                type="button"
                className="text-red-500 mt-2"
                onClick={() => setExistingImage(null)}
              >
                Remove Image
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
                setExistingImage(URL.createObjectURL(file));
              }
            }}
            className="border bg-[#F2EFE9] text-[#403529] p-3 rounded-md"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#8C7E6C] text-white py-2 rounded"
          >
            {isSubmitting ? "Submitting..." : postId ? "Save" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Function to handle deleting posts
async function handleDelete(postId, setSubmissions) {
  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Session expired, please log in again.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to delete post");

    toast.success("Post deleted successfully!");
    setSubmissions((prev) => prev.filter((post) => post._id !== postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error("Error deleting post.");
  }
}

export { handleDelete };
