// Tiny client router so we avoid extra deps.
import React, { useEffect } from 'react';

export type RouteEntry = { path: string; element: React.ReactNode };

export const Router: React.FC<{ routes: RouteEntry[] }> = ({ routes }) => {
  const [path, setPath] = React.useState(location.pathname || '/');

  useEffect(() => {
    const onPop = () => setPath(location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const match = routes.find((r) => r.path === path) ?? routes[0];
  return <>{match.element}</>;
};

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href = '/',
  onClick,
  ...rest
}) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      onClick?.(e);
    }}
    {...rest}
  />
);

export function navigate(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
