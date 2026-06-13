import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
type Size = 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  warning: 'btn-warning',
  ghost: 'btn-ghost',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${size === 'lg' ? 'btn-lg' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={variant === 'primary' || variant === 'success' || variant === 'danger' ? 'spinner' : 'spinner spinner-dark'} />}
      {children}
    </button>
  );
}
