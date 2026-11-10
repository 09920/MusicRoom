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
        sans: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
        body: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
        headline: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        display: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        title: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
        metric: ["'Plus Jakarta Sans'", 'sans-serif'],
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "title-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-sm": ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        // Stitch "Obsidian Pulse" / Project 7954158057130757842
        primary: {
          DEFAULT: '#d0bcff',
          container: '#a078ff',
          fixed: '#e9ddff',
          'fixed-dim': '#d0bcff',
        },
        'on-primary': '#3c0091',
        'on-primary-container': '#340080',
        'on-primary-fixed': '#23005c',
        'on-primary-fixed-variant': '#5516be',
        'inverse-primary': '#6d3bd7',

        secondary: {
          DEFAULT: '#4cd7f6',
          container: '#03b5d3',
          fixed: '#acedff',
          'fixed-dim': '#4cd7f6',
        },
        'on-secondary': '#003640',
        'on-secondary-container': '#00424e',
        'on-secondary-fixed': '#001f26',
        'on-secondary-fixed-variant': '#004e5c',

        tertiary: {
          DEFAULT: '#4edea3',
          container: '#00a572',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
        },
        'on-tertiary': '#003824',
        'on-tertiary-container': '#00311f',
        'on-tertiary-fixed': '#002113',
        'on-tertiary-fixed-variant': '#005236',

        surface: {
          DEFAULT: '#121317',
          dim: '#121317',
          bright: '#38393e',
          variant: '#343439',
        },
        background: '#121317',
        'on-background': '#e3e2e8',
        'on-surface': '#e3e2e8',
        'on-surface-variant': '#cbc3d7',

        'surface-container': {
          lowest: '#0d0e12',
          low: '#1a1b20',
          DEFAULT: '#1f1f24',
          high: '#292a2e',
          highest: '#343439',
        },
        'surface-dim': '#121317',
        'surface-bright': '#38393e',
        'surface-variant': '#343439',

        outline: {
          DEFAULT: '#958ea0',
          variant: '#494454',
        },

        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        'inverse-surface': '#e3e2e8',
        'inverse-on-surface': '#2f3035',
        'surface-tint': '#d0bcff',

        // Compatibility aliases
        brand: {
          500: '#8b5cf6',
          accent: '#06b6d4',
          cyan: '#4cd7f6',
          emerald: '#10b981',
          purple: '#d0bcff',
        }
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
        'gutter-sm': '1rem',
        'gutter': '1.5rem',
        'margin-sm': '1rem',
        'margin': '2rem',
      },
      fontSize: {
        'headline-xl': ["48px", { lineHeight: "56px", letterSpacing: "-0.03em", fontWeight: "800" }],
        'headline-xl-mobile': ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "800" }],
        'headline-lg': ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        'headline-lg-mobile': ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
        'headline-md': ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "700" }],
        'title-md': ["18px", { lineHeight: "24px", fontWeight: "600" }],
        'body-lg': ["16px", { lineHeight: "24px", fontWeight: "400" }],
        'body-md': ["14px", { lineHeight: "20px", fontWeight: "400" }],
        'label-md': ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        'label-sm': ["10px", { lineHeight: "14px", letterSpacing: "0.06em", fontWeight: "700" }],
      },
      borderRadius: {
        DEFAULT: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      boxShadow: {
        'stitch': '0 4px 24px rgba(0,0,0,0.4)',
        'glow-primary': '0 0 24px rgba(208,188,255,0.4)',
        'glow-violet': '0 0 28px rgba(160,120,255,0.65)',
        'glow-cyan': '0 0 16px rgba(76,215,246,0.4)',
        'glow-emerald': '0 0 14px rgba(78,222,163,0.4)',
      }
    },
  },
  plugins: [],
}
