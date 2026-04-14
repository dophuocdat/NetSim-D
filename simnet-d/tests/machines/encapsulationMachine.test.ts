import { createActor } from 'xstate';
import { encapsulationMachine } from '../../src/machines/encapsulationMachine';
import { expect, test } from 'vitest';

test('machine steps through encapsulation phases', () => {
  const actor = createActor(encapsulationMachine).start();
  expect(actor.getSnapshot().value).toBe('idle');
  
  actor.send({ type: 'NEXT_STEP' });
  expect(actor.getSnapshot().value).toBe('l4_packing');
  
  actor.send({ type: 'NEXT_STEP' });
  expect(actor.getSnapshot().value).toBe('l3_packing');
});
