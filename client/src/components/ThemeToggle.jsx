import React from 'react';

   const ThemeToggle = ({ theme, setTheme }) => {
     return (
       <button
         onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
         className="fixed top-4 right-4 p-2 bg-blue-500 text-white rounded"
       >
         {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
       </button>
     );
   };

   export default ThemeToggle;