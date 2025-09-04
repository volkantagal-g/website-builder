import React from 'react';
import { SelectInput, SpacingController } from '../inputs';
import { SpacingOption, getValueFromCSSVar } from '../utils';

interface SpacingTabProps {
  localStyle: Record<string, any>;
  onStyleChange: (property: string, value: string) => void;
  spacingOptions: SpacingOption[];
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
}

export const SpacingTab: React.FC<SpacingTabProps> = ({
  localStyle,
  onStyleChange,
  spacingOptions,
  palette,
  radius,
  spacing
}) => {
  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Margin and Padding Side by Side */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Margin Controller */}
        <div style={{ flex: 1 }}>
          <SpacingController
            label="Margin"
            currentValues={{
              top: localStyle.marginTop,
              right: localStyle.marginRight,
              bottom: localStyle.marginBottom,
              left: localStyle.marginLeft
            }}
            onChange={(side, value) => {
              const property = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
              onStyleChange(property, value);
            }}
            spacingOptions={spacingOptions}
            getValueFromCSSVar={(value) => getValueFromCSSVar(value, palette, radius, spacing)}
          />
        </div>

        {/* Padding Controller */}
        <div style={{ flex: 1 }}>
          <SpacingController
            label="Padding"
            currentValues={{
              top: localStyle.paddingTop,
              right: localStyle.paddingRight,
              bottom: localStyle.paddingBottom,
              left: localStyle.paddingLeft
            }}
            onChange={(side, value) => {
              const property = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
              onStyleChange(property, value);
            }}
            spacingOptions={spacingOptions}
            getValueFromCSSVar={(value) => getValueFromCSSVar(value, palette, radius, spacing)}
          />
        </div>
      </div>

      {/* Gap */}
      <SelectInput
        label="Gap"
        value={getValueFromCSSVar(localStyle.gap, palette, radius, spacing) || ''}
        onChange={(value) => onStyleChange('gap', value)}
        placeholder="Select gap"
        options={spacingOptions.map(opt => ({ value: opt.value, label: `${opt.label} (${opt.value})` }))}
      />
    </div>
  );
};
