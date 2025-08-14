import React, { useState } from 'react';
import { theme } from './theme';

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'warning' | 'error';
}

/**
 * A simple toaster component to display transient notifications. This
 * implementation keeps an internal list of toasts. In a real
 * application you would likely use a context or a global store so
 * any component can enqueue a toast.
 */
const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Placeholder function to add a toast for demonstration purposes
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now().toString(), message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: theme.spaceScale[5],
        right: theme.spaceScale[5],
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spaceScale[3]
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            backgroundColor:
              toast.type === 'error'
                ? theme.colors.danger
                : toast.type === 'warning'
                ? theme.colors.warning
                : theme.colors.success,
            color: theme.colors.bg,
            borderRadius: theme.radius.md,
            padding: `${theme.spaceScale[2]} ${theme.spaceScale[4]}`,
            boxShadow: theme.shadows.card
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toaster;