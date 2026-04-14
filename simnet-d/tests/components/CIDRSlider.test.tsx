import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CIDRSlider from '../../src/components/module1/CIDRSlider';

test('calls onChange when slider value changes', () => {
    const onChangeMock = vi.fn();
    render(<CIDRSlider cidr={24} onChange={onChangeMock} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '26' } });
    
    expect(onChangeMock).toHaveBeenCalledWith(26);
});
