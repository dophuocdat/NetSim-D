import type { Device } from '../../lib/types';
import pcIcon from '../../assets/devices/pc.svg';
import routerIcon from '../../assets/devices/router.svg';
import switchIcon from '../../assets/devices/switch.svg';
import serverIcon from '../../assets/devices/server.svg';

const deviceIcons: Record<string, string> = {
  pc: pcIcon,
  router: routerIcon,
  switch: switchIcon,
  server: serverIcon,
};

interface Props {
  device: Device;
  onClick?: (id: string) => void;
}

export function DeviceNode({ device, onClick }: Props) {
  const iconSrc = deviceIcons[device.type] || pcIcon;
  const isHighlighted = device.highlight;

  return (
    <g
      role="img"
      aria-label={`${device.type} ${device.label}: IP ${device.ip || 'N/A'}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(device.id)}
      onClick={() => onClick?.(device.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className={isHighlighted ? 'device-highlighted' : ''}
    >
      <title>{device.label} ({device.type})</title>
      <desc>
        {device.type === 'router'
          ? `Router ${device.label} kết nối các mạng con`
          : `${device.type === 'pc' ? 'Máy tính' : device.type} ${device.label}${device.ip ? ` với IP ${device.ip}` : ''}`}
      </desc>

      {/* Highlight glow */}
      {isHighlighted && (
        <circle
          cx={device.x}
          cy={device.y}
          r={38}
          fill="none"
          stroke="var(--device-active)"
          strokeWidth={2}
          opacity={0.5}
          className="animate-glow"
        />
      )}

      {/* Device icon */}
      <image
        href={iconSrc}
        x={device.x - 24}
        y={device.y - 24}
        width={48}
        height={48}
        style={isHighlighted ? { filter: 'brightness(1.3) drop-shadow(0 0 6px var(--device-active))' } : {}}
      />

      {/* Label */}
      <text
        x={device.x}
        y={device.y + 38}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize={13}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
      >
        {device.label}
      </text>

      {/* IP address */}
      {device.ip && (
        <text
          x={device.x}
          y={device.y + 54}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize={11}
          fontFamily="JetBrains Mono, monospace"
        >
          {device.ip}
        </text>
      )}

      {/* Status indicator */}
      {device.status && (
        <circle
          cx={device.x + 20}
          cy={device.y - 20}
          r={4}
          fill={
            device.status === 'sending' ? 'var(--packet-icmp)' :
            device.status === 'receiving' ? 'var(--packet-tcp)' :
            device.status === 'error' ? 'var(--error)' :
            'var(--warning)'
          }
        />
      )}

      {/* Error message */}
      {device.error_message && (
        <text
          x={device.x}
          y={device.y + 70}
          textAnchor="middle"
          fill="var(--error)"
          fontSize={10}
          fontFamily="JetBrains Mono, monospace"
        >
          {device.error_message}
        </text>
      )}
    </g>
  );
}
