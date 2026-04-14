import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import PacketMatryoshka from '../../src/components/module1/PacketMatryoshka';

test('renders L3 layer inside L2 layer', () => {
    render(<PacketMatryoshka currentState="l2_packing" />);
    expect(screen.getByText(/MAC: AABB/)).toBeDefined();
    expect(screen.getByText(/IP: 10\.0\.0\.1/)).toBeDefined();
});
