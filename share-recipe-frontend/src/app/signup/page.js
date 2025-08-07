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

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    // Create a new object to avoid direct state mutation
    const signupData = {
      ...formData,
      username: formData.email.split("@")[0],
    };

    // Client-side password match check
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending data:", signupData);
      const res = await fetch("http://localhost:8000/api/user/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (res.ok) {
        setSuccessMsg("Signup successful! You can now login.");
        console.log("Signup successful:", signupData);
        // Optionally redirect to login page
        setTimeout(() => { 
          router.push("/signin");
        }, 2000); // Redirect after 2 seconds
      } else {
        const data = await res.json();
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map(err => err.msg).join(" | ");
          setError(messages);
        } else {
          setError(data.detail || "Signup failed. Please check your details.");
        }
        console.error("Signup error:", data);
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
            Enter your email below to login to your account
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
