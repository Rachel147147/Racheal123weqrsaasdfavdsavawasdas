# Deepseek AI集成 - 产品需求文档

## Overview
- **Summary**: 将Deepseek AI大模型集成到现有嵌入式硬件设计工作流系统中，实现从客户自然语言输入到自动生成硬件原理图的完整自动化流程。
- **Purpose**: 解决传统硬件设计流程中需要人工收集和分析需求的痛点，通过AI智能分析大幅缩短设计周期，提高设计效率和准确性。
- **Target Users**: 硬件工程师、产品经理、嵌入式系统开发者

## Goals
- 实现客户自然语言输入界面，支持中文需求描述
- 集成Deepseek AI进行关键词提取和语义分析
- 基于AI分析结果自动识别嵌入式产品类型
- 自动生成详细技术方案、元器件清单和硬件原理图
- 提供人工干预接口和完整日志系统
- 确保API密钥安全存储和使用

## Non-Goals (Out of Scope)
- 不涉及Deepseek AI模型的训练或微调
- 不实现与其他AI模型的集成（如GPT-4、Claude等）
- 不支持多语言输入（仅中文）
- 不实现AI模型的实时流式输出
- 不涉及PCB布局设计的自动化

## Background & Context
- 现有系统已具备完整的硬件设计工作流：需求分析→方案设计→元器件选型→方案评估→文档交付→原理图生成
- 已存在SmartRequirementAnalyzer组件，提供自然语言输入界面但目前使用关键词匹配
- 已存在deepseekAI.ts服务框架，包含API调用基础代码
- 使用React 18 + TypeScript + Vite技术栈

## Functional Requirements
- **FR-1**: 客户交互界面 - 提供自然语言输入界面，支持中文输入，包含项目名称输入、需求描述输入、示例推荐和提示功能
- **FR-2**: AI模型调用 - 实现Deepseek API调用接口，包含错误处理、超时机制和重试逻辑
- **FR-3**: 关键词提取与语义分析 - 使用Deepseek AI对客户需求进行智能分析，提取关键词、产品类型、技术参数等
- **FR-4**: 技术方案生成 - 基于AI分析结果自动生成系统架构、元器件清单、实施计划和性能预估
- **FR-5**: 元器件清单展示 - 展示完整的BOM清单，包含元器件名称、型号、规格、数量、供应商信息，支持筛选和搜索
- **FR-6**: 原理图自动生成 - 实现客户确认机制，确认后自动启动原理图生成流程
- **FR-7**: 人工干预接口 - 提供需求编辑、方案调整的人工干预功能
- **FR-8**: 日志系统 - 记录用户交互、AI分析结果和系统操作全过程
- **FR-9**: API密钥安全管理 - 确保API密钥安全存储，符合数据安全规范

## Non-Functional Requirements
- **NFR-1**: 页面响应时间不超过2秒（AI分析时间不计入）
- **NFR-2**: AI分析超时时间设置为30秒
- **NFR-3**: 支持错误重试最多3次
- **NFR-4**: 信息展示清晰直观，使用可视化图表
- **NFR-5**: 日志系统支持按时间、级别、类型筛选和查询

## Constraints
- **Technical**: 必须使用Deepseek API（API密钥：sk-59d84ee8c67f4c339fbb3846b7a95c8e）
- **Business**: 必须与现有工作流系统无缝集成
- **Dependencies**: 依赖现有React组件、类型定义和服务模块

## Assumptions
- Deepseek API服务可用且稳定
- 用户网络连接正常能够访问API
- 现有工作流系统数据结构完整
- API密钥有效且有足够额度

## Acceptance Criteria

### AC-1: 客户自然语言输入界面
- **Given**: 用户打开系统并进入需求分析页面
- **When**: 用户在界面输入项目名称和中文需求描述
- **Then**: 界面显示输入验证提示，支持使用示例描述，并提供输入提示
- **Verification**: `human-judgment`

### AC-2: Deepseek AI调用与错误处理
- **Given**: 用户提交需求分析请求
- **When**: 系统调用Deepseek API
- **Then**: API调用成功返回分析结果，或在失败时显示友好错误提示并支持重试
- **Verification**: `programmatic`

### AC-3: AI关键词提取与产品类型识别
- **Given**: 用户输入包含明确产品需求的描述
- **When**: AI完成分析
- **Then**: 系统准确识别产品类型，提取相关技术参数和功能需求
- **Verification**: `human-judgment`

### AC-4: 技术方案自动生成
- **Given**: AI分析完成
- **When**: 系统处理分析结果
- **Then**: 生成包含系统架构、元器件清单、实施计划和性能预估的完整技术方案
- **Verification**: `human-judgment`

### AC-5: 元器件清单展示与筛选
- **Given**: 技术方案已生成
- **When**: 用户查看元器件清单
- **Then**: 清单清晰展示，支持按类型、价格、供应商筛选和搜索
- **Verification**: `human-judgment`

### AC-6: 原理图自动生成流程
- **Given**: 用户确认技术方案和元器件清单
- **When**: 用户点击确认
- **Then**: 系统自动启动原理图生成流程，生成符合行业标准的原理图
- **Verification**: `human-judgment`

### AC-7: 人工干预功能
- **Given**: 显示AI生成的需求或方案
- **When**: 用户进行编辑或调整
- **Then**: 系统接受并保存人工修改
- **Verification**: `human-judgment`

### AC-8: 日志系统
- **Given**: 用户进行操作
- **When**: 系统记录日志
- **Then**: 日志完整记录操作时间、级别、内容，支持查看和筛选
- **Verification**: `programmatic`

### AC-9: API密钥安全
- **Given**: 系统运行
- **When**: 使用API密钥
- **Then**: API密钥不在客户端暴露，安全存储和使用
- **Verification**: `programmatic`

### AC-10: 响应性能
- **Given**: 用户进行操作
- **When**: 页面加载或交互
- **Then**: 页面响应时间不超过2秒（AI分析除外）
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要支持用户自定义AI提示词模板？
- [ ] 是否需要保存AI分析历史供用户查看？
- [ ] 是否需要实现离线备用方案（在API不可用时使用关键词匹配）？
