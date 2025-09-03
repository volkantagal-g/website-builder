import React from 'react';
import { SelectInput } from '../inputs';
import { FONT_SIZE_OPTIONS, FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS } from '../constants';

interface TypographyTabProps {
  localStyle: Record<string, any>;
  onStyleChange: (property: string, value: string) => void;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({ localStyle, onStyleChange }) => {
  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Font Size */}
      <SelectInput
        label="Font Size"
        value={localStyle.fontSize || ''}
        onChange={(value) => onStyleChange('fontSize', value)}
        placeholder="Select font size"
        options={FONT_SIZE_OPTIONS}
      />

      {/* Font Weight */}
      <SelectInput
        label="Font Weight"
        value={localStyle.fontWeight || ''}
        onChange={(value) => onStyleChange('fontWeight', value)}
        placeholder="Select font weight"
        options={FONT_WEIGHT_OPTIONS}
      />

      {/* Text Align */}
      <SelectInput
        label="Text Align"
        value={localStyle.textAlign || ''}
        onChange={(value) => onStyleChange('textAlign', value)}
        placeholder="Select text align"
        options={TEXT_ALIGN_OPTIONS}
      />
    </div>
  );
};
