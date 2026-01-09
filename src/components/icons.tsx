import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="16" height="16" x="4" y="4" rx="2" ry="2"></rect>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="16"></line>
  </svg>
);
