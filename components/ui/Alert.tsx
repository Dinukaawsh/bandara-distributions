type AlertProps = {
  type: 'success' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
};

export function Alert({ type, children, className = '' }: AlertProps) {
  const cls =
    type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';
  return <div className={`${cls} label-si ${className}`}>{children}</div>;
}
