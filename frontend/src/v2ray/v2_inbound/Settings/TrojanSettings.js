import { randomString } from "@/util/utils";
import { V2rayBase } from "../base";

export class TrojanSettings extends V2rayBase {
  constructor(clients = [new Client()], fallbacks = [new Fallback()]) {
    super();
    this.clients = clients;
    this.fallbacks = fallbacks;
  }

  addClient(client) {
    this.clients.push(new Client(client.password, client.email, client.level));
  }

  removeClient(index) {
    this.clients.splice(index, 1);
  }

  addFallback(fallback) {
    this.fallbacks.push(new Fallback(fallback.alpn, fallback.path, fallback.dest, fallback.xver));
  }

  removeFallback(index) {
    this.fallbacks.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new TrojanSettings(
      json.clients.map((client) => Client.fromJson(client)),
      json.fallbacks.map((fallback) => Fallback.fromJson(fallback))
    );
  }
}

class Client extends V2rayBase {
  constructor(password = randomString(10), email = "", level = 0) {
    super();
    this.password = password;
    this.email = email;
    this.level = level;
  }

  static fromJson(json = {}) {
    return new Client(json.password, json.email, json.level);
  }
}

class Fallback extends V2rayBase {
  constructor(alpn = "", path = "", dest = 80, xver = 0) {
    super();
    this.alpn = alpn;
    this.path = path;
    this.dest = dest;
    this.xver = xver;
  }

  static fromJson(json = {}) {
    return new Fallback(json.alpn, json.path, json.dest, json.xver);
  }
}
