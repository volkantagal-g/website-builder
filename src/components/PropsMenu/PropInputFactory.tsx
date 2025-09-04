import React from 'react';
import { TextInput, NumberInput, SelectInput, ToggleInput, ArrayInput } from './inputs';
import { getCSSPropertyOptions, CSS_PROPERTY_DEFAULTS, CSSPropertyName } from '../../constants/css-properties';

export interface PropInputFactoryProps {
  propName: string;
  propType: string | { type: string; options?: string[] };
  currentValue: unknown;
  onChange: (propName: string, value: unknown) => void;
  palette?: Record<string, string>;
  typography?: Record<string, any>;
}

export class PropInputFactory {
  static createInput({ propName, propType, currentValue, onChange, palette = {}, typography = {} }: PropInputFactoryProps): React.ReactElement {
    const cssOptions = getCSSPropertyOptions(palette, typography);
    
    // Boolean type için özel kontrol (en önce yapılmalı)
    if (typeof propType === 'string' && propType.toLowerCase() === 'boolean') {
      const booleanValue = Boolean(currentValue);
      return (
        <ToggleInput
          value={booleanValue}
          onChange={(newValue) => onChange(propName, newValue)}
        />
      );
    }

    // Select type için özel kontrol (object format: { type: "select", options: [...] })
    // Bu kontrol CSS property kontrolünden ÖNCE yapılmalı
    if (typeof propType === 'object' && propType.type === 'select' && propType.options) {
      const value = String(currentValue ?? propType.options[0]);
      return (
        <SelectInput
          value={value}
          onChange={(newValue) => onChange(propName, newValue)}
          options={propType.options}
        />
      );
    }
    
    // String propType için eski logic
    const propTypeString = typeof propType === 'string' ? propType : propType.type;
    
    // Array tipindeki props için özel kontrol
    if (propTypeString.includes('[]') || Array.isArray(currentValue)) {
      return (
        <ArrayInput
          value={Array.isArray(currentValue) ? currentValue : []}
          onChange={(newValue) => onChange(propName, newValue)}
          propName={propName}
        />
      );
    }

    // Union type için özel kontrol (örn: 'string | number')
    if (propTypeString.includes('|')) {
      const options = propTypeString.split('|').map(opt => opt.trim());
      const value = String(currentValue ?? options[0]);
      return (
        <SelectInput
          value={value}
          onChange={(newValue) => onChange(propName, newValue)}
          options={options}
        />
      );
    }

    // CSS property için özel kontrol (select type'dan SONRA)
    if (this.isCSSProperty(propName, cssOptions)) {
      const value = String(currentValue ?? CSS_PROPERTY_DEFAULTS[propName as CSSPropertyName]);
      return this.createCSSPropertyInput(propName, value, onChange, cssOptions);
    }

    // Temel type'lar için
    const value = String(currentValue ?? '');
    return this.createBasicTypeInput(propTypeString, value, onChange, propName);
  }

  private static isCSSProperty(propName: string, cssOptions: Record<string, readonly string[]>): propName is CSSPropertyName {
    return propName in cssOptions;
  }

  private static createCSSPropertyInput(
    propName: CSSPropertyName, 
    value: string, 
    onChange: (propName: string, value: unknown) => void,
    cssOptions: Record<string, readonly string[]>
  ): React.ReactElement {
    const options = cssOptions[propName] as unknown as string[];
    const defaultValue = CSS_PROPERTY_DEFAULTS[propName];
    
    return (
      <SelectInput
        value={value || defaultValue}
        onChange={(newValue) => onChange(propName, newValue)}
        options={options}
      />
    );
  }

  private static createBasicTypeInput(
    propType: string, 
    value: string, 
    onChange: (propName: string, value: unknown) => void,
    propName: string
  ): React.ReactElement {
    switch (propType.toLowerCase()) {
      case 'string':
        return (
          <TextInput
            value={value || ''}
            onChange={(newValue) => onChange(propName, newValue)}
            placeholder={`Enter ${propName}`}
          />
        );

      case 'number':
        return (
          <NumberInput
            value={value || ''}
            onChange={(newValue) => onChange(propName, newValue)}
            placeholder={`Enter ${propName}`}
          />
        );

      default:
        return (
          <TextInput
            value={value || ''}
            onChange={(newValue) => onChange(propName, newValue)}
            placeholder={`Enter ${propName}`}
          />
        );
    }
  }
}
