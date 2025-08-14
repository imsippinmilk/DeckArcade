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

import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, ...props }) => (
  <a href={href} {...props}>
    {children}
  </a>
);

import React, { ReactNode } from 'react';

interface LinkProps {
  href: string;
  children?: ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children }) => (
  <a href={href}>{children}</a>
);

import React, { useEffect, useState } from 'react';

interface Route {
  path: string;
  element: React.ReactNode;
}

export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function Router({ routes }: { routes: Route[] }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const route = routes.find((r) => r.path === path) ?? routes[0];
  return <>{route.element}</>;
}