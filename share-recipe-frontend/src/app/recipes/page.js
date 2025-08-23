import React, { Suspense } from "react";
import Header from "@/components/recipes/header";
import RecipesList from "@/components/recipes/RecipesList";

export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen px-4 py-8">
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading recipes...</p>
      </div>
    </div>
  );
}

export default function RecipePage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <RecipesList />
      </Suspense>
    </div>
  );
}
