/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cameco: {
          red: {
            DEFAULT: '#C41230',
            dark: '#8E0E22',
            light: '#E22849',
            surface: '#FDF3F4',
            border: '#F7C6CD',
          },
          charcoal: {
            DEFAULT: '#14171A',
            muted: '#434A54',
            subtle: '#656D78',
          },
          canvas: {
            DEFAULT: '#FBFBF9',
            muted: '#F4F5F2',
            card: '#FFFFFF',
          },
          rule: {
            DEFAULT: '#E5E7EB',
            dark: '#CBD5E1',
          }
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        editorial: '0 2px 6px -1px rgba(20, 23, 26, 0.06), 0 1px 3px -1px rgba(20, 23, 26, 0.04)',
      }
    },
  },
  plugins: [],
};

