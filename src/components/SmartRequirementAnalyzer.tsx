import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  Wifi,
  Zap,
  Thermometer,
  Lightbulb,
  Database,
  ArrowRight,
  AlertTriangle,
  Edit3,
  Save,
  X,
  Info,
  Target,
  DollarSign,
  Factory,
  Gauge,
  Shield,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  ExtractedRequirements, 
  ProjectRequirements, 
  Processor, 
  Memory, 
  CommunicationInterface, 
  PowerSupply, 
  Peripheral,
  DetailedRequirement,
  RequirementPriority,
  PerformanceMetrics,
  EnvironmentSpec,
  CostBudget,
  ProductionScale
} from '../types';
import { findBestMCU, MCUDatabaseEntry } from '../services/mcuDatabase';
import { 
  analyzeRequirements as analyzeRequirementsAdvanced,
  detectConflicts,
  prioritizeRequirements,
  Conflict
} from '../services/solutionAnalyzer';
import deepseekAIService, { AIAnalysisResult } from '../services/deepseekAI';
import './SmartRequirementAnalyzer.css';

interface SmartRequirementAnalyzerProps {
  onComplete: (requirements: ProjectRequirements) => void;
  onBack: () => void;
}

// 需求完整性检查项
interface CompletenessItem {
  key: string;
  label: string;
  required: boolean;
  filled: boolean;
  weight: number;
}

// 增强的提取需求接口
interface EnhancedExtractedRequirements extends ExtractedRequirements {
  detailedRequirements: DetailedRequirement[];
  performanceMetrics?: PerformanceMetrics;
  environmentSpec?: EnvironmentSpec;
  costBudget?: CostBudget;
  productionScale?: ProductionScale;
}

const exampleDescriptions = [
  "我想做一个智能温控系统，可以监测温度并通过WiFi远程控制，需要低功耗设计。",
  "开发一个物联网设备，通过蓝牙连接手机，收集传感器数据并上传到云端。",
  "做一个工业控制器，需要CAN总线通信，多个模拟量输入和数字量输出。",
  "设计一个可穿戴设备，监测心率和步数，通过BLE同步数据，电池供电。",
  "制作一个家庭自动化网关，支持WiFi、Zigbee，需要稳定的网络连接和数据处理。"
];

const keywordMap = {
  productTypes: {
    '温控': '温度控制系统',
    '温度': '温度控制系统',
    '物联网': '物联网设备',
    'IoT': '物联网设备',
    '工业': '工业控制器',
    '可穿戴': '可穿戴设备',
    '穿戴': '可穿戴设备',
    '家庭自动化': '家庭自动化',
    '网关': '网关设备',
    '传感器': '传感器节点',
    '控制器': '控制器',
  },
  performance: {
    '高性能': 'high',
    '高': 'high',
    '快速': 'high',
    '实时': 'high',
    '中等': 'medium',
    '一般': 'medium',
    '低功耗': 'low',
    '低': 'low',
    '节能': 'low',
    '省电': 'low',
    '超高性能': 'ultra',
    '极限': 'ultra',
  },
  communication: {
    'WiFi': 'WiFi',
    'Wi-Fi': 'WiFi',
    '无线': 'WiFi',
    '蓝牙': 'BLE',
    'BLE': 'BLE',
    'Bluetooth': 'BLE',
    '以太网': 'Ethernet',
    '网口': 'Ethernet',
    'CAN': 'CAN',
    'CAN总线': 'CAN',
    'USB': 'USB',
    '串口': 'UART',
    'UART': 'UART',
    'SPI': 'SPI',
    'I2C': 'I2C',
    'IIC': 'I2C',
    'Zigbee': 'Zigbee',
    'LoRa': 'LoRa',
  },
  sensors: {
    '温度': '温度传感器',
    '湿度': '湿度传感器',
    '压力': '压力传感器',
    '加速度': '加速度传感器',
    '陀螺仪': '陀螺仪',
    '心率': '心率传感器',
    '光': '光传感器',
    '光照': '光传感器',
    '声音': '声音传感器',
    '气体': '气体传感器',
  },
  power: {
    '电池': '电池供电',
    '锂电池': '电池供电',
    'USB供电': 'USB供电',
    '适配器': '适配器供电',
    '5V': '5V供电',
    '12V': '12V供电',
    '24V': '24V供电',
  },
  outputs: {
    'LED': 'LED指示灯',
    '显示屏': '显示屏',
    'LCD': 'LCD屏幕',
    'OLED': 'OLED屏幕',
    '继电器': '继电器输出',
    '电机': '电机控制',
    '蜂鸣器': '蜂鸣器',
  },
  domains: {
    '工业': '工业自动化',
    '消费': '消费电子',
    '医疗': '医疗健康',
    '汽车': '汽车电子',
    '农业': '农业物联网',
    '智能': '智能家居',
    '家庭': '智能家居',
  }
};

export default function SmartRequirementAnalyzer({ onComplete, onBack }: SmartRequirementAnalyzerProps) {
  const [projectName, setProjectName] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [extractedRequirements, setExtractedRequirements] = useState<EnhancedExtractedRequirements | null>(null);
  const [showTips, setShowTips] = useState(true);
  
  // 新增状态
  const [detailedRequirements, setDetailedRequirements] = useState<DetailedRequirement[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'conflicts'>('overview');

  // AI 分析相关状态
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisPhase, setAnalysisPhase] = useState('');
  
  // 计算需求完整性
  const completenessItems: CompletenessItem[] = useMemo(() => {
    if (!extractedRequirements) return [];
    
    return [
      { 
        key: 'productType', 
        label: '产品类型', 
        required: true, 
        filled: !!extractedRequirements.productType && extractedRequirements.productType !== '通用嵌入式设备',
        weight: 15 
      },
      { 
        key: 'performanceLevel', 
        label: '性能等级', 
        required: true, 
        filled: !!extractedRequirements.performanceLevel,
        weight: 15 
      },
      { 
        key: 'communication', 
        label: '通信接口', 
        required: false, 
        filled: extractedRequirements.communicationInterfaces.length > 0,
        weight: 10 
      },
      { 
        key: 'sensors', 
        label: '传感器需求', 
        required: false, 
        filled: extractedRequirements.sensorInputs.length > 0,
        weight: 10 
      },
      { 
        key: 'power', 
        label: '供电方式', 
        required: true, 
        filled: !!extractedRequirements.powerSource,
        weight: 15 
      },
      { 
        key: 'features', 
        label: '核心功能', 
        required: false, 
        filled: extractedRequirements.requiredFeatures.length > 0,
        weight: 10 
      },
      { 
        key: 'environment', 
        label: '环境要求', 
        required: false, 
        filled: extractedRequirements.specialRequirements.length > 0,
        weight: 10 
      },
      { 
        key: 'output', 
        label: '输出设备', 
        required: false, 
        filled: extractedRequirements.outputDevices.length > 0,
        weight: 5 
      },
      { 
        key: 'detailed', 
        label: '详细需求', 
        required: false, 
        filled: detailedRequirements.length > 0,
        weight: 10 
      },
    ];
  }, [extractedRequirements, detailedRequirements]);
  
  // 计算完整性百分比
  const completenessPercentage = useMemo(() => {
    const totalWeight = completenessItems.reduce((sum, item) => sum + item.weight, 0);
    const filledWeight = completenessItems
      .filter(item => item.filled)
      .reduce((sum, item) => sum + item.weight, 0);
    return Math.round((filledWeight / totalWeight) * 100);
  }, [completenessItems]);
  
  // 获取缺失的关键信息
  const missingCriticalInfo = useMemo(() => {
    return completenessItems
      .filter(item => item.required && !item.filled)
      .map(item => item.label);
  }, [completenessItems]);

  const analyzeRequirements = (description: string): ExtractedRequirements => {
    const lowerDesc = description.toLowerCase();
    
    let productType = '通用嵌入式设备';
    for (const [keyword, type] of Object.entries(keywordMap.productTypes)) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        productType = type;
        break;
      }
    }

    let performanceLevel: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
    for (const [keyword, level] of Object.entries(keywordMap.performance)) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        performanceLevel = level as any;
        break;
      }
    }

    let applicationDomain = '通用应用';
    for (const [keyword, domain] of Object.entries(keywordMap.domains)) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        applicationDomain = domain;
        break;
      }
    }

    const communicationInterfaces: string[] = [];
    for (const [keyword, iface] of Object.entries(keywordMap.communication)) {
      if (lowerDesc.includes(keyword.toLowerCase()) && !communicationInterfaces.includes(iface)) {
        communicationInterfaces.push(iface);
      }
    }
    if (communicationInterfaces.length === 0) {
      communicationInterfaces.push('UART');
    }

    const sensorInputs: string[] = [];
    for (const [keyword, sensor] of Object.entries(keywordMap.sensors)) {
      if (lowerDesc.includes(keyword.toLowerCase()) && !sensorInputs.includes(sensor)) {
        sensorInputs.push(sensor);
      }
    }

    const outputDevices: string[] = [];
    for (const [keyword, output] of Object.entries(keywordMap.outputs)) {
      if (lowerDesc.includes(keyword.toLowerCase()) && !outputDevices.includes(output)) {
        outputDevices.push(output);
      }
    }

    let powerSource = '5V适配器供电';
    for (const [keyword, source] of Object.entries(keywordMap.power)) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        powerSource = source;
        break;
      }
    }

    const requiredFeatures: string[] = [];
    if (lowerDesc.includes('远程') || lowerDesc.includes('云端')) {
      requiredFeatures.push('远程通信');
    }
    if (lowerDesc.includes('数据') || lowerDesc.includes('记录')) {
      requiredFeatures.push('数据存储');
    }
    if (lowerDesc.includes('显示') || lowerDesc.includes('屏幕')) {
      requiredFeatures.push('用户界面');
    }
    if (lowerDesc.includes('实时') || lowerDesc.includes('响应')) {
      requiredFeatures.push('实时处理');
    }
    if (lowerDesc.includes('安全') || lowerDesc.includes('加密')) {
      requiredFeatures.push('安全加密');
    }

    const specialRequirements: string[] = [];
    if (lowerDesc.includes('防水') || lowerDesc.includes('防尘')) {
      specialRequirements.push('防护等级');
    }
    if (lowerDesc.includes('高温') || lowerDesc.includes('低温')) {
      specialRequirements.push('宽温工作');
    }
    if (lowerDesc.includes('工业') || lowerDesc.includes('抗干扰')) {
      specialRequirements.push('工业级可靠性');
    }

    return {
      productType,
      performanceLevel,
      applicationDomain,
      requiredFeatures,
      communicationInterfaces,
      powerSource,
      sensorInputs,
      outputDevices,
      specialRequirements,
    };
  };

  // 将 AI 分析结果转换为项目类型
  const convertAIAnalysisToRequirements = (aiResult: AIAnalysisResult): ExtractedRequirements => {
    const { productType, technicalRequirements, keywords } = aiResult;
    
    // 从 AI 结果中提取性能等级
    let performanceLevel: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
    if (keywords.some(k => k.includes('低功耗') || k.includes('省电'))) {
      performanceLevel = 'low';
    } else if (keywords.some(k => k.includes('高性能'))) {
      performanceLevel = 'high';
    } else if (keywords.some(k => k.includes('极致') || k.includes('极限'))) {
      performanceLevel = 'ultra';
    }

    // 提取通信接口
    const communicationInterfaces: string[] = [];
    const commInterfaces = technicalRequirements.connectivity || [];
    commInterfaces.forEach(iface => {
      const ifaceLower = iface.toLowerCase();
      if (ifaceLower.includes('wifi')) communicationInterfaces.push('WiFi');
      else if (ifaceLower.includes('bluetooth') || ifaceLower.includes('ble')) communicationInterfaces.push('BLE');
      else if (ifaceLower.includes('ethernet')) communicationInterfaces.push('Ethernet');
      else if (ifaceLower.includes('can')) communicationInterfaces.push('CAN');
      else if (ifaceLower.includes('usb')) communicationInterfaces.push('USB');
      else if (ifaceLower.includes('i2c') || ifaceLower.includes('iic')) communicationInterfaces.push('I2C');
      else if (ifaceLower.includes('spi')) communicationInterfaces.push('SPI');
      else if (ifaceLower.includes('uart')) communicationInterfaces.push('UART');
      else if (ifaceLower.includes('zigbee')) communicationInterfaces.push('Zigbee');
      else if (ifaceLower.includes('lora')) communicationInterfaces.push('LoRa');
    });
    if (communicationInterfaces.length === 0) {
      communicationInterfaces.push('UART');
    }

    // 提取传感器
    const sensorInputs: string[] = [];
    keywords.forEach(keyword => {
      if (keyword.includes('温度')) sensorInputs.push('温度传感器');
      if (keyword.includes('湿度')) sensorInputs.push('湿度传感器');
      if (keyword.includes('压力')) sensorInputs.push('压力传感器');
      if (keyword.includes('加速度')) sensorInputs.push('加速度传感器');
      if (keyword.includes('心率')) sensorInputs.push('心率传感器');
      if (keyword.includes('光')) sensorInputs.push('光传感器');
      if (keyword.includes('声音')) sensorInputs.push('声音传感器');
      if (keyword.includes('气体')) sensorInputs.push('气体传感器');
    });

    // 提取输出设备
    const outputDevices: string[] = [];
    keywords.forEach(keyword => {
      if (keyword.includes('LED')) outputDevices.push('LED指示灯');
      if (keyword.includes('显示屏') || keyword.includes('LCD') || keyword.includes('OLED')) outputDevices.push('显示屏');
      if (keyword.includes('继电器')) outputDevices.push('继电器输出');
      if (keyword.includes('电机')) outputDevices.push('电机控制');
      if (keyword.includes('蜂鸣器')) outputDevices.push('蜂鸣器');
    });

    // 提取供电方式
    let powerSource = '5V适配器供电';
    if (technicalRequirements.powerSupply?.includes('电池')) {
      powerSource = '电池供电';
    } else if (technicalRequirements.powerSupply?.includes('12V')) {
      powerSource = '12V供电';
    } else if (technicalRequirements.powerSupply?.includes('24V')) {
      powerSource = '24V供电';
    }

    // 提取应用领域
    let applicationDomain = '通用应用';
    if (keywords.some(k => k.includes('工业'))) applicationDomain = '工业自动化';
    else if (keywords.some(k => k.includes('消费'))) applicationDomain = '消费电子';
    else if (keywords.some(k => k.includes('医疗'))) applicationDomain = '医疗健康';
    else if (keywords.some(k => k.includes('汽车'))) applicationDomain = '汽车电子';
    else if (keywords.some(k => k.includes('农业'))) applicationDomain = '农业物联网';
    else if (keywords.some(k => k.includes('智能') || k.includes('家庭'))) applicationDomain = '智能家居';

    // 提取核心功能
    const requiredFeatures: string[] = [];
    if (keywords.some(k => k.includes('远程'))) requiredFeatures.push('远程通信');
    if (keywords.some(k => k.includes('数据') || k.includes('记录'))) requiredFeatures.push('数据存储');
    if (keywords.some(k => k.includes('显示') || k.includes('屏幕'))) requiredFeatures.push('用户界面');
    if (keywords.some(k => k.includes('实时') || k.includes('响应'))) requiredFeatures.push('实时处理');
    if (keywords.some(k => k.includes('安全') || k.includes('加密'))) requiredFeatures.push('安全加密');

    // 提取特殊要求
    const specialRequirements: string[] = [];
    if (keywords.some(k => k.includes('防水') || k.includes('防尘'))) specialRequirements.push('防护等级');
    if (keywords.some(k => k.includes('高温') || k.includes('低温'))) specialRequirements.push('宽温工作');
    if (keywords.some(k => k.includes('工业'))) specialRequirements.push('工业级可靠性');

    return {
      productType,
      performanceLevel,
      applicationDomain,
      requiredFeatures,
      communicationInterfaces,
      powerSource,
      sensorInputs,
      outputDevices,
      specialRequirements,
    };
  };

  const handleAnalyze = async () => {
    if (!projectName.trim() || !userDescription.trim()) {
      return;
    }

    setIsAnalyzing(true);
    setShowTips(false);
    setAiError(null);
    setAnalysisProgress(0);
    setAnalysisPhase('初始化分析');

    try {
      setAnalysisPhase('调用 AI 分析需求');
      setAnalysisProgress(20);

      // 调用 AI 进行需求分析
      let extracted: ExtractedRequirements;
      let aiResult: AIAnalysisResult | null = null;

      try {
        aiResult = await deepseekAIService.analyzeRequirements(userDescription);
        setAnalysisProgress(50);
        setAnalysisPhase('转换分析结果');
        
        // 使用 AI 分析结果
        extracted = convertAIAnalysisToRequirements(aiResult);
      } catch (aiErr) {
        setAnalysisPhase('使用备用分析方法');
        setAnalysisProgress(30);
        // AI 分析失败，使用原有关键词提取作为备用方案
        console.warn('AI 分析失败，使用备用分析方法:', aiErr);
        extracted = analyzeRequirements(userDescription);
      }

      setAnalysisProgress(70);
      setAnalysisPhase('深入分析需求细节');

      // 使用高级需求分析功能
      const advancedRequirements = analyzeRequirementsAdvanced(userDescription);
      const prioritizedReqs = prioritizeRequirements(advancedRequirements);
      const detectedConflicts = detectConflicts(prioritizedReqs);

      setAnalysisProgress(85);
      setAnalysisPhase('提取详细需求');

      // 提取性能指标
      const performanceMetrics = extractPerformanceMetrics(userDescription);

      // 提取环境规格
      const environmentSpec = extractEnvironmentSpec(userDescription);

      // 提取成本预算
      const costBudget = extractCostBudget(userDescription);

      // 提取量产规模
      const productionScale = extractProductionScale(userDescription);

      setAnalysisProgress(95);
      setAnalysisPhase('完成分析');

      // 合并结果
      const enhancedExtracted: EnhancedExtractedRequirements = {
        ...extracted,
        detailedRequirements: prioritizedReqs,
        performanceMetrics,
        environmentSpec,
        costBudget,
        productionScale,
      };

      setExtractedRequirements(enhancedExtracted);
      setDetailedRequirements(prioritizedReqs);
      setConflicts(detectedConflicts);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setAnalysisProgress(100);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : '分析过程中发生未知错误');
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setAiError(null);
    handleAnalyze();
  };
  
  // 提取性能指标
  const extractPerformanceMetrics = (description: string): PerformanceMetrics | undefined => {
    const metrics: PerformanceMetrics = {};
    const lowerDesc = description.toLowerCase();
    
    // 提取响应时间
    if (lowerDesc.includes('实时') || lowerDesc.includes('快速')) {
      metrics.responseTime = {
        value: lowerDesc.includes('毫秒') ? 10 : 100,
        unit: 'ms',
        max: lowerDesc.includes('实时') ? 50 : 500,
      };
    }
    
    // 提取功耗要求
    if (lowerDesc.includes('低功耗') || lowerDesc.includes('省电') || lowerDesc.includes('电池')) {
      metrics.powerConsumption = {
        typical: lowerDesc.includes('超低功耗') ? 5 : 20,
        max: lowerDesc.includes('超低功耗') ? 10 : 50,
        unit: 'mW',
      };
    }
    
    // 提取精度要求
    if (lowerDesc.includes('高精度') || lowerDesc.includes('精确')) {
      metrics.accuracy = {
        value: 0.1,
        unit: '%',
        description: '高精度测量',
      };
    }
    
    return Object.keys(metrics).length > 0 ? metrics : undefined;
  };
  
  // 提取环境规格
  const extractEnvironmentSpec = (description: string): EnvironmentSpec | undefined => {
    const lowerDesc = description.toLowerCase();
    let hasEnvSpec = false;
    const spec: EnvironmentSpec = {
      temperatureRange: { min: 0, max: 50, unit: 'Celsius' },
      humidity: { min: 20, max: 80, unit: '%RH' },
    };
    
    // 工业级温度
    if (lowerDesc.includes('工业级') || lowerDesc.includes('工业')) {
      spec.temperatureRange = { min: -40, max: 85, unit: 'Celsius' };
      hasEnvSpec = true;
    }
    
    // 汽车级温度
    if (lowerDesc.includes('汽车级') || lowerDesc.includes('车载')) {
      spec.temperatureRange = { min: -40, max: 125, unit: 'Celsius' };
      hasEnvSpec = true;
    }
    
    // 防护等级
    if (lowerDesc.includes('防水') || lowerDesc.includes('防尘')) {
      spec.protectionRating = lowerDesc.includes('防水') && lowerDesc.includes('防尘') ? 'IP67' : 'IP54';
      hasEnvSpec = true;
    }
    
    return hasEnvSpec ? spec : undefined;
  };
  
  // 提取成本预算
  const extractCostBudget = (description: string): CostBudget | undefined => {
    const lowerDesc = description.toLowerCase();
    
    // 检测成本相关关键词
    if (lowerDesc.includes('低成本') || lowerDesc.includes('经济') || lowerDesc.includes('预算')) {
      return {
        targetCost: lowerDesc.includes('超低成本') ? 20 : lowerDesc.includes('低成本') ? 50 : 100,
        currency: 'CNY',
        productionVolume: {
          expectedAnnualVolume: 10000,
          productLifecycle: 3,
        },
      };
    }
    
    return undefined;
  };
  
  // 提取量产规模
  const extractProductionScale = (description: string): ProductionScale | undefined => {
    const lowerDesc = description.toLowerCase();
    
    // 检测量产相关关键词
    if (lowerDesc.includes('量产') || lowerDesc.includes('批量') || lowerDesc.includes('大规模')) {
      return {
        expectedAnnualVolume: lowerDesc.includes('大规模') ? 100000 : lowerDesc.includes('批量') ? 50000 : 10000,
        productLifecycle: 5,
        batchSize: 1000,
      };
    }
    
    // 小批量或原型
    if (lowerDesc.includes('原型') || lowerDesc.includes('小批量')) {
      return {
        expectedAnnualVolume: 1000,
        productLifecycle: 2,
        batchSize: 100,
      };
    }
    
    return undefined;
  };

  const handleGenerate = () => {
    if (!extractedRequirements) return;

    const mcuCriteria = translateToMCUCriteria(extractedRequirements);
    const selectedMCU = findBestMCU(mcuCriteria);
    
    if (!selectedMCU) {
      alert('无法找到合适的MCU，请修改您的需求描述');
      return;
    }

    const projectRequirements = generateCompleteRequirements(
      projectName,
      userDescription,
      extractedRequirements,
      selectedMCU
    );

    onComplete(projectRequirements);
  };

  const translateToMCUCriteria = (extracted: ExtractedRequirements) => {
    const criteria: any = {};

    switch (extracted.performanceLevel) {
      case 'low':
        criteria.minClockSpeed = 20;
        criteria.minFlashSize = 32;
        criteria.minRamSize = 2;
        break;
      case 'medium':
        criteria.minClockSpeed = 48;
        criteria.minFlashSize = 64;
        criteria.minRamSize = 20;
        break;
      case 'high':
        criteria.minClockSpeed = 100;
        criteria.minFlashSize = 256;
        criteria.minRamSize = 64;
        break;
      case 'ultra':
        criteria.minClockSpeed = 168;
        criteria.minFlashSize = 512;
        criteria.minRamSize = 128;
        break;
    }

    criteria.requiresWiFi = extracted.communicationInterfaces.includes('WiFi');
    criteria.requiresBLE = extracted.communicationInterfaces.includes('BLE');
    criteria.requiresEthernet = extracted.communicationInterfaces.includes('Ethernet');
    criteria.requiresCAN = extracted.communicationInterfaces.includes('CAN');
    criteria.requiresUSB = extracted.communicationInterfaces.includes('USB');
    
    criteria.requiresADC = extracted.sensorInputs.length > 0;
    criteria.requiresPWM = extracted.outputDevices.some(o => o.includes('LED') || o.includes('电机') || o.includes('蜂鸣器'));

    return criteria;
  };

  const generateCompleteRequirements = (
    name: string,
    desc: string,
    extracted: ExtractedRequirements,
    mcu: MCUDatabaseEntry
  ): ProjectRequirements => {
    const processor: Processor = {
      id: mcu.id,
      name: mcu.partNumber,
      family: mcu.family,
      cores: mcu.cores,
      clockSpeed: `${mcu.clockSpeed}MHz`,
      voltage: `${mcu.voltageMin}-${mcu.voltageMax}V`,
      package: mcu.packages[0],
      price: `$${mcu.priceUSD.toFixed(2)}`,
    };

    const memory: Memory[] = [
      {
        id: 'flash',
        type: 'Flash',
        size: `${mcu.flashSize}KB`,
        voltage: `${mcu.voltageMin}-${mcu.voltageMax}V`,
        package: 'Embedded',
      },
      {
        id: 'ram',
        type: 'SRAM',
        size: `${mcu.ramSize}KB`,
        voltage: `${mcu.voltageMin}-${mcu.voltageMax}V`,
        package: 'Embedded',
      },
    ];

    if (mcu.eepromSize > 0) {
      memory.push({
        id: 'eeprom',
        type: 'EEPROM',
        size: `${mcu.eepromSize}KB`,
        voltage: `${mcu.voltageMin}-${mcu.voltageMax}V`,
        package: 'Embedded',
      });
    }

    const communications: CommunicationInterface[] = [];
    
    if (mcu.uartCount > 0) {
      communications.push({
        id: 'uart',
        name: 'UART',
        type: 'UART',
        version: mcu.uartCount > 1 ? `${mcu.uartCount}x` : '1x',
      });
    }
    
    if (mcu.spiCount > 0) {
      communications.push({
        id: 'spi',
        name: 'SPI',
        type: 'SPI',
        version: mcu.spiCount > 1 ? `${mcu.spiCount}x` : '1x',
      });
    }
    
    if (mcu.i2cCount > 0) {
      communications.push({
        id: 'i2c',
        name: 'I2C',
        type: 'I2C',
        version: mcu.i2cCount > 1 ? `${mcu.i2cCount}x` : '1x',
      });
    }
    
    if (mcu.canCount > 0) {
      communications.push({
        id: 'can',
        name: 'CAN',
        type: 'CAN',
        version: mcu.canCount > 1 ? `${mcu.canCount}x` : '1x',
      });
    }
    
    if (mcu.usbCount > 0) {
      communications.push({
        id: 'usb',
        name: 'USB',
        type: 'USB',
        version: mcu.usbCount > 1 ? `${mcu.usbCount}x` : '1x',
      });
    }
    
    if (mcu.ethernetCount > 0) {
      communications.push({
        id: 'ethernet',
        name: 'Ethernet',
        type: 'Ethernet',
        version: '10/100Mbps',
      });
    }
    
    if (mcu.ble) {
      communications.push({
        id: 'ble',
        name: 'BLE',
        type: 'BLE',
        version: '4.2/5.0',
      });
    }
    
    if (mcu.wifi) {
      communications.push({
        id: 'wifi',
        name: 'WiFi',
        type: 'WiFi',
        version: '802.11b/g/n',
      });
    }

    const power: PowerSupply = {
      id: 'main-power',
      type: extracted.powerSource.includes('电池') ? 'Battery' : 'LDO',
      inputVoltage: extracted.powerSource.includes('12V') ? '12V' : 
                     extracted.powerSource.includes('5V') ? '5V' : 
                     extracted.powerSource.includes('24V') ? '24V' : '5V',
      outputVoltage: '3.3V',
      current: '500mA',
    };

    const peripherals: Peripheral[] = [];
    
    if (mcu.adcChannels > 0) {
      peripherals.push({
        id: 'adc',
        name: 'ADC',
        type: 'Analog to Digital Converter',
        count: mcu.adcChannels,
      });
    }
    
    if (mcu.dacChannels > 0) {
      peripherals.push({
        id: 'dac',
        name: 'DAC',
        type: 'Digital to Analog Converter',
        count: mcu.dacChannels,
      });
    }
    
    if (mcu.pwmChannels > 0) {
      peripherals.push({
        id: 'pwm',
        name: 'PWM',
        type: 'Pulse Width Modulation',
        count: mcu.pwmChannels,
      });
    }
    
    if (mcu.timers > 0) {
      peripherals.push({
        id: 'timers',
        name: 'Timers',
        type: 'General Purpose Timers',
        count: mcu.timers,
      });
    }
    
    peripherals.push({
      id: 'gpio',
      name: 'GPIO',
      type: 'General Purpose I/O',
      count: mcu.ioPins,
    });

    return {
      projectName: name,
      description: desc,
      requirements: [
        {
          id: 'productType',
          category: 'basic',
          question: '产品类型',
          answer: extracted.productType,
        },
        {
          id: 'performance',
          category: 'basic',
          question: '性能等级',
          answer: extracted.performanceLevel,
        },
        {
          id: 'applicationDomain',
          category: 'basic',
          question: '应用领域',
          answer: extracted.applicationDomain,
        },
        {
          id: 'powerSource',
          category: 'power',
          question: '供电方式',
          answer: extracted.powerSource,
        },
        {
          id: 'sensors',
          category: 'peripherals',
          question: '传感器',
          answer: extracted.sensorInputs,
        },
        {
          id: 'outputs',
          category: 'peripherals',
          question: '输出设备',
          answer: extracted.outputDevices,
        },
      ],
      processor,
      memory,
      communications,
      power,
      peripherals,
    };
  };

  const handleReset = () => {
    setAnalysisComplete(false);
    setExtractedRequirements(null);
    setIsAnalyzing(false);
    setShowTips(true);
    setDetailedRequirements([]);
    setConflicts([]);
    setEditingRequirement(null);
    setActiveTab('overview');
  };
  
  // 编辑需求
  const handleEditRequirement = (reqId: string, currentValue: string) => {
    setEditingRequirement(reqId);
    setEditValue(currentValue);
  };
  
  // 保存编辑
  const handleSaveEdit = (reqId: string) => {
    setDetailedRequirements(prev => 
      prev.map(req => 
        req.id === reqId 
          ? { ...req, description: editValue, updatedAt: new Date() }
          : req
      )
    );
    setEditingRequirement(null);
    setEditValue('');
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setEditingRequirement(null);
    setEditValue('');
  };
  
  // 确认需求
  const handleConfirmRequirement = (reqId: string) => {
    setDetailedRequirements(prev => 
      prev.map(req => 
        req.id === reqId 
          ? { ...req, status: 'confirmed' as const, updatedAt: new Date() }
          : req
      )
    );
  };
  
  // 拒绝需求
  const handleRejectRequirement = (reqId: string) => {
    setDetailedRequirements(prev => 
      prev.map(req => 
        req.id === reqId 
          ? { ...req, status: 'rejected' as const, updatedAt: new Date() }
          : req
      )
    );
  };
  
  // 获取优先级颜色
  const getPriorityColor = (priority: RequirementPriority) => {
    switch (priority) {
      case 'critical': return 'tag-red';
      case 'high': return 'tag-orange';
      case 'medium': return 'tag-blue';
      case 'low': return 'tag-green';
      default: return 'tag-blue';
    }
  };
  
  // 获取优先级标签
  const getPriorityLabel = (priority: RequirementPriority) => {
    switch (priority) {
      case 'critical': return '关键';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '中';
    }
  };
  
  // 获取冲突严重程度颜色
  const getConflictSeverityColor = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'critical': return 'tag-red';
      case 'high': return 'tag-orange';
      case 'medium': return 'tag-blue';
      case 'low': return 'tag-green';
      default: return 'tag-blue';
    }
  };

  const extractProjectName = (description: string): string => {
    if (description.includes('温控') || description.includes('温度')) {
      return '智能温控系统';
    }
    if (description.includes('物联网') || description.includes('传感器') || description.includes('云端')) {
      return '物联网数据采集设备';
    }
    if (description.includes('工业') || description.includes('CAN')) {
      return '工业控制器';
    }
    if (description.includes('可穿戴') || description.includes('心率') || description.includes('步数')) {
      return '可穿戴健康监测设备';
    }
    if (description.includes('家庭自动化') || description.includes('网关') || description.includes('Zigbee')) {
      return '家庭自动化网关';
    }
    return '智能嵌入式设备';
  };

  const useExample = (example: string) => {
    setUserDescription(example);
    const suggestedName = extractProjectName(example);
    setProjectName(suggestedName);
  };

  return (
    <div className="smart-analyzer" role="main" aria-label="AI智能需求分析页面">
      <div className="analyzer-container">
        <motion.div
          className="analyzer-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            className="back-button" 
            onClick={onBack}
            aria-label="返回欢迎页面"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onBack()}
          >
            <RotateCcw size={20} aria-hidden="true" />
            <span>返回</span>
          </button>
          <div className="analyzer-title-section">
            <div className="ai-icon" aria-hidden="true">
              <Brain size={32} />
              <Sparkles size={16} className="sparkle" />
            </div>
            <div>
              <h1 className="analyzer-title">AI智能需求分析</h1>
              <p className="analyzer-subtitle">
                用自然语言描述您的产品，让AI为您设计完美的硬件方案
              </p>
            </div>
          </div>
        </motion.div>

        {!analysisComplete ? (
          <motion.div
            className="analyzer-input-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            role="form"
            aria-label="产品需求输入表单"
          >
            <div className="input-group">
              <label className="input-label" htmlFor="projectName">
                <Lightbulb size={18} aria-hidden="true" />
                <span>项目名称</span>
              </label>
              <input
                id="projectName"
                type="text"
                className="project-name-input"
                placeholder="例如：智能温控系统"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isAnalyzing}
                aria-required="true"
                aria-describedby="projectNameHelp"
                tabIndex={isAnalyzing ? -1 : 0}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="productDescription">
                <Sparkles size={18} aria-hidden="true" />
                <span>描述您的产品</span>
              </label>
              <textarea
                id="productDescription"
                className="description-input"
                placeholder="例如：我想做一个智能温控系统，可以监测温度并通过WiFi远程控制，需要低功耗设计..."
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                disabled={isAnalyzing}
                rows={6}
                aria-required="true"
                aria-describedby="descriptionHelp"
                tabIndex={isAnalyzing ? -1 : 0}
              />
            </div>

            {showTips && (
              <div 
                className="tips-section" 
                role="note" 
                aria-label="需求描述提示"
              >
                <div className="tips-header">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>提示：如何更好地描述您的需求</span>
                </div>
                <ul className="tips-list">
                  <li>• 说明产品的主要功能和用途</li>
                  <li>• 提到需要的通信方式（WiFi、蓝牙、CAN等）</li>
                  <li>• 描述需要的传感器和输出设备</li>
                  <li>• 说明性能要求（功耗、响应速度等）</li>
                  <li>• 提到特殊要求（工业级、防水等）</li>
                </ul>
              </div>
            )}

            <div className="examples-section" aria-label="示例描述">
              <p className="examples-label">或者试试这些示例：</p>
              <div className="examples-grid">
                {exampleDescriptions.map((example, index) => (
                  <button
                    key={index}
                    className="example-button"
                    onClick={() => useExample(example)}
                    disabled={isAnalyzing}
                    aria-label={`使用示例: ${example}`}
                    tabIndex={isAnalyzing ? -1 : 0}
                    onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && useExample(example)}
                    type="button"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {aiError && (
              <div className="error-alert" role="alert">
                <div className="error-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="error-content">
                  <h4>分析失败</h4>
                  <p>{aiError}</p>
                </div>
                <div className="error-actions">
                  <button
                    className="retry-button"
                    onClick={handleRetry}
                    aria-label="重试分析"
                  >
                    <RotateCcw size={16} />
                    <span>重试</span>
                  </button>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="progress-section" role="region" aria-label="分析进度">
                <div className="progress-header">
                  <Loader2 size={24} className="spin" />
                  <span className="progress-phase">{analysisPhase}</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <span className="progress-percentage">{analysisProgress}%</span>
              </div>
            )}

            <div className="analyze-button-section">
              <motion.button
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={!projectName.trim() || !userDescription.trim() || isAnalyzing}
                whileHover={{ scale: !isAnalyzing && projectName.trim() && userDescription.trim() ? 1.02 : 1 }}
                whileTap={{ scale: !isAnalyzing && projectName.trim() && userDescription.trim() ? 0.98 : 1 }}
                aria-busy={isAnalyzing}
                aria-live="polite"
                tabIndex={!projectName.trim() || !userDescription.trim() || isAnalyzing ? -1 : 0}
                onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && projectName.trim() && userDescription.trim() && handleAnalyze()}
                type="button"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    <span>AI正在分析中...</span>
                  </>
                ) : (
                  <>
                    <Brain size={20} aria-hidden="true" />
                    <span>开始智能分析</span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="analysis-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            role="region"
            aria-label="分析结果展示"
          >
            <div className="results-header">
              <div className="success-badge" role="status">
                <CheckCircle size={24} aria-hidden="true" />
                <span>分析完成！</span>
              </div>
              <h2 className="results-title">AI提取的需求概要</h2>
              <p className="results-subtitle">
                以下是根据您的描述智能提取的硬件需求
              </p>
            </div>

            {/* 需求完整性进度条 */}
            <div className="completeness-section">
              <div className="completeness-header">
                <Target size={18} aria-hidden="true" />
                <span>需求完整性</span>
                <span className="completeness-percentage">{completenessPercentage}%</span>
              </div>
              <div className="completeness-bar">
                <div 
                  className="completeness-fill" 
                  style={{ width: `${completenessPercentage}%` }}
                />
              </div>
              <div className="completeness-items">
                {completenessItems.map(item => (
                  <div 
                    key={item.key} 
                    className={`completeness-item ${item.filled ? 'filled' : ''} ${item.required ? 'required' : ''}`}
                  >
                    {item.filled ? (
                      <CheckCircle size={14} className="item-icon filled" />
                    ) : (
                      <AlertCircle size={14} className="item-icon" />
                    )}
                    <span>{item.label}</span>
                    {item.required && !item.filled && (
                      <span className="required-badge">必填</span>
                    )}
                  </div>
                ))}
              </div>
              {missingCriticalInfo.length > 0 && (
                <div className="missing-info-alert">
                  <AlertTriangle size={16} />
                  <span>建议补充：{missingCriticalInfo.join('、')}</span>
                </div>
              )}
            </div>

            {/* 标签页导航 */}
            <div className="tabs-container">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Cpu size={16} />
                <span>概览</span>
              </button>
              <button 
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <Database size={16} />
                <span>详细需求 ({detailedRequirements.length})</span>
              </button>
              <button 
                className={`tab-button ${activeTab === 'conflicts' ? 'active' : ''}`}
                onClick={() => setActiveTab('conflicts')}
              >
                <AlertTriangle size={16} />
                <span>冲突检测 {conflicts.length > 0 && `(${conflicts.length})`}</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                    {/* 基本信息卡片 */}
                    <div className="results-grid" role="list">
                      <div className="result-card" role="listitem">
                        <div className="result-icon" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' }} aria-hidden="true">
                          <Cpu size={24} />
                        </div>
                        <div className="result-content">
                          <h3>产品类型</h3>
                          <p>{extractedRequirements?.productType}</p>
                        </div>
                      </div>

                      <div className="result-card" role="listitem">
                        <div className="result-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }} aria-hidden="true">
                          <Zap size={24} />
                        </div>
                        <div className="result-content">
                          <h3>性能等级</h3>
                          <p>
                            {extractedRequirements?.performanceLevel === 'low' && '低功耗'}
                            {extractedRequirements?.performanceLevel === 'medium' && '标准性能'}
                            {extractedRequirements?.performanceLevel === 'high' && '高性能'}
                            {extractedRequirements?.performanceLevel === 'ultra' && '极致性能'}
                          </p>
                        </div>
                      </div>

                      <div className="result-card" role="listitem">
                        <div className="result-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }} aria-hidden="true">
                          <Database size={24} />
                        </div>
                        <div className="result-content">
                          <h3>应用领域</h3>
                          <p>{extractedRequirements?.applicationDomain}</p>
                        </div>
                      </div>

                      <div className="result-card" role="listitem">
                        <div className="result-icon" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #059669 100%)' }} aria-hidden="true">
                          <Zap size={24} />
                        </div>
                        <div className="result-content">
                          <h3>供电方式</h3>
                          <p>{extractedRequirements?.powerSource}</p>
                        </div>
                      </div>
                    </div>

                    {/* 详细信息 */}
                    <div className="details-section">
                      {extractedRequirements?.communicationInterfaces && extractedRequirements.communicationInterfaces.length > 0 && (
                        <div className="detail-group">
                          <h4>
                            <Wifi size={18} aria-hidden="true" />
                            通信接口
                          </h4>
                          <div className="tags-list" role="list">
                            {extractedRequirements.communicationInterfaces.map((iface, i) => (
                              <span key={i} className="tag tag-blue" role="listitem">{iface}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedRequirements?.sensorInputs && extractedRequirements.sensorInputs.length > 0 && (
                        <div className="detail-group">
                          <h4>
                            <Thermometer size={18} aria-hidden="true" />
                            传感器输入
                          </h4>
                          <div className="tags-list" role="list">
                            {extractedRequirements.sensorInputs.map((sensor, i) => (
                              <span key={i} className="tag tag-green" role="listitem">{sensor}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedRequirements?.outputDevices && extractedRequirements.outputDevices.length > 0 && (
                        <div className="detail-group">
                          <h4>
                            <Lightbulb size={18} aria-hidden="true" />
                            输出设备
                          </h4>
                          <div className="tags-list" role="list">
                            {extractedRequirements.outputDevices.map((output, i) => (
                              <span key={i} className="tag tag-orange" role="listitem">{output}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedRequirements?.requiredFeatures && extractedRequirements.requiredFeatures.length > 0 && (
                        <div className="detail-group">
                          <h4>
                            <Sparkles size={18} aria-hidden="true" />
                            核心功能
                          </h4>
                          <div className="tags-list" role="list">
                            {extractedRequirements.requiredFeatures.map((feature, i) => (
                              <span key={i} className="tag tag-purple" role="listitem">{feature}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedRequirements?.specialRequirements && extractedRequirements.specialRequirements.length > 0 && (
                        <div className="detail-group">
                          <h4>
                            <AlertCircle size={18} aria-hidden="true" />
                            特殊要求
                          </h4>
                          <div className="tags-list" role="list">
                            {extractedRequirements.specialRequirements.map((req, i) => (
                              <span key={i} className="tag tag-red" role="listitem">{req}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 性能指标 */}
                    {extractedRequirements?.performanceMetrics && (
                      <div className="metrics-section">
                        <h4>
                          <Gauge size={18} />
                          性能指标
                        </h4>
                        <div className="metrics-grid">
                          {extractedRequirements.performanceMetrics.responseTime && (
                            <div className="metric-item">
                              <Clock size={16} />
                              <div className="metric-content">
                                <span className="metric-label">响应时间</span>
                                <span className="metric-value">
                                  {extractedRequirements.performanceMetrics.responseTime.value}
                                  {extractedRequirements.performanceMetrics.responseTime.unit}
                                </span>
                              </div>
                            </div>
                          )}
                          {extractedRequirements.performanceMetrics.powerConsumption && (
                            <div className="metric-item">
                              <Zap size={16} />
                              <div className="metric-content">
                                <span className="metric-label">功耗</span>
                                <span className="metric-value">
                                  {extractedRequirements.performanceMetrics.powerConsumption.typical}
                                  {extractedRequirements.performanceMetrics.powerConsumption.unit}
                                </span>
                              </div>
                            </div>
                          )}
                          {extractedRequirements.performanceMetrics.accuracy && (
                            <div className="metric-item">
                              <Target size={16} />
                              <div className="metric-content">
                                <span className="metric-label">精度</span>
                                <span className="metric-value">
                                  {extractedRequirements.performanceMetrics.accuracy.value}
                                  {extractedRequirements.performanceMetrics.accuracy.unit}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 环境规格 */}
                    {extractedRequirements?.environmentSpec && (
                      <div className="environment-section">
                        <h4>
                          <Shield size={18} />
                          环境要求
                        </h4>
                        <div className="environment-grid">
                          <div className="env-item">
                            <span className="env-label">工作温度</span>
                            <span className="env-value">
                              {extractedRequirements.environmentSpec.temperatureRange.min}°C ~ 
                              {extractedRequirements.environmentSpec.temperatureRange.max}°C
                            </span>
                          </div>
                          {extractedRequirements.environmentSpec.protectionRating && (
                            <div className="env-item">
                              <span className="env-label">防护等级</span>
                              <span className="env-value">{extractedRequirements.environmentSpec.protectionRating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 成本预算 */}
                    {extractedRequirements?.costBudget && (
                      <div className="budget-section">
                        <h4>
                          <DollarSign size={18} />
                          成本预算
                        </h4>
                        <div className="budget-info">
                          <div className="budget-item">
                            <span className="budget-label">目标成本</span>
                            <span className="budget-value">
                              {extractedRequirements.costBudget.currency} {extractedRequirements.costBudget.targetCost}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 量产规模 */}
                    {extractedRequirements?.productionScale && (
                      <div className="production-section">
                        <h4>
                          <Factory size={18} />
                          量产规模
                        </h4>
                        <div className="production-info">
                          <div className="production-item">
                            <TrendingUp size={16} />
                            <span>年产量: {extractedRequirements.productionScale.expectedAnnualVolume.toLocaleString()} 台</span>
                          </div>
                          {extractedRequirements.productionScale.batchSize && (
                            <div className="production-item">
                              <span>批次大小: {extractedRequirements.productionScale.batchSize.toLocaleString()} 台</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="detailed-requirements-section"
                >
                  {detailedRequirements.length === 0 ? (
                    <div className="empty-state">
                      <Info size={24} />
                      <p>未提取到详细需求</p>
                    </div>
                  ) : (
                    <div className="requirements-list">
                      {detailedRequirements.map((req, index) => (
                        <motion.div
                          key={req.id}
                          className={`requirement-item ${req.status}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="requirement-header">
                            <div className="requirement-id">{req.id}</div>
                            <span className={`tag ${getPriorityColor(req.priority)}`}>
                              {getPriorityLabel(req.priority)}
                            </span>
                            <span className={`status-badge status-${req.status}`}>
                              {req.status === 'pending' && '待确认'}
                              {req.status === 'confirmed' && '已确认'}
                              {req.status === 'rejected' && '已拒绝'}
                              {req.status === 'analyzing' && '分析中'}
                            </span>
                          </div>
                          
                          {editingRequirement === req.id ? (
                            <div className="edit-section">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="edit-textarea"
                                rows={3}
                              />
                              <div className="edit-actions">
                                <button 
                                  className="save-button"
                                  onClick={() => handleSaveEdit(req.id)}
                                >
                                  <Save size={14} />
                                  保存
                                </button>
                                <button 
                                  className="cancel-button"
                                  onClick={handleCancelEdit}
                                >
                                  <X size={14} />
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="requirement-description">{req.description}</div>
                              <div className="requirement-meta">
                                <span className="category-tag">{req.category}</span>
                                {req.source && <span className="source-tag">来源: {req.source}</span>}
                              </div>
                              <div className="requirement-actions">
                                <button 
                                  className="action-button edit"
                                  onClick={() => handleEditRequirement(req.id, req.description)}
                                  title="编辑"
                                >
                                  <Edit3 size={14} />
                                </button>
                                {req.status === 'pending' && (
                                  <>
                                    <button 
                                      className="action-button confirm"
                                      onClick={() => handleConfirmRequirement(req.id)}
                                      title="确认"
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                    <button 
                                      className="action-button reject"
                                      onClick={() => handleRejectRequirement(req.id)}
                                      title="拒绝"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'conflicts' && (
                <motion.div
                  key="conflicts"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="conflicts-section"
                >
                  {conflicts.length === 0 ? (
                    <div className="empty-state success">
                      <CheckCircle size={24} />
                      <p>未检测到需求冲突</p>
                    </div>
                  ) : (
                    <div className="conflicts-list">
                      {conflicts.map((conflict, index) => (
                        <motion.div
                          key={conflict.id}
                          className={`conflict-item severity-${conflict.severity}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="conflict-header">
                            <AlertTriangle size={18} className="conflict-icon" />
                            <span className={`tag ${getConflictSeverityColor(conflict.severity)}`}>
                              {conflict.severity === 'critical' && '严重'}
                              {conflict.severity === 'high' && '高'}
                              {conflict.severity === 'medium' && '中'}
                              {conflict.severity === 'low' && '低'}
                            </span>
                            <span className="conflict-type">
                              {conflict.type === 'hard' ? '硬冲突' : '软冲突'}
                            </span>
                          </div>
                          <div className="conflict-description">{conflict.description}</div>
                          {conflict.resolution && (
                            <div className="conflict-resolution">
                              <Info size={14} />
                              <span>解决建议: {conflict.resolution}</span>
                            </div>
                          )}
                          <div className="conflict-requirements">
                            涉及需求: {conflict.requirementIds.join(', ')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="actions-section">
              <button 
                className="reset-button" 
                onClick={handleReset}
                aria-label="重新描述产品需求"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                type="button"
              >
                <RotateCcw size={18} aria-hidden="true" />
                <span>重新描述</span>
              </button>
              <motion.button
                className="generate-button"
                onClick={handleGenerate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="生成硬件原理图"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                type="button"
              >
                <Sparkles size={20} aria-hidden="true" />
                <span>生成原理图</span>
                <ArrowRight size={20} aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
