'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type DropdownOption = { value: string; label: string };

type DropdownProps = {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  compact?: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function Dropdown({
  options,
  value = '',
  onChange,
  label,
  placeholder = 'තෝරන්න...',
  disabled = false,
  className = '',
  id,
  compact = false,
}: DropdownProps) {
  const autoId = useId();
  const dropdownId = id || label?.replace(/\s/g, '-').toLowerCase() || `dropdown-${autoId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const selectableOptions = options.filter((opt) => opt.value !== '');
  const selected = options.find((opt) => opt.value === value);
  const displayLabel = selected?.label || placeholder;

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  const selectValue = useCallback(
    (next: string) => {
      onChange?.(next);
      close();
    },
    [onChange, close]
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const idx = selectableOptions.findIndex((opt) => opt.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  }, [open, selectableOptions, value]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((prev) => (prev + 1) % selectableOptions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((prev) => (prev <= 0 ? selectableOptions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = selectableOptions[highlight];
      if (option) selectValue(option.value);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && (
        <label id={`${dropdownId}-label`} className="form-label label-si">
          {label}
        </label>
      )}

      <button
        type="button"
        id={dropdownId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${dropdownId}-label` : undefined}
        className={`dropdown-trigger label-si ${compact ? 'dropdown-trigger-compact' : ''} ${open ? 'dropdown-trigger-open' : ''}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={onKeyDown}
      >
        <span className={`truncate ${!selected ? 'text-slate-500' : 'text-black'}`}>{displayLabel}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={label ? `${dropdownId}-label` : dropdownId}
          className="dropdown-menu custom-scrollbar"
        >
          {selectableOptions.length === 0 ? (
            <li className="dropdown-option-empty label-si">විකල්ප නැත</li>
          ) : (
            selectableOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = index === highlight;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`dropdown-option label-si ${isSelected ? 'dropdown-option-selected' : ''} ${isHighlighted ? 'dropdown-option-active' : ''}`}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => selectValue(opt.value)}
                >
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
