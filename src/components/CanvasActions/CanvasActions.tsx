import React, { useState } from 'react';
import { FiSave, FiRotateCcw } from 'react-icons/fi';
import { DeviceSelector, DevicePreset } from '../DeviceSelector/DeviceSelector';

export interface CanvasActionsProps {
  onSave?: (version: string) => void;
  onReset?: () => void;
  onDeviceChange?: (device: DevicePreset) => void;
  currentDevice?: DevicePreset;
  canvasData?: any; // Canvas'taki component'lerin data'sı
}

export const CanvasActions: React.FC<CanvasActionsProps> = ({ 
  onSave, 
  onReset,
  onDeviceChange,
  currentDevice,
  canvasData
}) => {
  const [selectedVersion, setSelectedVersion] = useState('v1.0.0');
  const [versions] = useState(['v1.0.0', 'v1.1.0', 'v2.0.0']);
  // currentDevice prop'u kullan, local state yok

  const handleSave = () => {
    console.log('Saving canvas with version:', selectedVersion);
    
    if (canvasData) {
      const saveData = {
        version: selectedVersion,
        timestamp: new Date().toISOString(),
        components: canvasData,
        metadata: {
          totalComponents: canvasData.length,
          canvasType: 'website-builder'
        }
      };
      
      console.log('Canvas JSON Data:', JSON.stringify(saveData, null, 2));
    }
    
    onSave?.(selectedVersion);
  };

  const handleReset = () => {
    console.log('Resetting canvas');
    onReset?.();
  };

  const handleDeviceChange = (device: DevicePreset) => {
    onDeviceChange?.(device);
  };

  return (
    <div style={{
      height: '50px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <DeviceSelector 
        onDeviceChange={handleDeviceChange}
        currentDevice={currentDevice}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Version Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>Version:</label>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            {versions.map(version => (
              <option key={version} value={version}>{version}</option>
            ))}
          </select>
        </div>
        
        {/* Action Buttons */}
        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          <FiSave size={16} />
          Save
        </button>
        
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#545b62';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d';
          }}
        >
          <FiRotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
};
