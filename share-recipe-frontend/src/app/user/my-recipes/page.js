"use client";
import { useEffect, useState } from "react";
import { Button, Badge } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import RecipeCard from "@/components/user-recipes/recipeCard";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    axios
      .get("http://localhost:8000/api/recipes/my-recipes/", {
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-4">
          You have not created any recipes yet.
        </p>
        <Link href="/recipes/create">
          <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
            Create New Recipe
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Link href="/user/my-recipes/create">
          <Button className="bg-yellow-500 text-black hover:text-white">
            + Add Recipe
          </Button>
        </Link>
      </div>

      <div className="min-h-screen px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-yellow-500">My Recipes</h1>
        <div className="flex flex-col gap-4">
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
