import { InboundProtocols } from "../../v2_constant/constants";
import { V2CommonClass, Settings } from "../../base";

export class SocksSettings extends Settings {
  constructor(
    protocol,
    auth = "password",
    accounts = [new SocksAccount()],
    udp = false,
    ip = "127.0.0.1"
  ) {
    super(protocol);
    this.auth = auth;
    this.accounts = accounts;
    this.udp = udp;
    this.ip = ip;
  }

  addAccount(account) {
    this.accounts.push(account);
  }

  delAccount(index) {
    this.accounts.splice(index, 1);
  }

  static fromJson(json = {}) {
    let accounts;
    if (json.auth === "password") {
      accounts = json.accounts.map((account) => SocksAccount.fromJson(account));
    }
    return new SocksSettings(InboundProtocols.SOCKS, json.auth, accounts, json.udp, json.ip);
  }

  toJson() {
    return {
      auth: this.auth,
      accounts: this.auth === "password" ? this.accounts.map((account) => account.toJson()) : undefined,
      udp: this.udp,
      ip: this.ip,
    };
  }
};

class SocksAccount extends V2CommonClass {
  constructor(user = randomSeq(10), pass = randomSeq(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new SocksAccount(json.user, json.pass);
  }
};
