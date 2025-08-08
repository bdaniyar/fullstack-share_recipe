"use client";

import Link from "next/link";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";

import Logo from "@/assets/logo.svg"; // Adjust the path as necessary'
import { API_BASE_URL } from "@/lib/config";

const USERNAME_RE = /^[A-Za-z0-9._]{3,20}$/;
const STRONG_PW_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateClient = () => {
    if (!USERNAME_RE.test(formData.username)) {
      return "Username must be 3–20 chars, only letters, digits, dots and underscores.";
    }
    if (!STRONG_PW_RE.test(formData.password)) {
      return "Password must be at least 8 chars and include an uppercase letter, a digit, and a special character.";
    }
    if (formData.password !== formData.password2) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const validationMsg = validateClient();
    if (validationMsg) {
      setError(validationMsg);
      setLoading(false);
      return;
    }

    const signupData = { ...formData };

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (res.ok) {
        setSuccessMsg("Signup successful! You can now login.");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        const data = await res.json();
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map((err) => err.msg).join(" | ");
          setError(messages);
        } else {
          setError(data.detail || "Signup failed. Please check your details.");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 justify-center -mt-25 h-screen">
      <div className="flex items-center self-center justify-center w-auto h-auto">
        <Link href="/">
          <h1 className="text-4xl self-center font-light tracking-wider ">
            <span className="font-extralight text-[#1E1E1E]">share</span>
            <span className="font-medium text-yellow-500">recipe</span>
          </h1>
        </Link>
      </div>
      <h1 className="text-3xl font-semibold text-center text-[#1E1E1E]">
        Create Account
      </h1>
      <Card className="w-full max-w-sm self-center">
        <CardHeader>
          <CardTitle>Sign Up to your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  autoComplete="new-email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="your_username"
                  autoComplete="new-username"
                  required
                />
                <span className="text-xs text-gray-500">
                  Allowed: letters, digits, "." and "_", length 3–20.
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your secure password"
                  required
                  autoComplete="new-password"
                />
                <span className="text-xs text-gray-500">
                  Min 8 chars, include uppercase, digit, and special character.
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password2">Confirm Password</Label>
                </div>
                <Input
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="Enter password again"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {successMsg && (
              <p className="text-green-500 text-sm mt-2">{successMsg}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-yellow-500 text-[#1E1E1E] mt-7 hover:text-white"
            >
              Let's Cook
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-5">
          <div className="items-start grid gap-2">
            <span className="text-sm text-[#8F8F8F]">
              By creating an account, you agree to the Goodreads Terms of
              Service and Privacy Policy
            </span>
            <span className="text-sm text-[#8F8F8F]">
              Already have an account?
              <Link
                href="/signin"
                className="ml-2 text-sm text-yellow-500 hover:underline"
              >
                Sign In
              </Link>
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
