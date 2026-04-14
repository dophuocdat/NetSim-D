import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import XRayTool from '../../src/components/module1/XRayTool';

test('shows tooltip content on hover', () => {
    render(<XRayTool packetInfo={{ mac: 'AA', ip: '1.2.3.4', port: '80' }} />);
    
    // initially not visible or not existing
    expect(screen.queryByText(/MAC: AA/)).toBeNull();
    
    // hover
    const trigger = screen.getByText('X-Ray Scanner');
    fireEvent.mouseEnter(trigger);
    
    // should show
    expect(screen.getByText(/MAC: AA/)).toBeDefined();
});
