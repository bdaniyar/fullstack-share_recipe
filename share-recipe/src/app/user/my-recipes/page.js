"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import RecipeCard from "@/components/user-recipes/recipeCard";
import { API_BASE_URL } from "@/lib/config";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    axios
      .get(`${API_BASE_URL}/api/recipes/my-recipes/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setRecipes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch my recipes", err);
        setError("Failed to load your recipes. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading your recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 text-lg mb-4">
            You have not created any recipes yet.
          </p>
          <Link href="/user/my-recipes/create">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
              Create New Recipe
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-600">My Recipes</h1>
          <Link href="/user/my-recipes/create">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
              + Add Recipe
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="hover:no-underline"
            >
              <RecipeCard recipe={recipe} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
