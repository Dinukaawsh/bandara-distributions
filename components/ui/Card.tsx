type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  title?: string;
  description?: string;
};

export function Card({ children, className = '', hover, title, description }: CardProps) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`}>
      {title && <h3 className="mb-1 text-lg font-bold text-black label-si">{title}</h3>}
      {description && <p className="mb-4 text-sm text-slate-600 label-si">{description}</p>}
      {children}
    </div>
  );
}
