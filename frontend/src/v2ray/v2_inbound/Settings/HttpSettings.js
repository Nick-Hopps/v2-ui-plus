import { InboundProtocols } from "../../v2_constant/constants";
import { V2CommonClass, Settings } from "../../base";

export class HttpSettings extends Settings {
  constructor(protocol, accounts = [new HttpAccount()]) {
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
    return new HttpSettings(
      InboundProtocols.HTTP,
      json.accounts.map((account) => HttpAccount.fromJson(account))
    );
  }

  toJson() {
    return {
      accounts: HttpSettings.toJsonArray(this.accounts),
    };
  }
};

class HttpAccount extends V2CommonClass {
  constructor(user = randomSeq(10), pass = randomSeq(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new HttpAccount(json.user, json.pass);
  }
};
