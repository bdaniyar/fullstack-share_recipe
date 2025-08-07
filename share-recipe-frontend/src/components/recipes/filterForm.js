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
  });

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/recipes/filters/")
      .then((res) => {
        setOptions(res.data);
      })
      .catch((err) => {
        console.error("Failed to load filter options", err);
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSetFilters = (e) => {
    e.preventDefault();

    const filteredParams = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v)
    );
    const queryParams = new URLSearchParams(filteredParams).toString();
    route.push(`/recipes?${queryParams}`);
  };

  const handleClearFilters = () => {
    setFormData({
      region: "",
      session: "",
      type: "",
      category: "",
    });
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
        ${
          formData.type === t.id
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
