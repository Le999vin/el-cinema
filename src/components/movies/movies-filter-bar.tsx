"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface MoviesFilterBarProps {
  defaultSearch: string;
  defaultGenre: string;
  defaultSort: string;
  genres: string[];
}

export const MoviesFilterBar = ({ defaultSearch, defaultGenre, defaultSort, genres }: MoviesFilterBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState(defaultSearch);
  const [genre, setGenre] = useState(defaultGenre);
  const [sort, setSort] = useState(defaultSort);

  const hasFilters = search || genre || sort !== "release-date";

  const pushParams = (overrides: { search?: string; genre?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const s = overrides.search ?? search;
    const g = overrides.genre ?? genre;
    const so = overrides.sort ?? sort;
    if (s) params.set("search", s); else params.delete("search");
    if (g) params.set("genre", g); else params.delete("genre");
    if (so && so !== "release-date") params.set("sort", so); else params.delete("sort");
    router.push(`/movies?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: value }), 400);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGenre(value);
    pushParams({ genre: value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value);
    pushParams({ sort: value });
  };

  const handleClear = () => {
    setSearch("");
    setGenre("");
    setSort("release-date");
    router.push("/movies");
  };

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_200px_180px_auto]">
      <Input
        value={search}
        onChange={handleSearchChange}
        placeholder="Search title, overview, or mood"
      />
      <Select value={genre} onChange={handleGenreChange}>
        <option value="">All genres</option>
        {genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </Select>
      <Select value={sort} onChange={handleSortChange}>
        <option value="release-date">Sort: Newest</option>
        <option value="title">Sort: Title</option>
        <option value="runtime">Sort: Runtime</option>
      </Select>
      {hasFilters && (
        <Button variant="ghost" onClick={handleClear} className="gap-2 whitespace-nowrap">
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  );
};
