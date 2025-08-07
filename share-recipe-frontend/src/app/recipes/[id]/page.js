"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/recipes/recipe/${id}/`
        );
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error("Failed to fetch recipe", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  return (
    <>
      <div className="p-4 flex min-h-screen justify-center ">
        {loading ? (
          <p className="p-6 h-screen">Loading...</p>
        ) : recipe ? (
          <div className=" mx-auto">
            <img
              src={recipe.image || "/home-image.jpg"}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded mb-6"
            />
            <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
            <p className="text-gray-600 mb-4">{recipe.description}</p>

            <div className="mb-4">
              <span className="font-medium">Type: </span>
              {recipe.type}
            </div>

            <div className="mb-4">
              <span className="font-medium">Regions: </span>
              {recipe.regions?.map((r) => r.name).join(", ") || "N/A"}
            </div>

            <div className="mb-4">
              <span className="font-medium">Ingredients: </span>
              {recipe.ingredients?.map((i) => i.name).join(", ") || "N/A"}
            </div>

            <div className="mb-6">
              <span className="font-medium">Instructions:</span>
              <p className="mt-2 whitespace-pre-line">{recipe.instructions}</p>
            </div>

            {recipe.steps.map((step, idx) => (
              <div key={step.id ?? idx} className="mb-4 border rounded p-3">
                <h3 className="font-medium">Step {step.step_no}</h3>
                <p>{step.instruction}</p>
                {step.timer && (
                  <p className="text-sm text-gray-500">Timer: {step.timer}</p>
                )}
                {step.image && (
                  <img
                    src={step.image}
                    alt={`Step ${step.step_no}`}
                    className="w-full h-40 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6">Recipe not found.</p>
        )}
      </div>
    </>
  );
}
