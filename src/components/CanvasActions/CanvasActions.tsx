import React, { useState } from 'react';
import { FiSave, FiRotateCcw, FiEye, FiEyeOff } from 'react-icons/fi';
import { DeviceSelector, DevicePreset } from '../DeviceSelector/DeviceSelector';
import { useApi } from '../../context/ApiContext';

export interface CanvasActionsProps {
  onSave?: (version: string) => void;
  onReset?: () => void;
  onDeviceChange?: (device: DevicePreset) => void;
  currentDevice?: DevicePreset;
  canvasData?: any; // Canvas'taki component'lerin data'sı
  onPreviewToggle?: (isPreview: boolean) => void; // Preview toggle callback
}

export const CanvasActions: React.FC<CanvasActionsProps> = ({ 
  onSave, 
  onReset,
  onDeviceChange,
  currentDevice,
  canvasData,
  onPreviewToggle
}) => {
  const { endpoints } = useApi();
  const [selectedVersion, setSelectedVersion] = useState('v1.0.0');
  const [versions] = useState(['v1.0.0', 'v1.1.0', 'v2.0.0']);
  const [isPreview, setIsPreview] = useState(false);
  // currentDevice prop'u kullan, local state yok

  const handleSave = () => {
    console.log('Saving canvas with version:', selectedVersion);
    
    // Recursive function to clean component data
    const cleanComponent = (comp: any): any => {
      if (!comp) return null;
      
      // Create a clean copy with only serializable properties
      const cleanComp = {
        id: comp.id,
        library: comp.library,
        metadata: {
          name: comp.metadata?.name || '',
          description: comp.metadata?.description || '',
          category: comp.metadata?.category || '',
          type: comp.metadata?.type || '',
          props: comp.metadata?.props || {},
          initialValues: comp.metadata?.initialValues || {}
        },
        props: { ...comp.props },
        children: []
      };
      
      // Recursively clean children
      if (comp.children && Array.isArray(comp.children)) {
        cleanComp.children = comp.children.map(cleanComponent).filter(Boolean);
      }
      
      return cleanComp;
    };
    
    // Clean canvas data recursively
    const cleanCanvasData = canvasData ? canvasData.map(cleanComponent).filter(Boolean) : [];
    
    // Don't save API responses - they should be fetched fresh each time
    // const cleanApiResponses = {}; // Empty responses object
    
    // Clean device data
    const cleanDevice = currentDevice ? {
      id: currentDevice.id,
      name: currentDevice.name,
      width: currentDevice.width,
      height: currentDevice.height,
      category: currentDevice.category
    } : null;
    
    const saveData = {
      version: selectedVersion,
      timestamp: new Date().toISOString(),
      components: cleanCanvasData,
      apiEndpoints: endpoints,
      // apiResponses: Not saved - will be fetched fresh on load
      device: cleanDevice,
      metadata: {
        totalComponents: cleanCanvasData.length,
        totalEndpoints: endpoints.length,
        totalResponses: 0, // Always 0 since we don't save responses
        canvasType: 'website-builder'
      }
    };
    
    try {
      // Use a custom replacer function to handle any remaining circular references
      const jsonString = JSON.stringify(saveData, (key, value) => {
        // Skip functions and undefined values
        if (typeof value === 'function' || value === undefined) {
          return undefined;
        }
        // Skip React internal properties
        if (key && (key.startsWith('__') || key.startsWith('_react') || key.includes('Fiber'))) {
          return undefined;
        }
        // Skip DOM elements
        if (value && typeof value === 'object' && value.nodeType !== undefined) {
          return undefined;
        }
        return value;
      }, 2);
      
      console.log('Canvas JSON Data:', jsonString);
      console.log('📊 Save Data Summary:', {
        components: cleanCanvasData.length,
        endpoints: endpoints.length,
        responses: 'Not saved (will fetch fresh)',
        device: cleanDevice?.name
      });
      
      // Save to localStorage as backup
      localStorage.setItem('canvas-backup-' + selectedVersion, jsonString);
      console.log('💾 Backup saved to localStorage');
      
    } catch (error) {
      console.error('❌ Error serializing canvas data:', error);
      console.log('📊 Partial Save Data Summary:', {
        components: cleanCanvasData.length,
        endpoints: endpoints.length,
        responses: 'Not saved (will fetch fresh)',
        device: cleanDevice?.name
      });
      
      // Try to save a minimal version
      try {
        const minimalData = {
          version: selectedVersion,
          timestamp: new Date().toISOString(),
          totalComponents: cleanCanvasData.length,
          totalEndpoints: endpoints.length,
          totalResponses: 0, // Not saved
          error: 'Full data could not be serialized'
        };
        const minimalJson = JSON.stringify(minimalData, null, 2);
        localStorage.setItem('canvas-backup-minimal-' + selectedVersion, minimalJson);
        console.log('💾 Minimal backup saved to localStorage');
      } catch (minimalError) {
        console.error('❌ Could not save even minimal backup:', minimalError);
      }
    }
    
    onSave?.(selectedVersion);
  };

  const handleReset = () => {
    console.log('Resetting canvas');
    onReset?.();
  };

  const handlePreviewToggle = () => {
    const newPreviewState = !isPreview;
    setIsPreview(newPreviewState);
    onPreviewToggle?.(newPreviewState);
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
      zIndex: 1,
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
          onClick={handlePreviewToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: isPreview ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isPreview ? '#218838' : '#545b62';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isPreview ? '#28a745' : '#6c757d';
          }}
        >
          {isPreview ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          {isPreview ? 'Exit Preview' : 'Preview'}
        </button>
        
        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#6b3ff7',
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
            e.currentTarget.style.backgroundColor = '#6b3ff7';
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
