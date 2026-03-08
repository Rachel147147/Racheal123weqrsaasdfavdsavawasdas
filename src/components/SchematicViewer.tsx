import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, RotateCcw, Download, ArrowLeft, CheckCircle,
  Move, MousePointer, X, FileImage, File, ChevronDown
} from 'lucide-react';
import { AITechnicalSolution } from '../services/deepseekAI';
import { JLCEDA_STYLE, getSymbolById, JLCSymbol } from '../services/jlcedaStyle';
import { GuideTip, Tooltip, HelpIcon } from './common';
import './SchematicViewer.css';

interface SchematicViewerProps {
  schematicData: any;
  hardwareSolution: AITechnicalSolution | null;
  onBack: () => void;
  onComplete: () => void;
}

interface PlacedComponent {
  id: string;
  symbol: JLCSymbol;
  x: number;
  y: number;
  refDes: string;
  value: string;
  componentSpec?: any;
  moduleId?: string;
}

interface Wire {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'signal' | 'power' | 'ground';
}

interface NetLabel {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
}

type ExportFormat = 'png' | 'jpg';
type Resolution = '1x' | '2x' | '4x';

const RESOLUTION_OPTIONS: { value: Resolution; label: string; scale: number }[] = [
  { value: '1x', label: '标准 (1x)', scale: 1 },
  { value: '2x', label: '高清 (2x)', scale: 2 },
  { value: '4x', label: '超高清 (4x)', scale: 4 },
];

export default function SchematicViewer({
  schematicData,
  hardwareSolution,
  onBack,
  onComplete
}: SchematicViewerProps) {
  // 如果没有硬件方案数据，显示加载状态
  if (!hardwareSolution) {
    return (
      <div className="schematic-viewer-container">
        <div className="no-data-container">
          <div className="no-data-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h2>正在加载原理图...</h2>
          <p>请先完成硬件方案生成步骤</p>
          <button className="back-to-solution-btn" onClick={onBack}>
            返回硬件方案
          </button>
        </div>
      </div>
    );
  }
  
  // 缩放和平移状态
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 原理图数据状态
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [netLabels, setNetLabels] = useState<NetLabel[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('正在初始化...');
  
  // 弹窗状态
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportResolution, setExportResolution] = useState<Resolution>('2x');
  const [isExporting, setIsExporting] = useState(false);
  
  // 选中状态
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const panStep = 50;
      switch (e.key) {
        case 'ArrowUp':
          setPan(prev => ({ ...prev, y: prev.y + panStep }));
          break;
        case 'ArrowDown':
          setPan(prev => ({ ...prev, y: prev.y - panStep }));
          break;
        case 'ArrowLeft':
          setPan(prev => ({ ...prev, x: prev.x + panStep }));
          break;
        case 'ArrowRight':
          setPan(prev => ({ ...prev, x: prev.x - panStep }));
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(3, prev + 0.1));
          break;
        case '-':
          setZoom(prev => Math.max(0.5, prev - 0.1));
          break;
        case '0':
          setZoom(1);
          setPan({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // 生成原理图
  useEffect(() => {
    generateSchematic();
  }, [hardwareSolution]);

  const generateSchematic = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('正在初始化...');

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(10);
    setGenerationStatus('分析硬件方案...');

    const placed: PlacedComponent[] = [];
    const wireList: Wire[] = [];
    const nets: NetLabel[] = [];

    let refDesCounter = { U: 1, R: 1, C: 1, L: 1, J: 1, Y: 1, D: 1, Q: 1, SW: 1, F: 1 };

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
    const cpuName = hardwareSolution.systemArchitecture.cpu;
    const mcuSymbol = getSymbolById('stm32f103c8t6') || getSymbolById('esp32_wroom');
    if (mcuSymbol) {
      const refDes = `U${refDesCounter.U++}`;
      placed.push({
        id: 'mcu_main',
        symbol: mcuSymbol,
        x: positions.mcu.x,
        y: positions.mcu.y,
        refDes,
        value: cpuName,
        moduleId: 'mcu'
      });
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(45);
    setGenerationStatus('布局电源和外围电路...');

    // 处理电源模块
    const powerSupply = hardwareSolution.systemArchitecture.powerSupply;
    const powerSymbol = getSymbolById('ams1117_33');
    if (powerSymbol) {
      const refDes = `U${refDesCounter.U++}`;
      placed.push({
        id: 'power_main',
        symbol: powerSymbol,
        x: positions.power.x,
        y: positions.power.y,
        refDes,
        value: powerSupply,
        moduleId: 'power'
      });
    }

    // 处理元器件列表
    const componentList = hardwareSolution.componentList;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(60);
    setGenerationStatus('添加元器件...');

    let offsetX = 0;
    let offsetY = 0;
    
    componentList.forEach((comp, index) => {
      let symbol: JLCSymbol | undefined;
      let refDes = '';
      
      switch (comp.category) {
        case 'processor':
          symbol = getSymbolById('stm32f103c8t6');
          refDes = `U${refDesCounter.U++}`;
          break;
        case 'memory':
          symbol = getSymbolById('memory_soic8');
          refDes = `U${refDesCounter.U++}`;
          break;
        case 'power':
          symbol = getSymbolById('ams1117_33');
          refDes = `U${refDesCounter.U++}`;
          break;
        case 'peripheral':
          symbol = getSymbolById('header_ph_4');
          refDes = `J${refDesCounter.J++}`;
          break;
        default:
          symbol = getSymbolById('resistor_0805');
          refDes = `R${refDesCounter.R++}`;
      }

      if (symbol) {
        const x = 150 + (index % 4) * 180;
        const y = 450 + Math.floor(index / 4) * 80;
        
        placed.push({
          id: `comp_${index}`,
          symbol,
          x,
          y,
          refDes,
          value: comp.partNumber || comp.name,
          componentSpec: comp,
          moduleId: comp.category
        });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    setGenerationProgress(75);
    setGenerationStatus('添加去耦电容和偏置电阻...');

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

    await new Promise(resolve => setTimeout(resolve, 200));
    setGenerationProgress(90);
    setGenerationStatus('生成连线和网络标签...');

    // 生成连线
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
    );

    // 生成网络标签
    nets.push(
      { id: 'net_vcc5', name: 'VCC_5V', x: 80, y: 110, type: 'power' },
      { id: 'net_vcc33', name: 'VCC_3V3', x: 360, y: 110, type: 'power' },
      { id: 'net_gnd1', name: 'GND', x: 70, y: 220, type: 'ground' },
      { id: 'net_gnd2', name: 'GND', x: 250, y: 220, type: 'ground' },
      { id: 'net_reset', name: 'NRST', x: 160, y: 265, type: 'signal' },
      { id: 'net_boot0', name: 'BOOT0', x: 300, y: 265, type: 'signal' },
    );

    setComponents(placed);
    setWires(wireList);
    setNetLabels(nets);

    await new Promise(resolve => setTimeout(resolve, 300));
    setGenerationProgress(100);
    setGenerationStatus('原理图生成完成！');

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsGenerating(false);
  };

  // 鼠标事件处理
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

  // 缩放控制
  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.1));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.1));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 导出功能
  const handleExport = async () => {
    if (!svgRef.current) return;
    
    setIsExporting(true);
    
    try {
      const svg = svgRef.current;
      const scale = RESOLUTION_OPTIONS.find(r => r.value === exportResolution)?.scale || 2;
      const width = JLCEDA_STYLE.paper.A4.width * scale;
      const height = JLCEDA_STYLE.paper.A4.height * scale;
      
      // 创建canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }
      
      // 填充背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // 将SVG转换为图片
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        
        // 导出图片
        const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
        const quality = exportFormat === 'jpg' ? 0.95 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        const link = document.createElement('a');
        link.download = `schematic_${Date.now()}.${exportFormat}`;
        link.href = dataUrl;
        link.click();
        
        setIsExporting(false);
        setShowExportModal(false);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsExporting(false);
        alert('导出失败，请重试');
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      alert('导出失败，请重试');
    }
  };

  // 完成流程
  const handleComplete = () => {
    setShowSuccessModal(true);
  };

  // 渲染元器件
  const renderJLCComponent = (comp: PlacedComponent) => {
    const { symbol, x, y, refDes, value } = comp;
    const isSelected = selectedComponent === comp.id;

    return (
      <g
        key={comp.id}
        transform={`translate(${x}, ${y})`}
        onClick={() => setSelectedComponent(comp.id)}
        style={{ cursor: 'pointer' }}
        className={isSelected ? 'component-selected' : ''}
      >
        {isSelected && (
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
                </g>
              );
            })}
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

  // 渲染标题栏
  const renderTitleBlock = () => {
    const tbWidth = JLCEDA_STYLE.sizes.titleBlock.width;
    const tbHeight = JLCEDA_STYLE.sizes.titleBlock.height;
    const tbX = JLCEDA_STYLE.paper.A4.width - tbWidth - 20;
    const tbY = JLCEDA_STYLE.paper.A4.height - tbHeight - 20;
    const today = new Date().toISOString().slice(0, 10);
    const projectName = hardwareSolution.systemArchitecture.cpu || '硬件设计项目';

    return (
      <g transform={`translate(${tbX}, ${tbY})`}>
        <rect x={0} y={0} width={tbWidth} height={tbHeight} fill="#ffffff" stroke="#ff0000" strokeWidth="1.5" />
        
        <line x1={tbWidth * 0.20} y1={0} x2={tbWidth * 0.20} y2={tbHeight} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.22} x2={tbWidth} y2={tbHeight * 0.22} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.42} x2={tbWidth} y2={tbHeight * 0.42} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.62} x2={tbWidth} y2={tbHeight * 0.62} stroke="#ff0000" strokeWidth="0.75" />
        <line x1={0} y1={tbHeight * 0.82} x2={tbWidth} y2={tbHeight * 0.82} stroke="#ff0000" strokeWidth="0.75" />
        
        <text x={tbWidth * 0.10} y={tbHeight * 0.14} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="16" fontWeight="bold" fill="#000000">原理图</text>
        
        <text x={tbWidth * 0.28} y={tbHeight * 0.08} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">创建日期</text>
        <text x={tbWidth * 0.28} y={tbHeight * 0.18} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">{today}</text>
        
        <text x={tbWidth * 0.80} y={tbHeight * 0.08} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">版本</text>
        <text x={tbWidth * 0.80} y={tbHeight * 0.18} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">V1.0</text>
        
        <text x={tbWidth * 0.28} y={tbHeight * 0.32} textAnchor="start" fontFamily="SimSun, sans-serif" fontSize="9" fill="#000000">项目名称</text>
        <text x={tbWidth * 0.28} y={tbHeight * 0.39} textAnchor="start" fontFamily="SimHei, sans-serif" fontSize="12" fontWeight="bold" fill="#000000">{projectName}</text>
        
        <text x={tbWidth * 0.55} y={tbHeight * 0.75} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="14" fontWeight="bold" fill="#000000">{projectName}</text>
        
        <text x={tbWidth * 0.32} y={tbHeight * 0.89} textAnchor="middle" fontFamily="SimSun, sans-serif" fontSize="8" fill="#000000">图纸编号</text>
        <text x={tbWidth * 0.47} y={tbHeight * 0.89} textAnchor="middle" fontFamily="SimSun, sans-serif" fontSize="8" fill="#000000">尺寸</text>
        
        <text x={tbWidth * 0.32} y={tbHeight * 0.96} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">SCH001</text>
        <text x={tbWidth * 0.47} y={tbHeight * 0.96} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#000000">A4</text>
        
        <text x={tbWidth * 0.88} y={tbHeight * 0.93} textAnchor="middle" fontFamily="SimHei, sans-serif" fontSize="10" fontWeight="bold" fill="#6366f1">嘉立创EDA</text>
      </g>
    );
  };

  // 渲染网络标签
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

  // 渲染接地符号
  const renderGroundSymbol = (x: number, y: number) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={-12} y1={0} x2={12} y2={0} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
      <line x1={-8} y1={8} x2={8} y2={8} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
      <line x1={-4} y1={16} x2={4} y2={16} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
      <line x1={0} y1={-10} x2={0} y2={0} stroke={JLCEDA_STYLE.colors.wires.ground} strokeWidth="2" />
    </g>
  );

  // 渲染电源符号
  const renderPowerSymbol = (x: number, y: number, label: string) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={0} y1={-15} x2={0} y2={0} stroke={JLCEDA_STYLE.colors.wires.power} strokeWidth="2" />
      <circle r="10" fill={JLCEDA_STYLE.colors.components.fill} stroke={JLCEDA_STYLE.colors.wires.power} strokeWidth="2" />
      <text y={4} textAnchor="middle" fontFamily={JLCEDA_STYLE.fonts.fixed} fontSize="10" fontWeight="bold" fill={JLCEDA_STYLE.colors.wires.power}>{label}</text>
    </g>
  );

  // 渲染连线
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

  // 渲染区域
  const renderRegions = () => {
    return (
      <g>
        <rect x="30" y="60" width="240" height="220" fill={JLCEDA_STYLE.colors.regions.power} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="40" y="85" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">电源管理电路</text>
        
        <rect x="30" y="300" width="340" height="360" fill={JLCEDA_STYLE.colors.regions.mcu} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="40" y="325" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">MCU最小系统</text>
        
        <rect x="560" y="60" width="220" height="240" fill={JLCEDA_STYLE.colors.regions.interface} stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.8" strokeDasharray="4,4" rx="8" />
        <text x="570" y="85" fontFamily={JLCEDA_STYLE.fonts.default} fontSize="11" fill="#666666" fontWeight="bold">接口与外设</text>
      </g>
    );
  };

  return (
    <div className="schematic-viewer-container">
      {/* 生成进度遮罩 */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="generation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="generation-modal">
              <div className="generation-icon">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 头部工具栏 */}
      <header className="schematic-header">
        <div className="header-left">
          <button className="header-btn back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>返回修改</span>
          </button>
          <div className="project-info">
            <h1 className="project-name">{hardwareSolution.systemArchitecture.cpu}</h1>
            <span className="project-status">
              <CheckCircle size={12} />
              {isGenerating ? '正在生成...' : '原理图已生成'}
            </span>
          </div>
        </div>

        <div className="header-center">
          <div className="zoom-controls">
            <Tooltip content="缩小视图 (快捷键: -)" position="bottom">
              <button className="zoom-btn" onClick={handleZoomOut}>
                <ZoomOut size={16} />
              </button>
            </Tooltip>
            <div className="zoom-display">
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Tooltip content="放大视图 (快捷键: +)" position="bottom">
              <button className="zoom-btn" onClick={handleZoomIn}>
                <ZoomIn size={16} />
              </button>
            </Tooltip>
            <Tooltip content="重置视图 (快捷键: 0)" position="bottom">
              <button className="zoom-btn" onClick={handleResetView}>
                <RotateCcw size={16} />
              </button>
            </Tooltip>
          </div>
          <div className="view-controls">
            <Tooltip content="平移模式：拖动移动视图" position="bottom">
              <button className="view-btn">
                <Move size={16} />
              </button>
            </Tooltip>
            <Tooltip content="选择模式：点击选择元器件" position="bottom">
              <button className="view-btn">
                <MousePointer size={16} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="header-right">
          <button className="header-btn export-btn" onClick={() => setShowExportModal(true)}>
            <Download size={18} />
            <span>下载原理图</span>
          </button>
          <button className="header-btn complete-btn" onClick={handleComplete}>
            <CheckCircle size={18} />
            <span>完成</span>
          </button>
        </div>
      </header>

      {/* 操作提示 */}
      <div className="guide-tip-container">
        <GuideTip type="tip" title="操作提示">
          使用<strong>鼠标滚轮</strong>缩放视图，<strong>鼠标拖动</strong>平移视图。
          点击元器件可查看详情，点击"下载原理图"可导出图片文件。
        </GuideTip>
      </div>

      {/* 主内容区 */}
      <div className="schematic-main">
        {/* 侧边栏 */}
        <aside className="schematic-sidebar">
          <div className="sidebar-section">
            <h3>系统架构</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">处理器</span>
                <span className="info-value">{hardwareSolution.systemArchitecture.cpu}</span>
              </div>
              <div className="info-item">
                <span className="info-label">内存</span>
                <span className="info-value">{hardwareSolution.systemArchitecture.memory}</span>
              </div>
              <div className="info-item">
                <span className="info-label">存储</span>
                <span className="info-value">{hardwareSolution.systemArchitecture.storage}</span>
              </div>
              <div className="info-item">
                <span className="info-label">电源</span>
                <span className="info-value">{hardwareSolution.systemArchitecture.powerSupply}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>元器件清单</h3>
            <div className="component-list">
              {hardwareSolution.componentList.slice(0, 10).map((comp, index) => (
                <div key={index} className="component-item">
                  <div className="component-name">{comp.name}</div>
                  <div className="component-detail">
                    <span className="component-part">{comp.partNumber}</span>
                    <span className="component-cost">${comp.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {hardwareSolution.componentList.length > 10 && (
                <div className="component-more">
                  还有 {hardwareSolution.componentList.length - 10} 个元器件...
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>
              操作提示
              <HelpIcon 
                content={
                  <div>
                    <p><strong>快捷键操作：</strong></p>
                    <ul>
                      <li><strong>鼠标滚轮</strong> - 缩放视图</li>
                      <li><strong>鼠标拖动</strong> - 平移视图</li>
                      <li><strong>方向键</strong> - 平移视图</li>
                      <li><strong>+/- 键</strong> - 缩放</li>
                      <li><strong>0 键</strong> - 重置视图</li>
                    </ul>
                  </div>
                }
                title="操作帮助"
                variant="modal"
                position="left"
              />
            </h3>
            <div className="tips-list">
              <div className="tip-item">鼠标滚轮: 缩放视图</div>
              <div className="tip-item">鼠标拖动: 平移视图</div>
              <div className="tip-item">方向键: 平移视图</div>
              <div className="tip-item">+/- 键: 缩放</div>
              <div className="tip-item">0 键: 重置视图</div>
            </div>
          </div>
        </aside>

        {/* 原理图画布 */}
        <main className="schematic-canvas-container">
          <div
            ref={canvasRef}
            className="schematic-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <motion.div
              className="schematic-sheet"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${JLCEDA_STYLE.paper.A4.width} ${JLCEDA_STYLE.paper.A4.height}`}
                style={{ width: JLCEDA_STYLE.paper.A4.width, height: JLCEDA_STYLE.paper.A4.height }}
              >
                <defs>
                  <pattern id="grid" width={JLCEDA_STYLE.sizes.grid} height={JLCEDA_STYLE.sizes.grid} patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke={JLCEDA_STYLE.colors.grid} strokeWidth="0.3" />
                  </pattern>
                  <pattern id="grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#grid)" />
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
                  fill="url(#grid-major)"
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

                {components.map(comp => renderJLCComponent(comp))}
                {renderTitleBlock()}
              </svg>
            </motion.div>
          </div>
        </main>
      </div>

      {/* 导出弹窗 */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              className="export-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>下载原理图</h2>
                <button className="modal-close" onClick={() => setShowExportModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="export-option">
                  <label>导出格式</label>
                  <div className="format-options">
                    <button
                      className={`format-btn ${exportFormat === 'png' ? 'active' : ''}`}
                      onClick={() => setExportFormat('png')}
                    >
                      <FileImage size={20} />
                      <span>PNG</span>
                    </button>
                    <button
                      className={`format-btn ${exportFormat === 'jpg' ? 'active' : ''}`}
                      onClick={() => setExportFormat('jpg')}
                    >
                      <File size={20} />
                      <span>JPG</span>
                    </button>
                  </div>
                </div>

                <div className="export-option">
                  <label>分辨率</label>
                  <div className="resolution-select">
                    <button className="select-btn">
                      {RESOLUTION_OPTIONS.find(r => r.value === exportResolution)?.label}
                      <ChevronDown size={16} />
                    </button>
                    <div className="select-dropdown">
                      {RESOLUTION_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          className={`dropdown-item ${exportResolution === option.value ? 'active' : ''}`}
                          onClick={() => setExportResolution(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="export-preview">
                  <div className="preview-info">
                    <span>预计输出尺寸:</span>
                    <span>
                      {JLCEDA_STYLE.paper.A4.width * (RESOLUTION_OPTIONS.find(r => r.value === exportResolution)?.scale || 2)} x {' '}
                      {JLCEDA_STYLE.paper.A4.height * (RESOLUTION_OPTIONS.find(r => r.value === exportResolution)?.scale || 2)} 像素
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowExportModal(false)}>
                  取消
                </button>
                <button
                  className="btn-export"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? '导出中...' : '导出'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成功提示弹窗 */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="success-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="success-icon">
                <CheckCircle size={64} />
              </div>
              <h2>硬件方案设计已完成</h2>
              <p>原理图已成功生成，您可以下载原理图或返回修改。</p>
              <div className="success-actions">
                <button className="btn-back" onClick={() => setShowSuccessModal(false)}>
                  继续查看
                </button>
                <button className="btn-complete" onClick={onComplete}>
                  确认完成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
