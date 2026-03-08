const DEFAULT_API_BASE = 'https://api.deepseek.com';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_API_KEY = 'sk-59d84ee8c67f4c339fbb3846b7a95c8e';

export interface AIAnalysisResult {
  productType: string;
  keywords: string[];
  technicalRequirements: {
    processingSpeed?: string;
    memoryRequirement?: string;
    connectivity?: string[];
    powerSupply?: string;
    operatingTemperature?: string;
    formFactor?: string;
    additionalFeatures?: string[];
  };
  suggestedSolutions: string[];
  confidenceScore: number;
}

export interface AITechnicalSolution {
  systemArchitecture: {
    cpu: string;
    memory: string;
    storage: string;
    powerSupply: string;
    interfaces: string[];
  };
  componentList: Array<{
    name: string;
    partNumber: string;
    specifications: string;
    quantity: number;
    supplier: string;
    estimatedCost: number;
    category: 'processor' | 'memory' | 'storage' | 'power' | 'peripheral' | 'other';
  }>;
  implementationPlan: {
    phases: Array<{
      phase: string;
      duration: string;
      deliverables: string[];
    }>;
    riskMitigation: string[];
    qualityAssurance: string[];
  };
  performanceEstimates: {
    processingPower: string;
    powerConsumption: string;
    operatingTemperature: string;
    expectedLifespan: string;
  };
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  requestId?: string;
}

const logSystem = {
  logs: [] as LogEntry[],
  maxLogs: 1000,
  
  add: (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any, requestId?: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      requestId
    };
    logSystem.logs.push(entry);
    
    if (logSystem.logs.length > logSystem.maxLogs) {
      logSystem.logs.shift();
    }
    
    const logPrefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    const idPrefix = requestId ? `[ReqID: ${requestId}] ` : '';
    
    if (level === 'error') {
      console.error(logPrefix, idPrefix + message, data || '');
    } else if (level === 'warn') {
      console.warn(logPrefix, idPrefix + message, data || '');
    } else if (level === 'debug') {
      console.debug(logPrefix, idPrefix + message, data || '');
    } else {
      console.log(logPrefix, idPrefix + message, data || '');
    }
  },
  
  getLogs: (filter?: { level?: string; since?: Date }) => {
    let filtered = [...logSystem.logs];
    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }
    if (filter?.since) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= filter.since!);
    }
    return filtered;
  },
  
  clear: () => {
    logSystem.logs = [];
  }
};

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateAIAnalysisResult(data: any): data is AIAnalysisResult {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['productType', 'keywords', 'technicalRequirements', 'suggestedSolutions', 'confidenceScore'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      logSystem.add('warn', `Missing required field in AIAnalysisResult: ${field}`);
      return false;
    }
  }
  
  if (!Array.isArray(data.keywords)) return false;
  if (!Array.isArray(data.suggestedSolutions)) return false;
  if (typeof data.confidenceScore !== 'number') return false;
  if (typeof data.technicalRequirements !== 'object') return false;
  
  return true;
}

function validateAITechnicalSolution(data: any): data is AITechnicalSolution {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['systemArchitecture', 'componentList', 'implementationPlan', 'performanceEstimates'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    logSystem.add('warn', `Missing required fields in AITechnicalSolution: ${missingFields.join(', ')}`);
  }
  
  if (!data.systemArchitecture || typeof data.systemArchitecture !== 'object') return false;
  if (!Array.isArray(data.componentList)) return false;
  if (!data.implementationPlan || typeof data.implementationPlan !== 'object') return false;
  if (!data.performanceEstimates || typeof data.performanceEstimates !== 'object') return false;
  
  if (!Array.isArray(data.implementationPlan.phases)) {
    data.implementationPlan.phases = [];
  }
  if (!Array.isArray(data.implementationPlan.riskMitigation)) {
    data.implementationPlan.riskMitigation = [];
  }
  if (!Array.isArray(data.implementationPlan.qualityAssurance)) {
    data.implementationPlan.qualityAssurance = [];
  }
  
  return true;
}

function createFallbackTechnicalSolution(analysisResult: AIAnalysisResult): AITechnicalSolution {
  return {
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
}

function extractJSONFromText(text: string): any {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      logSystem.add('warn', 'Failed to parse JSON from markdown, trying raw text');
    }
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    logSystem.add('error', 'Failed to parse JSON from response', { text: text.substring(0, 200) });
    throw new Error('Invalid JSON response from AI');
  }
}

export class DeepseekAIService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options?: {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
  }) {
    const envKey = this.getAPIKeyFromEnv();
    this.apiKey = options?.apiKey || (envKey && envKey !== 'your-api-key-here' ? envKey : DEFAULT_API_KEY);
    this.baseUrl = options?.baseUrl || DEFAULT_API_BASE;
    this.timeout = options?.timeout || DEFAULT_TIMEOUT;
    this.maxRetries = options?.maxRetries || DEFAULT_MAX_RETRIES;
    this.retryDelay = options?.retryDelay || DEFAULT_RETRY_DELAY;
    
    logSystem.add('info', 'Deepseek AI Service initialized', { 
      apiKeyConfigured: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0,
      baseUrl: this.baseUrl
    });
  }

  private getAPIKeyFromEnv(): string {
    try {
      return import.meta.env.VITE_AI_API_KEY || '';
    } catch (e) {
      logSystem.add('debug', 'import.meta.env not available, using default');
      return '';
    }
  }

  private isRetryableError(error: Error, status?: number): boolean {
    if (status) {
      return status === 429 || status >= 500;
    }
    const retryableMessages = [
      'timeout',
      'aborted',
      'network',
      'fetch failed',
      'ECONNRESET',
      'ETIMEDOUT'
    ];
    return retryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  private async callAPI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    requestId: string
  ): Promise<string> {
    logSystem.add('info', 'Calling Deepseek AI API', { 
      messageCount: messages.length,
      requestId 
    }, requestId);

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      try {
        logSystem.add('debug', `API attempt ${attempt}/${this.maxRetries}`, { attempt, requestId }, requestId);
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_AI_MODEL || 'deepseek-chat',
            messages: messages,
            temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE) || 0.7,
            max_tokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS) || 4096
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          logSystem.add('error', 'API request failed', { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText,
            attempt,
            requestId 
          }, requestId);
          
          lastError = new Error(`API request failed: ${response.status} ${response.statusText}`);
          
          if (this.isRetryableError(lastError, response.status) && attempt < this.maxRetries) {
            const waitTime = this.retryDelay * Math.pow(2, attempt - 1);
            logSystem.add('info', `Retrying in ${waitTime}ms...`, { attempt, waitTime, requestId }, requestId);
            await delay(waitTime);
            continue;
          }
          
          throw lastError;
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from API');
        }

        const content = data.choices[0].message.content;
        logSystem.add('info', 'API call successful', { 
          attempt,
          responseLength: content?.length || 0,
          requestId 
        }, requestId);
        
        return content;

      } catch (error) {
        clearTimeout(timeoutId);
        
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;
        
        logSystem.add('error', `API request error (attempt ${attempt}/${this.maxRetries})`, { 
          error: err.message,
          stack: err.stack,
          attempt,
          requestId 
        }, requestId);
        
        if (err.name === 'AbortError') {
          logSystem.add('warn', 'Request timeout', { timeout: this.timeout, requestId }, requestId);
        }
        
        if (this.isRetryableError(err) && attempt < this.maxRetries) {
          const waitTime = this.retryDelay * Math.pow(2, attempt - 1);
          logSystem.add('info', `Retrying in ${waitTime}ms...`, { attempt, waitTime, requestId }, requestId);
          await delay(waitTime);
          continue;
        }
        
        throw err;
      }
    }
    
    throw lastError || new Error('API request failed after all retries');
  }

  async analyzeRequirements(requirement: string): Promise<AIAnalysisResult> {
    const requestId = generateRequestId();
    logSystem.add('info', 'Starting requirement analysis', { requirementLength: requirement.length, requestId }, requestId);

    const systemPrompt = `你是一个专业的嵌入式硬件需求分析专家。请分析用户的需求描述，提取关键信息并以JSON格式返回结果。

要求：
1. productType: 产品类型（如"物联网设备"、"工业控制器"等）
2. keywords: 关键词数组
3. technicalRequirements: 技术要求对象
4. suggestedSolutions: 建议的解决方案数组
5. confidenceScore: 分析置信度（0-1之间的数字）

只返回JSON，不要包含其他文字说明。`;

    const userPrompt = `请分析以下需求描述：

${requirement}`;

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], requestId);

      const jsonData = extractJSONFromText(response);
      
      if (!validateAIAnalysisResult(jsonData)) {
        throw new Error('Invalid analysis result format');
      }

      logSystem.add('info', 'Requirement analysis completed', { confidenceScore: jsonData.confidenceScore, requestId }, requestId);
      return jsonData;

    } catch (error) {
      logSystem.add('error', 'Requirement analysis failed', { error, requestId }, requestId);
      throw error;
    }
  }

  async generateTechnicalSolution(analysisResult: AIAnalysisResult): Promise<AITechnicalSolution> {
    const requestId = generateRequestId();
    logSystem.add('info', 'Starting technical solution generation', { productType: analysisResult.productType, requestId }, requestId);

    const systemPrompt = `你是一个专业的嵌入式硬件设计专家。请基于需求分析结果，生成完整的技术方案，并以JSON格式返回。

要求：
1. systemArchitecture: 系统架构对象，包含 cpu, memory, storage, powerSupply, interfaces 字段
2. componentList: 元器件列表数组，每个元素包含 name, partNumber, specifications, quantity, supplier, estimatedCost, category 字段
3. implementationPlan: 实施计划对象，包含 phases 数组、riskMitigation 数组、qualityAssurance 数组
4. performanceEstimates: 性能预估对象，包含 processingPower, powerConsumption, operatingTemperature, expectedLifespan 字段

只返回JSON，不要包含其他文字说明。`;

    const userPrompt = `请基于以下需求分析结果生成技术方案：

产品类型: ${analysisResult.productType}
关键词: ${analysisResult.keywords.join(', ')}
技术要求: ${JSON.stringify(analysisResult.technicalRequirements, null, 2)}
建议方案: ${analysisResult.suggestedSolutions.join(', ')}`;

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], requestId);

      const jsonData = extractJSONFromText(response);
      
      if (!validateAITechnicalSolution(jsonData)) {
        logSystem.add('warn', 'AI response validation failed, using fallback solution', { requestId }, requestId);
        return createFallbackTechnicalSolution(analysisResult);
      }

      logSystem.add('info', 'Technical solution generation completed', { 
        componentCount: jsonData.componentList.length,
        requestId 
      }, requestId);
      return jsonData;

    } catch (error) {
      logSystem.add('warn', 'Technical solution generation failed, using fallback solution', { error, requestId }, requestId);
      return createFallbackTechnicalSolution(analysisResult);
    }
  }

  getLogs = logSystem.getLogs;
  clearLogs = logSystem.clear;
}

const defaultService = new DeepseekAIService();

export default defaultService;
