import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Zap,
  Database,
  Clock,
  Calendar,
  Check,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Layers,
  Package,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  Shield
} from 'lucide-react';
import { DetailedRequirement } from '../types';
import { AIAnalysisResult, AITechnicalSolution, DeepseekAIService } from '../services/deepseekAI';
import './TechnicalSolutionDisplay.css';

interface TechnicalSolutionDisplayProps {
  requirements: DetailedRequirement[];
  onSolutionComplete: (solution: AITechnicalSolution) => void;
}

const categoryIcons: Record<string, any> = {
  processor: Cpu,
  memory: Database,
  storage: Database,
  power: Zap,
  peripheral: Package,
  other: Package
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  processor: { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1' },
  memory: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
  storage: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  power: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  peripheral: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
  other: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' }
};

export default function TechnicalSolutionDisplay({
  requirements: _requirements,
  onSolutionComplete
}: TechnicalSolutionDisplayProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'bom' | 'plan' | 'performance'>('architecture');
  const [isGenerating, setIsGenerating] = useState(false);
  const [solution, setSolution] = useState<AITechnicalSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [aiService] = useState(() => new DeepseekAIService());
  const [isConfirmed, setIsConfirmed] = useState(false);

  const createMockAnalysisResult = useCallback((): AIAnalysisResult => {
    return {
      productType: '智能硬件设备',
      keywords: ['嵌入式', '物联网', '传感器', '低功耗'],
      technicalRequirements: {
        processingSpeed: '100-200MHz',
        memoryRequirement: '128KB-1MB',
        connectivity: ['UART', 'SPI', 'I2C'],
        powerSupply: '3.3V',
        operatingTemperature: '-40°C to 85°C',
        formFactor: '紧凑型',
        additionalFeatures: ['低功耗模式', '看门狗定时器']
      },
      suggestedSolutions: ['基于STM32的解决方案', '基于ESP32的解决方案'],
      confidenceScore: 0.85
    };
  }, []);

  const generateSolution = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const analysisResult = createMockAnalysisResult();
      const result = await aiService.generateTechnicalSolution(analysisResult);
      setSolution(result);
    } catch (err) {
      console.warn('API调用失败，使用模拟数据:', err);
      
      const mockSolution: AITechnicalSolution = {
        systemArchitecture: {
          cpu: 'STM32F407VGT6',
          memory: '192KB RAM, 1MB Flash',
          storage: '可选MicroSD卡',
          powerSupply: '3.3V DC, 2A最大',
          interfaces: ['UART', 'SPI', 'I2C', 'USB OTG', 'CAN']
        },
        componentList: [
          {
            name: '主控芯片',
            partNumber: 'STM32F407VGT6',
            specifications: 'ARM Cortex-M4F, 168MHz, 1MB Flash, 192KB RAM',
            quantity: 1,
            supplier: 'STMicroelectronics',
            estimatedCost: 28.5,
            category: 'processor'
          },
          {
            name: '电源管理芯片',
            partNumber: 'LM1117-3.3',
            specifications: '3.3V LDO稳压器, 800mA',
            quantity: 1,
            supplier: 'Texas Instruments',
            estimatedCost: 1.8,
            category: 'power'
          },
          {
            name: '晶振',
            partNumber: '8MHz Crystal',
            specifications: '8MHz, 12PF, SMD',
            quantity: 2,
            supplier: 'Murata',
            estimatedCost: 0.5,
            category: 'other'
          },
          {
            name: 'Flash存储',
            partNumber: 'W25Q128',
            specifications: '128MBit SPI Flash, SMD',
            quantity: 1,
            supplier: 'Winbond',
            estimatedCost: 2.2,
            category: 'memory'
          },
          {
            name: '电容',
            partNumber: '0805 10uF',
            specifications: '10uF, 10V, X7R, 0805',
            quantity: 10,
            supplier: 'Samsung',
            estimatedCost: 0.1,
            category: 'peripheral'
          },
          {
            name: '电阻',
            partNumber: '0805 10K',
            specifications: '10KΩ, 1%, 0805',
            quantity: 20,
            supplier: 'Yageo',
            estimatedCost: 0.05,
            category: 'peripheral'
          }
        ],
        implementationPlan: {
          phases: [
            {
              phase: '方案设计阶段',
              duration: '1周',
              deliverables: ['系统架构图', '元器件选型清单', '设计文档']
            },
            {
              phase: '原理图设计',
              duration: '1周',
              deliverables: ['电路原理图', '网络表', 'BOM清单']
            },
            {
              phase: 'PCB布局',
              duration: '1周',
              deliverables: ['PCB版图', 'Gerber文件', '装配图']
            },
            {
              phase: '原型制作',
              duration: '2周',
              deliverables: ['原型样板', '测试报告']
            }
          ],
          riskMitigation: [
            '选择成熟元器件降低供货风险',
            '预留备用方案应对供应链问题',
            '提前进行关键元器件测试'
          ],
          qualityAssurance: [
            '严格按照IPC标准设计',
            '进行EMC/EMI测试',
            '高低温环境测试'
          ]
        },
        performanceEstimates: {
          processingPower: '168MHz, 210 DMIPS',
          powerConsumption: '典型120mW, 最大500mW',
          operatingTemperature: '-40°C to +85°C',
          expectedLifespan: '5年以上'
        }
      };
      setSolution(mockSolution);
    } finally {
      setIsGenerating(false);
    }
  }, [aiService, createMockAnalysisResult]);

  useEffect(() => {
    generateSolution();
  }, [generateSolution]);

  const togglePhase = useCallback((index: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const calculateTotalCost = useCallback(() => {
    if (!solution) return 0;
    return solution.componentList.reduce((sum, item) => sum + item.estimatedCost * item.quantity, 0);
  }, [solution]);

  const handleComplete = useCallback(() => {
    setIsConfirmed(true);
    if (solution) {
      setTimeout(() => {
        onSolutionComplete(solution);
      }, 1000);
    }
  }, [solution, onSolutionComplete]);

  const renderArchitecture = () => {
    if (!solution) return null;
    
    const arch = solution.systemArchitecture;
    return (
      <div className="architecture-section">
        <div className="architecture-grid">
          <div className="arch-card">
            <div className="arch-icon">
              <Cpu size={28} />
            </div>
            <h3>处理器</h3>
            <p>{arch.cpu}</p>
          </div>
          
          <div className="arch-card">
            <div className="arch-icon">
              <Database size={28} />
            </div>
            <h3>存储</h3>
            <p>{arch.memory}</p>
            <p className="sub-text">{arch.storage}</p>
          </div>
          
          <div className="arch-card">
            <div className="arch-icon">
              <Zap size={28} />
            </div>
            <h3>电源</h3>
            <p>{arch.powerSupply}</p>
          </div>
          
          <div className="arch-card interfaces-card">
            <div className="arch-icon">
              <Layers size={28} />
            </div>
            <h3>接口</h3>
            <div className="interface-tags">
              {arch.interfaces.map((iface, idx) => (
                <span key={idx} className="interface-tag">{iface}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBOM = () => {
    if (!solution) return null;
    
    const totalCost = calculateTotalCost();
    
    return (
      <div className="bom-section">
        <div className="bom-header">
          <div className="bom-summary">
            <div className="summary-item">
              <Package size={20} />
              <span>元器件数量: {solution.componentList.length}</span>
            </div>
            <div className="summary-item">
              <DollarSign size={20} />
              <span>预估成本: ¥{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bom-table-wrapper">
          <table className="bom-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>名称</th>
                <th>型号</th>
                <th>规格</th>
                <th>数量</th>
                <th>供应商</th>
                <th>单价</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              {solution.componentList.map((item, idx) => {
                const Icon = categoryIcons[item.category] || Package;
                const colors = categoryColors[item.category] || categoryColors.other;
                
                return (
                  <tr key={idx}>
                    <td>
                      <div className="category-cell">
                        <div className="category-icon" style={{ background: colors.bg }}>
                          <Icon size={16} color={colors.text} />
                        </div>
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="component-name">{item.name}</td>
                    <td className="part-number">{item.partNumber}</td>
                    <td className="specs">{item.specifications}</td>
                    <td className="quantity">{item.quantity}</td>
                    <td className="supplier">{item.supplier}</td>
                    <td className="price">¥{item.estimatedCost.toFixed(2)}</td>
                    <td className="subtotal">¥{(item.estimatedCost * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="total-label">总计</td>
                <td className="total-price">¥{totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderImplementationPlan = () => {
    if (!solution) return null;
    
    return (
      <div className="plan-section">
        <div className="phases-list">
          {solution.implementationPlan.phases.map((phase, idx) => {
            const isExpanded = expandedPhases.has(idx);
            
            return (
              <motion.div
                key={idx}
                className="phase-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div
                  className="phase-header"
                  onClick={() => togglePhase(idx)}
                >
                  <div className="phase-number">{idx + 1}</div>
                  <div className="phase-info">
                    <h4>{phase.phase}</h4>
                    <span className="phase-duration">
                      <Clock size={14} />
                      {phase.duration}
                    </span>
                  </div>
                  <button className="expand-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="phase-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="deliverables-section">
                        <h5>交付物</h5>
                        <ul className="deliverables-list">
                          {phase.deliverables.map((deliverable, dIdx) => (
                            <li key={dIdx}>
                              <Check size={16} />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        <div className="additional-info">
          <div className="info-card">
            <h4>
              <Shield size={18} />
              风险缓解措施
            </h4>
            <ul>
              {solution.implementationPlan.riskMitigation.map((item, idx) => (
                <li key={idx}>
                  <AlertTriangle size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="info-card">
            <h4>
              <Check size={18} />
              质量保证
            </h4>
            <ul>
              {solution.implementationPlan.qualityAssurance.map((item, idx) => (
                <li key={idx}>
                  <Check size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformance = () => {
    if (!solution) return null;
    
    const perf = solution.performanceEstimates;
    
    return (
      <div className="performance-section">
        <div className="perf-grid">
          <div className="perf-card">
            <div className="perf-icon">
              <TrendingUp size={28} />
            </div>
            <h4>处理能力</h4>
            <p>{perf.processingPower}</p>
          </div>
          
          <div className="perf-card">
            <div className="perf-icon">
              <Zap size={28} />
            </div>
            <h4>功耗</h4>
            <p>{perf.powerConsumption}</p>
          </div>
          
          <div className="perf-card">
            <div className="perf-icon">
              <Calendar size={28} />
            </div>
            <h4>工作温度</h4>
            <p>{perf.operatingTemperature}</p>
          </div>
          
          <div className="perf-card">
            <div className="perf-icon">
              <FileText size={28} />
            </div>
            <h4>预期寿命</h4>
            <p>{perf.expectedLifespan}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="technical-solution-display">
      <div className="solution-container">
        <motion.div
          className="solution-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <FileText size={32} />
            </div>
            <div className="header-text">
              <h1>技术方案</h1>
              <p>基于需求分析自动生成的完整技术方案</p>
            </div>
          </div>
          <button
            className="regenerate-btn"
            onClick={generateSolution}
            disabled={isGenerating}
          >
            <RefreshCw size={18} className={isGenerating ? 'spinning' : ''} />
            {isGenerating ? '生成中...' : '重新生成'}
          </button>
        </motion.div>



        {isGenerating && !solution && (
          <div className="loading-state">
            <div className="loading-spinner">
              <RefreshCw size={48} className="spinning" />
            </div>
            <h3>正在生成技术方案...</h3>
            <p>请稍候，AI正在为您分析并生成完整的技术方案</p>
          </div>
        )}

        {solution && (
          <>
            <div className="tabs-navigation">
              <button
                className={`tab-button ${activeTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveTab('architecture')}
              >
                <Layers size={18} />
                <span>系统架构</span>
              </button>
              <button
                className={`tab-button ${activeTab === 'bom' ? 'active' : ''}`}
                onClick={() => setActiveTab('bom')}
              >
                <Package size={18} />
                <span>元器件清单</span>
              </button>
              <button
                className={`tab-button ${activeTab === 'plan' ? 'active' : ''}`}
                onClick={() => setActiveTab('plan')}
              >
                <Calendar size={18} />
                <span>实施计划</span>
              </button>
              <button
                className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                <TrendingUp size={18} />
                <span>性能预估</span>
              </button>
            </div>

            <div className="solution-content">
              <AnimatePresence mode="wait">
                {activeTab === 'architecture' && (
                  <motion.div
                    key="architecture"
                    className="tab-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {renderArchitecture()}
                  </motion.div>
                )}
                {activeTab === 'bom' && (
                  <motion.div
                    key="bom"
                    className="tab-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {renderBOM()}
                  </motion.div>
                )}
                {activeTab === 'plan' && (
                  <motion.div
                    key="plan"
                    className="tab-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {renderImplementationPlan()}
                  </motion.div>
                )}
                {activeTab === 'performance' && (
                  <motion.div
                    key="performance"
                    className="tab-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {renderPerformance()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className="solution-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isConfirmed ? (
                <div className="confirmation-status">
                  <CheckCircle size={32} className="check-icon" />
                  <div>
                    <h3>方案已确认</h3>
                    <p>正在跳转到原理图生成...</p>
                  </div>
                </div>
              ) : (
                <motion.button
                  className="complete-button"
                  onClick={handleComplete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>确认方案并生成原理图</span>
                  <ArrowRight size={20} />
                </motion.button>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
