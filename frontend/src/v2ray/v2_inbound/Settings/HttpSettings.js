import { randomString } from "@/util/utils";
import { V2rayBase } from "../base";

export class HttpSettings extends V2rayBase {
  constructor(timeout = 0, accounts = [new HttpAccount()], allowTransparent = false, userLevel = 0) {
    super();
    this.timeout = timeout;
    this.accounts = accounts;
    this.allowTransparent = allowTransparent;
    this.userLevel = userLevel;
  }

  addAccount(user) {
    this.accounts.push(new HttpAccount(user.user, user.pass));
  }

  removeAccount(index) {
    this.accounts.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new HttpSettings(
      json.timeout,
      json.accounts.map((account) => HttpAccount.fromJson(account)),
      json.allowTransparent,
      json.userLevel
    );
  }
}

class HttpAccount extends V2rayBase {
  constructor(user = randomString(10), pass = randomString(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new HttpAccount(json.user, json.pass);
  }
}
