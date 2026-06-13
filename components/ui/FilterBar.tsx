'use client';

type FilterBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`card flex flex-wrap items-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
