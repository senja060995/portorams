/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#020617', // Deep space void
          900: '#070c18', // Orbital dark
          850: '#0b1329', // Deep navy canvas
          800: '#0f172a', // Space card bg
          700: '#1e293b', // Space border
        },
        neon: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
      backgroundImage: {
        'radial-space': 'radial-gradient(ellipse at top, #0f172a 0%, #020617 80%)',
        'cyber-gradient': 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.15) 100%)',
        'glow-line': 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'neon-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-slow': 'spin 30s linear infinite',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
