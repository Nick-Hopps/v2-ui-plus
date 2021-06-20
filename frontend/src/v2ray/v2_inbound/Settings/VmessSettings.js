Inbound.VmessSettings = class extends Inbound.Settings {
  constructor(protocol, vmesses = [new Inbound.VmessSettings.Vmess()], disableInsecureEncryption = false) {
    super(protocol);
    this.vmesses = vmesses;
    this.disableInsecure = disableInsecureEncryption;
  }

  indexOfVmessById(id) {
    return this.vmesses.findIndex((vmess) => vmess.id === id);
  }

  addVmess(vmess) {
    if (this.indexOfVmessById(vmess.id) >= 0) {
      return false;
    }
    this.vmesses.push(vmess);
  }

  delVmess(vmess) {
    const i = this.indexOfVmessById(vmess.id);
    if (i >= 0) {
      this.vmesses.splice(i, 1);
    }
  }

  static fromJson(json = {}) {
    return new Inbound.VmessSettings(
      InboundProtocols.VMESS,
      json.clients.map((client) => Inbound.VmessSettings.Vmess.fromJson(client)),
      isEmpty(json.disableInsecureEncryption) ? false : json.disableInsecureEncryption
    );
  }

  toJson() {
    return {
      clients: Inbound.VmessSettings.toJsonArray(this.vmesses),
      disableInsecureEncryption: this.disableInsecure,
    };
  }
};
Inbound.VmessSettings.Vmess = class extends V2CommonClass {
  constructor(id = randomUUID(), alterId = 64) {
    super();
    this.id = id;
    this.alterId = alterId;
  }

  static fromJson(json = {}) {
    return new Inbound.VmessSettings.Vmess(json.id, json.alterId);
  }
};
