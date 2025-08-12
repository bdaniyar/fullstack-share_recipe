"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RecipeStepsForm from "@/components/user-recipes/recipeStepsForm";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

import { X } from "lucide-react"; // Importing the X icon for removing ingredients
import { createRecipe, uploadRecipeImage } from "@/lib/api/recipes";
import { API_BASE_URL } from "@/lib/config";
export default function MyRecipeCreate({ initialData = {} }) {
  const router = useRouter();
  const [options, setOptions] = useState({
    regions: [],
    sessions: [],
    types: [],
    ingredients: [],
    categories: [],
  });

  // Update formData to store IDs
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    type: initialData.type?.id || "", // Store ID
    region: initialData.region?.id || "", // Store ID
    session: initialData.session?.id || "", // Store ID
    category: initialData.category?.id || "", // Store ID
    ingredients: initialData.ingredients?.map((i) => i.id) || [], // Store IDs
    image: null,
  });

  const [steps, setSteps] = useState([]);

  const [loading, setLoading] = useState(true);

  const [preview, setPreview] = useState(initialData.image || null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/recipes/options/`)
      .then((res) => {
        setOptions({
          regions: res.data.regions.map((r) => ({ id: r.id, name: r.name })),
          sessions: res.data.sessions.map((s) => ({ id: s.id, name: s.name })),
          types: res.data.types.map((t) => ({ id: t.id, name: t.name })),
          ingredients: res.data.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
          })),
          categories: res.data.categories.map((c) => ({
            id: c.id,
            name: c.name,
          })),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load filter options", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleIngredientToggle = (ingredientId) => {
    setFormData((prev) => {
      const alreadyAdded = prev.ingredients.includes(ingredientId);
      return {
        ...prev,
        ingredients: alreadyAdded
          ? prev.ingredients.filter((id) => id !== ingredientId)
          : [...prev.ingredients, ingredientId],
      };
    });
  };

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      region: "",
      session: "",
      category: "",
      ingredients: [],
      image: null,
    });
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend currently expects: title, description, instructions (JSON)
      const instructions = (steps || [])
        .map((s) => {
          const instruction = (typeof s === "string" ? s : (s?.instruction || "")).trim();
          if (!instruction) return null; // skip empty steps
          const rawTimer = typeof s !== "string" ? s?.timer : "";
          const unitRaw = typeof s !== "string" ? (s?.timerUnit || "min") : "";
          let timerPart = "";
          const hasTimer = rawTimer !== undefined && rawTimer !== null && String(rawTimer).trim() !== "";
          if (hasTimer) {
            const val = Number(rawTimer);
            if (!Number.isNaN(val) && val > 0) {
              const unitLabel = unitRaw === "sec" ? "sec" : unitRaw === "hr" ? "hr" : "min";
              timerPart = ` (⏱ ${val} ${unitLabel})`;
            }
          }
          return `${instruction}${timerPart}`;
        })
        .filter(Boolean)
        // Number the steps after filtering empties
        .map((line, idx) => `${idx + 1}. ${line}`)
        .join("\n\n");

      const payload = {
        title: formData.title,
        description: formData.description,
        instructions,
      };

      const created = await createRecipe(payload);

      if (created?.id && formData.image) {
        try {
          await uploadRecipeImage(created.id, formData.image);
        } catch (imgErr) {
          console.error("Image upload failed", imgErr);
        }
      }

      router.push("/user/my-recipes");
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
        alert(JSON.stringify(err.response.data, null, 2));
      } else {
        console.error("Failed to save recipe", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Making...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Create a recipe</CardTitle>
            <CardDescription>Only title, description and steps are saved for now. Images and filters coming soon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="block mb-2 text-yellow-500">Title</Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Your recipe name"
                required
              />
            </div>

            <div>
              <Label className="block mb-2 text-yellow-500">Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="About recipe"
                required
              />
            </div>

            {/* Optional preview (uploaded after create) */}
            <div>
              <Label className="block mb-2 text-yellow-500">Image</Label>
              <Input type="file" onChange={handleFileChange} />
              {preview && (
                <img src={preview} alt="Preview" className="mt-2 w-48 rounded-md shadow" />
              )}
            </div>

            <RecipeStepsForm steps={steps} setSteps={setSteps} />

            {/* Advanced filters (not yet saved) */}
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-500">Advanced fields (coming soon)</summary>
              <div className="mt-4 space-y-4">
                {/* Type */}
                <div>
                  <Label className="block mb-2 text-yellow-500">Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {options.types?.map((type) => (
                      <Button
                        key={type.id}
                        type="button"
                        variant={formData.type === type.id ? "default" : "outline"}
                        onClick={() => setFormData((prev) => ({ ...prev, type: type.id }))}
                        className={`${formData.type === type.id ? "bg-yellow-500 text-black hover:bg-yellow-600" : ""}`}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div>
                  <Label className="text-yellow-500 mb-2 block">Region</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {options.regions.find((r) => r.id === formData.region)?.name || "Select Region"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0">
                      <Command>
                        <CommandInput placeholder="Search regions..." />
                        <CommandEmpty>No region found.</CommandEmpty>
                        <CommandList>
                          {options.regions?.map((region) => (
                            <CommandItem key={region.id} onSelect={() => setFormData((prev) => ({ ...prev, region: region.id }))}>
                              {region.name}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Session */}
                <div>
                  <Label className="text-yellow-500 mb-2 block">Session</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {options.sessions.find((s) => s.id === formData.session)?.name || "Select Session"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0">
                      <Command>
                        <CommandInput placeholder="Search sessions..." />
                        <CommandEmpty>No session found.</CommandEmpty>
                        <CommandList>
                          {options.sessions?.map((session) => (
                            <CommandItem key={session.id} onSelect={() => setFormData((prev) => ({ ...prev, session: session.id }))}>
                              {session.name}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-yellow-500 mb-2 block">Category</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {options.categories.find((c) => c.id === formData.category)?.name || "Select Category"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0">
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandList>
                          {options.categories?.map((category) => (
                            <CommandItem key={category.id} onSelect={() => setFormData((prev) => ({ ...prev, category: category.id }))}>
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Ingredients */}
                <div>
                  <Label className="text-yellow-500 mb-2 block">Ingredients</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {formData.ingredients.length > 0 ? "Add or remove ingredients" : "Select ingredients..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0">
                      <Command>
                        <CommandInput placeholder="Search ingredients..." />
                        <CommandList>
                          {options.ingredients?.map((ingredient) => (
                            <CommandItem
                              key={ingredient.id}
                              onSelect={() => handleIngredientToggle(ingredient.id)}
                              className={formData.ingredients.includes(ingredient.id) ? "bg-yellow-100" : ""}
                            >
                              {ingredient.name}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.ingredients.map((ingredientId) => {
                      const ingredient = options.ingredients.find((i) => i.id === ingredientId);
                      return (
                        <Badge key={ingredientId} className="bg-yellow-100 text-yellow-800 flex items-center gap-1 px-2 py-1 rounded-full">
                          {ingredient?.name}
                          <X className="w-4 h-4 cursor-pointer" onClick={() => handleIngredientToggle(ingredientId)} />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </details>

            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit" className="bg-yellow-500 text-black flex-1 hover:bg-yellow-600">
                {initialData.id ? "Update Recipe" : "Create Recipe"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
