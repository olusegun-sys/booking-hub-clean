/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // The legacy Booking Hub pages style themselves with hand-written CSS in
  // index.html. Preflight would reset those out from under them, so Tailwind
  // here is utilities-only and the Plazzaa pages carry their own scoped reset.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Plazzaa design system v1.1
        plz: {
          blue: '#2D60EA',
          'blue-deep': '#1F47B4',   // hover / pressed only
          'blue-wash': '#E8EFFE',   // selected rows, quiet blue surfaces
          yellow: '#FCD451',
          'yellow-deep': '#E8B92E', // hover on yellow surfaces
          ink: '#18181B',
          grey: '#A1A1AA',          // genuinely subdued UI only
          body: '#52525B',          // default secondary copy
          surface: '#F4F4F5',
          lavender: '#EDE9FE',
          cream: '#FFFBEB',
          line: '#E4E4E7',
          'line-strong': '#D4D4D8',
        },
        // kept so the legacy pages that reference it don't change
        indigo: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4F46E5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Instrument Serif"', '"EB Garamond"', 'Georgia', 'serif'],
      },
      // One scale, fluid between the design system's mobile and desktop values
      fontSize: {
        hero: ['clamp(46px, 8vw, 104px)', { lineHeight: '0.98', letterSpacing: '-0.025em', fontWeight: '500' }],
        h1: ['clamp(42px, 5vw, 64px)', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '500' }],
        h2: ['clamp(34px, 3.6vw, 48px)', { lineHeight: '1.08', letterSpacing: '-0.018em', fontWeight: '500' }],
        h3: ['clamp(28px, 2.6vw, 36px)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '500' }],
        h4: ['clamp(22px, 1.8vw, 26px)', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        lead: ['clamp(18px, 1.5vw, 22px)', { lineHeight: '1.55' }],
        body: ['clamp(16px, 1.15vw, 18px)', { lineHeight: '1.55' }],
        small: ['clamp(14px, 1vw, 15px)', { lineHeight: '1.5' }],
        label: ['13px', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
        btn: ['15px', { lineHeight: '1', fontWeight: '600' }],
      },
      spacing: {
        // 8px base with the design system's named steps
        13: '52px', 15: '60px', 18: '72px', 22: '88px',
        30: '120px', 40: '160px', 50: '200px',
      },
      borderRadius: {
        ctl: '8px',
        input: '10px',
        btn: '10px',
        card: '14px',
        visual: '20px',
      },
      maxWidth: {
        page: '1800px',
        read: '65ch',
      },
      transitionTimingFunction: {
        plz: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        micro: '180ms',
        ui: '320ms',
        editorial: '640ms',
      },
      boxShadow: {
        // shadow is an accent here, never a texture
        lift: '0 6px 24px -12px rgba(24, 24, 27, 0.25)',
        panel: '0 18px 50px -24px rgba(24, 24, 27, 0.3)',
      },
    },
  },
  plugins: [],
}
