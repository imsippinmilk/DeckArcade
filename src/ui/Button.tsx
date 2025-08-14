import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary';
}

export function Button({ variant, style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: 4,
    cursor: 'pointer',
  };
  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: 'var(--accent-color)',
          color: '#fff',
          border: 'none',
        }
      : {
          backgroundColor: 'transparent',
          border: '1px solid var(--text-color)',
          color: 'var(--text-color)',
        };
  return (
    <button
      {...props}
      style={{ ...baseStyle, ...variantStyle, ...(style ?? {}) }}
    />
  );
}
