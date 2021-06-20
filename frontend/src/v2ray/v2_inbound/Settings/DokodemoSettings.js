Inbound.DokodemoSettings = class extends Inbound.Settings {
  constructor(protocol, address, port, network = "tcp,udp") {
    super(protocol);
    this.address = address;
    this.port = port;
    this.network = network;
  }

  static fromJson(json = {}) {
    return new Inbound.DokodemoSettings(InboundProtocols.DOKODEMO, json.address, json.port, json.network);
  }

  toJson() {
    return {
      address: this.address,
      port: this.port,
      network: this.network,
    };
  }
};
