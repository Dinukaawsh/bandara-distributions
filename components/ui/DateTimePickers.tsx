'use client';

import { ChangeEvent, useMemo } from 'react';
import { Dropdown } from './Dropdown';

const MONTHS_SI = [
  'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
  'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්',
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildMonthOptions(lang: 'si' | 'en' = 'si', yearsBack = 5) {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const monthNames = lang === 'si' ? MONTHS_SI : MONTHS_EN;

  for (let y = now.getFullYear(); y >= now.getFullYear() - yearsBack; y -= 1) {
    for (let m = 11; m >= 0; m -= 1) {
      if (y === now.getFullYear() && m > now.getMonth()) continue;
      const value = `${y}-${String(m + 1).padStart(2, '0')}`;
      options.push({ value, label: `${monthNames[m]} ${y}` });
    }
  }

  return options;
}

type PickerProps = {
  label?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  lang?: 'si' | 'en';
};

function emitInputChange(onChange: PickerProps['onChange'], value: string) {
  if (!onChange) return;
  onChange({ target: { value } } as ChangeEvent<HTMLInputElement>);
}

export function MonthPicker({ label = 'මාසය තෝරන්න', value = '', onChange, className = '', lang = 'si' }: PickerProps) {
  const options = useMemo(() => buildMonthOptions(lang), [lang]);

  return (
    <Dropdown
      label={label}
      options={options}
      value={value}
      onChange={(next) => emitInputChange(onChange, next)}
      className={className}
      placeholder={lang === 'si' ? 'මාසය තෝරන්න' : 'Select month'}
    />
  );
}

export function DatePicker({ label = 'දිනය', value = '', onChange, className = '', lang = 'si' }: PickerProps) {
  const options = useMemo(() => {
    const items: { value: string; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 90; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const valueStr = d.toISOString().slice(0, 10);
      const labelStr = d.toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      items.push({ value: valueStr, label: labelStr });
    }
    return items;
  }, [lang]);

  return (
    <Dropdown
      label={label}
      options={options}
      value={value}
      onChange={(next) => emitInputChange(onChange, next)}
      className={className}
      placeholder={lang === 'si' ? 'දිනය තෝරන්න' : 'Select date'}
    />
  );
}

export function TimePicker({ label = 'වේලාව', value = '', onChange, className = '', lang = 'si' }: PickerProps) {
  const options = useMemo(() => {
    const items: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h += 1) {
      for (let m = 0; m < 60; m += 15) {
        const valueStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const suffix = lang === 'si' ? '' : h < 12 ? ' AM' : ' PM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const labelStr =
          lang === 'si'
            ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
            : `${hour12}:${String(m).padStart(2, '0')}${suffix}`;
        items.push({ value: valueStr, label: labelStr });
      }
    }
    return items;
  }, [lang]);

  return (
    <Dropdown
      label={label}
      options={options}
      value={value}
      onChange={(next) => emitInputChange(onChange, next)}
      className={className}
      placeholder={lang === 'si' ? 'වේලාව තෝරන්න' : 'Select time'}
    />
  );
}
