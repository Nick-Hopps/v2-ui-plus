import { VmessSecurity } from "../../v2_constant/constants";
import { V2rayBase } from "../base";

export class QuicStreamSettings extends V2rayBase {
  constructor(security = VmessSecurity.NONE, key = "", header = { type: "none" }) {
    super();
    this.security = security;
    this.key = key;
    this.header = header;
  }

  static fromJson(json = {}) {
    return new QuicStreamSettings(json.security, json.key, json.header);
  }
}
