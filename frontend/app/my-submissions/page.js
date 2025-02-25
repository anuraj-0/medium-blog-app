"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleDelete } from "../create/page";

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.warning("Session expired, please log in again.");
          handleLogout();
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/my-submissions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 401) {
          toast.error("Session expired, logging out...");
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Error fetching your submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/auth/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Submissions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <ul>
          {submissions.map((submission) => (
            <li key={submission._id} className="mb-4 p-4 border rounded-md">
              <h2 className="text-lg font-bold">{submission.title}</h2>
              <p>{submission.content}</p>
              <div className="flex gap-4 mt-2">
                <Link
                  href={`/create?id=${submission._id}`}
                  className="text-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(submission._id, setSubmissions)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
