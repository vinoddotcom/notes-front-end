'use client';

import { useEffect } from 'react';

// This component is a backup for theme initialization
// The main initialization happens directly in layout.tsx with an inline script
export function ThemeInitializer() {
  useEffect(() => {
    // Check if theme is already initialized (by inline script)
    if (!document.documentElement.classList.contains('theme-initialized')) {
      try {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const initialTheme = prefersDark ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', initialTheme);
          localStorage.setItem('theme', initialTheme);
        }
        
        document.documentElement.classList.add('theme-initialized');
      } catch (e) {
        console.error('Theme initialization error:', e);
      }
    }
  }, []);

  return null;
}
