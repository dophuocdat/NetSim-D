import { useState, useMemo, useEffect } from 'react';
import BinaryLEDPanel from '../../components/module1/BinaryLEDPanel';
import CIDRSlider from '../../components/module1/CIDRSlider';
import MiniTopology from '../../components/module1/MiniTopology';
import { getBitsFromIP, calculateSubnetBoundaries } from '../../utils/subnetEngine';
import { useLessonData } from '../../hooks/useLessonData';
import '../../styles/module1-subnetting.css';

export default function FundamentalsSubnetting() {
  const { data: lesson, isLoading, error } = useLessonData('subnetting');
  const [cidr, setCidr] = useState<number | null>(null);

  useEffect(() => {
    if (lesson?.base_topology?.defaultCidr && cidr === null) {
      setCidr(lesson.base_topology.defaultCidr);
    }
  }, [lesson, cidr]);

  const targetIp = lesson?.base_topology?.devices?.pcA?.ip || '0.0.0.0';
  const bits = useMemo(() => getBitsFromIP(targetIp), [targetIp]);
  const bounds = useMemo(() => calculateSubnetBoundaries(targetIp, cidr || 24), [targetIp, cidr]);

  if (isLoading) {
    return <div className="subnet-loading">Đang tải cấu hình mô phỏng...</div>;
  }

  if (error || !lesson || cidr === null) {
    return <div className="subnet-error">Lỗi tải dữ liệu: {error ? error.toString() : 'Không tìm thấy'}</div>;
  }

  const topo = lesson.base_topology;

  return (
    <div className="subnet-container disable-scrollbar">
      <div className="subnet-layout">
        
        {/* LEFT PANEL: CONTENT & CONTROLS */}
        <aside className="subnet-left-panel">
          <header className="subnet-header">
            <div className="badge">Giai Đoạn 2</div>
            <h2>{lesson.title}</h2>
            <p>{lesson.description}</p>
          </header>

          <div className="subnet-controls-card">
            <h3 className="section-title">Điều Chỉnh Subnet Mask</h3>
            <p className="section-subtitle">Chạm và kéo để chia lại ranh giới Network/Host</p>
            <CIDRSlider cidr={cidr} onChange={setCidr} />
          </div>

          <div className="subnet-info-card glass-panel">
            <h3 className="section-title">Phân tích Địa chỉ (Routing Details)</h3>
            
            <div className="info-row">
              <span className="info-label">IP Mục Tiêu:</span>
              <span className="info-value text-blue">{targetIp}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Subnet Mask:</span>
              <span className="info-value text-purple">/{cidr}</span>
            </div>

            <div className="divider"></div>

            <div className="info-row highlight-net">
              <span className="info-label">Địa chỉ Mạng (Network ID):</span>
              <span className="info-value">{bounds.networkId}</span>
            </div>
            
            <div className="info-row highlight-broad">
              <span className="info-label">Địa chỉ Broadcast:</span>
              <span className="info-value">{bounds.broadcastId}</span>
            </div>
            <p className="info-hint">Mọi IP nằm giữa khoảng này sẽ giao tiếp được với nhau trực tiếp qua Switch (L2).</p>
          </div>
        </aside>

        {/* RIGHT PANEL: ANIMATION & INTERACTION */}
        <main className="subnet-right-panel">
          
          <section className="interactive-section glass-panel">
            <h3 className="section-title center">Dải Nhị Phân 32-Bit (Binary Octets)</h3>
            <p className="section-subtitle center">Đỏ (Mạng lưới/Net) - Xanh dương (Thiết bị/Host)</p>
            <div className="led-showcase">
              <BinaryLEDPanel bits={bits} cidr={cidr} />
            </div>
          </section>

          <section className="interactive-section glass-panel topology-section">
             <div className="topo-header">
                <h3 className="section-title">Thử Thách: "Cây Cầu Gãy" (Layer 3 Routing)</h3>
                <p className="section-subtitle">
                  {topo.devices.pcA.name} ({topo.devices.pcA.ip}) đang cố Ping đến {topo.devices.pcB.name} ({topo.devices.pcB.ip}).<br/> 
                  Hãy tinh chỉnh thanh trượt CIDR cho đến khi mạng nội bộ đủ lớn để chứa cả 2 thiết bị nhé!
                </p>
             </div>
             <div className="topo-stage">
                <MiniTopology ipA={topo.devices.pcA.ip} ipB={topo.devices.pcB.ip} cidr={cidr} />
             </div>
          </section>

        </main>
      </div>
    </div>
  );
}
