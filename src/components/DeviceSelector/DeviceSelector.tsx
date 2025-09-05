// @ts-nocheck

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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      backgroundColor: '#f8f9fa',
      padding: '8px 12px',
      opacity: 0,
      //borderRadius: '8px',
      //border: '1px solid #e9ecef',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Device Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        color: '#6b3ff7',
        fontSize: '16px'
      }}>
        {selectedDevice.icon}
      </div>
      
      {/* Device Selector */}
      {/*<select
        value={selectedDevice.id}
        onChange={(e) => handleDeviceChange(e.target.value)}
        style={{
          padding: '6px 12px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          minWidth: '150px',
          fontWeight: '500',
          color: '#333',
          //boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
                    onFocus={(e) => {
              (e.target as HTMLSelectElement).style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.1), 0 0 0 3px rgba(107, 63, 247, 0.1)';
            }}
            onBlur={(e) => {
              (e.target as HTMLSelectElement).style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.1)';
            }}
      >
        {DEVICE_PRESETS.map(device => (
          <option key={device.id} value={device.id}>
            {getDeviceDisplayName(device)}
          </option>
        ))}
      </select>*/}
      
      {/* Custom Size Inputs */}
      {isCustomMode && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          padding: '3px 10px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e9ecef'
        }}>
          <input
            type="number"
            value={customWidth}
            onChange={(e) => setCustomWidth(Number(e.target.value))}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
              handleCustomSizeChange();
            }}
            style={{
              width: '50px',
              padding: '4px 6px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="Width"
            onFocus={(e) => {
              e.target.style.borderColor = '#6b3ff7';
            }}
          />
          <span style={{ 
            fontSize: '14px', 
            color: '#666', 
            fontWeight: '500',
            userSelect: 'none'
          }}>×</span>
          <input
            type="number"
            value={customHeight}
            onChange={(e) => setCustomHeight(Number(e.target.value))}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
              handleCustomSizeChange();
            }}
            style={{
              width: '50px',
              padding: '4px 6px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="Height"
            onFocus={(e) => {
              e.target.style.borderColor = '#6b3ff7';
            }}
          />
        </div>
      )}
    </div>
  );
};
