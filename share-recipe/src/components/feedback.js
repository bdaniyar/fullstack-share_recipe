"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export default function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      // Use your backend URL
      await axios.post(`${API_BASE_URL}/api/recipes/feedback/`, {
        email,
        message,
      });
      setStatus(" :) Thank you for your feedback!");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send feedback", error);
      setStatus(" '_' Failed to send. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-lg text-center md:text-left text-black">
        Share your thoughts about our recipes! We’d love to hear your ideas,
        feedback, or even your own secret tips to make this community tastier!
      </p>

      {/* Email Input */}
      <div className="flex items-center py-2 ">
        <div className="w-10 h-10 bg-yellow-500 rounded-md mr-2" />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="outline-none w-full bg-transparent placeholder-gray-400 text-[#1E1E1E]"
        />
      </div>

      {/* Feedback Input */}
      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 placeholder-gray-400 text-[#1E1E1E]"
        placeholder="Write your feedback here ..."
        required
      ></textarea>

      {/* Send Button */}
      <button
        type="submit"
        className="border border-yellow-500 text-yellow-500 px-6 py-2 rounded-md font-medium hover:bg-yellow-500 hover:text-white transition flex items-center gap-2"
      >
        Send
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      {/* Status Message */}
      {status && (
        <p className="text-center text-sm text-gray-500">{status}</p>
      )}
    </form>
  );
}
