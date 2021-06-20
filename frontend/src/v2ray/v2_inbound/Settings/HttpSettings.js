Inbound.HttpSettings = class extends Inbound.Settings {
  constructor(protocol, accounts = [new Inbound.HttpSettings.HttpAccount()]) {
    super(protocol);
    this.accounts = accounts;
  }

  addAccount(account) {
    this.accounts.push(account);
  }

  delAccount(index) {
    this.accounts.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new Inbound.HttpSettings(
      InboundProtocols.HTTP,
      json.accounts.map((account) => Inbound.HttpSettings.HttpAccount.fromJson(account))
    );
  }

  toJson() {
    return {
      accounts: Inbound.HttpSettings.toJsonArray(this.accounts),
    };
  }
};

Inbound.HttpSettings.HttpAccount = class extends V2CommonClass {
  constructor(user = randomSeq(10), pass = randomSeq(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new Inbound.HttpSettings.HttpAccount(json.user, json.pass);
  }
};
