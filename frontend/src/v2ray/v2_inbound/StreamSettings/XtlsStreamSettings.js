import { isEmpty } from "@/util/utils";
import { V2rayBase } from "../base";

export class XtlsStreamSettings extends V2rayBase {
  constructor(alpn = ["http/1.1"], certificates = [new Cert()]) {
    super();
    this.alpn = alpn;
    this.certs = certificates;
  }

  addCert(cert) {
    this.certs.push(cert);
  }

  removeCert(index) {
    this.certs.splice(index, 1);
  }

  static fromJson(json = {}) {
    let certs;
    if (!isEmpty(json.certificates)) {
      certs = json.certificates.map((cert) => Cert.fromJson(cert));
    }
    return new XtlsStreamSettings(json.alpn, certs);
  }
}

class Cert extends V2rayBase {
  constructor(useFile = true, certificateFile = "", keyFile = "", certificate = "", key = "") {
    super();
    this.useFile = useFile;
    this.certFile = certificateFile;
    this.keyFile = keyFile;
    this.cert = certificate instanceof Array ? certificate.join("\n") : certificate;
    this.key = key instanceof Array ? key.join("\n") : key;
  }

  static fromJson(json = {}) {
    if ("certificateFile" in json && "keyFile" in json) {
      return new Cert(true, json.certificateFile, json.keyFile);
    } else {
      return new Cert(false, "", "", json.certificate.join("\n"), json.key.join("\n"));
    }
  }
}
