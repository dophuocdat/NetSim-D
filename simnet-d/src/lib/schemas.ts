import { z } from 'zod/v4';

export const DeviceSchema = z.object({
  id: z.string(),
  type: z.enum(['pc', 'router', 'switch', 'server', 'firewall', 'cloud']),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  ip: z.string().optional(),
  subnet: z.string().optional(),
  highlight: z.boolean().optional(),
  status: z.string().optional(),
  error_message: z.string().optional(),
});

export const ConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
  animated: z.boolean().optional(),
  status: z.string().optional(),
  dashed: z.boolean().optional(),
});

export const TopologyLabelSchema = z.object({
  target: z.string(),
  text: z.string(),
  position: z.enum(['top', 'bottom', 'left', 'right']),
});

export const TopologyConfigSchema = z.object({
  devices: z.array(DeviceSchema),
  connections: z.array(ConnectionSchema),
  labels: z.array(TopologyLabelSchema).optional(),
});

export const AnimationConfigSchema = z.object({
  type: z.enum(['packet_flow', 'highlight', 'transform']),
  packet: z.object({ label: z.string(), color: z.string() }).optional(),
  path: z.array(z.string()).optional(),
  speed: z.number(),
  pause_at: z.string().optional(),
  pause_narration: z.string().optional(),
});

export const TopologyDeltasSchema = z.object({
  modify_devices: z.array(
    DeviceSchema.partial().extend({ id: z.string() })
  ).optional(),
  modify_connections: z.array(
    ConnectionSchema.partial().extend({ from: z.string(), to: z.string() })
  ).optional(),
  add_labels: z.array(TopologyLabelSchema).optional(),
});
