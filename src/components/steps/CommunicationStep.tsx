import { Check, Minus, Plus, X } from 'lucide-react';
import StepCard from './StepCard';
import { ProjectRequirements, CommunicationInterface } from '../../types';

interface CommunicationStepProps {
  requirements: ProjectRequirements;
  updateRequirements: (updates: Partial<ProjectRequirements>) => void;
}

const communicationOptions: { 
  type: CommunicationInterface['type']; 
  name: string; 
  icon: string;
  desc: string 
}[] = [
  { type: 'UART', name: 'UART', icon: '🔌', desc: '串口通信' },
  { type: 'SPI', name: 'SPI', icon: '⚡', desc: '高速同步串行' },
  { type: 'I2C', name: 'I2C', icon: '📡', desc: '两线串行总线' },
  { type: 'USB', name: 'USB', icon: '🔋', desc: '通用串行总线' },
  { type: 'CAN', name: 'CAN', icon: '🚗', desc: '汽车网络' },
  { type: 'Ethernet', name: 'Ethernet', icon: '🌐', desc: '以太网' },
  { type: 'BLE', name: 'BLE', icon: '📶', desc: '低功耗蓝牙' },
  { type: 'WiFi', name: 'WiFi', icon: '📱', desc: '无线网络' },
];

export default function CommunicationStep({ requirements, updateRequirements }: CommunicationStepProps) {
  const selectedComms = requirements.communications || [];

  const toggleComm = (type: CommunicationInterface['type']) => {
    const exists = selectedComms.find(c => c.type === type);
    if (exists) {
      updateRequirements({
        communications: selectedComms.filter(c => c.type !== type),
      });
    } else {
      const newComm: CommunicationInterface = {
        id: `${type}-${Date.now()}`,
        name: communicationOptions.find(c => c.type === type)?.name || type,
        type,
      };
      updateRequirements({
        communications: [...selectedComms, newComm],
      });
    }
  };

  const updateCommCount = (type: CommunicationInterface['type'], delta: number) => {
    updateRequirements({
      communications: selectedComms.map(c => {
        if (c.type === type) {
          const count = (c as any).count || 1;
          const newCount = Math.max(1, Math.min(4, count + delta));
          return { ...c, count: newCount };
        }
        return c;
      }),
    });
  };

  return (
    <StepCard
      title="通信接口"
      description="选择项目需要的通信接口"
      icon={<span style={{ fontSize: '24px' }}>📡</span>}
    >
      <div className="comm-list">
        {communicationOptions.map((comm) => {
          const selected = selectedComms.find(c => c.type === comm.type);
          const count = (selected as any)?.count || 1;
          
          return (
            <div
              key={comm.type}
              className={`comm-item ${selected ? 'selected' : ''}`}
              onClick={() => toggleComm(comm.type)}
            >
              <div className="comm-checkbox">
                {selected && <Check size={14} />}
              </div>
              <div className="comm-icon">{comm.icon}</div>
              <div className="comm-info">
                <div className="comm-name">{comm.name}</div>
                <div className="comm-desc">{comm.desc}</div>
              </div>
              {selected && (
                <div className="comm-count">
                  <span className="count-label">数量:</span>
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn" 
                      onClick={(e) => { e.stopPropagation(); updateCommCount(comm.type, -1); }}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="quantity-value">{count}</span>
                    <button 
                      className="quantity-btn"
                      onClick={(e) => { e.stopPropagation(); updateCommCount(comm.type, 1); }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedComms.length > 0 && (
        <div className="tag-container" style={{ marginTop: '1.5rem' }}>
          {selectedComms.map((comm) => (
            <span key={comm.type} className="tag">
              {comm.name}
              <button 
                className="tag-remove" 
                onClick={() => toggleComm(comm.type)}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </StepCard>
  );
}
