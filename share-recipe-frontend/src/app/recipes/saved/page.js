"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/user-recipes/recipeCard";
import { listSavedRecipes } from "@/lib/api/recipes";

export default function SavedRecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await listSavedRecipes();
                setRecipes(data);
            } catch (e) {
                console.error(e);
                setError("Failed to load saved recipes");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    if (!recipes.length) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    <p className="text-gray-600 text-lg mb-4">No saved recipes yet.</p>
                    <Link href="/recipes">
                        <Button className="bg-yellow-500 text-black hover:bg-yellow-600">Browse Recipes</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-yellow-600">Saved Recipes</h1>
                    <Link href="/recipes">
                        <Button className="bg-yellow-500 text-black hover:bg-yellow-600">+ Explore</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {recipes.map((recipe) => (
                        <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="hover:no-underline">
                            <RecipeCard recipe={recipe} />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
