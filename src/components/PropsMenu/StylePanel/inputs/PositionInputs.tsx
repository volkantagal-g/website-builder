import React from 'react';
import { ManualSizeInput } from './ManualSizeInput';

interface PositionInputsProps {
  localStyle: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
  position: string;
}

const POSITION_SIZE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '0', label: '0' },
  { value: '50%', label: '50%' },
  { value: '100%', label: '100%' }
];

export const PositionInputs: React.FC<PositionInputsProps> = ({
  localStyle,
  onStyleChange,
  position
}) => {
  // Position absolute, fixed, sticky ise position değerlerini göster
  const showPositionValues = position === 'absolute' || position === 'fixed' || position === 'sticky';

  if (!showPositionValues) {
    return null;
  }

  return (
    <div style={{ 
      marginTop: '16px', 
      padding: '16px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h5 style={{
        margin: '0 0 12px 0',
        fontSize: '13px',
        fontWeight: '600',
        color: '#495057'
      }}>
        Position Values
      </h5>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Top */}
        <ManualSizeInput
          label="Top"
          value={localStyle.top || ''}
          onChange={(value) => onStyleChange('top', value)}
          placeholder="Enter top"
          options={POSITION_SIZE_OPTIONS}
        />

        {/* Left */}
        <ManualSizeInput
          label="Left"
          value={localStyle.left || ''}
          onChange={(value) => onStyleChange('left', value)}
          placeholder="Enter left"
          options={POSITION_SIZE_OPTIONS}
        />

        {/* Right */}
        <ManualSizeInput
          label="Right"
          value={localStyle.right || ''}
          onChange={(value) => onStyleChange('right', value)}
          placeholder="Enter right"
          options={POSITION_SIZE_OPTIONS}
        />

        {/* Bottom */}
        <ManualSizeInput
          label="Bottom"
          value={localStyle.bottom || ''}
          onChange={(value) => onStyleChange('bottom', value)}
          placeholder="Enter bottom"
          options={POSITION_SIZE_OPTIONS}
        />
      </div>

      {/* Z-Index */}
      <div style={{ marginTop: '12px' }}>
        <ManualSizeInput
          label="Z-Index"
          value={localStyle.zIndex || ''}
          onChange={(value) => onStyleChange('zIndex', value)}
          placeholder="Enter z-index"
          options={[
            { value: 'auto', label: 'Auto' },
            { value: '0', label: '0' },
            { value: '1', label: '1' },
            { value: '10', label: '10' },
            { value: '100', label: '100' },
            { value: '999', label: '999' }
          ]}
        />
      </div>
    </div>
  );
};
