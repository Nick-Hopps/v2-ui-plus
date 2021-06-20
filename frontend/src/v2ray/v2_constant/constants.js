export const InboundProtocols = {
  DOKODEMO: "dokodemo-door",
  HTTP: "http",
  SOCKS: "socks",
  VLESS: "vless",
  VMESS: "vmess",
  TROJAN: "trojan",
  SHADOWSOCKS: "shadowsocks",
};

export const TransportMethod = {
  TCP: "tcp",
  KCP: "kcp",
  WS: "ws",
  HTTP: "http",
  QUCI: "quic",
  DS: "ds",
  GRPC: "grpc",
};

export const VlessFlow = {
  ORIGIN: "xtls-rprx-origin",
  DIRECT: "xtls-rprx-direct",
};

export const VmessSecurity = {
  AES_128_GCM: "aes-128-gcm",
  CHACHA20_POLY1305: "chacha20-poly1305",
  AUTO: "auto",
  NONE: "none",
  ZERO: "zero",
};

export const ShadowsocksMethods = {
  AES_256_GCM: "aes-256-gcm",
  AES_128_GCM: "aes-128-gcm",
  CHACHA20_POLY1305: "chacha20-poly1305",
  NONE: "none",
};
