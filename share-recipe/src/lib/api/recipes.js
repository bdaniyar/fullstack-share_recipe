import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

const BASE_URL = `${API_BASE_URL}/api/recipes/list/`;

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRecipes() {
  const authed = typeof window !== "undefined" && !!localStorage.getItem("access");
  const res = await axios.get(BASE_URL, { params: { include_self: authed ? true : false }, headers: { ...authHeaders() } });
  return res.data;
}

export async function searchRecipes(searchTerm) {
  const authed = typeof window !== "undefined" && !!localStorage.getItem("access");
  const res = await axios.get(BASE_URL, {
    params: { search: searchTerm, include_self: authed ? true : false },
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function filterRecipes(filters) {
  const params = {};

  if (filters) {
    if (filters.region && filters.region !== "undefined" && filters.region !== "") {
      params.region = filters.region;
    }
    if (filters.session && filters.session !== "undefined" && filters.session !== "") {
      params.session = filters.session;
    }
    if (filters.type && filters.type !== "undefined" && filters.type !== "") {
      params.type = filters.type;
    }
    if (filters.category && filters.category !== "undefined" && filters.category !== "") {
      params.category = filters.category;
    }
    if (Array.isArray(filters.ingredients) && filters.ingredients.length > 0) {
      params.ingredients = filters.ingredients.join(",");
    }
  }
  const authed = typeof window !== "undefined" && !!localStorage.getItem("access");
  params.include_self = authed ? true : false;

  const res = await axios.get(BASE_URL, { params, headers: { ...authHeaders() } });
  return res.data;
}

export async function getRecipe(id) {
  const res = await axios.get(`${API_BASE_URL}/api/recipes/recipe/${id}/`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function createRecipe(data) {
  const token = localStorage.getItem("access");
  const res = await axios.post(`${API_BASE_URL}/api/recipes/create/`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return res.data;
}

export async function updateRecipe(id, data) {
  const token = localStorage.getItem("access");
  const res = await axios.patch(`${API_BASE_URL}/api/recipes/recipe/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return res.data;
}

export async function deleteRecipe(id) {
  const token = localStorage.getItem("access");
  const res = await axios.delete(`${API_BASE_URL}/api/recipes/recipe/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function uploadRecipeImage(id, file) {
  const token = localStorage.getItem("access");
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${API_BASE_URL}/api/recipes/recipe/${id}/image/`, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function likeRecipe(id) {
  const token = localStorage.getItem("access");
  const res = await axios.post(`${API_BASE_URL}/api/recipes/recipe/${id}/like/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { likes }
}

export async function unlikeRecipe(id) {
  const token = localStorage.getItem("access");
  const res = await axios.delete(`${API_BASE_URL}/api/recipes/recipe/${id}/like/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { likes }
}

export async function saveRecipe(id) {
  const token = localStorage.getItem("access");
  const res = await axios.post(`${API_BASE_URL}/api/recipes/recipe/${id}/save/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { saved: true }
}

export async function unsaveRecipe(id) {
  const token = localStorage.getItem("access");
  const res = await axios.delete(`${API_BASE_URL}/api/recipes/recipe/${id}/save/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { saved: false }
}

export async function listSavedRecipes() {
  const token = localStorage.getItem("access");
  const res = await axios.get(`${API_BASE_URL}/api/recipes/saved/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getComments(recipeId) {
  const res = await axios.get(`${API_BASE_URL}/api/recipes/recipe/${recipeId}/comments/`);
  return res.data;
}

export async function addComment(recipeId, content, parentId = null) {
  const token = localStorage.getItem("access");
  const payload = { content };
  if (parentId) payload.parent_id = parentId;
  const res = await axios.post(
    `${API_BASE_URL}/api/recipes/recipe/${recipeId}/comments/`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return res.data;
}

// Ingredients directory helpers
export async function searchIngredients(q) {
  const res = await axios.get(`${API_BASE_URL}/api/recipes/ingredients/`, {
    params: { q },
    headers: { ...authHeaders() },
  });
  return res.data; // [{ id, name }]
}

export async function addIngredient(name) {
  const token = localStorage.getItem("access");
  const res = await axios.post(
    `${API_BASE_URL}/api/recipes/ingredients/`,
    { name },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return res.data; // { id, name, existing }
}

