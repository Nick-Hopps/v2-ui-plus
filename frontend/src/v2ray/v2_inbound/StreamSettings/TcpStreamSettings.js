import { V2CommonClass } from "../../base";

export class TcpStreamSettings extends V2CommonClass {
  constructor(
    type = "none",
    request = new TcpRequest(),
    response = new TcpResponse()
  ) {
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

  toJson() {
    return {
      header: {
        type: this.type,
        request: this.type === "http" ? this.request.toJson() : undefined,
        response: this.type === "http" ? this.response.toJson() : undefined,
      },
    };
  }
}

class TcpRequest extends V2CommonClass {
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
    return new TcpStreamSettings.TcpRequest(
      json.version,
      json.method,
      json.path,
      V2CommonClass.toHeaders(json.headers)
    );
  }

  toJson() {
    return {
      method: this.method,
      path: clone(this.path),
      headers: V2CommonClass.toV2Headers(this.headers),
    };
  }
};

class TcpResponse extends V2CommonClass {
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
    return new TcpStreamSettings.TcpResponse(
      json.version,
      json.status,
      json.reason,
      V2CommonClass.toHeaders(json.headers)
    );
  }

  toJson() {
    return {
      version: this.version,
      status: this.status,
      reason: this.reason,
      headers: V2CommonClass.toV2Headers(this.headers),
    };
  }
};
