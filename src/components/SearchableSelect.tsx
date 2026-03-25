import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X, Search, Loader2 } from "lucide-react";

export interface SearchableOption {
  id: string;
  label: string;
  sublabel?: string;
  meta?: string;
  status?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  debounceMs?: number;
  maxResults?: number;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pesquisar...",
  disabled = false,
  className,
  loading = false,
  debounceMs = 300,
  maxResults = 10,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return options.slice(0, maxResults);
    const terms = debouncedSearch.toLowerCase().split(/\s+/);
    return options
      .filter((o) => {
        const haystack = `${o.label} ${o.sublabel ?? ""} ${o.meta ?? ""}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      })
      .slice(0, maxResults);
  }, [options, debouncedSearch, maxResults]);

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(val);
      }, debounceMs);
    },
    [debounceMs]
  );

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setSearch("");
      setDebouncedSearch("");
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setSearch("");
    setDebouncedSearch("");
    inputRef.current?.focus();
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIndex]) handleSelect(filtered[highlightIndex].id);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  useEffect(() => {
    setHighlightIndex(0);
  }, [debouncedSearch]);

  if (value && selectedOption && !disabled) {
    return (
      <div className={cn("flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", className)}>
        <span className="flex-1 truncate">{selectedOption.label}</span>
        {selectedOption.sublabel && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{selectedOption.sublabel}</span>
        )}
        <button
          type="button"
          onClick={handleClear}
          className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
          title="Limpar seleção"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  if (disabled && selectedOption) {
    return (
      <div className={cn("flex items-center h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed opacity-70", className)}>
        <span className="truncate">{selectedOption.label}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-8 pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-[240px] overflow-auto rounded-md border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              {loading ? "Buscando..." : "Nenhum resultado encontrado."}
            </div>
          ) : (
            filtered.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between gap-2",
                  idx === highlightIndex && "bg-accent"
                )}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => handleSelect(opt.id)}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-xs text-muted-foreground truncate">{opt.sublabel}</span>
                  )}
                </div>
                {opt.meta && (
                  <span className="text-xs text-muted-foreground shrink-0">{opt.meta}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
