import { V2rayBase } from "../base";

export class TcpStreamSettings extends V2rayBase {
  constructor(type = "none", request = new TcpRequest(), response = new TcpResponse()) {
    super();
    this.type = type;
    this.request = request;
    this.response = response;
  }

  static fromJson(json = {}) {
    let header = json.header;
    if (!header) {
      header = {};
    }
    return new TcpStreamSettings(
      header.type,
      TcpRequest.fromJson(header.request),
      TcpResponse.fromJson(header.response)
    );
  }
}

class TcpRequest extends V2rayBase {
  constructor(version = "1.1", method = "GET", path = ["/"], headers = []) {
    super();
    this.version = version;
    this.method = method;
    this.path = path.length === 0 ? ["/"] : path;
    this.headers = headers;
  }

  addPath(path) {
    this.path.push(path);
  }

  removePath(index) {
    this.path.splice(index, 1);
  }

  addHeader(name, value) {
    this.headers.push({ name: name, value: value });
  }

  removeHeader(index) {
    this.headers.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new TcpStreamSettings.TcpRequest(json.version, json.method, json.path, V2rayBase.toHeaders(json.headers));
  }
}

class TcpResponse extends V2rayBase {
  constructor(version = "1.1", status = "200", reason = "OK", headers = []) {
    super();
    this.version = version;
    this.status = status;
    this.reason = reason;
    this.headers = headers;
  }

  addHeader(name, value) {
    this.headers.push({ name: name, value: value });
  }

  removeHeader(index) {
    this.headers.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new TcpStreamSettings.TcpResponse(json.version, json.status, json.reason, V2rayBase.toHeaders(json.headers));
  }
}
