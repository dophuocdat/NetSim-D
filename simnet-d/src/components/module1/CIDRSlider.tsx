

interface CIDRSliderProps {
  cidr: number;
  onChange: (cidr: number) => void;
}

export default function CIDRSlider({ cidr, onChange }: CIDRSliderProps) {
  return (
    <div className="cidr-slider-container">
      <div className="cidr-header">
        <span className="cidr-label">Subnet Mask (CIDR)</span>
        <span className="cidr-value">/{cidr}</span>
      </div>
      <input 
        type="range" 
        min="8" 
        max="30" 
        value={cidr} 
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="cidr-slider-input"
      />
      <div className="cidr-markers">
        <span>/8</span>
        <span>/16</span>
        <span>/24</span>
        <span>/30</span>
      </div>
    </div>
  );
}
