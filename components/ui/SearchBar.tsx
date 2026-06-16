'use client';

import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder = 'සොයන්න...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
        <HiOutlineMagnifyingGlass className="h-4 w-4" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input h-11 pl-10 pr-3 leading-none"
      />
    </div>
  );
}
