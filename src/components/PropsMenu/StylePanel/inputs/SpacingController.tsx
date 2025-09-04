import React from 'react';

interface SpacingControllerProps {
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

export const SpacingController: React.FC<SpacingControllerProps> = ({
  label,
  currentValues,
  onChange,
  spacingOptions,
  getValueFromCSSVar
}) => {
  const getCurrentValue = (side: 'top' | 'right' | 'bottom' | 'left') => {
    return getValueFromCSSVar(currentValues[side]) || '';
  };

  const handleValueChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    onChange(side, value);
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
      
      {/* Visual Box with Select Inputs */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        {/* Top */}
        <div style={{
          width: '120px',
          height: '30px',
          border: '2px solid #ddd',
          borderBottom: 'none',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666',
          borderRadius: '4px 4px 0 0',
          position: 'relative'
        }}>
          <select
            value={getCurrentValue('top')}
            onChange={(e) => handleValueChange('top', e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              textAlign: 'center',
              backgroundColor: 'transparent',
              fontSize: '12px',
              color: '#666',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">0</option>
            {spacingOptions.map((option) => (
              <option key={option.cssVar} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Middle Row */}
        <div style={{ display: 'flex' }}>
          {/* Left */}
          <div style={{
            width: '30px',
            height: '80px',
            border: '2px solid #ddd',
            borderRight: 'none',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666',
            borderRadius: '0 0 0 4px',
            position: 'relative'
          }}>
            <select
              value={getCurrentValue('left')}
              onChange={(e) => handleValueChange('left', e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                textAlign: 'center',
                backgroundColor: 'transparent',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer',
                outline: 'none',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              <option value="">0</option>
              {spacingOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Center */}
          <div style={{
            width: '60px',
            height: '80px',
            border: '2px solid #ddd',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#999'
          }}>
            {label}
          </div>
          
          {/* Right */}
          <div style={{
            width: '30px',
            height: '80px',
            border: '2px solid #ddd',
            borderLeft: 'none',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666',
            borderRadius: '0 0 4px 0',
            position: 'relative'
          }}>
            <select
              value={getCurrentValue('right')}
              onChange={(e) => handleValueChange('right', e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                textAlign: 'center',
                backgroundColor: 'transparent',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer',
                outline: 'none',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              <option value="">0</option>
              {spacingOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Bottom */}
        <div style={{
          width: '120px',
          height: '30px',
          border: '2px solid #ddd',
          borderTop: 'none',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666',
          borderRadius: '0 0 4px 4px',
          position: 'relative'
        }}>
          <select
            value={getCurrentValue('bottom')}
            onChange={(e) => handleValueChange('bottom', e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              textAlign: 'center',
              backgroundColor: 'transparent',
              fontSize: '12px',
              color: '#666',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">0</option>
            {spacingOptions.map((option) => (
              <option key={option.cssVar} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
