import axios from "axios";

const BASE_URL = "http://localhost:8000/api/recipes/list/";

export async function fetchRecipes() {
  const res = await axios.get(BASE_URL);
  return res.data;
}

export async function searchRecipes(searchTerm) {
  const res = await axios.get(BASE_URL, {
    params: { search: searchTerm },
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

  const res = await axios.get(BASE_URL, { params });
  return res.data;  
}

