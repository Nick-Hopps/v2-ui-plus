export class QuicStreamSettings extends V2CommonClass {
  constructor(security = VmessMethods.NONE, key = "", type = "none") {
    super();
    this.security = security;
    this.key = key;
    this.type = type;
  }

  static fromJson(json = {}) {
    return new QuicStreamSettings(json.security, json.key, json.header ? json.header.type : "none");
  }

  toJson() {
    return {
      security: this.security,
      key: this.key,
      header: {
        type: this.type,
      },
    };
  }
}
