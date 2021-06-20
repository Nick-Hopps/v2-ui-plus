export class WsStreamSettings extends V2CommonClass {
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
    return new WsStreamSettings(json.path, V2CommonClass.toHeaders(json.headers));
  }

  toJson() {
    return {
      path: this.path,
      headers: V2CommonClass.toV2Headers(this.headers, false),
    };
  }
}
