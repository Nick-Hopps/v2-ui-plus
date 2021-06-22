import { V2CommonClass } from "../../base";

export class HttpStreamSettings extends V2CommonClass {
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

  toJson() {
    let host = [];
    for (let i = 0; i < this.host.length; ++i) {
      if (!isEmpty(this.host[i])) {
        host.push(this.host[i]);
      }
    }
    return {
      path: this.path,
      host: host,
    };
  }
}
