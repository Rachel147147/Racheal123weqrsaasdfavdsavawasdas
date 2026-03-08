export interface Requirement {
  id: string;
  category: RequirementCategory;
  question: string;
  answer: string | string[] | number | boolean;
  options?: string[];
}

export type RequirementCategory = 
  | 'basic'
  | 'processor'
  | 'memory'
  | 'communication'
  | 'power'
  | 'peripherals'
  | 'physical';

export interface Processor {
  id: string;
  name: string;
  family: string;
  cores: number;
  clockSpeed: string;
  voltage: string;
  package: string;
  price: string;
}

export interface Memory {
  id: string;
  type: 'SRAM' | 'DRAM' | 'Flash' | 'EEPROM';
  size: string;
  voltage: string;
  package: string;
}

export interface CommunicationInterface {
  id: string;
  name: string;
  type: 'UART' | 'SPI' | 'I2C' | 'USB' | 'CAN' | 'Ethernet' | 'BLE' | 'WiFi';
  version?: string;
}

export interface PowerSupply {
  id: string;
  type: 'Linear' | 'Switching' | 'LDO' | 'Battery';
  inputVoltage: string;
  outputVoltage: string;
  current: string;
}

export interface Peripheral {
  id: string;
  name: string;
  type: string;
  count: number;
}

export interface SchematicComponent {
  id: string;
  type: 'processor' | 'memory' | 'communication' | 'power' | 'peripheral' | 'connector' | 'passive';
  name: string;
  value?: string;
  footprint?: string;
  pins?: ComponentPin[];
  x: number;
  y: number;
  connections: string[];
}

export interface ComponentPin {
  number: string;
  name: string;
  function: string;
}

export interface SchematicConnection {
  from: { component: string; pin: string };
  to: { component: string; pin: string };
  net: string;
}

export interface ProjectRequirements {
  projectName: string;
  description: string;
  requirements: Requirement[];
  processor?: Processor;
  memory?: Memory[];
  communications?: CommunicationInterface[];
  power?: PowerSupply;
  peripherals?: Peripheral[];
}

export interface NaturalLanguageRequirements {
  projectName: string;
  userDescription: string;
  extractedRequirements: ExtractedRequirements;
}

export interface ExtractedRequirements {
  productType: string;
  performanceLevel: 'low' | 'medium' | 'high' | 'ultra';
  applicationDomain: string;
  requiredFeatures: string[];
  communicationInterfaces: string[];
  powerSource: string;
  sensorInputs: string[];
  outputDevices: string[];
  specialRequirements: string[];
}

export type WizardStep = 
  | 'welcome'
  | 'basic'
  | 'processor'
  | 'memory'
  | 'communication'
  | 'power'
  | 'peripherals'
  | 'review'
  | 'generating'
  | 'result'
  | 'nl-input'
  | 'nl-analyzing'
  | 'nl-review';

// ============================================
// 需求分析相关类型
// ============================================

/**
 * 需求优先级
 */
export type RequirementPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 需求状态
 */
export type RequirementStatus = 'pending' | 'analyzing' | 'confirmed' | 'rejected';

/**
 * 详细需求定义
 */
export interface DetailedRequirement {
  /** 需求唯一标识符 */
  id: string;
  /** 需求类别 */
  category: string;
  /** 需求详细描述 */
  description: string;
  /** 需求优先级 */
  priority: RequirementPriority;
  /** 需求当前状态 */
  status: RequirementStatus;
  /** 需求来源（客户/内部/标准） */
  source?: string;
  /** 验收标准 */
  acceptanceCriteria?: string[];
  /** 关联的需求ID */
  relatedRequirements?: string[];
  /** 创建时间 */
  createdAt?: Date;
  /** 更新时间 */
  updatedAt?: Date;
}

/**
 * 性能指标定义
 */
export interface PerformanceMetrics {
  /** 处理速度（MIPS/DMIPS/FLOPS） */
  processingSpeed?: {
    value: number;
    unit: string;
  };
  /** 响应时间 */
  responseTime?: {
    value: number;
    unit: string;
    max?: number;
  };
  /** 精度要求 */
  accuracy?: {
    value: number;
    unit: string;
    description?: string;
  };
  /** 吞吐量 */
  throughput?: {
    value: number;
    unit: string;
  };
  /** 延迟要求 */
  latency?: {
    value: number;
    unit: string;
    max?: number;
  };
  /** 功耗要求 */
  powerConsumption?: {
    typical: number;
    max: number;
    unit: string;
  };
}

/**
 * 环境规格定义
 */
export interface EnvironmentSpec {
  /** 工作温度范围 */
  temperatureRange: {
    min: number;
    max: number;
    unit: 'Celsius' | 'Fahrenheit';
  };
  /** 存储温度范围 */
  storageTemperatureRange?: {
    min: number;
    max: number;
    unit: 'Celsius' | 'Fahrenheit';
  };
  /** 湿度要求 */
  humidity: {
    min: number;
    max: number;
    unit: string;
    condensation?: boolean;
  };
  /** 振动要求 */
  vibration?: {
    frequency: number;
    amplitude: number;
    unit: string;
  };
  /** 冲击要求 */
  shock?: {
    acceleration: number;
    duration: number;
    unit: string;
  };
  /** EMC要求 */
  emcRequirements?: {
    standard: string;
    level: string;
    description?: string;
  }[];
  /** 防护等级 */
  protectionRating?: string;
  /** 海拔要求 */
  altitude?: {
    max: number;
    unit: string;
  };
}

/**
 * 成本预算定义
 */
export interface CostBudget {
  /** 目标成本 */
  targetCost: number;
  /** 货币单位 */
  currency: 'CNY' | 'USD' | 'EUR' | 'JPY';
  /** 量产规模 */
  productionVolume: ProductionScale;
  /** 成本容差百分比 */
  tolerance?: number;
  /** 是否包含NRE费用 */
  includeNRE?: boolean;
  /** 预算分配 */
  allocation?: {
    components: number;
    pcb: number;
    assembly: number;
    testing: number;
    packaging: number;
    other: number;
  };
}

/**
 * 量产规模定义
 */
export interface ProductionScale {
  /** 预期年产量 */
  expectedAnnualVolume: number;
  /** 产品生命周期（年） */
  productLifecycle: number;
  /** 生产批次大小 */
  batchSize?: number;
  /** 生产爬坡计划 */
  rampUpPlan?: {
    initialVolume: number;
    targetVolume: number;
    rampUpPeriod: number;
  };
}

// ============================================
// 方案设计相关类型
// ============================================

/**
 * 系统架构定义
 */
export interface SystemArchitecture {
  /** 架构名称 */
  name: string;
  /** 架构版本 */
  version: string;
  /** 模块列表 */
  modules: ModuleDefinition[];
  /** 接口列表 */
  interfaces: InterfaceDefinition[];
  /** 框图描述 */
  blockDiagram: {
    format: 'svg' | 'png' | 'ascii';
    content: string;
    description?: string;
  };
  /** 架构说明 */
  description?: string;
  /** 设计决策记录 */
  designDecisions?: {
    decision: string;
    rationale: string;
    alternatives?: string[];
  }[];
}

/**
 * 模块类型
 */
export type ModuleType = 
  | 'processor'
  | 'memory'
  | 'power'
  | 'communication'
  | 'sensor'
  | 'actuator'
  | 'interface'
  | 'protection'
  | 'timing'
  | 'custom';

/**
 * 模块定义
 */
export interface ModuleDefinition {
  /** 模块唯一标识符 */
  id: string;
  /** 模块名称 */
  name: string;
  /** 模块类型 */
  type: ModuleType;
  /** 模块参数 */
  parameters: TechnicalParameter[];
  /** 模块连接 */
  connections: {
    interfaceId: string;
    direction: 'input' | 'output' | 'bidirectional';
  }[];
  /** 模块描述 */
  description?: string;
  /** 关联的元器件 */
  associatedComponents?: string[];
  /** 功耗估算 */
  powerEstimate?: number;
}

/**
 * 接口类型
 */
export type InterfaceType = 
  | 'digital'
  | 'analog'
  | 'serial'
  | 'parallel'
  | 'wireless'
  | 'optical'
  | 'mechanical'
  | 'power';

/**
 * 接口定义
 */
export interface InterfaceDefinition {
  /** 接口唯一标识符 */
  id: string;
  /** 接口名称 */
  name: string;
  /** 接口类型 */
  type: InterfaceType;
  /** 通信协议 */
  protocol: string;
  /** 接口参数 */
  parameters: TechnicalParameter[];
  /** 信号列表 */
  signals?: {
    name: string;
    direction: 'input' | 'output' | 'bidirectional';
    description?: string;
  }[];
  /** 数据速率 */
  dataRate?: {
    value: number;
    unit: string;
  };
  /** 接口描述 */
  description?: string;
}

/**
 * 技术参数定义
 */
export interface TechnicalParameter {
  /** 参数名称 */
  name: string;
  /** 参数值 */
  value: string | number | boolean;
  /** 参数单位 */
  unit?: string;
  /** 参数容差 */
  tolerance?: {
    value: number;
    type: 'absolute' | 'percentage';
  };
  /** 参数描述 */
  description?: string;
  /** 是否为关键参数 */
  isCritical?: boolean;
}

// ============================================
// 元器件选型相关类型
// ============================================

/**
 * 元器件类别枚举
 */
export enum ComponentCategory {
  Processor = 'processor',
  Microcontroller = 'microcontroller',
  Memory = 'memory',
  Analog = 'analog',
  Power = 'power',
  Communication = 'communication',
  Sensor = 'sensor',
  Actuator = 'actuator',
  Passive = 'passive',
  Connector = 'connector',
  Protection = 'protection',
  Timing = 'timing',
  Optoelectronics = 'optoelectronics',
  Electromechanical = 'electromechanical',
  Other = 'other'
}

/**
 * 元器件规格定义
 */
export interface ComponentSpec {
  /** 元器件唯一标识符 */
  id: string;
  /** 型号 */
  model: string;
  /** 制造商 */
  manufacturer: string;
  /** 封装类型 */
  package: string;
  /** 单价 */
  price: number;
  /** 货币单位 */
  currency: 'CNY' | 'USD' | 'EUR' | 'JPY';
  /** 元器件类别 */
  category: ComponentCategory;
  /** 关键参数 */
  specifications: TechnicalParameter[];
  /** 备选方案 */
  alternatives?: ComponentAlternative[];
  /** 供货状态 */
  supplyStatus: SupplyStatus;
  /** 数据手册链接 */
  datasheetUrl?: string;
  /** 元器件描述 */
  description?: string;
  /** 是否为推荐型号 */
  isRecommended?: boolean;
  /** 质量等级 */
  qualityGrade?: 'commercial' | 'industrial' | 'automotive' | 'military';
}

/**
 * 元器件备选方案定义
 */
export interface ComponentAlternative {
  /** 备选型号 */
  model: string;
  /** 备选制造商 */
  manufacturer: string;
  /** 价格差异（相对于首选） */
  priceDifference: number;
  /** 可用性状态 */
  availability: 'available' | 'limited' | 'unavailable' | 'obsolete';
  /** 供货周期（天） */
  leadTime?: number;
  /** 兼容性说明 */
  compatibilityNotes?: string;
  /** 性能差异说明 */
  performanceDifference?: string;
}

/**
 * 供货状态定义
 */
export interface SupplyStatus {
  /** 是否有库存 */
  inStock: boolean;
  /** 供货周期（天） */
  leadTime: number;
  /** 可用数量 */
  quantity: number;
  /** 立创商城料号 */
  jlcpcbPartNumber?: string;
  /** Digikey料号 */
  digikeyPartNumber?: string;
  /** Mouser料号 */
  mouserPartNumber?: string;
  /** 分销商库存信息 */
  distributorStock?: {
    name: string;
    quantity: number;
    lastUpdated: Date;
  }[];
  /** 生命周期状态 */
  lifecycleStatus?: 'active' | 'nrnd' | 'obsolete' | 'eol';
  /** EOL日期 */
  eolDate?: Date;
}

// ============================================
// 评估相关类型
// ============================================

/**
 * 技术成熟度等级
 */
export type TechnologyMaturityLevel = 
  | 'concept'
  | 'prototype'
  | 'validated'
  | 'production'
  | 'mature';

/**
 * 复杂度等级
 */
export type ComplexityLevel = 'low' | 'medium' | 'high' | 'very_high';

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * 技术可行性评估
 */
export interface TechnicalFeasibility {
  /** 技术成熟度 */
  maturity: TechnologyMaturityLevel;
  /** 实现复杂度 */
  complexity: ComplexityLevel;
  /** EMC风险等级 */
  emcRisk: RiskLevel;
  /** 热设计风险等级 */
  thermalRisk: RiskLevel;
  /** 信号完整性风险 */
  signalIntegrityRisk?: RiskLevel;
  /** 电源完整性风险 */
  powerIntegrityRisk?: RiskLevel;
  /** 可制造性风险 */
  manufacturabilityRisk?: RiskLevel;
  /** 技术风险评估说明 */
  riskAssessment?: string;
  /** 技术难点 */
  technicalChallenges?: string[];
  /** 缓解措施 */
  mitigationMeasures?: string[];
}

/**
 * 成本分析定义
 */
export interface CostAnalysis {
  /** BOM成本 */
  bomCost: number;
  /** NRE费用 */
  nreCost: {
    tooling: number;
    testing: number;
    certification: number;
    other: number;
    total: number;
  };
  /** 成本明细 */
  costBreakdown: {
    category: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
    subtotal: number;
  }[];
  /** 成本优化建议 */
  optimizationSuggestions?: {
    area: string;
    suggestion: string;
    potentialSaving: number;
    impact: 'low' | 'medium' | 'high';
  }[];
  /** 目标成本达成情况 */
  targetCostStatus?: {
    target: number;
    actual: number;
    variance: number;
    percentage: number;
  };
}

/**
 * 风险评估定义
 */
export interface RiskAssessment {
  /** 供应链风险 */
  supplyRisk: RiskLevel;
  /** 单一来源风险 */
  singleSourceRisk: RiskLevel;
  /** EOL风险 */
  eolRisk: RiskLevel;
  /** 交期风险 */
  leadTimeRisk: RiskLevel;
  /** 质量风险 */
  qualityRisk?: RiskLevel;
  /** 价格波动风险 */
  priceVolatilityRisk?: RiskLevel;
  /** 风险详情 */
  riskDetails?: {
    category: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  /** 高风险元器件列表 */
  highRiskComponents?: string[];
}

/**
 * 生产工艺评估定义
 */
export interface ProductionEvaluation {
  /** PCB层数 */
  pcbLayers: number;
  /** PCB特殊工艺要求 */
  pcbSpecialRequirements?: string[];
  /** SMT要求 */
  smtRequirements: {
    minComponentSize: string;
    finePitch: boolean;
    bgaRequired: boolean;
    doubleSided: boolean;
    specialProcesses?: string[];
  };
  /** 特殊工艺 */
  specialProcesses?: {
    name: string;
    description: string;
    cost: number;
  }[];
  /** 测试计划 */
  testPlan: {
    type: 'ICT' | 'FCT' | 'AOI' | 'X-Ray' | 'BoundaryScan' | 'Visual';
    description: string;
    coverage: number;
  }[];
  /** DFM建议 */
  dfmSuggestions?: string[];
  /** 组装难度 */
  assemblyComplexity?: ComplexityLevel;
}

// ============================================
// 评估结果相关类型
// ============================================

/**
 * 评估结果定义
 */
export interface EvaluationResult {
  /** 技术可行性评估 */
  technicalFeasibility: TechnicalFeasibility;
  /** 成本分析 */
  costAnalysis: CostAnalysis;
  /** 风险评估 */
  riskAssessment: RiskAssessment;
  /** 生产工艺评估 */
  productionEvaluation: ProductionEvaluation;
  /** 优化建议 */
  optimizationSuggestions: OptimizationSuggestion[];
  /** 总体评分 */
  overallScore?: number;
  /** 评估日期 */
  evaluationDate?: Date;
  /** 评估人员 */
  evaluator?: string;
}

/**
 * 优化建议定义
 */
export interface OptimizationSuggestion {
  /** 建议ID */
  id: string;
  /** 建议类别 */
  category: 'cost' | 'performance' | 'reliability' | 'manufacturability' | 'supply_chain' | 'other';
  /** 建议标题 */
  title: string;
  /** 建议详细描述 */
  description: string;
  /** 预期收益 */
  expectedBenefit?: string;
  /** 实施难度 */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** 优先级 */
  priority?: RequirementPriority;
  /** 相关模块或元器件 */
  relatedItems?: string[];
}

// ============================================
// 工作流相关类型
// ============================================

/**
 * 工作流步骤枚举
 */
export enum WorkflowStep {
  /** 需求收集 */
  RequirementGathering = 'requirement_gathering',
  /** 需求分析 */
  RequirementAnalysis = 'requirement_analysis',
  /** 方案设计 */
  SolutionDesign = 'solution_design',
  /** 元器件选型 */
  ComponentSelection = 'component_selection',
  /** 原理图设计 */
  SchematicDesign = 'schematic_design',
  /** PCB设计 */
  PcbDesign = 'pcb_design',
  /** 技术评审 */
  TechnicalReview = 'technical_review',
  /** 成本评估 */
  CostEvaluation = 'cost_evaluation',
  /** 风险评估 */
  RiskEvaluation = 'risk_evaluation',
  /** 生产评估 */
  ProductionEvaluation = 'production_evaluation',
  /** 文档生成 */
  Documentation = 'documentation',
  /** 完成 */
  Completed = 'completed'
}

/**
 * 工作流步骤状态
 */
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';

/**
 * 工作流状态定义
 */
export interface WorkflowState {
  /** 工作流ID */
  workflowId: string;
  /** 项目ID */
  projectId: string;
  /** 当前步骤 */
  currentStep: WorkflowStep;
  /** 步骤历史 */
  stepHistory: {
    step: WorkflowStep;
    status: StepStatus;
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
  }[];
  /** 需求数据 */
  requirementData?: {
    detailedRequirements: DetailedRequirement[];
    performanceMetrics?: PerformanceMetrics;
    environmentSpec?: EnvironmentSpec;
    costBudget?: CostBudget;
  };
  /** 设计数据 */
  designData?: {
    systemArchitecture?: SystemArchitecture;
    selectedComponents?: ComponentSpec[];
  };
  /** 评估数据 */
  evaluationData?: {
    technicalFeasibility?: TechnicalFeasibility;
    costAnalysis?: CostAnalysis;
    riskAssessment?: RiskAssessment;
    productionEvaluation?: ProductionEvaluation;
  };
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 工作流元数据 */
  metadata?: Record<string, unknown>;
}
