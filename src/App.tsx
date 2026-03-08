import { useState, useCallback, lazy, Suspense, memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AIAnalysisResult, AITechnicalSolution } from './services/deepseekAI';
import './App.css';

// 懒加载组件 - 优化初始加载时间
const ProjectInputForm = lazy(() => import('./components/ProjectInputForm'));
const AnalysisResultDisplay = lazy(() => import('./components/AnalysisResultDisplay'));
const HardwareSolutionView = lazy(() => import('./components/HardwareSolutionView'));
const SchematicViewer = lazy(() => import('./components/SchematicViewer'));

// 骨架屏加载组件 - 使用 memo 避免不必要的重渲染
const LoadingSkeleton: React.FC = memo(() => (
  <div className="loading-skeleton">
    <div className="skeleton-header"></div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// 工作流步骤枚举
enum WorkflowStep {
  ProjectInput = 1,
  AnalysisResult = 2,
  HardwareSolution = 3,
  SchematicView = 4
}

// 步骤配置
const WORKFLOW_STEPS_CONFIG = [
  { step: WorkflowStep.ProjectInput, label: '项目信息', description: '输入项目基本信息' },
  { step: WorkflowStep.AnalysisResult, label: '需求分析', description: 'AI智能分析结果' },
  { step: WorkflowStep.HardwareSolution, label: '硬件方案', description: '元器件清单与方案' },
  { step: WorkflowStep.SchematicView, label: '原理图', description: '硬件原理图设计' }
];

// 工作流数据接口
interface WorkflowData {
  currentStep: WorkflowStep;
  projectInfo: {
    projectName: string;
    projectDescription: string;
  };
  analysisResult: AIAnalysisResult | null;
  hardwareSolution: AITechnicalSolution | null;
  schematicData: any;
}

// 页面切换动画配置
const PAGE_TRANSITION_DURATION = 0.4; // 400ms

const pageVariants = {
  initial: {
    opacity: 0,
    x: 50,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: PAGE_TRANSITION_DURATION,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.98,
    transition: {
      duration: PAGE_TRANSITION_DURATION * 0.75,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// 进度指示器组件 - 使用 memo 优化性能
interface WorkflowProgressProps {
  currentStep: WorkflowStep;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = memo(({ currentStep }) => {
  // 使用 useMemo 缓存计算结果
  const currentIndex = useMemo(() => 
    WORKFLOW_STEPS_CONFIG.findIndex(c => c.step === currentStep), 
    [currentStep]
  );

  return (
    <div className="workflow-progress">
      <div className="progress-container">
        {WORKFLOW_STEPS_CONFIG.map((config, index) => {
          const stepNumber = config.step as number;
          const isActive = currentStep === config.step;
          const isCompleted = stepNumber < (currentStep as number);
          const isPast = index < currentIndex;

          return (
            <div key={config.step} className="progress-step-wrapper">
              <motion.div
                className={`progress-step ${isActive ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isPast ? 'past' : ''}`}
                initial={false}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  opacity: 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="step-indicator">
                  <motion.div
                    className="step-number"
                    initial={false}
                    animate={{
                      backgroundColor: isCompleted || isActive ? '#6366f1' : '#e5e7eb',
                      color: isCompleted || isActive ? '#ffffff' : '#6b7280'
                    }}
                  >
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </motion.div>
                </div>
                <div className="step-info">
                  <span className="step-label">{config.label}</span>
                  <span className="step-description">{config.description}</span>
                </div>
              </motion.div>
              {index < WORKFLOW_STEPS_CONFIG.length - 1 && (
                <motion.div
                  className="step-connector"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  style={{ originX: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

WorkflowProgress.displayName = 'WorkflowProgress';

function App() {
  // 初始化工作流状态
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    currentStep: WorkflowStep.ProjectInput,
    projectInfo: {
      projectName: '',
      projectDescription: ''
    },
    analysisResult: null,
    hardwareSolution: null,
    schematicData: null
  });

  // 步骤1完成：项目信息输入完成
  const handleProjectInputComplete = useCallback((data: {
    projectName: string;
    projectDescription: string;
    analysisResult: AIAnalysisResult;
  }) => {
    setWorkflowData(prev => ({
      ...prev,
      currentStep: WorkflowStep.AnalysisResult,
      projectInfo: {
        projectName: data.projectName,
        projectDescription: data.projectDescription
      },
      analysisResult: data.analysisResult
    }));
  }, []);

  // 步骤2完成：需求分析完成，生成硬件方案
  const handleAnalysisComplete = useCallback((hardwareSolution: AITechnicalSolution) => {
    setWorkflowData(prev => ({
      ...prev,
      currentStep: WorkflowStep.HardwareSolution,
      hardwareSolution
    }));
  }, []);

  // 步骤2返回：返回到项目信息输入
  const handleAnalysisBack = useCallback(() => {
    setWorkflowData(prev => ({
      ...prev,
      currentStep: WorkflowStep.ProjectInput
    }));
  }, []);

  // 步骤3完成：硬件方案完成，生成原理图
  const handleHardwareSolutionComplete = useCallback((schematicData: any) => {
    setWorkflowData(prev => ({
      ...prev,
      currentStep: WorkflowStep.SchematicView,
      schematicData
    }));
  }, []);

  // 步骤3返回：返回到项目信息输入（重新开始）
  const handleHardwareSolutionBack = useCallback(() => {
    setWorkflowData(prev => ({
      ...prev,
      currentStep: WorkflowStep.ProjectInput,
      analysisResult: null,
      hardwareSolution: null
    }));
  }, []);

  // 步骤4返回：返回到硬件方案
  const handleSchematicBack = useCallback(() => {
    setWorkflowData(prev => ({
      ...prev,
      currentStep: WorkflowStep.HardwareSolution,
      schematicData: null
    }));
  }, []);

  // 步骤4完成：整个流程完成
  const handleSchematicComplete = useCallback(() => {
    // 可以在这里添加完成后的逻辑，如跳转到成功页面或重置
    alert('硬件方案设计已完成！');
  }, []);

  // 渲染当前步骤内容
  const renderCurrentStep = () => {
    switch (workflowData.currentStep) {
      case WorkflowStep.ProjectInput:
        return (
          <motion.div
            key="step-1-project-input"
            className="workflow-step-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <ProjectInputForm onComplete={handleProjectInputComplete} />
            </Suspense>
          </motion.div>
        );

      case WorkflowStep.AnalysisResult:
        return (
          <motion.div
            key="step-2-analysis-result"
            className="workflow-step-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <AnalysisResultDisplay
                analysisResult={workflowData.analysisResult}
                projectInfo={workflowData.projectInfo}
                onComplete={handleAnalysisComplete}
                onBack={handleAnalysisBack}
              />
            </Suspense>
          </motion.div>
        );

      case WorkflowStep.HardwareSolution:
        return (
          <motion.div
            key="step-3-hardware-solution"
            className="workflow-step-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <HardwareSolutionView
                hardwareSolution={workflowData.hardwareSolution!}
                projectInfo={workflowData.projectInfo}
                onComplete={handleHardwareSolutionComplete}
                onBack={handleHardwareSolutionBack}
              />
            </Suspense>
          </motion.div>
        );

      case WorkflowStep.SchematicView:
        return (
          <motion.div
            key="step-4-schematic-view"
            className="workflow-step-container full-height"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <SchematicViewer
                schematicData={workflowData.schematicData}
                hardwareSolution={workflowData.hardwareSolution!}
                onBack={handleSchematicBack}
                onComplete={handleSchematicComplete}
              />
            </Suspense>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* 进度指示器 - 在原理图界面隐藏 */}
      {workflowData.currentStep !== WorkflowStep.SchematicView && (
        <WorkflowProgress currentStep={workflowData.currentStep} />
      )}

      {/* 主内容区域 */}
      <div className="workflow-content">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
