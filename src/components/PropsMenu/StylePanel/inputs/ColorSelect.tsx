import React, { useState } from 'react';
import { ColorOption, getValueFromCSSVar } from '../utils';

interface ColorSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  colorOptions: ColorOption[];
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
}

export const ColorSelect: React.FC<ColorSelectProps> = ({
  label,
  value,
  onChange,
  placeholder,
  colorOptions,
  palette,
  radius,
  spacing
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedColor = getValueFromCSSVar(value, palette, radius, spacing);
  const selectedOption = colorOptions.find(opt => opt.value === selectedColor);
  
  // Dropdown'ı dışına tıklandığında kapat
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-select-dropdown')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
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
      <div className="color-select-dropdown" style={{ position: 'relative' }}>
        {/* Custom Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 40px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ color: selectedOption ? '#333' : '#999' }}>
            {selectedOption ? `${selectedOption.label} (${selectedOption.value})` : placeholder}
          </span>
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </button>
        
        {/* Color Preview */}
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          borderRadius: '3px',
          border: '1px solid #ddd',
          backgroundColor: selectedColor || '#f0f0f0',
          pointerEvents: 'none'
        }} />
        
        {/* Dropdown Options */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Clear Option */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px 8px 40px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#999',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              {placeholder}
            </div>
            
            {/* Color Options */}
            {colorOptions.map((option) => (
              <div
                key={option.cssVar}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px 8px 40px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: selectedColor === option.value ? '#f8f9fa' : 'transparent'
                }}
              >
                {/* Option Color Preview */}
                <div style={{
                  position: 'absolute',
                  left: '8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  border: '1px solid #ddd',
                  backgroundColor: option.color,
                  marginRight: '8px'
                }} />
                <span>{option.label} ({option.value})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
