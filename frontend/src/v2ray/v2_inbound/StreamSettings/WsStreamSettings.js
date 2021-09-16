import { V2rayBase } from "../base";

export class WsStreamSettings extends V2rayBase {
  constructor(
    acceptProxyProtocol = false,
    path = "/",
    headers = {},
    maxEarlyData: 1024,
    useBrowserForwarding: false,
    earlyDataHeaderName = ""
  ) {
    super();
    this.acceptProxyProtocol = acceptProxyProtocol;
    this.path = path;
    this.headers = headers;
    this.maxEarlyData = maxEarlyData;
    this.useBrowserForwarding = useBrowserForwarding;
    this.earlyDataHeaderName = earlyDataHeaderName;
  }

  addHeader(name, value) {
    if (this.headers[name]) {
      this.headers[name].push(value);
    } else {
      this.headers[name] = [value];
    }
  }

  removeHeader(name, index) {
    if (name && !index) {
      delete this.headers[name];
    } else if (name && index) {
      this.headers[name].splice(index, 1);
    }
  }

  static fromJson(json = {}) {
    return new WsStreamSettings(
      json.acceptProxyProtocol,
      json.path,
      json.headers,
      json.maxEarlyData,
      json.useBrowserForwarding,
      json.earlyDataHeaderName
    );
  }
}
