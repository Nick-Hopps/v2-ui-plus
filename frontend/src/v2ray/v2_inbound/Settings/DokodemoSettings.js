import { V2rayBase } from "../base";

export class DokodemoSettings extends V2rayBase {
  constructor(address, port, network = "tcp,udp", timeout = 0, followRedirect = false, userLevel = 0) {
    super();
    this.address = address;
    this.port = port;
    this.network = network;
    this.timeout = timeout;
    this.followRedirect = followRedirect;
    this.userLevel = userLevel;
  }

  static fromJson(json = {}) {
    return new DokodemoSettings(
      json.address,
      json.port,
      json.network,
      json.timeout,
      json.followRedirect,
      json.userLevel
    );
  }
}
