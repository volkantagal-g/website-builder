import React from 'react';
import { SelectInput } from '../inputs';
import {
  DISPLAY_OPTIONS,
  JUSTIFY_CONTENT_OPTIONS,
  WIDTH_OPTIONS,
  HEIGHT_OPTIONS,
  MAX_WIDTH_OPTIONS,
  MIN_WIDTH_OPTIONS
} from '../constants';

interface LayoutTabProps {
  localStyle: Record<string, any>;
  onStyleChange: (property: string, value: string) => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ localStyle, onStyleChange }) => {
  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Display */}
      <SelectInput
        label="Display"
        value={localStyle.display || ''}
        onChange={(value) => onStyleChange('display', value)}
        placeholder="Select display"
        options={DISPLAY_OPTIONS}
      />

      {/* Justify Content */}
      <SelectInput
        label="Justify Content"
        value={localStyle.justifyContent || ''}
        onChange={(value) => onStyleChange('justifyContent', value)}
        placeholder="Select justify content"
        options={JUSTIFY_CONTENT_OPTIONS}
      />

      {/* Width */}
      <SelectInput
        label="Width"
        value={localStyle.width || ''}
        onChange={(value) => onStyleChange('width', value)}
        placeholder="Select width"
        options={WIDTH_OPTIONS}
      />

      {/* Height */}
      <SelectInput
        label="Height"
        value={localStyle.height || ''}
        onChange={(value) => onStyleChange('height', value)}
        placeholder="Select height"
        options={HEIGHT_OPTIONS}
      />

      {/* Max Width */}
      <SelectInput
        label="Max Width"
        value={localStyle.maxWidth || ''}
        onChange={(value) => onStyleChange('maxWidth', value)}
        placeholder="Select max width"
        options={MAX_WIDTH_OPTIONS}
      />

      {/* Min Width */}
      <SelectInput
        label="Min Width"
        value={localStyle.minWidth || ''}
        onChange={(value) => onStyleChange('minWidth', value)}
        placeholder="Select min width"
        options={MIN_WIDTH_OPTIONS}
      />
    </div>
  );
};
