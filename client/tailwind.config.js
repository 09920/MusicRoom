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
        headline: ["'Outfit'", "'Inter'", 'system-ui', 'sans-serif'],
        display: ["'Outfit'", "'Inter'", 'system-ui', 'sans-serif'],
        heading: ["'Outfit'", "'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
        body: ["'Inter'", "'Barlow'", 'system-ui', 'sans-serif'],
        serif: ["'Instrument Serif'", 'serif'],
        code: ["'JetBrains Mono'", 'monospace'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      colors: {
        // Stitch "Obsidian Soundscape" Core Palette
        primary: {
          DEFAULT: '#d0bcff',
          container: '#a078ff',
          fixed: '#e9ddff',
          'fixed-dim': '#d0bcff',
        },
        secondary: {
          DEFAULT: '#4cd7f6',
          container: '#03b5d3',
          fixed: '#acedff',
          'fixed-dim': '#4cd7f6',
        },
        tertiary: {
          DEFAULT: '#ffb2b7',
          container: '#ff516a',
          fixed: '#ffdadb',
          'fixed-dim': '#ffb2b7',
        },
        'on-primary': '#3c0091',
        'on-primary-container': '#340080',
        'on-secondary': '#003640',
        'on-secondary-container': '#00424e',
        'on-tertiary': '#67001b',
        'on-tertiary-container': '#5b0017',
        'on-surface': '#e3e1ee',
        'on-surface-variant': '#cbc3d7',
        'on-background': '#e3e1ee',
        outline: {
          DEFAULT: '#958ea0',
          variant: '#494454',
        },
        'surface-container': {
          lowest: '#0d0e16',
          low: '#1a1b24',
          DEFAULT: '#1e1f28',
          high: '#282933',
          highest: '#33343e',
        },
        'surface-bright': '#383843',
        'surface-dim': '#12131c',
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
          emerald: '#10b981',
          cyan: '#06b6d4',
          rose: '#f43f5e',
        },
        surface: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          dark: '#08080d',
          darker: '#040407',
          card: '#11121d',
          cardBorder: '#27273b',
          glass: 'rgba(18, 20, 32, 0.72)',
          glassBorder: 'rgba(255, 255, 255, 0.08)'
        }
      },
      boxShadow: {
        'glow-purple': '0 0 30px -5px rgba(139, 92, 246, 0.4)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 30px -5px rgba(244, 63, 94, 0.35)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.35)',
        'glass': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 14s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'eq-1': 'eq 1.1s ease-in-out infinite alternate',
        'eq-2': 'eq 0.8s ease-in-out 0.2s infinite alternate',
        'eq-3': 'eq 1.3s ease-in-out 0.4s infinite alternate',
        'eq-4': 'eq 0.95s ease-in-out 0.1s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        eq: {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

