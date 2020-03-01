const nodeExternals = require("webpack-node-externals");
const WebpackShellPlugin = require('webpack-shell-plugin');
const path = require("path");
const { NODE_ENV = "production" } = process.env;

module.exports = {
  entry: "./src/index.ts",
  watch: NODE_ENV === "development",
  externals: [nodeExternals()],
  mode: NODE_ENV,
  target: "node",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"]
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ["yarn run:dev"]
    })
  ]
};
