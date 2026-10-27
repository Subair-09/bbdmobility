/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bbd: {
          navy: '#092957',
          'navy-dark': '#061b36',
          'navy-deep': '#041326',
          'navy-light': '#163c75',
          red: '#E30620',
          'red-hover': '#c7051b',
          'red-light': '#ffedf0',
          grey: '#F4F6F8',
          'grey-subtle': '#EDF1F5',
          'grey-border': '#E2E8F0',
          'text-muted': '#64748B',
          'text-navy': '#0F264A',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'Montserrat',
          'Inter',
          '-apple-system',
          'sans-serif',
        ]
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(9, 41, 87, 0.08), 0 2px 6px -1px rgba(9, 41, 87, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(9, 41, 87, 0.12), 0 4px 10px -2px rgba(9, 41, 87, 0.06)',
        'booking': '0 20px 40px -10px rgba(9, 41, 87, 0.18), 0 1px 3px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
