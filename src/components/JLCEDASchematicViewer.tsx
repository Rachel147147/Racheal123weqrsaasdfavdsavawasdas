import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Download, ZoomIn, ZoomOut, RotateCcw, 
  Printer, CheckCircle, Save, AlertTriangle, 
  Package, DollarSign, Clock, RefreshCw
} from 'lucide-react';
import { 
  ProjectRequirements, 
  SystemArchitecture, 
  ComponentSpec, 
  EvaluationResult,
  ComponentCategory,
  SupplyStatus,
  ComponentAlternative
} from '../types';
import { JLCEDA_STYLE, getSymbolById, type JLCSymbol } from '../services/jlcedaStyle';
import './JLCEDASchematicViewer.css';

interface JLCEDASchematicViewerProps {
  requirements: ProjectRequirements;
  architecture: SystemArchitecture;
  selectedComponents: ComponentSpec[];
  evaluation: EvaluationResult;
  onRestart: () => void;
}

interface PlacedComponent {
  id: string;
  symbol: JLCSymbol;
  x: number;
  y: number;
  refDes: string;
  value: string;
  pinLabels?: { [key: string]: string };
  componentSpec?: ComponentSpec;
  moduleId?: string;
}

interface Wire {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'signal' | 'power' | 'ground';
}

interface BOMItem {
  id: string;
  refDes: string;
  component: ComponentSpec;
  quantity: number;
  isSelected: boolean;
}

export default function JLCEDASchematicViewer({ 
  requirements, 
  architecture, 
  selectedComponents, 
  evaluation, 
  onRestart 
}: JLCEDASchematicViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [netLabels, setNetLabels] = useState<{ id: string; name: string; x: number; y: number; type: string }[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('正在初始化...');
  
  // BOM 相关状态
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [selectedBomItem, setSelectedBomItem] = useState<string | null>(null);
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateSchematicFromSelection();
  }, [selectedComponents, architecture]);

  // 从选型结果生成原理图
  const generateSchematicFromSelection = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('正在初始化...');

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(10);
    setGenerationStatus('分析元器件...');

    const placed: PlacedComponent[] = [];
    const wireList: Wire[] = [];
    const nets: { id: string; name: string; x: number; y: number; type: string }[] = [];
    const bom: BOMItem[] = [];

    let refDesCounter = { U: 1, R: 1, C: 1, L: 1, J: 1, Y: 1, D: 1, Q: 1, SW: 1, F: 1 };

    // 根据元器件类别分组
    const componentsByCategory = new Map<ComponentCategory, ComponentSpec[]>();
    selectedComponents.forEach(comp => {
      const category = comp.category;
      if (!componentsByCategory.has(category)) {
        componentsByCategory.set(category, []);
      }
      componentsByCategory.get(category)!.push(comp);
    });

    // 布局位置定义
    const positions = {
      power: { x: 80, y: 120, startY: 120 },
      mcu: { x: 450, y: 320 },
      memory: { x: 720, y: 200 },
      communication: { x: 720, y: 380, startY: 380 },
      sensor: { x: 50, y: 380 },
      connector: { x: 50, y: 500 },
      passive: { x: 300, y: 500 },
      timing: { x: 410, y: 540 },
    };

    await new Promise(resolve => setTimeout(resolve, 400));
    setGenerationProgress(30);
    setGenerationStatus('布局处理器和核心器件...');

    // 处理处理器/MCU
    const processors = componentsByCategory.get(ComponentCategory.Processor) || 
                       componentsByCategory.get(ComponentCategory.Microcontroller) || [];
    if (processors.length > 0) {
      const mcu = processors[0];
      const mcuSymbol = getSymbolById(mcu.id) || getSymbolById('stm32f103c8t6');
      if (mcuSymbol) {
        const refDes = `U${refDesCounter.U++}`;
        placed.push({
          id: `mcu_${mcu.id}`,
          symbol: mcuSymbol,
          x: positions.mcu.x,
          y: positions.mcu.y,
          refDes,
          value: mcu.model,
          componentSpec: mcu,
          moduleId: 'mcu'
        });
        bom.push({
          id: `mcu_${mcu.id}`,
          refDes,
          component: mcu,
          quantity: 1,
          isSelected: true
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(45);
    setGenerationStatus('布局电源和外围电路...');

    // 处理电源模块
    const powerComponents = componentsByCategory.get(ComponentCategory.Power) || [];
    let powerY = positions.power.startY;
    powerComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('ams1117_33');
      if (symbol) {
        const refDes = `U${refDesCounter.U++}`;
        const x = positions.power.x + (index % 2) * 200;
        const y = powerY + Math.floor(index / 2) * 100;
        placed.push({
          id: `power_${comp.id}`,
          symbol,
          x,
          y,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'power'
        });
        bom.push({
          id: `power_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    // 处理存储器
    const memoryComponents = componentsByCategory.get(ComponentCategory.Memory) || [];
    memoryComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('memory_soic8');
      if (symbol) {
        const refDes = `U${refDesCounter.U++}`;
        placed.push({
          id: `mem_${comp.id}`,
          symbol,
          x: positions.memory.x,
          y: positions.memory.y + index * 80,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'memory'
        });
        bom.push({
          id: `mem_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    // 处理通信模块
    const commComponents = componentsByCategory.get(ComponentCategory.Communication) || [];
    let commY = positions.communication.startY;
    commComponents.forEach((comp) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('header_ph_2p');
      if (symbol) {
        const refDes = `J${refDesCounter.J++}`;
        placed.push({
          id: `comm_${comp.id}`,
          symbol,
          x: positions.communication.x,
          y: commY,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'communication'
        });
        bom.push({
          id: `comm_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
        commY += 80;
      }
    });

    // 处理传感器
    const sensorComponents = componentsByCategory.get(ComponentCategory.Sensor) || [];
    sensorComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('header_ph_2p');
      if (symbol) {
        const refDes = `U${refDesCounter.U++}`;
        placed.push({
          id: `sensor_${comp.id}`,
          symbol,
          x: positions.sensor.x,
          y: positions.sensor.y + index * 60,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'sensor'
        });
        bom.push({
          id: `sensor_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(60);
    setGenerationStatus('添加连接器和无源器件...');

    // 处理连接器
    const connectorComponents = componentsByCategory.get(ComponentCategory.Connector) || [];
    connectorComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('header_ph_2p');
      if (symbol) {
        const refDes = `J${refDesCounter.J++}`;
        placed.push({
          id: `conn_${comp.id}`,
          symbol,
          x: positions.connector.x,
          y: positions.connector.y + index * 60,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'connector'
        });
        bom.push({
          id: `conn_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    // 处理无源器件（电阻、电容等）
    const passiveComponents = componentsByCategory.get(ComponentCategory.Passive) || [];
    
    // 添加标准去耦电容和偏置电阻
    const standardPassives = [
      { id: 'decoupling_1', type: 'capacitor_0805_ceramic', value: '100nF', refDes: `C${refDesCounter.C++}`, x: 330, y: 300 },
      { id: 'decoupling_2', type: 'capacitor_0805_ceramic', value: '100nF', refDes: `C${refDesCounter.C++}`, x: 330, y: 420 },
      { id: 'decoupling_3', type: 'capacitor_0805_ceramic', value: '100nF', refDes: `C${refDesCounter.C++}`, x: 570, y: 300 },
      { id: 'decoupling_4', type: 'capacitor_0805_ceramic', value: '100nF', refDes: `C${refDesCounter.C++}`, x: 570, y: 420 },
      { id: 'reset_r', type: 'resistor_0805', value: '10K', refDes: `R${refDesCounter.R++}`, x: 140, y: 240 },
      { id: 'boot_r', type: 'resistor_0805', value: '10K', refDes: `R${refDesCounter.R++}`, x: 280, y: 240 },
      { id: 'led_r', type: 'resistor_0805', value: '330R', refDes: `R${refDesCounter.R++}`, x: 640, y: 150 },
    ];

    standardPassives.forEach(sp => {
      const symbol = getSymbolById(sp.type);
      if (symbol) {
        placed.push({
          id: sp.id,
          symbol,
          x: sp.x,
          y: sp.y,
          refDes: sp.refDes,
          value: sp.value,
          moduleId: 'passive'
        });
      }
    });

    // 处理用户选型的无源器件
    passiveComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('resistor_0805');
      if (symbol) {
        let refDes = '';
        if (symbol.type === 'Resistor') refDes = `R${refDesCounter.R++}`;
        else if (symbol.type === 'Capacitor') refDes = `C${refDesCounter.C++}`;
        else if (symbol.type === 'Inductor') refDes = `L${refDesCounter.L++}`;
        else refDes = `U${refDesCounter.U++}`;

        placed.push({
          id: `passive_${comp.id}`,
          symbol,
          x: positions.passive.x + (index % 3) * 100,
          y: positions.passive.y + Math.floor(index / 3) * 60,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'passive'
        });
        bom.push({
          id: `passive_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    setGenerationProgress(75);
    setGenerationStatus('添加时钟和光电器件...');

    // 处理时钟/晶振
    const timingComponents = componentsByCategory.get(ComponentCategory.Timing) || [];
    timingComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('crystal_hc49s');
      if (symbol) {
        const refDes = `Y${refDesCounter.Y++}`;
        placed.push({
          id: `timing_${comp.id}`,
          symbol,
          x: positions.timing.x,
          y: positions.timing.y + index * 60,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'timing'
        });
        bom.push({
          id: `timing_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    // 添加标准晶振（如果没有选型）
    if (timingComponents.length === 0) {
      const crystalSymbol = getSymbolById('crystal_hc49s');
      if (crystalSymbol) {
        placed.push({
          id: 'crystal',
          symbol: crystalSymbol,
          x: positions.timing.x,
          y: positions.timing.y,
          refDes: `Y${refDesCounter.Y++}`,
          value: '8MHz',
          moduleId: 'timing'
        });
      }
    }

    // 处理光电器件
    const optoComponents = componentsByCategory.get(ComponentCategory.Optoelectronics) || [];
    optoComponents.forEach((comp, index) => {
      const symbol = getSymbolById(comp.id) || getSymbolById('led_0805');
      if (symbol) {
        const refDes = symbol.type === 'LED' ? `D${refDesCounter.D++}` : `U${refDesCounter.U++}`;
        placed.push({
          id: `opto_${comp.id}`,
          symbol,
          x: 690,
          y: 150 + index * 70,
          refDes,
          value: comp.model,
          componentSpec: comp,
          moduleId: 'opto'
        });
        bom.push({
          id: `opto_${comp.id}`,
          refDes,
          component: comp,
          quantity: 1,
          isSelected: true
        });
      }
    });

    // 添加标准LED（如果没有选型）
    if (optoComponents.length === 0) {
      const ledSymbol = getSymbolById('led_0805');
      if (ledSymbol) {
        placed.push({
          id: 'led1',
          symbol: ledSymbol,
          x: 690,
          y: 150,
          refDes: `D${refDesCounter.D++}`,
          value: 'LED',
          moduleId: 'opto'
        });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    setGenerationProgress(90);
    setGenerationStatus('生成连线和网络标签...');

    // 生成连线（基于架构接口）
    generateWiresFromArchitecture(architecture, wireList, placed);
    
    // 生成网络标签
    generateNetLabels(architecture, nets, placed);

    setComponents(placed);
    setWires(wireList);
    setNetLabels(nets);
    setBomItems(bom);
    setAnalysisComplete(true);

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(100);
    setGenerationStatus('原理图生成完成！');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsGenerating(false);
  };

  // 根据架构生成连线
  const generateWiresFromArchitecture = (
    arch: SystemArchitecture, 
    wireList: Wire[], 
    _placed: PlacedComponent[]
  ) => {
    // 电源网络
    wireList.push(
      { x1: 70, y1: 130, x2: 70, y2: 180, type: 'power' },
      { x1: 70, y1: 180, x2: 90, y2: 180, type: 'power' },
      { x1: 130, y1: 180, x2: 140, y2: 180, type: 'power' },
      { x1: 250, y1: 180, x2: 320, y2: 180, type: 'power' },
      { x1: 320, y1: 180, x2: 320, y2: 200, type: 'power' },
      { x1: 320, y1: 200, x2: 340, y2: 200, type: 'power' },
      { x1: 340, y1: 200, x2: 340, y2: 280, type: 'power' },
      { x1: 340, y1: 280, x2: 410, y2: 280, type: 'power' },
      { x1: 410, y1: 280, x2: 410, y2: 300, type: 'power' },
      { x1: 410, y1: 420, x2: 410, y2: 440, type: 'power' },
      { x1: 410, y1: 440, x2: 490, y2: 440, type: 'power' },
      { x1: 490, y1: 440, x2: 490, y2: 470, type: 'power' },
    );

    // 信号网络
    wireList.push(
      { x1: 140, y1: 240, x2: 140, y2: 290, type: 'signal' },
      { x1: 140, y1: 290, x2: 180, y2: 290, type: 'signal' },
      { x1: 180, y1: 290, x2: 180, y2: 320, type: 'signal' },
      { x1: 280, y1: 240, x2: 280, y2: 320, type: 'signal' },
      { x1: 640, y1: 150, x2: 640, y2: 180, type: 'signal' },
      { x1: 640, y1: 180, x2: 690, y2: 180, type: 'signal' },
      { x1: 690, y1: 150, x2: 690, y2: 120, type: 'signal' },
      { x1: 340, y1: 540, x2: 340, y2: 570, type: 'signal' },
      { x1: 480, y1: 540, x2: 480, y2: 570, type: 'signal' },
      { x1: 410, y1: 540, x2: 410, y2: 590, type: 'signal' },
    );

    // SWD 调试接口
    wireList.push(
      { x1: 720, y1: 380, x2: 720, y2: 350, type: 'signal' },
      { x1: 660, y1: 380, x2: 720, y2: 380, type: 'signal' },
      { x1: 720, y1: 410, x2: 720, y2: 440, type: 'signal' },
      { x1: 720, y1: 440, x2: 720, y2: 450, type: 'signal' },
    );

    // 根据架构接口添加额外连线
    arch.interfaces.forEach(iface => {
      if (iface.type === 'wireless') {
        wireList.push(
          { x1: 490, y1: 520, x2: 700, y2: 520, type: 'signal' },
          { x1: 490, y1: 550, x2: 700, y2: 550, type: 'signal' },
        );
      }
      if (iface.type === 'serial' && iface.protocol.includes('USB')) {
        wireList.push(
          { x1: 490, y1: 180, x2: 700, y2: 180, type: 'signal' },
          { x1: 490, y1: 210, x2: 700, y2: 210, type: 'signal' },
        );
      }
    });
  };

  // 生成网络标签
  const generateNetLabels = (
    arch: SystemArchitecture, 
    nets: { id: string; name: string; x: number; y: number; type: string }[],
    _placed: PlacedComponent[]
  ) => {
    // 标准网络标签
    nets.push(
      { id: 'net_vcc5', name: 'VCC_5V', x: 80, y: 110, type: 'power' },
      { id: 'net_vcc33', name: 'VCC_3V3', x: 360, y: 110, type: 'power' },
      { id: 'net_gnd1', name: 'GND', x: 70, y: 220, type: 'ground' },
      { id: 'net_gnd2', name: 'GND', x: 250, y: 220, type: 'ground' },
      { id: 'net_gnd3', name: 'GND', x: 340, y: 330, type: 'ground' },
      { id: 'net_gnd4', name: 'GND', x: 340, y: 460, type: 'ground' },
      { id: 'net_gnd5', name: 'GND', x: 580, y: 330, type: 'ground' },
      { id: 'net_gnd6', name: 'GND', x: 580, y: 460, type: 'ground' },
      { id: 'net_gnd7', name: 'GND', x: 720, y: 460, type: 'ground' },
      { id: 'net_reset', name: 'NRST', x: 160, y: 265, type: 'signal' },
      { id: 'net_boot0', name: 'BOOT0', x: 300, y: 265, type: 'signal' },
      { id: 'net_led', name: 'PC13-LED', x: 665, y: 165, type: 'signal' },
      { id: 'net_osc_in', name: 'PH0-OSC_IN', x: 375, y: 560, type: 'signal' },
      { id: 'net_osc_out', name: 'PH1-OSC_OUT', x: 445, y: 560, type: 'signal' },
      { id: 'net_swdio', name: 'SWDIO', x: 690, y: 395, type: 'signal' },
      { id: 'net_swclk', name: 'SWCLK', x: 690, y: 425, type: 'signal' },
      { id: 'net_swd_vcc', name: 'VCC_3V3', x: 690, y: 365, type: 'power' },
      { id: 'net_swd_gnd', name: 'GND', x: 690, y: 455, type: 'ground' },
      { id: 'net_vdda', name: 'VDDA', x: 410, y: 350, type: 'power' },
      { id: 'net_vssa', name: 'VSSA', x: 410, y: 370, type: 'ground' },
    );

    // 根据架构接口添加网络标签
    arch.interfaces.forEach((iface, index) => {
      if (iface.type === 'wireless') {
        nets.push({ id: `net_wifi_${index}`, name: 'WiFi/BT', x: 595, y: 535, type: 'signal' });
      }
      if (iface.type === 'serial' && iface.protocol.includes('USB')) {
        nets.push({ id: `net_usb_${index}`, name: 'USB', x: 595, y: 195, type: 'signal' });
      }
      if (iface.type === 'serial' && iface.protocol.includes('UART')) {
        nets.push(
          { id: `net_uart_tx_${index}`, name: 'UART_TX', x: 240, y: 445, type: 'signal' },
          { id: `net_uart_rx_${index}`, name: 'UART_RX', x: 240, y: 475, type: 'signal' },
        );
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理元器件点击
  const handleComponentClick = (compId: string) => {
    const bomItem = bomItems.find(item => item.id === compId);
    if (bomItem) {
      setSelectedBomItem(bomItem.id);
      setHighlightedComponent(compId);
    }
  };

  // 切换备选方案
  const handleSwitchAlternative = (bomItemId: string, alternative: ComponentAlternative) => {
    setBomItems(prev => prev.map(item => {
      if (item.id === bomItemId) {
        // 创建新的 ComponentSpec 从备选方案
        const newSpec: ComponentSpec = {
          ...item.component,
          model: alternative.model,
          manufacturer: alternative.manufacturer,
          price: item.component.price + alternative.priceDifference,
        };
        return { ...item, component: newSpec };
      }
      return item;
    }));
    
    // 重新生成原理图
    setTimeout(() => generateSchematicFromSelection(), 100);
    setShowAlternatives(null);
  };

  // 渲染元器件
  const renderJLCComponent = (comp: PlacedComponent) => {
    const { symbol, x, y, refDes, value, componentSpec } = comp;
    const isHighlighted = highlightedComponent === comp.id;
    
    return (
      <g 
        key={comp.id} 
        transform={`translate(${x}, ${y})`}
        onClick={() => componentSpec && handleComponentClick(comp.id)}
        style={{ cursor: componentSpec ? 'pointer' : 'default' }}
        className={isHighlighted ? 'component-highlighted' : ''}
      >
        {/* 高亮背景 */}
        {isHighlighted && (
          <rect
            x={-100}
            y={-200}
            width={200}
            height={400}
            fill="rgba(99, 102, 241, 0.1)"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="5,5"
            rx="8"
          />
        )}

        {symbol.type === 'Resistor' && (
          <>
            <path
              d="M -40,0 L -25,0 L -20,-10 L -10,10 L 0,-10 L 10,10 L 15,0 L 40,0"
              fill="none"
              stroke={JLCEDA_STYLE.colors.components.outline}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1={-50} y1={0} x2={-40} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={40} y1={0} x2={50} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <circle cx={50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-18} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={22} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
          </>
        )}

        {symbol.type === 'Capacitor' && (
          <>
            <line x1={-15} y1={-20} x2={-15} y2={20} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            <line x1={15} y1={-20} x2={15} y2={20} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            {value.includes('u') && (
              <text x={-22} y={-8} textAnchor="end" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="14" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.pinName}>+</text>
            )}
            <line x1={-50} y1={0} x2={-15} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={15} y1={0} x2={50} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <circle cx={50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-28} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={32} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
          </>
        )}

        {symbol.type === 'Inductor' && (
          <>
            <path d="M -35,0 Q -25,-12 -15,0 Q -5,12 5,0 Q 15,-12 25,0 Q 35,12 45,0" fill="none" stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            <line x1={-50} y1={0} x2={-35} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={45} y1={0} x2={50} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <circle cx={50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-25} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={28} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
          </>
        )}

        {symbol.type === 'Diode' && (
          <>
            <polygon points="-15,-12 -15,12 15,0" fill="none" stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinejoin="round" />
            <line x1={15} y1={-12} x2={15} y2={12} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            <line x1={-50} y1={0} x2={-15} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={15} y1={0} x2={50} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <circle cx={50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-25} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={28} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
          </>
        )}

        {symbol.type === 'LED' && (
          <>
            <polygon points="-15,-12 -15,12 15,0" fill="none" stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinejoin="round" />
            <line x1={15} y1={-12} x2={15} y2={12} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            <line x1={5} y1={-18} x2={15} y2={-8} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            <line x1={10} y1={-23} x2={20} y2={-13} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" strokeLinecap="round" />
            <line x1={-50} y1={0} x2={-15} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={15} y1={0} x2={50} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <circle cx={50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-32} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={28} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
          </>
        )}

        {symbol.type === 'Crystal' && (
          <>
            <rect x={-35} y={-18} width={70} height={36} fill="none" stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={-25} y1={-12} x2={-25} y2={12} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={25} y1={-12} x2={25} y2={12} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={-50} y1={0} x2={-35} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <line x1={35} y1={0} x2={50} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <circle cx={50} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-28} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={32} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
          </>
        )}

        {symbol.type === 'VoltageRegulator' && (
          <>
            <rect x={-40} y={-28} width={80} height={56} fill={JLCEDA_STYLE.colors.components.fill} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <text x={0} y={-10} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="11" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={10} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="9" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
            <line x1={-60} y1={-20} x2={-40} y2={-20} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-60} cy={-20} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={-65} y={-16} textAnchor="end" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="9" fill={JLCEDA_STYLE.colors.components.pinName}>GND</text>
            <line x1={-60} y1={20} x2={-40} y2={20} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-60} cy={20} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={-65} y={24} textAnchor="end" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="9" fill={JLCEDA_STYLE.colors.components.pinName}>VIN</text>
            <line x1={40} y1={0} x2={60} y2={0} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={60} cy={0} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={65} y={4} textAnchor="start" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="9" fill={JLCEDA_STYLE.colors.components.pinName}>VOUT</text>
          </>
        )}

        {symbol.type === 'IC' && (
          <>
            <rect x={-80} y={-190} width={160} height={380} fill={JLCEDA_STYLE.colors.components.fill} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <circle cx={-65} cy={-175} r={6} fill={JLCEDA_STYLE.colors.components.pin} />
            <text x={0} y={-160} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={0} y={175} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
            {symbol.pins?.filter(p => p.side === 'left').slice(0, 17).map((pin, i) => {
              const pinY = -160 + i * 22;
              return (
                <g key={`l-${pin.number}`}>
                  <line x1={-100} y1={pinY} x2={-80} y2={pinY} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
                  <circle cx={-100} cy={pinY} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
                  <text x={-105} y={pinY + 4} textAnchor="end" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="9" fill={JLCEDA_STYLE.colors.components.pinName}>{pin.name}</text>
                  <text x={-70} y={pinY + 4} textAnchor="start" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="7" fill={JLCEDA_STYLE.colors.components.pinNumber}>{pin.number}</text>
                </g>
              );
            })}
            {symbol.pins?.filter(p => p.side === 'right').slice(0, 23).map((pin, i) => {
              const pinY = -160 + i * 22;
              return (
                <g key={`r-${pin.number}`}>
                  <line x1={80} y1={pinY} x2={100} y2={pinY} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
                  <circle cx={100} cy={pinY} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
                  <text x={105} y={pinY + 4} textAnchor="start" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="9" fill={JLCEDA_STYLE.colors.components.pinName}>{pin.name}</text>
                  <text x={70} y={pinY + 4} textAnchor="end" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="7" fill={JLCEDA_STYLE.colors.components.pinNumber}>{pin.number}</text>
                </g>
              );
            })}
          </>
        )}

        {symbol.type === 'Connector' && (
          <>
            <rect x={-30} y={-65} width={60} height={130} fill={JLCEDA_STYLE.colors.components.fill} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
            <text x={35} y={-45} textAnchor="start" fontFamily={JLCEDA_STYLE.fonts.symbol} fontSize="12" fontWeight="bold" fill={JLCEDA_STYLE.colors.components.refDes}>
              {refDes}
            </text>
            <text x={35} y={-28} textAnchor="start" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="10" fill={JLCEDA_STYLE.colors.components.value}>
              {value}
            </text>
            {symbol.pins?.slice(0, 4).map((pin, i) => {
              const pinY = -45 + i * 30;
              return (
                <g key={pin.number}>
                  <line x1={-50} y1={pinY} x2={-30} y2={pinY} stroke={JLCEDA_STYLE.colors.components.outline} strokeWidth="2" />
                  <circle cx={-50} cy={pinY} r={3} fill={JLCEDA_STYLE.colors.components.pin} />
                  <text x={-55} y={pinY + 4} textAnchor="end" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="9" fill={JLCEDA_STYLE.colors.components.pinName}>{pin.name}</text>
                </g>
              );
            })}
          </>
        )}
      </g>
    );
  };

  const renderTitleBlock = () => {
    const tbWidth = JLCEDA_STYLE.sizes.titleBlock.width;
    const tbHeight = JLCEDA_STYLE.sizes.titleBlock.height;
    const tbX = JLCEDA_STYLE.paper.A4.width - tbWidth - 20;
    const tbY = JLCEDA_STYLE.paper.A4.height - tbHeight - 20;
    const today = new Date().toISOString().slice(0, 10);

    const projectName = requirements.projectName || '嵌入式系统设计';
    const projectDescription = requirements.description || '';
    const version = 'V1.0';
    const boardName = architecture.name || 'MCU Board';

    return (
      <g transform={`translate(${tbX}, ${tbY})`}>
        <rect x={0} y={0} width={tbWidth} height={tbHeight} fill="#ffffff" stroke="#ff0000" strokeWidth="1.5" />
        
        <line x1={tbWidth * 0.20} y1={0} x2={tbWidth * 0.20} y2={tbHeight} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.22} x2={tbWidth} y2={tbHeight * 0.22} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.42} x2={tbWidth} y2={tbHeight * 0.42} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.62} x2={tbWidth} y2={tbHeight * 0.62} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.82} x2={tbWidth} y2={tbHeight * 0.82} stroke="#ff0000" strokeWidth="0.75" />
        
        <line x1={tbWidth * 0.20} y1={tbHeight * 0.42} x2={tbWidth * 0.20} y2={tbHeight * 0.82} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={tbWidth * 0.42} y1={tbHeight * 0.82} x2={tbWidth * 0.42} y2={tbHeight} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={tbWidth * 0.52} y1={tbHeight * 0.82} x2={tbWidth * 0.52} y2={tbHeight} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={tbWidth * 0.68} y1={tbHeight * 0.82} x2={tbWidth * 0.68} y2={tbHeight} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={tbWidth * 0.78} y1={tbHeight * 0.82} x2={tbWidth * 0.78} y2={tbHeight} stroke="#ff0000" strokeWidth="0.75" />
        
        <text x={tbWidth * 0.10} y={tbHeight * 0.14} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="16" fontWeight="bold" fill="#000000">原理图</text>
        
        <text x={tbWidth * 0.28} y={tbHeight * 0.08} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">创建日期</text>
        <text x={tbWidth * 0.28} y={tbHeight * 0.18} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">{today}</text>
        
        <text x={tbWidth * 0.55} y={tbHeight * 0.08} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">更新日期</text>
        <text x={tbWidth * 0.55} y={tbHeight * 0.18} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">{today}</text>
        
        <text x={tbWidth * 0.80} y={tbHeight * 0.08} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">版本</text>
        <text x={tbWidth * 0.80} y={tbHeight * 0.18} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">{version}</text>
        
        <text x={tbWidth * 0.28} y={tbHeight * 0.32} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">项目名称</text>
        <text x={tbWidth * 0.28} y={tbHeight * 0.39} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="12" fontWeight="bold" fill="#000000">{projectName}</text>
        
        <text x={tbWidth * 0.28} y={tbHeight * 0.52} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">项目描述</text>
        <text x={tbWidth * 0.28} y={tbHeight * 0.59} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="9" fill="#333333">{projectDescription || boardName}</text>
        
        <text x={tbWidth * 0.06} y={tbHeight * 0.32} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">绘制</text>
        <text x={tbWidth * 0.06} y={tbHeight * 0.52} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">审核</text>
        <text x={tbWidth * 0.06} y={tbHeight * 0.72} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">批准</text>
        
        <text x={tbWidth * 0.55} y={tbHeight * 0.75} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="14" fontWeight="bold" fill="#000000">{boardName}</text>
        
        <text x={tbWidth * 0.32} y={tbHeight * 0.89} textAnchor="middle" fontFamily="SimSun, sans-serif" fontSize="8" fill="#000000">图纸编号</text>
        <text x={tbWidth * 0.47} y={tbHeight * 0.89} textAnchor="middle" fontFamily="SimSun, sans-serif" fontSize="8" fill="#000000">尺寸</text>
        <text x={tbWidth * 0.60} y={tbHeight * 0.89} textAnchor="middle" fontFamily="SimSun, sans-serif" fontSize="8" fill="#000000">页数</text>
        <text x={tbWidth * 0.73} y={tbHeight * 0.89} textAnchor="middle" fontFamily="SimSun, sans-serif" fontSize="8" fill="#000000">共</text>
        
        <text x={tbWidth * 0.32} y={tbHeight * 0.96} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">SCH001</text>
        <text x={tbWidth * 0.47} y={tbHeight * 0.96} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">A4</text>
        <text x={tbWidth * 0.60} y={tbHeight * 0.96} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">1</text>
        <text x={tbWidth * 0.73} y={tbHeight * 0.96} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">1</text>
        
        <text x={tbWidth * 0.88} y={tbHeight * 0.93} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#6366f1">嘉立创EDA</text>
        
        <g transform={`translate(${tbWidth * 0.10}, ${tbHeight * 0.88})`}>
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="none" stroke="#6366f1" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="7" fontWeight="bold" fill="#6366f1">PCB</text>
        </g>
      </g>
    );
  };

  const renderNetLabels = () => {
    return netLabels.map(net => (
      <g key={net.id} transform={`translate(${net.x}, ${net.y})`}>
        <rect x={-30} y={-10} width={60} height={20} fill="white" stroke="none" />
        <text fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="10" fontWeight="bold" fill={JLCEDA_STYLE.colors.netLabels.default}>
          {net.name}
        </text>
      </g>
    ));
  };

  const renderGroundSymbol = (x: number, y: number) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={-12} y1={0} x2={12} y2={0} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
      <line x1={-8} y1={8} x2={8} y2={8} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
      <line x1={-4} y1={16} x2={4} y2={16} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
      <line x1={0} y1={-10} x2={0} y2={0} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
    </g>
  );

  const renderPowerSymbol = (x: number, y: number, label: string) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={0} y1={-15} x2={0} y2={0} stroke={JLCEDA_STYLE.colors.wires.power} strokeWidth="2" />
      <circle r="10" fill={JLCEDA_STYLE.colors.components.fill} stroke={JLCEDA_STYLE.colors.wires.power} strokeWidth="2" />
      <text y={4} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="10" fontWeight="bold" fill={JLCEDA_STYLE.colors.wires.power}>{label}</text>
    </g>
  );

  const renderWires = () => {
    return (
      <g>
        {wires.map((wire, i) => (
          <line
            key={i}
            x1={wire.x1}
            y1={wire.y1}
            x2={wire.x2}
            y2={wire.y2}
            stroke={JLCEDA_STYLE.colors.wires.signal}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  };

  const renderRegions = () => {
    return (
      <g>
        <rect x="30" y="60" width="240" height="220" fill={JLCEDA_STYLE.colors.regions.power} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="40" y="85" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">电源管理电路</text>
        
        <rect x="30" y="300" width="340" height="360" fill={JLCEDA_STYLE.colors.regions.mcu} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="40" y="325" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">MCU最小系统</text>
        
        <rect x="560" y="60" width="220" height="240" fill={JLCEDA_STYLE.colors.regions.interface} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="570" y="85" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">接口与外设</text>
        
        <rect x="560" y="320" width="220" height="340" fill={JLCEDA_STYLE.colors.regions.interface} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="570" y="345" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">调试与通信</text>
      </g>
    );
  };

  // 渲染供货状态标签
  const renderSupplyStatus = (status: SupplyStatus) => {
    if (status.inStock) {
      return (
        <span className="supply-status in-stock">
          <CheckCircle size={12} />
          有货 ({status.quantity})
        </span>
      );
    } else if (status.leadTime > 0) {
      return (
        <span className="supply-status limited">
          <Clock size={12} />
          交期 {status.leadTime} 天
        </span>
      );
    } else {
      return (
        <span className="supply-status out-of-stock">
          <AlertTriangle size={12} />
          无货
        </span>
      );
    }
  };

  // 计算总 BOM 成本
  const totalBomCost = bomItems.reduce((sum, item) => sum + item.component.price * item.quantity, 0);

  return (
    <div className="jlceda-viewer">
      {isGenerating && (
        <div className="schematic-generation-overlay">
          <div className="generation-modal">
            <div className="generation-icon">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Package size={48} />
              </motion.div>
            </div>
            <h2 className="generation-title">正在生成原理图</h2>
            <p className="generation-status">{generationStatus}</p>
            <div className="progress-container">
              <div 
                className="progress-bar"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="progress-text">{generationProgress}%</p>
          </div>
        </div>
      )}
      <header className="jlceda-header">
        <div className="jlceda-header-left">
          <button className="jlceda-icon-button" onClick={onRestart}>
            <Home size={18} />
          </button>
          <div className="jlceda-project-info">
            <h1 className="jlceda-project-name">{requirements.projectName}</h1>
            <span className="jlceda-status">
              <CheckCircle size={12} />
              {isGenerating ? '正在生成...' : '原理图生成完成'}
            </span>
          </div>
        </div>

        <div className="jlceda-toolbar">
          <button className="jlceda-toolbar-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
            <ZoomOut size={16} />
          </button>
          <span className="jlceda-zoom">{Math.round(zoom * 100)}%</span>
          <button className="jlceda-toolbar-btn" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
            <ZoomIn size={16} />
          </button>
          <button className="jlceda-toolbar-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="jlceda-header-right">
          <button className="jlceda-toolbar-btn">
            <Printer size={16} />
          </button>
          <button className="jlceda-toolbar-btn">
            <Save size={16} />
          </button>
          <button className="jlceda-primary-btn">
            <Download size={16} />
            导出
          </button>
        </div>
      </header>

      <div className="jlceda-main">
        <aside className="jlceda-sidebar jlceda-sidebar-enhanced">
          {analysisComplete && (
            <>
              {/* 架构概览 */}
              <div className="jlceda-sidebar-section">
                <h3>📐 系统架构</h3>
                <div className="architecture-summary">
                  <div className="arch-item">
                    <span className="arch-label">架构名称</span>
                    <span className="arch-value">{architecture.name}</span>
                  </div>
                  <div className="arch-item">
                    <span className="arch-label">模块数量</span>
                    <span className="arch-value">{architecture.modules.length} 个</span>
                  </div>
                  <div className="arch-item">
                    <span className="arch-label">接口数量</span>
                    <span className="arch-value">{architecture.interfaces.length} 个</span>
                  </div>
                </div>
              </div>

              {/* BOM 清单 */}
              <div className="jlceda-sidebar-section">
                <h3>📋 元器件清单 (BOM)</h3>
                <div className="bom-summary">
                  <div className="bom-total">
                    <DollarSign size={14} />
                    <span>总成本: ${totalBomCost.toFixed(2)}</span>
                  </div>
                  <div className="bom-count">
                    <Package size={14} />
                    <span>元器件: {bomItems.length} 种</span>
                  </div>
                </div>
                
                <div className="bom-list">
                  {bomItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`bom-item ${selectedBomItem === item.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedBomItem(item.id);
                        setHighlightedComponent(item.id);
                      }}
                    >
                      <div className="bom-item-header">
                        <span className="bom-refdes">{item.refDes}</span>
                        {renderSupplyStatus(item.component.supplyStatus)}
                      </div>
                      <div className="bom-model">{item.component.model}</div>
                      <div className="bom-manufacturer">{item.component.manufacturer}</div>
                      <div className="bom-item-footer">
                        <span className="bom-price">${item.component.price.toFixed(2)}</span>
                        <span className="bom-qty">x{item.quantity}</span>
                        {item.component.alternatives && item.component.alternatives.length > 0 && (
                          <button 
                            className="bom-alt-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAlternatives(showAlternatives === item.id ? null : item.id);
                            }}
                          >
                            <RefreshCw size={12} />
                            备选
                          </button>
                        )}
                      </div>
                      
                      {/* 备选方案 */}
                      {showAlternatives === item.id && item.component.alternatives && (
                        <div className="alternatives-panel">
                          <div className="alt-header">备选方案</div>
                          {item.component.alternatives.map((alt, idx) => (
                            <div 
                              key={idx} 
                              className="alt-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwitchAlternative(item.id, alt);
                              }}
                            >
                              <div className="alt-model">{alt.model}</div>
                              <div className="alt-manufacturer">{alt.manufacturer}</div>
                              <div className="alt-details">
                                <span className={`alt-avail ${alt.availability}`}>
                                  {alt.availability === 'available' ? '有货' : 
                                   alt.availability === 'limited' ? '有限' : '无货'}
                                </span>
                                <span className="alt-price-diff">
                                  {alt.priceDifference >= 0 ? '+' : ''}{alt.priceDifference.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 评估概览 */}
              <div className="jlceda-sidebar-section">
                <h3>📊 评估概览</h3>
                <div className="evaluation-summary">
                  <div className="eval-item">
                    <span className="eval-label">技术可行性</span>
                    <div className="eval-bar">
                      <div 
                        className={`eval-fill ${evaluation.technicalFeasibility.complexity}`}
                        style={{ width: evaluation.technicalFeasibility.complexity === 'low' ? '90%' : 
                                 evaluation.technicalFeasibility.complexity === 'medium' ? '70%' : 
                                 evaluation.technicalFeasibility.complexity === 'high' ? '50%' : '30%' }}
                      />
                    </div>
                  </div>
                  <div className="eval-item">
                    <span className="eval-label">BOM成本</span>
                    <span className="eval-value">${evaluation.costAnalysis.bomCost.toFixed(2)}</span>
                  </div>
                  <div className="eval-item">
                    <span className="eval-label">供应链风险</span>
                    <span className={`eval-risk ${evaluation.riskAssessment.supplyRisk}`}>
                      {evaluation.riskAssessment.supplyRisk === 'low' ? '低' :
                       evaluation.riskAssessment.supplyRisk === 'medium' ? '中' :
                       evaluation.riskAssessment.supplyRisk === 'high' ? '高' : '严重'}
                    </span>
                  </div>
                  <div className="eval-item">
                    <span className="eval-label">PCB层数</span>
                    <span className="eval-value">{evaluation.productionEvaluation.pcbLayers} 层</span>
                  </div>
                </div>
              </div>

              {/* 优化建议 */}
              {evaluation.optimizationSuggestions.length > 0 && (
                <div className="jlceda-sidebar-section">
                  <h3>💡 优化建议</h3>
                  <div className="optimization-list">
                    {evaluation.optimizationSuggestions.slice(0, 3).map(suggestion => (
                      <div key={suggestion.id} className="optimization-item">
                        <div className="opt-category">{suggestion.category}</div>
                        <div className="opt-title">{suggestion.title}</div>
                        <div className="opt-desc">{suggestion.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        <main className="jlceda-canvas-container">
          <div
            ref={canvasRef}
            className="jlceda-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <motion.div
              className="jlceda-sheet"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              <svg
                viewBox={`0 0 ${JLCEDA_STYLE.paper.A4.width} ${JLCEDA_STYLE.paper.A4.height}`}
                style={{ width: JLCEDA_STYLE.paper.A4.width, height: JLCEDA_STYLE.paper.A4.height }}
              >
                <defs>
                  <pattern id="jlceda-grid" width={JLCEDA_STYLE.sizes.grid} height={JLCEDA_STYLE.sizes.grid} patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.3" />
                  </pattern>
                  <pattern id="jlceda-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#jlceda-grid)" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke={JLCEDA_STYLE.colors.gridMajor} strokeWidth="0.5" />
                  </pattern>
                </defs>

                <rect
                  x="10"
                  y="10"
                  width={JLCEDA_STYLE.paper.A4.width - 20}
                  height={JLCEDA_STYLE.paper.A4.height - 20}
                  fill={JLCEDA_STYLE.colors.background}
                  stroke={JLCEDA_STYLE.colors.titleBlock.border}
                  strokeWidth="1"
                />

                <rect
                  x="20"
                  y="20"
                  width={JLCEDA_STYLE.paper.A4.width - 40}
                  height={JLCEDA_STYLE.paper.A4.height - 40}
                  fill="url(#jlceda-grid-major)"
                />

                <rect
                  x="15"
                  y="15"
                  width={JLCEDA_STYLE.paper.A4.width - 30}
                  height={JLCEDA_STYLE.paper.A4.height - 30}
                  fill="none"
                  stroke={JLCEDA_STYLE.colors.titleBlock.border}
                  strokeWidth="2"
                />

                {renderRegions()}
                {renderWires()}
                {renderNetLabels()}
                
                {renderPowerSymbol(90, 90, '5V')}
                {renderPowerSymbol(330, 90, '3V3')}
                {renderGroundSymbol(80, 200)}
                {renderGroundSymbol(240, 200)}
                {renderGroundSymbol(320, 300)}
                {renderGroundSymbol(320, 430)}
                {renderGroundSymbol(700, 430)}

                {components.map(comp => renderJLCComponent(comp))}
                {renderTitleBlock()}
              </svg>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
