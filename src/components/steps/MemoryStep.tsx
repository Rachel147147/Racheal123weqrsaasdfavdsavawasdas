import { X, Check } from 'lucide-react';
import StepCard from './StepCard';
import { ProjectRequirements, Memory } from '../../types';

interface MemoryStepProps {
  requirements: ProjectRequirements;
  updateRequirements: (updates: Partial<ProjectRequirements>) => void;
}

const memoryTypes: { type: Memory['type']; label: string; desc: string }[] = [
  { type: 'Flash', label: 'Flash存储器', desc: '用于程序存储和固件更新' },
  { type: 'SRAM', label: 'SRAM', desc: '高速运行内存，易失性' },
  { type: 'DRAM', label: 'DRAM', desc: '大容量数据存储' },
  { type: 'EEPROM', label: 'EEPROM', desc: '参数存储，非易失性' },
];

const memorySizes = ['64KB', '128KB', '256KB', '512KB', '1MB', '2MB', '4MB', '8MB', '16MB'];

export default function MemoryStep({ requirements, updateRequirements }: MemoryStepProps) {
  const selectedMemories = requirements.memory || [];

  const addMemory = (type: Memory['type']) => {
    const newMemory: Memory = {
      id: `${type}-${Date.now()}`,
      type,
      size: type === 'Flash' ? '256KB' : type === 'SRAM' ? '64KB' : type === 'EEPROM' ? '4KB' : '512MB',
      voltage: '3.3V',
      package: type === 'Flash' ? 'SOP-8' : 'BGA',
    };
    updateRequirements({
      memory: [...selectedMemories, newMemory],
    });
  };

  const updateMemory = (id: string, updates: Partial<Memory>) => {
    updateRequirements({
      memory: selectedMemories.map(m => m.id === id ? { ...m, ...updates } : m),
    });
  };

  const removeMemory = (id: string) => {
    updateRequirements({
      memory: selectedMemories.filter(m => m.id !== id),
    });
  };

  return (
    <StepCard
      title="存储配置"
      description="根据应用需求选择合适的存储方案"
      icon={<span style={{ fontSize: '24px' }}>💾</span>}
    >
      <div className="form-group">
        <label className="form-label">存储类型</label>
        <div className="option-grid">
          {memoryTypes.map((mem) => (
            <div
              key={mem.type}
              className={`option-card ${selectedMemories.some(m => m.type === mem.type) ? 'selected' : ''}`}
              onClick={() => !selectedMemories.some(m => m.type === mem.type) && addMemory(mem.type)}
            >
              {selectedMemories.some(m => m.type === mem.type) && (
                <div className="selected-indicator"><Check size={14} /></div>
              )}
              <div className="option-title">{mem.label}</div>
              <div className="option-description">{mem.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedMemories.length > 0 && (
        <div className="config-section">
          <div className="config-title">已配置的存储</div>
          <div className="memory-config-list">
            {selectedMemories.map((mem) => (
              <div key={mem.id} className="memory-config-item">
                <div className="memory-config-info">
                  <div className="memory-config-name">{mem.type} - {mem.size}</div>
                  <div className="memory-config-details">
                    电压: {mem.voltage} | 封装: {mem.package}
                  </div>
                </div>
                <div className="memory-config-actions">
                  <select
                    className="form-input"
                    style={{ padding: '0.5rem', width: 'auto', minWidth: '100px' }}
                    value={mem.size}
                    onChange={(e) => updateMemory(mem.id, { size: e.target.value })}
                  >
                    {memorySizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <button className="remove-btn" onClick={() => removeMemory(mem.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}
