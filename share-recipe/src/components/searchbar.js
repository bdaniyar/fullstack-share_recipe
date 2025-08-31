"use client";

import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("search");
    if (saved) {
      try {
        setSearch(JSON.parse(saved));
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
    // navigate with term
    router.push(`/recipes?search=${encodeURIComponent(term)}`);
    // clear persisted search and input after navigation
    localStorage.removeItem("search");
    setSearch("");
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-6 px-4">
      <form onSubmit={handleSearch} className="relative flex">
        <input
          type="text"
          value={search}
          onChange={handleChange}
          placeholder="Search..."
          className="flex-1 rounded-full py-3 px-5 pl-12 border border-white/70 bg-transparent text-yellow-300 placeholder-white focus:border-2 focus:outline-none"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
        <button
          type="submit"
          className="ml-2 px-4 py-2 rounded-full border border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black transition"
        >
          Search
        </button>
      </form>
    </div>
  );
}
