import { InputHTMLAttributes, forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className = '', id, ...props },
  ref
) {
  const inputId = id || label?.replace(/\s/g, '-').toLowerCase();
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="form-label label-si">
          {label}
        </label>
      )}
      <input ref={ref} id={inputId} className={`form-input ${className}`} {...props} />
      {hint && <p className="mt-1 text-xs text-slate-500 label-si">{hint}</p>}
    </div>
  );
});
