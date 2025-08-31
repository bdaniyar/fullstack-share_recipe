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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Show/hide password states
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // Email code flow state
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailToken, setEmailToken] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  const startResendTimer = (secs = 30) => {
    setResendSeconds(secs);
    const timer = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    // Reset verification state if email changes
    if (e.target.name === "email") {
      setEmailVerified(false);
      setCodeSent(false);
      setCode("");
      setEmailToken("");
    }
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

  const handleSendCode = async () => {
    setError("");
    setSuccessMsg("");
    setSendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/request-code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send code");
      }
      setCodeSent(true);
      setSuccessMsg("Verification code sent to your email.");
      startResendTimer(30);
    } catch (e) {
      setError(e.message);
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setSuccessMsg("");
    setVerifyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/verify-code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired code");
      }
      // Token for verified email (optional use later)
      if (data.token) setEmailToken(data.token);
      setEmailVerified(true);
      setSuccessMsg("Email verified successfully.");
    } catch (e) {
      setEmailVerified(false);
      setError(e.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!emailVerified) {
      setError("Please verify your email with the code before continuing.");
      setLoading(false);
      return;
    }

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
          // Optionally send the email verification token along
          ...(emailToken ? { "X-Email-Token": emailToken } : {}),
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
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    onClick={handleSendCode}
                    disabled={sendLoading || !formData.email || resendSeconds > 0}
                  >
                    {sendLoading
                      ? "Sending..."
                      : resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : codeSent
                          ? "Resend Code"
                          : "Send Code"}
                  </Button>
                  {codeSent && !emailVerified && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.trim())}
                        className="w-32"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        className="bg-yellow-500 text-[#1E1E1E] hover:text-white"
                        onClick={handleVerifyCode}
                        disabled={verifyLoading || code.length !== 6}
                      >
                        {verifyLoading ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  )}
                  {emailVerified && (
                    <span className="text-xs text-green-600">Email verified</span>
                  )}
                </div>
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
                <div className="relative">
                  <Input
                    name="password"
                    type={showPw1 ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your secure password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw1((v) => !v)}
                    className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-700"
                    aria-label={showPw1 ? "Hide password" : "Show password"}
                  >
                    {showPw1 ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Min 8 chars, include uppercase, digit, and special character.
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password2">Confirm Password</Label>
                </div>
                <div className="relative">
                  <Input
                    name="password2"
                    type={showPw2 ? "text" : "password"}
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Enter password again"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="absolute inset-y-0 right-2 text-sm text-gray-500 hover:text-gray-700"
                    aria-label={showPw2 ? "Hide password" : "Show password"}
                  >
                    {showPw2 ? "Hide" : "Show"}
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
              className="w-full bg-yellow-500 text-[#1E1E1E] mt-7 hover:text-white"
              disabled={loading || !emailVerified}
            >
              {loading ? "Processing..." : "Let's Cook"}
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
