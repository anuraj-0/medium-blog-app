"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export default function BlogDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");
  const dropdownRefs = useRef({});

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`)
        .then((res) => res.json())
        .then((data) => setPost(data));
      fetchComments();
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [id]);

  const fetchComments = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`
    );
    const data = await res.json();
    setComments(data);
  };

  const handleAddComment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to comment.");
    if (!newComment.trim()) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      }
    );

    if (response.ok) {
      setNewComment("");
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.ok) fetchComments();
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditedText(comment.text);
  };

  const handleSaveEditedComment = async (commentId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments/${commentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editedText }),
      }
    );
    if (response.ok) {
      setEditingComment(null);
      fetchComments();
    }
  };

  const toggleDropdown = (commentId) => {
    Object.keys(dropdownRefs.current).forEach((key) => {
      if (key !== commentId && dropdownRefs.current[key]) {
        dropdownRefs.current[key].style.display = "none";
      }
    });
    if (dropdownRefs.current[commentId]) {
      dropdownRefs.current[commentId].style.display =
        dropdownRefs.current[commentId].style.display === "block"
          ? "none"
          : "block";
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-5">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Blog Cover"
          className="w-full h-64 object-cover rounded-lg"
        />
      )}
      <h1 className="text-3xl font-bold mt-4">{post.title}</h1>
      <p className="text-gray-600 mt-1">
        By <span className="font-semibold">{post.author.name}</span> •{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <p className="mt-4">{post.content}</p>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <div className="mt-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="border p-3 my-2 rounded-md bg-gray-100 relative"
              >
                {editingComment === comment._id ? (
                  <>
                    <textarea
                      className="w-full border p-2 rounded"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                    <button
                      className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                      onClick={() => handleSaveEditedComment(comment._id)}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p>{comment.text}</p>
                    <p className="text-sm text-gray-500">
                      By {comment.user?.name || "Unknown User"}
                    </p>
                    {user && user.id === comment.user?._id && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => toggleDropdown(comment._id)}
                          className="p-2"
                        >
                          ⋮
                        </button>
                        <div
                          ref={(el) => (dropdownRefs.current[comment._id] = el)}
                          className="absolute right-0 bg-white border rounded shadow-lg hidden z-50"
                        >
                          <button onClick={() => handleEditComment(comment)}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first!</p>
          )}
        </div>
        <textarea
          className="w-full border p-2 rounded mt-4"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button
          className="mt-2 bg-[#8C7E6C] text-white px-4 py-2 rounded hover:bg-[#BFBBB4]"
          onClick={handleAddComment}
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}
