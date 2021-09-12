import { VlessFlow } from "../../v2_constant/constants";
import { randomUUID } from "@/util/utils";
import { V2rayBase } from "../base";

export class VlessSettings extends V2rayBase {
  constructor(clients = [new Client()], decryption = "none", fallbacks = [new Fallback()]) {
    super();
    this.clients = clients;
    this.decryption = decryption;
    this.fallbacks = fallbacks;
  }

  addClient(client) {
    this.clients.push(new Client(client.id, client.level, client.email, client.flow));
  }

  removeClient(index) {
    this.clients.splice(index, 1);
  }

  addFallback(fallback) {
    this.fallbacks.push(new Fallback(fallback.name, fallback.alpn, fallback.path, fallback.dest, fallback.xver));
  }

  removeFallback(index) {
    this.fallbacks.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new VlessSettings(
      json.clients.map((client) => Client.fromJson(client)),
      json.decryption,
      json.fallbacks.map((fallback) => Fallback.fromJson(fallback))
    );
  }
}

class Client extends V2rayBase {
  constructor(id = randomUUID(), level = 0, email = "", flow = VlessFlow.DIRECT) {
    super();
    this.id = id;
    this.level = level;
    this.email = email;
    this.flow = flow;
  }

  static fromJson(json = {}) {
    return new Client(json.id, json.level, json.email, json.flow);
  }
}

class Fallback extends V2rayBase {
  constructor(name = "", alpn = "", path = "", dest = 80, xver = 0) {
    super();
    this.name = name;
    this.alpn = alpn;
    this.path = path;
    this.dest = dest;
    this.xver = xver;
  }

  static fromJson(json = {}) {
    return new Fallback(json.name, json.alpn, json.path, json.dest, json.xver);
  }
}
