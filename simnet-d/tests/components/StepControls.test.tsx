import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import StepControls from '../../src/components/module1/StepControls';

test('calls onNext when Next button is clicked', () => {
    const nextMock = vi.fn();
    const prevMock = vi.fn();
    render(<StepControls onNext={nextMock} onPrev={prevMock} canNext={true} canPrev={false} />);
    
    const nextBtn = screen.getByText('Next Step');
    fireEvent.click(nextBtn);
    expect(nextMock).toHaveBeenCalledTimes(1);
    
    const prevBtn = screen.getByText('Previous Step');
    expect(prevBtn).toBeDisabled();
});
