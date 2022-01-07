const path = require("path");
//const webpack = require("webpack");

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.resolve.alias["~/src"] = path.join(__dirname, "./src");
  config.resolve.alias["~/public"] = path.join(__dirname, "./public");
  /*const multipleEntry = require('react-app-rewire-multiple-entry')([
  {
    entry: 'src/entry/landing.js',
    template: 'public/landing.html',
    outPath: '/landing.html'
  }
]);*/
  //config.optimization.runtimeChunk = "single";
  //config.entry.push(path.join(__dirname, "./src/chrome/content.js"));
  // ...config.entry,
  //content: ,
  //background: "./src/chrome/background.js" };
  config.entry = {
    main: "./src/index.js",
    content: "./src/chrome/content.js",
    background: "./src/chrome/background.js",
  };
  config.output.filename = "static/js/[name].js";
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
  config.optimization.runtimeChunk = false;
  return config;
};
