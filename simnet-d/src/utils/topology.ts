import type { TopologyConfig, TopologyDeltas, TopologyLabel } from '../lib/types';

export function resolveTopology(
  base: TopologyConfig,
  deltas?: TopologyDeltas
): TopologyConfig & { labels: TopologyLabel[] } {
  if (!deltas) return { ...base, labels: base.labels || [] };

  return {
    devices: base.devices.map((device) => {
      const delta = deltas.modify_devices?.find((d) => d.id === device.id);
      return delta ? { ...device, ...delta } : device;
    }),
    connections: base.connections.map((conn) => {
      const delta = deltas.modify_connections?.find(
        (c) => c.from === conn.from && c.to === conn.to
      );
      return delta ? { ...conn, ...delta } : conn;
    }),
    labels: [...(base.labels || []), ...(deltas.add_labels || [])],
  };
}
