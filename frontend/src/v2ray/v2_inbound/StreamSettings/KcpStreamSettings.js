import { randomString } from "@/util/utils";
import { V2rayBase } from "../base";

export class KcpStreamSettings extends V2rayBase {
  constructor(
    mtu = 1350,
    tti = 20,
    uplinkCapacity = 5,
    downlinkCapacity = 20,
    congestion = false,
    readBufferSize = 1,
    writeBufferSize = 1,
    header: { type: "none" },
    seed = randomString(10)
  ) {
    super();
    this.mtu = mtu;
    this.tti = tti;
    this.upCap = uplinkCapacity;
    this.downCap = downlinkCapacity;
    this.congestion = congestion;
    this.readBuffer = readBufferSize;
    this.writeBuffer = writeBufferSize;
    this.header = header;
    this.seed = seed;
  }

  static fromJson(json = {}) {
    return new KcpStreamSettings(
      json.mtu,
      json.tti,
      json.uplinkCapacity,
      json.downlinkCapacity,
      json.congestion,
      json.readBufferSize,
      json.writeBufferSize,
      json.header,
      json.seed
    );
  }
}
