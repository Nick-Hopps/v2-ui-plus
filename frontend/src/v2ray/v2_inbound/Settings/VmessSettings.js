import { randomUUID } from "@/util/utils";
import { V2rayBase } from "../base";

export class VmessSettings extends V2rayBase {
  constructor(clients = [new Client()], detour = {}, defaultObj = {}, disableInsecureEncryption = false) {
    super();
    this.clients = clients;
    this.detour = detour;
    this.default = defaultObj;
    this.disableInsecure = disableInsecureEncryption;
  }

  addClient(client) {
    this.clients.push(client.id, client.level, client.alterId, client.email);
  }

  removeClient(index) {
    this.clients.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new VmessSettings(
      json.clients.map((client) => Client.fromJson(client)),
      json.detour,
      json.detour.to ? json.default : {},
      json.disableInsecureEncryption
    );
  }
}

class Client extends V2rayBase {
  constructor(id = randomUUID(), level = 0, alterId = 64, email = "") {
    super();
    this.id = id;
    this.level = level;
    this.alterId = alterId;
    this.email = email;
  }

  static fromJson(json = {}) {
    return new Client(json.id, json.level, json.alterId, json.email);
  }
}
