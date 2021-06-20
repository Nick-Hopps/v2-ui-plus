export class TlsStreamSettings extends V2CommonClass {
  constructor(serverName = "", certificates = [new TlsStreamSettings.Cert()]) {
    super();
    this.server = serverName;
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
      certs = json.certificates.map((cert) => TlsStreamSettings.Cert.fromJson(cert));
    }
    return new TlsStreamSettings(json.serverName, certs);
  }

  toJson() {
    return {
      serverName: this.server,
      certificates: TlsStreamSettings.toJsonArray(this.certs),
    };
  }
}

TlsStreamSettings.Cert = class extends V2CommonClass {
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
      return new TlsStreamSettings.Cert(true, json.certificateFile, json.keyFile);
    } else {
      return new TlsStreamSettings.Cert(false, "", "", json.certificate.join("\n"), json.key.join("\n"));
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
