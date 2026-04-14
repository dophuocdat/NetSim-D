import { motion } from 'framer-motion';
import type { Device } from '../../lib/types';

interface Props {
  path: string[];
  devices: Device[];
  color: string;
  label: string;
  speed: number;
  isPlaying: boolean;
}

export function PacketAnimation({ path, devices, color, label, speed, isPlaying }: Props) {
  if (!isPlaying || path.length < 2) return null;

  // Build waypoints from device positions
  const waypoints = path
    .map(id => devices.find(d => d.id === id))
    .filter(Boolean) as Device[];

  if (waypoints.length < 2) return null;

  // Build x/y keyframes
  const xKeyframes = waypoints.map(d => d.x);
  const yKeyframes = waypoints.map(d => d.y);
  const totalDuration = (speed / 1000) * (waypoints.length - 1);

  return (
    <motion.g>
      {/* Packet dot */}
      <motion.circle
        r={8}
        fill={color}
        initial={{ cx: xKeyframes[0], cy: yKeyframes[0], opacity: 0, scale: 0 }}
        animate={{
          cx: xKeyframes,
          cy: yKeyframes,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: totalDuration,
          ease: 'easeInOut',
          times: waypoints.map((_, i) => i / (waypoints.length - 1)),
        }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />

      {/* Packet label */}
      <motion.text
        initial={{ x: xKeyframes[0], y: (yKeyframes[0] ?? 0) - 16, opacity: 0 }}
        animate={{
          x: xKeyframes,
          y: yKeyframes.map(y => y - 16),
          opacity: 1,
        }}
        transition={{
          duration: totalDuration,
          ease: 'easeInOut',
          times: waypoints.map((_, i) => i / (waypoints.length - 1)),
        }}
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontWeight={600}
        fontFamily="JetBrains Mono, monospace"
      >
        {label}
      </motion.text>

      {/* Trail effect */}
      <motion.circle
        r={4}
        fill={color}
        opacity={0.3}
        initial={{ cx: xKeyframes[0], cy: yKeyframes[0] }}
        animate={{
          cx: xKeyframes,
          cy: yKeyframes,
        }}
        transition={{
          duration: totalDuration,
          ease: 'easeInOut',
          delay: 0.1,
          times: waypoints.map((_, i) => i / (waypoints.length - 1)),
        }}
      />
    </motion.g>
  );
}
