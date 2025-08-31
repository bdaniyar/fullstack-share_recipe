"use client";

import React from "react";

import FilterForm from "./filterForm";
import SearchForm from "./searchForm";
import Filters from "./filters";

export default function Header() {

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 itemmax-w-6xl">
      <div className="w-full  flex items-center justify-center gap-2">
        {/* Filter Dialog */}
        <FilterForm />
        {/* Search Input */}
        <SearchForm />
      </div>

      {/* Selected Filters Display */}
      <Filters />
    </div>
  );
}
