export function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

export function calculateSubnetBoundaries(ip: string, cidr: number): { networkId: string; broadcastId: string } {
  const ipLong = ipToLong(ip);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = (ipLong & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  
  return {
    networkId: longToIp(network),
    broadcastId: longToIp(broadcast)
  };
}

export function getBitsFromIP(ip: string): number[] {
  const ipLong = ipToLong(ip);
  const bits: number[] = [];
  for (let i = 31; i >= 0; i--) {
    bits.push((ipLong >>> i) & 1);
  }
  return bits;
}
