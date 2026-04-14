import React from 'react';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import BinaryLEDPanel from '../../src/components/module1/BinaryLEDPanel';

test('renders 32 bits divided into network and host bits', () => {
    // For /24, there should be 24 network bits and 8 host bits. We can test this 
    // by checking class names applied (e.g. 'led-network' vs 'led-host').
    const { container } = render(<BinaryLEDPanel bits={new Array(32).fill(1)} cidr={24} />);
    
    const networkLeds = container.querySelectorAll('.led-network');
    const hostLeds = container.querySelectorAll('.led-host');
    
    expect(networkLeds.length).toBe(24);
    expect(hostLeds.length).toBe(8);
});
