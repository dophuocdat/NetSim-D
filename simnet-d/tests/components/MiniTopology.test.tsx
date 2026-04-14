import React from 'react';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import MiniTopology from '../../src/components/module1/MiniTopology';

test('renders bridge-success when same network, bridge-broken when different', () => {
    // Both under /22 means network is 192.168.0.0
    const { container: successContainer } = render(
        <MiniTopology ipA="192.168.1.10" ipB="192.168.2.10" cidr={22} />
    );
    expect(successContainer.querySelector('.bridge-success')).not.toBeNull();
    
    // Both under /24 means networks are 192.168.1.0 and 192.168.2.0 (different)
    const { container: brokenContainer } = render(
        <MiniTopology ipA="192.168.1.10" ipB="192.168.2.10" cidr={24} />
    );
    expect(brokenContainer.querySelector('.bridge-broken')).not.toBeNull();
});
