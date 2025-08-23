import { API_BASE_URL } from "@/lib/config";

export async function fetchProfile() {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // Try initial fetch
  let res = await fetch(`${API_BASE_URL}/api/user/profile/`, {
    headers: { Authorization: `Bearer ${access}` },
  });

  if (res.status === 401 && refresh) {
    // Try to refresh the token
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

      // Retry request with new access token
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
    // Try to refresh the token
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

      // Retry PATCH with the new access token
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
    // Try to extract a meaningful backend error message
    let errorMessage = "Profile update failed. Please try again later.";
    try {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errData = await res.json();
        if (typeof errData?.detail === "string") {
          errorMessage = errData.detail;
        } else if (Array.isArray(errData?.detail) && errData.detail.length) {
          // FastAPI validation errors shape: [{ msg, loc, type, ... }]
          const msgs = errData.detail
            .map((e) => e?.msg || (typeof e === "string" ? e : ""))
            .filter(Boolean);
          if (msgs.length) errorMessage = msgs.join("; ");
        } else if (typeof errData?.message === "string") {
          errorMessage = errData.message;
        }
      } else {
        const text = await res.text();
        if (text) errorMessage = text;
      }
    } catch (_) {
      // ignore parse errors, keep default message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function fetchPublicProfile(username) {
  const access = localStorage.getItem("access");
  const headers = access ? { Authorization: `Bearer ${access}` } : {};
  const res = await fetch(
    `${API_BASE_URL}/api/user/public/${encodeURIComponent(username)}`,
    { headers }
  );
  if (res.status === 404) {
    throw new Error("User not found");
  }
  if (!res.ok) {
    throw new Error("Failed to load profile");
  }
  return res.json();
}
