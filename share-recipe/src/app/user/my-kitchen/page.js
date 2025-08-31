"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { fetchProfile, updateProfile } from "@/lib/api/profile";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ErrorPage from "@/components/error";

const NAME_RE = /^[A-Za-zА-Яа-яЁё\-\s]{2,20}$/;
const USERNAME_RE = /^[A-Za-z0-9._]{3,20}$/;

export default function KitchenDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Bio helpers moved above any early returns to keep Hooks order stable
  const BIO_LIMIT = 300;
  const [bioCollapsed, setBioCollapsed] = useState(true);
  const renderTextWithLinks = (text) => {
    if (!text) return null;
    // Fix duplicate link rendering: remove capturing group so offset arg is correct
    const urlRegex = /https?:\/\/[^\s]+/g;
    const parts = [];
    let lastIndex = 0;
    text.replace(urlRegex, (match, offset) => {
      const preceding = text.slice(lastIndex, offset);
      if (preceding) {
        // handle newlines
        const lines = preceding.split("\n");
        lines.forEach((line, i) => {
          parts.push(<span key={`${offset}-t-${lastIndex}-${i}`}>{line}</span>);
          if (i < lines.length - 1) parts.push(<br key={`${offset}-br-${lastIndex}-${i}`} />);
        });
      }
      parts.push(
        <a key={`${offset}-a`} href={match} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
          {match}
        </a>
      );
      lastIndex = offset + match.length;
      return match;
    });
    const tail = text.slice(lastIndex);
    if (tail) {
      const lines = tail.split("\n");
      lines.forEach((line, i) => {
        parts.push(<span key={`tail-${lastIndex}-${i}`}>{line}</span>);
        if (i < lines.length - 1) parts.push(<br key={`tail-br-${lastIndex}-${i}`} />);
      });
    }
    return parts;
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
    if (!accessToken || !refreshToken) {
      router.push("/signin");
    } else {
      // Use an async function inside useEffect
      const getProfile = async () => {
        try {
          const profile = await fetchProfile();
          dispatch(setUser(profile));
        } catch (err) {
          setError(err);
        } finally {
          setCheckingAuth(false);
        }
      };
      getProfile();
    }
  }, [router, dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  useEffect(() => {
    // Set is_active=true when entering the page
    if (user && user.is_active !== true) {
      updateProfile({ is_active: true }).catch(() => { });
    }
    // Set is_active=false when the tab is closed
    const handleUnload = () => {
      updateProfile({ is_active: false });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      // Also set on unmount just in case
      updateProfile({ is_active: false });
    };
  }, [user]);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    const formData = new FormData();
    formData.append("file", selectedPhoto); // fixed: was "photo"
    try {
      await fetch(`${API_BASE_URL}/api/user/profile/photo/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        body: formData,
      });
      const updated = await fetchProfile();
      dispatch(setUser(updated));
      setShowPhotoModal(false);
      setSelectedPhoto(null);
    } catch (err) {
      alert("Error uploading photo");
    }
  };

  const handlePhotoDelete = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/user/profile/photo/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      const updated = await fetchProfile();
      dispatch(setUser(updated));
      setShowPhotoModal(false);
      setSelectedPhoto(null);
    } catch (err) {
      alert("Error deleting photo");
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Checking authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage error={error} next={{ name: "Sign In", link: "/signin" }} />
    );
  }

  console.log("User data in KitchenDashboard:", user);
  console.log("Photo URL:", user?.photo_url);
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Card */}
        <Card className="overflow-hidden border rounded-2xl shadow-sm">
          <div className="relative">
            <div className="h-24 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500" />
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
              <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-full ring-2 ring-yellow-500 ring-offset-2 shadow bg-gray-200 flex items-center justify-center text-3xl font-bold text-white">
                {user.photo_url ? (
                  <img
                    src={`${API_BASE_URL}${user.photo_url}?t=${Date.now()}`}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-yellow-900">
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </span>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                  title={user.is_active ? "Online" : "Offline"}
                />
                {editing && (
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 rounded-full cursor-pointer transition hover:bg-black/45">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-white mt-1">Change</span>
                  </label>
                )}
              </div>

              <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">{user.username}</h2>
              <p className="text-gray-500">{user.email}</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800 border border-yellow-300">{user.role}</Badge>

              {/* BIO area under avatar */}
              <div className="mt-4 w-full max-w-2xl">
                {editing ? (
                  <div className="w-full">
                    <label className="block text-sm text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={formData.bio || ""}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, BIO_LIMIT);
                        setFormData({ ...formData, bio: val });
                      }}
                      maxLength={BIO_LIMIT}
                      rows={4}
                      placeholder="Tell us a bit about yourself: interests, experience, hobbies"
                      className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>You can use emojis. Links are recognized.</span>
                      <span>{(formData.bio?.length || 0)} / {BIO_LIMIT}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed break-words">
                    {user.bio ? (
                      <div>
                        <div className={`${bioCollapsed ? "line-clamp-3" : ""}`}>
                          {renderTextWithLinks(user.bio)}
                        </div>
                        {user.bio.length > 120 && (
                          <button
                            className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm"
                            onClick={() => setBioCollapsed((v) => !v)}
                          >
                            {bioCollapsed ? "Read more" : "Collapse"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">User has not written a bio yet</span>
                    )}
                  </div>
                )}
              </div>

              {editing && (
                <div className="flex flex-col items-center gap-3 mt-3">
                  {selectedPhoto && (
                    <div className="text-xs text-gray-600">Selected: {selectedPhoto.name}</div>
                  )}
                  <div className="flex gap-3">
                    {selectedPhoto && (
                      <button
                        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-md shadow-sm transition"
                        onClick={handlePhotoUpload}
                      >
                        Save Photo
                      </button>
                    )}
                    {user.photo_url && (
                      <button
                        className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete your profile photo? This action cannot be undone.")) {
                            handlePhotoDelete();
                          }
                        }}
                      >
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Profile details</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 border-b pb-4">
                <span className="text-sm text-gray-500">Username</span>
                {editing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="md:col-span-2 w-full md:w-80 border rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                ) : (
                  <span className="md:col-span-2 font-medium">{user.username || "N/A"}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 border-b pb-4">
                <span className="text-sm text-gray-500">First name</span>
                {editing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="md:col-span-2 w-full md:w-80 border rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                ) : (
                  <span className="md:col-span-2 font-medium">{user.first_name || "N/A"}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 border-b pb-4">
                <span className="text-sm text-gray-500">Last name</span>
                {editing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="md:col-span-2 w-full md:w-80 border rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                ) : (
                  <span className="md:col-span-2 font-medium">{user.last_name || "N/A"}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3">
                <span className="text-sm text-gray-500">Joined</span>
                <span className="md:col-span-2 font-medium">
                  {user.joined ? new Date(user.joined).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>

          {/* Bottom actions */}
          <div className="px-6 py-4 border-t flex justify-between items-center bg-white/50 rounded-b-2xl">
            <p className="text-sm text-gray-500">Keep sharing your amazing recipes!</p>
            {editing ? (
              <div className="flex gap-3">
                <button
                  className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-md shadow-sm transition"
                  onClick={async () => {
                    try {
                      // Client-side validations
                      if (formData.first_name && (!NAME_RE.test(formData.first_name) || formData.first_name[0] !== formData.first_name[0].toUpperCase())) {
                        alert("First name must be 2–20 letters (spaces/hyphens allowed) and start with a capital letter.");
                        return;
                      }
                      if (formData.last_name && (!NAME_RE.test(formData.last_name) || formData.last_name[0] !== formData.last_name[0].toUpperCase())) {
                        alert("Last name must be 2–20 letters (spaces/hyphens allowed) and start with a capital letter.");
                        return;
                      }
                      if (formData.username && !USERNAME_RE.test(formData.username)) {
                        alert("Username must be 3–20 chars: letters, digits, dots, underscores.");
                        return;
                      }

                      await updateProfile(formData);
                      const updated = await fetchProfile();
                      dispatch(setUser(updated));
                      setEditing(false);
                    } catch (err) {
                      alert(err?.message || "Failed to update profile");
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-md shadow-sm transition"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-md shadow-sm transition"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
