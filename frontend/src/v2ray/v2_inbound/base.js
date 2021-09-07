import { InboundProtocols } from "../v2_constant/constants";
import SettingsConfig from "./Settings";
import StreamSettingsConfig from "./StreamSettings";
import { clone, isEmpty, isArrEmpty } from "@/util/utils";

class V2rayBase {
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

  static fromJson() {
    return new V2rayBase();
  }

  toString(format = true) {
    return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
  }

  toJson() {
    return this;
  }
}

class Settings {
  constructor(protocol) {
    this.protocol = protocol;
    switch (protocol) {
      case InboundProtocols.DOKODEMO: {
        let settings = new SettingsConfig.DokodemoSettings(protocol).toJson();
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      case InboundProtocols.HTTP: {
        let settings = new SettingsConfig.HttpSettings(protocol);
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      case InboundProtocols.SOCKS: {
        let settings = new SettingsConfig.SocksSettings(protocol);
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      case InboundProtocols.VLESS: {
        let settings = new SettingsConfig.VlessSettings(protocol);
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      case InboundProtocols.VMESS: {
        let settings = new SettingsConfig.VmessSettings(protocol);
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      case InboundProtocols.TROJAN: {
        let settings = new SettingsConfig.TrojanSettings(protocol);
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      case InboundProtocols.SHADOWSOCKS: {
        let settings = new SettingsConfig.ShadowsocksSettings(protocol);
        for (let key in settings) {
          this[key] = settings[key];
        }
        break;
      }
      default:
        return null;
    }
  }

  static fromJson(protocol, json) {
    return new Settings(protocol, json);
  }

  toJson() {
    let jsonObj = {};
    for (let key in this) {
      jsonObj[key] = this[key];
    }
    return jsonObj;
  }
}

class StreamSettings {
  constructor(
    network = "tcp",
    security = "none",
    tlsSettings = null,
    tcpSettings = null,
    kcpSettings = null,
    wsSettings = null,
    httpSettings = null,
    quicSettings = null,
    grpcSettings = null
  ) {
    this.network = network;
    this.security = security;
    this.tls = tlsSettings;
    this.tcp = tcpSettings;
    this.kcp = kcpSettings;
    this.ws = wsSettings;
    this.http = httpSettings;
    this.quic = quicSettings;
    this.grpc = grpcSettings;
  }

  static fromJson(json = {}) {
    return new StreamSettings(
      json.network,
      json.security,
      json.security === "xtls"
        ? StreamSettingsConfig.XtlsStreamSettings.fromJson(json.tlsSettings)
        : StreamSettingsConfig.TlsStreamSettings.fromJson(json.tlsSettings),
      StreamSettingsConfig.TcpStreamSettings.fromJson(json.tcpSettings),
      StreamSettingsConfig.KcpStreamSettings.fromJson(json.kcpSettings),
      StreamSettingsConfig.WsStreamSettings.fromJson(json.wsSettings),
      StreamSettingsConfig.HttpStreamSettings.fromJson(json.httpSettings),
      StreamSettingsConfig.QuicStreamSettings.fromJson(json.quicSettings),
      StreamSettingsConfig.GrpcStreamSettings.fromJson(json.grpcSettings)
    );
  }

  toJson() {
    return {
      network: this.network,
      security: this.security,
      tlsSettings:
        this.security !== "none" && ["tcp", "ws", "http", "quic"].indexOf(this.network) >= 0
          ? this.tls.toJson()
          : undefined,
      tcpSettings: this.network === "tcp" ? this.tcp.toJson() : undefined,
      kcpSettings: this.network === "kcp" ? this.kcp.toJson() : undefined,
      wsSettings: this.network === "ws" ? this.ws.toJson() : undefined,
      httpSettings: this.network === "http" ? this.http.toJson() : undefined,
      quicSettings: this.network === "quic" ? this.quic.toJson() : undefined,
      grpcSettings: this.network === "grpc" ? this.grpc.toJson() : undefined,
    };
  }
}

class Sniffing extends V2rayBase {
  constructor(enabled = true, destOverride = ["http", "tls"]) {
    super();
    this.enabled = enabled;
    this.destOverride = destOverride;
  }

  static fromJson(json = {}) {
    let destOverride = clone(json.destOverride);
    if (!isEmpty(destOverride) && !isArrEmpty(destOverride)) {
      if (isEmpty(destOverride[0])) {
        destOverride = ["http", "tls"];
      }
    }
    return new Sniffing(!!json.enabled, destOverride);
  }

  toJson() {
    return {
      enabled: this.enabled,
      destOverride: this.destOverride,
    };
  }
}

export { V2rayBase, Settings, StreamSettings, Sniffing };
