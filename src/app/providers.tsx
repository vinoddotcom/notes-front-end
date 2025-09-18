'use client';

import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Check for saved theme preference or use device preference
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Use localStorage to determine theme if available
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        // Check user's preferred color scheme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', defaultTheme);
        localStorage.setItem('theme', defaultTheme);
      }
    }
  }, []);

  return <>{children}</>;
}
