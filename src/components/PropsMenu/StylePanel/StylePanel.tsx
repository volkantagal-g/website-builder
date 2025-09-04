import React, { useState } from 'react';
import { ComponentMetadata } from '../../../types/canvas';
import { STYLE_TABS, StyleTabKey } from './constants';
import { useStylePanel } from './hooks';
import { LayoutTab, ColorsTab, TypographyTab, SpacingTab, BorderTab } from './tabs';

interface StylePanelProps {
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  typography?: Record<string, any>;
  selectedComponent: ComponentMetadata | null;
  componentId?: string;
  canvasData?: Record<string, unknown>;
  onPropsChange: (componentId: string, newProps: Record<string, unknown>) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({
  palette,
  radius,
  spacing,
  typography = {},
  selectedComponent,
  componentId,
  canvasData,
  onPropsChange
}) => {
  const [activeStyleTab, setActiveStyleTab] = useState<StyleTabKey>('layout');

  const {
    localStyle,
    handleStyleChange,
    colorOptions,
    spacingOptions,
    radiusOptions
  } = useStylePanel({
    selectedComponent,
    componentId,
    canvasData,
    palette,
    radius,
    spacing,
    onPropsChange
  });

  if (!selectedComponent) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        Bir component seçin
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeStyleTab) {
      case 'layout':
        return (
          <LayoutTab
            localStyle={localStyle}
            onStyleChange={handleStyleChange}
          />
        );
      case 'colors':
        return (
          <ColorsTab
            localStyle={localStyle}
            onStyleChange={handleStyleChange}
            colorOptions={colorOptions}
            palette={palette}
            radius={radius}
            spacing={spacing}
          />
        );
      case 'typography':
        return (
          <TypographyTab
            localStyle={localStyle}
            onStyleChange={handleStyleChange}
            typography={typography}
          />
        );
      case 'spacing':
        return (
          <SpacingTab
            localStyle={localStyle}
            onStyleChange={handleStyleChange}
            spacingOptions={spacingOptions}
            palette={palette}
            radius={radius}
            spacing={spacing}
          />
        );
      case 'border':
        return (
          <BorderTab
            localStyle={localStyle}
            onStyleChange={handleStyleChange}
            colorOptions={colorOptions}
            palette={palette}
            radius={radius}
            spacing={spacing}
            radiusOptions={radiusOptions.map(opt => ({ value: opt.value, label: `${opt.label} (${opt.value})` }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Style Tab Menu - Sticky */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e9ecef',
        marginBottom: '20px',
        position: 'sticky',
        top: '0',
        backgroundColor: '#ffffff',
        zIndex: 10,
        paddingTop: '8px',
        marginTop: '-8px'
      }}>
        {STYLE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStyleTab(tab.key)}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeStyleTab === tab.key ? '#6b3ff7' : 'transparent',
              color: activeStyleTab === tab.key ? '#fff' : '#666',
              fontSize: '14px',
              fontWeight: activeStyleTab === tab.key ? '600' : '400',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        minHeight: '400px',
        flexDirection: 'row'
      }}>
        {/* Left Column - Tab Content */}
        <div style={{ 
          flex: 1, 
          minWidth: 0,
          maxWidth: 'calc(100% - 320px)'
        }}>
          {renderTabContent()}
        </div>

        {/* Right Column - Current Style Preview */}
        <div style={{ 
          flex: '0 0 300px', 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          height: 'fit-content',
          position: 'sticky',
          top: '80px',
          maxHeight: 'calc(100vh - 120px)',
          overflow: 'auto'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }}>
            Current Style
          </h4>
          <pre style={{
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#fff',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
            overflow: 'auto',
            maxHeight: '250px',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(localStyle, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
