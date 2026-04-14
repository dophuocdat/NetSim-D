import { expect, test } from 'vitest';
import { calculateSubnetBoundaries, getBitsFromIP } from '../../src/utils/subnetEngine';

test('calculate Subnet Boundaries for /24', () => {
    const limits = calculateSubnetBoundaries('192.168.1.10', 24);
    expect(limits.networkId).toBe('192.168.1.0');
    expect(limits.broadcastId).toBe('192.168.1.255');
});

test('calculate Subnet Boundaries for /22', () => {
    // 192.168.1.10 / 22 => Network is 192.168.0.0, Broadcast is 192.168.3.255
    const limits = calculateSubnetBoundaries('192.168.1.10', 22);
    expect(limits.networkId).toBe('192.168.0.0');
    expect(limits.broadcastId).toBe('192.168.3.255');
});

test('get binary array from IP', () => {
    const bits = getBitsFromIP('192.168.1.10');
    expect(bits.length).toBe(32);
    // 192 = 11000000
    expect(bits.slice(0, 8).join('')).toBe('11000000');
    // 168 = 10101000
    expect(bits.slice(8, 16).join('')).toBe('10101000');
});
