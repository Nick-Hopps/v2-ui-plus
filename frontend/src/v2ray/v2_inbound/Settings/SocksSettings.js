import { randomString } from "@/util/utils";
import { V2rayBase } from "../base";

export class SocksSettings extends V2rayBase {
  constructor(auth = "password", accounts = [new SocksAccount()], udp = false, ip = "127.0.0.1", userLevel = 0) {
    super();
    this.auth = auth;
    this.accounts = accounts;
    this.udp = udp;
    this.ip = ip;
    this.userLevel = userLevel;
  }

  addAccount(user) {
    this.accounts.push(new SocksAccount(user.user, user.pass));
  }

  removeAccount(index) {
    this.accounts.splice(index, 1);
  }

  static fromJson(json = {}) {
    return new SocksSettings(
      json.auth,
      json.auth === "password" ? json.accounts.map((account) => SocksAccount.fromJson(account)) : undefined,
      json.udp,
      json.ip
    );
  }
}

class SocksAccount extends V2rayBase {
  constructor(user = randomString(10), pass = randomString(10)) {
    super();
    this.user = user;
    this.pass = pass;
  }

  static fromJson(json = {}) {
    return new SocksAccount(json.user, json.pass);
  }
}
