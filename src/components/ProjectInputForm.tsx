import React, { useState, useCallback } from 'react';
import { DeepseekAIService, AIAnalysisResult } from '../services/deepseekAI';
import { GuideTip, Tooltip, HelpIcon } from './common';
import './ProjectInputForm.css';

interface ProjectInputFormProps {
  onComplete: (data: { projectName: string; projectDescription: string; analysisResult: AIAnalysisResult }) => void;
}

interface FormErrors {
  projectName?: string;
  projectDescription?: string;
}

const ProjectInputForm: React.FC<ProjectInputFormProps> = ({ onComplete }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const PROJECT_NAME_MAX_LENGTH = 50;
  const PROJECT_DESCRIPTION_MAX_LENGTH = 500;

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = '项目名称为必填项';
    } else if (projectName.length > PROJECT_NAME_MAX_LENGTH) {
      newErrors.projectName = `项目名称不能超过${PROJECT_NAME_MAX_LENGTH}个字符`;
    }

    if (!projectDescription.trim()) {
      newErrors.projectDescription = '项目描述为必填项';
    } else if (projectDescription.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
      newErrors.projectDescription = `项目描述不能超过${PROJECT_DESCRIPTION_MAX_LENGTH}个字符`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [projectName, projectDescription]);

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= PROJECT_NAME_MAX_LENGTH) {
      setProjectName(value);
      if (errors.projectName) {
        setErrors(prev => ({ ...prev, projectName: undefined }));
      }
    }
  };

  const handleProjectDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= PROJECT_DESCRIPTION_MAX_LENGTH) {
      setProjectDescription(value);
      if (errors.projectDescription) {
        setErrors(prev => ({ ...prev, projectDescription: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const aiService = new DeepseekAIService({ timeout: 30000 });
      const analysisResult = await aiService.analyzeRequirements(projectDescription);

      clearInterval(progressInterval);
      setLoadingProgress(100);

      // 短暂延迟以显示完成状态
      setTimeout(() => {
        onComplete({
          projectName: projectName.trim(),
          projectDescription: projectDescription.trim(),
          analysisResult
        });
      }, 300);

    } catch (error) {
      clearInterval(progressInterval);
      setLoadingProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : '分析失败，请重试';
      setErrors(prev => ({
        ...prev,
        projectDescription: `分析失败: ${errorMessage}`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isNameOverLimit = projectName.length >= PROJECT_NAME_MAX_LENGTH;
  const isDescriptionOverLimit = projectDescription.length >= PROJECT_DESCRIPTION_MAX_LENGTH;

  return (
    <div className="project-input-form-container">
      <form className="project-input-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2 className="form-title">项目信息</h2>
          <p className="form-subtitle">请输入项目基本信息，我们将为您进行智能分析</p>
        </div>

        {/* 使用说明提示 */}
        <GuideTip type="info" title="使用说明">
          请填写项目名称和详细描述，系统将自动分析您的需求并生成硬件方案。描述越详细，分析结果越准确。
        </GuideTip>

        <div className="form-body">
          {/* 项目名称输入框 */}
          <div className={`form-group ${errors.projectName ? 'has-error' : ''} ${isNameOverLimit ? 'over-limit' : ''}`}>
            <label className="form-label" htmlFor="projectName">
              项目名称 <span className="required-mark">*</span>
              <Tooltip content="为您的项目起一个简洁明了的名称，便于后续管理和识别" position="right">
                <HelpIcon content="项目名称将用于标识您的硬件设计项目，建议使用产品名称或功能描述作为名称" position="right" size={14} />
              </Tooltip>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="projectName"
                className="form-input"
                placeholder="请输入项目名称"
                value={projectName}
                onChange={handleProjectNameChange}
                disabled={isLoading}
                maxLength={PROJECT_NAME_MAX_LENGTH}
              />
              <span className={`char-counter ${isNameOverLimit ? 'over-limit' : ''}`}>
                {projectName.length}/{PROJECT_NAME_MAX_LENGTH}
              </span>
            </div>
            {errors.projectName && (
              <span className="error-message">{errors.projectName}</span>
            )}
          </div>

          {/* 项目描述文本区域 */}
          <div className={`form-group ${errors.projectDescription ? 'has-error' : ''} ${isDescriptionOverLimit ? 'over-limit' : ''}`}>
            <label className="form-label" htmlFor="projectDescription">
              项目描述 <span className="required-mark">*</span>
              <HelpIcon 
                content={
                  <div>
                    <p><strong>建议包含以下内容：</strong></p>
                    <ul>
                      <li>产品功能和应用场景</li>
                      <li>性能指标要求（如处理速度、功耗等）</li>
                      <li>通信接口需求（如WiFi、蓝牙、串口等）</li>
                      <li>工作环境条件（如温度范围、防护等级）</li>
                      <li>其他特殊要求</li>
                    </ul>
                  </div>
                }
                title="如何填写项目描述"
                variant="modal"
                position="right"
              />
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="projectDescription"
                className="form-textarea"
                placeholder="请详细描述您的项目需求，包括功能要求、性能指标、应用场景等信息..."
                value={projectDescription}
                onChange={handleProjectDescriptionChange}
                disabled={isLoading}
                maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                rows={6}
              />
              <span className={`char-counter ${isDescriptionOverLimit ? 'over-limit' : ''}`}>
                {projectDescription.length}/{PROJECT_DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            {errors.projectDescription && (
              <span className="error-message">{errors.projectDescription}</span>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="form-actions">
            <button
              type="submit"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span className="loading-text">
                    分析中... {Math.round(loadingProgress)}%
                  </span>
                </>
              ) : (
                <>
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>开始分析</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 加载进度条 */}
        {isLoading && (
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        )}
      </form>

      {/* 提示信息 */}
      <div className="form-tips">
        <div className="tip-item">
          <svg className="tip-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>描述越详细，分析结果越准确</span>
        </div>
        <div className="tip-item">
          <svg className="tip-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>分析过程大约需要10-30秒</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectInputForm;
