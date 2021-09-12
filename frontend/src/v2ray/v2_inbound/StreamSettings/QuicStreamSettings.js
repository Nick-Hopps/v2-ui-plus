import { VmessSecurity } from "../../v2_constant/constants";
import { V2rayBase } from "../base";

export class QuicStreamSettings extends V2rayBase {
  constructor(security = VmessSecurity.NONE, key = "", type = "none") {
    super();
    this.security = security;
    this.key = key;
    this.type = type;
  }

  static fromJson(json = {}) {
    return new QuicStreamSettings(json.security, json.key, json.header ? json.header.type : "none");
  }
}
