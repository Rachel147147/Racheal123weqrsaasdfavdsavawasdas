# 四界面硬件设计系统重构规范

## Why
当前系统包含过多界面和组件，导致用户体验复杂、代码维护困难。用户需要一个简洁、直观的四界面流程，从项目信息输入到最终原理图生成，实现完整的硬件设计工作流。

## What Changes
- **界面1**：项目信息输入界面 - 简洁表单，包含项目名称和描述输入
- **界面2**：需求分析结果界面 - 展示DeepSeek智能分析结果
- **界面3**：硬件方案与元器件清单界面 - 左右分栏布局，方案+清单
- **界面4**：最终硬件原理图界面 - 嘉立创格式原理图展示
- **BREAKING** 删除所有其他无关界面、组件和代码，仅保留四个核心界面

## Impact
- Affected specs: deepseek-ai-integration, enhance-hardware-engineer-workflow
- Affected code:
  - 删除: WelcomeScreen, RequirementWizard, SolutionDesign, ComponentSelection, SolutionEvaluation, DocumentDelivery 等组件
  - 保留并重构: SmartRequirementAnalyzer, TechnicalSolutionDisplay, JLCEDASchematicViewer
  - 新增: ProjectInputForm, AnalysisResultDisplay, HardwareSolutionView, SchematicViewer

## ADDED Requirements

### Requirement: 界面1 - 项目信息输入
系统 SHALL 提供简洁直观的项目信息输入表单。

#### Scenario: 表单字段验证
- **WHEN** 用户在项目名称输入框输入内容
- **THEN** 系统应实现：
  - 最多支持50个字符
  - 实时字符计数显示
  - 超过限制时显示视觉警告
  - 必填项验证，未填写时显示错误提示

#### Scenario: 项目描述输入
- **WHEN** 用户在项目描述文本区域输入内容
- **THEN** 系统应实现：
  - 最多支持500个字符
  - 实时字符计数显示
  - 超过限制时显示视觉警告
  - 必填项验证，未填写时显示错误提示

#### Scenario: 开始分析按钮
- **WHEN** 用户点击"开始分析"按钮
- **THEN** 系统应执行：
  - 表单数据验证（所有必填字段已填写）
  - 显示加载状态指示器（骨架屏或加载动画）
  - 调用DeepSeek API进行智能需求分析
  - API超时时间设置为30秒
  - 成功后跳转至界面2（300-500ms过渡动画）

### Requirement: 界面2 - 需求分析结果
系统 SHALL 格式化展示DeepSeek返回的智能需求分析结果。

#### Scenario: 结果展示
- **WHEN** AI分析完成
- **THEN** 系统应展示：
  - 支持富文本样式（标题、列表、加粗）
  - 文本排版清晰易读
  - 滚动条美化和平滑滚动
  - 响应式布局适配不同屏幕

#### Scenario: 生成硬件方案按钮
- **WHEN** 用户点击"生成硬件方案"按钮
- **THEN** 系统应执行：
  - 显示加载状态指示器
  - 调用DeepSeek API搜集行业信息
  - 生成项目硬件方案
  - 显示友好错误提示（含错误原因和解决方案）
  - 成功后跳转至界面3（300-500ms过渡动画）

### Requirement: 界面3 - 硬件方案与元器件清单
系统 SHALL 采用左右分栏布局展示硬件方案和元器件清单。

#### Scenario: 左侧硬件方案展示
- **WHEN** 界面加载完成
- **THEN** 左侧应展示：
  - 方案概述
  - 设计思路
  - 技术参数
  - 连线方式
  - 响应式调整（小屏幕切换上下布局）

#### Scenario: 右侧元器件清单展示
- **WHEN** 界面加载完成
- **THEN** 右侧应展示表格：
  - 元器件名称、型号、规格参数、推荐品牌、数量、备注
  - 表格排序功能
  - 滚动优化，表头固定

#### Scenario: 导出方案功能
- **WHEN** 用户点击"导出方案"按钮
- **THEN** 系统应导出PDF格式文件，包含所有方案内容和元器件清单

#### Scenario: 返回重新输入
- **WHEN** 用户点击"返回重新输入"按钮
- **THEN** 系统应显示确认提示"确定要返回重新输入项目信息吗？当前方案和分析结果将被清除"

#### Scenario: 生成原理图按钮
- **WHEN** 用户点击"生成原理图"按钮
- **THEN** 系统应执行：
  - 显示加载状态指示器
  - 调用DeepSeek API进行元器件排布和连接
  - 显示错误信息和重试选项
  - 成功后跳转至界面4（300-500ms过渡动画）

### Requirement: 界面4 - 最终硬件原理图
系统 SHALL 展示嘉立创专业格式的硬件原理图。

#### Scenario: 原理图展示
- **WHEN** 界面加载完成
- **THEN** 系统应展示：
  - 嘉立创专业原理图格式
  - 清晰显示DeepSeek生成的成品原理图

#### Scenario: 缩放功能
- **WHEN** 用户操作缩放
- **THEN** 系统应支持：
  - 鼠标滚轮缩放
  - 缩放控制按钮
  - 缩放范围0.5x-3x

#### Scenario: 平移功能
- **WHEN** 用户操作平移
- **THEN** 系统应支持：
  - 鼠标拖动平移
  - 方向键控制平移

#### Scenario: 下载原理图
- **WHEN** 用户点击"下载原理图"按钮
- **THEN** 系统应提供：
  - PNG/JPG格式选择
  - 分辨率选择选项

#### Scenario: 返回修改
- **WHEN** 用户点击"返回修改"按钮
- **THEN** 系统应返回界面3，保留已生成的硬件方案数据

#### Scenario: 完成流程
- **WHEN** 用户点击"完成"按钮
- **THEN** 系统应显示成功提示"硬件方案设计已完成，原理图已生成"

### Requirement: 技术实现要求
系统 SHALL 满足以下技术要求。

#### Scenario: 代码结构
- **WHEN** 实现功能
- **THEN** 系统应：
  - 仅保留四个界面及相关功能
  - 删除所有其他无关界面、组件和代码
  - 采用组件化开发，每个界面为独立组件
  - 公共功能提取为工具函数或公共组件

#### Scenario: 响应式设计
- **WHEN** 用户使用不同设备访问
- **THEN** 系统应：
  - 适配Chrome、Firefox、Safari、Edge最新版本
  - 支持屏幕分辨率1366×768到1920×1080及以上

#### Scenario: 加载状态与错误处理
- **WHEN** 系统执行操作
- **THEN** 系统应：
  - 使用骨架屏或加载动画
  - 显示具体错误信息和解决方案建议
  - 错误信息包含错误代码和可能的解决步骤

#### Scenario: API调用安全稳定
- **WHEN** 调用DeepSeek API
- **THEN** 系统应：
  - 请求超时处理（60秒）
  - 重试机制（最多3次）
  - 错误日志记录

#### Scenario: 用户体验优化
- **WHEN** 用户进行交互
- **THEN** 系统应：
  - 按钮悬停效果
  - 页面切换动画
  - 操作成功提示
  - 交互反馈延迟不超过100ms

#### Scenario: 视觉风格一致
- **WHEN** 界面渲染
- **THEN** 系统应：
  - 统一的颜色方案
  - 统一的字体（Roboto或Inter）
  - 统一的组件样式
  - 美观、专业且易用

#### Scenario: 数据缓存
- **WHEN** API调用成功
- **THEN** 系统应：
  - 使用localStorage或sessionStorage缓存API响应
  - 缓存有效期24小时
  - 避免重复API请求

#### Scenario: 用户引导
- **WHEN** 用户进入界面
- **THEN** 系统应：
  - 每个界面添加简短使用说明
  - 复杂操作提供工具提示

## MODIFIED Requirements

### Requirement: 页面性能
- **WHEN** 用户访问页面
- **THEN** 页面加载时间控制在3秒以内，交互响应时间控制在300ms以内

## REMOVED Requirements

### Requirement: 多步骤工作流
**Reason**: 简化为四个核心界面，删除WelcomeScreen、RequirementWizard等组件
**Migration**: 现有工作流步骤合并到四个界面中

### Requirement: 方案评估模块
**Reason**: 简化流程，评估内容整合到硬件方案界面
**Migration**: 技术可行性、成本效益等评估内容在界面3中展示

### Requirement: 文档交付模块
**Reason**: 功能整合到界面3的导出功能
**Migration**: PDF导出功能在界面3实现

### Requirement: 元器件选型独立模块
**Reason**: 整合到界面3的元器件清单区域
**Migration**: 元器件选型结果直接在界面3右侧展示
