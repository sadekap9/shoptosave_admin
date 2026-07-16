module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D28D9',
          light: '#F5F3FF',
          dark: '#5B21B6',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          light: '#EEF2F6',
          dark: '#7C3AED',
        },
        accent: {
          DEFAULT: '#A855F7',
          light: '#F3E8FF',
          dark: '#9333EA',
        },
        slatebg: '#F8FAFC',
        darkslate: '#0F172A',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
