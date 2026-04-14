import type { Connection, Device } from '../../lib/types';

interface Props {
  connection: Connection;
  devices: Device[];
}

export function ConnectionLine({ connection, devices }: Props) {
  const fromDevice = devices.find(d => d.id === connection.from);
  const toDevice = devices.find(d => d.id === connection.to);

  if (!fromDevice || !toDevice) return null;

  const strokeColor = connection.color || 'var(--connection-line)';
  const isAnimated = connection.animated;
  const isDashed = connection.dashed;

  // Calculate label position (midpoint)
  const midX = (fromDevice.x + toDevice.x) / 2;
  const midY = (fromDevice.y + toDevice.y) / 2;

  return (
    <g role="presentation">
      {/* Connection line */}
      <line
        x1={fromDevice.x}
        y1={fromDevice.y}
        x2={toDevice.x}
        y2={toDevice.y}
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray={isDashed ? '8 4' : undefined}
        strokeLinecap="round"
        style={isAnimated ? {
          animation: 'glow 1.5s ease-in-out infinite',
          filter: `drop-shadow(0 0 3px ${strokeColor})`,
        } : {}}
      />

      {/* Disconnected X marker */}
      {connection.status === 'disconnected' && (
        <>
          <line x1={midX - 6} y1={midY - 6} x2={midX + 6} y2={midY + 6} stroke="var(--error)" strokeWidth={2.5} />
          <line x1={midX + 6} y1={midY - 6} x2={midX - 6} y2={midY + 6} stroke="var(--error)" strokeWidth={2.5} />
        </>
      )}

      {/* Interface label */}
      {connection.label && (
        <text
          x={midX}
          y={midY - 10}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={10}
          fontFamily="JetBrains Mono, monospace"
        >
          {connection.label}
        </text>
      )}
    </g>
  );
}
