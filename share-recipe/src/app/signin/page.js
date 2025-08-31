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
import { Separator } from "@/components/ui/separator.jsx";

import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { fetchProfile } from "@/lib/api/profile";
import { API_BASE_URL } from "@/lib/config";
import GoogleIcon from "@/assets/google.svg";

export default function SignInPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPass1, setResetPass1] = useState("");
  const [resetPass2, setResetPass2] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: request code, 2: confirm
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");

  // Show/hide password states
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showResetPass1, setShowResetPass1] = useState(false);
  const [showResetPass2, setShowResetPass2] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/signin/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json(); // Always parse the response

      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        setSuccessMsg("Signin successful!");

        try {
          const profile = await fetchProfile();
          dispatch(setUser(profile));
          console.log("Fetched profile:", profile);
          if (!profile) {
            throw new Error("Profile not found.");
          }

          setError("");
          setTimeout(() => {
            router.push("/user/my-kitchen");
          }, 1000);
        } catch (profileErr) {
          setError(profileErr.message || "Failed to load profile.");
        }
      } else {
        setError(data.detail || "Signin failed. Please check your details.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = () => {
    // Redirect to backend OAuth login with optional next URL back to frontend
    const nextUrl = `${window.location.origin}/oauth/google`;
    window.location.href = `${API_BASE_URL}/api/user/oauth/google/login?next=${encodeURIComponent(
      nextUrl
    )}`;
  };

  const openReset = (e) => {
    e.preventDefault();
    setResetOpen((v) => !v);
    setResetMsg("");
    setResetErr("");
    setResetStep(1);
    setResetEmail(formData.email || "");
  };

  const requestReset = async () => {
    setResetErr("");
    setResetMsg("");
    if (!resetEmail) {
      setResetErr("Enter your email first");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/request-password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send code");
      }
      setResetMsg("Verification code sent. Check your email.");
      setResetStep(2);
    } catch (e) {
      setResetErr(e.message || "Failed to send code");
    }
  };

  const confirmReset = async () => {
    setResetErr("");
    setResetMsg("");
    if (!resetCode || !resetPass1 || !resetPass2) {
      setResetErr("Fill all fields");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, code: resetCode, new_password: resetPass1, password2: resetPass2 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to reset password");
      }
      setResetMsg("Password changed. You can now sign in.");
      setResetOpen(false);
      // Optionally prefill email back
      setFormData((f) => ({ ...f, email: resetEmail, password: "" }));
    } catch (e) {
      setResetErr(e.message || "Failed to reset password");
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
      <Card className="w-full max-w-sm self-center">
        <CardHeader>
          <CardTitle>Sign In to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  id="email"
                  value={formData.email}
                  type="email"
                  onChange={handleChange}
                  placeholder="your@example.com"
                  autoComplete="new-email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    onClick={openReset}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    name="password"
                    id="password"
                    value={formData.password}
                    type={showSigninPassword ? "text" : "password"}
                    onChange={handleChange}
                    placeholder="Your password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSigninPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-700"
                    aria-label={showSigninPassword ? "Hide password" : "Show password"}
                  >
                    {showSigninPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {successMsg && (
              <p className="text-green-500 text-sm mt-2">{successMsg}</p>
            )}
            <Button
              type="submit"
              className="w-full mt-7 bg-yellow-500 text-[#1E1E1E] hover:text-white"
            >
              Signin
            </Button>
          </form>
        </CardContent>
        {resetOpen && (
          <div className="px-6">
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Reset password</h3>
              {resetStep === 1 ? (
                <>
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input id="resetEmail" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="your@example.com" />
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={requestReset}>Send code</Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="resetCode">Code</Label>
                    <Input id="resetCode" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="6-digit code" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="resetPass1">New password</Label>
                    <div className="relative">
                      <Input id="resetPass1" type={showResetPass1 ? "text" : "password"} value={resetPass1} onChange={(e) => setResetPass1(e.target.value)} placeholder="New password" />
                      <button
                        type="button"
                        onClick={() => setShowResetPass1((v) => !v)}
                        className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-700"
                        aria-label={showResetPass1 ? "Hide password" : "Show password"}
                      >
                        {showResetPass1 ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="resetPass2">Confirm new password</Label>
                    <div className="relative">
                      <Input id="resetPass2" type={showResetPass2 ? "text" : "password"} value={resetPass2} onChange={(e) => setResetPass2(e.target.value)} placeholder="Confirm password" />
                      <button
                        type="button"
                        onClick={() => setShowResetPass2((v) => !v)}
                        className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-700"
                        aria-label={showResetPass2 ? "Hide password" : "Show password"}
                      >
                        {showResetPass2 ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setResetStep(1)}>Back</Button>
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-600" onClick={confirmReset}>Reset password</Button>
                  </div>
                </>
              )}
              {resetErr && <p className="text-red-500 text-sm">{resetErr}</p>}
              {resetMsg && <p className="text-green-600 text-sm">{resetMsg}</p>}
            </div>
          </div>
        )}
        <CardFooter className="flex-col gap-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignin}
          >
            <GoogleIcon className="w-5 h-5" />
            Signin with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
