// src/components/Header.jsx
import React from 'react';

// A simple functional component for the header.
function Header() {
  return (
    // The <header> HTML5 semantic tag is used for the header section.
    // Tailwind CSS classes are used for styling:
    // - bg-gradient-to-r: background gradient to the right
    // - from-green-400 via-emerald-500 to-teal-600: gradient colors
    // - p-4: padding of 1rem (16px if base font size is 16px)
    // - shadow-md: medium box shadow
    <header className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 p-4 shadow-md">
      {/* container: centers content and sets max-width based on screen size */}
      {/* mx-auto: centers the container horizontally */}
      <div className="container mx-auto">
        {/* text-white: sets text color to white */}
        {/* text-3xl: sets font size to 1.875rem */}
        {/* font-bold: sets font weight to bold */}
        {/* text-center: centers the text */}
        <h1 className="text-white text-3xl font-bold text-center">
          🤖 AI Food Buddy 🍲
        </h1>
        {/* Placeholder for future elements:
          You might want to add navigation links, a user profile icon, 
          or other elements to your header later on.
        */}
      </div>
    </header>
  );
}

// Export the Header component so it can be imported and used in other files.
export default Header;
