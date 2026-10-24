"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

/** Search box that waits for a short pause in typing before updating the URL / query. */
export function SearchInput({
  value,
  onSearch,
  placeholder = "Search…",
  label = "Search",
}: {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [text, setText] = useState(value);

  // follow external changes (e.g. "Clear filters")
  useEffect(() => setText(value), [value]);

  useEffect(() => {
    if (text.trim() === value) return;
    const timer = setTimeout(() => onSearch(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  return (
    <div className="relative w-full">
      <label htmlFor="list-search" className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <Search className="pointer-events-none absolute bottom-3 left-3 size-4 text-slate-400" aria-hidden />
      <input
        id="list-search"
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            onSearch("");
          }}
          className="absolute bottom-2.5 right-2.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
