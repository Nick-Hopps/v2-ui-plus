import { V2rayBase } from "../base";

export class TcpStreamSettings extends V2rayBase {
  constructor(acceptProxyProtocol = false, header = { type: "none" }) {
    super();
    this.acceptProxyProtocol = acceptProxyProtocol;
    this.header = header;
  }

  static fromJson(json = {}) {
    if (json.header.type === "http") {
      if (json.header.request) {
        json.header.request = TcpRequest.fromJson(json.header.request);
      }
      if (json.header.response) {
        json.header.response = TcpResponse.fromJson(json.header.response);
      }
    }

    return new TcpStreamSettings(json.acceptProxyProtocol, json.header);
  }
}

class TcpRequest extends V2rayBase {
  constructor(version = "1.1", method = "GET", path = ["/"], headers = {}) {
    super();
    this.version = version;
    this.method = method;
    this.path = path;
    this.headers = headers;
  }

  addPath(path) {
    this.path.push(path);
  }

  removePath(index) {
    this.path.splice(index, 1);
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
    return new TcpStreamSettings.TcpRequest(json.version, json.method, json.path, json.headers);
  }
}

class TcpResponse extends V2rayBase {
  constructor(version = "1.1", status = "200", reason = "OK", headers = {}) {
    super();
    this.version = version;
    this.status = status;
    this.reason = reason;
    this.headers = headers;
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
    return new TcpStreamSettings.TcpResponse(json.version, json.status, json.reason, json.headers);
  }
}
