import { ShadowsocksMethods } from "../../v2_constant/constants";
import { randomString } from "@/util/utils";
import { V2rayBase } from "../base";

export class ShadowsocksSettings extends V2rayBase {
  constructor(
    email = "",
    method = ShadowsocksMethods.AES_256_GCM,
    password = randomString(10),
    level = 0,
    network = "tcp,udp",
    ivCheck = false
  ) {
    super();
    this.email = email;
    this.method = method;
    this.password = password;
    this.level = level;
    this.network = network;
    this.ivCheck = ivCheck;
  }

  static fromJson(json = {}) {
    return new ShadowsocksSettings(json.email, json.method, json.password, json.level, json.network, json.ivCheck);
  }
}
