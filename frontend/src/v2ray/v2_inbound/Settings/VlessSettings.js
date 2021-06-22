import { InboundProtocols, VlessFlow } from "../../v2_constant/constants";
import { V2CommonClass, Settings } from "../../base";

export class VlessSettings extends Settings {
  constructor(protocol, vlesses = [new Vless()], decryption = "none", fallbacks = []) {
    super(protocol);
    this.vlesses = vlesses;
    this.decryption = decryption;
    this.fallbacks = fallbacks;
  }

  addFallback() {
    this.fallbacks.push(new Fallback());
  }

  delFallback(index) {
    this.fallbacks.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new VlessSettings(
      InboundProtocols.VLESS,
      json.clients.map((client) => Vless.fromJson(client)),
      json.decryption,
      Fallback.fromJson(json.fallbacks)
    );
  }

  toJson() {
    return {
      clients: VlessSettings.toJsonArray(this.vlesses),
      decryption: this.decryption,
      fallbacks: VlessSettings.toJsonArray(this.fallbacks),
    };
  }
};

class Vless extends V2CommonClass {
  constructor(id = randomUUID(), flow = VlessFlow.DIRECT) {
    super();
    this.id = id;
    this.flow = flow;
  }

  static fromJson(json = {}) {
    return new Vless(json.id, json.flow);
  }
};

class Fallback extends V2CommonClass {
  constructor(name = "", alpn = "", path = "", dest = "", xver = 0) {
    super();
    this.name = name;
    this.alpn = alpn;
    this.path = path;
    this.dest = dest;
    this.xver = xver;
  }

  static fromJson(json = []) {
    const fallbacks = [];
    for (let fallback of json) {
      fallbacks.push(
        new Fallback(fallback.name, fallback.alpn, fallback.path, fallback.dest, fallback.xver)
      );
    }
    return fallbacks;
  }

  toJson() {
    let xver = this.xver;
    if (!Number.isInteger(xver)) {
      xver = 0;
    }
    return {
      name: this.name,
      alpn: this.alpn,
      path: this.path,
      dest: this.dest,
      xver: xver,
    };
  }
};
