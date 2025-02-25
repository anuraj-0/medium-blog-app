"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          if (decodedUser.exp * 1000 < Date.now()) {
            console.log("Token expired. Logging out...");
            handleLogout();
          } else {
            setUser(decodedUser);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          handleLogout();
        }
      } else {
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }

    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer />

        <header className="sticky top-0 flex justify-between items-center p-4 bg-[#F2EFE9] shadow-sm z-50">
          <div className="flex items-center">
            <img
              src="/lotus.svg"
              alt="Logo"
              className="w-12 h-12 object-contain mr-3"
            />

            <Link
              href="/"
              className="text-2xl text-[#403529] font-bold leading-none mt-3"
            >
              From Shunya
            </Link>
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                <span>{user.name}</span>
                <span className="text-xs align-middle">&#x25BC;</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                  <Link
                    href="/my-submissions"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    View My Submissions
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link
                href="/auth/login"
                className="bg-[#F2EFE9] text-[#403529] px-4 py-2 font-semibold rounded-md hover:bg-[#BFBBB4]"
              >
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="bg-[#F2EFE9] text-[#403529] font-semibold px-4 py-2 rounded-md hover:bg-[#BFBBB4]"
              >
                Signup
              </Link>
            </div>
          )}
        </header>

        {children}
      </body>
    </html>
  );
}
