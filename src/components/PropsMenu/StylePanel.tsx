import React from 'react';
import { ComponentMetadata } from '../../types/canvas';
import { StylePanel as NewStylePanel } from './StylePanel/StylePanel';

interface StylePanelProps {
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  typography?: Record<string, any>;
  selectedComponent: ComponentMetadata | null;
  componentId?: string;
  canvasData?: any;
  onPropsChange: (componentId: string, newProps: Record<string, any>) => void;
}

export const StylePanel: React.FC<StylePanelProps> = (props) => {
  return <NewStylePanel {...props} />;
};
