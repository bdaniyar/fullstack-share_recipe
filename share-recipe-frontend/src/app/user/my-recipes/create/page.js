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

import { X } from "lucide-react"; // Importing the X icon for removing ingredients
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
      .get("http://localhost:8000/api/recipes/options/")
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
    const token = localStorage.getItem("access");
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("type", formData.type); // e.g., '1'
      form.append("region", formData.region); // e.g., '3'
      form.append("session", formData.session); // e.g., '3'
      form.append("category", formData.category); // e.g., '2'
      formData.ingredients.forEach((id) => form.append("ingredients", id)); // Array of IDs
      if (formData.image) form.append("image", formData.image);
      form.append("steps", JSON.stringify(steps)); // Already correct

      const response = await axios.post(
        "http://localhost:8000/api/recipes/create/",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
      <div>
        <Label className="block mb-2 text-yellow-500">Title</Label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="You Recipe name"
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

      <div>
        <Label className="block mb-2 text-yellow-500">Image</Label>
        <Input type="file" onChange={handleFileChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 w-48 rounded-md shadow"
          />
        )}
      </div>

      <div>
        <Label className="block mb-2 text-yellow-500">Type</Label>
        <div className="flex flex-wrap gap-2">
          {options.types?.map((type) => (
            <Button
              key={type.id}
              type="button"
              variant={formData.type === type.id ? "default" : "outline"}
              onClick={() =>
                setFormData((prev) => ({ ...prev, type: type.id }))
              }
              className={`px-4 py-2 rounded-full ${
                formData.type === type.id
                  ? "bg-yellow-500 text-black hover:bg-transparent hover:border hover:border-yellow-500"
                  : ""
              }`}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-yellow-500 mb-2 block">Region</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {formData.region || "Select Region"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search regions..." />
              <CommandEmpty>No region found.</CommandEmpty>
              <CommandList>
                {options.regions?.map((region) => (
                  <CommandItem
                    key={region.id} // Unique key using region.id
                    onSelect={() => {
                      setFormData((prev) => ({ ...prev, region: region.id }));
                    }}
                  >
                    {region.name}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="text-yellow-500 mb-2 block">Session</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {formData.session || "Select Session"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search sessions..." />
              <CommandEmpty>No session found.</CommandEmpty>
              <CommandList>
                {options.sessions?.map((session) => (
                  <CommandItem
                    key={session.id}
                    onSelect={() => {
                      setFormData((prev) => ({ ...prev, session: session.id }));
                    }}
                  >
                    {session.name}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="text-yellow-500 mb-2 block">Category</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {formData.category || "Select Category"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandList>
                {options.categories?.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      setFormData((prev) => ({
                        ...prev,
                        category: category.id,
                      }));
                    }}
                  >
                    {category.name}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="text-yellow-500 mb-2 block">Ingredients</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {formData.ingredients.length > 0
                ? "Add or remove ingredients"
                : "Select ingredients..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search ingredients..." />
              <CommandList>
                {options.ingredients?.map((ingredient) => (
                  <CommandItem
                    key={ingredient.id} // Unique key using ingredient.id
                    onSelect={() => handleIngredientToggle(ingredient.id)}
                    className={
                      formData.ingredients.includes(ingredient.id)
                        ? "bg-yellow-100"
                        : ""
                    }
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
            const ingredient = options.ingredients.find(
              (i) => i.id === ingredientId
            );
            return ingredient ? (
              <Badge
                key={ingredientId} // Unique key using ingredientId
                className="bg-yellow-100 text-yellow-800 flex items-center gap-1 px-2 py-1 rounded-full"
              >
                {ingredient.name}
                <X
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => handleIngredientToggle(ingredientId)}
                />
              </Badge>
            ) : null;
          })}
        </div>
      </div>

      <RecipeStepsForm steps={steps} setSteps={setSteps} />

      <div className="flex gap-4 mt-4">
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button type="submit" className="bg-yellow-500 text-black flex-1">
          {initialData.id ? "Update Recipe" : "Create Recipe"}
        </Button>
      </div>
    </form>
  );
}
