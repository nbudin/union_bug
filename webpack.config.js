const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { env } = require("process");

module.exports = {
  mode: env.NODE_ENV === "production" ? "production" : "development",
  devtool:
    env.NODE_ENV === "production" ? undefined : "cheap-module-source-map",
  entry: "./frontend/index.ts",
  devServer: {
    port: 3929,
    open: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public"),
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Union Bug",
    }),
  ],
};
