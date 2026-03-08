import {
  DetailedRequirement,
  RequirementPriority,
  RequirementStatus,
  SystemArchitecture,
  ModuleDefinition,
  InterfaceDefinition,
  TechnicalParameter,
  ComponentSpec,
  ComponentCategory,
  CostAnalysis,
  TechnicalFeasibility,
  RiskAssessment,
  ProductionEvaluation,
  RiskLevel,
  ComplexityLevel,
  TechnologyMaturityLevel,
} from '../types';

// ============================================
// 需求冲突定义
// ============================================

/**
 * 需求冲突定义
 */
export interface Conflict {
  /** 冲突ID */
  id: string;
  /** 冲突类型 */
  type: 'hard' | 'soft';
  /** 冲突描述 */
  description: string;
  /** 涉及的需求ID列表 */
  requirementIds: string[];
  /** 冲突严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 解决建议 */
  resolution?: string;
}

/**
 * 电源需求定义
 */
export interface PowerRequirement {
  /** 输入电压范围 */
  inputVoltage: {
    min: number;
    max: number;
    unit: string;
  };
  /** 输出电压需求 */
  outputVoltages: {
    voltage: number;
    current: number;
    unit: string;
    description?: string;
  }[];
  /** 功率预算 */
  powerBudget?: number;
  /** 效率要求 */
  efficiencyRequirement?: number;
  /** 是否需要电池供电 */
  batteryPowered?: boolean;
  /** 低功耗要求 */
  lowPowerRequired?: boolean;
}

// ============================================
// 需求关键词映射
// ============================================

const requirementKeywords: Record<string, { category: string; priority: RequirementPriority }> = {
  // 性能相关
  '高性能': { category: 'performance', priority: 'high' },
  '快速': { category: 'performance', priority: 'medium' },
  '实时': { category: 'performance', priority: 'critical' },
  '低延迟': { category: 'performance', priority: 'high' },
  '高吞吐': { category: 'performance', priority: 'high' },
  
  // 功耗相关
  '低功耗': { category: 'power', priority: 'high' },
  '电池供电': { category: 'power', priority: 'critical' },
  '省电': { category: 'power', priority: 'medium' },
  '待机时间长': { category: 'power', priority: 'high' },
  
  // 通信相关
  'WiFi': { category: 'communication', priority: 'high' },
  '蓝牙': { category: 'communication', priority: 'high' },
  'BLE': { category: 'communication', priority: 'high' },
  '以太网': { category: 'communication', priority: 'high' },
  'CAN': { category: 'communication', priority: 'high' },
  'LoRa': { category: 'communication', priority: 'high' },
  '无线': { category: 'communication', priority: 'medium' },
  
  // 存储相关
  '大容量': { category: 'memory', priority: 'medium' },
  '存储': { category: 'memory', priority: 'medium' },
  '数据记录': { category: 'memory', priority: 'medium' },
  
  // 环境相关
  '工业级': { category: 'environment', priority: 'high' },
  '汽车级': { category: 'environment', priority: 'critical' },
  '宽温': { category: 'environment', priority: 'high' },
  '防水': { category: 'environment', priority: 'medium' },
  '防尘': { category: 'environment', priority: 'medium' },
  
  // 成本相关
  '低成本': { category: 'cost', priority: 'high' },
  '经济': { category: 'cost', priority: 'medium' },
  '预算有限': { category: 'cost', priority: 'high' },
  
  // 接口相关
  'USB': { category: 'interface', priority: 'medium' },
  '串口': { category: 'interface', priority: 'medium' },
  'SPI': { category: 'interface', priority: 'medium' },
  'I2C': { category: 'interface', priority: 'medium' },
  
  // 传感器相关
  '传感器': { category: 'sensor', priority: 'medium' },
  '温度': { category: 'sensor', priority: 'medium' },
  '湿度': { category: 'sensor', priority: 'medium' },
  '加速度': { category: 'sensor', priority: 'medium' },
  '压力': { category: 'sensor', priority: 'medium' },
  
  // 安全相关
  '安全': { category: 'security', priority: 'critical' },
  '加密': { category: 'security', priority: 'high' },
  '认证': { category: 'security', priority: 'high' },
};

// ============================================
// 需求分析算法
// ============================================

/**
 * 从自然语言提取结构化需求
 * @param input 自然语言输入
 * @returns 结构化需求列表
 */
export function analyzeRequirements(input: string): DetailedRequirement[] {
  const requirements: DetailedRequirement[] = [];
  const sentences = input.split(/[。！？，,;；\n]+/).filter(s => s.trim());
  
  let requirementId = 1;
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // 分析每个句子，提取需求
    const extractedReqs = extractRequirementsFromSentence(trimmedSentence, requirementId);
    requirements.push(...extractedReqs);
    requirementId += extractedReqs.length;
  }
  
  // 如果没有提取到需求，创建一个通用需求
  if (requirements.length === 0) {
    requirements.push({
      id: 'REQ-001',
      category: 'general',
      description: input,
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return requirements;
}

/**
 * 从单个句子提取需求
 */
function extractRequirementsFromSentence(sentence: string, startId: number): DetailedRequirement[] {
  const requirements: DetailedRequirement[] = [];
  
  // 检查关键词匹配
  for (const [keyword, mapping] of Object.entries(requirementKeywords)) {
    if (sentence.includes(keyword)) {
      const existingReq = requirements.find(r => r.category === mapping.category);
      
      if (existingReq) {
        // 更新现有需求的描述
        if (!existingReq.description.includes(keyword)) {
          existingReq.description += `、${keyword}`;
        }
        // 如果新的优先级更高，则更新
        if (getPriorityWeight(mapping.priority) > getPriorityWeight(existingReq.priority)) {
          existingReq.priority = mapping.priority;
        }
      } else {
        requirements.push({
          id: `REQ-${String(startId + requirements.length).padStart(3, '0')}`,
          category: mapping.category,
          description: `需要${keyword}功能`,
          priority: mapping.priority,
          status: 'pending',
          source: '自然语言提取',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  
  // 如果没有匹配到关键词，但句子有意义，创建通用需求
  if (requirements.length === 0 && sentence.length > 5) {
    requirements.push({
      id: `REQ-${String(startId).padStart(3, '0')}`,
      category: 'functional',
      description: sentence,
      priority: 'medium',
      status: 'pending',
      source: '自然语言提取',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return requirements;
}

/**
 * 获取优先级权重
 */
function getPriorityWeight(priority: RequirementPriority): number {
  const weights: Record<RequirementPriority, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1,
  };
  return weights[priority];
}

/**
 * 需求优先级排序
 * @param requirements 需求列表
 * @returns 排序后的需求列表
 */
export function prioritizeRequirements(requirements: DetailedRequirement[]): DetailedRequirement[] {
  return [...requirements].sort((a, b) => {
    // 首先按优先级排序
    const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    
    // 然后按状态排序（pending优先）
    const statusOrder: Record<RequirementStatus, number> = {
      'pending': 0,
      'analyzing': 1,
      'confirmed': 2,
      'rejected': 3,
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // 最后按创建时间排序
    const aTime = a.createdAt?.getTime() || 0;
    const bTime = b.createdAt?.getTime() || 0;
    return aTime - bTime;
  });
}

/**
 * 检测需求冲突
 * @param requirements 需求列表
 * @returns 冲突列表
 */
export function detectConflicts(requirements: DetailedRequirement[]): Conflict[] {
  const conflicts: Conflict[] = [];
  let conflictId = 1;
  
  // 定义冲突规则
  const conflictRules: Array<{
    check: (reqs: DetailedRequirement[]) => Conflict | null;
    description: string;
  }> = [
    // 低成本 vs 高性能
    {
      check: (reqs) => {
        const lowCost = reqs.find(r => r.category === 'cost' && r.description.includes('低成本'));
        const highPerf = reqs.find(r => r.category === 'performance' && r.priority === 'high');
        if (lowCost && highPerf) {
          return {
            id: `CONFLICT-${conflictId}`,
            type: 'soft' as const,
            description: '低成本需求与高性能需求可能存在冲突',
            requirementIds: [lowCost.id, highPerf.id],
            severity: 'medium',
            resolution: '建议在性能和成本之间进行权衡，或考虑分阶段实现',
          };
        }
        return null;
      },
      description: '成本与性能冲突',
    },
    // 低功耗 vs 高性能
    {
      check: (reqs) => {
        const lowPower = reqs.find(r => r.category === 'power' && r.description.includes('低功耗'));
        const highPerf = reqs.find(r => r.category === 'performance' && r.priority === 'high');
        if (lowPower && highPerf) {
          return {
            id: `CONFLICT-${conflictId}`,
            type: 'soft' as const,
            description: '低功耗需求与高性能需求可能存在冲突',
            requirementIds: [lowPower.id, highPerf.id],
            severity: 'medium',
            resolution: '建议采用动态功耗管理策略，在需要高性能时提升性能，空闲时降低功耗',
          };
        }
        return null;
      },
      description: '功耗与性能冲突',
    },
    // 电池供电 vs 高功耗功能
    {
      check: (reqs) => {
        const battery = reqs.find(r => r.description.includes('电池供电'));
        const wifi = reqs.find(r => r.description.includes('WiFi'));
        const ble = reqs.find(r => r.description.includes('蓝牙') || r.description.includes('BLE'));
        if (battery && (wifi || ble)) {
          return {
            id: `CONFLICT-${conflictId}`,
            type: 'soft' as const,
            description: '电池供电与无线通信功能可能影响续航时间',
            requirementIds: battery ? [battery.id, (wifi || ble)!.id] : [],
            severity: 'medium',
            resolution: '建议优化无线通信策略，采用低功耗模式，合理规划唤醒间隔',
          };
        }
        return null;
      },
      description: '电池与无线通信冲突',
    },
    // 工业级 vs 低成本
    {
      check: (reqs) => {
        const industrial = reqs.find(r => r.description.includes('工业级') || r.description.includes('汽车级'));
        const lowCost = reqs.find(r => r.category === 'cost' && r.description.includes('低成本'));
        if (industrial && lowCost) {
          return {
            id: `CONFLICT-${conflictId}`,
            type: 'hard' as const,
            description: '工业级/汽车级要求与低成本需求存在冲突',
            requirementIds: [industrial.id, lowCost.id],
            severity: 'high',
            resolution: '工业级元器件成本较高，建议重新评估成本预算或降低环境要求',
          };
        }
        return null;
      },
      description: '工业级与成本冲突',
    },
    // 宽温 vs 普通元器件
    {
      check: (reqs) => {
        const wideTemp = reqs.find(r => r.description.includes('宽温'));
        if (wideTemp) {
          // 检查是否有温度范围的具体要求
          const tempRange = reqs.find(r => 
            r.description.includes('-40') || r.description.includes('85') || r.description.includes('125')
          );
          if (!tempRange) {
            return {
              id: `CONFLICT-${conflictId}`,
              type: 'soft' as const,
              description: '宽温需求需要明确具体的温度范围',
              requirementIds: [wideTemp.id],
              severity: 'low',
              resolution: '建议明确工作温度范围，如-40°C~+85°C（工业级）或-40°C~+125°C（汽车级）',
            };
          }
        }
        return null;
      },
      description: '温度范围不明确',
    },
  ];
  
  // 执行冲突检测
  for (const rule of conflictRules) {
    const conflict = rule.check(requirements);
    if (conflict) {
      conflicts.push(conflict);
      conflictId++;
    }
  }
  
  return conflicts;
}

// ============================================
// 系统架构生成算法
// ============================================

/**
 * 生成系统架构
 * @param requirements 需求列表
 * @returns 系统架构
 */
export function generateSystemArchitecture(requirements: DetailedRequirement[]): SystemArchitecture {
  // 分析需求，确定架构类型
  const hasWiFi = requirements.some(r => r.description.includes('WiFi'));
  const hasBLE = requirements.some(r => r.description.includes('蓝牙') || r.description.includes('BLE'));
  const hasEthernet = requirements.some(r => r.description.includes('以太网'));
  const hasLowPower = requirements.some(r => r.description.includes('低功耗') || r.description.includes('电池'));
  const hasSensor = requirements.some(r => r.category === 'sensor');
  
  // 生成模块定义
  const modules = defineModulesFromRequirements(requirements);
  
  // 生成接口定义
  const interfaces = defineInterfacesFromModules(modules, requirements);
  
  // 生成架构名称
  let architectureName = '嵌入式系统架构';
  if (hasWiFi && hasBLE) {
    architectureName = '物联网无线通信系统架构';
  } else if (hasEthernet) {
    architectureName = '工业以太网控制系统架构';
  } else if (hasLowPower) {
    architectureName = '低功耗嵌入式系统架构';
  } else if (hasSensor) {
    architectureName = '传感器数据采集系统架构';
  }
  
  // 生成框图描述
  const blockDiagram = generateBlockDiagram(modules, interfaces);
  
  return {
    name: architectureName,
    version: '1.0.0',
    modules,
    interfaces,
    blockDiagram,
    description: `基于需求分析自动生成的系统架构，包含${modules.length}个功能模块和${interfaces.length}个接口`,
    designDecisions: generateDesignDecisions(requirements, modules),
  };
}

/**
 * 从需求定义模块
 */
function defineModulesFromRequirements(requirements: DetailedRequirement[]): ModuleDefinition[] {
  const modules: ModuleDefinition[] = [];
  let moduleId = 1;
  
  // 始终包含处理器模块
  modules.push({
    id: `MOD-${String(moduleId++).padStart(3, '0')}`,
    name: '主控制器模块',
    type: 'processor',
    parameters: [
      { name: '核心类型', value: '待定', isCritical: true },
      { name: '工作频率', value: '待定', unit: 'MHz', isCritical: true },
      { name: 'Flash容量', value: '待定', unit: 'KB', isCritical: true },
      { name: 'RAM容量', value: '待定', unit: 'KB', isCritical: true },
    ],
    connections: [],
    description: '系统核心处理单元，负责数据处理和逻辑控制',
  });
  
  // 检查是否需要电源模块
  const hasPowerReq = requirements.some(r => 
    r.category === 'power' || r.description.includes('电源') || r.description.includes('供电')
  );
  if (hasPowerReq) {
    modules.push({
      id: `MOD-${String(moduleId++).padStart(3, '0')}`,
      name: '电源管理模块',
      type: 'power',
      parameters: [
        { name: '输入电压', value: '待定', unit: 'V', isCritical: true },
        { name: '输出电压', value: '3.3V/5V', isCritical: true },
        { name: '效率要求', value: '≥85%', isCritical: false },
      ],
      connections: [],
      description: '电源转换和管理单元，为系统提供稳定电源',
    });
  }
  
  // 检查是否需要通信模块
  const commReqs = requirements.filter(r => r.category === 'communication');
  if (commReqs.length > 0) {
    const commTypes: string[] = [];
    commReqs.forEach(r => {
      if (r.description.includes('WiFi')) commTypes.push('WiFi');
      if (r.description.includes('蓝牙') || r.description.includes('BLE')) commTypes.push('BLE');
      if (r.description.includes('以太网')) commTypes.push('Ethernet');
      if (r.description.includes('CAN')) commTypes.push('CAN');
      if (r.description.includes('LoRa')) commTypes.push('LoRa');
    });
    
    modules.push({
      id: `MOD-${String(moduleId++).padStart(3, '0')}`,
      name: '通信模块',
      type: 'communication',
      parameters: [
        { name: '通信方式', value: commTypes.join('/'), isCritical: true },
        { name: '协议支持', value: 'TCP/IP/BLE Stack', isCritical: false },
      ],
      connections: [],
      description: `支持${commTypes.join('、')}通信功能`,
    });
  }
  
  // 检查是否需要存储模块
  const hasMemoryReq = requirements.some(r => 
    r.category === 'memory' || r.description.includes('存储') || r.description.includes('数据记录')
  );
  if (hasMemoryReq) {
    modules.push({
      id: `MOD-${String(moduleId++).padStart(3, '0')}`,
      name: '存储模块',
      type: 'memory',
      parameters: [
        { name: '存储类型', value: 'Flash/EEPROM', isCritical: true },
        { name: '容量', value: '待定', unit: 'MB', isCritical: true },
      ],
      connections: [],
      description: '数据存储单元，用于程序存储和数据记录',
    });
  }
  
  // 检查是否需要传感器模块
  const sensorReqs = requirements.filter(r => r.category === 'sensor');
  if (sensorReqs.length > 0) {
    const sensorTypes: string[] = [];
    sensorReqs.forEach(r => {
      if (r.description.includes('温度')) sensorTypes.push('温度传感器');
      if (r.description.includes('湿度')) sensorTypes.push('湿度传感器');
      if (r.description.includes('加速度')) sensorTypes.push('加速度传感器');
      if (r.description.includes('压力')) sensorTypes.push('压力传感器');
    });
    if (sensorTypes.length === 0) sensorTypes.push('通用传感器');
    
    modules.push({
      id: `MOD-${String(moduleId++).padStart(3, '0')}`,
      name: '传感器模块',
      type: 'sensor',
      parameters: [
        { name: '传感器类型', value: sensorTypes.join('/'), isCritical: true },
        { name: '采样率', value: '待定', unit: 'Hz', isCritical: false },
      ],
      connections: [],
      description: `集成${sensorTypes.join('、')}，用于环境感知`,
    });
  }
  
  // 检查是否需要接口模块
  const interfaceReqs = requirements.filter(r => r.category === 'interface');
  if (interfaceReqs.length > 0) {
    modules.push({
      id: `MOD-${String(moduleId++).padStart(3, '0')}`,
      name: '接口模块',
      type: 'interface',
      parameters: [
        { name: '接口类型', value: 'USB/UART/SPI/I2C', isCritical: true },
      ],
      connections: [],
      description: '外部接口单元，提供与外部设备的连接能力',
    });
  }
  
  return modules;
}

/**
 * 从模块定义接口
 */
function defineInterfacesFromModules(
  modules: ModuleDefinition[],
  _requirements: DetailedRequirement[]
): InterfaceDefinition[] {
  const interfaces: InterfaceDefinition[] = [];
  let interfaceId = 1;
  
  // 处理器与各模块之间的接口
  const processor = modules.find(m => m.type === 'processor');
  if (!processor) return interfaces;
  
  // 电源接口
  const power = modules.find(m => m.type === 'power');
  if (power) {
    interfaces.push({
      id: `IF-${String(interfaceId++).padStart(3, '0')}`,
      name: '电源总线',
      type: 'power',
      protocol: 'Power Rail',
      parameters: [
        { name: '电压', value: '3.3', unit: 'V', isCritical: true },
        { name: '最大电流', value: '待定', unit: 'mA', isCritical: true },
      ],
      signals: [
        { name: 'VCC', direction: 'output', description: '主电源输出' },
        { name: 'GND', direction: 'output', description: '地' },
      ],
      description: '系统主电源供电接口',
    });
  }
  
  // 通信接口
  const communication = modules.find(m => m.type === 'communication');
  if (communication) {
    // 检查需要哪种通信接口
    const commParams = communication.parameters.find(p => p.name === '通信方式');
    const commTypes = String(commParams?.value || '').split('/');
    
    if (commTypes.includes('WiFi') || commTypes.includes('BLE')) {
      interfaces.push({
        id: `IF-${String(interfaceId++).padStart(3, '0')}`,
        name: 'UART调试接口',
        type: 'serial',
        protocol: 'UART',
        parameters: [
          { name: '波特率', value: '115200', unit: 'bps', isCritical: false },
          { name: '数据位', value: '8', isCritical: false },
        ],
        signals: [
          { name: 'TX', direction: 'output', description: '发送数据' },
          { name: 'RX', direction: 'input', description: '接收数据' },
        ],
        description: '用于调试和固件更新的串口接口',
      });
    }
    
    if (commTypes.includes('Ethernet')) {
      interfaces.push({
        id: `IF-${String(interfaceId++).padStart(3, '0')}`,
        name: '以太网接口',
        type: 'serial',
        protocol: 'RMII/RGMII',
        parameters: [
          { name: '速率', value: '100', unit: 'Mbps', isCritical: true },
        ],
        signals: [
          { name: 'TXD[0:1]', direction: 'output', description: '发送数据' },
          { name: 'RXD[0:1]', direction: 'input', description: '接收数据' },
        ],
        description: '以太网PHY接口',
      });
    }
    
    if (commTypes.includes('CAN')) {
      interfaces.push({
        id: `IF-${String(interfaceId++).padStart(3, '0')}`,
        name: 'CAN总线接口',
        type: 'serial',
        protocol: 'CAN 2.0B',
        parameters: [
          { name: '速率', value: '1', unit: 'Mbps', isCritical: true },
        ],
        signals: [
          { name: 'CAN_TX', direction: 'output', description: 'CAN发送' },
          { name: 'CAN_RX', direction: 'input', description: 'CAN接收' },
        ],
        description: 'CAN总线通信接口',
      });
    }
  }
  
  // 传感器接口
  const sensor = modules.find(m => m.type === 'sensor');
  if (sensor) {
    interfaces.push({
      id: `IF-${String(interfaceId++).padStart(3, '0')}`,
      name: '传感器接口',
      type: 'analog',
      protocol: 'I2C/SPI/ADC',
      parameters: [
        { name: '接口类型', value: 'I2C/SPI', isCritical: true },
        { name: 'ADC分辨率', value: '12', unit: 'bit', isCritical: false },
      ],
      signals: [
        { name: 'SDA', direction: 'bidirectional', description: 'I2C数据' },
        { name: 'SCL', direction: 'output', description: 'I2C时钟' },
        { name: 'ADC_IN', direction: 'input', description: '模拟输入' },
      ],
      description: '传感器数据采集接口',
    });
  }
  
  // 存储接口
  const memory = modules.find(m => m.type === 'memory');
  if (memory) {
    interfaces.push({
      id: `IF-${String(interfaceId++).padStart(3, '0')}`,
      name: '存储接口',
      type: 'serial',
      protocol: 'SPI/QSPI',
      parameters: [
        { name: '时钟频率', value: '50', unit: 'MHz', isCritical: false },
      ],
      signals: [
        { name: 'MOSI', direction: 'output', description: '主出从入' },
        { name: 'MISO', direction: 'input', description: '主入从出' },
        { name: 'SCK', direction: 'output', description: '时钟' },
        { name: 'CS', direction: 'output', description: '片选' },
      ],
      description: '外部存储器接口',
    });
  }
  
  return interfaces;
}

/**
 * 生成框图
 */
function generateBlockDiagram(
  modules: ModuleDefinition[],
  _interfaces: InterfaceDefinition[]
): SystemArchitecture['blockDiagram'] {
  // 生成ASCII框图
  let diagram = `
┌─────────────────────────────────────────────────────────────┐
│                      系统架构框图                            │
└─────────────────────────────────────────────────────────────┘

`;
  
  // 绘制模块
  const moduleBoxes = modules.map(m => {
    const width = Math.max(m.name.length + 4, 20);
    const line = '─'.repeat(width);
    return `┌${line}┐
│${centerText(m.name, width)}│
├${line}┤
│${centerText(m.type.toUpperCase(), width)}│
└${line}┘`;
  });
  
  diagram += moduleBoxes.join('\n\n        │\n        ▼\n\n');
  
  return {
    format: 'ascii',
    content: diagram,
    description: '系统架构框图，展示各功能模块之间的关系',
  };
}

/**
 * 文本居中
 */
function centerText(text: string, width: number): string {
  const padding = width - text.length;
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

/**
 * 生成设计决策记录
 */
function generateDesignDecisions(
  requirements: DetailedRequirement[],
  _modules: ModuleDefinition[]
): SystemArchitecture['designDecisions'] {
  const decisions: SystemArchitecture['designDecisions'] = [];
  
  // 根据需求生成设计决策
  const hasLowPower = requirements.some(r => r.description.includes('低功耗'));
  if (hasLowPower) {
    decisions.push({
      decision: '采用低功耗设计策略',
      rationale: '需求中明确要求低功耗，需要选择低功耗MCU并优化电源管理',
      alternatives: ['标准功耗设计', '动态功耗管理'],
    });
  }
  
  const hasWiFi = requirements.some(r => r.description.includes('WiFi'));
  const hasBLE = requirements.some(r => r.description.includes('蓝牙') || r.description.includes('BLE'));
  if (hasWiFi && hasBLE) {
    decisions.push({
      decision: '采用WiFi+BLE二合一模块',
      rationale: '同时需要WiFi和BLE功能，使用集成模块可以降低成本和复杂度',
      alternatives: ['分离式WiFi模块+BLE芯片', 'ESP32系列芯片'],
    });
  }
  
  const hasIndustrial = requirements.some(r => r.description.includes('工业级'));
  if (hasIndustrial) {
    decisions.push({
      decision: '选用工业级元器件',
      rationale: '工业级应用环境要求，需要选择-40°C~+85°C工作温度范围的元器件',
      alternatives: ['汽车级元器件（更高成本）', '商业级元器件（不推荐）'],
    });
  }
  
  return decisions;
}

/**
 * 定义模块
 * @param architecture 系统架构
 * @returns 模块定义列表
 */
export function defineModules(architecture: SystemArchitecture): ModuleDefinition[] {
  return architecture.modules;
}

/**
 * 定义接口
 * @param modules 模块定义列表
 * @returns 接口定义列表
 */
export function defineInterfaces(modules: ModuleDefinition[]): InterfaceDefinition[] {
  const interfaces: InterfaceDefinition[] = [];
  let interfaceId = 1;
  
  for (const module of modules) {
    // 根据模块类型生成相应接口
    switch (module.type) {
      case 'processor':
        interfaces.push({
          id: `IF-${String(interfaceId++).padStart(3, '0')}`,
          name: '处理器总线',
          type: 'parallel',
          protocol: 'Internal Bus',
          parameters: module.parameters,
          description: '处理器内部总线接口',
        });
        break;
      case 'communication':
        interfaces.push({
          id: `IF-${String(interfaceId++).padStart(3, '0')}`,
          name: '通信接口',
          type: 'serial',
          protocol: 'UART/SPI',
          parameters: module.parameters,
          description: '外部通信接口',
        });
        break;
      case 'sensor':
        interfaces.push({
          id: `IF-${String(interfaceId++).padStart(3, '0')}`,
          name: '传感器接口',
          type: 'analog',
          protocol: 'I2C/SPI/ADC',
          parameters: module.parameters,
          description: '传感器数据接口',
        });
        break;
    }
  }
  
  return interfaces;
}

// ============================================
// 元器件选型匹配算法
// ============================================

/**
 * 匹配元器件
 * @param requirements 需求列表
 * @param architecture 系统架构
 * @returns 元器件规格列表
 */
export function matchComponents(
  requirements: DetailedRequirement[],
  architecture: SystemArchitecture
): ComponentSpec[] {
  const components: ComponentSpec[] = [];
  
  // 选择MCU
  const mcu = selectMCU(requirements);
  if (mcu) {
    components.push(mcu);
  }
  
  // 根据架构模块选择其他元器件
  for (const module of architecture.modules) {
    switch (module.type) {
      case 'power':
        const powerComponents = selectPowerComponentsFromModule(module);
        components.push(...powerComponents);
        break;
      case 'communication':
        const commComponents = selectCommunicationComponents(requirements);
        components.push(...commComponents);
        break;
      case 'sensor':
        const sensorComponents = selectSensorComponents(requirements);
        components.push(...sensorComponents);
        break;
      case 'memory':
        const memoryComponents = selectMemoryComponents(requirements);
        components.push(...memoryComponents);
        break;
    }
  }
  
  return components;
}

/**
 * 选择MCU
 * @param requirements 需求列表
 * @returns MCU元器件规格
 */
export function selectMCU(requirements: DetailedRequirement[]): ComponentSpec {
  // 分析需求，确定MCU规格
  const hasWiFi = requirements.some(r => r.description.includes('WiFi'));
  const hasBLE = requirements.some(r => r.description.includes('蓝牙') || r.description.includes('BLE'));
  const hasEthernet = requirements.some(r => r.description.includes('以太网'));
  const hasCAN = requirements.some(r => r.description.includes('CAN'));
  const hasLowPower = requirements.some(r => r.description.includes('低功耗'));
  const hasHighPerf = requirements.some(r => r.category === 'performance' && r.priority === 'high');
  const hasIndustrial = requirements.some(r => r.description.includes('工业级'));
  
  // 根据需求选择MCU
  let mcuModel = 'STM32F103C8T6'; // 默认选择
  let mcuSpecs: TechnicalParameter[] = [];
  let price = 1.8;
  
  if (hasWiFi && hasBLE) {
    // WiFi+BLE需求，选择ESP32
    mcuModel = 'ESP32-WROOM-32E';
    mcuSpecs = [
      { name: '核心', value: 'Xtensa LX6 双核', isCritical: true },
      { name: '主频', value: '240', unit: 'MHz', isCritical: true },
      { name: 'Flash', value: '4', unit: 'MB', isCritical: true },
      { name: 'RAM', value: '520', unit: 'KB', isCritical: true },
      { name: 'WiFi', value: '802.11 b/g/n', isCritical: true },
      { name: 'BLE', value: 'BLE 4.2', isCritical: true },
      { name: '工作电压', value: '3.0-3.6', unit: 'V', isCritical: true },
    ];
    price = 4.2;
  } else if (hasWiFi) {
    // 仅WiFi需求
    mcuModel = 'ESP8266EX';
    mcuSpecs = [
      { name: '核心', value: 'Xtensa LX106', isCritical: true },
      { name: '主频', value: '160', unit: 'MHz', isCritical: true },
      { name: 'Flash', value: '外置', isCritical: true },
      { name: 'RAM', value: '160', unit: 'KB', isCritical: true },
      { name: 'WiFi', value: '802.11 b/g/n', isCritical: true },
    ];
    price = 2.5;
  } else if (hasBLE && hasLowPower) {
    // BLE低功耗需求
    mcuModel = 'nRF52832';
    mcuSpecs = [
      { name: '核心', value: 'ARM Cortex-M4F', isCritical: true },
      { name: '主频', value: '64', unit: 'MHz', isCritical: true },
      { name: 'Flash', value: '512', unit: 'KB', isCritical: true },
      { name: 'RAM', value: '64', unit: 'KB', isCritical: true },
      { name: 'BLE', value: 'BLE 5.0', isCritical: true },
      { name: '功耗', value: '超低功耗', isCritical: true },
    ];
    price = 3.8;
  } else if (hasEthernet || hasCAN || hasHighPerf) {
    // 高性能或工业需求
    mcuModel = 'STM32F407VET6';
    mcuSpecs = [
      { name: '核心', value: 'ARM Cortex-M4F', isCritical: true },
      { name: '主频', value: '168', unit: 'MHz', isCritical: true },
      { name: 'Flash', value: '512', unit: 'KB', isCritical: true },
      { name: 'RAM', value: '192', unit: 'KB', isCritical: true },
      { name: '以太网', value: hasEthernet ? '支持' : '无', isCritical: !!hasEthernet },
      { name: 'CAN', value: hasCAN ? '2路' : '无', isCritical: !!hasCAN },
    ];
    price = 8.5;
  } else {
    // 通用需求
    mcuSpecs = [
      { name: '核心', value: 'ARM Cortex-M3', isCritical: true },
      { name: '主频', value: '72', unit: 'MHz', isCritical: true },
      { name: 'Flash', value: '64', unit: 'KB', isCritical: true },
      { name: 'RAM', value: '20', unit: 'KB', isCritical: true },
      { name: '工作电压', value: '2.0-3.6', unit: 'V', isCritical: true },
    ];
  }
  
  return {
    id: 'mcu-001',
    model: mcuModel,
    manufacturer: mcuModel.startsWith('STM32') ? 'STMicroelectronics' : 
                  mcuModel.startsWith('ESP') ? 'Espressif' :
                  mcuModel.startsWith('nRF') ? 'Nordic Semiconductor' : 'Unknown',
    package: mcuModel.includes('WROOM') ? 'Module' : 'LQFP-48',
    price,
    currency: 'CNY',
    category: ComponentCategory.Microcontroller,
    specifications: mcuSpecs,
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 10000,
      lifecycleStatus: 'active',
    },
    description: `推荐的${mcuModel}微控制器`,
    isRecommended: true,
    qualityGrade: hasIndustrial ? 'industrial' : 'commercial',
  };
}

/**
 * 从模块选择电源器件
 */
function selectPowerComponentsFromModule(_module: ModuleDefinition): ComponentSpec[] {
  const components: ComponentSpec[] = [];
  
  // 根据模块参数确定电源需求
  
  // 添加LDO
  components.push({
    id: 'power-ldo-001',
    model: 'AMS1117-3.3',
    manufacturer: 'Advanced Monolithic Systems',
    package: 'SOT-223',
    price: 0.35,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'LDO稳压器', isCritical: true },
      { name: '输入电压', value: '4.5-15', unit: 'V', isCritical: true },
      { name: '输出电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '输出电流', value: '1', unit: 'A', isCritical: true },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 50000,
      lifecycleStatus: 'active',
    },
    description: '3.3V LDO稳压器',
    isRecommended: true,
    qualityGrade: 'commercial',
  });
  
  return components;
}

/**
 * 选择电源器件
 * @param powerRequirements 电源需求
 * @returns 电源器件列表
 */
export function selectPowerComponents(powerRequirements: PowerRequirement): ComponentSpec[] {
  const components: ComponentSpec[] = [];
  
  for (const output of powerRequirements.outputVoltages) {
    // 根据输出电压和电流选择合适的电源器件
    if (output.current <= 0.2) {
      // 小电流，使用LDO
      components.push({
        id: `power-ldo-${output.voltage}`,
        model: `XC6206P${String(output.voltage).replace('.', '')}2MR`,
        manufacturer: 'Torex Semiconductor',
        package: 'SOT-23-5',
        price: 0.25,
        currency: 'CNY',
        category: ComponentCategory.Power,
        specifications: [
          { name: '类型', value: 'LDO稳压器', isCritical: true },
          { name: '输出电压', value: output.voltage, unit: 'V', isCritical: true },
          { name: '输出电流', value: '200', unit: 'mA', isCritical: true },
          { name: '静态电流', value: '1', unit: 'uA', isCritical: false },
        ],
        supplyStatus: {
          inStock: true,
          leadTime: 5,
          quantity: 120000,
          lifecycleStatus: 'active',
        },
        description: `${output.voltage}V低功耗LDO`,
        isRecommended: powerRequirements.lowPowerRequired,
        qualityGrade: 'industrial',
      });
    } else if (output.current <= 1) {
      // 中等电流
      components.push({
        id: `power-ldo-${output.voltage}-1a`,
        model: `AMS1117-${output.voltage}`,
        manufacturer: 'Advanced Monolithic Systems',
        package: 'SOT-223',
        price: 0.35,
        currency: 'CNY',
        category: ComponentCategory.Power,
        specifications: [
          { name: '类型', value: 'LDO稳压器', isCritical: true },
          { name: '输出电压', value: output.voltage, unit: 'V', isCritical: true },
          { name: '输出电流', value: '1', unit: 'A', isCritical: true },
        ],
        supplyStatus: {
          inStock: true,
          leadTime: 3,
          quantity: 50000,
          lifecycleStatus: 'active',
        },
        description: `${output.voltage}V 1A LDO稳压器`,
        isRecommended: true,
        qualityGrade: 'commercial',
      });
    } else {
      // 大电流，使用DC-DC
      components.push({
        id: `power-dcdc-${output.voltage}`,
        model: 'MP1584EN',
        manufacturer: 'Monolithic Power Systems',
        package: 'SOIC-8',
        price: 1.8,
        currency: 'CNY',
        category: ComponentCategory.Power,
        specifications: [
          { name: '类型', value: 'DC-DC降压转换器', isCritical: true },
          { name: '输出电压', value: output.voltage, unit: 'V', isCritical: true },
          { name: '输出电流', value: '3', unit: 'A', isCritical: true },
          { name: '效率', value: '95', unit: '%', isCritical: false },
        ],
        supplyStatus: {
          inStock: true,
          leadTime: 7,
          quantity: 15000,
          lifecycleStatus: 'active',
        },
        description: `高效DC-DC转换器，${output.voltage}V输出`,
        isRecommended: true,
        qualityGrade: 'industrial',
      });
    }
  }
  
  return components;
}

/**
 * 选择通信元器件
 */
function selectCommunicationComponents(requirements: DetailedRequirement[]): ComponentSpec[] {
  const components: ComponentSpec[] = [];
  
  const hasWiFi = requirements.some(r => r.description.includes('WiFi'));
  const hasBLE = requirements.some(r => r.description.includes('蓝牙') || r.description.includes('BLE'));
  const hasEthernet = requirements.some(r => r.description.includes('以太网'));
  const hasCAN = requirements.some(r => r.description.includes('CAN'));
  const hasLoRa = requirements.some(r => r.description.includes('LoRa'));
  
  if (hasWiFi && !hasBLE) {
    components.push({
      id: 'comm-wifi-001',
      model: 'ESP-01S',
      manufacturer: 'Espressif',
      package: 'Module 18x14mm',
      price: 6.5,
      currency: 'CNY',
      category: ComponentCategory.Communication,
      specifications: [
        { name: '类型', value: 'WiFi模块', isCritical: true },
        { name: '芯片', value: 'ESP8266EX', isCritical: true },
        { name: 'WiFi标准', value: '802.11 b/g/n' },
        { name: '接口', value: 'UART', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 3,
        quantity: 25000,
        lifecycleStatus: 'active',
      },
      description: 'ESP8266 WiFi模块',
      isRecommended: true,
      qualityGrade: 'commercial',
    });
  }
  
  if (hasEthernet) {
    components.push({
      id: 'comm-eth-001',
      model: 'W5500',
      manufacturer: 'WIZnet',
      package: 'LQFP48',
      price: 8.5,
      currency: 'CNY',
      category: ComponentCategory.Communication,
      specifications: [
        { name: '类型', value: '以太网控制器', isCritical: true },
        { name: '接口', value: 'SPI', isCritical: true },
        { name: '速率', value: '10/100', unit: 'Mbps', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 3,
        quantity: 28000,
        lifecycleStatus: 'active',
      },
      description: 'W5500以太网控制器',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  }
  
  if (hasCAN) {
    components.push({
      id: 'comm-can-001',
      model: 'TJA1050',
      manufacturer: 'NXP',
      package: 'SOIC-8',
      price: 1.2,
      currency: 'CNY',
      category: ComponentCategory.Communication,
      specifications: [
        { name: '类型', value: 'CAN收发器', isCritical: true },
        { name: '速率', value: '1', unit: 'Mbps', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 3,
        quantity: 45000,
        lifecycleStatus: 'active',
      },
      description: 'CAN总线收发器',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  }
  
  if (hasLoRa) {
    components.push({
      id: 'comm-lora-001',
      model: 'SX1278',
      manufacturer: 'Semtech',
      package: 'Module',
      price: 18.0,
      currency: 'CNY',
      category: ComponentCategory.Communication,
      specifications: [
        { name: '类型', value: 'LoRa模块', isCritical: true },
        { name: '频率', value: '410-525', unit: 'MHz', isCritical: true },
        { name: '传输距离', value: '10', unit: 'km', isCritical: false },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 7,
        quantity: 8500,
        lifecycleStatus: 'active',
      },
      description: 'LoRa远距离通信模块',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  }
  
  return components;
}

/**
 * 选择传感器元器件
 */
function selectSensorComponents(requirements: DetailedRequirement[]): ComponentSpec[] {
  const components: ComponentSpec[] = [];
  
  const hasTemp = requirements.some(r => r.description.includes('温度'));
  const hasHumidity = requirements.some(r => r.description.includes('湿度'));
  const hasAccel = requirements.some(r => r.description.includes('加速度') || r.description.includes('运动'));
  const hasPressure = requirements.some(r => r.description.includes('压力') || r.description.includes('气压'));
  
  if (hasTemp && hasHumidity) {
    components.push({
      id: 'sensor-temp-humidity-001',
      model: 'SHT30-DIS',
      manufacturer: 'Sensirion',
      package: 'SMD-8',
      price: 12.0,
      currency: 'CNY',
      category: ComponentCategory.Sensor,
      specifications: [
        { name: '类型', value: '温湿度传感器', isCritical: true },
        { name: '温度精度', value: '±0.2', unit: '°C', isCritical: true },
        { name: '湿度精度', value: '±2', unit: '%RH', isCritical: true },
        { name: '接口', value: 'I2C', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 5,
        quantity: 18000,
        lifecycleStatus: 'active',
      },
      description: '高精度温湿度传感器',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  } else if (hasTemp) {
    components.push({
      id: 'sensor-temp-001',
      model: 'DS18B20',
      manufacturer: 'Maxim Integrated',
      package: 'TO-92',
      price: 2.5,
      currency: 'CNY',
      category: ComponentCategory.Sensor,
      specifications: [
        { name: '类型', value: '数字温度传感器', isCritical: true },
        { name: '测量范围', value: '-55~+125', unit: '°C', isCritical: true },
        { name: '精度', value: '±0.5', unit: '°C', isCritical: true },
        { name: '接口', value: '1-Wire', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 3,
        quantity: 45000,
        lifecycleStatus: 'active',
      },
      description: '数字温度传感器',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  }
  
  if (hasAccel) {
    components.push({
      id: 'sensor-accel-001',
      model: 'MPU6050',
      manufacturer: 'InvenSense (TDK)',
      package: 'QFN-24',
      price: 6.5,
      currency: 'CNY',
      category: ComponentCategory.Sensor,
      specifications: [
        { name: '类型', value: '6轴IMU', isCritical: true },
        { name: '加速度量程', value: '±2/4/8/16g', isCritical: true },
        { name: '陀螺仪量程', value: '±250/500/1000/2000°/s', isCritical: true },
        { name: '接口', value: 'I2C', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 5,
        quantity: 28000,
        lifecycleStatus: 'nrnd',
      },
      description: '六轴运动传感器',
      isRecommended: true,
      qualityGrade: 'commercial',
    });
  }
  
  if (hasPressure) {
    components.push({
      id: 'sensor-pressure-001',
      model: 'BMP280',
      manufacturer: 'Bosch',
      package: 'LGA-8',
      price: 5.5,
      currency: 'CNY',
      category: ComponentCategory.Sensor,
      specifications: [
        { name: '类型', value: '气压传感器', isCritical: true },
        { name: '测量范围', value: '300-1100', unit: 'hPa', isCritical: true },
        { name: '精度', value: '±1', unit: 'hPa', isCritical: false },
        { name: '接口', value: 'I2C/SPI', isCritical: true },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 5,
        quantity: 35000,
        lifecycleStatus: 'active',
      },
      description: '气压传感器',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  }
  
  return components;
}

/**
 * 选择存储元器件
 */
function selectMemoryComponents(requirements: DetailedRequirement[]): ComponentSpec[] {
  const components: ComponentSpec[] = [];
  
  const hasLargeStorage = requirements.some(r => 
    r.description.includes('大容量') || r.description.includes('数据记录')
  );
  
  if (hasLargeStorage) {
    components.push({
      id: 'memory-flash-001',
      model: 'W25Q128JVSIQ',
      manufacturer: 'Winbond',
      package: 'SOIC-8',
      price: 3.5,
      currency: 'CNY',
      category: ComponentCategory.Memory,
      specifications: [
        { name: '类型', value: 'SPI Flash', isCritical: true },
        { name: '容量', value: '128', unit: 'Mbit', isCritical: true },
        { name: '接口', value: 'SPI', isCritical: true },
        { name: '速度', value: '133', unit: 'MHz', isCritical: false },
      ],
      supplyStatus: {
        inStock: true,
        leadTime: 3,
        quantity: 65000,
        lifecycleStatus: 'active',
      },
      description: '128Mbit SPI Flash存储器',
      isRecommended: true,
      qualityGrade: 'industrial',
    });
  }
  
  return components;
}

// ============================================
// 成本计算和优化算法
// ============================================

/**
 * 计算BOM成本
 * @param components 元器件列表
 * @returns 成本分析
 */
export function calculateBOMCost(components: ComponentSpec[]): CostAnalysis {
  const costBreakdown: CostAnalysis['costBreakdown'] = [];
  const categoryMap = new Map<ComponentCategory, ComponentSpec[]>();
  
  // 按类别分组
  for (const component of components) {
    const list = categoryMap.get(component.category) || [];
    list.push(component);
    categoryMap.set(component.category, list);
  }
  
  // 计算各类别成本
  let totalBOMCost = 0;
  const categoryNames: Record<ComponentCategory, string> = {
    [ComponentCategory.Processor]: '处理器',
    [ComponentCategory.Microcontroller]: '微控制器',
    [ComponentCategory.Memory]: '存储器',
    [ComponentCategory.Analog]: '模拟器件',
    [ComponentCategory.Power]: '电源器件',
    [ComponentCategory.Communication]: '通信器件',
    [ComponentCategory.Sensor]: '传感器',
    [ComponentCategory.Actuator]: '执行器',
    [ComponentCategory.Passive]: '被动元件',
    [ComponentCategory.Connector]: '连接器',
    [ComponentCategory.Protection]: '保护器件',
    [ComponentCategory.Timing]: '时钟器件',
    [ComponentCategory.Optoelectronics]: '光电器件',
    [ComponentCategory.Electromechanical]: '机电元件',
    [ComponentCategory.Other]: '其他',
  };
  
  for (const [category, items] of categoryMap) {
    const categoryItems = items.map(item => ({
      name: item.model,
      quantity: 1,
      unitPrice: item.price,
      totalPrice: item.price,
    }));
    
    const subtotal = categoryItems.reduce((sum, item) => sum + item.totalPrice, 0);
    totalBOMCost += subtotal;
    
    costBreakdown.push({
      category: categoryNames[category] || category,
      items: categoryItems,
      subtotal,
    });
  }
  
  // 添加被动元件估算（通常占主动元件的10-20%）
  const passiveCost = totalBOMCost * 0.15;
  costBreakdown.push({
    category: '被动元件（估算）',
    items: [
      { name: '电阻、电容、电感等', quantity: 1, unitPrice: passiveCost, totalPrice: passiveCost },
    ],
    subtotal: passiveCost,
  });
  totalBOMCost += passiveCost;
  
  // 计算NRE费用
  const nreCost = {
    tooling: 0,
    testing: 5000,
    certification: 10000,
    other: 2000,
    total: 17000,
  };
  
  // 生成优化建议
  const optimizationSuggestions = generateOptimizationSuggestions(components, totalBOMCost);
  
  return {
    bomCost: Math.round(totalBOMCost * 100) / 100,
    nreCost,
    costBreakdown,
    optimizationSuggestions,
  };
}

/**
 * 生成成本优化建议
 */
function generateOptimizationSuggestions(
  components: ComponentSpec[],
  totalCost: number
): CostAnalysis['optimizationSuggestions'] {
  const suggestions: CostAnalysis['optimizationSuggestions'] = [];
  
  // 检查是否有高成本元器件
  const highCostComponents = components.filter(c => c.price > 5);
  for (const comp of highCostComponents) {
    if (comp.alternatives && comp.alternatives.length > 0) {
      const cheaperAlt = comp.alternatives.find(a => a.priceDifference < 0);
      if (cheaperAlt) {
        suggestions.push({
          area: comp.model,
          suggestion: `可考虑使用替代型号${cheaperAlt.model}，节省${Math.abs(cheaperAlt.priceDifference)}元`,
          potentialSaving: Math.abs(cheaperAlt.priceDifference),
          impact: 'medium',
        });
      }
    }
  }
  
  // 检查是否可以集成功能
  const hasWiFi = components.some(c => c.model.includes('ESP'));
  const hasSeparateMCU = components.some(c => c.category === ComponentCategory.Microcontroller && !c.model.includes('ESP'));
  if (hasWiFi && hasSeparateMCU) {
    suggestions.push({
      area: '主控方案',
      suggestion: '考虑使用ESP32等集成WiFi/BLE的MCU，可减少元器件数量',
      potentialSaving: totalCost * 0.1,
      impact: 'high',
    });
  }
  
  // 批量采购建议
  if (totalCost > 50) {
    suggestions.push({
      area: '采购策略',
      suggestion: '批量采购可获得5-15%的价格优惠',
      potentialSaving: totalCost * 0.1,
      impact: 'medium',
    });
  }
  
  return suggestions;
}

/**
 * 计算NRE成本
 * @param design 系统架构
 * @returns NRE成本
 */
export function calculateNRECost(design: SystemArchitecture): number {
  let nreCost = 0;
  
  // PCB设计费用
  const pcbLayers = estimatePCBLayers(design);
  nreCost += pcbLayers * 2000; // 每层约2000元设计费
  
  // 模具费用（如果有定制外壳需求）
  const hasCustomModule = design.modules.some(m => m.type === 'custom');
  if (hasCustomModule) {
    nreCost += 50000; // 外壳模具费用
  }
  
  // 测试设备费用
  nreCost += 5000; // 基础测试治具
  
  // 认证费用
  const hasWireless = design.modules.some(m => m.type === 'communication');
  if (hasWireless) {
    nreCost += 30000; // 无线认证费用（SRRC、CE、FCC等）
  }
  
  // 文档费用
  nreCost += 3000;
  
  return nreCost;
}

/**
 * 估算PCB层数
 */
function estimatePCBLayers(design: SystemArchitecture): number {
  const moduleCount = design.modules.length;
  const hasHighSpeed = design.interfaces.some(i => 
    i.protocol.includes('Ethernet') || i.protocol.includes('USB') || i.dataRate && i.dataRate.value > 10
  );
  
  if (hasHighSpeed || moduleCount > 6) {
    return 6;
  } else if (moduleCount > 4) {
    return 4;
  }
  return 2;
}

/**
 * 成本优化
 * @param components 元器件列表
 * @param budget 预算
 * @returns 优化后的元器件列表
 */
export function optimizeCost(components: ComponentSpec[], budget: number): ComponentSpec[] {
  const optimized: ComponentSpec[] = [...components];
  
  // 计算当前总成本
  let currentCost = optimized.reduce((sum, c) => sum + c.price, 0);
  
  // 如果在预算内，直接返回
  if (currentCost <= budget) {
    return optimized;
  }
  
  // 按价格降序排序，优先优化高成本元器件
  optimized.sort((a, b) => b.price - a.price);
  
  // 尝试替换为更便宜的替代品
  for (let i = 0; i < optimized.length && currentCost > budget; i++) {
    const component = optimized[i];
    
    if (component.alternatives && component.alternatives.length > 0) {
      // 找到最便宜的可用替代品
      const cheaperAlternatives = component.alternatives
        .filter(a => a.availability === 'available' && a.priceDifference < 0)
        .sort((a, b) => a.priceDifference - b.priceDifference);
      
      if (cheaperAlternatives.length > 0) {
        const alt = cheaperAlternatives[0];
        const newPrice = component.price + alt.priceDifference;
        const saving = component.price - newPrice;
        
        // 创建替代元器件
        optimized[i] = {
          ...component,
          model: alt.model,
          manufacturer: alt.manufacturer,
          price: newPrice,
          description: `${component.description}（成本优化：使用替代型号）`,
        };
        
        currentCost -= saving;
      }
    }
  }
  
  // 如果仍然超预算，移除非关键元器件
  if (currentCost > budget) {
    const nonCritical = optimized.filter(c => !c.isRecommended);
    for (const component of nonCritical) {
      if (currentCost <= budget) break;
      const index = optimized.indexOf(component);
      if (index > -1) {
        currentCost -= component.price;
        optimized.splice(index, 1);
      }
    }
  }
  
  return optimized;
}

// ============================================
// 风险评估算法
// ============================================

/**
 * 技术风险评估
 * @param architecture 系统架构
 * @returns 技术可行性评估
 */
export function assessTechnicalRisk(architecture: SystemArchitecture): TechnicalFeasibility {
  // 分析架构复杂度
  const moduleCount = architecture.modules.length;
  const interfaceCount = architecture.interfaces.length;
  
  // 评估技术成熟度
  let maturity: TechnologyMaturityLevel = 'production';
  const hasWireless = architecture.modules.some(m => m.type === 'communication');
  const hasCustomModule = architecture.modules.some(m => m.type === 'custom');
  
  if (hasCustomModule) {
    maturity = 'prototype';
  } else if (hasWireless) {
    maturity = 'validated';
  }
  
  // 评估复杂度
  let complexity: ComplexityLevel = 'low';
  if (moduleCount > 6 || interfaceCount > 8) {
    complexity = 'high';
  } else if (moduleCount > 4 || interfaceCount > 5) {
    complexity = 'medium';
  }
  
  // 评估EMC风险
  let emcRisk: RiskLevel = 'low';
  if (hasWireless) {
    emcRisk = 'medium';
  }
  const hasHighSpeed = architecture.interfaces.some(i => 
    i.dataRate && i.dataRate.value > 100
  );
  if (hasHighSpeed) {
    emcRisk = 'high';
  }
  
  // 评估热设计风险
  let thermalRisk: RiskLevel = 'low';
  const powerModules = architecture.modules.filter(m => m.type === 'power');
  if (powerModules.length > 0) {
    const highPower = powerModules.some(m => 
      m.parameters.some(p => p.name.includes('电流') && Number(p.value) > 1)
    );
    if (highPower) {
      thermalRisk = 'medium';
    }
  }
  
  // 评估信号完整性风险
  let signalIntegrityRisk: RiskLevel = 'low';
  if (hasHighSpeed) {
    signalIntegrityRisk = 'medium';
  }
  
  // 评估电源完整性风险
  let powerIntegrityRisk: RiskLevel = 'low';
  if (complexity === 'high') {
    powerIntegrityRisk = 'medium';
  }
  
  // 评估可制造性风险
  let manufacturabilityRisk: RiskLevel = 'low';
  if (complexity === 'high') {
    manufacturabilityRisk = 'medium';
  }
  
  // 生成技术挑战列表
  const technicalChallenges: string[] = [];
  if (emcRisk !== 'low') {
    technicalChallenges.push('EMC设计需要特别注意，建议进行预认证测试');
  }
  if (thermalRisk !== 'low') {
    thermalRisk = 'medium';
    technicalChallenges.push('热设计需要仿真验证，建议增加散热设计');
  }
  if (signalIntegrityRisk !== 'low') {
    technicalChallenges.push('高速信号需要阻抗匹配设计');
  }
  
  // 生成缓解措施
  const mitigationMeasures: string[] = [];
  if (technicalChallenges.length > 0) {
    mitigationMeasures.push('进行设计评审，邀请专家参与');
    mitigationMeasures.push('制作原型板进行验证');
    mitigationMeasures.push('预留设计余量');
  }
  
  return {
    maturity,
    complexity,
    emcRisk,
    thermalRisk,
    signalIntegrityRisk,
    powerIntegrityRisk,
    manufacturabilityRisk,
    riskAssessment: `技术风险${complexity === 'high' ? '较高' : '可控'}，建议${maturity === 'prototype' ? '先进行原型验证' : '按标准流程开发'}`,
    technicalChallenges,
    mitigationMeasures,
  };
}

/**
 * 供应链风险评估
 * @param components 元器件列表
 * @returns 风险评估
 */
export function assessSupplyChainRisk(components: ComponentSpec[]): RiskAssessment {
  // 评估供应链风险
  let supplyRisk: RiskLevel = 'low';
  const lowStockComponents = components.filter(c => 
    !c.supplyStatus.inStock || c.supplyStatus.quantity < 1000
  );
  if (lowStockComponents.length > components.length * 0.3) {
    supplyRisk = 'high';
  } else if (lowStockComponents.length > 0) {
    supplyRisk = 'medium';
  }
  
  // 评估单一来源风险
  let singleSourceRisk: RiskLevel = 'low';
  const noAlternatives = components.filter(c => 
    !c.alternatives || c.alternatives.length === 0
  );
  if (noAlternatives.length > components.length * 0.5) {
    singleSourceRisk = 'high';
  } else if (noAlternatives.length > components.length * 0.2) {
    singleSourceRisk = 'medium';
  }
  
  // 评估EOL风险
  let eolRisk: RiskLevel = 'low';
  const eolComponents = components.filter(c => 
    c.supplyStatus.lifecycleStatus === 'obsolete' || c.supplyStatus.lifecycleStatus === 'eol'
  );
  if (eolComponents.length > 0) {
    eolRisk = 'high';
  }
  const nrndComponents = components.filter(c => 
    c.supplyStatus.lifecycleStatus === 'nrnd'
  );
  if (nrndComponents.length > components.length * 0.3) {
    eolRisk = eolRisk === 'high' ? 'critical' : 'medium';
  }
  
  // 评估交期风险
  let leadTimeRisk: RiskLevel = 'low';
  const longLeadTime = components.filter(c => c.supplyStatus.leadTime > 14);
  if (longLeadTime.length > components.length * 0.3) {
    leadTimeRisk = 'high';
  } else if (longLeadTime.length > 0) {
    leadTimeRisk = 'medium';
  }
  
  // 评估质量风险
  let qualityRisk: RiskLevel = 'low';
  const commercialOnly = components.filter(c => c.qualityGrade === 'commercial');
  if (commercialOnly.length > components.length * 0.5) {
    qualityRisk = 'medium';
  }
  
  // 生成风险详情
  const riskDetails: RiskAssessment['riskDetails'] = [];
  
  if (supplyRisk !== 'low') {
    riskDetails.push({
      category: '供应风险',
      description: `${lowStockComponents.length}个元器件库存不足`,
      probability: supplyRisk === 'high' ? 'high' : 'medium',
      impact: 'high',
      mitigation: '提前备货，寻找替代供应商',
    });
  }
  
  if (singleSourceRisk !== 'low') {
    riskDetails.push({
      category: '单一来源风险',
      description: `${noAlternatives.length}个元器件无替代方案`,
      probability: 'medium',
      impact: 'high',
      mitigation: '开发替代方案，建立安全库存',
    });
  }
  
  if (eolRisk !== 'low') {
    riskDetails.push({
      category: 'EOL风险',
      description: '部分元器件即将停产或已停产',
      probability: 'high',
      impact: 'high',
      mitigation: '立即评估替代方案，考虑最后购买',
    });
  }
  
  if (leadTimeRisk !== 'low') {
    riskDetails.push({
      category: '交期风险',
      description: `${longLeadTime.length}个元器件交期超过14天`,
      probability: 'medium',
      impact: 'medium',
      mitigation: '提前下单，建立安全库存',
    });
  }
  
  // 识别高风险元器件
  const highRiskComponents = components
    .filter(c => 
      !c.supplyStatus.inStock || 
      c.supplyStatus.lifecycleStatus === 'obsolete' ||
      c.supplyStatus.leadTime > 30
    )
    .map(c => c.model);
  
  return {
    supplyRisk,
    singleSourceRisk,
    eolRisk,
    leadTimeRisk,
    qualityRisk,
    riskDetails,
    highRiskComponents,
  };
}

/**
 * 生产风险评估
 * @param design 系统架构
 * @returns 生产评估
 */
export function assessProductionRisk(design: SystemArchitecture): ProductionEvaluation {
  // 估算PCB层数
  const pcbLayers = estimatePCBLayers(design);
  
  // PCB特殊工艺要求
  const pcbSpecialRequirements: string[] = [];
  const hasHighSpeed = design.interfaces.some(i => i.dataRate && i.dataRate.value > 100);
  if (hasHighSpeed) {
    pcbSpecialRequirements.push('阻抗控制');
  }
  if (pcbLayers >= 6) {
    pcbSpecialRequirements.push('盲埋孔');
  }
  
  // SMT要求
  const smtRequirements: ProductionEvaluation['smtRequirements'] = {
    minComponentSize: '0402',
    finePitch: hasHighSpeed,
    bgaRequired: design.modules.some(m => m.type === 'processor'),
    doubleSided: design.modules.length > 5,
    specialProcesses: [],
  };
  
  if (smtRequirements.bgaRequired) {
    smtRequirements.specialProcesses?.push('BGA焊接');
  }
  
  // 特殊工艺
  const specialProcesses: ProductionEvaluation['specialProcesses'] = [];
  const hasWireless = design.modules.some(m => m.type === 'communication');
  if (hasWireless) {
    specialProcesses.push({
      name: '天线调试',
      description: '无线模块天线匹配调试',
      cost: 500,
    });
  }
  
  // 测试计划
  const testPlan: ProductionEvaluation['testPlan'] = [
    {
      type: 'AOI',
      description: '自动光学检测，检查焊接质量',
      coverage: 95,
    },
    {
      type: 'ICT',
      description: '在线测试，检测电路连接',
      coverage: 80,
    },
    {
      type: 'FCT',
      description: '功能测试，验证产品功能',
      coverage: 100,
    },
  ];
  
  if (smtRequirements.bgaRequired) {
    testPlan.push({
      type: 'X-Ray',
      description: 'X-Ray检测BGA焊接质量',
      coverage: 100,
    });
  }
  
  // DFM建议
  const dfmSuggestions: string[] = [];
  if (pcbLayers >= 6) {
    dfmSuggestions.push('建议使用多层板设计规则检查工具');
  }
  if (smtRequirements.bgaRequired) {
    dfmSuggestions.push('BGA周围预留测试点');
  }
  dfmSuggestions.push('关键信号预留测试点');
  dfmSuggestions.push('电源部分预留电流测试点');
  
  // 组装难度
  let assemblyComplexity: ComplexityLevel = 'low';
  if (smtRequirements.bgaRequired || smtRequirements.doubleSided) {
    assemblyComplexity = 'medium';
  }
  if (pcbLayers >= 6 || (smtRequirements.bgaRequired && smtRequirements.doubleSided)) {
    assemblyComplexity = 'high';
  }
  
  return {
    pcbLayers,
    pcbSpecialRequirements,
    smtRequirements,
    specialProcesses,
    testPlan,
    dfmSuggestions,
    assemblyComplexity,
  };
}

// ============================================
// 导出服务
// ============================================

export const SolutionAnalyzerService = {
  // 需求分析
  analyzeRequirements,
  prioritizeRequirements,
  detectConflicts,
  
  // 系统架构生成
  generateSystemArchitecture,
  defineModules,
  defineInterfaces,
  
  // 元器件选型
  matchComponents,
  selectMCU,
  selectPowerComponents,
  
  // 成本计算
  calculateBOMCost,
  calculateNRECost,
  optimizeCost,
  
  // 风险评估
  assessTechnicalRisk,
  assessSupplyChainRisk,
  assessProductionRisk,
};

export default SolutionAnalyzerService;
