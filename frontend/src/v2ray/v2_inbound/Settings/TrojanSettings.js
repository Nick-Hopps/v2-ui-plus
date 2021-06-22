import { InboundProtocols } from "../../v2_constant/constants";
import { V2CommonClass, Settings } from "../../base";

export class TrojanSettings extends Settings {
  constructor(protocol, clients = [new Client()]) {
    super(protocol);
    this.clients = clients;
  }

  static fromJson(json = {}) {
    const clients = [];
    for (const c of json.clients) {
      clients.push(Client.fromJson(c));
    }
    return new TrojanSettings(InboundProtocols.TROJAN, clients);
  }

  toJson() {
    return {
      clients: TrojanSettings.toJsonArray(this.clients),
    };
  }
};

class Client extends V2CommonClass {
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
    return new Client(json.password);
  }
};
