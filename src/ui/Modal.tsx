import React, { useEffect } from 'react';

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);


import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-root"

      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.4)',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        zIndex: 40,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(720px, 96vw)', padding: '1rem 1rem 1.25rem' }}
      >
        {title && (
          <h3
            style={{ margin: '0 0 .5rem', fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--background-color)',
          padding: '1rem',
          borderRadius: 4,
          minWidth: '300px',
        }}
      >
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
