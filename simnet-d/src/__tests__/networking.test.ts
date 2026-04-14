import { describe, it, expect } from 'vitest';
import {
  ipToInt, intToIp,
  calculateNetworkAddress, calculateBroadcast,
  countHosts, cidrToMask, maskToCidr,
  isPrivateIp, getIpClass
} from '../utils/networking';

describe('IP Conversion', () => {
  it('converts IP string to integer', () => {
    expect(ipToInt('192.168.1.1')).toBe(3232235777);
  });
  it('converts integer to IP string', () => {
    expect(intToIp(3232235777)).toBe('192.168.1.1');
  });
  it('handles 0.0.0.0', () => {
    expect(ipToInt('0.0.0.0')).toBe(0);
    expect(intToIp(0)).toBe('0.0.0.0');
  });
});

describe('Subnet Calculations', () => {
  it('calculates network address for /24', () => {
    expect(calculateNetworkAddress('192.168.1.130', '255.255.255.0')).toBe('192.168.1.0');
  });
  it('calculates network address for /26', () => {
    expect(calculateNetworkAddress('192.168.1.130', '255.255.255.192')).toBe('192.168.1.128');
  });
  it('calculates broadcast for /24', () => {
    expect(calculateBroadcast('192.168.1.0', '255.255.255.0')).toBe('192.168.1.255');
  });
  it('calculates broadcast for /26', () => {
    expect(calculateBroadcast('192.168.1.128', '255.255.255.192')).toBe('192.168.1.191');
  });
  it('counts hosts for /24', () => {
    expect(countHosts(24)).toBe(254);
  });
  it('counts hosts for /26', () => {
    expect(countHosts(26)).toBe(62);
  });
  it('counts 0 hosts for /32', () => {
    expect(countHosts(32)).toBe(0);
  });
  it('counts 0 hosts for /31', () => {
    expect(countHosts(31)).toBe(0);
  });
});

describe('CIDR/Mask Conversion', () => {
  it('converts /24 to mask', () => {
    expect(cidrToMask(24)).toBe('255.255.255.0');
  });
  it('converts /26 to mask', () => {
    expect(cidrToMask(26)).toBe('255.255.255.192');
  });
  it('converts /16 to mask', () => {
    expect(cidrToMask(16)).toBe('255.255.0.0');
  });
  it('converts mask to /24', () => {
    expect(maskToCidr('255.255.255.0')).toBe(24);
  });
});

describe('IP Classification', () => {
  it('identifies Class A', () => {
    expect(getIpClass('10.0.0.1')).toBe('A');
  });
  it('identifies Class B', () => {
    expect(getIpClass('172.16.0.1')).toBe('B');
  });
  it('identifies Class C', () => {
    expect(getIpClass('192.168.1.1')).toBe('C');
  });
  it('identifies private IP', () => {
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
  });
});
