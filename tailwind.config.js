/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        accent: {
          DEFAULT: 'var(--text-accent)',
          primary: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
        }
      },
      borderWidth: {
        theme: '1px'
      },
      borderColor: {
        theme: 'var(--border)',
      },
      backgroundColor: {
        theme: 'var(--background)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
};
