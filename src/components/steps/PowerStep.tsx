import { Check } from 'lucide-react';
import { useState } from 'react';
import StepCard from './StepCard';
import { ProjectRequirements, PowerSupply } from '../../types';

interface PowerStepProps {
  requirements: ProjectRequirements;
  updateRequirements: (updates: Partial<ProjectRequirements>) => void;
}

const powerOptions: {
  type: PowerSupply['type'];
  label: string;
  icon: string;
  desc: string;
  inputVoltage: string;
  outputVoltage: string;
  current: string;
}[] = [
  { 
    type: 'LDO', 
    label: 'LDO稳压器', 
    icon: '🔶',
    desc: '低压差线性稳压器，噪声低，效率中等',
    inputVoltage: '4.5-12V',
    outputVoltage: '3.3V/5V',
    current: '500mA'
  },
  { 
    type: 'Switching', 
    label: '开关电源', 
    icon: '⚡',
    desc: 'DC-DC开关稳压，高效率，发热小',
    inputVoltage: '4.5-40V',
    outputVoltage: '3.3V/5V',
    current: '2A'
  },
  { 
    type: 'Linear', 
    label: '线性电源', 
    icon: '📊',
    desc: '传统线性稳压，简单可靠，效率较低',
    inputVoltage: '7-24V',
    outputVoltage: '5V/3.3V',
    current: '1A'
  },
  { 
    type: 'Battery', 
    label: '电池供电', 
    icon: '🔋',
    desc: '锂电池供电方案，支持充电管理',
    inputVoltage: '3.0-4.2V',
    outputVoltage: '3.3V',
    current: '1A'
  },
];

export default function PowerStep({ requirements, updateRequirements }: PowerStepProps) {
  const selectedPower = requirements.power;
  const [batteryType, setBatteryType] = useState<'LiPo' | 'Li-ion' | 'CR2032'>('LiPo');

  const selectPower = (type: PowerSupply['type']) => {
    const option = powerOptions.find(o => o.type === type);
    if (option) {
      const power: PowerSupply = {
        id: `power-${Date.now()}`,
        type,
        inputVoltage: option.inputVoltage,
        outputVoltage: option.outputVoltage,
        current: option.current,
      };
      updateRequirements({ power });
    }
  };

  return (
    <StepCard
      title="电源配置"
      description="为系统选择合适的电源方案"
      icon={<span style={{ fontSize: '24px' }}>⚡</span>}
    >
      <div className="power-option-list">
        {powerOptions.map((option) => (
          <div
            key={option.type}
            className={`power-option ${selectedPower?.type === option.type ? 'selected' : ''}`}
            onClick={() => selectPower(option.type)}
          >
            <div className="power-option-header">
              <div className="power-option-title">{option.label}</div>
              <div className="power-option-icon">{option.icon}</div>
            </div>
            <div className="power-option-desc">{option.desc}</div>
            <div className="power-option-specs">
              <div className="power-spec-item">
                <span className="power-spec-label">输入电压</span>
                <span className="power-spec-value">{option.inputVoltage}</span>
              </div>
              <div className="power-spec-item">
                <span className="power-spec-label">输出电压</span>
                <span className="power-spec-value">{option.outputVoltage}</span>
              </div>
              <div className="power-spec-item">
                <span className="power-spec-label">输出电流</span>
                <span className="power-spec-value">{option.current}</span>
              </div>
            </div>
            {selectedPower?.type === option.type && (
              <div className="selected-indicator" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <Check size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPower?.type === 'Battery' && (
        <div className="battery-config">
          <label className="form-label">电池类型</label>
          <div className="battery-type">
            {(['LiPo', 'Li-ion', 'CR2032'] as const).map((type) => (
              <div
                key={type}
                className={`battery-type-item ${batteryType === type ? 'selected' : ''}`}
                onClick={() => setBatteryType(type)}
              >
                {type === 'LiPo' && '聚合物锂电池'}
                {type === 'Li-ion' && '锂电池'}
                {type === 'CR2032' && '纽扣电池'}
              </div>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}
