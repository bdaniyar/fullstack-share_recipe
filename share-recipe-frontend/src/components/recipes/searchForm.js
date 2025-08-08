"use client";

import { React, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Search } from "lucide-react";


export default function SearchForm() {

  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("search");
    if (saved) {
      try {
        setSearch(JSON.parse(saved)); // parse to avoid double quotes
      } catch {
        setSearch(saved);
      }
    }
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = (search || "").trim();
    if (!term) return;
    localStorage.removeItem("filters"); // reset filters
    router.push(`/recipes?search=${encodeURIComponent(term)}`);
    // clear persisted search and input after navigation
    localStorage.removeItem("search");
    setSearch("");
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center sm:max-w-sm gap-2 px-2 ">
      <Input
        type="search"
        placeholder="Search"
        onChange={handleChange}
        name="search"
        value={search}
        required
        className="w-full rounded-full border border-yellow-500 focus:ring-yellow-500"
      />
      <Button
        type="submit"
        variant="outline"
        className="rounded-full border border-yellow-500"
      >
        <Search className="text-yellow-500 w-5 h-5" />
      </Button>
    </form>
  );
}
