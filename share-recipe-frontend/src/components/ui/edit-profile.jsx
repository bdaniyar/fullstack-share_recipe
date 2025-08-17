"use client";

import React, { useState, useEffect } from "react";
import { fetchProfile, updateProfile } from "@/lib/api/profile";

export default function EditProfile() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        // Load current profile on mount
        fetchProfile()
            .then(profile => {
                setFormData({
                    first_name: profile.first_name || "",
                    last_name: profile.last_name || "",
                    username: profile.username || "",
                });
            })
            .catch(() => setError("Failed to load profile"));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const result = await updateProfile(formData);
            console.log("Profile update result:", result);
            setSuccess("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error instanceof Error) {
                setError(error.message);
            } else if (typeof error === "string") {
                setError(error);
            } else {
                setError("Error updating profile");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
}
