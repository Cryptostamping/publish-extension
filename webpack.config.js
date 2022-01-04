const path = require("path")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const glob = require("glob")
const fs = require('fs');
const hashes = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));

module.exports = {
  entry: {
    "bundle.js":  glob.sync("build/static/?(js|css)/*.?(js|css)").map(f => path.resolve(__dirname, f)),
  },
  output: {
    //filename: "widgets"+hashes.files["main.js"]+".min.js",
    filename: "widgets/main.min.js",
    path: path.resolve(__dirname, 'build')
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new UglifyJsPlugin()],
}