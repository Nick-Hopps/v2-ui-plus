export class GrpcStreamSettings extends V2CommonClass {
  constructor(serviceName = "") {
    super();
    this.serviceName = serviceName;
  }

  static fromJson(json = {}) {
    return new GrpcStreamSettings(json.serviceName);
  }

  toJson() {
    return {
      serviceName: this.serviceName,
    };
  }
}
