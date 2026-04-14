import type { Lesson } from '../lib/types';

export const lesson1: Lesson = {
  id: '44444444-4444-4444-4444-444444444444',
  title: 'IPv4 Subnet Mask Cơ bản',
  slug: 'ipv4-subnet-mask',
  description: 'Tìm hiểu cách Subnet Mask hoạt động và cách tính Network Address, Broadcast Address, số host khả dụng.',
  objectives: [
    'Hiểu Subnet Mask là gì và tại sao cần nó',
    'Tính Network Address từ IP và Subnet Mask',
    'Tính Broadcast Address',
    'Xác định số host khả dụng trong subnet',
  ],
  difficulty: 1,
  xp_reward: 100,
  base_topology: {
    devices: [
      { id: 'pc-a', type: 'pc', label: 'PC-A', x: 100, y: 200, ip: '192.168.1.10', subnet: '255.255.255.0' },
      { id: 'router-1', type: 'router', label: 'R1', x: 400, y: 200 },
      { id: 'pc-b', type: 'pc', label: 'PC-B', x: 700, y: 200, ip: '192.168.2.10', subnet: '255.255.255.0' },
    ],
    connections: [
      { from: 'pc-a', to: 'router-1', label: 'Fa0/0' },
      { from: 'router-1', to: 'pc-b', label: 'Fa0/1' },
    ],
  },
  simulation_steps: [
    {
      id: 'step-1',
      step_order: 0,
      title: 'Sơ đồ mạng ban đầu',
      narration: 'Đây là sơ đồ mạng gồm 2 máy tính PC-A và PC-B kết nối qua Router R1. PC-A có IP 192.168.1.10/24, PC-B có IP 192.168.2.10/24. Hai máy thuộc 2 subnet khác nhau.',
      animation_config: { type: 'highlight', speed: 1000 },
    },
    {
      id: 'step-2',
      step_order: 1,
      title: 'PC-A gửi gói tin ICMP (Ping)',
      narration: 'PC-A muốn ping PC-B (192.168.2.10). Trước tiên, PC-A so sánh IP đích với Subnet Mask của mình (255.255.255.0). Kết quả: IP đích KHÔNG cùng subnet → gói tin phải đi qua Default Gateway (Router R1).',
      topology_deltas: {
        modify_devices: [
          { id: 'pc-a', highlight: true, status: 'sending' },
        ],
        add_labels: [
          { target: 'pc-a', text: 'SRC: 192.168.1.10', position: 'bottom' },
          { target: 'pc-b', text: 'DST: 192.168.2.10', position: 'bottom' },
        ],
      },
      animation_config: {
        type: 'packet_flow',
        packet: { label: 'ICMP Echo', color: '#10b981' },
        path: ['pc-a', 'router-1'],
        speed: 1500,
        pause_at: 'router-1',
        pause_narration: 'Gói tin đến Router R1. Router kiểm tra bảng routing...',
      },
      highlight_elements: ['pc-a'],
    },
    {
      id: 'step-3',
      step_order: 2,
      title: 'Router kiểm tra Subnet Mask',
      narration: 'Router R1 nhận gói tin. Nó dùng Subnet Mask để tính: Network Address của 192.168.1.10/24 = 192.168.1.0. Network Address của 192.168.2.10/24 = 192.168.2.0. Hai network khác nhau → Router cần forward gói tin sang interface Fa0/1.',
      topology_deltas: {
        modify_devices: [
          { id: 'router-1', highlight: true, status: 'processing' },
        ],
        modify_connections: [
          { from: 'pc-a', to: 'router-1', color: '#10b981', animated: true },
        ],
      },
      animation_config: { type: 'highlight', speed: 2000 },
      highlight_elements: ['router-1'],
    },
    {
      id: 'step-4',
      step_order: 3,
      title: 'Router chuyển tiếp gói tin',
      narration: 'Router R1 chuyển tiếp gói ICMP Echo từ interface Fa0/0 sang Fa0/1, hướng đến subnet 192.168.2.0/24 nơi PC-B đang ở.',
      topology_deltas: {
        modify_connections: [
          { from: 'router-1', to: 'pc-b', color: '#10b981', animated: true },
        ],
      },
      animation_config: {
        type: 'packet_flow',
        packet: { label: 'ICMP Echo', color: '#10b981' },
        path: ['router-1', 'pc-b'],
        speed: 1500,
      },
    },
    {
      id: 'step-5',
      step_order: 4,
      title: 'PC-B nhận gói tin và phản hồi',
      narration: 'PC-B nhận gói ICMP Echo Request và gửi lại ICMP Echo Reply theo đường ngược lại. Quá trình ping thành công! Subnet Mask đã giúp Router xác định đúng đường đi cho gói tin.',
      topology_deltas: {
        modify_devices: [
          { id: 'pc-b', highlight: true, status: 'receiving' },
        ],
        modify_connections: [
          { from: 'pc-a', to: 'router-1', color: '#3b82f6', animated: true },
          { from: 'router-1', to: 'pc-b', color: '#3b82f6', animated: true },
        ],
      },
      animation_config: {
        type: 'packet_flow',
        packet: { label: 'ICMP Reply', color: '#3b82f6' },
        path: ['pc-b', 'router-1', 'pc-a'],
        speed: 1200,
      },
      highlight_elements: ['pc-b'],
    },
    {
      id: 'step-6',
      step_order: 5,
      title: 'Tổng kết',
      narration: 'Subnet Mask cho phép thiết bị mạng xác định Network Address và phân biệt "cùng mạng" hay "khác mạng". Nếu khác mạng, gói tin sẽ được gửi qua Default Gateway (Router). Đây là nền tảng để hiểu IP Subnetting!',
      topology_deltas: {
        modify_devices: [
          { id: 'pc-a', highlight: true },
          { id: 'router-1', highlight: true },
          { id: 'pc-b', highlight: true },
        ],
        modify_connections: [
          { from: 'pc-a', to: 'router-1', color: '#6366f1' },
          { from: 'router-1', to: 'pc-b', color: '#6366f1' },
        ],
      },
      animation_config: { type: 'highlight', speed: 1000 },
    },
  ],
  exercises: [
    {
      id: 'ex-1',
      exercise_order: 0,
      type: 'fill_in',
      question: 'Subnet Mask cho prefix /24 là gì?',
      config: {
        prompts: [
          { label: 'Subnet Mask', answer: '255.255.255.0', accept: ['255.255.255.0'] },
        ],
      },
      explanation: '/24 nghĩa là 24 bit đầu là 1, tức 11111111.11111111.11111111.00000000 = 255.255.255.0',
      xp_reward: 20,
    },
    {
      id: 'ex-2',
      exercise_order: 1,
      type: 'fill_in',
      question: 'Network Address của 192.168.1.130 với Subnet Mask 255.255.255.192 (/26) là gì?',
      config: {
        prompts: [
          { label: 'Network Address', answer: '192.168.1.128', accept: ['192.168.1.128'] },
        ],
      },
      explanation: 'AND bit: 192.168.1.130 AND 255.255.255.192 = 192.168.1.128. Octet cuối: 130 AND 192 = 128 (10000010 AND 11000000 = 10000000)',
      xp_reward: 20,
    },
    {
      id: 'ex-3',
      exercise_order: 2,
      type: 'multiple_choice',
      question: 'Với mạng /26, có bao nhiêu host khả dụng?',
      config: {
        options: [
          { id: 'a', text: '64', correct: false },
          { id: 'b', text: '62', correct: true },
          { id: 'c', text: '30', correct: false },
          { id: 'd', text: '254', correct: false },
        ],
        allow_multiple: false,
      },
      explanation: '/26 có 6 bit host → 2^6 - 2 = 62 host khả dụng (trừ Network Address và Broadcast)',
      xp_reward: 20,
    },
    {
      id: 'ex-4',
      exercise_order: 3,
      type: 'multiple_choice',
      question: 'IP 172.16.5.1 thuộc Class nào?',
      config: {
        options: [
          { id: 'a', text: 'Class A', correct: false },
          { id: 'b', text: 'Class B', correct: true },
          { id: 'c', text: 'Class C', correct: false },
          { id: 'd', text: 'Class D', correct: false },
        ],
        allow_multiple: false,
      },
      explanation: 'Class B có octet đầu từ 128-191. 172 nằm trong khoảng này.',
      xp_reward: 20,
    },
    {
      id: 'ex-5',
      exercise_order: 4,
      type: 'drag_drop',
      question: 'Kéo các IP address vào đúng loại Private/Public:',
      config: {
        items: [
          { id: 'ip1', label: '192.168.1.1', zone: null },
          { id: 'ip2', label: '8.8.8.8', zone: null },
          { id: 'ip3', label: '10.0.0.1', zone: null },
          { id: 'ip4', label: '172.16.0.1', zone: null },
        ],
        drop_zones: [
          { id: 'private', label: 'Private IP', accepts: ['ip1', 'ip3', 'ip4'] },
          { id: 'public', label: 'Public IP', accepts: ['ip2'] },
        ],
      },
      explanation: 'Private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Mọi IP khác là Public.',
      xp_reward: 20,
    },
  ],
};
