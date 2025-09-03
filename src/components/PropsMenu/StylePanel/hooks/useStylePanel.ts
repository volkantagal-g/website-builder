import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ComponentMetadata } from '../../../../types/canvas';
import { 
  findCanvasComponent, 
  cleanStyleObject, 
  processStyleChange,
  getColorOptions,
  getSpacingOptions,
  getRadiusOptions
} from '../utils';

interface UseStylePanelProps {
  selectedComponent: ComponentMetadata | null;
  componentId?: string;
  canvasData?: any;
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  onPropsChange: (componentId: string, newProps: Record<string, any>) => void;
}

export const useStylePanel = ({
  selectedComponent,
  componentId,
  canvasData,
  palette,
  radius,
  spacing,
  onPropsChange
}: UseStylePanelProps) => {
  const [localStyle, setLocalStyle] = useState<Record<string, any>>({});
  const isUpdatingRef = useRef(false);

  // Component değiştiğinde local style'ı güncelle
  useEffect(() => {
    // Eğer kendimiz güncelleme yapıyorsak, bu effect'i atla
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    console.log('🔄 StylePanel: selectedComponent changed:', selectedComponent);
    console.log('🆔 Component ID:', componentId);
    console.log('📊 Canvas Data:', canvasData);
    
    if (selectedComponent && componentId && canvasData) {
      const canvasComponent = findCanvasComponent(canvasData, componentId);
      console.log('🎯 Found canvas component:', canvasComponent);
      
      if (canvasComponent) {
        // Gerçek component'in props'larından style'ı al
        const componentStyle = canvasComponent.props.style;
        console.log('🎨 Canvas component style:', componentStyle);
        
        if (componentStyle && typeof componentStyle === 'object' && !Array.isArray(componentStyle)) {
          const cleanStyle = cleanStyleObject(componentStyle);
          console.log('🧹 Cleaned style object:', cleanStyle);
          setLocalStyle(cleanStyle);
        } else {
          console.log('📝 No valid style object, setting empty style');
          setLocalStyle({});
        }
      } else {
        console.log('❌ Canvas component not found');
        setLocalStyle({});
      }
    } else {
      console.log('❌ No component selected or missing data, clearing style');
      setLocalStyle({});
    }
  }, [selectedComponent, componentId, canvasData]);

  const handleStyleChange = useCallback((property: string, value: string) => {
    console.log('🔄 Style change:', { property, value, componentId, selectedComponent });
    
    const newStyle = processStyleChange(property, value, localStyle, palette, radius, spacing);
    console.log('🎨 New style object:', newStyle);
    setLocalStyle(newStyle);
    
    if (componentId && canvasData) {
      const canvasComponent = findCanvasComponent(canvasData, componentId);
      if (canvasComponent) {
        // Gerçek component props'larını kullan, sadece style'ı güncelle
        const updatedProps = { ...canvasComponent.props, style: newStyle };
        console.log('📤 Calling onPropsChange with real component props:', { componentId, updatedProps });
        
        // Güncelleme yapacağımızı işaretle
        isUpdatingRef.current = true;
        onPropsChange(componentId, updatedProps);
      }
    }
  }, [localStyle, palette, radius, spacing, componentId, canvasData, onPropsChange, selectedComponent]);

  // Options'ları hesapla (memoize edilmiş)
  const colorOptions = useMemo(() => getColorOptions(palette), [palette]);
  const spacingOptions = useMemo(() => getSpacingOptions(spacing), [spacing]);
  const radiusOptions = useMemo(() => getRadiusOptions(radius), [radius]);

  return {
    localStyle,
    handleStyleChange,
    colorOptions,
    spacingOptions,
    radiusOptions
  };
};
