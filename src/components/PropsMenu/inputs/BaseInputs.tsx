import React from 'react';

export interface BaseInputProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const TextInput: React.FC<BaseInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  style 
}) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      ...style
    }}
    placeholder={placeholder}
  />
);

export const NumberInput: React.FC<BaseInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  style 
}) => (
  <input
    type="number"
    value={value || ''}
    onChange={(e) => onChange(Number(e.target.value))}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      ...style
    }}
    placeholder={placeholder}
  />
);

export const SelectInput: React.FC<BaseInputProps & { options: string[]; initialValue?: string }> = ({ 
  value, 
  onChange, 
  options, 
  style,
  initialValue
}) => {
  // Eğer seçili değer initial değer değilse, placeholder göster
  const showPlaceholder = value && initialValue && value !== initialValue;
  
  return (
    <select
      value={value || options[0]}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        ...style
      }}
    >
      {showPlaceholder && (
        <option value="" disabled style={{ color: '#999', fontStyle: 'italic' }}>
          Select Value
        </option>
      )}
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const ToggleInput: React.FC<BaseInputProps> = ({ 
  value, 
  onChange 
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        width: '44px',
        height: '24px',
        backgroundColor: value ? '#6b3ff7' : '#e9ecef',
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
