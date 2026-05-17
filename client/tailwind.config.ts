import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand
        primary: {
          DEFAULT: '#6366F1',
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          dark: '#818CF8',
        },
        // Purple gradient partner
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        // Coral accent
        coral: {
          DEFAULT: '#F97316',
          light: '#FDBA74',
          dark: '#EA580C',
        },
        // Mint / success
        mint: {
          DEFAULT: '#10B981',
          light: '#6EE7B7',
          dark: '#059669',
        },
        // Dark-mode background scale
        dark: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        // Light-mode surface scale
        surface: {
          DEFAULT: '#FFFFFF',
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2':      ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3':      ['20px', { lineHeight: '1.35', fontWeight: '600' }],
        'body':    ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'small':   ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'xs':      ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        'card':   '16px',
        'button': '14px',
        'input':  '12px',
        'modal':  '24px',
        'pill':   '999px',
      },
      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        'button':      '0 4px 12px rgba(99,102,241,0.35)',
        'button-hover':'0 8px 24px rgba(99,102,241,0.45)',
        'input-focus': '0 0 0 3px rgba(99,102,241,0.18)',
        'modal':       '0 24px 80px rgba(0,0,0,0.3)',
        'toast':       '0 8px 32px rgba(0,0,0,0.2)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.4)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.4)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top':    'env(safe-area-inset-top)',
        'nav':         '64px',
        'touch':       '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      animation: {
        // Entrance
        'fade-in':    'fadeIn 0.2s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        // UI feedback
        'shimmer':    'shimmer 1.8s ease-in-out infinite',
        'pulse-dot':  'pulseDot 1.4s ease-in-out infinite',
        'shake':      'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'scale-in':   'scaleIn 0.15s ease-out forwards',
        // Legacy / landing
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.75)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.4)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        'gradient-coral':   'linear-gradient(135deg, #F97316, #EF4444)',
        'gradient-mint':    'linear-gradient(135deg, #10B981, #06B6D4)',
        'shimmer-base':     'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
