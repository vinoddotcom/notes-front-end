'use client';

import { useEffect, useState } from 'react';

// List of all available themes from daisyUI
const VALID_THEMES = [
  "light", 
  "dark", 
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "night"
];

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Apply theme when component mounts
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Get saved theme from localStorage
      let savedTheme = localStorage.getItem('theme');
      
      // Validate the saved theme is in our list of valid themes
      if (!savedTheme || !VALID_THEMES.includes(savedTheme)) {
        // Check user's preferred color scheme if no valid theme is saved
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'dark' : 'light';
        localStorage.setItem('theme', savedTheme);
      }
      
      // Apply the theme to the document
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    setMounted(true);
  }, []);

  // Add a listener for system color scheme changes
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Define what happens when the system theme changes
    const handleChange = () => {
      // Only change theme automatically if user hasn't explicitly set one
      if (!localStorage.getItem('theme')) {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      }
    };
    
    // Add the listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up the listener when the component unmounts
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  return <>{children}</>;
}
