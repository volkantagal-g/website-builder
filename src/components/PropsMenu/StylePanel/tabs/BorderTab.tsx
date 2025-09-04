import React from 'react';
import { SelectInput, ColorSelect, BorderStyleSelect } from '../inputs';
import { VisualSpacingController } from '../../VisualSpacingController';
import { BORDER_WIDTH_OPTIONS } from '../constants';
import { ColorOption, getValueFromCSSVar } from '../utils';

interface BorderTabProps {
  localStyle: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
  colorOptions: ColorOption[];
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  radiusOptions: Array<{ value: string; label: string }>;
}

export const BorderTab: React.FC<BorderTabProps> = ({
  localStyle,
  onStyleChange,
  colorOptions,
  palette,
  radius,
  spacing,
  radiusOptions
}) => {
  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Border Width and Style Side by Side */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Border Width Controller */}
        <div style={{ flex: 1 }}>
          <VisualSpacingController
            label="Border Width"
            currentValues={{
              top: localStyle.borderTopWidth,
              right: localStyle.borderRightWidth,
              bottom: localStyle.borderBottomWidth,
              left: localStyle.borderLeftWidth
            }}
            onChange={(side, value) => {
              const property = `border${side.charAt(0).toUpperCase() + side.slice(1)}Width`;
              onStyleChange(property, value);
            }}
            spacingOptions={BORDER_WIDTH_OPTIONS}
            getValueFromCSSVar={(value) => String(value || '')}
          />
        </div>

        {/* Border Style Controller */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '12px'
            }}>
              Border Style
            </label>
        
        {/* Global Border Style */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#666',
            marginBottom: '6px'
          }}>
            All Sides
          </label>
          <BorderStyleSelect
            label=""
            value={localStyle.borderStyle || ''}
            onChange={(value) => {
              onStyleChange('borderStyle', value);
              onStyleChange('borderTopStyle', value);
              onStyleChange('borderRightStyle', value);
              onStyleChange('borderBottomStyle', value);
              onStyleChange('borderLeftStyle', value);
            }}
            placeholder="Select border style for all sides"
          />
        </div>

        {/* Individual Border Styles */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          {/* Top */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '60px',
              height: '20px',
              border: '2px solid #ddd',
              borderBottom: 'none',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#666',
              borderRadius: '4px 4px 0 0',
              marginRight: '8px'
            }}>
              Top
            </div>
            <BorderStyleSelect
              label=""
              value={localStyle.borderTopStyle || ''}
              onChange={(value) => onStyleChange('borderTopStyle', value)}
              placeholder="Top style"
            />
          </div>

          {/* Middle Row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex' }}>
              <div style={{
                width: '20px',
                height: '40px',
                border: '2px solid #ddd',
                borderRight: 'none',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#666',
                borderRadius: '0 0 0 4px',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                marginRight: '8px'
              }}>
                Left
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                border: '2px solid #ddd',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: '#999',
                marginRight: '8px'
              }}>
                Style
              </div>
              <div style={{
                width: '20px',
                height: '40px',
                border: '2px solid #ddd',
                borderLeft: 'none',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#666',
                borderRadius: '0 0 4px 0',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                marginRight: '8px'
              }}>
                Right
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <BorderStyleSelect
                label=""
                value={localStyle.borderLeftStyle || ''}
                onChange={(value) => onStyleChange('borderLeftStyle', value)}
                placeholder="Left"
              />
              <BorderStyleSelect
                label=""
                value={localStyle.borderRightStyle || ''}
                onChange={(value) => onStyleChange('borderRightStyle', value)}
                placeholder="Right"
              />
            </div>
          </div>

          {/* Bottom */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '60px',
              height: '20px',
              border: '2px solid #ddd',
              borderTop: 'none',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#666',
              borderRadius: '0 0 4px 4px',
              marginRight: '8px'
            }}>
              Bottom
            </div>
            <BorderStyleSelect
              label=""
              value={localStyle.borderBottomStyle || ''}
              onChange={(value) => onStyleChange('borderBottomStyle', value)}
              placeholder="Bottom style"
            />
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Border Color and Radius Side by Side */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Border Color */}
        <div style={{ flex: 1 }}>
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

        {/* Border Radius */}
        <div style={{ flex: 1 }}>
          <SelectInput
            label="Border Radius"
            value={getValueFromCSSVar(localStyle.borderRadius, palette, radius, spacing) || ''}
            onChange={(value) => onStyleChange('borderRadius', value)}
            placeholder="Select border radius"
            options={radiusOptions}
          />
        </div>
      </div>
    </div>
  );
};
