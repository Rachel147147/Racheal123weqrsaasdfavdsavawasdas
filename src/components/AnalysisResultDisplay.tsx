import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  List,
  Hash,
  Bold,
  RotateCcw,
  RefreshCw,
  Cpu,
  Zap,
  Database,
  Wifi,
  Shield,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import deepseekAIService, { AIAnalysisResult, AITechnicalSolution } from '../services/deepseekAI';
import { GuideTip, Tooltip } from './common';
import './AnalysisResultDisplay.css';

interface AnalysisResultDisplayProps {
  analysisResult: AIAnalysisResult | null;
  projectInfo: {
    projectName: string;
    projectDescription: string;
  };
  onComplete: (hardwareSolution: AITechnicalSolution) => void;
  onBack: () => void;
}

// 富文本渲染器 - 解析Markdown风格的文本
const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key++}`} className="rich-list">
            {listItems.map((item, idx) => (
              <li key={idx} className="rich-list-item">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const renderInlineFormatting = (line: string): React.ReactNode => {
      // 处理加粗 **text**
      let result: React.ReactNode[] = [];
      let remaining = line;
      let inlineKey = 0;

      // 处理加粗
      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(remaining)) !== null) {
        if (match.index > lastIndex) {
          result.push(remaining.slice(lastIndex, match.index));
        }
        result.push(
          <strong key={`bold-${inlineKey++}`} className="rich-bold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < remaining.length) {
        result.push(remaining.slice(lastIndex));
      }

      return result.length > 0 ? result : line;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // 空行
      if (!trimmedLine) {
        if (inList) {
          flushList();
        }
        return;
      }

      // 标题 ### ## #
      if (trimmedLine.startsWith('### ')) {
        if (inList) flushList();
        elements.push(
          <h4 key={`h4-${key++}`} className="rich-heading rich-heading-4">
            {renderInlineFormatting(trimmedLine.slice(4))}
          </h4>
        );
        return;
      }

      if (trimmedLine.startsWith('## ')) {
        if (inList) flushList();
        elements.push(
          <h3 key={`h3-${key++}`} className="rich-heading rich-heading-3">
            {renderInlineFormatting(trimmedLine.slice(3))}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('# ')) {
        if (inList) flushList();
        elements.push(
          <h2 key={`h2-${key++}`} className="rich-heading rich-heading-2">
            {renderInlineFormatting(trimmedLine.slice(2))}
          </h2>
        );
        return;
      }

      // 列表项 - 或 * 或数字.
      const listMatch = trimmedLine.match(/^[-*]\s+(.+)$/) || trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (listMatch) {
        inList = true;
        listItems.push(listMatch[1]);
        return;
      }

      // 普通段落
      if (inList) flushList();
      elements.push(
        <p key={`p-${key++}`} className="rich-paragraph">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });

    if (inList) flushList();

    return elements;
  };

  return <div className="rich-text-content">{parseContent(content)}</div>;
};

// 骨架屏组件
const SkeletonLoader: React.FC<{ lines?: number }> = ({ lines = 5 }) => (
  <div className="skeleton-container">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton-line"
        style={{
          width: `${Math.random() * 40 + 60}%`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

export default function AnalysisResultDisplay({
  analysisResult,
  projectInfo,
  onComplete,
  onBack
}: AnalysisResultDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<{ message: string; solution?: string } | null>(null);
  const [hardwareSolution, setHardwareSolution] = useState<AITechnicalSolution | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'requirements']));
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 格式化分析结果为可读文本
  const formattedAnalysis = useMemo(() => {
    if (!analysisResult) return '';

    const sections: string[] = [];

    // 产品类型
    sections.push(`# 需求分析报告\n`);
    sections.push(`## 产品类型\n${analysisResult.productType}\n`);

    // 关键词
    if (analysisResult.keywords.length > 0) {
      sections.push(`## 关键技术特征\n`);
      analysisResult.keywords.forEach(keyword => {
        sections.push(`- ${keyword}`);
      });
      sections.push('');
    }

    // 技术要求
    if (analysisResult.technicalRequirements) {
      sections.push(`## 技术要求分析\n`);
      const req = analysisResult.technicalRequirements;

      if (req.processingSpeed) {
        sections.push(`### 处理性能\n${req.processingSpeed}\n`);
      }

      if (req.memoryRequirement) {
        sections.push(`### 存储需求\n${req.memoryRequirement}\n`);
      }

      if (req.connectivity && req.connectivity.length > 0) {
        sections.push(`### 通信接口\n`);
        req.connectivity.forEach(conn => {
          sections.push(`- ${conn}`);
        });
        sections.push('');
      }

      if (req.powerSupply) {
        sections.push(`### 供电方案\n${req.powerSupply}\n`);
      }

      if (req.operatingTemperature) {
        sections.push(`### 工作环境\n${req.operatingTemperature}\n`);
      }

      if (req.formFactor) {
        sections.push(`### 外形规格\n${req.formFactor}\n`);
      }

      if (req.additionalFeatures && req.additionalFeatures.length > 0) {
        sections.push(`### 附加功能\n`);
        req.additionalFeatures.forEach(feature => {
          sections.push(`- ${feature}`);
        });
        sections.push('');
      }
    }

    // 建议方案
    if (analysisResult.suggestedSolutions.length > 0) {
      sections.push(`## 建议解决方案\n`);
      analysisResult.suggestedSolutions.forEach((solution, index) => {
        sections.push(`${index + 1}. ${solution}`);
      });
      sections.push('');
    }

    // 置信度
    sections.push(`## 分析置信度\n`);
    const confidencePercent = Math.round(analysisResult.confidenceScore * 100);
    sections.push(`本次分析的置信度为 **${confidencePercent}%**，`);
    if (confidencePercent >= 80) {
      sections.push(`分析结果较为可靠，可以继续进行硬件方案设计。`);
    } else if (confidencePercent >= 60) {
      sections.push(`建议补充更多需求细节以提高分析准确性。`);
    } else {
      sections.push(`建议提供更详细的需求描述后重新分析。`);
    }

    return sections.join('\n');
  }, [analysisResult]);

  // 切换展开/折叠
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // 复制内容
  const copyToClipboard = useCallback(async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // 生成硬件方案
  const handleGenerateHardwareSolution = useCallback(async () => {
    if (!analysisResult) return;

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // 阶段1: 准备分析
      setLoadingPhase('正在分析行业信息...');
      setLoadingProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 阶段2: 搜集技术资料
      setLoadingPhase('正在搜集技术资料...');
      setLoadingProgress(25);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 阶段3: 调用AI生成方案
      setLoadingPhase('正在生成硬件方案...');
      setLoadingProgress(40);

      const solution = await deepseekAIService.generateTechnicalSolution(analysisResult);

      setLoadingProgress(80);
      setLoadingPhase('正在整理方案数据...');
      await new Promise(resolve => setTimeout(resolve, 300));

      setLoadingProgress(100);
      setLoadingPhase('方案生成完成');

      setHardwareSolution(solution);

      // 短暂延迟后回调
      setTimeout(() => {
        onComplete(solution);
      }, 500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成硬件方案时发生未知错误';

      // 根据错误类型提供解决方案
      let solution: string | undefined;
      if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
        solution = '网络请求超时，请检查网络连接后重试';
      } else if (errorMessage.includes('API') || errorMessage.includes('401') || errorMessage.includes('403')) {
        solution = 'API密钥无效或已过期，请联系管理员';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        solution = '请求频率过高，请稍后再试';
      } else if (errorMessage.includes('network') || errorMessage.includes('网络')) {
        solution = '网络连接异常，请检查网络设置';
      } else {
        solution = '请稍后重试，如问题持续请联系技术支持';
      }

      setError({
        message: errorMessage,
        solution
      });
    } finally {
      setIsLoading(false);
    }
  }, [analysisResult, onComplete]);

  // 重试
  const handleRetry = useCallback(() => {
    setError(null);
    handleGenerateHardwareSolution();
  }, [handleGenerateHardwareSolution]);

  // 平滑滚动到顶部
  const scrollToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onBack]);

  // 置信度颜色
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  };

  return (
    <div className="analysis-result-display" role="main" aria-label="需求分析结果展示">
      {/* 头部 */}
      <motion.header
        className="result-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          className="back-button"
          onClick={onBack}
          disabled={isLoading}
          aria-label="返回上一步"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        <div className="header-content">
          <div className="header-icon">
            <FileText size={28} />
          </div>
          <div className="header-text">
            <h1 className="header-title">{projectInfo.projectName}</h1>
            <p className="header-subtitle">AI智能需求分析结果</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="scroll-top-button"
            onClick={scrollToTop}
            aria-label="回到顶部"
            title="回到顶部"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </motion.header>

      {/* 主内容区 */}
      <div className="result-content" ref={contentRef}>
        <AnimatePresence mode="wait">
          {/* 分析结果展示 */}
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="analysis-section"
          >
            {/* 项目信息卡片 */}
            <div className="info-card project-info-card">
              <div className="info-card-header">
                <Info size={18} />
                <h3>项目描述</h3>
              </div>
              <p className="project-description">{projectInfo.projectDescription}</p>
            </div>

            {/* 结果解读说明 */}
            <GuideTip type="tip" title="结果解读指南">
              下方展示了AI对您项目需求的分析结果。<strong>置信度</strong>表示分析结果的可靠程度，越高越可靠。
              您可以展开各个章节查看详细内容，确认无误后点击"生成硬件方案"继续。
            </GuideTip>

            {/* 置信度指示器 */}
            {analysisResult && (
              <div className={`confidence-indicator ${getConfidenceColor(analysisResult.confidenceScore)}`}>
                <div className="confidence-header">
                  <Shield size={18} />
                  <span>分析置信度</span>
                  <span className="confidence-value">
                    {Math.round(analysisResult.confidenceScore * 100)}%
                  </span>
                  <Tooltip 
                    content="置信度反映AI对分析结果的确定程度。80%以上为高置信度，60%-80%为中等，60%以下建议补充更多需求信息。"
                    position="right"
                  >
                    <HelpCircle size={14} className="confidence-help-icon" />
                  </Tooltip>
                </div>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${analysisResult.confidenceScore * 100}%` }}
                  />
                </div>
                <p className="confidence-hint">
                  {analysisResult.confidenceScore >= 0.8
                    ? '分析结果可靠，可以继续进行方案设计'
                    : analysisResult.confidenceScore >= 0.6
                    ? '建议补充更多细节以提高准确性'
                    : '建议提供更详细的需求描述'}
                </p>
              </div>
            )}

            {/* 可折叠的分析内容区域 */}
            <div className="collapsible-sections">
              {/* 概览 */}
              <div className="collapsible-section">
                <button
                  className="section-header"
                  onClick={() => toggleSection('overview')}
                  aria-expanded={expandedSections.has('overview')}
                >
                  <div className="section-title">
                    <Hash size={18} />
                    <span>分析概览</span>
                  </div>
                  {expandedSections.has('overview') ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has('overview') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="section-content"
                    >
                      {analysisResult ? (
                        <div className="overview-grid">
                          <div className="overview-item">
                            <Cpu size={20} />
                            <div className="overview-item-content">
                              <span className="overview-label">产品类型</span>
                              <span className="overview-value">{analysisResult.productType}</span>
                            </div>
                          </div>

                          {analysisResult.keywords.length > 0 && (
                            <div className="overview-item full-width">
                              <List size={20} />
                              <div className="overview-item-content">
                                <span className="overview-label">关键技术特征</span>
                                <div className="keyword-tags">
                                  {analysisResult.keywords.map((keyword, idx) => (
                                    <span key={idx} className="keyword-tag">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <SkeletonLoader lines={3} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 技术要求 */}
              {analysisResult?.technicalRequirements && (
                <div className="collapsible-section">
                  <button
                    className="section-header"
                    onClick={() => toggleSection('requirements')}
                    aria-expanded={expandedSections.has('requirements')}
                  >
                    <div className="section-title">
                      <Database size={18} />
                      <span>技术要求</span>
                    </div>
                    {expandedSections.has('requirements') ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('requirements') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="section-content"
                      >
                        <div className="requirements-grid">
                          {analysisResult.technicalRequirements.processingSpeed && (
                            <div className="requirement-card">
                              <Zap size={18} />
                              <div className="requirement-content">
                                <span className="requirement-label">处理性能</span>
                                <span className="requirement-value">
                                  {analysisResult.technicalRequirements.processingSpeed}
                                </span>
                              </div>
                            </div>
                          )}

                          {analysisResult.technicalRequirements.memoryRequirement && (
                            <div className="requirement-card">
                              <Database size={18} />
                              <div className="requirement-content">
                                <span className="requirement-label">存储需求</span>
                                <span className="requirement-value">
                                  {analysisResult.technicalRequirements.memoryRequirement}
                                </span>
                              </div>
                            </div>
                          )}

                          {analysisResult.technicalRequirements.powerSupply && (
                            <div className="requirement-card">
                              <Zap size={18} />
                              <div className="requirement-content">
                                <span className="requirement-label">供电方案</span>
                                <span className="requirement-value">
                                  {analysisResult.technicalRequirements.powerSupply}
                                </span>
                              </div>
                            </div>
                          )}

                          {analysisResult.technicalRequirements.operatingTemperature && (
                            <div className="requirement-card">
                              <Shield size={18} />
                              <div className="requirement-content">
                                <span className="requirement-label">工作环境</span>
                                <span className="requirement-value">
                                  {analysisResult.technicalRequirements.operatingTemperature}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {analysisResult.technicalRequirements.connectivity &&
                          analysisResult.technicalRequirements.connectivity.length > 0 && (
                            <div className="connectivity-section">
                              <h4>
                                <Wifi size={16} />
                                通信接口
                              </h4>
                              <div className="connectivity-tags">
                                {analysisResult.technicalRequirements.connectivity.map((conn, idx) => (
                                  <span key={idx} className="connectivity-tag">
                                    {conn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 建议方案 */}
              {analysisResult?.suggestedSolutions && analysisResult.suggestedSolutions.length > 0 && (
                <div className="collapsible-section">
                  <button
                    className="section-header"
                    onClick={() => toggleSection('solutions')}
                    aria-expanded={expandedSections.has('solutions')}
                  >
                    <div className="section-title">
                      <Sparkles size={18} />
                      <span>建议解决方案</span>
                    </div>
                    {expandedSections.has('solutions') ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.has('solutions') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="section-content"
                      >
                        <div className="solutions-list">
                          {analysisResult.suggestedSolutions.map((solution, idx) => (
                            <div key={idx} className="solution-item">
                              <span className="solution-number">{idx + 1}</span>
                              <p className="solution-text">{solution}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 完整分析报告 */}
              <div className="collapsible-section">
                <button
                  className="section-header"
                  onClick={() => toggleSection('report')}
                  aria-expanded={expandedSections.has('report')}
                >
                  <div className="section-title">
                    <FileText size={18} />
                    <span>完整分析报告</span>
                  </div>
                  <div className="section-actions">
                    <button
                      className="copy-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(formattedAnalysis, 'report');
                      }}
                      title="复制报告"
                    >
                      {copiedSection === 'report' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    {expandedSections.has('report') ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedSections.has('report') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="section-content"
                    >
                      <div className="rich-text-container">
                        <RichTextRenderer content={formattedAnalysis} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="error-overlay"
          >
            <div className="error-card">
              <div className="error-icon-container">
                <AlertTriangle size={32} />
              </div>
              <h3 className="error-title">生成失败</h3>
              <p className="error-message">{error.message}</p>
              {error.solution && (
                <div className="error-solution">
                  <Info size={16} />
                  <span>{error.solution}</span>
                </div>
              )}
              <div className="error-actions">
                <button className="error-back-button" onClick={onBack}>
                  <ArrowLeft size={16} />
                  返回修改
                </button>
                <button className="error-retry-button" onClick={handleRetry}>
                  <RefreshCw size={16} />
                  重试
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 加载状态 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-overlay"
          >
            <div className="loading-card">
              <div className="loading-spinner-container">
                <Loader2 size={48} className="loading-spinner" />
              </div>
              <h3 className="loading-title">正在生成硬件方案</h3>
              <p className="loading-phase">{loadingPhase}</p>
              <div className="loading-progress-container">
                <div className="loading-progress-bar">
                  <div
                    className="loading-progress-fill"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <span className="loading-progress-text">{loadingProgress}%</span>
              </div>
              <div className="loading-skeleton">
                <SkeletonLoader lines={4} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作栏 */}
      <motion.footer
        className="result-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          className="footer-button secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft size={18} />
          <span>返回修改</span>
        </button>

        <button
          className="footer-button primary"
          onClick={handleGenerateHardwareSolution}
          disabled={isLoading || !analysisResult}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>生成硬件方案</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.footer>
    </div>
  );
}
