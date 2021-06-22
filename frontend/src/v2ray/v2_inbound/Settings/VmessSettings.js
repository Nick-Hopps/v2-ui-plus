import { InboundProtocols, VmessSecurity } from "../../v2_constant/constants";
import { V2CommonClass, Settings } from "../../base";

class VmessSettings extends Settings {
  constructor(protocol, vmesses = [new Vmess()], disableInsecureEncryption = false) {
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
    return new VmessSettings(
      InboundProtocols.VMESS,
      json.clients.map((client) => Vmess.fromJson(client)),
      isEmpty(json.disableInsecureEncryption) ? false : json.disableInsecureEncryption
    );
  }

  toJson() {
    return {
      clients: VmessSettings.toJsonArray(this.vmesses),
      disableInsecureEncryption: this.disableInsecure,
    };
  }
};

class Vmess extends V2CommonClass {
  constructor(id = randomUUID(), alterId = 64) {
    super();
    this.id = id;
    this.alterId = alterId;
  }

  static fromJson(json = {}) {
    return new Vmess(json.id, json.alterId);
  }
};
