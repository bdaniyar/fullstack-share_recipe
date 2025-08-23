"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchRecipes, searchRecipes, filterRecipes } from "@/lib/api/recipes";
import { setRecipes } from "@/redux/slices/recipesSlice";
import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Heart, User } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function RecipesList() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const recipes = useSelector((state) => state.recipes.recipes);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const search = searchParams.get("search");

                // Build filters object from URL params
                const filters = {};
                ["region", "session", "type", "category"].forEach((key) => {
                    const value = searchParams.get(key);
                    if (value) filters[key] = value;
                });
                // New: support ingredient filtering via URL, e.g. ?ingredients=1,2,3
                const ingParam = searchParams.get("ingredients");
                if (ingParam) {
                    const arr = ingParam
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                    if (arr.length) filters.ingredients = arr;
                }

                let data;
                if (search) {
                    data = await searchRecipes(search);
                } else if (Object.keys(filters).length > 0) {
                    data = await filterRecipes(filters);
                } else {
                    data = await fetchRecipes();
                }

                dispatch(setRecipes(data));
            } catch (err) {
                setError("Failed to load recipes");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [searchParams, dispatch]);

    useEffect(() => {
        console.log("Updated recipes in Redux store:", recipes);
    }, [recipes]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-lg">
                    <p>{error}</p>
                    <p className="mt-2">Please try again later or contact support.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">Loading recipes...</p>
            </div>
        );
    }

    if (!recipes.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">No recipes found.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recipes.map((recipe) => {
                const imgSrc = recipe.image_url
                    ? (recipe.image_url.startsWith("http") ? recipe.image_url : `${API_BASE_URL}${recipe.image_url}`)
                    : "/home-image.jpg";
                return (
                    <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                        <Card
                            key={recipe.id}
                            className="transition-all hover:scale-[1.02] hover:shadow-xl"
                        >
                            <div className="h-48 overflow-hidden rounded-t-lg">
                                <img
                                    src={imgSrc}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    {recipe.title}
                                </CardTitle>
                                <CardDescription>{recipe.description}</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {recipe.author_username ? (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); router.push(`/user/${encodeURIComponent(recipe.author_username)}`); }}
                                                className="hover:underline text-yellow-600 bg-transparent p-0 m-0 border-0 cursor-pointer focus:outline-none focus:ring-0"
                                            >
                                                {recipe.author_username}
                                            </button>
                                        ) : (
                                            <span>Unknown</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>{recipe.likes}</span>
                                        <Heart className="w-4 h-4 text-red-500" />
                                    </div>
                                </div>
                                {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {recipe.ingredients.map((ing) => (
                                            <span key={ing.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                {ing.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
