'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync internal state when external value changes (e.g. cleared externally)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce onChange by 300ms
  useEffect(() => {
    if (localValue === value) return;

    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
      </div>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search campaigns by title, description, or tags..."
        aria-label="Search campaigns"
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 pl-10 pr-10 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      {localValue.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search query"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
