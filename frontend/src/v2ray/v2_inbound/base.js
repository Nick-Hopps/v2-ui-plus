export class V2rayBase {
  static toJsonArray(arr) {
    return arr.map((obj) => obj.toJson());
  }

  toJson() {
    return this;
  }

  toString(format = true) {
    return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
  }
}
