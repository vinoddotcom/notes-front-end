import React, { useEffect, useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

export default function TestComponent() {
  const [currentTheme, setCurrentTheme] = useState('');
  const [themeDebugInfo, setThemeDebugInfo] = useState<{[key: string]: string}>({});
  
  // Debug function to check theme CSS variables
  useEffect(() => {
    function updateThemeInfo() {
      const html = document.documentElement;
      const theme = html.getAttribute('data-theme') || 'light';
      
      // Get computed styles for debugging
      const styles = getComputedStyle(document.documentElement);
      const primaryColor = styles.getPropertyValue('--p');
      const secondaryColor = styles.getPropertyValue('--s');
      const accentColor = styles.getPropertyValue('--a');
      const baseColor = styles.getPropertyValue('--b1');
      
      setCurrentTheme(theme);
      setThemeDebugInfo({
        'data-theme': theme,
        'Primary (--p)': primaryColor,
        'Secondary (--s)': secondaryColor,
        'Accent (--a)': accentColor,
        'Base (--b1)': baseColor
      });
    }
    
    // Update immediately and whenever theme changes
    updateThemeInfo();
    
    // Set up observer to detect theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-theme'
        ) {
          updateThemeInfo();
        }
      });
    });
    
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Force theme refresh function - will apply the theme directly via inline style
  const forceThemeRefresh = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    // Force a re-render by toggling a different theme and back
    document.documentElement.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }, 100);
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-primary">Styling Test</h1>
      
      {/* Theme debug information */}
      <div className="my-4 p-4 w-full max-w-xl bg-base-200 rounded-lg">
        <h3 className="text-xl font-medium mb-2">Theme Debug Info</h3>
        <p className="mb-2">Current Theme: <strong>{currentTheme}</strong></p>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(themeDebugInfo).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={forceThemeRefresh} className="btn btn-sm mt-2">
          Force Theme Refresh
        </button>
      </div>
      
      {/* Prominently display the theme switcher */}
      <div className="my-4">
        <ThemeSwitcher />
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-accent">Accent Button</button>
        <button className="btn btn-neutral">Neutral Button</button>
      </div>
      
      <div className="card w-96 bg-base-100 shadow-xl mt-4">
        <div className="card-body">
          <h2 className="card-title">Card Title</h2>
          <p>This is a test card to ensure DaisyUI styling is working.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Action</button>
          </div>
        </div>
      </div>
      
      {/* Color palette demo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-8">
        <div className="p-4 bg-primary text-primary-content rounded">Primary</div>
        <div className="p-4 bg-secondary text-secondary-content rounded">Secondary</div>
        <div className="p-4 bg-accent text-accent-content rounded">Accent</div>
        <div className="p-4 bg-neutral text-neutral-content rounded">Neutral</div>
        <div className="p-4 bg-base-100 text-base-content border rounded">Base</div>
      </div>
      
      {/* Explicit theme test blocks */}
      <div className="mt-8">
        <h3 className="text-xl font-medium mb-2">Theme Test Blocks</h3>
        <p className="mb-2">These blocks should change color based on theme:</p>
        <div className="flex flex-wrap gap-2">
          <div className="theme-test">Theme Primary Color</div>
          <div style={{backgroundColor: "hsl(var(--p))", color: "hsl(var(--pc))"}} 
               className="p-2 rounded">
            Inline Primary Color
          </div>
        </div>
      </div>
    </div>
  );
}
