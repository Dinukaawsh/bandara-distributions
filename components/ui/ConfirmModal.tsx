'use client';

import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'ඔව්',
  cancelLabel = 'නැත',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footerSplit
      footer={
        <>
          <Button variant="secondary" className="w-full" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} className="w-full" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-700 label-si">{message}</p>
    </Modal>
  );
}

type MessageModalProps = {
  open: boolean;
  title: string;
  message: string;
  okLabel?: string;
  onClose: () => void;
};

export function MessageModal({
  open,
  title,
  message,
  okLabel = 'හරි',
  onClose,
}: MessageModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button className="w-full" onClick={onClose}>
          {okLabel}
        </Button>
      }
    >
      <p className="text-sm text-slate-700 label-si">{message}</p>
    </Modal>
  );
}
