import React from 'react';
import { theme } from './theme';

export type ButtonVariant = 'primary' | 'outline' | 'secondary';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

/**
 * A simple button component that respects the design tokens defined in
 * the theme. Variants define background and border colours. This
 * component has generous padding and a large hit target to satisfy
 * accessibility requirements.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'secondary',
  disabled = false
}) => {
  const baseStyles: React.CSSProperties = {
    padding: `${theme.spaceScale[3]} ${theme.spaceScale[5]}`,
    borderRadius: theme.radius.md as unknown as number,
    fontFamily: theme.typography.body,
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s ease',
    minHeight: '2.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  let styles: React.CSSProperties;
  switch (variant) {
    case 'primary':
      styles = {
        ...baseStyles,
        backgroundColor: theme.colors.accentPrimary,
        color: theme.colors.bg,
        border: `2px solid ${theme.colors.accentPrimary}`
      };
      break;
    case 'outline':
      styles = {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: theme.colors.accentPrimary,
        border: `2px solid ${theme.colors.accentPrimary}`
      };
      break;
    default:
      styles = {
        ...baseStyles,
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        border: `2px solid ${theme.colors.surface}`
      };
  }

  return (
    <button onClick={disabled ? undefined : onClick} style={styles} aria-disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;