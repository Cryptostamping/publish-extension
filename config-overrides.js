const path = require("path");
//const webpack = require("webpack");

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.resolve.alias["~/src"] = path.join(__dirname, "./src");
  /*config.resolve.fallback = { 
    "crypto": require.resolve("crypto-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "stream": require.resolve("stream-browserify")
  }*/
  /*config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer/"),
  };
  config.plugins = [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ];
  */
  return config;
};
