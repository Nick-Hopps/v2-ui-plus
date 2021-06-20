export class XtlsStreamSettings extends V2CommonClass {
  constructor(alpn = ["http/1.1"], certificates = [new XtlsStreamSettings.Cert()]) {
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
      certs = json.certificates.map((cert) => XtlsStreamSettings.Cert.fromJson(cert));
    }
    return new XtlsStreamSettings(json.alpn, certs);
  }

  toJson() {
    return {
      alpn: this.alpn,
      certificates: XtTlsStreamSettings.toJsonArray(this.certs),
    };
  }
}

XtlsStreamSettings.Cert = class extends V2CommonClass {
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
      return new XtlsStreamSettings.Cert(true, json.certificateFile, json.keyFile);
    } else {
      return new XtlsStreamSettings.Cert(false, "", "", json.certificate.join("\n"), json.key.join("\n"));
    }
  }

  toJson() {
    if (this.useFile) {
      return {
        certificateFile: this.certFile,
        keyFile: this.keyFile,
      };
    } else {
      return {
        certificate: this.cert.split("\n"),
        key: this.key.split("\n"),
      };
    }
  }
};
