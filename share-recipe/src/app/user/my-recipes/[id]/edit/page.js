"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { getRecipe, updateRecipe, uploadRecipeImage, searchIngredients as apiSearchIngredients, addIngredient as apiAddIngredient } from "@/lib/api/recipes";

export default function EditRecipePage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        instructions: "",
        ingredients: [], // numeric IDs
        image: null,
    });

    const [preview, setPreview] = useState(null);

    // Ingredient search state
    const [ingQuery, setIngQuery] = useState("");
    const [ingResults, setIngResults] = useState([]);
    const [ingLoading, setIngLoading] = useState(false);
    const [ingOpen, setIngOpen] = useState(false);
    const [ingredientNames, setIngredientNames] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const r = await getRecipe(id);
                setFormData({
                    title: r.title || "",
                    description: r.description || "",
                    instructions: r.instructions || "",
                    ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(i => i.id) : [],
                    image: null,
                });
                setIngredientNames(() => {
                    const m = {};
                    (r.ingredients || []).forEach(i => { if (i?.id && i?.name) m[i.id] = i.name; });
                    return m;
                });
                if (r.image_url) {
                    const url = r.image_url.startsWith("http") ? r.image_url : `${API_BASE_URL}${r.image_url}`;
                    setPreview(url);
                }
            } catch (e) {
                console.error("Failed to load recipe", e);
                alert("Failed to load recipe");
                router.push(`/recipes/${id}`);
                return;
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, router]);

    // Debounced ingredient search
    useEffect(() => {
        const q = (ingQuery || "").trim();
        if (q.length === 0) {
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

    const canAddIngredient = useMemo(() => {
        const raw = (ingQuery || "").trim();
        if (raw.length < 3) return false;
        const LETTERS_RE = /^[A-Za-zА-Яа-яЁё\s-]{3,}$/;
        if (!LETTERS_RE.test(raw)) return false;
        const norm = raw.toLowerCase().replace(/\s+/g, " ").trim();
        const hasExact = (ingResults || []).some((i) =>
            String(i?.name || "").toLowerCase().replace(/\s+/g, " ").trim() === norm
        );
        return !hasExact;
    }, [ingQuery, ingResults]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, image: file }));
        if (file) setPreview(URL.createObjectURL(file));
    };

    const toggleIngredient = (ingredientId, ingredientName) => {
        const idNum = Number(ingredientId);
        if (ingredientName) {
            setIngredientNames((prev) => ({ ...prev, [idNum]: ingredientName }));
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

    const tryAddNewIngredient = async () => {
        const raw = (ingQuery || "").trim();
        if (raw.length < 3) return;
        const LETTERS_RE = /^[A-Za-zА-Яа-яЁё\s-]{3,}$/;
        if (!LETTERS_RE.test(raw)) return;
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
            if (!token) {
                alert("Sign in to add ingredients");
                return;
            }
            setIngLoading(true);
            const data = await apiAddIngredient(raw);
            if (data?.id && data?.name) {
                setIngredientNames((prev) => ({ ...prev, [data.id]: data.name }));
                setFormData((prev) => (
                    prev.ingredients.includes(data.id)
                        ? prev
                        : { ...prev, ingredients: [...prev.ingredients, data.id] }
                ));
                setIngQuery("");
                setIngResults([]);
            }
        } catch (e) {
            console.error("Failed to add ingredient", e);
            const msg = e?.response?.data?.detail || "Failed to add ingredient";
            alert(msg);
        } finally {
            setIngLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                instructions: formData.instructions,
                ingredients: formData.ingredients,
            };
            await updateRecipe(id, payload);
            if (formData.image) {
                try {
                    await uploadRecipeImage(id, formData.image);
                } catch (imgErr) {
                    console.error("Image upload failed", imgErr);
                }
            }
            router.push(`/recipes/${id}`);
        } catch (err) {
            console.error("Failed to update recipe", err);
            alert(err?.response?.data?.detail || "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 text-lg">Loading...</div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Edit recipe</CardTitle>
                        <CardDescription>Update title, description, instructions, image, and ingredients.</CardDescription>
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

                        <div>
                            <Label className="block mb-2 text-yellow-500">Instructions</Label>
                            <Textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                placeholder="Steps and tips..."
                                rows={10}
                            />
                        </div>

                        <div>
                            <Label className="block mb-2 text-yellow-500">Image</Label>
                            <Input type="file" onChange={handleFileChange} />
                            {preview && (
                                <img src={preview} alt="Preview" className="mt-2 w-48 rounded-md shadow" />
                            )}
                        </div>

                        <div>
                            <Label className="text-yellow-500 mb-2 block">Ingredients</Label>
                            <div className="flex flex-col gap-2">
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
                                    <Button
                                        type="button"
                                        onClick={tryAddNewIngredient}
                                        disabled={!canAddIngredient || ingLoading}
                                        className="bg-yellow-500 text-black hover:bg-yellow-600"
                                        title={canAddIngredient ? "Add ingredient" : "Enter 3+ letters (letters, spaces and hyphens only)"}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {(ingQuery.trim().length < 3)
                                        ? "Enter at least 3 letters to add or search"
                                        : (canAddIngredient ? "You can add it as a new ingredient" : "If the ingredient is found below — pick it from the list")}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.ingredients.map((ingredientId) => (
                                        <Badge key={ingredientId} className="bg-yellow-100 text-yellow-800 flex items-center gap-1 px-2 py-1 rounded-full">
                                            {ingredientNames[ingredientId] || `#${ingredientId}`}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); toggleIngredient(ingredientId); }}
                                                aria-label="Remove ingredient"
                                                className="ml-1 rounded hover:bg-yellow-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button type="button" variant="outline" onClick={() => router.push(`/recipes/${id}`)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="bg-yellow-500 text-black flex-1 hover:bg-yellow-600">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
