import { isEmpty } from "@/util/utils";
import { V2rayBase } from "../base";

export class TlsStreamSettings extends V2rayBase {
  constructor(
    serverName = "",
    alpn = ["h2", "http/1.1"],
    allowInsecure = false,
    disableSystemRoot = false,
    certificates = [new Cert()],
    verifyClientCertificate = false,
    pinnedPeerCertificateChainSha256 = ""
  ) {
    super();
    this.serverName = serverName;
    this.alpn = alpn;
    this.allowInsecure = allowInsecure;
    this.disableSystemRoot = disableSystemRoot;
    this.certificates = certificates;
    this.verifyClientCertificate = verifyClientCertificate;
    this.pinnedPeerCertificateChainSha256 = pinnedPeerCertificateChainSha256;
  }

  addCert(cert) {
    this.certs.push(Cert.fromJson(cert));
  }

  removeCert(index) {
    this.certs.splice(index, 1);
  }

  static fromJson(json = {}) {
    if (!isEmpty(json.certificates)) {
      json.certificates = json.certificates.map((cert) => Cert.fromJson(cert));
    }

    return new TlsStreamSettings(
      json.serverName,
      json.alpn,
      json.allowInsecure,
      json.disableSystemRoot,
      json.certificates,
      json.verifyClientCertificate,
      json.pinnedPeerCertificateChainSha256
    );
  }
}

class Cert extends V2rayBase {
  constructor(usage = "encipherment", certificateFile = "", keyFile = "", certificate = [""], key = [""]) {
    super();
    this.usage = usage;
    this.certificateFile = certificateFile;
    this.keyFile = keyFile;
    this.certificate = certificate;
    this.key = key;
  }

  static fromJson(json = {}) {
    if ("certificateFile" in json && "keyFile" in json) {
      return new Cert(json.usage, json.certificateFile, json.keyFile);
    } else {
      return new Cert(json.usage, "", "", json.certificate, json.key);
    }
  }
}
