// postcss.config.js (or .cjs)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // This is the new, correct way
    autoprefixer: {},
  },
};
