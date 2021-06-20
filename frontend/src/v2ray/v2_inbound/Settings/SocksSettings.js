Inbound.SocksSettings = class extends Inbound.Settings {
  constructor(
    protocol,
    auth = "password",
    accounts = [new Inbound.SocksSettings.SocksAccount()],
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
      accounts = json.accounts.map((account) => Inbound.SocksSettings.SocksAccount.fromJson(account));
    }
    return new Inbound.SocksSettings(InboundProtocols.SOCKS, json.auth, accounts, json.udp, json.ip);
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
Inbound.SocksSettings.SocksAccount = class extends V2CommonClass {
  constructor(user = randomSeq(10), pass = randomSeq(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new Inbound.SocksSettings.SocksAccount(json.user, json.pass);
  }
};
