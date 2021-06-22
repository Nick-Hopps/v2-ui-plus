import { isEmpty } from "@/utils";
import { InboundProtocols } from "./v2_constant/constants";
import {
  DokodemoSettings,
  HttpSettings,
  SocksSettings,
  VlessSettings,
  VmessSettings,
  TrojanSettings,
  ShadowsocksSettings,
} from "./v2_inbound/Settings/Settings";
import {
  TcpStreamSettings,
  TlsStreamSettings,
  XtlsStreamSettings,
  KcpStreamSettings,
  WsStreamSettings,
  HttpStreamSettings,
  QuicStreamSettings,
  GrpcStreamSettings,
} from "./v2_inbound/StreamSettings/StreamSettings";

class V2CommonClass {
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
    return new V2CommonClass();
  }

  toJson() {
    return this;
  }

  toString(format = true) {
    return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
  }
}

class Settings extends V2CommonClass {
  constructor(protocol) {
    super();
    this.protocol = protocol;
  }

  static getSettings(protocol) {
    switch (protocol) {
      case InboundProtocols.DOKODEMO:
        return new DokodemoSettings(protocol);
      case InboundProtocols.HTTP:
        return new HttpSettings(protocol);
      case InboundProtocols.SOCKS:
        return new SocksSettings(protocol);
      case InboundProtocols.VLESS:
        return new VlessSettings(protocol);
      case InboundProtocols.VMESS:
        return new VmessSettings(protocol);
      case InboundProtocols.TROJAN:
        return new TrojanSettings(protocol);
      case InboundProtocols.SHADOWSOCKS:
        return new ShadowsocksSettings(protocol);
      default:
        return null;
    }
  }

  static fromJson(protocol, json) {
    switch (protocol) {
      case InboundProtocols.DOKODEMO:
        return DokodemoSettings.from(json);
      case InboundProtocols.HTTP:
        return HttpSettings.from(json);
      case InboundProtocols.SOCKS:
        return SocksSettings.from(json);
      case InboundProtocols.VLESS:
        return VlessSettings.from(json);
      case InboundProtocols.VMESS:
        return VmessSettings.from(json);
      case InboundProtocols.TROJAN:
        return TrojanSettings.from(json);
      case InboundProtocols.SHADOWSOCKS:
        return ShadowsocksSettings.from(json);
      default:
        return null;
    }
  }

  toJson() {
    return {};
  }
}

class StreamSettings extends V2CommonClass {
  constructor(
    network = "tcp",
    security = "none",
    tlsSettings = null,
    tcpSettings = new TcpStreamSettings(),
    kcpSettings = new KcpStreamSettings(),
    wsSettings = new WsStreamSettings(),
    httpSettings = new HttpStreamSettings(),
    quicSettings = new QuicStreamSettings(),
    grpcSettings = new GrpcStreamSettings()
  ) {
    super();
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
        ? XtlsStreamSettings.fromJson(json.tlsSettings)
        : TlsStreamSettings.fromJson(json.tlsSettings),
      TcpStreamSettings.fromJson(json.tcpSettings),
      KcpStreamSettings.fromJson(json.kcpSettings),
      WsStreamSettings.fromJson(json.wsSettings),
      HttpStreamSettings.fromJson(json.httpSettings),
      QuicStreamSettings.fromJson(json.quicSettings),
      GrpcStreamSettings.fromJson(json.grpcSettings)
    );
  }

  toJson() {
    return {
      network: this.network,
      security: this.security,
      tlsSettings: this.security !== "none" && ["tcp", "ws", "http", "quic"].indexOf(network) >= 0
          ? this.tls.toJson()
          : undefined,
      tcpSettings: network === "tcp" ? this.tcp.toJson() : undefined,
      kcpSettings: network === "kcp" ? this.kcp.toJson() : undefined,
      wsSettings: network === "ws" ? this.ws.toJson() : undefined,
      httpSettings: network === "http" ? this.http.toJson() : undefined,
      quicSettings: network === "quic" ? this.quic.toJson() : undefined,
      grpcSettings: network === "grpc" ? this.grpc.toJson() : undefined,
    };
  }
}

class Sniffing extends V2CommonClass {
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
}

export { V2CommonClass, Settings, StreamSettings, Sniffing };
