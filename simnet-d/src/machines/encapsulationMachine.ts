import { setup } from 'xstate';

export const encapsulationMachine = setup({
  types: {
    events: {} as { type: 'NEXT_STEP' } | { type: 'PREV_STEP' },
  },
}).createMachine({
  id: 'encapsulation',
  initial: 'idle',
  states: {
    idle: {
      on: { NEXT_STEP: 'l4_packing' }
    },
    l4_packing: {
      on: { NEXT_STEP: 'l3_packing', PREV_STEP: 'idle' }
    },
    l3_packing: {
      on: { NEXT_STEP: 'l2_packing', PREV_STEP: 'l4_packing' }
    },
    l2_packing: {
      on: { NEXT_STEP: 'on_wire', PREV_STEP: 'l3_packing' }
    },
    on_wire: {
      on: { NEXT_STEP: 'decapsulating', PREV_STEP: 'l2_packing' }
    },
    decapsulating: {
      on: { NEXT_STEP: 'delivered', PREV_STEP: 'on_wire' }
    },
    delivered: {
      type: 'final'
    }
  }
});
