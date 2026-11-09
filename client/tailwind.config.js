/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
        body: ["'Inter'", "'Barlow'", 'system-ui', 'sans-serif'],
        serif: ["'Instrument Serif'", 'serif'],
      },
      colors: {
        accent: {
          lavender: '#9d8df1',
          lavenderLight: '#b5a9f5',
          lavenderDark: '#8573ec',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Electric Purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          accent: '#10b981', // Emerald green accent
        },
        surface: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          dark: '#09090b',
          card: '#121215',
          cardBorder: '#27272a'
        }
      }
    },
  },
  plugins: [],
}

