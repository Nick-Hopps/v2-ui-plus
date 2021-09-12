import { clone, isEmpty, isArrEmpty } from "@/util/utils";
import { InboundProtocols } from "../v2_constant/constants";
import * as SettingsConfig from "./Settings";
import * as StreamSettingsConfig from "./StreamSettings";

export class Settings {
  constructor(protocol) {
    this.settings = Settings.getSettings(protocol);
  }

  static getSettings(protocol) {
    switch (protocol) {
      case InboundProtocols.DOKODEMO:
        return new SettingsConfig.DokodemoSettings(protocol);
      case InboundProtocols.HTTP:
        return new SettingsConfig.HttpSettings(protocol);
      case InboundProtocols.SOCKS:
        return new SettingsConfig.SocksSettings(protocol);
      case InboundProtocols.VLESS:
        return new SettingsConfig.VlessSettings(protocol);
      case InboundProtocols.VMESS:
        return new SettingsConfig.VmessSettings(protocol);
      case InboundProtocols.TROJAN:
        return new SettingsConfig.TrojanSettings(protocol);
      case InboundProtocols.SHADOWSOCKS:
        return new SettingsConfig.ShadowsocksSettings(protocol);
      default:
        return null;
    }
  }

  static fromJson(protocol, json = {}) {
    return new Settings(protocol).fromJson(json);
  }

  toJson() {
    return this.settings.toJson();
  }
}

export class StreamSettings {
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

export class Sniffing {
  constructor(enabled = true, destOverride = ["http", "tls"]) {
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
