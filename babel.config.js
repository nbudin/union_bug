const baseConfig = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
    "@babel/preset-typescript",
  ],
};

const browserConfig = {
  ...baseConfig,
  presets: [["@babel/preset-env", { modules: false }], ...baseConfig.presets],
};

const testConfig = {
  ...baseConfig,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    ...baseConfig.presets,
  ],
};

module.exports = {
  ...browserConfig,
  env: {
    test: {
      ...testConfig,
    },
  },
};
