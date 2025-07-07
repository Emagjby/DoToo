/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Developer Color Palette
        primary: '#007ACC',        // VS Code Blue
        secondary: '#4CAF50',      // Success Green  
        accent: '#FF6B35',         // Warning Orange
        danger: '#F44336',         // Error Red
        'bg-dark': '#1E1E1E',      // VS Code Dark
        'bg-light': '#FFFFFF',     // Clean White
        surface: '#2D2D30',        // Card Background
        'code-text': '#CCCCCC',    // Code Text
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

