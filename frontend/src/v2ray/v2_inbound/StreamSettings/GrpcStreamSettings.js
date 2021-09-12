import { V2rayBase } from "../base";

export class GrpcStreamSettings extends V2rayBase {
  constructor(serviceName = "") {
    super();
    this.serviceName = serviceName;
  }

  static fromJson(json = {}) {
    return new GrpcStreamSettings(json.serviceName);
  }
}
