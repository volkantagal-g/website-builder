import React, { useState } from 'react';
import { ComponentMetadata } from '../FullPage';
import { VisualSpacingController } from './VisualSpacingController';

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
  const [activeStyleTab, setActiveStyleTab] = useState<'layout' | 'colors' | 'typography' | 'spacing' | 'border'>('layout');

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
      cssVar: key,
      color: value // Hex color değeri
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



  // Border Style Select Component
  const BorderStyleSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }> = ({ label, value, onChange, placeholder }) => {
    const borderStyles = [
      { value: 'solid', label: 'Solid', preview: '━━━━━━━━' },
      { value: 'dashed', label: 'Dashed', preview: '┅┅┅┅┅┅┅┅' },
      { value: 'dotted', label: 'Dotted', preview: '┈┈┈┈┈┈┈┈' },
      { value: 'double', label: 'Double', preview: '════════' },
      { value: 'groove', label: 'Groove', preview: '┌┐┌┐┌┐┌┐' },
      { value: 'ridge', label: 'Ridge', preview: '└┘└┘└┘└┘' },
      { value: 'inset', label: 'Inset', preview: '┌────────┐' },
      { value: 'outset', label: 'Outset', preview: '└────────┘' },
      { value: 'none', label: 'None', preview: 'No border' }
    ];
    
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '8px'
        }}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 120px 8px 8px', // Sağ tarafta preview için space
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#fff',
              appearance: 'none',
              backgroundImage: 'none'
            }}
          >
            <option value="">{placeholder}</option>
            {borderStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          {/* Border Style Preview */}
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#666',
            fontFamily: 'monospace',
            pointerEvents: 'none'
          }}>
            {borderStyles.find(s => s.value === value)?.preview || 'Preview'}
          </div>
        </div>
      </div>
    );
  };

  // Color Select Component
  const ColorSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }> = ({ label, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedColor = getValueFromCSSVar(value);
    const selectedOption = colorOptions.find(opt => opt.value === selectedColor);
    
    // Dropdown'ı dışına tıklandığında kapat
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.color-select-dropdown')) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);
    
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '8px'
        }}>
          {label}
        </label>
        <div className="color-select-dropdown" style={{ position: 'relative' }}>
          {/* Custom Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 40px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ color: selectedOption ? '#333' : '#999' }}>
              {selectedOption ? `${selectedOption.label} (${selectedOption.value})` : placeholder}
            </span>
            <span style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </button>
          
          {/* Color Preview */}
          <div style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            borderRadius: '3px',
            border: '1px solid #ddd',
            backgroundColor: selectedColor || '#f0f0f0',
            pointerEvents: 'none'
          }} />
          
          {/* Dropdown Options */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Clear Option */}
              <div
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px 8px 40px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#999',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                {placeholder}
              </div>
              
              {/* Color Options */}
              {colorOptions.map((option) => (
                <div
                  key={option.cssVar}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '8px 12px 8px 40px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: selectedColor === option.value ? '#f8f9fa' : 'transparent'
                  }}
                >
                  {/* Option Color Preview */}
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '3px',
                    border: '1px solid #ddd',
                    backgroundColor: option.color,
                    marginRight: '8px'
                  }} />
                  <span>{option.label} ({option.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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
          { key: 'layout', label: 'Layout' },
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
      {activeStyleTab === 'layout' && (
        <div style={{ paddingTop: '8px' }}>
          {/* Display */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Display
            </label>
            <select
              value={localStyle.display || ''}
              onChange={(e) => handleStyleChange('display', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select display</option>
              <option value="block">Block</option>
              <option value="inline">Inline</option>
              <option value="inline-block">Inline Block</option>
              <option value="flex">Flex</option>
              <option value="inline-flex">Inline Flex</option>
              <option value="grid">Grid</option>
              <option value="inline-grid">Inline Grid</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Justify Content */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Justify Content
            </label>
            <select
              value={localStyle.justifyContent || ''}
              onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select justify content</option>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          {/* Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Width
            </label>
            <select
              value={localStyle.width || ''}
              onChange={(e) => handleStyleChange('width', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select width</option>
              <option value="auto">Auto</option>
              <option value="fit-content">Fit Content</option>
              <option value="max-content">Max Content</option>
              <option value="min-content">Min Content</option>
              <option value="100%">100%</option>
              <option value="90%">90%</option>
              <option value="80%">80%</option>
              <option value="75%">75%</option>
              <option value="66.666667%">66.67% (2/3)</option>
              <option value="60%">60%</option>
              <option value="50%">50%</option>
              <option value="40%">40%</option>
              <option value="33.333333%">33.33% (1/3)</option>
              <option value="25%">25%</option>
              <option value="20%">20%</option>
              <option value="10%">10%</option>
              <option value="100px">100px</option>
              <option value="150px">150px</option>
              <option value="200px">200px</option>
              <option value="250px">250px</option>
              <option value="300px">300px</option>
              <option value="350px">350px</option>
              <option value="400px">400px</option>
              <option value="450px">450px</option>
              <option value="500px">500px</option>
              <option value="600px">600px</option>
              <option value="700px">700px</option>
              <option value="800px">800px</option>
              <option value="900px">900px</option>
              <option value="1000px">1000px</option>
              <option value="1200px">1200px</option>
              <option value="1400px">1400px</option>
              <option value="1600px">1600px</option>
              <option value="1800px">1800px</option>
              <option value="2000px">2000px</option>
              <option value="inherit">Inherit</option>
              <option value="initial">Initial</option>
              <option value="unset">Unset</option>
            </select>
          </div>

          {/* Height */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Height
            </label>
            <select
              value={localStyle.height || ''}
              onChange={(e) => handleStyleChange('height', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select height</option>
              <option value="auto">Auto</option>
              <option value="fit-content">Fit Content</option>
              <option value="max-content">Max Content</option>
              <option value="min-content">Min Content</option>
              <option value="100vh">100vh (Full Viewport)</option>
              <option value="90vh">90vh</option>
              <option value="80vh">80vh</option>
              <option value="75vh">75vh</option>
              <option value="66.666667vh">66.67vh (2/3)</option>
              <option value="60vh">60vh</option>
              <option value="50vh">50vh (Half Viewport)</option>
              <option value="40vh">40vh</option>
              <option value="33.333333vh">33.33vh (1/3)</option>
              <option value="25vh">25vh</option>
              <option value="20vh">20vh</option>
              <option value="10vh">10vh</option>
              <option value="100%">100%</option>
              <option value="90%">90%</option>
              <option value="80%">80%</option>
              <option value="75%">75%</option>
              <option value="66.666667%">66.67% (2/3)</option>
              <option value="60%">60%</option>
              <option value="50%">50%</option>
              <option value="40%">40%</option>
              <option value="33.333333%">33.33% (1/3)</option>
              <option value="25%">25%</option>
              <option value="20%">20%</option>
              <option value="10%">10%</option>
              <option value="50px">50px</option>
              <option value="75px">75px</option>
              <option value="100px">100px</option>
              <option value="125px">125px</option>
              <option value="150px">150px</option>
              <option value="175px">175px</option>
              <option value="200px">200px</option>
              <option value="250px">250px</option>
              <option value="300px">300px</option>
              <option value="350px">350px</option>
              <option value="400px">400px</option>
              <option value="450px">450px</option>
              <option value="500px">500px</option>
              <option value="600px">600px</option>
              <option value="700px">700px</option>
              <option value="800px">800px</option>
              <option value="900px">900px</option>
              <option value="1000px">1000px</option>
              <option value="inherit">Inherit</option>
              <option value="initial">Initial</option>
              <option value="unset">Unset</option>
            </select>
          </div>

          {/* Max Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Max Width
            </label>
            <select
              value={localStyle.maxWidth || ''}
              onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select max width</option>
              <option value="none">None</option>
              <option value="fit-content">Fit Content</option>
              <option value="max-content">Max Content</option>
              <option value="min-content">Min Content</option>
              <option value="100%">100%</option>
              <option value="90%">90%</option>
              <option value="80%">80%</option>
              <option value="75%">75%</option>
              <option value="66.666667%">66.67% (2/3)</option>
              <option value="60%">60%</option>
              <option value="50%">50%</option>
              <option value="40%">40%</option>
              <option value="33.333333%">33.33% (1/3)</option>
              <option value="25%">25%</option>
              <option value="20%">20%</option>
              <option value="10%">10%</option>
              <option value="100px">100px</option>
              <option value="150px">150px</option>
              <option value="200px">200px</option>
              <option value="250px">250px</option>
              <option value="300px">300px</option>
              <option value="350px">350px</option>
              <option value="400px">400px</option>
              <option value="450px">450px</option>
              <option value="500px">500px</option>
              <option value="600px">600px</option>
              <option value="700px">700px</option>
              <option value="800px">800px</option>
              <option value="900px">900px</option>
              <option value="1000px">1000px</option>
              <option value="1200px">1200px</option>
              <option value="1400px">1400px</option>
              <option value="1600px">1600px</option>
              <option value="1800px">1800px</option>
              <option value="2000px">2000px</option>
              <option value="inherit">Inherit</option>
              <option value="initial">Initial</option>
              <option value="unset">Unset</option>
            </select>
          </div>

          {/* Min Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Min Width
            </label>
            <select
              value={localStyle.minWidth || ''}
              onChange={(e) => handleStyleChange('minWidth', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="">Select min width</option>
              <option value="0">0</option>
              <option value="auto">Auto</option>
              <option value="fit-content">Fit Content</option>
              <option value="max-content">Max Content</option>
              <option value="min-content">Min Content</option>
              <option value="10%">10%</option>
              <option value="20%">20%</option>
              <option value="25%">25%</option>
              <option value="33.333333%">33.33% (1/3)</option>
              <option value="40%">40%</option>
              <option value="50px">50px</option>
              <option value="75px">75px</option>
              <option value="100px">100px</option>
              <option value="125px">125px</option>
              <option value="150px">150px</option>
              <option value="175px">175px</option>
              <option value="200px">200px</option>
              <option value="250px">250px</option>
              <option value="300px">300px</option>
              <option value="350px">350px</option>
              <option value="400px">400px</option>
              <option value="450px">450px</option>
              <option value="500px">500px</option>
              <option value="600px">600px</option>
              <option value="700px">700px</option>
              <option value="800px">800px</option>
              <option value="900px">900px</option>
              <option value="1000px">1000px</option>
              <option value="inherit">Inherit</option>
              <option value="initial">Initial</option>
              <option value="unset">Unset</option>
            </select>
          </div>
        </div>
      )}

      {activeStyleTab === 'colors' && (
        <div style={{ paddingTop: '8px' }}>
          {/* Color */}
          <ColorSelect
            label="Color"
            value={localStyle.color || ''}
            onChange={(value) => handleStyleChange('color', value)}
            placeholder="Select color"
          />

          {/* Background Color */}
          <ColorSelect
            label="Background Color"
            value={localStyle.backgroundColor || ''}
            onChange={(value) => handleStyleChange('backgroundColor', value)}
            placeholder="Select background color"
          />

          {/* Border Color */}
          <ColorSelect
            label="Border Color"
            value={localStyle.borderColor || ''}
            onChange={(value) => handleStyleChange('borderColor', value)}
            placeholder="Select border color"
          />
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
          {/* Border Width - Visual Controller */}
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
              handleStyleChange(property, value);
            }}
            spacingOptions={[
              { label: 'No border', value: '0px', cssVar: '--no-border' },
              { label: 'Thin', value: '1px', cssVar: '--border-thin' },
              { label: 'Medium', value: '2px', cssVar: '--border-medium' },
              { label: 'Thick', value: '3px', cssVar: '--border-thick' },
              { label: 'Extra thick', value: '4px', cssVar: '--border-extra-thick' },
              { label: 'Very thick', value: '5px', cssVar: '--border-very-thick' },
              { label: 'Ultra thick', value: '6px', cssVar: '--border-ultra-thick' },
              { label: 'Super thick', value: '8px', cssVar: '--border-super-thick' },
              { label: 'Mega thick', value: '10px', cssVar: '--border-mega-thick' }
            ]}
            getValueFromCSSVar={(value) => String(value || '')}
          />

          {/* Border Style - Visual Controller */}
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
                  handleStyleChange('borderStyle', value);
                  handleStyleChange('borderTopStyle', value);
                  handleStyleChange('borderRightStyle', value);
                  handleStyleChange('borderBottomStyle', value);
                  handleStyleChange('borderLeftStyle', value);
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
                  onChange={(value) => handleStyleChange('borderTopStyle', value)}
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
                    onChange={(value) => handleStyleChange('borderLeftStyle', value)}
                    placeholder="Left"
                  />
                  <BorderStyleSelect
                    label=""
                    value={localStyle.borderRightStyle || ''}
                    onChange={(value) => handleStyleChange('borderRightStyle', value)}
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
                  onChange={(value) => handleStyleChange('borderBottomStyle', value)}
                  placeholder="Bottom style"
                />
              </div>
            </div>
          </div>

          {/* Border Color */}
          <ColorSelect
            label="Border Color"
            value={localStyle.borderColor || ''}
            onChange={(value) => handleStyleChange('borderColor', value)}
            placeholder="Select border color"
          />

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
          {/* Visual Margin Controller */}
          <VisualSpacingController
            label="Margin"
            currentValues={{
              top: localStyle.marginTop,
              right: localStyle.marginRight,
              bottom: localStyle.marginBottom,
              left: localStyle.marginLeft
            }}
            onChange={(side, value) => {
              const property = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
              handleStyleChange(property, value);
            }}
            spacingOptions={spacingOptions}
            getValueFromCSSVar={getValueFromCSSVar}
          />

          {/* Visual Padding Controller */}
          <VisualSpacingController
            label="Padding"
            currentValues={{
              top: localStyle.paddingTop,
              right: localStyle.paddingRight,
              bottom: localStyle.paddingBottom,
              left: localStyle.paddingLeft
            }}
            onChange={(side, value) => {
              const property = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`;
              handleStyleChange(property, value);
            }}
            spacingOptions={spacingOptions}
            getValueFromCSSVar={getValueFromCSSVar}
          />

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
