import React, { useState, useEffect } from 'react';
import { ToggleInput } from './BaseInputs';
import { FiLink, FiX } from 'react-icons/fi';

interface BooleanWithBindingProps {
  value: boolean | string; // boolean veya template string olabilir
  onChange: (value: boolean | string) => void;
  placeholder?: string;
}

export const BooleanWithBinding: React.FC<BooleanWithBindingProps> = ({
  value,
  onChange,
  placeholder = 'Enter binding (e.g., {{restaurant.isVisible}})'
}) => {
  const [isBindingMode, setIsBindingMode] = useState(false);
  const [bindingValue, setBindingValue] = useState('');
  const [booleanValue, setBooleanValue] = useState(false);

  // Value değiştiğinde state'leri güncelle
  useEffect(() => {
    if (typeof value === 'string' && value.includes('{{') && value.includes('}}')) {
      // Template syntax ise binding mode'da
      setIsBindingMode(true);
      setBindingValue(value);
    } else {
      // Boolean değer ise normal mode'da
      setIsBindingMode(false);
      setBooleanValue(Boolean(value));
    }
  }, [value]);

  const handleToggleChange = (newValue: boolean) => {
    setBooleanValue(newValue);
    onChange(newValue);
  };

  const handleBindingChange = (newValue: string) => {
    setBindingValue(newValue);
    
    // Sadece geçerli template syntax yazıldığında değeri güncelle
    if (newValue.includes('{{') && newValue.includes('}}') && newValue.length > 4) {
      // Geçerli template syntax kontrolü (en az {{x.y}} formatında olmalı)
      const templateMatch = newValue.match(/\{\{([^}]+)\}\}/);
      if (templateMatch && templateMatch[1].trim().length > 0) {
        const path = templateMatch[1].trim();
        // Path'in en az bir nokta içermesi gerekiyor (variable.property formatında)
        if (path.includes('.') && !path.endsWith('.') && !path.startsWith('.')) {
          onChange(newValue);
        }
      }
    } else if (newValue === '') {
      // Input temizlendiğinde değeri sıfırla
      onChange(false);
    }
  };

  const handleToggleBindingMode = () => {
    if (isBindingMode) {
      // Binding mode'dan çık, boolean mode'a geç
      setIsBindingMode(false);
      setBooleanValue(Boolean(value));
      onChange(Boolean(value));
    } else {
      // Boolean mode'dan çık, binding mode'a geç
      setIsBindingMode(true);
      setBindingValue('{{}}');
      // Binding mode'a geçerken değeri değiştirme, sadece input'u hazırla
    }
  };

  const handleClearBinding = () => {
    setIsBindingMode(false);
    setBooleanValue(false);
    onChange(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
    }}>
      {/* Toggle Input veya Binding Input */}
      {isBindingMode ? (
        <input
          type="text"
          value={bindingValue}
          onChange={(e) => handleBindingChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            height: '24px',
            padding: '0 8px',
            border: '1px solid #6b3ff7',
            borderRadius: '4px',
            fontSize: '12px',
            outline: 'none',
            backgroundColor: '#f8f9ff',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#6b3ff7';
            e.target.style.boxShadow = '0 0 0 2px rgba(107, 63, 247, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#6b3ff7';
            e.target.style.boxShadow = 'none';
          }}
        />
      ) : (
        <div style={{ flex: 1 }}>
          <ToggleInput
            value={booleanValue}
            onChange={handleToggleChange}
          />
        </div>
      )}

      {/* Data Binding Toggle Button */}
      <button
        onClick={handleToggleBindingMode}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '24px',
          backgroundColor: isBindingMode ? '#6b3ff7' : '#f8f9fa',
          color: isBindingMode ? '#ffffff' : '#666',
          border: `1px solid ${isBindingMode ? '#6b3ff7' : '#e9ecef'}`,
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '12px',
        }}
        onMouseEnter={(e) => {
          if (!isBindingMode) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
            e.currentTarget.style.borderColor = '#6b3ff7';
          }
        }}
        onMouseLeave={(e) => {
          if (!isBindingMode) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.borderColor = '#e9ecef';
          }
        }}
        title={isBindingMode ? 'Switch to toggle mode' : 'Switch to data binding mode'}
      >
        <FiLink size={12} />
      </button>

      {/* Clear Binding Button (sadece binding mode'da görünür) */}
      {isBindingMode && (
        <button
          onClick={handleClearBinding}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            backgroundColor: '#dc3545',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c82333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3545';
          }}
          title="Clear binding and return to toggle"
        >
          <FiX size={12} />
        </button>
      )}

      {/* Binding Indicator */}
      {isBindingMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 6px',
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          borderRadius: '3px',
          fontSize: '10px',
          fontWeight: '500',
        }}>
          <span>BIND</span>
        </div>
      )}
    </div>
  );
};
