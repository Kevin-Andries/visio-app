// craco.config.js
// Config file when we use tailwind with create-react-app
module.exports = {
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};
