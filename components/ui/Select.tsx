'use client';

import { ChangeEvent } from 'react';
import { Dropdown, DropdownOption } from './Dropdown';

type SelectProps = {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
  compact?: boolean;
};

function emitChange(onChange: SelectProps['onChange'], value: string) {
  if (!onChange) return;
  onChange({ target: { value } } as ChangeEvent<HTMLSelectElement>);
}

export function Select({
  label,
  options,
  value,
  onChange,
  disabled,
  className = '',
  id,
  placeholder,
  compact,
}: SelectProps) {
  const placeholderOption = options.find((opt) => opt.value === '');
  const resolvedPlaceholder = placeholder || placeholderOption?.label || 'තෝරන්න...';

  return (
    <Dropdown
      id={id}
      label={label}
      options={options}
      value={value}
      onChange={(next) => emitChange(onChange, next)}
      disabled={disabled}
      className={className}
      placeholder={resolvedPlaceholder}
      compact={compact}
    />
  );
}

export function LanguageSelect({
  value,
  onChange,
}: {
  value: 'si' | 'en';
  onChange: (lang: 'si' | 'en') => void;
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as 'si' | 'en')}
      options={[
        { value: 'si', label: 'සිංහල' },
        { value: 'en', label: 'English' },
      ]}
      className="w-auto min-w-[7.5rem]"
      compact
    />
  );
}
