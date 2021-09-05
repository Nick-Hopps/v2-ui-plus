// vue.config.js

const path = require("path");

module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias.set("@", path.join(__dirname, "src"));
  },
  configureWebpack: {
    externals: {
      base64: "Base64",
      clipBoard: "ClipboardJS",
      qrious: "QRious",
    },
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
