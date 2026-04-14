import { useState } from 'react';

interface XRayProps {
  packetInfo: { mac?: string; ip?: string; port?: string };
}

export default function XRayTool({ packetInfo }: XRayProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div 
        className="xray-trigger"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span role="img" aria-label="search">🔍</span> X-Ray Scanner
      </div>

      {isHovered && (
        <div className="xray-popup">
          <div className="xray-title">Deep Packet Inspection</div>
          <div className="xray-details">
            {packetInfo.port && <div style={{ color: '#fba94c' }}>Port: {packetInfo.port}</div>}
            {packetInfo.ip && <div style={{ color: '#60a5fa' }}>IP: {packetInfo.ip}</div>}
            {packetInfo.mac && <div style={{ color: '#c084fc' }}>MAC: {packetInfo.mac}</div>}
          </div>
          <div className="xray-arrow"></div>
        </div>
      )}
    </div>
  );
}
