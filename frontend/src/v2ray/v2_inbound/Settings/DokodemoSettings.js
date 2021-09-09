import { V2rayBase } from "../base";

export class DokodemoSettings extends V2rayBase {
  constructor(address, port, network = "tcp,udp") {
    super();
    this.address = address;
    this.port = port;
    this.network = network;
  }

  static fromJson(json = {}) {
    return new DokodemoSettings(json.address, json.port, json.network);
  }

  toJson() {
    return {
      address: this.address,
      port: this.port,
      network: this.network,
    };
  }
}
