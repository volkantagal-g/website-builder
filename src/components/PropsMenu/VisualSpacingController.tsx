import React, { useState } from 'react';

interface VisualSpacingControllerProps {
  label: string;
  currentValues: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: string) => void;
  spacingOptions: Array<{
    label: string;
    value: string;
    cssVar: string;
  }>;
  getValueFromCSSVar: (cssVar: string | number | undefined) => string;
}

export const VisualSpacingController: React.FC<VisualSpacingControllerProps> = ({
  label,
  currentValues,
  onChange,
  spacingOptions,
  getValueFromCSSVar
}) => {
  const [selectedSide, setSelectedSide] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null);
  const [globalValue, setGlobalValue] = useState<string>('');
  
  const getCurrentValue = (side: 'top' | 'right' | 'bottom' | 'left') => {
    return getValueFromCSSVar(currentValues[side]) || '';
  };

  const handleGlobalValueChange = (value: string) => {
    setGlobalValue(value);
    if (value) {
      // Tüm taraflara aynı değeri ver
      onChange('top', value);
      onChange('right', value);
      onChange('bottom', value);
      onChange('left', value);
    }
  };

  const handleSideClick = (side: 'top' | 'right' | 'bottom' | 'left') => {
    const currentValue = getCurrentValue(side);
    
    if (currentValue && currentValue !== '0') {
      // Eğer değer varsa, toggle yap (0 yap)
      onChange(side, '');
    } else {
      // Eğer değer yoksa, global değeri kullan veya seçim yap
      if (globalValue) {
        onChange(side, globalValue);
      } else {
        setSelectedSide(side);
      }
    }
  };

  const handleValueChange = (value: string) => {
    if (selectedSide) {
      onChange(selectedSide, value);
      setSelectedSide(null);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '12px'
      }}>
        {label}
      </label>
      
      {/* Global Value Input */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '500',
          color: '#666',
          marginBottom: '6px'
        }}>
          All Sides
        </label>
        <select
          value={globalValue}
          onChange={(e) => handleGlobalValueChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff'
          }}
        >
          <option value="">Select spacing for all sides</option>
          {spacingOptions.map((option) => (
            <option key={option.cssVar} value={option.value}>
              {option.label} ({option.value})
            </option>
          ))}
        </select>
      </div>
      
      {/* Visual Box - Sola yaslı */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start', // Sola yaslı
        marginBottom: '12px'
      }}>
        {/* Top */}
        <div
          onClick={() => handleSideClick('top')}
          style={{
            width: '60px',
            height: '20px',
            border: '2px solid #ddd',
            borderBottom: 'none',
            backgroundColor: selectedSide === 'top' ? '#6b3ff7' : 
                           getCurrentValue('top') ? '#e8f5e8' : '#f8f9fa',
            color: selectedSide === 'top' ? '#fff' : 
                   getCurrentValue('top') ? '#2e7d32' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '4px 4px 0 0'
          }}
        >
          {getCurrentValue('top') || '0'}
        </div>
        
        {/* Middle Row */}
        <div style={{ display: 'flex' }}>
          {/* Left */}
          <div
            onClick={() => handleSideClick('left')}
            style={{
              width: '20px',
              height: '40px',
              border: '2px solid #ddd',
              borderRight: 'none',
              backgroundColor: selectedSide === 'left' ? '#6b3ff7' : 
                             getCurrentValue('left') ? '#e8f5e8' : '#f8f9fa',
              color: selectedSide === 'left' ? '#fff' : 
                     getCurrentValue('left') ? '#2e7d32' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRadius: '0 0 0 4px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            {getCurrentValue('left') || '0'}
          </div>
          
          {/* Center */}
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid #ddd',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: '#999'
          }}>
            {label}
          </div>
          
          {/* Right */}
          <div
            onClick={() => handleSideClick('right')}
            style={{
              width: '20px',
              height: '40px',
              border: '2px solid #ddd',
              borderLeft: 'none',
              backgroundColor: selectedSide === 'right' ? '#6b3ff7' : 
                             getCurrentValue('right') ? '#e8f5e8' : '#f8f9fa',
              color: selectedSide === 'right' ? '#fff' : 
                     getCurrentValue('right') ? '#2e7d32' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderRadius: '0 0 4px 0',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            {getCurrentValue('right') || '0'}
          </div>
        </div>
        
        {/* Bottom */}
        <div
          onClick={() => handleSideClick('bottom')}
          style={{
            width: '60px',
            height: '20px',
            border: '2px solid #ddd',
            borderTop: 'none',
            backgroundColor: selectedSide === 'bottom' ? '#6b3ff7' : 
                           getCurrentValue('bottom') ? '#e8f5e8' : '#f8f9fa',
            color: selectedSide === 'bottom' ? '#fff' : 
                   getCurrentValue('bottom') ? '#2e7d32' : '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '0 0 4px 4px'
          }}
        >
          {getCurrentValue('bottom') || '0'}
        </div>
      </div>

      {/* Value Selector */}
      {selectedSide && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Select {selectedSide} value:
          </div>
          <select
            value={getCurrentValue(selectedSide)}
            onChange={(e) => handleValueChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#fff'
            }}
          >
            <option value="">0 (No spacing)</option>
            {spacingOptions.map((option) => (
              <option key={option.cssVar} value={option.value}>
                {option.label} ({option.value})
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedSide(null)}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#666',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
