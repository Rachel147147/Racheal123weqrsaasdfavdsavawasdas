import StepCard from './StepCard';
import { ProjectRequirements } from '../../types';

interface BasicInfoStepProps {
  requirements: ProjectRequirements;
  updateRequirements: (updates: Partial<ProjectRequirements>) => void;
}

export default function BasicInfoStep({ requirements, updateRequirements }: BasicInfoStepProps) {
  return (
    <StepCard
      title="项目基本信息"
      description="首先，让我们了解一下您的项目基本信息和应用场景"
      icon={<span style={{ fontSize: '24px' }}>📋</span>}
    >
      <div className="form-group">
        <label className="form-label">项目名称 *</label>
        <input
          type="text"
          className="form-input"
          placeholder="例如：智能温湿度监测系统"
          value={requirements.projectName}
          onChange={(e) => updateRequirements({ projectName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">项目描述</label>
        <textarea
          className="form-input form-textarea"
          placeholder="请简要描述您的项目功能和应用场景..."
          value={requirements.description}
          onChange={(e) => updateRequirements({ description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">应用领域</label>
        <div className="option-grid">
          {[
            { id: 'iot', label: '物联网设备', desc: '智能家居、传感器节点等' },
            { id: 'industrial', label: '工业控制', desc: 'PLC、电机控制、自动化设备' },
            { id: 'consumer', label: '消费电子', desc: '智能穿戴、小家电等' },
            { id: 'automotive', label: '汽车电子', desc: '车载控制器、ADAS等' },
            { id: 'medical', label: '医疗设备', desc: '便携式医疗、监护设备' },
            { id: 'education', label: '教育科研', desc: '实验平台、学习套件' },
          ].map((item) => (
            <div
              key={item.id}
              className={`option-card ${requirements.requirements.find(r => r.id === 'domain')?.answer === item.id ? 'selected' : ''}`}
              onClick={() => {
                updateRequirements({
                  requirements: [
                    ...requirements.requirements.filter(r => r.id !== 'domain'),
                    { id: 'domain', category: 'basic', question: '应用领域', answer: item.id }
                  ]
                });
              }}
            >
              {requirements.requirements.find(r => r.id === 'domain')?.answer === item.id && (
                <div className="selected-indicator">✓</div>
              )}
              <div className="option-title">{item.label}</div>
              <div className="option-description">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">预计产量</label>
        <div className="option-grid">
          {[
            { id: 'prototype', label: '原型/样机', desc: '1-10台' },
            { id: 'small', label: '小批量', desc: '10-100台' },
            { id: 'medium', label: '中批量', desc: '100-1000台' },
            { id: 'mass', label: '大批量', desc: '1000台以上' },
          ].map((item) => (
            <div
              key={item.id}
              className={`option-card ${requirements.requirements.find(r => r.id === 'volume')?.answer === item.id ? 'selected' : ''}`}
              onClick={() => {
                updateRequirements({
                  requirements: [
                    ...requirements.requirements.filter(r => r.id !== 'volume'),
                    { id: 'volume', category: 'basic', question: '预计产量', answer: item.id }
                  ]
                });
              }}
            >
              {requirements.requirements.find(r => r.id === 'volume')?.answer === item.id && (
                <div className="selected-indicator">✓</div>
              )}
              <div className="option-title">{item.label}</div>
              <div className="option-description">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </StepCard>
  );
}
