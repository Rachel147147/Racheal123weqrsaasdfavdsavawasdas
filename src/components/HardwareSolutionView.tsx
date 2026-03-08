import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Database,
  Zap,
  Layers,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
  Settings,
  Link2,
  HelpCircle
} from 'lucide-react';
import { AITechnicalSolution } from '../services/deepseekAI';
import { exportToPDF, ExportResult } from '../utils/export';
import { GuideTip, Tooltip } from './common';
import './HardwareSolutionView.css';

interface HardwareSolutionViewProps {
  hardwareSolution: AITechnicalSolution;
  projectInfo: { projectName: string; projectDescription: string };
  onComplete: (schematicData: any) => void;
  onBack: () => void;
}

type SortField = 'name' | 'partNumber' | 'specifications' | 'supplier' | 'quantity' | 'estimatedCost';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

const categoryIcons: Record<string, React.ElementType> = {
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

const categoryLabels: Record<string, string> = {
  processor: '处理器',
  memory: '存储器',
  storage: '存储',
  power: '电源',
  peripheral: '外设',
  other: '其他'
};

export default function HardwareSolutionView({
  hardwareSolution,
  projectInfo,
  onComplete,
  onBack
}: HardwareSolutionViewProps) {
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null });
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 排序后的元器件列表
  const sortedComponents = useMemo(() => {
    const components = [...hardwareSolution.componentList];
    
    if (sortState.field && sortState.direction) {
      components.sort((a, b) => {
        let aValue: string | number = a[sortState.field as keyof typeof a] as string | number;
        let bValue: string | number = b[sortState.field as keyof typeof b] as string | number;
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }
        
        if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return components;
  }, [hardwareSolution.componentList, sortState]);

  // 计算总成本
  const totalCost = useMemo(() => {
    return hardwareSolution.componentList.reduce(
      (sum, item) => sum + item.estimatedCost * item.quantity,
      0
    );
  }, [hardwareSolution.componentList]);

  // 处理排序
  const handleSort = useCallback((field: SortField) => {
    setSortState(prev => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  // 获取排序图标
  const getSortIcon = useCallback((field: SortField) => {
    if (sortState.field !== field) {
      return <ArrowUpDown size={14} className="sort-icon inactive" />;
    }
    if (sortState.direction === 'asc') {
      return <ArrowUp size={14} className="sort-icon active" />;
    }
    if (sortState.direction === 'desc') {
      return <ArrowDown size={14} className="sort-icon active" />;
    }
    return <ArrowUpDown size={14} className="sort-icon inactive" />;
  }, [sortState]);

  // 导出PDF
  const handleExportPDF = useCallback(async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    setExportResult(null);
    
    try {
      const result = await exportToPDF(contentRef.current, {
        filename: `${projectInfo.projectName}_硬件方案_${new Date().toISOString().split('T')[0]}.pdf`,
        title: `${projectInfo.projectName} - 硬件方案`,
        orientation: 'landscape',
        format: 'a4',
        margin: { top: 15, right: 15, bottom: 15, left: 15 }
      });
      
      setExportResult(result);
      
      // 3秒后清除提示
      setTimeout(() => setExportResult(null), 3000);
    } catch (error) {
      setExportResult({
        success: false,
        error: error instanceof Error ? error.message : '导出失败'
      });
    } finally {
      setIsExporting(false);
    }
  }, [projectInfo.projectName]);

  // 返回确认
  const handleBackClick = useCallback(() => {
    setShowBackConfirm(true);
  }, []);

  const handleBackConfirm = useCallback(() => {
    setShowBackConfirm(false);
    onBack();
  }, [onBack]);

  const handleBackCancel = useCallback(() => {
    setShowBackConfirm(false);
  }, []);

  // 生成原理图
  const handleGenerateSchematic = useCallback(async () => {
    setIsGenerating(true);
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 调用完成回调
    onComplete({
      components: hardwareSolution.componentList,
      architecture: hardwareSolution.systemArchitecture,
      timestamp: new Date().toISOString()
    });
    
    setIsGenerating(false);
  }, [hardwareSolution, onComplete]);

  // 渲染方案概述
  const renderOverview = () => (
    <div className="info-section">
      <h3 className="section-title">
        <Settings size={18} />
        方案概述
      </h3>
      <div className="overview-content">
        <p className="project-name">
          <strong>项目名称：</strong>{projectInfo.projectName}
        </p>
        <p className="project-desc">
          <strong>项目描述：</strong>{projectInfo.projectDescription}
        </p>
        <div className="architecture-summary">
          <div className="arch-item">
            <Cpu size={16} />
            <span><strong>主控：</strong>{hardwareSolution.systemArchitecture.cpu}</span>
          </div>
          <div className="arch-item">
            <Database size={16} />
            <span><strong>内存：</strong>{hardwareSolution.systemArchitecture.memory}</span>
          </div>
          <div className="arch-item">
            <Zap size={16} />
            <span><strong>电源：</strong>{hardwareSolution.systemArchitecture.powerSupply}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染设计思路
  const renderDesignConcept = () => (
    <div className="info-section">
      <h3 className="section-title">
        <Layers size={18} />
        设计思路
      </h3>
      <div className="design-concept">
        <p>
          本方案采用模块化设计理念，以{hardwareSolution.systemArchitecture.cpu}为核心处理器，
          配合{hardwareSolution.systemArchitecture.memory}内存资源，实现高性能与低功耗的平衡。
        </p>
        <p>
          系统支持多种通信接口：{hardwareSolution.systemArchitecture.interfaces.join('、')}，
          可满足不同应用场景的连接需求。
        </p>
        <div className="concept-highlights">
          <div className="highlight-item">
            <CheckCircle size={14} />
            <span>模块化设计，便于维护升级</span>
          </div>
          <div className="highlight-item">
            <CheckCircle size={14} />
            <span>低功耗方案，延长使用寿命</span>
          </div>
          <div className="highlight-item">
            <CheckCircle size={14} />
            <span>丰富接口，灵活扩展</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染技术参数
  const renderTechnicalParams = () => (
    <div className="info-section">
      <h3 className="section-title">
        <Settings size={18} />
        技术参数
      </h3>
      <div className="tech-params">
        <div className="param-grid">
          <div className="param-item">
            <span className="param-label">处理能力</span>
            <span className="param-value">{hardwareSolution.performanceEstimates.processingPower}</span>
          </div>
          <div className="param-item">
            <span className="param-label">功耗</span>
            <span className="param-value">{hardwareSolution.performanceEstimates.powerConsumption}</span>
          </div>
          <div className="param-item">
            <span className="param-label">工作温度</span>
            <span className="param-value">{hardwareSolution.performanceEstimates.operatingTemperature}</span>
          </div>
          <div className="param-item">
            <span className="param-label">预期寿命</span>
            <span className="param-value">{hardwareSolution.performanceEstimates.expectedLifespan}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染连线方式
  const renderConnections = () => (
    <div className="info-section">
      <h3 className="section-title">
        <Link2 size={18} />
        连线方式
      </h3>
      <div className="connections-content">
        <div className="interface-list">
          {hardwareSolution.systemArchitecture.interfaces.map((iface, idx) => (
            <div key={idx} className="interface-item">
              <div className="interface-badge">{iface}</div>
              <span className="interface-desc">
                {getInterfaceDescription(iface)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 获取接口描述
  const getInterfaceDescription = (iface: string): string => {
    const descriptions: Record<string, string> = {
      'UART': '通用异步收发传输器，用于串口通信',
      'SPI': '串行外设接口，高速同步通信',
      'I2C': '两线式串行总线，用于短距离通信',
      'USB': '通用串行总线，支持热插拔',
      'CAN': '控制器局域网，用于汽车电子',
      'Ethernet': '以太网接口，网络通信',
      'BLE': '低功耗蓝牙，无线通信',
      'WiFi': '无线网络连接',
      'GPIO': '通用输入输出接口',
      'ADC': '模数转换器，模拟信号采集',
      'DAC': '数模转换器，模拟信号输出',
      'PWM': '脉冲宽度调制，用于电机控制'
    };
    return descriptions[iface] || '数字通信接口';
  };

  return (
    <div className="hardware-solution-view">
      {/* 返回确认对话框 */}
      <AnimatePresence>
        {showBackConfirm && (
          <motion.div
            className="confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="confirm-dialog"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="confirm-icon">
                <AlertCircle size={48} />
              </div>
              <h3>确认返回</h3>
              <p>确定要返回重新输入项目信息吗？当前方案和分析结果将被清除。</p>
              <div className="confirm-actions">
                <button className="btn-cancel" onClick={handleBackCancel}>
                  取消
                </button>
                <button className="btn-confirm" onClick={handleBackConfirm}>
                  确认返回
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 头部操作栏 */}
      <div className="solution-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackClick}>
            <ArrowLeft size={18} />
            <span>返回重新输入</span>
          </button>
          <div className="header-title">
            <h1>硬件方案与元器件清单</h1>
            <p>{projectInfo.projectName}</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="export-button"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="spinning" />
                <span>导出中...</span>
              </>
            ) : (
              <>
                <FileDown size={18} />
                <span>导出方案</span>
              </>
            )}
          </button>
          <button
            className="generate-button"
            onClick={handleGenerateSchematic}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="spinning" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                <span>生成原理图</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 导出结果提示 */}
      <AnimatePresence>
        {exportResult && (
          <motion.div
            className={`export-result ${exportResult.success ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {exportResult.success ? (
              <>
                <CheckCircle size={18} />
                <span>PDF导出成功：{exportResult.filename}</span>
              </>
            ) : (
              <>
                <AlertCircle size={18} />
                <span>导出失败：{exportResult.error}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 方案查看说明 */}
      <GuideTip type="info" title="方案查看指南">
        左侧展示方案概述、设计思路和技术参数，右侧为完整元器件清单。
        点击表头可排序元器件列表，确认方案后点击"生成原理图"继续。
      </GuideTip>
      
      {/* 主内容区域 */}
      <div className="solution-content" ref={contentRef}>
        {/* 左侧信息栏 */}
        <div className="left-panel">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderOverview()}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {renderDesignConcept()}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {renderTechnicalParams()}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {renderConnections()}
          </motion.div>
        </div>

        {/* 右侧元器件清单 */}
        <div className="right-panel">
          <motion.div
            className="bom-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bom-header">
              <h3 className="section-title">
                <Package size={18} />
                元器件清单
                <Tooltip content="点击表头可按该列排序，再次点击切换升序/降序" position="right">
                  <HelpCircle size={14} className="bom-help-icon" />
                </Tooltip>
              </h3>
              <div className="bom-summary">
                <span className="summary-item">
                  <Package size={16} />
                  共 {hardwareSolution.componentList.length} 种元器件
                </span>
                <span className="summary-item total-cost">
                  预估总成本：¥{totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bom-table-wrapper">
              <table className="bom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable">
                      <span>名称</span>
                      {getSortIcon('name')}
                    </th>
                    <th onClick={() => handleSort('partNumber')} className="sortable">
                      <span>型号</span>
                      {getSortIcon('partNumber')}
                    </th>
                    <th>规格参数</th>
                    <th onClick={() => handleSort('supplier')} className="sortable">
                      <span>推荐品牌</span>
                      {getSortIcon('supplier')}
                    </th>
                    <th onClick={() => handleSort('quantity')} className="sortable numeric">
                      <span>数量</span>
                      {getSortIcon('quantity')}
                    </th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedComponents.map((component, idx) => {
                    const Icon = categoryIcons[component.category] || Package;
                    const colors = categoryColors[component.category] || categoryColors.other;
                    
                    return (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <td>
                          <div className="component-name-cell">
                            <div
                              className="category-badge"
                              style={{ background: colors.bg }}
                            >
                              <Icon size={14} color={colors.text} />
                            </div>
                            <span className="component-name">{component.name}</span>
                          </div>
                        </td>
                        <td className="part-number">{component.partNumber}</td>
                        <td className="specifications">{component.specifications}</td>
                        <td className="supplier">{component.supplier}</td>
                        <td className="quantity numeric">{component.quantity}</td>
                        <td className="remarks">
                          {component.category === 'processor' && '核心器件'}
                          {component.category === 'power' && '电源管理'}
                          {component.category === 'memory' && '存储扩展'}
                          {component.category === 'peripheral' && '外围器件'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
