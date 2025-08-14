import React, { ReactNode } from 'react';

interface LinkProps {
  href: string;
  children?: ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children }) => (
  <a href={href}>{children}</a>
);
