import { InboundProtocols } from "./v2_constant/constants";
import { V2rayBase, Settings, StreamSettings, Sniffing } from "./v2_inbound/base";
import { isEmpty, base64 } from "@/util/utils";

export class Inbound extends V2rayBase {
  constructor(
    user_id = null,
    enable = true,
    listen = "0.0.0.0",
    port = 1080,
    protocol = InboundProtocols.VMESS,
    settings = new Settings().settings,
    streamSettings = new StreamSettings(),
    tag = "",
    sniffing = new Sniffing(),
    remark = ""
  ) {
    super();
    this.user_id = user_id;
    this.listen = listen;
    this.port = port;
    this.protocol = protocol;
    this.settings = settings;
    this.stream = streamSettings;
    this.tag = tag;
    this.sniffing = sniffing;
    this.remark = remark;
    this.enable = enable;
  }

  _genVmessLink(address = "") {
    if (this.protocol !== InboundProtocols.VMESS) {
      return "";
    }
    let network = this.stream.network;
    let type = "none";
    let host = "";
    let path = "";
    if (network === "tcp") {
      let tcp = this.stream.tcp;
      type = tcp.type;
      if (type === "http") {
        let request = tcp.request;
        path = request.path.join(",");
        let index = request.headers.findIndex((header) => header.name.toLowerCase() === "host");
        if (index >= 0) {
          host = request.headers[index].value;
        }
      }
    } else if (network === "kcp") {
      let kcp = this.stream.kcp;
      type = kcp.type;
      path = kcp.seed;
    } else if (network === "ws") {
      let ws = this.stream.ws;
      path = ws.path;
      let index = ws.headers.findIndex((header) => header.name.toLowerCase() === "host");
      if (index >= 0) {
        host = ws.headers[index].value;
      }
    } else if (network === "http") {
      network = "h2";
      path = this.stream.http.path;
      host = this.stream.http.host.join(",");
    } else if (network === "quic") {
      type = this.stream.quic.type;
      host = this.stream.quic.security;
      path = this.stream.quic.key;
    }

    if (this.stream.security === "tls") {
      if (!isEmpty(this.stream.tls.server)) {
        address = this.stream.tls.server;
      }
    }

    let obj = {
      v: "2",
      ps: this.remark,
      add: address,
      port: this.port,
      id: this.settings.vmesses[0].id,
      aid: this.settings.vmesses[0].alterId,
      net: network,
      type: type,
      host: host,
      path: path,
      tls: this.stream.security,
    };
    return "vmess://" + base64(JSON.stringify(obj, null, 2));
  }

  _genVLESSLink(address = "") {
    const settings = this.settings;
    const uuid = settings.vlesses[0].id;
    const port = this.port;
    const type = this.stream.network;
    const params = new Map();
    params.set("type", this.stream.network);
    params.set("security", this.stream.security);
    switch (type) {
      case "tcp": {
        const tcp = this.stream.tcp;
        if (tcp.type === "http") {
          const request = tcp.request;
          params.set("path", request.path.join(","));
          const index = request.headers.findIndex((header) => header.name.toLowerCase() === "host");
          if (index >= 0) {
            const host = request.headers[index].value;
            params.set("host", host);
          }
        }
        break;
      }
      case "kcp": {
        const kcp = this.stream.kcp;
        params.set("headerType", kcp.type);
        params.set("seed", kcp.seed);
        break;
      }
      case "ws": {
        const ws = this.stream.ws;
        params.set("path", ws.path);
        const index = ws.headers.findIndex((header) => header.name.toLowerCase() === "host");
        if (index >= 0) {
          const host = ws.headers[index].value;
          params.set("host", host);
        }
        break;
      }
      case "http": {
        const http = this.stream.http;
        params.set("path", http.path);
        params.set("host", http.host);
        break;
      }
      case "quic": {
        const quic = this.stream.quic;
        params.set("quicSecurity", quic.security);
        params.set("key", quic.key);
        params.set("headerType", quic.type);
        break;
      }
    }

    if (this.stream.security === "tls") {
      if (!isEmpty(this.stream.tls.server)) {
        address = this.stream.tls.server;
        params.set("sni", address);
      }
    }

    for (const [key, value] of params) {
      switch (key) {
        case "host":
        case "path":
        case "seed":
        case "key":
        case "alpn":
          params.set(key, encodeURIComponent(value));
          break;
      }
    }

    const link = `vless://${uuid}@${address}:${port}`;
    const url = new URL(link);
    for (const [key, value] of params) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  _genSSLink(address = "") {
    let settings = this.settings;
    const server = this.stream.tls.server;
    if (!isEmpty(server)) {
      address = server;
    }
    return (
      "ss://" +
      base64(settings.method + ":" + settings.password + "@" + address + ":" + this.port, true) +
      "#" +
      encodeURIComponent(this.remark)
    );
  }

  _genTrojanLink(address = "") {
    let settings = this.settings;
    return `trojan://${settings.clients[0].password}@${address}:${this.port}#${encodeURIComponent(this.remark)}`;
  }

  genLink(address = "") {
    switch (this.protocol) {
      case InboundProtocols.VMESS:
        return this._genVmessLink(address);
      case InboundProtocols.VLESS:
        return this._genVLESSLink(address);
      case InboundProtocols.SHADOWSOCKS:
        return this._genSSLink(address);
      case InboundProtocols.TROJAN:
        return this._genTrojanLink(address);
      default:
        return "";
    }
  }

  static fromJson(json = {}) {
    return new Inbound(
      json.user_id,
      json.enable,
      json.listen,
      json.port,
      json.protocol,
      Settings.fromJson(json.protocol, json.settings),
      StreamSettings.fromJson(json.streamSettings),
      json.tag,
      Sniffing.fromJson(json.sniffing),
      json.remark
    );
  }

  toJson() {
    let streamSettings;
    if (
      this.protocol === InboundProtocols.VMESS ||
      this.protocol === InboundProtocols.VLESS ||
      this.protocol === InboundProtocols.TROJAN ||
      this.protocol === InboundProtocols.SHADOWSOCKS
    ) {
      streamSettings = this.stream.toJson();
    }
    return {
      user_id: this.user_id,
      enable: this.enable,
      listen: this.listen,
      port: this.port,
      protocol: this.protocol,
      settings: this.settings.toJson(),
      streamSettings: streamSettings,
      tag: this.tag,
      sniffing: this.sniffing.toJson(),
      remark: this.remark,
    };
  }
}
