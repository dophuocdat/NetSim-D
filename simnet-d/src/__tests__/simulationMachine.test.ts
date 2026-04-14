import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { simulationMachine } from '../machines/simulationMachine';

describe('SimulationMachine', () => {
  it('starts in idle state', () => {
    const actor = createActor(simulationMachine, { input: { totalSteps: 0 } });
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });

  it('transitions to playing on START', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.currentStep).toBe(0);
    actor.stop();
  });

  it('pauses and resumes', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PAUSE' });
    expect(actor.getSnapshot().value).toBe('paused');
    actor.send({ type: 'RESUME' });
    expect(actor.getSnapshot().value).toBe('playing');
    actor.stop();
  });

  it('advances to next step', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(1);
    actor.stop();
  });

  it('goes to previous step', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' });
    actor.send({ type: 'PREV_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(0);
    actor.stop();
  });

  it('does not go below step 0', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PREV_STEP' });
    expect(actor.getSnapshot().context.currentStep).toBe(0);
    actor.stop();
  });

  it('completes when reaching last step', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 2 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' }); // step 1 (last)
    actor.send({ type: 'NEXT_STEP' }); // should complete
    expect(actor.getSnapshot().value).toBe('completed');
    actor.stop();
  });

  it('resets from completed to idle', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 1 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('completed');
    actor.send({ type: 'RESET' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.currentStep).toBe(0);
    actor.stop();
  });

  it('can advance from paused state', () => {
    const actor = createActor(simulationMachine, {
      input: { totalSteps: 3 },
    });
    actor.start();
    actor.send({ type: 'START' });
    actor.send({ type: 'PAUSE' });
    actor.send({ type: 'NEXT_STEP' });
    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.currentStep).toBe(1);
    actor.stop();
  });
});
