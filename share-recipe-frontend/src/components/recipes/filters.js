import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [options, setOptions] = useState({
    regions: [],
    sessions: [],
    types: [],
    categories: [],
  });

  // Load options for mapping IDs to names
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/recipes/options/`)
      .then((res) => {
        setOptions(res.data);
      })
      .catch((err) => {
        console.error("Failed to load filter options", err);
      });
  }, []);

  // Build filters object from URL params
  const filters = {};
  ["region", "session", "type", "category"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) filters[key] = value;
  });
  // New: parse ingredients (comma-separated IDs)
  const ingParam = searchParams.get("ingredients");
  const ingredients = ingParam
    ? ingParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const handleClearFilters = () => {
    router.push("/recipes");
  };

  if (Object.keys(filters).length === 0 && ingredients.length === 0) {
    return null;
  }

  // Helper to get name by id
  const getNameById = (list, id) => {
    const item = list.find((item) => String(item.id) === String(id));
    return item ? item.name : id;
  };

  return (
    <div className="flex gap-2 flex-wrap mt-4 text-sm items-center">
      {filters.region && (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          <strong className="text-yellow-700">Region:</strong>{" "}
          {getNameById(options.regions, filters.region)}
        </span>
      )}
      {filters.session && (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          <strong className="text-yellow-700">Session:</strong>{" "}
          {getNameById(options.sessions, filters.session)}
        </span>
      )}
      {filters.type && (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          <strong className="text-yellow-700">Type:</strong>{" "}
          {getNameById(options.types, filters.type)}
        </span>
      )}
      {filters.category && (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          <strong className="text-yellow-700">Category:</strong>{" "}
          {getNameById(options.categories, filters.category)}
        </span>
      )}
      {ingredients.length > 0 && (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          <strong className="text-yellow-700">Ingredients:</strong>{" "}
          {ingredients.join(", ")}
        </span>
      )}
      <button
        onClick={handleClearFilters}
        className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1 rounded-full hover:bg-yellow-600 transition"
      >
        <X size={16} /> Clear All
      </button>
    </div>
  );
}
