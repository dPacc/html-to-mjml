const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist/browser"),
    filename: "index.js",
    library: {
      name: "htmlToMjml",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      // Add Node.js core module polyfills
      fs: false,
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
      // Other core modules that might be needed
      buffer: false,
      stream: false,
      util: false,
      assert: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    "mjml-browser": {
      commonjs: "mjml-browser",
      commonjs2: "mjml-browser",
      amd: "mjml-browser",
      root: "mjml",
    },
    // Add these to handle Node.js specific modules in browser
    jsdom: "jsdom",
    mjml: "mjml",
  },
};
