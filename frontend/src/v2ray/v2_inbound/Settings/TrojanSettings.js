Inbound.TrojanSettings = class extends Inbound.Settings {
  constructor(protocol, clients = [new Inbound.TrojanSettings.Client()]) {
    super(protocol);
    this.clients = clients;
  }

  toJson() {
    return {
      clients: Inbound.TrojanSettings.toJsonArray(this.clients),
    };
  }

  static fromJson(json = {}) {
    const clients = [];
    for (const c of json.clients) {
      clients.push(Inbound.TrojanSettings.Client.fromJson(c));
    }
    return new Inbound.TrojanSettings(InboundProtocols.TROJAN, clients);
  }
};
Inbound.TrojanSettings.Client = class extends V2CommonClass {
  constructor(password = randomSeq(10)) {
    super();
    this.password = password;
  }

  toJson() {
    return {
      password: this.password,
    };
  }

  static fromJson(json = {}) {
    return new Inbound.TrojanSettings.Client(json.password);
  }
};
