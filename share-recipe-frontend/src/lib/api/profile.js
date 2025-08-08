import { API_BASE_URL } from "@/lib/config";

export async function fetchProfile() {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // Try initial fetch
  let res = await fetch(`${API_BASE_URL}/api/user/profile/`, {
    headers: { Authorization: `Bearer ${access}` },
  });

  if (res.status === 401 && refresh) {
    // Refresh token
    const refreshRes = await fetch(
      `${API_BASE_URL}/api/user/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );
    const refreshData = await refreshRes.json();

    if (refreshRes.ok) {
      localStorage.setItem("access", refreshData.access);

      // Retry request
      res = await fetch(`${API_BASE_URL}/api/user/profile/`, {
        headers: { Authorization: `Bearer ${refreshData.access}` },
      });
    } else {
      throw new Error("Session expired, please login again.");
    }
  }

  if (!res.ok) {
    throw new Error("Unable to load profile. Please try again later.");
  }

  if (res.status === 204) {
    return null; // No content
  }
  const data = await res.json();
  return data;
}

export async function updateProfile(data) {
  let accessToken = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");

  let res = await fetch(`${API_BASE_URL}/api/user/profile/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (res.status === 401 && refreshToken) {
    // Попробуем обновить токен
    const refreshRes = await fetch(
      `${API_BASE_URL}/api/user/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );
    const refreshData = await refreshRes.json();

    if (refreshRes.ok) {
      localStorage.setItem("access", refreshData.access);

      // Повторим PATCH с новым access токеном
      res = await fetch(`${API_BASE_URL}/api/user/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshData.access}`,
        },
        body: JSON.stringify(data),
      });
    } else {
      throw new Error("Session expired, please login again.");
    }
  }

  if (!res.ok) {
    throw new Error("Profile update failed. Please try again later.");
  }

  return res.json();
}
