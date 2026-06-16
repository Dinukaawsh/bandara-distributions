'use client';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerSplit?: boolean;
  size?: 'md' | 'lg' | 'xl';
};

export function Modal({ open, onClose, title, children, footer, footerSplit = false, size = 'md' }: ModalProps) {
  if (!open) return null;

  const sizeClass =
    size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-panel ${sizeClass} overflow-visible`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-bold text-black label-si">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-black" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-visible p-5">{children}</div>
        {footer && (
          <div className={`border-t border-border px-5 py-4 ${footerSplit ? 'modal-footer-split' : 'flex justify-end gap-2'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
