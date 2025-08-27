import React from 'react';
import { TextInput, NumberInput, SelectInput, ToggleInput, ArrayInput } from './inputs';
import { CSS_PROPERTY_OPTIONS, CSS_PROPERTY_DEFAULTS, CSSPropertyName } from '../../constants/css-properties';

export interface PropInputFactoryProps {
  propName: string;
  propType: string;
  currentValue: any;
  onChange: (propName: string, value: any) => void;
}

export class PropInputFactory {
  static createInput({ propName, propType, currentValue, onChange }: PropInputFactoryProps): React.ReactElement {
    const value = currentValue ?? CSS_PROPERTY_DEFAULTS[propName as CSSPropertyName];
    
    // Array tipindeki props için özel kontrol
    if (propType.includes('[]') || Array.isArray(currentValue)) {
      return (
        <ArrayInput
          value={Array.isArray(currentValue) ? currentValue : []}
          onChange={(newValue) => onChange(propName, newValue)}
          propName={propName}
        />
      );
    }

    // CSS property için özel kontrol
    if (this.isCSSProperty(propName)) {
      return this.createCSSPropertyInput(propName, value, onChange);
    }

    // Union type için özel kontrol (örn: 'string | number')
    if (propType.includes('|')) {
      const options = propType.split('|').map(opt => opt.trim());
      return (
        <SelectInput
          value={value || options[0]}
          onChange={(newValue) => onChange(propName, newValue)}
          options={options}
        />
      );
    }

    // Temel type'lar için
    return this.createBasicTypeInput(propType, value, onChange, propName);
  }

  private static isCSSProperty(propName: string): propName is CSSPropertyName {
    return propName in CSS_PROPERTY_OPTIONS;
  }

  private static createCSSPropertyInput(
    propName: CSSPropertyName, 
    value: string, 
    onChange: (propName: string, value: any) => void
  ): React.ReactElement {
    const options = CSS_PROPERTY_OPTIONS[propName] as unknown as string[];
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
    value: any, 
    onChange: (propName: string, value: any) => void,
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

      case 'boolean':
        return (
          <ToggleInput
            value={value || false}
            onChange={(newValue) => onChange(propName, newValue)}
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
