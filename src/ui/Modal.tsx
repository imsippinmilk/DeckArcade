import React from 'react';
import { theme } from './theme';

export interface ModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * A basic modal dialog. For now this component simply renders its
 * children when open and applies a semi-transparent backdrop. In the
 * future, animations from the preset definitions can be hooked in.
 */
const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          borderRadius: theme.radius.lg,
          padding: theme.spaceScale[5],
          minWidth: '20rem',
          maxWidth: '90vw',
          boxShadow: theme.shadows.card
        }}
      >
        {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;