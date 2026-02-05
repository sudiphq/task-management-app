"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search } from "lucide-react";

import { useTasks } from "@/context/tasks";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskFilters() {
  const { filters, setFilters } = useTasks();
  const isInitialMount = useRef(true);

  const [localSearch, setLocalSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newSearch = debouncedSearch || undefined;
    if (newSearch !== filters.search) {
      setFilters({ search: newSearch });
    }
  }, [debouncedSearch, setFilters, filters.search]);

  useEffect(() => {
    const urlSearch = filters.search ?? "";
    if (urlSearch !== localSearch && urlSearch !== debouncedSearch) {
      // eslint-disable-next-line
      setLocalSearch(urlSearch);
    }
  }, [filters.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = useCallback(
    (value: string) => {
      const status =
        value === "all" ? undefined : (value as "pending" | "done");
      setFilters({ status });
    },
    [setFilters]
  );

  const handleLimitChange = useCallback(
    (value: string) => {
      setFilters({ limit: Number(value) });
    },
    [setFilters]
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={localSearch}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Select
          value={filters.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-28">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(filters.limit)} onValueChange={handleLimitChange}>
          <SelectTrigger className="w-full sm:w-20">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
