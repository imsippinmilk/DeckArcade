import React, { createContext, useCallback, useContext, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'error';
}

const ToastContext = createContext<
  (msg: string, type?: 'success' | 'error') => void
>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type?: 'success' | 'error') => {
      const id = Date.now();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, 3000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div role="status" aria-live="polite" className="toaster">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type ?? ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
