import { V2rayBase } from "../base";

export class HttpStreamSettings extends V2rayBase {
  constructor(path = "/", host = [""]) {
    super();
    this.path = path;
    this.host = host.length === 0 ? [""] : host;
  }

  addHost(host) {
    this.host.push(host);
  }

  removeHost(index) {
    this.host.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new HttpStreamSettings(json.path, json.host);
  }
}
