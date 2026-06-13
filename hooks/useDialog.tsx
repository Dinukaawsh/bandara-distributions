'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ConfirmModal, MessageModal } from '@/components/ui/ConfirmModal';
import type { Lang } from '@/lib/translations';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
};

type AlertOptions = {
  title: string;
  message: string;
  okLabel?: string;
};

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };
type PendingAlert = AlertOptions & { resolve: () => void };

type DialogProviderProps = {
  lang: Lang;
  children: React.ReactNode;
};

export function DialogProvider({ lang, children }: DialogProviderProps) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [pendingAlert, setPendingAlert] = useState<PendingAlert | null>(null);

  const defaults = useMemo(
    () => ({
      yes: lang === 'si' ? 'ඔව්' : 'Yes',
      no: lang === 'si' ? 'නැත' : 'No',
      ok: lang === 'si' ? 'හරි' : 'OK',
      confirmTitle: lang === 'si' ? 'තහවුරු කරන්න' : 'Confirm',
      noticeTitle: lang === 'si' ? 'දැනුම්දීම' : 'Notice',
    }),
    [lang]
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPendingConfirm({ ...options, resolve });
      }),
    []
  );

  const alert = useCallback(
    (options: AlertOptions) =>
      new Promise<void>((resolve) => {
        setPendingAlert({ ...options, resolve });
      }),
    []
  );

  const closeConfirm = (value: boolean) => {
    pendingConfirm?.resolve(value);
    setPendingConfirm(null);
  };

  const closeAlert = () => {
    pendingAlert?.resolve();
    setPendingAlert(null);
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmModal
        open={!!pendingConfirm}
        title={pendingConfirm?.title || defaults.confirmTitle}
        message={pendingConfirm?.message || ''}
        confirmLabel={pendingConfirm?.confirmLabel || defaults.yes}
        cancelLabel={pendingConfirm?.cancelLabel || defaults.no}
        confirmVariant={pendingConfirm?.confirmVariant || 'danger'}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
      <MessageModal
        open={!!pendingAlert}
        title={pendingAlert?.title || defaults.noticeTitle}
        message={pendingAlert?.message || ''}
        okLabel={pendingAlert?.okLabel || defaults.ok}
        onClose={closeAlert}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    return {
      confirm: async () => false,
      alert: async () => {},
    };
  }
  return ctx;
}
