import { Check, Cpu, MemoryStick, Wifi, Zap, Box } from 'lucide-react';
import StepCard from './StepCard';
import { ProjectRequirements } from '../../types';

interface ReviewStepProps {
  requirements: ProjectRequirements;
}

const domainMap: Record<string, string> = {
  iot: '物联网设备',
  industrial: '工业控制',
  consumer: '消费电子',
  automotive: '汽车电子',
  medical: '医疗设备',
  education: '教育科研',
};

const volumeMap: Record<string, string> = {
  prototype: '原型/样机 (1-10台)',
  small: '小批量 (10-100台)',
  medium: '中批量 (100-1000台)',
  mass: '大批量 (1000台以上)',
};

export default function ReviewStep({ requirements }: ReviewStepProps) {
  const domain = requirements.requirements.find(r => r.id === 'domain')?.answer as string;
  const volume = requirements.requirements.find(r => r.id === 'volume')?.answer as string;

  return (
    <StepCard
      title="确认项目配置"
      description="请确认以下配置信息是否正确"
      icon={<span style={{ fontSize: '24px' }}>✅</span>}
    >
      <div className="review-section">
        <div className="review-section-title">
          <span className="review-section-icon">📋</span>
          基本信息
        </div>
        <div className="review-items">
          <div className="review-item">
            <span className="review-item-label">项目名称</span>
            <span className="review-item-value highlight">{requirements.projectName}</span>
          </div>
          {requirements.description && (
            <div className="review-item">
              <span className="review-item-label">项目描述</span>
              <span className="review-item-value">{requirements.description}</span>
            </div>
          )}
          {domain && (
            <div className="review-item">
              <span className="review-item-label">应用领域</span>
              <span className="review-item-value">{domainMap[domain] || domain}</span>
            </div>
          )}
          {volume && (
            <div className="review-item">
              <span className="review-item-label">预计产量</span>
              <span className="review-item-value">{volumeMap[volume] || volume}</span>
            </div>
          )}
        </div>
      </div>

      {requirements.processor && (
        <div className="review-section">
          <div className="review-section-title">
            <Cpu size={18} className="review-section-icon" />
            处理器
          </div>
          <div className="review-items">
            <div className="review-item">
              <span className="review-item-label">型号</span>
              <span className="review-item-value highlight">{requirements.processor.name}</span>
            </div>
            <div className="review-item">
              <span className="review-item-label">规格</span>
              <span className="review-item-value">
                {requirements.processor.cores}核 @ {requirements.processor.clockSpeed}
              </span>
            </div>
          </div>
        </div>
      )}

      {requirements.memory && requirements.memory.length > 0 && (
        <div className="review-section">
          <div className="review-section-title">
            <MemoryStick size={18} className="review-section-icon" />
            存储
          </div>
          <div className="review-list">
            {requirements.memory.map((mem) => (
              <div key={mem.id} className="review-list-item">
                <Check size={14} className="review-list-item-icon" />
                {mem.type} - {mem.size}
              </div>
            ))}
          </div>
        </div>
      )}

      {requirements.communications && requirements.communications.length > 0 && (
        <div className="review-section">
          <div className="review-section-title">
            <Wifi size={18} className="review-section-icon" />
            通信接口
          </div>
          <div className="review-list">
            {requirements.communications.map((comm) => (
              <div key={comm.id} className="review-list-item">
                <Check size={14} className="review-list-item-icon" />
                {comm.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {requirements.power && (
        <div className="review-section">
          <div className="review-section-title">
            <Zap size={18} className="review-section-icon" />
            电源
          </div>
          <div className="review-items">
            <div className="review-item">
              <span className="review-item-label">类型</span>
              <span className="review-item-value highlight">{requirements.power.type}</span>
            </div>
            <div className="review-item">
              <span className="review-item-label">输出</span>
              <span className="review-item-value">
                {requirements.power.outputVoltage} @ {requirements.power.current}
              </span>
            </div>
          </div>
        </div>
      )}

      {requirements.peripherals && requirements.peripherals.length > 0 && (
        <div className="review-section">
          <div className="review-section-title">
            <Box size={18} className="review-section-icon" />
            外设
          </div>
          <div className="review-list">
            {requirements.peripherals.map((periph) => (
              <div key={periph.id} className="review-list-item">
                <Check size={14} className="review-list-item-icon" />
                {periph.name} x {periph.count}
              </div>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}
