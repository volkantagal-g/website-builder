import React from 'react';
import { BORDER_STYLE_OPTIONS } from '../constants';

interface BorderStyleSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const BorderStyleSelect: React.FC<BorderStyleSelectProps> = ({
  label,
  value,
  onChange,
  placeholder
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 120px 8px 8px', // Sağ tarafta preview için space
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            appearance: 'none',
            backgroundImage: 'none'
          }}
        >
          <option value="">{placeholder}</option>
          {BORDER_STYLE_OPTIONS.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        {/* Border Style Preview */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#666',
          fontFamily: 'monospace',
          pointerEvents: 'none'
        }}>
          {BORDER_STYLE_OPTIONS.find(s => s.value === value)?.preview || 'Preview'}
        </div>
      </div>
    </div>
  );
};
