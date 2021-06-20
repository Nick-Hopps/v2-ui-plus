Inbound.ShadowsocksSettings = class extends Inbound.Settings {
  constructor(protocol, method = ShadowsocksMethods.AES_256_GCM, password = randomSeq(10), network = "tcp,udp") {
    super(protocol);
    this.method = method;
    this.password = password;
    this.network = network;
  }

  static fromJson(json = {}) {
    return new Inbound.ShadowsocksSettings(InboundProtocols.SHADOWSOCKS, json.method, json.password, json.network);
  }

  toJson() {
    return {
      method: this.method,
      password: this.password,
      network: this.network,
    };
  }
};
