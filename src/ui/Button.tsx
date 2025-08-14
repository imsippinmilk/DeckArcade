import React from 'react';


type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  loading,
  children,
  ...rest
}) => (
  <button
    {...rest}
    style={{
      minHeight: '2.75rem',
      padding: '0 1rem',
      borderRadius: '1rem',
      border: '1px solid transparent',
      background:
        variant === 'primary'
          ? 'var(--accentPrimary)'
          : variant === 'danger'
            ? 'var(--danger)'
            : 'transparent',
      color: variant === 'ghost' ? 'var(--text)' : '#0b0f12',
      boxShadow: 'var(--shadow-card)',
      opacity: rest.disabled ? 0.6 : 1,
    }}
    aria-busy={!!loading}
  >
    {loading ? '…' : children}
  </button>
);

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
