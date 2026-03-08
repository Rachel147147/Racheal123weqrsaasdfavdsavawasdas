import { Check, Minus, Plus } from 'lucide-react';
import StepCard from './StepCard';
import { ProjectRequirements, Peripheral } from '../../types';

interface PeripheralsStepProps {
  requirements: ProjectRequirements;
  updateRequirements: (updates: Partial<ProjectRequirements>) => void;
}

const peripheralOptions: {
  type: string;
  name: string;
  icon: string;
}[] = [
  { type: 'GPIO', name: 'GPIO', icon: '🔹' },
  { type: 'ADC', name: 'ADC', icon: '📊' },
  { type: 'DAC', name: 'DAC', icon: '📈' },
  { type: 'PWM', name: 'PWM', icon: '〰️' },
  { type: 'Timer', name: '定时器', icon: '⏱️' },
  { type: 'Interrupt', name: '中断', icon: '⚡' },
  { type: 'RTC', name: 'RTC', icon: '🕐' },
  { type: 'Watchdog', name: '看门狗', icon: '🐕' },
  { type: 'DMA', name: 'DMA', icon: '🚀' },
  { type: 'CRC', name: 'CRC', icon: '🔒' },
  { type: 'TempSensor', name: '温度传感器', icon: '🌡️' },
  { type: 'Comparator', name: '比较器', icon: '⚖️' },
];

export default function PeripheralsStep({ requirements, updateRequirements }: PeripheralsStepProps) {
  const selectedPeripherals = requirements.peripherals || [];

  const togglePeripheral = (type: string) => {
    const exists = selectedPeripherals.find(p => p.type === type);
    if (exists) {
      updateRequirements({
        peripherals: selectedPeripherals.filter(p => p.type !== type),
      });
    } else {
      const newPeripheral: Peripheral = {
        id: `${type}-${Date.now()}`,
        name: peripheralOptions.find(p => p.type === type)?.name || type,
        type,
        count: 1,
      };
      updateRequirements({
        peripherals: [...selectedPeripherals, newPeripheral],
      });
    }
  };

  const updatePeripheralCount = (type: string, delta: number) => {
    updateRequirements({
      peripherals: selectedPeripherals.map(p => {
        if (p.type === type) {
          return { ...p, count: Math.max(1, Math.min(8, p.count + delta)) };
        }
        return p;
      }),
    });
  };

  return (
    <StepCard
      title="外设配置"
      description="选择项目需要的外设功能"
      icon={<span style={{ fontSize: '24px' }}>🔌</span>}
    >
      <div className="peripherals-grid">
        {peripheralOptions.map((periph) => {
          const selected = selectedPeripherals.find(p => p.type === periph.type);
          const count = selected?.count || 0;
          
          return (
            <div
              key={periph.type}
              className={`peripheral-item ${selected ? 'selected' : ''}`}
              onClick={() => togglePeripheral(periph.type)}
            >
              {selected && count > 0 && (
                <div className="peripheral-selected-badge">
                  <Check size={12} />
                </div>
              )}
              <div className="peripheral-icon">{periph.icon}</div>
              <div className="peripheral-name">{periph.name}</div>
              {selected ? (
                <div className="peripheral-qty-selector" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="peripheral-qty-btn"
                    onClick={() => updatePeripheralCount(periph.type, -1)}
                  >
                    <Minus size={10} />
                  </button>
                  <span className="peripheral-qty-num">{count}</span>
                  <button 
                    className="peripheral-qty-btn"
                    onClick={() => updatePeripheralCount(periph.type, 1)}
                  >
                    <Plus size={10} />
                  </button>
                </div>
              ) : (
                <div className="peripheral-qty">点击添加</div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPeripherals.length > 0 && (
        <div className="tag-container" style={{ marginTop: '1.5rem' }}>
          {selectedPeripherals.map((periph) => (
            <span key={periph.type} className="tag">
              {periph.name} x{periph.count}
              <button 
                className="tag-remove" 
                onClick={() => togglePeripheral(periph.type)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </StepCard>
  );
}
