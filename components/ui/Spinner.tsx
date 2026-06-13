export function Spinner({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  return <span className={`${dark ? 'spinner spinner-dark' : 'spinner'} ${className}`} />;
}

export function PageLoader({ text = 'පූරණය වෙමින්...' }: { text?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner dark />
      <p className="text-sm font-semibold text-slate-600 label-si">{text}</p>
    </div>
  );
}
