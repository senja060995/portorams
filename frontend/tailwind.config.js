/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#000B4D',
          900: '#001080',
          800: '#0016A3',
          700: '#0021C4',
          600: '#0044E0',
          500: '#0088FF',
          400: '#00B2FF',
          300: '#5CCCFF',
          200: '#A8E1FF',
          100: '#D8E9F4',
          50: '#F0F6FB',
        },
        ink: {
          900: '#111111',
          800: '#333333',
          700: '#484848',
          500: '#767676',
          400: '#A9A9A9',
          300: '#C9C9C9',
          200: '#EBEBEB',
          100: '#EFF2F4',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.25' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(0, 22, 163, 0.12)',
        'card-hover': '0 16px 48px -12px rgba(0, 22, 163, 0.22)',
        nav: '0 2px 16px -4px rgba(0, 11, 77, 0.10)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0016A3 0%, #0088FF 100%)',
        'brand-soft': 'linear-gradient(180deg, #F0F6FB 0%, #FFFFFF 100%)',
        'hero-scrim': 'linear-gradient(180deg, rgba(0,11,77,0.55) 0%, rgba(0,11,77,0.15) 55%, rgba(0,11,77,0.75) 100%)',
      },
      maxWidth: {
        content: '1280px',
        prose: '68ch',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
