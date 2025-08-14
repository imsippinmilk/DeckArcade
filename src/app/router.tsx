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
