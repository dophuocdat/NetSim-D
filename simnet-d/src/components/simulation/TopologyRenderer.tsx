import { DeviceNode } from './DeviceNode';
import { ConnectionLine } from './ConnectionLine';
import { PacketAnimation } from './PacketAnimation';
import type { TopologyConfig, TopologyLabel, AnimationConfig } from '../../lib/types';

interface Props {
  topology: TopologyConfig & { labels?: TopologyLabel[] };
  animationConfig?: AnimationConfig;
  isPlaying: boolean;
}

export function TopologyRenderer({ topology, animationConfig, isPlaying }: Props) {
  const { devices, connections, labels = [] } = topology;

  return (
    <svg
      viewBox="0 0 800 400"
      role="figure"
      aria-label="Sơ đồ mạng mô phỏng"
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: '400px',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--border-radius)',
      }}
    >
      <title>Network Topology Diagram</title>
      <desc>
        Sơ đồ gồm {devices.length} thiết bị và {connections.length} kết nối
      </desc>

      {/* Grid dots background */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="0.5" fill="var(--glass-border)" />
        </pattern>
      </defs>
      <rect width="800" height="400" fill="url(#grid)" />

      {/* Connections (render before devices so devices appear on top) */}
      {connections.map((conn, i) => (
        <ConnectionLine key={i} connection={conn} devices={devices} />
      ))}

      {/* Devices */}
      {devices.map((device) => (
        <DeviceNode key={device.id} device={device} />
      ))}

      {/* Extra labels from deltas */}
      {labels.map((label, i) => {
        const targetDevice = devices.find(d => d.id === label.target);
        if (!targetDevice) return null;

        const offsets = {
          top: { dx: 0, dy: -40 },
          bottom: { dx: 0, dy: 70 },
          left: { dx: -60, dy: 0 },
          right: { dx: 60, dy: 0 },
        };
        const offset = offsets[label.position] || offsets.bottom;

        return (
          <text
            key={i}
            x={targetDevice.x + offset.dx}
            y={targetDevice.y + offset.dy}
            textAnchor="middle"
            fill="var(--accent-tertiary)"
            fontSize={11}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={500}
          >
            {label.text}
          </text>
        );
      })}

      {/* Packet animation */}
      {animationConfig?.type === 'packet_flow' && animationConfig.path && animationConfig.packet && (
        <PacketAnimation
          path={animationConfig.path}
          devices={devices}
          color={animationConfig.packet.color}
          label={animationConfig.packet.label}
          speed={animationConfig.speed}
          isPlaying={isPlaying}
        />
      )}
    </svg>
  );
}
