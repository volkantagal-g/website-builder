import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { ComponentMetadata } from '../FullPage';

export interface PropsMenuProps {
  selectedComponent: ComponentMetadata | null;
  onPropsChange: (componentId: string, newProps: Record<string, any>) => void;
  componentId?: string;
}

export const PropsMenu: React.FC<PropsMenuProps> = ({ 
  selectedComponent, 
  onPropsChange, 
  componentId 
}) => {
  const [isMinimized, setIsMinimized] = useState(true); // Başlangıçta minimize
  const [localProps, setLocalProps] = useState<Record<string, any>>({});
  const [height, setHeight] = useState(300);
  const [previousHeight, setPreviousHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  // Component değiştiğinde local props'u güncelle
  React.useEffect(() => {
    if (selectedComponent) {
      setLocalProps({ ...selectedComponent.initialValues });
      // Component seçiliyse maximize et
      setIsMinimized(false);
      // Eski height'ı geri yükle
      setHeight(previousHeight);
    }
    // Component seçili değilse otomatik minimize etme
  }, [selectedComponent, previousHeight]);

  // Height değişikliklerini ayrı useEffect'te izle
  React.useEffect(() => {
    if (height > 0) {
      setPreviousHeight(height);
    }
  }, [height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newHeight = window.innerHeight - e.clientY;
    const clampedHeight = Math.max(100, Math.min(300, newHeight));
    setHeight(clampedHeight);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const handlePropChange = (propName: string, value: any) => {
    const newProps = { ...localProps, [propName]: value };
    setLocalProps(newProps);
    
    if (componentId) {
      onPropsChange(componentId, newProps);
    }
  };

  const handleApplyChanges = () => {
    if (componentId) {
      onPropsChange(componentId, localProps);
    }
  };

  const renderPropInput = (propName: string, propType: string, currentValue: any) => {
    const value = localProps[propName] ?? currentValue;

    // Select type için özel kontrol
    if (propType.includes('|')) {
      const options = propType.split('|').map(opt => opt.trim());
      return (
        <select
          value={value || options[0]}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    switch (propType.toLowerCase()) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder={`Enter ${propName}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handlePropChange(propName, Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder={`Enter ${propName}`}
          />
        );

      case 'boolean':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div
              onClick={() => handlePropChange(propName, !value)}
              style={{
                position: 'relative',
                width: '44px',
                height: '24px',
                backgroundColor: value ? '#007bff' : '#e9ecef',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transform: value ? 'translateX(20px)' : 'translateX(0)',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder={`Enter ${propName}`}
          />
        );
    }
  };

  if (isMinimized) {
    return (
      <div 
        data-props-menu
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          transition: isResizing ? 'none' : 'height 0.3s ease, opacity 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: '14px', color: '#666' }}>
          {selectedComponent ? `Props: ${selectedComponent.name}` : 'No component selected'}
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#666',
          }}
          title="Maximize props menu"
        >
          <FiChevronUp size={20} />
        </button>
      </div>
    );
  }

  return (
    <div 
      data-props-menu
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: isMinimized ? '40px' : `${height}px`,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e9ecef',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transition: isResizing ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          height: '8px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: '#dee2e6',
          borderRadius: '2px',
        }} />
      </div>

      {/* Header */}
      <div style={{
        height: '50px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: '#f8f9fa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
            Component Props
          </h3>
          {selectedComponent && (
            <span style={{
              fontSize: '12px',
              color: '#666',
              backgroundColor: '#e9ecef',
              padding: '4px 8px',
              borderRadius: '12px',
            }}>
              {selectedComponent.name}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleApplyChanges}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            title="Apply changes"
          >
            Apply
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
            }}
            title="Minimize props menu"
          >
            <FiChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto',
        opacity: isMinimized ? 0 : 1,
        transform: isMinimized ? 'translateY(10px)' : 'translateY(0)',
        transition: isResizing ? 'none' : 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {!selectedComponent ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            fontSize: '14px',
          }}>
            Select a component to edit its props
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(selectedComponent.props).map(([propName, propType]) => (
              <div key={propName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{propName}</span>
                  <span style={{
                    fontSize: '12px',
                    color: '#666',
                    fontFamily: 'monospace',
                    backgroundColor: '#f8f9fa',
                    padding: '2px 6px',
                    borderRadius: '3px',
                  }}>
                    {propType}
                  </span>
                </label>
                {renderPropInput(propName, propType, selectedComponent.initialValues[propName])}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
