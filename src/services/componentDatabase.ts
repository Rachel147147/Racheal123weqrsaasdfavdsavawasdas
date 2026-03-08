import {
  ComponentSpec,
  ComponentCategory,
  ComponentAlternative,
} from '../types';

// ============================================
// 元器件数据库服务
// ============================================

/**
 * 电源器件数据库
 */
const powerComponents: ComponentSpec[] = [
  // LDO稳压器 - AMS1117系列
  {
    id: 'power-ldo-001',
    model: 'AMS1117-3.3',
    manufacturer: 'Advanced Monolithic Systems',
    package: 'SOT-223',
    price: 0.35,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'LDO稳压器', isCritical: true },
      { name: '输入电压范围', value: '4.5V-15V', unit: 'V', isCritical: true },
      { name: '输出电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '输出电流', value: '1', unit: 'A', isCritical: true },
      { name: '压差', value: '1.3', unit: 'V' },
      { name: '效率', value: '典型', description: '线性稳压器效率取决于压差' },
      { name: '静态电流', value: '5', unit: 'mA' },
      { name: '纹波抑制比', value: '75', unit: 'dB' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 50000,
      jlcpcbPartNumber: 'C6186',
      lifecycleStatus: 'active',
    },
    datasheetUrl: 'https://www.advanced-monolithic.com/pdf/ds1117.pdf',
    description: '低压差线性稳压器，3.3V固定输出，最大1A输出电流',
    isRecommended: true,
    qualityGrade: 'commercial',
    alternatives: [
      {
        model: 'AMS1117-3.3',
        manufacturer: 'Diodes Inc',
        priceDifference: 0.1,
        availability: 'available',
        leadTime: 5,
        compatibilityNotes: '完全兼容，引脚一致',
      },
      {
        model: 'XC6206P332MR',
        manufacturer: 'Torex',
        priceDifference: 0.15,
        availability: 'available',
        leadTime: 7,
        compatibilityNotes: '输出电流较小(200mA)，需确认负载需求',
        performanceDifference: '输出电流: 200mA vs 1A',
      },
    ],
  },
  {
    id: 'power-ldo-002',
    model: 'AMS1117-5.0',
    manufacturer: 'Advanced Monolithic Systems',
    package: 'SOT-223',
    price: 0.35,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'LDO稳压器', isCritical: true },
      { name: '输入电压范围', value: '6.5V-15V', unit: 'V', isCritical: true },
      { name: '输出电压', value: '5.0', unit: 'V', isCritical: true },
      { name: '输出电流', value: '1', unit: 'A', isCritical: true },
      { name: '压差', value: '1.3', unit: 'V' },
      { name: '静态电流', value: '5', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 45000,
      jlcpcbPartNumber: 'C6187',
      lifecycleStatus: 'active',
    },
    description: '低压差线性稳压器，5V固定输出，最大1A输出电流',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'power-ldo-003',
    model: 'AMS1117-ADJ',
    manufacturer: 'Advanced Monolithic Systems',
    package: 'SOT-223',
    price: 0.38,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'LDO稳压器(可调)', isCritical: true },
      { name: '输入电压范围', value: '4.5V-15V', unit: 'V', isCritical: true },
      { name: '输出电压范围', value: '1.25V-13.8V', unit: 'V', isCritical: true },
      { name: '输出电流', value: '1', unit: 'A', isCritical: true },
      { name: '压差', value: '1.3', unit: 'V' },
      { name: '基准电压', value: '1.25', unit: 'V' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 38000,
      jlcpcbPartNumber: 'C6188',
      lifecycleStatus: 'active',
    },
    description: '可调输出低压差线性稳压器，需外接电阻设置输出电压',
    qualityGrade: 'commercial',
  },
  // LDO稳压器 - XC6206系列
  {
    id: 'power-ldo-004',
    model: 'XC6206P332MR',
    manufacturer: 'Torex Semiconductor',
    package: 'SOT-23-5',
    price: 0.25,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'LDO稳压器', isCritical: true },
      { name: '输入电压范围', value: '1.8V-6.0V', unit: 'V', isCritical: true },
      { name: '输出电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '输出电流', value: '200', unit: 'mA', isCritical: true },
      { name: '压差', value: '200', unit: 'mV', description: '在100mA输出时' },
      { name: '静态电流', value: '1', unit: 'uA' },
      { name: 'PSRR', value: '70', unit: 'dB' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 120000,
      jlcpcbPartNumber: 'C5446',
      lifecycleStatus: 'active',
    },
    description: '超低静态电流LDO，适合电池供电应用',
    isRecommended: true,
    qualityGrade: 'industrial',
    alternatives: [
      {
        model: 'RT9193-33PB',
        manufacturer: 'Richtek',
        priceDifference: -0.05,
        availability: 'available',
        leadTime: 3,
        compatibilityNotes: '完全兼容，引脚一致',
      },
    ],
  },
  {
    id: 'power-ldo-005',
    model: 'XC6206P182MR',
    manufacturer: 'Torex Semiconductor',
    package: 'SOT-23-5',
    price: 0.25,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'LDO稳压器', isCritical: true },
      { name: '输入电压范围', value: '2.0V-6.0V', unit: 'V', isCritical: true },
      { name: '输出电压', value: '1.8', unit: 'V', isCritical: true },
      { name: '输出电流', value: '200', unit: 'mA', isCritical: true },
      { name: '压差', value: '200', unit: 'mV' },
      { name: '静态电流', value: '1', unit: 'uA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 85000,
      jlcpcbPartNumber: 'C5445',
      lifecycleStatus: 'active',
    },
    description: '超低静态电流LDO，1.8V输出',
    qualityGrade: 'industrial',
  },
  // DC-DC转换器 - MP1584
  {
    id: 'power-dcdc-001',
    model: 'MP1584EN',
    manufacturer: 'Monolithic Power Systems',
    package: 'SOIC-8',
    price: 1.8,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'DC-DC降压转换器', isCritical: true },
      { name: '输入电压范围', value: '4.5V-28V', unit: 'V', isCritical: true },
      { name: '输出电压范围', value: '0.8V-26V', unit: 'V', isCritical: true },
      { name: '输出电流', value: '3', unit: 'A', isCritical: true },
      { name: '效率', value: '95', unit: '%', description: '典型值' },
      { name: '开关频率', value: '1.5', unit: 'MHz' },
      { name: '静态电流', value: '100', unit: 'uA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 7,
      quantity: 15000,
      jlcpcbPartNumber: 'C14124',
      lifecycleStatus: 'active',
    },
    datasheetUrl: 'https://www.monolithicpower.com/en/documentview.aspx?documenttype=datasheet&documentid=201',
    description: '高效同步降压转换器，宽输入电压范围，最大3A输出',
    isRecommended: true,
    qualityGrade: 'industrial',
    alternatives: [
      {
        model: 'LM2596S-ADJ',
        manufacturer: 'Texas Instruments',
        priceDifference: 0.5,
        availability: 'available',
        leadTime: 5,
        compatibilityNotes: '效率略低，体积较大',
        performanceDifference: '效率: 85% vs 95%',
      },
    ],
  },
  // DC-DC转换器 - LM2596
  {
    id: 'power-dcdc-002',
    model: 'LM2596S-5.0',
    manufacturer: 'Texas Instruments',
    package: 'TO-263-5',
    price: 2.5,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'DC-DC降压转换器', isCritical: true },
      { name: '输入电压范围', value: '4.5V-40V', unit: 'V', isCritical: true },
      { name: '输出电压', value: '5.0', unit: 'V', isCritical: true },
      { name: '输出电流', value: '3', unit: 'A', isCritical: true },
      { name: '效率', value: '85', unit: '%', description: '典型值' },
      { name: '开关频率', value: '150', unit: 'kHz' },
      { name: '静态电流', value: '5', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 25000,
      jlcpcbPartNumber: 'C42647',
      lifecycleStatus: 'active',
    },
    description: '经典降压转换器，5V固定输出，高可靠性',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  {
    id: 'power-dcdc-003',
    model: 'LM2596S-3.3',
    manufacturer: 'Texas Instruments',
    package: 'TO-263-5',
    price: 2.5,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'DC-DC降压转换器', isCritical: true },
      { name: '输入电压范围', value: '4.5V-40V', unit: 'V', isCritical: true },
      { name: '输出电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '输出电流', value: '3', unit: 'A', isCritical: true },
      { name: '效率', value: '85', unit: '%' },
      { name: '开关频率', value: '150', unit: 'kHz' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 22000,
      jlcpcbPartNumber: 'C42648',
      lifecycleStatus: 'active',
    },
    description: '经典降压转换器，3.3V固定输出',
    qualityGrade: 'industrial',
  },
  {
    id: 'power-dcdc-004',
    model: 'LM2596S-ADJ',
    manufacturer: 'Texas Instruments',
    package: 'TO-263-5',
    price: 2.8,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'DC-DC降压转换器(可调)', isCritical: true },
      { name: '输入电压范围', value: '4.5V-40V', unit: 'V', isCritical: true },
      { name: '输出电压范围', value: '1.23V-37V', unit: 'V', isCritical: true },
      { name: '输出电流', value: '3', unit: 'A', isCritical: true },
      { name: '效率', value: '85', unit: '%' },
      { name: '开关频率', value: '150', unit: 'kHz' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 18000,
      jlcpcbPartNumber: 'C42649',
      lifecycleStatus: 'active',
    },
    description: '可调输出降压转换器，需外接电阻设置输出电压',
    qualityGrade: 'industrial',
  },
  // DC-DC升压转换器
  {
    id: 'power-dcdc-005',
    model: 'MT3608',
    manufacturer: 'Aerosemi',
    package: 'SOT-23-6',
    price: 0.45,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: 'DC-DC升压转换器', isCritical: true },
      { name: '输入电压范围', value: '2V-24V', unit: 'V', isCritical: true },
      { name: '输出电压范围', value: '2V-28V', unit: 'V', isCritical: true },
      { name: '输出电流', value: '2', unit: 'A', description: '最大值，取决于压差' },
      { name: '效率', value: '93', unit: '%' },
      { name: '开关频率', value: '1.2', unit: 'MHz' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 85000,
      jlcpcbPartNumber: 'C83157',
      lifecycleStatus: 'active',
    },
    description: '高效升压转换器，适合电池升压应用',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  // 电源管理芯片
  {
    id: 'power-pmic-001',
    model: 'TPS65217C',
    manufacturer: 'Texas Instruments',
    package: 'VQFN-48',
    price: 12.5,
    currency: 'CNY',
    category: ComponentCategory.Power,
    specifications: [
      { name: '类型', value: '电源管理芯片(PMIC)', isCritical: true },
      { name: '输入电压范围', value: '3.5V-5.5V', unit: 'V', isCritical: true },
      { name: 'DCDC输出', value: '3路', description: '2x 2.25A + 1x 1.5A' },
      { name: 'LDO输出', value: '4路', description: '4x 400mA LDO' },
      { name: '效率', value: '95', unit: '%' },
      { name: 'I2C控制', value: '是' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 14,
      quantity: 3500,
      digikeyPartNumber: '296-26283-1-ND',
      lifecycleStatus: 'active',
    },
    description: '多路电源管理芯片，适合ARM Cortex-A系列处理器供电',
    qualityGrade: 'industrial',
  },
];

/**
 * 被动元件数据库
 */
const passiveComponents: ComponentSpec[] = [
  // 电阻 - 0402封装常用阻值
  {
    id: 'passive-res-001',
    model: 'RC0402FR-07100KL',
    manufacturer: 'Yageo',
    package: '0402',
    price: 0.002,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片电阻', isCritical: true },
      { name: '阻值', value: '100', unit: 'kΩ', isCritical: true },
      { name: '精度', value: '1', unit: '%' },
      { name: '功率', value: '1/16', unit: 'W' },
      { name: '温度系数', value: '±100', unit: 'ppm/°C' },
      { name: '工作电压', value: '50', unit: 'V' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 500000,
      jlcpcbPartNumber: 'C25741',
      lifecycleStatus: 'active',
    },
    description: '100kΩ贴片电阻，0402封装，1%精度',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-res-002',
    model: 'RC0402FR-0710KL',
    manufacturer: 'Yageo',
    package: '0402',
    price: 0.002,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片电阻', isCritical: true },
      { name: '阻值', value: '10', unit: 'kΩ', isCritical: true },
      { name: '精度', value: '1', unit: '%' },
      { name: '功率', value: '1/16', unit: 'W' },
      { name: '温度系数', value: '±100', unit: 'ppm/°C' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 650000,
      jlcpcbPartNumber: 'C25744',
      lifecycleStatus: 'active',
    },
    description: '10kΩ贴片电阻，0402封装，1%精度',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-res-003',
    model: 'RC0402FR-074K7L',
    manufacturer: 'Yageo',
    package: '0402',
    price: 0.002,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片电阻', isCritical: true },
      { name: '阻值', value: '4.7', unit: 'kΩ', isCritical: true },
      { name: '精度', value: '1', unit: '%' },
      { name: '功率', value: '1/16', unit: 'W' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 420000,
      jlcpcbPartNumber: 'C25900',
      lifecycleStatus: 'active',
    },
    description: '4.7kΩ贴片电阻，0402封装',
    qualityGrade: 'commercial',
  },
  // 电阻 - 0603封装
  {
    id: 'passive-res-004',
    model: 'RC0603FR-0710KL',
    manufacturer: 'Yageo',
    package: '0603',
    price: 0.003,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片电阻', isCritical: true },
      { name: '阻值', value: '10', unit: 'kΩ', isCritical: true },
      { name: '精度', value: '1', unit: '%' },
      { name: '功率', value: '1/10', unit: 'W' },
      { name: '温度系数', value: '±100', unit: 'ppm/°C' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 580000,
      jlcpcbPartNumber: 'C25804',
      lifecycleStatus: 'active',
    },
    description: '10kΩ贴片电阻，0603封装，1%精度',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-res-005',
    model: 'RC0603FR-071KL',
    manufacturer: 'Yageo',
    package: '0603',
    price: 0.003,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片电阻', isCritical: true },
      { name: '阻值', value: '1', unit: 'kΩ', isCritical: true },
      { name: '精度', value: '1', unit: '%' },
      { name: '功率', value: '1/10', unit: 'W' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 620000,
      jlcpcbPartNumber: 'C21190',
      lifecycleStatus: 'active',
    },
    description: '1kΩ贴片电阻，0603封装',
    qualityGrade: 'commercial',
  },
  // 电阻 - 0805封装
  {
    id: 'passive-res-006',
    model: 'RC0805FR-07100KL',
    manufacturer: 'Yageo',
    package: '0805',
    price: 0.005,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片电阻', isCritical: true },
      { name: '阻值', value: '100', unit: 'kΩ', isCritical: true },
      { name: '精度', value: '1', unit: '%' },
      { name: '功率', value: '1/8', unit: 'W' },
      { name: '温度系数', value: '±100', unit: 'ppm/°C' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 380000,
      jlcpcbPartNumber: 'C17414',
      lifecycleStatus: 'active',
    },
    description: '100kΩ贴片电阻，0805封装',
    qualityGrade: 'commercial',
  },
  // 陶瓷电容 - 0402封装
  {
    id: 'passive-cap-001',
    model: 'CL05A104KA5NNNC',
    manufacturer: 'Samsung',
    package: '0402',
    price: 0.003,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片陶瓷电容', isCritical: true },
      { name: '容值', value: '100', unit: 'nF', isCritical: true },
      { name: '精度', value: '±10', unit: '%' },
      { name: '耐压', value: '25', unit: 'V', isCritical: true },
      { name: '介质', value: 'X5R' },
      { name: '温度范围', value: '-55°C~+85°C' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 850000,
      jlcpcbPartNumber: 'C1525',
      lifecycleStatus: 'active',
    },
    description: '100nF贴片电容，0402封装，25V X5R',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-cap-002',
    model: 'CL05B104KB5NNNC',
    manufacturer: 'Samsung',
    package: '0402',
    price: 0.003,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片陶瓷电容', isCritical: true },
      { name: '容值', value: '100', unit: 'nF', isCritical: true },
      { name: '精度', value: '±10', unit: '%' },
      { name: '耐压', value: '50', unit: 'V', isCritical: true },
      { name: '介质', value: 'X7R' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 720000,
      jlcpcbPartNumber: 'C307431',
      lifecycleStatus: 'active',
    },
    description: '100nF贴片电容，0402封装，50V X7R',
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-cap-003',
    model: 'CL05A106MQ5NUNC',
    manufacturer: 'Samsung',
    package: '0402',
    price: 0.008,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片陶瓷电容', isCritical: true },
      { name: '容值', value: '10', unit: 'uF', isCritical: true },
      { name: '精度', value: '±20', unit: '%' },
      { name: '耐压', value: '6.3', unit: 'V', isCritical: true },
      { name: '介质', value: 'X5R' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 450000,
      jlcpcbPartNumber: 'C15525',
      lifecycleStatus: 'active',
    },
    description: '10uF贴片电容，0402封装，6.3V X5R',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  // 陶瓷电容 - 0603封装
  {
    id: 'passive-cap-004',
    model: 'CL10A105KB8NNNC',
    manufacturer: 'Samsung',
    package: '0603',
    price: 0.005,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片陶瓷电容', isCritical: true },
      { name: '容值', value: '1', unit: 'uF', isCritical: true },
      { name: '精度', value: '±10', unit: '%' },
      { name: '耐压', value: '50', unit: 'V', isCritical: true },
      { name: '介质', value: 'X5R' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 680000,
      jlcpcbPartNumber: 'C15849',
      lifecycleStatus: 'active',
    },
    description: '1uF贴片电容，0603封装，50V X5R',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-cap-005',
    model: 'CL10A106MQ8NNNC',
    manufacturer: 'Samsung',
    package: '0603',
    price: 0.012,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '贴片陶瓷电容', isCritical: true },
      { name: '容值', value: '10', unit: 'uF', isCritical: true },
      { name: '精度', value: '±20', unit: '%' },
      { name: '耐压', value: '6.3', unit: 'V', isCritical: true },
      { name: '介质', value: 'X5R' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 520000,
      jlcpcbPartNumber: 'C19702',
      lifecycleStatus: 'active',
    },
    description: '10uF贴片电容，0603封装，6.3V X5R',
    qualityGrade: 'commercial',
  },
  // 电解电容
  {
    id: 'passive-cap-006',
    model: 'EEE-FK1V101P',
    manufacturer: 'Panasonic',
    package: 'Radial 5x5.4mm',
    price: 0.15,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '铝电解电容', isCritical: true },
      { name: '容值', value: '100', unit: 'uF', isCritical: true },
      { name: '精度', value: '±20', unit: '%' },
      { name: '耐压', value: '35', unit: 'V', isCritical: true },
      { name: '纹波电流', value: '210', unit: 'mA' },
      { name: '寿命', value: '5000', unit: 'h', description: '105°C' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 85000,
      jlcpcbPartNumber: 'C282522',
      lifecycleStatus: 'active',
    },
    description: '100uF铝电解电容，35V，低ESR',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  {
    id: 'passive-cap-007',
    model: 'EEE-FK1C470P',
    manufacturer: 'Panasonic',
    package: 'Radial 6.3x7.7mm',
    price: 0.25,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '铝电解电容', isCritical: true },
      { name: '容值', value: '47', unit: 'uF', isCritical: true },
      { name: '精度', value: '±20', unit: '%' },
      { name: '耐压', value: '16', unit: 'V', isCritical: true },
      { name: '纹波电流', value: '180', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 65000,
      jlcpcbPartNumber: 'C282519',
      lifecycleStatus: 'active',
    },
    description: '47uF铝电解电容，16V',
    qualityGrade: 'industrial',
  },
  // 电感 - 功率电感
  {
    id: 'passive-ind-001',
    model: 'LQH32CN100K23',
    manufacturer: 'Murata',
    package: '1210',
    price: 0.35,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '功率电感', isCritical: true },
      { name: '感值', value: '10', unit: 'uH', isCritical: true },
      { name: '精度', value: '±10', unit: '%' },
      { name: '额定电流', value: '600', unit: 'mA', isCritical: true },
      { name: '直流电阻', value: '0.18', unit: 'Ω' },
      { name: '饱和电流', value: '700', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 45000,
      jlcpcbPartNumber: 'C86680',
      lifecycleStatus: 'active',
    },
    description: '10uH功率电感，1210封装，屏蔽型',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-ind-002',
    model: 'LQH32CN2R2K23',
    manufacturer: 'Murata',
    package: '1210',
    price: 0.35,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '功率电感', isCritical: true },
      { name: '感值', value: '2.2', unit: 'uH', isCritical: true },
      { name: '精度', value: '±10', unit: '%' },
      { name: '额定电流', value: '1200', unit: 'mA', isCritical: true },
      { name: '直流电阻', value: '0.06', unit: 'Ω' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 52000,
      jlcpcbPartNumber: 'C86676',
      lifecycleStatus: 'active',
    },
    description: '2.2uH功率电感，1210封装',
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-ind-003',
    model: 'SRN8040-100M',
    manufacturer: 'Bourns',
    package: '8x8x4mm',
    price: 0.45,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '功率电感', isCritical: true },
      { name: '感值', value: '10', unit: 'uH', isCritical: true },
      { name: '精度', value: '±20', unit: '%' },
      { name: '额定电流', value: '1500', unit: 'mA', isCritical: true },
      { name: '直流电阻', value: '0.08', unit: 'Ω' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 7,
      quantity: 28000,
      jlcpcbPartNumber: 'C169229',
      lifecycleStatus: 'active',
    },
    description: '10uH大电流功率电感，8x8mm封装',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  // 电感 - 滤波电感
  {
    id: 'passive-ind-004',
    model: 'BLM18PG471SN1D',
    manufacturer: 'Murata',
    package: '0603',
    price: 0.02,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '铁氧体磁珠', isCritical: true },
      { name: '阻抗@100MHz', value: '470', unit: 'Ω', isCritical: true },
      { name: '额定电流', value: '500', unit: 'mA' },
      { name: '直流电阻', value: '0.3', unit: 'Ω', description: '最大值' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 350000,
      jlcpcbPartNumber: 'C1015',
      lifecycleStatus: 'active',
    },
    description: '470Ω磁珠，0603封装，用于EMI滤波',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'passive-ind-005',
    model: 'BLM18PG121SN1D',
    manufacturer: 'Murata',
    package: '0603',
    price: 0.02,
    currency: 'CNY',
    category: ComponentCategory.Passive,
    specifications: [
      { name: '类型', value: '铁氧体磁珠', isCritical: true },
      { name: '阻抗@100MHz', value: '120', unit: 'Ω', isCritical: true },
      { name: '额定电流', value: '800', unit: 'mA' },
      { name: '直流电阻', value: '0.15', unit: 'Ω' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 420000,
      jlcpcbPartNumber: 'C1017',
      lifecycleStatus: 'active',
    },
    description: '120Ω磁珠，0603封装',
    qualityGrade: 'commercial',
  },
];

/**
 * 通信模块数据库
 */
const communicationComponents: ComponentSpec[] = [
  // WiFi模块
  {
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
      { name: '速率', value: '最高72.2Mbps', description: '物理层' },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '70', unit: 'mA', description: '平均' },
      { name: '待机电流', value: '0.9', unit: 'mA' },
      { name: '天线', value: 'PCB天线' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 25000,
      jlcpcbPartNumber: 'C503597',
      lifecycleStatus: 'active',
    },
    description: 'ESP8266 WiFi模块，最小封装，适合物联网应用',
    isRecommended: true,
    qualityGrade: 'commercial',
    alternatives: [
      {
        model: 'ESP-12F',
        manufacturer: 'Espressif',
        priceDifference: 1.5,
        availability: 'available',
        leadTime: 3,
        compatibilityNotes: '引脚更多，功能更全',
        performanceDifference: '更多GPIO可用',
      },
    ],
  },
  {
    id: 'comm-wifi-002',
    model: 'ESP-12F',
    manufacturer: 'Espressif',
    package: 'Module 24x16mm',
    price: 8.0,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: 'WiFi模块', isCritical: true },
      { name: '芯片', value: 'ESP8266EX', isCritical: true },
      { name: 'WiFi标准', value: '802.11 b/g/n' },
      { name: '接口', value: 'UART/SPI', isCritical: true },
      { name: 'Flash', value: '4', unit: 'MB' },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '80', unit: 'mA' },
      { name: 'GPIO', value: '16', description: '可用GPIO数量' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 35000,
      jlcpcbPartNumber: 'C82800',
      lifecycleStatus: 'active',
    },
    description: 'ESP8266 WiFi模块，标准封装，更多GPIO',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'comm-wifi-003',
    model: 'ESP32-WROOM-32E',
    manufacturer: 'Espressif',
    package: 'Module 18x25mm',
    price: 18.5,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: 'WiFi+BLE模块', isCritical: true },
      { name: '芯片', value: 'ESP32-D0WDQ6', isCritical: true },
      { name: 'WiFi标准', value: '802.11 b/g/n' },
      { name: '蓝牙', value: 'BLE 4.2' },
      { name: 'CPU', value: '双核240MHz' },
      { name: 'Flash', value: '4', unit: 'MB' },
      { name: '接口', value: 'UART/SPI/I2C', isCritical: true },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '100', unit: 'mA', description: '平均' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 18000,
      jlcpcbPartNumber: 'C292713',
      lifecycleStatus: 'active',
    },
    description: 'ESP32 WiFi+BLE模块，双核处理器，高性能',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'comm-wifi-004',
    model: 'ESP32-C3-WROOM-02',
    manufacturer: 'Espressif',
    package: 'Module 18x20mm',
    price: 12.0,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: 'WiFi+BLE模块', isCritical: true },
      { name: '芯片', value: 'ESP32-C3', isCritical: true },
      { name: 'WiFi标准', value: '802.11 b/g/n' },
      { name: '蓝牙', value: 'BLE 5.0' },
      { name: 'CPU', value: 'RISC-V 160MHz' },
      { name: 'Flash', value: '4', unit: 'MB' },
      { name: '接口', value: 'UART/SPI/I2C', isCritical: true },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '80', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 22000,
      jlcpcbPartNumber: 'C2931268',
      lifecycleStatus: 'active',
    },
    description: 'ESP32-C3 WiFi+BLE模块，RISC-V核心，低成本',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  // BLE模块
  {
    id: 'comm-ble-001',
    model: 'nRF52832',
    manufacturer: 'Nordic Semiconductor',
    package: 'QFN48',
    price: 15.0,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: 'BLE芯片', isCritical: true },
      { name: '蓝牙版本', value: 'BLE 5.0', isCritical: true },
      { name: 'CPU', value: 'ARM Cortex-M4F 64MHz' },
      { name: 'Flash', value: '512', unit: 'KB' },
      { name: 'RAM', value: '64', unit: 'KB' },
      { name: '接口', value: 'UART/SPI/I2C', isCritical: true },
      { name: '工作电压', value: '1.7V-3.6', unit: 'V', isCritical: true },
      { name: '发射功率', value: '+4', unit: 'dBm' },
      { name: '接收灵敏度', value: '-96', unit: 'dBm' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 7,
      quantity: 8500,
      digikeyPartNumber: '1450-NRF52832-QFAA-R-ND',
      lifecycleStatus: 'active',
    },
    description: 'nRF52832 BLE芯片，高性能低功耗',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  {
    id: 'comm-ble-002',
    model: 'nRF52840',
    manufacturer: 'Nordic Semiconductor',
    package: 'QFN73',
    price: 28.0,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: 'BLE芯片', isCritical: true },
      { name: '蓝牙版本', value: 'BLE 5.0', isCritical: true },
      { name: 'CPU', value: 'ARM Cortex-M4F 64MHz' },
      { name: 'Flash', value: '1', unit: 'MB' },
      { name: 'RAM', value: '256', unit: 'KB' },
      { name: 'USB', value: 'USB 2.0' },
      { name: '接口', value: 'UART/SPI/I2C/USB', isCritical: true },
      { name: '工作电压', value: '1.7V-5.5', unit: 'V', isCritical: true },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 10,
      quantity: 4500,
      digikeyPartNumber: '1450-NRF52840-QIAA-R-ND',
      lifecycleStatus: 'active',
    },
    description: 'nRF52840 BLE芯片，支持USB，大容量Flash/RAM',
    qualityGrade: 'industrial',
  },
  {
    id: 'comm-ble-003',
    model: 'CC2541',
    manufacturer: 'Texas Instruments',
    package: 'QFN40',
    price: 12.0,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: 'BLE芯片', isCritical: true },
      { name: '蓝牙版本', value: 'BLE 4.0', isCritical: true },
      { name: 'CPU', value: '8051' },
      { name: 'Flash', value: '256', unit: 'KB' },
      { name: 'RAM', value: '8', unit: 'KB' },
      { name: '接口', value: 'UART/SPI/I2C', isCritical: true },
      { name: '工作电压', value: '2.0V-3.6', unit: 'V', isCritical: true },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 12000,
      jlcpcbPartNumber: 'C73830',
      lifecycleStatus: 'nrnd',
    },
    description: 'CC2541 BLE芯片，经典方案，成熟稳定',
    qualityGrade: 'industrial',
  },
  // Ethernet模块
  {
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
      { name: 'TCP/IP', value: '硬件协议栈', description: '8个独立Socket' },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '150', unit: 'mA' },
      { name: 'SPI时钟', value: '最高80MHz' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 28000,
      jlcpcbPartNumber: 'C32883',
      lifecycleStatus: 'active',
    },
    description: 'W5500以太网控制器，硬件TCP/IP协议栈，SPI接口',
    isRecommended: true,
    qualityGrade: 'industrial',
    alternatives: [
      {
        model: 'ENC28J60',
        manufacturer: 'Microchip',
        priceDifference: -2.0,
        availability: 'available',
        leadTime: 3,
        compatibilityNotes: '无硬件协议栈，需要MCU实现TCP/IP',
        performanceDifference: '需要更多MCU资源',
      },
    ],
  },
  {
    id: 'comm-eth-002',
    model: 'ENC28J60',
    manufacturer: 'Microchip',
    package: 'SSOP-28',
    price: 6.5,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: '以太网控制器', isCritical: true },
      { name: '接口', value: 'SPI', isCritical: true },
      { name: '速率', value: '10', unit: 'Mbps', isCritical: true },
      { name: '缓冲区', value: '8', unit: 'KB' },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '180', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 35000,
      jlcpcbPartNumber: 'C35515',
      lifecycleStatus: 'active',
    },
    description: 'ENC28J60以太网控制器，低成本，需要软件TCP/IP协议栈',
    qualityGrade: 'industrial',
  },
  {
    id: 'comm-eth-003',
    model: 'LAN8720A',
    manufacturer: 'Microchip',
    package: 'QFN-24',
    price: 5.5,
    currency: 'CNY',
    category: ComponentCategory.Communication,
    specifications: [
      { name: '类型', value: '以太网PHY', isCritical: true },
      { name: '接口', value: 'RMII', isCritical: true },
      { name: '速率', value: '10/100', unit: 'Mbps', isCritical: true },
      { name: '工作电压', value: '3.3', unit: 'V', isCritical: true },
      { name: '工作电流', value: '45', unit: 'mA' },
      { name: '功耗模式', value: '支持低功耗模式' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 42000,
      jlcpcbPartNumber: 'C45209',
      lifecycleStatus: 'active',
    },
    description: 'LAN8720A以太网PHY芯片，RMII接口，配合MAC使用',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  // LoRa模块
  {
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
      { name: '接口', value: 'SPI', isCritical: true },
      { name: '传输距离', value: '10', unit: 'km', description: '理想条件' },
      { name: '发射功率', value: '最大+20', unit: 'dBm' },
      { name: '接收灵敏度', value: '-148', unit: 'dBm' },
      { name: '工作电压', value: '1.8V-3.7', unit: 'V', isCritical: true },
      { name: '工作电流', value: '120', unit: 'mA', description: '发射时' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 7,
      quantity: 8500,
      jlcpcbPartNumber: 'C493966',
      lifecycleStatus: 'active',
    },
    description: 'SX1278 LoRa模块，远距离低功耗无线通信',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
];

/**
 * 传感器数据库
 */
const sensorComponents: ComponentSpec[] = [
  // 温度传感器
  {
    id: 'sensor-temp-001',
    model: 'DS18B20',
    manufacturer: 'Maxim Integrated',
    package: 'TO-92',
    price: 2.5,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '数字温度传感器', isCritical: true },
      { name: '测量范围', value: '-55°C~+125°C', isCritical: true },
      { name: '精度', value: '±0.5', unit: '°C', isCritical: true, description: '-10°C~+85°C' },
      { name: '分辨率', value: '9-12', unit: 'bit', description: '可配置' },
      { name: '接口', value: '1-Wire', isCritical: true },
      { name: '工作电压', value: '3.0V-5.5', unit: 'V', isCritical: true },
      { name: '转换时间', value: '750', unit: 'ms', description: '12位分辨率' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 45000,
      jlcpcbPartNumber: 'C2506',
      lifecycleStatus: 'active',
    },
    description: 'DS18B20数字温度传感器，1-Wire接口，高精度',
    isRecommended: true,
    qualityGrade: 'industrial',
    alternatives: [
      {
        model: 'LM35',
        manufacturer: 'Texas Instruments',
        priceDifference: -0.5,
        availability: 'available',
        leadTime: 3,
        compatibilityNotes: '模拟输出，需要ADC',
        performanceDifference: '精度: ±0.25°C vs ±0.5°C',
      },
    ],
  },
  {
    id: 'sensor-temp-002',
    model: 'LM35DZ',
    manufacturer: 'Texas Instruments',
    package: 'TO-92',
    price: 2.0,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '模拟温度传感器', isCritical: true },
      { name: '测量范围', value: '0°C~+100°C', isCritical: true },
      { name: '精度', value: '±0.25', unit: '°C', isCritical: true, description: '25°C时' },
      { name: '输出', value: '10mV/°C', isCritical: true },
      { name: '接口', value: '模拟输出', isCritical: true },
      { name: '工作电压', value: '4V-30', unit: 'V', isCritical: true },
      { name: '静态电流', value: '60', unit: 'uA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 38000,
      jlcpcbPartNumber: 'C1847',
      lifecycleStatus: 'active',
    },
    description: 'LM35模拟温度传感器，线性输出，高精度',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  {
    id: 'sensor-temp-003',
    model: 'NTC3950-10K',
    manufacturer: 'TDK',
    package: 'Radial 2mm',
    price: 0.15,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: 'NTC热敏电阻', isCritical: true },
      { name: '测量范围', value: '-40°C~+125°C', isCritical: true },
      { name: '阻值(25°C)', value: '10', unit: 'kΩ', isCritical: true },
      { name: 'B值', value: '3950', unit: 'K', isCritical: true },
      { name: '精度', value: '±1', unit: '%' },
      { name: '工作电压', value: '最大50', unit: 'V' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 1,
      quantity: 150000,
      jlcpcbPartNumber: 'C221642',
      lifecycleStatus: 'active',
    },
    description: 'NTC热敏电阻，低成本温度测量',
    qualityGrade: 'commercial',
  },
  // 湿度传感器
  {
    id: 'sensor-humidity-001',
    model: 'DHT11',
    manufacturer: 'Aosong',
    package: 'Module 15.5x12mm',
    price: 3.5,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '温湿度传感器', isCritical: true },
      { name: '温度范围', value: '0°C~+50°C', isCritical: true },
      { name: '温度精度', value: '±2', unit: '°C' },
      { name: '湿度范围', value: '20%-90%RH', isCritical: true },
      { name: '湿度精度', value: '±5', unit: '%RH' },
      { name: '接口', value: '单总线数字', isCritical: true },
      { name: '工作电压', value: '3.3V-5.5', unit: 'V', isCritical: true },
      { name: '采样周期', value: '≥1', unit: 's' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 65000,
      jlcpcbPartNumber: 'C331961',
      lifecycleStatus: 'active',
    },
    description: 'DHT11温湿度传感器，低成本，数字输出',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'sensor-humidity-002',
    model: 'DHT22',
    manufacturer: 'Aosong',
    package: 'Module 15.5x12mm',
    price: 8.0,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '温湿度传感器', isCritical: true },
      { name: '温度范围', value: '-40°C~+80°C', isCritical: true },
      { name: '温度精度', value: '±0.5', unit: '°C', isCritical: true },
      { name: '湿度范围', value: '0%-100%RH', isCritical: true },
      { name: '湿度精度', value: '±2', unit: '%RH', isCritical: true },
      { name: '接口', value: '单总线数字', isCritical: true },
      { name: '工作电压', value: '3.3V-5.5', unit: 'V', isCritical: true },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 42000,
      jlcpcbPartNumber: 'C119038',
      lifecycleStatus: 'active',
    },
    description: 'DHT22温湿度传感器，高精度，宽测量范围',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  {
    id: 'sensor-humidity-003',
    model: 'SHT30-DIS',
    manufacturer: 'Sensirion',
    package: 'SMD-8',
    price: 12.0,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '温湿度传感器', isCritical: true },
      { name: '温度范围', value: '-40°C~+125°C', isCritical: true },
      { name: '温度精度', value: '±0.2', unit: '°C', isCritical: true },
      { name: '湿度范围', value: '0%-100%RH', isCritical: true },
      { name: '湿度精度', value: '±2', unit: '%RH', isCritical: true },
      { name: '接口', value: 'I2C', isCritical: true },
      { name: '工作电压', value: '2.4V-5.5', unit: 'V', isCritical: true },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 18000,
      jlcpcbPartNumber: 'C189921',
      lifecycleStatus: 'active',
    },
    description: 'SHT30高精度温湿度传感器，I2C接口',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  // 加速度传感器
  {
    id: 'sensor-accel-001',
    model: 'MPU6050',
    manufacturer: 'InvenSense (TDK)',
    package: 'QFN-24',
    price: 6.5,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '6轴IMU', isCritical: true, description: '3轴加速度+3轴陀螺仪' },
      { name: '加速度量程', value: '±2/4/8/16g', isCritical: true },
      { name: '陀螺仪量程', value: '±250/500/1000/2000°/s', isCritical: true },
      { name: '加速度精度', value: '16', unit: 'bit' },
      { name: '陀螺仪精度', value: '16', unit: 'bit' },
      { name: '接口', value: 'I2C', isCritical: true },
      { name: '工作电压', value: '2.375V-3.46', unit: 'V', isCritical: true },
      { name: '工作电流', value: '3.8', unit: 'mA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 28000,
      jlcpcbPartNumber: 'C24112',
      lifecycleStatus: 'nrnd',
    },
    description: 'MPU6050六轴传感器，经典IMU方案',
    isRecommended: true,
    qualityGrade: 'commercial',
    alternatives: [
      {
        model: 'MPU9250',
        manufacturer: 'InvenSense',
        priceDifference: 3.0,
        availability: 'available',
        leadTime: 7,
        compatibilityNotes: '引脚兼容，增加磁力计',
        performanceDifference: '增加3轴磁力计',
      },
    ],
  },
  {
    id: 'sensor-accel-002',
    model: 'LIS3DH',
    manufacturer: 'STMicroelectronics',
    package: 'LGA-16',
    price: 3.5,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '3轴加速度传感器', isCritical: true },
      { name: '量程', value: '±2/4/8/16g', isCritical: true },
      { name: '精度', value: '12', unit: 'bit' },
      { name: '接口', value: 'I2C/SPI', isCritical: true },
      { name: '工作电压', value: '1.71V-3.6', unit: 'V', isCritical: true },
      { name: '工作电流', value: '2', unit: 'uA', description: '低功耗模式' },
      { name: '带宽', value: '5Hz-5.37kHz' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 3,
      quantity: 55000,
      jlcpcbPartNumber: 'C86618',
      lifecycleStatus: 'active',
    },
    description: 'LIS3DH三轴加速度传感器，超低功耗',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  {
    id: 'sensor-accel-003',
    model: 'ICM-42688-P',
    manufacturer: 'InvenSense (TDK)',
    package: 'LGA-14',
    price: 18.0,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '6轴IMU', isCritical: true },
      { name: '加速度量程', value: '±2/4/8/16g', isCritical: true },
      { name: '陀螺仪量程', value: '±250/500/1000/2000°/s', isCritical: true },
      { name: '加速度精度', value: '16', unit: 'bit' },
      { name: '陀螺仪精度', value: '16', unit: 'bit' },
      { name: '接口', value: 'I2C/SPI', isCritical: true },
      { name: '工作电压', value: '1.71V-3.6', unit: 'V', isCritical: true },
      { name: '工作电流', value: '0.9', unit: 'mA', description: '低功耗模式' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 10,
      quantity: 8500,
      digikeyPartNumber: '1890-ICM-42688-P-ND',
      lifecycleStatus: 'active',
    },
    description: 'ICM-42688-P高性能六轴传感器，超低功耗',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  // 光照传感器
  {
    id: 'sensor-light-001',
    model: 'BH1750FVI',
    manufacturer: 'Rohm',
    package: 'SMD-8',
    price: 3.5,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '数字光照传感器', isCritical: true },
      { name: '测量范围', value: '1-65535', unit: 'lux', isCritical: true },
      { name: '分辨率', value: '1', unit: 'lux' },
      { name: '接口', value: 'I2C', isCritical: true },
      { name: '工作电压', value: '2.4V-3.6', unit: 'V', isCritical: true },
      { name: '工作电流', value: '120', unit: 'uA' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 25000,
      jlcpcbPartNumber: 'C219074',
      lifecycleStatus: 'active',
    },
    description: 'BH1750数字光照传感器，I2C接口',
    isRecommended: true,
    qualityGrade: 'commercial',
  },
  // 气压传感器
  {
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
      { name: '精度', value: '±1', unit: 'hPa' },
      { name: '高度精度', value: '±1', unit: 'm' },
      { name: '接口', value: 'I2C/SPI', isCritical: true },
      { name: '工作电压', value: '1.8V-3.6', unit: 'V', isCritical: true },
      { name: '工作电流', value: '2.7', unit: 'uA', description: '1Hz采样' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 5,
      quantity: 35000,
      jlcpcbPartNumber: 'C82854',
      lifecycleStatus: 'active',
    },
    description: 'BMP280气压传感器，可用于高度测量',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
  // 电流传感器
  {
    id: 'sensor-current-001',
    model: 'ACS712ELCTR-05B-T',
    manufacturer: 'Allegro',
    package: 'SOIC-8',
    price: 5.0,
    currency: 'CNY',
    category: ComponentCategory.Sensor,
    specifications: [
      { name: '类型', value: '电流传感器', isCritical: true },
      { name: '测量范围', value: '±5', unit: 'A', isCritical: true },
      { name: '灵敏度', value: '185', unit: 'mV/A', isCritical: true },
      { name: '输出', value: '模拟电压', isCritical: true },
      { name: '工作电压', value: '5', unit: 'V', isCritical: true },
      { name: '带宽', value: '50', unit: 'kHz' },
      { name: '隔离电压', value: '2.1', unit: 'kV' },
    ],
    supplyStatus: {
      inStock: true,
      leadTime: 7,
      quantity: 15000,
      jlcpcbPartNumber: 'C43364',
      lifecycleStatus: 'active',
    },
    description: 'ACS712霍尔电流传感器，±5A量程',
    isRecommended: true,
    qualityGrade: 'industrial',
  },
];

/**
 * 所有元器件数据库合并
 */
const allComponents: ComponentSpec[] = [
  ...powerComponents,
  ...passiveComponents,
  ...communicationComponents,
  ...sensorComponents,
];

// ============================================
// 元器件数据库服务函数
// ============================================

/**
 * 搜索元器件
 * @param category 元器件类别
 * @param criteria 搜索条件
 * @returns 匹配的元器件列表
 */
export function searchComponents(
  category?: ComponentCategory | ComponentCategory[],
  criteria?: Record<string, string | number | boolean>
): ComponentSpec[] {
  let results = [...allComponents];

  // 按类别筛选
  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    results = results.filter((c) => categories.includes(c.category));
  }

  // 按条件筛选
  if (criteria) {
    results = results.filter((component) => {
      return Object.entries(criteria).every(([key, value]) => {
        // 检查元器件规格参数
        const spec = component.specifications.find(
          (s) => s.name.toLowerCase().includes(key.toLowerCase())
        );
        if (spec) {
          const specValue = String(spec.value).toLowerCase();
          const searchValue = String(value).toLowerCase();
          return specValue.includes(searchValue);
        }

        // 检查其他属性
        if (key === 'model') {
          return component.model.toLowerCase().includes(String(value).toLowerCase());
        }
        if (key === 'manufacturer') {
          return component.manufacturer.toLowerCase().includes(String(value).toLowerCase());
        }
        if (key === 'package') {
          return component.package.toLowerCase().includes(String(value).toLowerCase());
        }
        if (key === 'isRecommended') {
          return component.isRecommended === value;
        }
        if (key === 'qualityGrade') {
          return component.qualityGrade === value;
        }

        return true;
      });
    });
  }

  return results;
}

/**
 * 按价格筛选元器件
 * @param minPrice 最低价格
 * @param maxPrice 最高价格
 * @param components 元器件列表（可选，默认搜索全部）
 * @returns 匹配的元器件列表
 */
export function filterComponentsByPrice(
  minPrice: number,
  maxPrice: number,
  components?: ComponentSpec[]
): ComponentSpec[] {
  const searchList = components || allComponents;
  return searchList.filter(
    (component) => component.price >= minPrice && component.price <= maxPrice
  );
}

/**
 * 按库存筛选元器件
 * @param inStockOnly 是否只显示有库存的
 * @param components 元器件列表（可选，默认搜索全部）
 * @returns 匹配的元器件列表
 */
export function filterComponentsByStock(
  inStockOnly: boolean,
  components?: ComponentSpec[]
): ComponentSpec[] {
  const searchList = components || allComponents;
  if (!inStockOnly) {
    return searchList;
  }
  return searchList.filter((component) => component.supplyStatus.inStock);
}

/**
 * 获取元器件备选方案
 * @param componentId 元器件ID
 * @returns 备选方案列表
 */
export function getComponentAlternatives(componentId: string): ComponentAlternative[] {
  const component = allComponents.find((c) => c.id === componentId);
  if (!component) {
    return [];
  }

  // 如果元器件本身有备选方案定义，直接返回
  if (component.alternatives && component.alternatives.length > 0) {
    return component.alternatives;
  }

  // 否则，根据类别和规格查找相似元器件
  const alternatives: ComponentAlternative[] = [];
  const similarComponents = allComponents.filter(
    (c) => c.category === component.category && c.id !== component.id
  );

  // 根据关键规格匹配
  for (const similar of similarComponents.slice(0, 5)) {
    const priceDiff = similar.price - component.price;
    alternatives.push({
      model: similar.model,
      manufacturer: similar.manufacturer,
      priceDifference: Math.round(priceDiff * 100) / 100,
      availability: similar.supplyStatus.inStock ? 'available' : 'unavailable',
      leadTime: similar.supplyStatus.leadTime,
      compatibilityNotes: `同类别替代方案`,
    });
  }

  return alternatives;
}

/**
 * 智能选型需求定义
 */
export interface ComponentSelectionRequirement {
  /** 元器件类别 */
  category: ComponentCategory;
  /** 关键参数要求 */
  specifications: {
    name: string;
    value: string | number;
    unit?: string;
    tolerance?: number;
    isMinimum?: boolean;
    isMaximum?: boolean;
  }[];
  /** 价格限制 */
  priceConstraint?: {
    min?: number;
    max?: number;
  };
  /** 是否必须有库存 */
  requireInStock?: boolean;
  /** 是否优先推荐型号 */
  preferRecommended?: boolean;
  /** 质量等级要求 */
  qualityGradeRequirement?: ('commercial' | 'industrial' | 'automotive' | 'military')[];
  /** 权重配置 */
  weights?: {
    price?: number;
    performance?: number;
    availability?: number;
  };
}

/**
 * 智能选型结果
 */
export interface ComponentSelectionResult {
  /** 推荐的元器件 */
  component: ComponentSpec;
  /** 匹配得分 (0-100) */
  score: number;
  /** 匹配详情 */
  matchDetails: {
    specification: string;
    required: string;
    actual: string;
    match: boolean;
    score: number;
  }[];
  /** 推荐理由 */
  recommendation: string;
}

/**
 * 智能选型
 * @param requirements 选型需求
 * @returns 排序后的选型结果列表
 */
export function selectBestComponent(
  requirements: ComponentSelectionRequirement
): ComponentSelectionResult[] {
  // 获取候选元器件
  let candidates = searchComponents(requirements.category);

  // 应用库存筛选
  if (requirements.requireInStock) {
    candidates = filterComponentsByStock(true, candidates);
  }

  // 应用价格筛选
  if (requirements.priceConstraint) {
    const min = requirements.priceConstraint.min || 0;
    const max = requirements.priceConstraint.max || Infinity;
    candidates = filterComponentsByPrice(min, max, candidates);
  }

  // 应用质量等级筛选
  if (requirements.qualityGradeRequirement && requirements.qualityGradeRequirement.length > 0) {
    candidates = candidates.filter(
      (c) => c.qualityGrade && requirements.qualityGradeRequirement!.includes(c.qualityGrade)
    );
  }

  // 计算每个候选元器件的匹配得分
  const results: ComponentSelectionResult[] = candidates.map((component) => {
    const matchDetails: ComponentSelectionResult['matchDetails'] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    // 评估规格匹配度
    for (const reqSpec of requirements.specifications) {
      const compSpec = component.specifications.find(
        (s) =>
          s.name.toLowerCase().includes(reqSpec.name.toLowerCase()) ||
          reqSpec.name.toLowerCase().includes(s.name.toLowerCase())
      );

      maxPossibleScore += 10;
      const requiredValue = reqSpec.value;

      if (compSpec) {
        const actualValue = compSpec.value;

        let match = false;
        let specScore = 0;

        // 数值比较
        if (typeof requiredValue === 'number' && typeof actualValue === 'number') {
          if (reqSpec.isMinimum) {
            match = actualValue >= requiredValue;
            specScore = match ? 10 : Math.max(0, 10 - (requiredValue - actualValue) * 2);
          } else if (reqSpec.isMaximum) {
            match = actualValue <= requiredValue;
            specScore = match ? 10 : Math.max(0, 10 - (actualValue - requiredValue) * 2);
          } else {
            // 容差匹配
            const tolerance = reqSpec.tolerance || 0.1;
            const diff = Math.abs(actualValue - requiredValue) / requiredValue;
            match = diff <= tolerance;
            specScore = match ? 10 : Math.max(0, 10 - diff * 20);
          }
        } else {
          // 字符串匹配
          const actualStr = String(actualValue).toLowerCase();
          const requiredStr = String(requiredValue).toLowerCase();
          match = actualStr.includes(requiredStr) || requiredStr.includes(actualStr);
          specScore = match ? 10 : 5;
        }

        totalScore += specScore;
        matchDetails.push({
          specification: reqSpec.name,
          required: `${requiredValue}${reqSpec.unit || ''}`,
          actual: `${actualValue}${compSpec.unit || ''}`,
          match,
          score: specScore,
        });
      } else {
        matchDetails.push({
          specification: reqSpec.name,
          required: `${requiredValue}${reqSpec.unit || ''}`,
          actual: '未找到',
          match: false,
          score: 0,
        });
      }
    }

    // 推荐型号加分
    if (requirements.preferRecommended && component.isRecommended) {
      totalScore += 5;
      maxPossibleScore += 5;
    }

    // 库存状态加分
    if (component.supplyStatus.inStock) {
      totalScore += 3;
    }
    maxPossibleScore += 3;

    // 价格评估
    const weights = requirements.weights || { price: 0.3, performance: 0.5, availability: 0.2 };
    const priceScore = component.price < 1 ? 10 : component.price < 5 ? 8 : component.price < 10 ? 6 : 4;
    totalScore = totalScore * weights.performance! + priceScore * weights.price!;

    // 计算最终得分
    const finalScore = Math.round((totalScore / maxPossibleScore) * 100);

    // 生成推荐理由
    const matchedSpecs = matchDetails.filter((m) => m.match).map((m) => m.specification);
    let recommendation = '';
    if (finalScore >= 80) {
      recommendation = `高度匹配，${matchedSpecs.length}项规格完全符合要求`;
    } else if (finalScore >= 60) {
      recommendation = `基本匹配，${matchedSpecs.length}项规格符合要求`;
    } else {
      recommendation = `部分匹配，建议查看详细规格`;
    }

    if (component.isRecommended) {
      recommendation += '，为推荐型号';
    }

    return {
      component,
      score: finalScore,
      matchDetails,
      recommendation,
    };
  });

  // 按得分排序
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * 获取元器件详情
 * @param componentId 元器件ID
 * @returns 元器件详情
 */
export function getComponentById(componentId: string): ComponentSpec | undefined {
  return allComponents.find((c) => c.id === componentId);
}

/**
 * 获取所有元器件类别
 * @returns 类别列表
 */
export function getAllCategories(): ComponentCategory[] {
  return Object.values(ComponentCategory);
}

/**
 * 获取指定类别的元器件数量
 * @param category 类别
 * @returns 数量
 */
export function getComponentCountByCategory(category: ComponentCategory): number {
  return allComponents.filter((c) => c.category === category).length;
}

/**
 * 获取数据库统计信息
 * @returns 统计信息
 */
export function getDatabaseStatistics(): {
  totalComponents: number;
  categories: { category: ComponentCategory; count: number }[];
  inStockCount: number;
  recommendedCount: number;
} {
  const categories = Object.values(ComponentCategory).map((category) => ({
    category,
    count: allComponents.filter((c) => c.category === category).length,
  }));

  return {
    totalComponents: allComponents.length,
    categories: categories.filter((c) => c.count > 0),
    inStockCount: allComponents.filter((c) => c.supplyStatus.inStock).length,
    recommendedCount: allComponents.filter((c) => c.isRecommended).length,
  };
}

/**
 * 导出元器件数据库
 */
export {
  powerComponents,
  passiveComponents,
  communicationComponents,
  sensorComponents,
  allComponents,
};
