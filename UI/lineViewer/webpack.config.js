const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "k45",
    projectName: "xtm-line-viewer",
    webpackConfigEnv,
    argv
  });
  defaultConfig.output.path = __dirname + '\\..\\dist'
  return defaultConfig;
};
