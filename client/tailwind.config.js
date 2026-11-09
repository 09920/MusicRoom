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
        sans: ["'Inter'", 'system-ui', 'sans-serif'],
        body: ["'Inter'", 'system-ui', 'sans-serif'],
        headline: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
        display: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
        title: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Inter'", 'monospace'],
        metric: ["'Inter'", 'system-ui', 'sans-serif'],
      },
      colors: {
        // Stitch "Obsidian Sonic" / Project 7520478425255592303 Theme
        primary: {
          DEFAULT: '#d0bcff',
          container: '#a078ff',
          fixed: '#e9ddff',
          'fixed-dim': '#d0bcff',
        },
        secondary: {
          DEFAULT: '#4edea3',
          container: '#00a572',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
        },
        tertiary: {
          DEFAULT: '#4cd7f6',
          container: '#009eb9',
          fixed: '#acedff',
          'fixed-dim': '#4cd7f6',
        },
        'on-primary': '#3c0091',
        'on-primary-container': '#340080',
        'on-primary-fixed': '#23005c',
        'on-primary-fixed-variant': '#5516be',
        'inverse-primary': '#6d3bd7',

        'on-secondary': '#003824',
        'on-secondary-container': '#00311f',
        'on-secondary-fixed': '#002113',
        'on-secondary-fixed-variant': '#005236',

        'on-tertiary': '#003640',
        'on-tertiary-container': '#002f38',
        'on-tertiary-fixed': '#001f26',
        'on-tertiary-fixed-variant': '#004e5c',

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
          accent: '#4edea3',
          cyan: '#4cd7f6',
          purple: '#d0bcff',
        }
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        'space-2xl': '3rem',
        'gutter-sm': '1rem',
        'gutter': '1.5rem',
        'gutter-lg': '2rem',
        'margin-sm': '1rem',
        'margin': '2rem',
        'margin-lg': '3rem',
      },
      fontSize: {
        'display': ['56px', { lineHeight: '64px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-sm': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '22px', letterSpacing: '0em', fontWeight: '600' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0em', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0em', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '18px', letterSpacing: '0.01em', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '500' }],
        'metric-mono': ['12px', { lineHeight: '16px', letterSpacing: '0.06em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        'stitch': '0 1px 8px rgba(0,0,0,0.04)',
        'stitch-modal': '0 24px 64px rgba(0,0,0,0.85)',
        'stitch-player': '0 -4px 20px rgba(0,0,0,0.4)',
        'glow-purple': '0 0 24px -4px rgba(160, 120, 255, 0.4)',
        'glow-emerald': '0 0 24px -4px rgba(78, 222, 163, 0.4)',
      }
    },
  },
  plugins: [],
}
