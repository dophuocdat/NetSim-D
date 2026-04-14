
import { calculateSubnetBoundaries } from '../../utils/subnetEngine';

interface MiniTopologyProps {
  ipA: string;
  ipB: string;
  cidr: number;
}

export default function MiniTopology({ ipA, ipB, cidr }: MiniTopologyProps) {
  const netA = calculateSubnetBoundaries(ipA, cidr).networkId;
  const netB = calculateSubnetBoundaries(ipB, cidr).networkId;
  const isReachable = netA === netB;

  return (
    <div className="mini-topology-container">
      <div className="topo-device">
        <div className="topo-icon">💻</div>
        <div className="topo-labels">
          <div className="topo-title">PC-A</div>
          <div className="topo-ip">{ipA}</div>
          <div className="topo-net text-xs opacity-50">Net: {netA}</div>
        </div>
      </div>

      <div className={`topo-bridge ${isReachable ? 'bridge-success' : 'bridge-broken'}`}>
        <div className="bridge-line"></div>
        {!isReachable && <div className="bridge-x">⨯</div>}
      </div>

      <div className="topo-device">
        <div className="topo-icon">💻</div>
        <div className="topo-labels">
          <div className="topo-title">PC-B</div>
          <div className="topo-ip">{ipB}</div>
          <div className="topo-net text-xs opacity-50">Net: {netB}</div>
        </div>
      </div>
    </div>
  );
}
