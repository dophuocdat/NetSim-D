import { setup, assign } from 'xstate';

interface SimulationContext {
  currentStep: number;
  totalSteps: number;
}

type SimulationEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

export const simulationMachine = setup({
  types: {
    context: {} as SimulationContext,
    events: {} as SimulationEvent,
    input: {} as { totalSteps: number },
  },
}).createMachine({
  id: 'simulation',
  initial: 'idle',
  context: ({ input }) => ({
    currentStep: 0,
    totalSteps: input?.totalSteps ?? 0,
  }),
  states: {
    idle: {
      on: {
        START: {
          target: 'playing',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
    playing: {
      on: {
        PAUSE: 'paused',
        NEXT_STEP: [
          {
            guard: ({ context }) => context.currentStep >= context.totalSteps - 1,
            target: 'completed',
          },
          {
            actions: assign({
              currentStep: ({ context }) => context.currentStep + 1,
            }),
          },
        ],
        PREV_STEP: {
          actions: assign({
            currentStep: ({ context }) => Math.max(0, context.currentStep - 1),
          }),
        },
        RESET: {
          target: 'idle',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
    paused: {
      on: {
        RESUME: 'playing',
        NEXT_STEP: [
          {
            guard: ({ context }) => context.currentStep >= context.totalSteps - 1,
            target: 'completed',
          },
          {
            target: 'playing',
            actions: assign({
              currentStep: ({ context }) => context.currentStep + 1,
            }),
          },
        ],
        PREV_STEP: {
          target: 'playing',
          actions: assign({
            currentStep: ({ context }) => Math.max(0, context.currentStep - 1),
          }),
        },
        RESET: {
          target: 'idle',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
    completed: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({ currentStep: 0 }),
        },
      },
    },
  },
});
