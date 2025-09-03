import React from 'react';
import { ColorSelect } from '../inputs';
import { ColorOption } from '../utils';

interface ColorsTabProps {
  localStyle: Record<string, any>;
  onStyleChange: (property: string, value: string) => void;
  colorOptions: ColorOption[];
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({
  localStyle,
  onStyleChange,
  colorOptions,
  palette,
  radius,
  spacing
}) => {
  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Color */}
      <ColorSelect
        label="Color"
        value={localStyle.color || ''}
        onChange={(value) => onStyleChange('color', value)}
        placeholder="Select color"
        colorOptions={colorOptions}
        palette={palette}
        radius={radius}
        spacing={spacing}
      />

      {/* Background Color */}
      <ColorSelect
        label="Background Color"
        value={localStyle.backgroundColor || ''}
        onChange={(value) => onStyleChange('backgroundColor', value)}
        placeholder="Select background color"
        colorOptions={colorOptions}
        palette={palette}
        radius={radius}
        spacing={spacing}
      />

      {/* Border Color */}
      <ColorSelect
        label="Border Color"
        value={localStyle.borderColor || ''}
        onChange={(value) => onStyleChange('borderColor', value)}
        placeholder="Select border color"
        colorOptions={colorOptions}
        palette={palette}
        radius={radius}
        spacing={spacing}
      />
    </div>
  );
};
