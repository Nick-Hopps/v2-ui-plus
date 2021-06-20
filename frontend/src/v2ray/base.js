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
  DsStreamSettings,
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
      case InboundProtocols.VMESS:
        return VmessSettings.fromJson(json);
      case InboundProtocols.VLESS:
        return VLESSSettings.fromJson(json);
      case InboundProtocols.TROJAN:
        return TrojanSettings.fromJson(json);
      case InboundProtocols.SHADOWSOCKS:
        return ShadowsocksSettings.fromJson(json);
      case InboundProtocols.DOKODEMO:
        return DokodemoSettings.fromJson(json);
      case InboundProtocols.MTPROTO:
        return MtprotoSettings.fromJson(json);
      case InboundProtocols.SOCKS:
        return SocksSettings.fromJson(json);
      case InboundProtocols.HTTP:
        return HttpSettings.fromJson(json);
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
    tlsSettings = new TlsStreamSettings(),
    tcpSettings = new TcpStreamSettings(),
    kcpSettings = new KcpStreamSettings(),
    wsSettings = new WsStreamSettings(),
    httpSettings = new HttpStreamSettings(),
    quicSettings = new QuicStreamSettings(),
    grpcSettings = new GrpcStreamSettings()
  ) {
    super();
    this.network = network;
    if (security === "xtls") {
      this.security = "tls";
      this._is_xtls = true;
    } else {
      this.security = security;
      this._is_xtls = false;
    }
    this.tls = tlsSettings;
    this.tcp = tcpSettings;
    this.kcp = kcpSettings;
    this.ws = wsSettings;
    this.http = httpSettings;
    this.quic = quicSettings;
    this.grpc = grpcSettings;
  }

  get is_xtls() {
    return this.security === "tls" && this.network === "tcp" && this._is_xtls;
  }

  set is_xtls(is_xtls) {
    this._is_xtls = is_xtls;
  }

  static fromJson(json = {}) {
    let tls;
    if (json.security === "xtls") {
      tls = TlsStreamSettings.fromJson(json.xtlsSettings);
    } else {
      tls = TlsStreamSettings.fromJson(json.tlsSettings);
    }
    return new StreamSettings(
      json.network,
      json.security,
      tls,
      TcpStreamSettings.fromJson(json.tcpSettings),
      KcpStreamSettings.fromJson(json.kcpSettings),
      WsStreamSettings.fromJson(json.wsSettings),
      HttpStreamSettings.fromJson(json.httpSettings),
      QuicStreamSettings.fromJson(json.quicSettings),
      GrpcStreamSettings.fromJson(json.grpcSettings)
    );
  }

  toJson() {
    let network = this.network;
    let security = this.security;
    if (this.is_xtls) {
      security = "xtls";
    }
    return {
      network: network,
      security: security,
      tlsSettings:
        this.security === "tls" && ["tcp", "ws", "http", "quic"].indexOf(network) >= 0 && !this.is_xtls
          ? this.tls.toJson()
          : undefined,
      xtlsSettings: this.is_xtls ? this.tls.toJson() : undefined,
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
