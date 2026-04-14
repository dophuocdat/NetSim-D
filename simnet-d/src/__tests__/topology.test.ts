import { describe, it, expect } from 'vitest';
import { resolveTopology } from '../utils/topology';
import type { TopologyConfig } from '../lib/types';

const baseTopology: TopologyConfig = {
  devices: [
    { id: 'pc-a', type: 'pc', label: 'PC-A', x: 100, y: 200, ip: '192.168.1.10' },
    { id: 'router-1', type: 'router', label: 'R1', x: 400, y: 200 },
  ],
  connections: [
    { from: 'pc-a', to: 'router-1', label: 'Fa0/0' },
  ],
};

describe('resolveTopology', () => {
  it('returns base when no deltas', () => {
    const result = resolveTopology(baseTopology);
    expect(result.devices).toEqual(baseTopology.devices);
    expect(result.connections).toEqual(baseTopology.connections);
    expect(result.labels).toEqual([]);
  });

  it('applies device modifications', () => {
    const deltas = {
      modify_devices: [{ id: 'pc-a', highlight: true }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.devices[0]).toEqual({ ...baseTopology.devices[0], highlight: true });
    expect(result.devices[1]).toEqual(baseTopology.devices[1]);
  });

  it('applies connection modifications', () => {
    const deltas = {
      modify_connections: [{ from: 'pc-a', to: 'router-1', color: '#10b981' }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.connections[0].color).toBe('#10b981');
  });

  it('adds labels', () => {
    const deltas = {
      add_labels: [{ target: 'pc-a', text: 'SRC', position: 'bottom' as const }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.labels).toHaveLength(1);
    expect(result.labels[0].text).toBe('SRC');
  });

  it('preserves unmodified devices', () => {
    const deltas = {
      modify_devices: [{ id: 'nonexistent', highlight: true }],
    };
    const result = resolveTopology(baseTopology, deltas);
    expect(result.devices).toEqual(baseTopology.devices);
  });
});
