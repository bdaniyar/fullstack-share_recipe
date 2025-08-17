"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

// UI imports for ingredients typeahead
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { searchIngredients as apiSearchIngredients } from "@/lib/api/recipes";

export default function FilterForm() {
  const route = useRouter();
  const [options, setOptions] = useState({
    regions: [],
    sessions: [],
    types: [],
    categories: [],
  });

  const [formData, setFormData] = useState({
    region: "",
    session: "",
    type: "",
    category: "",
    ingredients: [],
  });

  // Local state for ingredients search & selection
  const [ingQuery, setIngQuery] = useState("");
  const [ingResults, setIngResults] = useState([]);
  const [ingLoading, setIngLoading] = useState(false);
  const [ingOpen, setIngOpen] = useState(false);
  const [ingredientNames, setIngredientNames] = useState({});

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

  useEffect(() => {
    const q = (ingQuery || "").trim();
    if (q.length < 1) {
      setIngResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setIngLoading(true);
      try {
        const items = await apiSearchIngredients(q);
        setIngResults(Array.isArray(items) ? items : []);
      } catch (e) {
        console.error("Ingredient search failed", e);
      } finally {
        setIngLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [ingQuery]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleIngredient = (id, name) => {
    const idNum = Number(id);
    if (name) {
      setIngredientNames((prev) => ({ ...prev, [idNum]: name }));
    }
    setFormData((prev) => {
      const exists = prev.ingredients.includes(idNum);
      return {
        ...prev,
        ingredients: exists
          ? prev.ingredients.filter((x) => Number(x) !== idNum)
          : [...prev.ingredients, idNum],
      };
    });
  };

  const handleSetFilters = (e) => {
    e.preventDefault();

    const filteredParams = Object.fromEntries(
      Object.entries(formData)
        .filter(([key, v]) => key !== "ingredients" && v)
    );
    if (Array.isArray(formData.ingredients) && formData.ingredients.length > 0) {
      filteredParams.ingredients = formData.ingredients.join(",");
    }
    const queryParams = new URLSearchParams(filteredParams).toString();
    route.push(`/recipes?${queryParams}`);
  };

  const handleClearFilters = () => {
    setFormData({
      region: "",
      session: "",
      type: "",
      category: "",
      ingredients: [],
    });
    setIngQuery("");
    setIngResults([]);
    setIngredientNames({});
    route.push("/recipes");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full bg-yellow-500 text-[#1E1E1E] mx-2"
        >
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-yellow-500 text-2xl">
            Filter Recipes
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Use filters to find the perfect dish for your needs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSetFilters} className="space-y-4 mt-4">
          {/* Region */}
          <div>
            <Label className="text-yellow-500">Region</Label>
            <select
              className="mt-2 w-full border rounded-md p-2"
              name="region"
              value={formData.region}
              onChange={handleChange}
            >
              <option value="">Select Region</option>
              {options.regions?.map((r, index) => (
                <option key={index} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <Label className="text-yellow-500">Session</Label>
            <select
              className="mt-2 w-full border rounded-md p-2"
              name="session"
              value={formData.session}
              onChange={handleChange}
            >
              <option value="">Select Session</option>
              {options.sessions?.map((s, index) => (
                <option key={index} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <Label className="text-yellow-500">Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {options.types?.map((t, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`px-3 py-1 rounded-md border transition-all
        ${formData.type === t.id
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : "border-yellow-500 text-yellow-500 hover:bg-yellow-100"
                    }
      `}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-yellow-500">Category</Label>
            <select
              className="mt-2 w-full border rounded-md p-2"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {options.categories?.map((c, index) => (
                <option key={index} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ingredients filter */}
          <div>
            <Label className="text-yellow-500">Ingredients</Label>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Ingredient..."
                  value={ingQuery}
                  onChange={(e) => setIngQuery(e.target.value)}
                  className="flex-1"
                />
                <Popover open={ingOpen} onOpenChange={setIngOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline">Find</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search ingredients..."
                        value={ingQuery}
                        onValueChange={setIngQuery}
                      />
                      <CommandList>
                        {!ingLoading && (
                          <CommandEmpty>
                            {((ingQuery || "").trim().length < 3)
                              ? "Enter at least 3 letters to start searching"
                              : "Nothing found"}
                          </CommandEmpty>
                        )}
                        {ingLoading && (
                          <div className="py-2 text-center text-sm text-gray-500">Searching...</div>
                        )}
                        {!ingLoading && ingResults.map((ingredient) => (
                          <CommandItem
                            key={ingredient.id}
                            onSelect={() => {
                              toggleIngredient(ingredient.id, ingredient.name);
                              setIngOpen(false);
                            }}
                            className={formData.ingredients.includes(Number(ingredient.id)) ? "bg-yellow-100" : ""}
                          >
                            {ingredient.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((id) => (
                  <Badge key={id} className="bg-yellow-100 text-yellow-800 flex items-center gap-1 px-2 py-1 rounded-full">
                    {ingredientNames[id] || `#${id}`}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleIngredient(id); }}
                      aria-label="Remove ingredient"
                      className="ml-1 rounded hover:bg-yellow-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              className="text-yellow-500 border-yellow-500 hover:bg-yellow-500 hover:text-white"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
            <DialogClose asChild>
              <Button
                type="submit"
                className="bg-yellow-500 text-[#1E1E1E] hover:bg-yellow-600"
              >
                Apply Filters
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
