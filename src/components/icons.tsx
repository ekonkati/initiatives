import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
    return (
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
        <path d="M2 12s5.333-8 10-8 10 8 10 8-5.333 8-10 8-10-8-10-8Z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M22 12h-2" />
        <path d="M6 12H4" />
        <path d="M12 6V4" />
        <path d="M12 20v-2" />
      </svg>
    );
  }
