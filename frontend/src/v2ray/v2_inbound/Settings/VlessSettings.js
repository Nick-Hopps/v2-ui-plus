Inbound.VLESSSettings = class extends Inbound.Settings {
  constructor(protocol, vlesses = [new Inbound.VLESSSettings.VLESS()], decryption = "none", fallbacks = []) {
    super(protocol);
    this.vlesses = vlesses;
    this.decryption = decryption;
    this.fallbacks = fallbacks;
  }

  addFallback() {
    this.fallbacks.push(new Inbound.VLESSSettings.Fallback());
  }

  delFallback(index) {
    this.fallbacks.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new Inbound.VLESSSettings(
      InboundProtocols.VLESS,
      json.clients.map((client) => Inbound.VLESSSettings.VLESS.fromJson(client)),
      json.decryption,
      Inbound.VLESSSettings.Fallback.fromJson(json.fallbacks)
    );
  }

  toJson() {
    return {
      clients: Inbound.VLESSSettings.toJsonArray(this.vlesses),
      decryption: this.decryption,
      fallbacks: Inbound.VLESSSettings.toJsonArray(this.fallbacks),
    };
  }
};
Inbound.VLESSSettings.VLESS = class extends V2CommonClass {
  constructor(id = randomUUID(), flow = VLESS_FLOW.DIRECT) {
    super();
    this.id = id;
    this.flow = flow;
  }

  static fromJson(json = {}) {
    return new Inbound.VLESSSettings.VLESS(json.id, json.flow);
  }
};
Inbound.VLESSSettings.Fallback = class extends V2CommonClass {
  constructor(name = "", alpn = "", path = "", dest = "", xver = 0) {
    super();
    this.name = name;
    this.alpn = alpn;
    this.path = path;
    this.dest = dest;
    this.xver = xver;
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

  static fromJson(json = []) {
    const fallbacks = [];
    for (let fallback of json) {
      fallbacks.push(
        new Inbound.VLESSSettings.Fallback(fallback.name, fallback.alpn, fallback.path, fallback.dest, fallback.xver)
      );
    }
    return fallbacks;
  }
};
