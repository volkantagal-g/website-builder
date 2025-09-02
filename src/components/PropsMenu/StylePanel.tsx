import React, { useState } from 'react';
import { ComponentMetadata } from '../FullPage';

interface StylePanelProps {
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  selectedComponent: ComponentMetadata | null;
  componentId?: string;
  canvasData?: any; // Canvas component'leri için
  onPropsChange: (componentId: string, newProps: Record<string, any>) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({ palette, radius, spacing, selectedComponent, componentId, canvasData, onPropsChange }) => {
  const [localStyle, setLocalStyle] = useState<Record<string, any>>({});
  const [activeStyleTab, setActiveStyleTab] = useState<'colors' | 'typography' | 'spacing' | 'border'>('colors');

  // Component değiştiğinde local style'ı güncelle
  React.useEffect(() => {
    console.log('🔄 StylePanel: selectedComponent changed:', selectedComponent);
    console.log('🆔 Component ID:', componentId);
    console.log('📊 Canvas Data:', canvasData);
    
    if (selectedComponent && componentId && canvasData) {
      // Canvas'tan gerçek component instance'ını bul
      const findCanvasComponent = (components: any[]): any => {
        for (const comp of components) {
          if (comp.id === componentId) {
            return comp;
          }
          if (comp.children && comp.children.length > 0) {
            const found = findCanvasComponent(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const canvasComponent = findCanvasComponent(canvasData);
      console.log('🎯 Found canvas component:', canvasComponent);
      
      if (canvasComponent) {
        // Gerçek component'in props'larından style'ı al
        const componentStyle = canvasComponent.props.style;
        console.log('🎨 Canvas component style:', componentStyle);
        
        if (componentStyle && typeof componentStyle === 'object' && !Array.isArray(componentStyle)) {
          // Sadece geçerli CSS property'leri al
          const cleanStyle: Record<string, string | number> = {};
          Object.entries(componentStyle).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number') {
              cleanStyle[key] = value;
            }
          });
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

    const handleStyleChange = (property: string, value: string) => {
    console.log('🔄 Style change:', { property, value, componentId, selectedComponent });
    
    // Style objesini güvenli bir şekilde oluştur
    const newStyle: Record<string, string | number> = {};
    
    // Mevcut localStyle'dan geçerli değerleri kopyala
    Object.entries(localStyle).forEach(([key, val]) => {
      if (typeof val === 'string' || typeof val === 'number') {
        newStyle[key] = val;
      }
    });
    
    // Sadece geçerli CSS property'leri ekle
    if (value && value.trim() !== '') {
      // CSS property adını camelCase'e çevir
      const cssProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      
      // Eğer color property'si ise CSS variable olarak geç
      if (property === 'color' || property === 'backgroundColor' || property === 'borderColor') {
        // Palette'den CSS variable name'ini bul
        const paletteEntry = Object.entries(palette).find(([_key, val]) => val === value);
        if (paletteEntry) {
          newStyle[cssProperty] = `var(${paletteEntry[0]})`;
        } else {
          newStyle[cssProperty] = value;
        }
      } else if (property === 'borderRadius') {
        // Radius'tan CSS variable name'ini bul
        const radiusEntry = Object.entries(radius).find(([_key, val]) => val === value);
        if (radiusEntry) {
          newStyle[cssProperty] = `var(${radiusEntry[0]})`;
        } else {
          newStyle[cssProperty] = value;
        }
      } else if (property === 'margin' || property === 'padding' || property === 'gap') {
        // Spacing'ten CSS variable name'ini bul
        const spacingEntry = Object.entries(spacing).find(([_key, val]) => val === value);
        if (spacingEntry) {
          newStyle[cssProperty] = `var(${spacingEntry[0]})`;
        } else {
          newStyle[cssProperty] = value;
        }
      } else {
        newStyle[cssProperty] = value;
      }
    } else {
      // Boş değer varsa property'yi kaldır
      const cssProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      delete newStyle[cssProperty];
    }
    
    console.log('🎨 New style object:', newStyle);
    setLocalStyle(newStyle);
    
    if (componentId && canvasData) {
      // Canvas'tan gerçek component instance'ını bul
      const findCanvasComponent = (components: any[]): any => {
        for (const comp of components) {
          if (comp.id === componentId) {
            return comp;
          }
          if (comp.children && comp.children.length > 0) {
            const found = findCanvasComponent(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const canvasComponent = findCanvasComponent(canvasData);
      if (canvasComponent) {
        // Gerçek component props'larını kullan, sadece style'ı güncelle
        const updatedProps = { ...canvasComponent.props, style: newStyle };
        console.log('📤 Calling onPropsChange with real component props:', { componentId, updatedProps });
        onPropsChange(componentId, updatedProps);
      }
    }
  };

  // Palette'den renk seçeneklerini al
  const getColorOptions = () => {
    return Object.entries(palette).map(([key, value]) => ({
      label: key.replace(/--pinnate-palette-/, '').replace(/-/g, ' '),
      value: value,
      cssVar: key
    }));
  };

  const colorOptions = getColorOptions();

  // Spacing seçeneklerini al
  const getSpacingOptions = () => {
    return Object.entries(spacing).map(([key, value]) => ({
      label: key.replace(/--pinnate-spacing-/, '').replace(/-/g, ' '),
      value: value,
      cssVar: key
    }));
  };

  const spacingOptions = getSpacingOptions();

  // CSS variable'dan değeri bul (palette, radius veya spacing'ten)
  const getValueFromCSSVar = (cssVar: string | number | undefined) => {
    if (!cssVar) return '';
    
    const cssVarStr = String(cssVar);
    if (cssVarStr.startsWith('var(')) {
      const varName = cssVarStr.replace('var(', '').replace(')', '');
      
      // Önce palette'de ara
      let value = palette[varName];
      if (value) {
        console.log('🔍 CSS Variable lookup (palette):', { cssVar: cssVarStr, varName, value });
        return value;
      }
      
      // Sonra radius'ta ara
      value = radius[varName];
      if (value) {
        console.log('🔍 CSS Variable lookup (radius):', { cssVar: cssVarStr, varName, value });
        return value;
      }
      
      // Son olarak spacing'te ara
      value = spacing[varName];
      if (value) {
        console.log('🔍 CSS Variable lookup (spacing):', { cssVar: cssVarStr, varName, value });
        return value;
      }
      
      console.log('❌ CSS Variable not found:', { cssVar: cssVarStr, varName });
      return '';
    }
    return cssVarStr;
  };

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

  // Radius seçeneklerini al
  const getRadiusOptions = () => {
    return Object.entries(radius).map(([key, value]) => ({
      label: key.replace(/--pinnate-radius-/, '').replace(/-/g, ' '),
      value: value,
      cssVar: key
    }));
  };

  const radiusOptions = getRadiusOptions();

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
        {[
          { key: 'colors', label: 'Colors' },
          { key: 'typography', label: 'Typography' },
          { key: 'spacing', label: 'Spacing' },
          { key: 'border', label: 'Border' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStyleTab(tab.key as any)}
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

      {/* Tab Content */}
      {activeStyleTab === 'colors' && (
        <div style={{ paddingTop: '8px' }}>
          {/* Color */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Color
            </label>
            <select
              value={getValueFromCSSVar(localStyle.color) || ''}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select color</option>
              {colorOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>

          {/* Background Color */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Background Color
            </label>
            <select
              value={getValueFromCSSVar(localStyle.backgroundColor) || ''}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select background color</option>
              {colorOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>

          {/* Border Color */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Border Color
            </label>
            <select
              value={getValueFromCSSVar(localStyle.borderColor) || ''}
              onChange={(e) => handleStyleChange('borderColor', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select border color</option>
              {colorOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeStyleTab === 'typography' && (
        <div style={{ paddingTop: '8px' }}>
          {/* Font Size */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Font Size
            </label>
            <select
              value={localStyle.fontSize || ''}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select font size</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
              <option value="36px">36px</option>
              <option value="48px">48px</option>
            </select>
          </div>

          {/* Font Weight */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Font Weight
            </label>
            <select
              value={localStyle.fontWeight || ''}
              onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select font weight</option>
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
              <option value="900">900</option>
            </select>
          </div>

          {/* Text Align */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Text Align
            </label>
            <select
              value={localStyle.textAlign || ''}
              onChange={(e) => handleStyleChange('textAlign', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select text align</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {activeStyleTab === 'border' && (
        <div style={{ paddingTop: '8px' }}>
          {/* Border Radius */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Border Radius
            </label>
            <select
              value={getValueFromCSSVar(localStyle.borderRadius) || ''}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select border radius</option>
              {radiusOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeStyleTab === 'spacing' && (
        <div style={{ paddingTop: '8px' }}>
          {/* Margin */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Margin
            </label>
            <select
              value={getValueFromCSSVar(localStyle.margin) || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select margin</option>
              {spacingOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>

          {/* Padding */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Padding
            </label>
            <select
              value={getValueFromCSSVar(localStyle.padding) || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select padding</option>
              {spacingOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>

          {/* Gap */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Gap
            </label>
            <select
              value={getValueFromCSSVar(localStyle.gap) || ''}
              onChange={(e) => handleStyleChange('gap', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select gap</option>
              {spacingOptions.map((option) => (
                <option key={option.cssVar} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Current Style Preview */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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
          maxHeight: '200px'
        }}>
          {JSON.stringify(localStyle, null, 2)}
        </pre>
      </div>
    </div>
  );
};
