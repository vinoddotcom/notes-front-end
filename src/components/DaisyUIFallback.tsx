// This file will be used to provide a fallback DaisyUI styling if the built-in styling fails
export default function DaisyUIFallback() {
  return (
    <>
      {/* This adds the DaisyUI styles directly via CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/daisyui@4.7.2/dist/full.css" 
        integrity="sha256-R+huU6BlJHk/EBzSZ5FUl6wwEe1ytkwkEz9wNXpG9Eg=" 
        crossOrigin="anonymous" 
      />
      
      {/* This adds the Tailwind preflight styles */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/lib/css/preflight.min.css" 
        integrity="sha256-gVJ57MYnHiHmXSqmHoQw+bZ0yQhPwkTpxcU4wlGiTZY=" 
        crossOrigin="anonymous" 
      />
    </>
  );
}
