"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { fetchProfile, updateProfile } from "@/lib/api/profile";
import { useRouter } from "next/navigation";
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
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
      });
    }
  }, [user]);

  useEffect(() => {
    // Ставим is_active=true при заходе на страницу
    if (user && user.is_active !== true) {
      updateProfile({ is_active: true }).catch(() => { });
    }
    // Ставим is_active=false при закрытии вкладки
    const handleUnload = () => {
      updateProfile({ is_active: false });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      // На всякий случай при размонтировании
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
    formData.append("file", selectedPhoto); // исправлено: было "photo"
    try {
      await fetch("http://localhost:8000/api/user/profile/photo/", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        body: formData,
      });
      const updated = await fetchProfile();
      dispatch(setUser(updated));
      setShowPhotoModal(false);
      setSelectedPhoto(null);
    } catch (err) {
      alert("Ошибка при загрузке фото");
    }
  };

  const handlePhotoDelete = async () => {
    try {
      await fetch("http://localhost:8000/api/user/profile/photo/", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      const updated = await fetchProfile();
      dispatch(setUser(updated));
      setShowPhotoModal(false);
      setSelectedPhoto(null);
    } catch (err) {
      alert("Ошибка при удалении фото");
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
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-full">
        {/* Header section */}
        <div className="flex flex-col items-center py-6 px-6 border-b">
          <div className="relative h-24 w-24 rounded-full bg-yellow-500 flex items-center justify-center text-3xl font-bold text-white cursor-pointer group" onClick={() => setShowPhotoModal(true)}>
            {user.photo_url ? (
              <img
                src={user.photo_url + "?t=" + Date.now()} // добавлен query-параметр для обхода кэша
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              user.username ? user.username[0].toUpperCase() : "U"
            )}
            {/* Кружок статуса */}
            <span
              className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-2 border-white ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
              title={user.is_active ? "Online" : "Offline"}
            />
            {/* Иконка загрузки/удаления фото */}
            <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
          </div>
          {/* Модалка для загрузки/удаления фото */}
          {showPhotoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
                <h3 className="text-lg font-bold mb-2">Изменить фото профиля</h3>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
                {user.photo_url && (
                  <button className="text-red-600" onClick={handlePhotoDelete}>Удалить фото</button>
                )}
                <div className="flex gap-4 mt-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handlePhotoUpload}>Сохранить</button>
                  <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowPhotoModal(false)}>Отмена</button>
                </div>
              </div>
            </div>
          )}
          <h2 className="mt-4 text-2xl font-bold">{user.username}</h2>
          <p className="text-gray-500">{user.email}</p>
          <Badge className="mt-2 bg-yellow-500 text-black">{user.role}</Badge>
        </div>

        {/* Info section */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex gap-10 border-b pb-2">
            <span className="font-medium">Username</span>
            {editing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="border px-2 py-1 rounded"
              />
            ) : (
              <span>{user.username || "N/A"}</span>
            )}
          </div>
          <div className="flex gap-10 border-b pb-2">
            <span className="font-medium">First Name</span>
            {editing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="border px-2 py-1 rounded"
              />
            ) : (
              <span>{user.first_name || "N/A"}</span>
            )}
          </div>
          <div className="flex gap-10 border-b pb-2">
            <span className="font-medium">Last Name </span>
            {editing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="border px-2 py-1 rounded"
              />
            ) : (
              <span>{user.last_name || "N/A"}</span>
            )}
          </div>
          <div className="flex gap-10 border-b pb-2">
            <span className="font-medium">Joined</span>
            <span>
              {user.joined ? new Date(user.joined).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>

        {/* Bottom actions or summary (optional) */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Keep sharing your amazing recipes!
          </p>
          {editing ? (
            <div className="flex gap-4">
              <button
                className="text-green-600 hover:underline font-medium"
                onClick={async () => {
                  try {
                    await updateProfile(formData); // импорт уже есть
                    const updated = await fetchProfile();
                    dispatch(setUser(updated));
                    setEditing(false);
                  } catch (err) {
                    alert("Failed to update profile");
                  }
                }}
              >
                Save
              </button>
              <button
                className="text-gray-500 hover:underline font-medium"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="text-yellow-500 hover:underline font-medium"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
