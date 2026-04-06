"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface CinemasFilterBarProps {
  defaultSearch: string;
  defaultSort: string;
}

export const CinemasFilterBar = ({ defaultSearch, defaultSort }: CinemasFilterBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState(defaultSearch);
  const [sort, setSort] = useState(defaultSort);

  const hasFilters = search || sort !== "name";

  const pushParams = (overrides: { search?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const s = overrides.search ?? search;
    const so = overrides.sort ?? sort;
    if (s) params.set("search", s); else params.delete("search");
    if (so && so !== "name") params.set("sort", so); else params.delete("sort");
    router.push(`/cinemas?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: value }), 400);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value);
    pushParams({ sort: value });
  };

  const handleClear = () => {
    setSearch("");
    setSort("name");
    router.push("/cinemas");
  };

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
      <Input
        value={search}
        onChange={handleSearchChange}
        placeholder="Search Swiss cinemas by name, city, district, or address"
      />
      <Select value={sort} onChange={handleSortChange}>
        <option value="name">Sort: Name</option>
        <option value="showtimes">Sort: Activity</option>
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
