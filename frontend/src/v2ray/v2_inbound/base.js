import { isEmpty } from "@/util/utils";

export class V2rayBase {
  static toJsonArray(arr) {
    return arr.map((obj) => obj.toJson());
  }

  static toHeaders(v2Headers) {
    let newHeaders = [];
    if (v2Headers) {
      Object.keys(v2Headers).forEach((key) => {
        let values = v2Headers[key];
        if (typeof values === "string") {
          newHeaders.push({ name: key, value: values });
        } else {
          for (let i = 0; i < values.length; ++i) {
            newHeaders.push({ name: key, value: values[i] });
          }
        }
      });
    }
    return newHeaders;
  }

  static toV2Headers(headers, arr = true) {
    let v2Headers = {};
    if (headers) {
      for (let i = 0; i < headers.length; ++i) {
        let name = headers[i].name;
        let value = headers[i].value;
        if (isEmpty(name) || isEmpty(value)) {
          continue;
        }
        if (!(name in v2Headers)) {
          v2Headers[name] = arr ? [value] : value;
        } else {
          if (arr) {
            v2Headers[name].push(value);
          } else {
            v2Headers[name] = value;
          }
        }
      }
    }
    return v2Headers;
  }

  toJson() {
    return this;
  }

  toString(format = true) {
    return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
  }
}
