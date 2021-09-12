import { V2rayBase } from "../base";

export class WsStreamSettings extends V2rayBase {
  constructor(path = "/", headers = []) {
    super();
    this.path = path;
    this.headers = headers;
  }

  addHeader(name, value) {
    this.headers.push({ name: name, value: value });
  }

  removeHeader(index) {
    this.headers.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new WsStreamSettings(json.path, V2rayBase.toHeaders(json.headers));
  }
}
