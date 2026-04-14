export function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

export function calculateNetworkAddress(ip: string, mask: string): string {
  return intToIp(ipToInt(ip) & ipToInt(mask));
}

export function calculateBroadcast(networkAddress: string, mask: string): string {
  const invertedMask = ~ipToInt(mask) >>> 0;
  return intToIp((ipToInt(networkAddress) | invertedMask) >>> 0);
}

export function countHosts(cidr: number): number {
  if (cidr >= 31) return 0;
  return Math.pow(2, 32 - cidr) - 2;
}

export function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return intToIp(mask);
}

export function maskToCidr(mask: string): number {
  const bits = ipToInt(mask).toString(2);
  return (bits.match(/1/g) || []).length;
}

export function getIpClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0], 10);
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D';
  return 'E';
}

export function isPrivateIp(ip: string): boolean {
  const int = ipToInt(ip);
  return (
    (int >= ipToInt('10.0.0.0') && int <= ipToInt('10.255.255.255')) ||
    (int >= ipToInt('172.16.0.0') && int <= ipToInt('172.31.255.255')) ||
    (int >= ipToInt('192.168.0.0') && int <= ipToInt('192.168.255.255'))
  );
}
