// vue.config.js
const path = require("path");

module.exports = {
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => args);
    config.resolve.alias.set("@", path.join(__dirname, "src"));
  },
  css: {
    loaderOptions: {
      less: {
        // 解决 antd vue 按需加载报错
        javascriptEnabled: true,
      },
    },
  },
};
