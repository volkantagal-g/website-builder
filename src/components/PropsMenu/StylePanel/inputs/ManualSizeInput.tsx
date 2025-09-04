import React, { useState, useEffect } from 'react';

interface ManualSizeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

const UNIT_OPTIONS = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
  { value: 'vw', label: 'vw' },
  { value: 'vh', label: 'vh' },
  { value: 'em', label: 'em' },
  { value: 'rem', label: 'rem' },
  { value: 'pt', label: 'pt' },
  { value: 'pc', label: 'pc' },
  { value: 'in', label: 'in' },
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
  { value: 'ex', label: 'ex' },
  { value: 'ch', label: 'ch' },
  { value: 'vmin', label: 'vmin' },
  { value: 'vmax', label: 'vmax' }
];

export const ManualSizeInput: React.FC<ManualSizeInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter value',
  options = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('px');
  const [isManualMode, setIsManualMode] = useState(false);

  // Value'yu parse et (sayı + unit)
  useEffect(() => {
    if (value) {
      // Eğer value predefined options'tan biriyse
      const isPredefined = options.some(option => option.value === value);
      if (isPredefined) {
        setIsManualMode(false);
        return;
      }

      // Eğer value manuel bir değerse (sayı + unit)
      const match = value.match(/^([0-9.-]+)(.*)$/);
      if (match) {
        const [, number, unit] = match;
        setInputValue(number);
        setSelectedUnit(unit || 'px');
        setIsManualMode(true);
      }
    } else {
      setInputValue('');
      setSelectedUnit('px');
      setIsManualMode(false);
    }
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue && !isNaN(Number(newValue))) {
      onChange(`${newValue}${selectedUnit}`);
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setSelectedUnit(newUnit);
    
    if (inputValue && !isNaN(Number(inputValue))) {
      onChange(`${inputValue}${newUnit}`);
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    setIsManualMode(mode === 'manual');
    
    if (mode === 'predefined') {
      // Predefined mode'a geç
      onChange('');
    }
  };

  const handlePredefinedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '4px', 
        fontSize: '14px', 
        fontWeight: '500',
        color: '#374151'
      }}>
        {label}
      </label>
      
      {/* Mode Selector */}
      <select
        value={isManualMode ? 'manual' : 'predefined'}
        onChange={handleModeChange}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px',
          marginBottom: '8px',
          backgroundColor: '#fff'
        }}
      >
        <option value="predefined">Predefined Values</option>
        <option value="manual">Manual Input</option>
      </select>

      {isManualMode ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Number Input */}
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          {/* Unit Select */}
          <select
            value={selectedUnit}
            onChange={handleUnitChange}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#fff',
              minWidth: '80px'
            }}
          >
            {UNIT_OPTIONS.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <select
          value={value}
          onChange={handlePredefinedChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#fff'
          }}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
