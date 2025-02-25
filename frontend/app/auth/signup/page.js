"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");

    const requestBody = { name, email, password };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await res.json();

      if (res.ok) {
        router.push("/auth/login");
      } else {
        if (data.error === "User already exists") {
          setError("This email is already registered. Try logging in instead.");
        } else if (data.errors?.length) {
          setError(data.errors[0].msg);
        } else {
          setError("Signup failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Signup request failed", error);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form onSubmit={handleSignup} className="mt-5 space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2"
          required
          pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
          onInvalid={(e) =>
            e.target.setCustomValidity(
              "Please enter a valid email address (e.g., example@mail.com)"
            )
          }
          onInput={(e) => e.target.setCustomValidity("")}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 pr-10"
            minLength="6"
            required
            onInvalid={(e) =>
              e.target.setCustomValidity(
                "Password must be at least 6 characters long"
              )
            }
            onInput={(e) => e.target.setCustomValidity("")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-black"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
