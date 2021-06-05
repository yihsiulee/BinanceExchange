module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    backgroundColor: (theme) => ({
      ...theme('colors'),
      darkblue: '#0a0e17',
      lightblue: '#111722',
    }),
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
