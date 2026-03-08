export interface MCUDatabaseEntry {
  id: string;
  manufacturer: string;
  family: string;
  series: string;
  partNumber: string;
  cores: number;
  architecture: 'ARM Cortex-M' | 'RISC-V' | 'AVR' | 'PIC' | '8051';
  clockSpeed: number;
  flashSize: number;
  ramSize: number;
  eepromSize: number;
  voltageMin: number;
  voltageMax: number;
  packages: string[];
  ioPins: number;
  adcChannels: number;
  adcResolution: number;
  dacChannels: number;
  pwmChannels: number;
  timers: number;
  uartCount: number;
  spiCount: number;
  i2cCount: number;
  canCount: number;
  usbCount: number;
  ethernetCount: number;
  ble: boolean;
  wifi: boolean;
  priceUSD: number;
  packageOptions: { name: string; pins: number; footprint: string }[];
  pinout: PinDefinition[];
  features: string[];
  applicationAreas: string[];
  jlcpcbInStock: boolean;
  jlcpcbPartNumber?: string;
}

export interface PinDefinition {
  pinNumber: number | string;
  name: string;
  type: 'VCC' | 'GND' | 'GPIO' | 'ADC' | 'DAC' | 'PWM' | 'UART' | 'SPI' | 'I2C' | 'CAN' | 'USB' | 'RST' | 'OSC';
  alternateFunctions: string[];
  voltageTolerance: string;
  package: string;
}

export const MCU_DATABASE: MCUDatabaseEntry[] = [
  {
    id: 'stm32f103c8t6',
    manufacturer: 'STMicroelectronics',
    family: 'STM32',
    series: 'STM32F1',
    partNumber: 'STM32F103C8T6',
    cores: 1,
    architecture: 'ARM Cortex-M',
    clockSpeed: 72,
    flashSize: 64,
    ramSize: 20,
    eepromSize: 0,
    voltageMin: 2.0,
    voltageMax: 3.6,
    packages: ['LQFP48', 'TSSOP28', 'WLCSP36'],
    ioPins: 37,
    adcChannels: 12,
    adcResolution: 12,
    dacChannels: 0,
    pwmChannels: 8,
    timers: 7,
    uartCount: 3,
    spiCount: 2,
    i2cCount: 2,
    canCount: 1,
    usbCount: 0,
    ethernetCount: 0,
    ble: false,
    wifi: false,
    priceUSD: 1.8,
    packageOptions: [
      { name: 'LQFP48', pins: 48, footprint: 'LQFP-48_7x7mm_P0.5mm' },
      { name: 'TSSOP28', pins: 28, footprint: 'TSSOP-28_4.4x9.7mm_P0.65mm' },
    ],
    pinout: [],
    features: ['72MHz Cortex-M3', '64KB Flash', '20KB RAM', '2 SPI', '2 I2C', '3 UART', '1 CAN', '12x12bit ADC'],
    applicationAreas: ['IoT', 'Industrial', 'Consumer', 'Motor Control'],
    jlcpcbInStock: true,
    jlcpcbPartNumber: 'C8281',
  },
  {
    id: 'stm32f407vet6',
    manufacturer: 'STMicroelectronics',
    family: 'STM32',
    series: 'STM32F4',
    partNumber: 'STM32F407VET6',
    cores: 1,
    architecture: 'ARM Cortex-M',
    clockSpeed: 168,
    flashSize: 512,
    ramSize: 192,
    eepromSize: 0,
    voltageMin: 1.8,
    voltageMax: 3.6,
    packages: ['LQFP100', 'LQFP144', 'WLCSP64'],
    ioPins: 82,
    adcChannels: 16,
    adcResolution: 12,
    dacChannels: 2,
    pwmChannels: 17,
    timers: 17,
    uartCount: 6,
    spiCount: 3,
    i2cCount: 3,
    canCount: 2,
    usbCount: 1,
    ethernetCount: 1,
    ble: false,
    wifi: false,
    priceUSD: 8.5,
    packageOptions: [
      { name: 'LQFP100', pins: 100, footprint: 'LQFP-100_14x14mm_P0.5mm' },
    ],
    pinout: [],
    features: ['168MHz Cortex-M4F', '512KB Flash', '192KB RAM', 'FPU', '2 CAN', '1 USB OTG', '1 Ethernet', '2x12bit DAC', '17x12bit ADC'],
    applicationAreas: ['Industrial', 'High Performance', 'Ethernet', 'Motor Control'],
    jlcpcbInStock: true,
    jlcpcbPartNumber: 'C9666',
  },
  {
    id: 'esp32-wroom-32',
    manufacturer: 'Espressif',
    family: 'ESP32',
    series: 'ESP32',
    partNumber: 'ESP32-WROOM-32',
    cores: 2,
    architecture: 'RISC-V',
    clockSpeed: 240,
    flashSize: 4096,
    ramSize: 520,
    eepromSize: 0,
    voltageMin: 3.0,
    voltageMax: 3.6,
    packages: ['Module'],
    ioPins: 30,
    adcChannels: 18,
    adcResolution: 12,
    dacChannels: 2,
    pwmChannels: 16,
    timers: 10,
    uartCount: 3,
    spiCount: 4,
    i2cCount: 2,
    canCount: 0,
    usbCount: 0,
    ethernetCount: 0,
    ble: true,
    wifi: true,
    priceUSD: 4.2,
    packageOptions: [
      { name: 'Module', pins: 38, footprint: 'ESP32-WROOM-32' },
    ],
    pinout: [],
    features: ['240MHz Dual Core', '4MB Flash', '520KB RAM', 'WiFi 802.11b/g/n', 'BLE 4.2', '18x12bit ADC', '2x8bit DAC', '4 SPI', '2 I2C', '3 UART'],
    applicationAreas: ['IoT', 'WiFi', 'BLE', 'Smart Home', 'Wireless'],
    jlcpcbInStock: true,
    jlcpcbPartNumber: 'C2700',
  },
  {
    id: 'nrf52832',
    manufacturer: 'Nordic Semiconductor',
    family: 'nRF52',
    series: 'nRF52',
    partNumber: 'nRF52832',
    cores: 1,
    architecture: 'ARM Cortex-M',
    clockSpeed: 64,
    flashSize: 512,
    ramSize: 64,
    eepromSize: 0,
    voltageMin: 1.7,
    voltageMax: 3.6,
    packages: ['QFN48', 'WLCSP49'],
    ioPins: 32,
    adcChannels: 8,
    adcResolution: 12,
    dacChannels: 0,
    pwmChannels: 4,
    timers: 6,
    uartCount: 1,
    spiCount: 3,
    i2cCount: 2,
    canCount: 0,
    usbCount: 0,
    ethernetCount: 0,
    ble: true,
    wifi: false,
    priceUSD: 3.8,
    packageOptions: [
      { name: 'QFN48', pins: 48, footprint: 'QFN-48_6x6mm_P0.5mm' },
    ],
    pinout: [],
    features: ['64MHz Cortex-M4F', '512KB Flash', '64KB RAM', 'BLE 5.0', 'NFC', '8x12bit ADC', '3 SPI', '2 I2C'],
    applicationAreas: ['BLE', 'Wearables', 'Healthcare', 'Beacons'],
    jlcpcbInStock: true,
    jlcpcbPartNumber: 'C9752',
  },
  {
    id: 'atmega328p',
    manufacturer: 'Microchip',
    family: 'AVR',
    series: 'ATmega',
    partNumber: 'ATmega328P',
    cores: 1,
    architecture: 'AVR',
    clockSpeed: 20,
    flashSize: 32,
    ramSize: 2,
    eepromSize: 1,
    voltageMin: 1.8,
    voltageMax: 5.5,
    packages: ['DIP28', 'TQFP32', 'QFN32'],
    ioPins: 23,
    adcChannels: 6,
    adcResolution: 10,
    dacChannels: 0,
    pwmChannels: 6,
    timers: 3,
    uartCount: 1,
    spiCount: 1,
    i2cCount: 1,
    canCount: 0,
    usbCount: 0,
    ethernetCount: 0,
    ble: false,
    wifi: false,
    priceUSD: 2.2,
    packageOptions: [
      { name: 'DIP28', pins: 28, footprint: 'DIP-28_W7.62mm' },
      { name: 'TQFP32', pins: 32, footprint: 'TQFP-32_7x7mm_P0.8mm' },
    ],
    pinout: [],
    features: ['20MHz AVR', '32KB Flash', '2KB RAM', '1KB EEPROM', '6x10bit ADC', '6 PWM', '1 SPI', '1 I2C', '1 UART'],
    applicationAreas: ['Education', 'Simple IoT', 'Hobby', 'Arduino'],
    jlcpcbInStock: true,
    jlcpcbPartNumber: 'C8266',
  },
  {
    id: 'rp2040',
    manufacturer: 'Raspberry Pi',
    family: 'RP2040',
    series: 'RP2040',
    partNumber: 'RP2040',
    cores: 2,
    architecture: 'RISC-V',
    clockSpeed: 133,
    flashSize: 0,
    ramSize: 264,
    eepromSize: 0,
    voltageMin: 1.8,
    voltageMax: 5.5,
    packages: ['QFN56'],
    ioPins: 30,
    adcChannels: 4,
    adcResolution: 12,
    dacChannels: 0,
    pwmChannels: 16,
    timers: 8,
    uartCount: 2,
    spiCount: 2,
    i2cCount: 2,
    canCount: 0,
    usbCount: 1,
    ethernetCount: 0,
    ble: false,
    wifi: false,
    priceUSD: 1.0,
    packageOptions: [
      { name: 'QFN56', pins: 56, footprint: 'QFN-56_7x7mm_P0.4mm' },
    ],
    pinout: [],
    features: ['133MHz Dual Core', '264KB SRAM', 'External QSPI Flash', '4x12bit ADC', '16 PWM', '2 SPI', '2 I2C', '2 UART', '8 PIO State Machines'],
    applicationAreas: ['Hobby', 'Education', 'Simple IoT', 'Pico'],
    jlcpcbInStock: true,
    jlcpcbPartNumber: 'C111589',
  },
];

export function findBestMCU(requirements: {
  minClockSpeed?: number;
  minFlashSize?: number;
  minRamSize?: number;
  requiresADC?: boolean;
  requiresDAC?: boolean;
  requiresPWM?: boolean;
  uartCount?: number;
  spiCount?: number;
  i2cCount?: number;
  canCount?: number;
  requiresUSB?: boolean;
  requiresEthernet?: boolean;
  requiresBLE?: boolean;
  requiresWiFi?: boolean;
  requiresCAN?: boolean;
  budgetUSD?: number;
  preferredArchitecture?: string;
  voltageMin?: number;
  voltageMax?: number;
}): MCUDatabaseEntry | null {
  let candidates = [...MCU_DATABASE];

  candidates = candidates.filter(mcu => {
    if (requirements.minClockSpeed && mcu.clockSpeed < requirements.minClockSpeed) return false;
    if (requirements.minFlashSize && mcu.flashSize < requirements.minFlashSize) return false;
    if (requirements.minRamSize && mcu.ramSize < requirements.minRamSize) return false;
    if (requirements.requiresADC && mcu.adcChannels === 0) return false;
    if (requirements.requiresDAC && mcu.dacChannels === 0) return false;
    if (requirements.requiresPWM && mcu.pwmChannels === 0) return false;
    if (requirements.uartCount && mcu.uartCount < requirements.uartCount) return false;
    if (requirements.spiCount && mcu.spiCount < requirements.spiCount) return false;
    if (requirements.i2cCount && mcu.i2cCount < requirements.i2cCount) return false;
    if (requirements.canCount && mcu.canCount < requirements.canCount) return false;
    if (requirements.requiresUSB && mcu.usbCount === 0) return false;
    if (requirements.requiresEthernet && mcu.ethernetCount === 0) return false;
    if (requirements.requiresBLE && !mcu.ble) return false;
    if (requirements.requiresWiFi && !mcu.wifi) return false;
    if (requirements.budgetUSD && mcu.priceUSD > requirements.budgetUSD) return false;
    if (requirements.preferredArchitecture && mcu.architecture !== requirements.preferredArchitecture) return false;
    if (requirements.voltageMin && mcu.voltageMin > requirements.voltageMin) return false;
    if (requirements.voltageMax && mcu.voltageMax < requirements.voltageMax) return false;
    if (!mcu.jlcpcbInStock) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    scoreA += a.flashSize * 0.3 + a.ramSize * 0.2;
    scoreB += b.flashSize * 0.3 + b.ramSize * 0.2;

    scoreA += (requirements.budgetUSD ? (requirements.budgetUSD - a.priceUSD) : (5 - a.priceUSD)) * 0.4;
    scoreB += (requirements.budgetUSD ? (requirements.budgetUSD - b.priceUSD) : (5 - b.priceUSD)) * 0.4;

    scoreA += (a.jlcpcbInStock ? 50 : 0);
    scoreB += (b.jlcpcbInStock ? 50 : 0);

    return scoreB - scoreA;
  });

  return candidates[0];
}

export function getRequirementAnalysis(requirements: {
  performance?: 'low' | 'medium' | 'high';
  application?: string;
  features?: string[];
  budget?: string;
}): {
  mcuCriteria: {
    minClockSpeed: number;
    minFlashSize: number;
    minRamSize: number;
    requiresBLE: boolean;
    requiresWiFi: boolean;
    requiresEthernet: boolean;
    requiresCAN: boolean;
    requiresUSB: boolean;
    budgetUSD: number;
  };
  peripherals: {
    adc: boolean;
    dac: boolean;
    pwm: boolean;
    uart: number;
    spi: number;
    i2c: number;
    gpio: number;
  };
} {
  let minClockSpeed = 48;
  let minFlashSize = 32;
  let minRamSize = 8;
  let requiresBLE = false;
  let requiresWiFi = false;
  let requiresEthernet = false;
  let requiresCAN = false;
  let requiresUSB = false;
  let budgetUSD = 5;

  if (requirements.performance === 'medium') {
    minClockSpeed = 72;
    minFlashSize = 64;
    minRamSize = 20;
  } else if (requirements.performance === 'high') {
    minClockSpeed = 168;
    minFlashSize = 256;
    minRamSize = 128;
    budgetUSD = 10;
  }

  if (requirements.application === 'iot' || requirements.application === 'wireless') {
    requiresBLE = true;
    requiresWiFi = true;
    minFlashSize = Math.max(minFlashSize, 512);
    minRamSize = Math.max(minRamSize, 64);
  }

  if (requirements.application === 'industrial' || requirements.application === 'automotive') {
    requiresCAN = true;
    minFlashSize = Math.max(minFlashSize, 128);
  }

  if (requirements.application === 'consumer' || requirements.budget === 'low') {
    budgetUSD = Math.min(budgetUSD, 3);
  }

  if (requirements.features?.includes('display') || requirements.features?.includes('graphic')) {
    requiresUSB = true;
    minFlashSize = Math.max(minFlashSize, 256);
  }

  if (requirements.features?.includes('network') || requirements.features?.includes('ethernet')) {
    requiresEthernet = true;
  }

  return {
    mcuCriteria: {
      minClockSpeed,
      minFlashSize,
      minRamSize,
      requiresBLE,
      requiresWiFi,
      requiresEthernet,
      requiresCAN,
      requiresUSB,
      budgetUSD,
    },
    peripherals: {
      adc: true,
      dac: requirements.performance === 'high',
      pwm: true,
      uart: 2,
      spi: 2,
      i2c: 2,
      gpio: 20,
    },
  };
}
