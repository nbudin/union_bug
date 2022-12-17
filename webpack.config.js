const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { env } = require("process");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: env.NODE_ENV === "production" ? "production" : "development",
  devtool:
    env.NODE_ENV === "production" ? undefined : "cheap-module-source-map",
  entry: "./frontend/index.tsx",
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
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: () => [require("autoprefixer")],
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Union Bug",
    }),
    new MiniCssExtractPlugin(),
  ],
};
