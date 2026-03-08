import { Check } from 'lucide-react';
import StepCard from './StepCard';
import { ProjectRequirements, Processor } from '../../types';

interface ProcessorStepProps {
  requirements: ProjectRequirements;
  updateRequirements: (updates: Partial<ProjectRequirements>) => void;
}

const processors: Processor[] = [
  { id: 'stm32f103', name: 'STM32F103C8T6', family: 'STM32', cores: 1, clockSpeed: '72MHz', voltage: '2.0-3.6V', package: 'LQFP-48', price: '¥8' },
  { id: 'stm32f407', name: 'STM32F407VGT6', family: 'STM32', cores: 1, clockSpeed: '168MHz', voltage: '1.8-3.6V', package: 'LQFP-100', price: '¥25' },
  { id: 'esp32', name: 'ESP32-WROOM-32', family: 'ESP32', cores: 2, clockSpeed: '240MHz', voltage: '3.0-3.6V', package: 'Module', price: '¥15' },
  { id: 'nrf52832', name: 'nRF52832', family: 'Nordic', cores: 1, clockSpeed: '64MHz', voltage: '1.7-3.6V', package: 'QFN-48', price: '¥12' },
  { id: 'atmega328p', name: 'ATmega328P', family: 'AVR', cores: 1, clockSpeed: '20MHz', voltage: '1.8-5.5V', package: 'DIP-28', price: '¥5' },
  { id: 'rp2040', name: 'RP2040', family: 'Raspberry Pi', cores: 2, clockSpeed: '133MHz', voltage: '1.8-5.5V', package: 'QFN-56', price: '¥8' },
];

export default function ProcessorStep({ requirements, updateRequirements }: ProcessorStepProps) {
  const selectedProcessor = requirements.processor;

  return (
    <StepCard
      title="选择处理器"
      description="根据您的应用需求，选择最适合的微控制器或微处理器"
      icon={<span style={{ fontSize: '24px' }}>🖥️</span>}
    >
      <div className="form-group">
        <label className="form-label">性能需求</label>
        <div className="option-grid">
          {[
            { id: 'low', label: '低性能', desc: '简单控制、传感器读取' },
            { id: 'medium', label: '中等性能', desc: '通信协议处理、数据采集' },
            { id: 'high', label: '高性能', desc: '图形显示、复杂算法、实时处理' },
          ].map((item) => (
            <div
              key={item.id}
              className={`option-card ${requirements.requirements.find(r => r.id === 'performance')?.answer === item.id ? 'selected' : ''}`}
              onClick={() => {
                updateRequirements({
                  requirements: [
                    ...requirements.requirements.filter(r => r.id !== 'performance'),
                    { id: 'performance', category: 'processor', question: '性能需求', answer: item.id }
                  ]
                });
              }}
            >
              {requirements.requirements.find(r => r.id === 'performance')?.answer === item.id && (
                <div className="selected-indicator"><Check size={14} /></div>
              )}
              <div className="option-title">{item.label}</div>
              <div className="option-description">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">推荐处理器</label>
        <div className="processor-list">
          {processors.map((proc) => (
            <div
              key={proc.id}
              className={`processor-card ${selectedProcessor?.id === proc.id ? 'selected' : ''}`}
              onClick={() => updateRequirements({ processor: proc })}
            >
              <div className="processor-header">
                <div className="processor-name">{proc.name}</div>
                <div className="processor-family">{proc.family}</div>
              </div>
              <div className="processor-specs">
                <div className="spec-item">
                  <span className="spec-label">核心</span>
                  <span className="spec-value">{proc.cores}核</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">频率</span>
                  <span className="spec-value">{proc.clockSpeed}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">电压</span>
                  <span className="spec-value">{proc.voltage}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">封装</span>
                  <span className="spec-value">{proc.package}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">参考价</span>
                  <span className="spec-value price">{proc.price}</span>
                </div>
              </div>
              {selectedProcessor?.id === proc.id && (
                <div className="processor-selected">
                  <Check size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </StepCard>
  );
}
