'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/hooks/useLang';

type ProductEntry = {
  barcode: string;
  name: string;
  market_price: number;
  our_price: number;
};

type ProductSearchProps = {
  products: Record<string, { name: string; market_price: number; our_price: number }>;
  onSelect: (barcode: string) => void;
  disabled?: boolean;
};

export function ProductSearch({ products, onSelect, disabled }: ProductSearchProps) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list: ProductEntry[] = Object.entries(products).map(([barcode, p]) => ({
      barcode,
      name: p.name,
      market_price: p.market_price,
      our_price: p.our_price,
    }));
    if (!q) return list.slice(0, 20);
    return list
      .filter((p) => p.barcode.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [products, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function pick(barcode: string) {
    onSelect(barcode);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="form-label label-si">{t('භාණ්ඩය සොයන්න / තෝරන්න', 'Search / Select Product')}</label>
      <input
        type="text"
        disabled={disabled}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % results.length); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1)); }
          if (e.key === 'Enter' && results[highlight]) { e.preventDefault(); pick(results[highlight].barcode); }
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder={t('නම හෝ බාර්කෝඩ්...', 'Name or barcode...')}
        className="form-input"
      />
      {open && results.length > 0 && (
        <ul className="dropdown-menu custom-scrollbar max-h-52">
          {results.map((p, i) => (
            <li
              key={p.barcode}
              className={`dropdown-option label-si cursor-pointer ${i === highlight ? 'dropdown-option-active' : ''}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(p.barcode)}
            >
              <span className="font-mono text-xs text-slate-500">{p.barcode}</span>
              <span className="mx-2">—</span>
              <span className="font-semibold">{p.name}</span>
              <span className="float-right text-primary">Rs. {p.our_price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
      {open && query && results.length === 0 && (
        <ul className="dropdown-menu">
          <li className="dropdown-option-empty label-si">{t('භාණ්ඩ හමු නොවීය', 'No products found')}</li>
        </ul>
      )}
    </div>
  );
}
