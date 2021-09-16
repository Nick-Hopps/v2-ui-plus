import { V2rayBase } from "../base";

export class HttpStreamSettings extends V2rayBase {
  constructor(host = [""], path = "/", method = "PUT", headers = {}) {
    super();
    this.host = host;
    this.path = path;
    this.method = method;
    this.headers = headers;
  }

  addHost(host) {
    this.host.push(host);
  }

  removeHost(index) {
    this.host.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new HttpStreamSettings(json.host, json.path, json.method, json.headers);
  }
}
