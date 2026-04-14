

interface StepControlsProps {
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
}

export default function StepControls({ onNext, onPrev, canNext, canPrev }: StepControlsProps) {
  return (
    <div className="step-controls">
      <button 
        onClick={onPrev} 
        disabled={!canPrev} 
        className="btn-step btn-prev"
      >
        Previous Step
      </button>
      <button 
        onClick={onNext} 
        disabled={!canNext} 
        className="btn-step btn-next"
      >
        Next Step
      </button>
    </div>
  );
}
