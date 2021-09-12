import axios from "axios";
import qs from "qs";

axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.interceptors.request.use(
  (config) => {
    config.data = qs.stringify(config.data, {
      arrayFormat: "repeat",
    });
    return config;
  },
  (error) => Promise.reject(error)
);

export default (app) => {
  function commonSuccess(response, callback) {
    let data = response.data;
    if (data && typeof data === "object") {
      if (data.success === false) {
        app.$message.error(data.msg);
      } else if (data.success === true) {
        app.$message.success(data.msg);
      }
    }
    callback(data, response);
  }

  function commonError(e, callback) {
    console.log(e);
    app.$message.error("网络错误，请检查网络连接");
    callback(e);
  }

  window.post = (options) => {
    axios
      .post(options.url, options.data)
      .then((response) => commonSuccess(response, options.success))
      .catch((e) => commonError(e, options.error));
  };

  window.get = (options) => {
    axios
      .get(options.url, options.data)
      .then((response) => commonSuccess(response, options.success))
      .catch((e) => commonError(e, options.error));
  };
};
