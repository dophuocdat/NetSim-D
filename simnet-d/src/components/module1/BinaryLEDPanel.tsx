

interface BinaryLEDPanelProps {
  bits: number[];
  cidr: number;
}

export default function BinaryLEDPanel({ bits, cidr }: BinaryLEDPanelProps) {
  // Split bits into 4 octets
  const octets = [];
  for (let i = 0; i < 4; i++) {
    octets.push(bits.slice(i * 8, (i + 1) * 8));
  }

  return (
    <div className="led-panel">
      {octets.map((octetBits, octetIndex) => (
        <div key={octetIndex} className="led-octet">
          {octetBits.map((bit, bitIndex) => {
            const absoluteIndex = octetIndex * 8 + bitIndex;
            const isNetwork = absoluteIndex < cidr;
            return (
              <div 
                key={absoluteIndex} 
                className={`led-bit ${isNetwork ? 'led-network' : 'led-host'}`}
              >
                <div className={`led-light ${bit === 1 ? 'led-on' : 'led-off'}`}></div>
                <div className="led-value">{bit}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
