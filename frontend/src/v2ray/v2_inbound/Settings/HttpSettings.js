import { randomSeq } from "@/util/utils";
import { V2rayBase } from "../base";

export class HttpSettings extends V2rayBase {
  constructor(accounts = [new HttpAccount()]) {
    super();
    this.accounts = accounts;
  }

  addAccount(account) {
    this.accounts.push(account);
  }

  delAccount(index) {
    this.accounts.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new HttpSettings(json.accounts.map((account) => HttpAccount.fromJson(account)));
  }

  toJson() {
    return {
      accounts: HttpSettings.toJsonArray(this.accounts),
    };
  }
}

class HttpAccount extends V2rayBase {
  constructor(user = randomSeq(10), pass = randomSeq(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new HttpAccount(json.user, json.pass);
  }
}
