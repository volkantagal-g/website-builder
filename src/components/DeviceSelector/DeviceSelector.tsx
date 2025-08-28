import React, { useState, useEffect } from 'react';
import { FiMonitor, FiTablet, FiSmartphone, FiSettings } from 'react-icons/fi';

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  category: 'desktop' | 'tablet' | 'mobile' | 'custom';
}

export interface DeviceSelectorProps {
  onDeviceChange: (device: DevicePreset) => void;
  currentDevice?: DevicePreset;
}

const DEVICE_PRESETS: DevicePreset[] = [
  // Desktop
  {
    id: 'desktop',
    name: 'Desktop',
    width: 1920,
    height: 1080,
    icon: <FiMonitor size={16} />,
    category: 'desktop'
  },
  {
    id: 'laptop',
    name: 'Laptop',
    width: 1366,
    height: 768,
    icon: <FiMonitor size={16} />,
    category: 'desktop'
  },
  
  // Tablet
  {
    id: 'ipad',
    name: 'iPad',
    width: 768,
    height: 1024,
    icon: <FiTablet size={16} />,
    category: 'tablet'
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    icon: <FiTablet size={16} />,
    category: 'tablet'
  },
  
  // Mobile
  {
    id: 'iphone-11',
    name: 'iPhone 11',
    width: 375,
    height: 812,
    icon: <FiSmartphone size={16} />,
    category: 'mobile'
  },
  {
    id: 'iphone-12',
    name: 'iPhone 12',
    width: 390,
    height: 844,
    icon: <FiSmartphone size={16} />,
    category: 'mobile'
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    width: 393,
    height: 852,
    icon: <FiSmartphone size={16} />,
    category: 'mobile'
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    width: 430,
    height: 932,
    icon: <FiSmartphone size={16} />,
    category: 'mobile'
  },
  {
    id: 'samsung-galaxy',
    name: 'Samsung Galaxy',
    width: 360,
    height: 800,
    icon: <FiSmartphone size={16} />,
    category: 'mobile'
  },
  
  // Custom
  {
    id: 'custom',
    name: 'Custom',
    width: 800,
    height: 600,
    icon: <FiSettings size={16} />,
    category: 'custom'
  }
];

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ 
  onDeviceChange, 
  currentDevice = DEVICE_PRESETS[1] // Laptop (index 1)
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(currentDevice);
  const [customWidth, setCustomWidth] = useState(currentDevice.width);
  const [customHeight, setCustomHeight] = useState(currentDevice.height);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // currentDevice prop'u değiştiğinde state'i güncelle
  useEffect(() => {
    setSelectedDevice(currentDevice);
    setCustomWidth(currentDevice.width);
    setCustomHeight(currentDevice.height);
  }, [currentDevice]);

  const handleDeviceChange = (deviceId: string) => {
    const device = DEVICE_PRESETS.find(d => d.id === deviceId);
    if (device) {
      if (device.id === 'custom') {
        setIsCustomMode(true);
        setSelectedDevice(device);
        onDeviceChange({
          ...device,
          width: customWidth,
          height: customHeight
        });
      } else {
        setIsCustomMode(false);
        setSelectedDevice(device);
        onDeviceChange(device);
      }
    }
  };

  const handleCustomSizeChange = () => {
    if (isCustomMode) {
      const customDevice = {
        ...selectedDevice,
        width: customWidth,
        height: customHeight
      };
      onDeviceChange(customDevice);
    }
  };

  const getDeviceDisplayName = (device: DevicePreset) => {
    if (device.id === 'custom') {
      return `${device.name} (${customWidth}×${customHeight})`;
    }
    return `${device.name} (${device.width}×${device.height})`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <select
        value={selectedDevice.id}
        onChange={(e) => handleDeviceChange(e.target.value)}
        style={{
          padding: '6px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          minWidth: '180px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {DEVICE_PRESETS.map(device => (
          <option key={device.id} value={device.id}>
            {getDeviceDisplayName(device)}
          </option>
        ))}
      </select>
      
      {isCustomMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="number"
            value={customWidth}
            onChange={(e) => setCustomWidth(Number(e.target.value))}
            onBlur={handleCustomSizeChange}
            style={{
              width: '60px',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'center'
            }}
            placeholder="Width"
          />
          <span style={{ fontSize: '12px', color: '#666' }}>×</span>
          <input
            type="number"
            value={customHeight}
            onChange={(e) => setCustomHeight(Number(e.target.value))}
            onBlur={handleCustomSizeChange}
            style={{
              width: '60px',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'center'
            }}
            placeholder="Height"
          />
        </div>
      )}
    </div>
  );
};
