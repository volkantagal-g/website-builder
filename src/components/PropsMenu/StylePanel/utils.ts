// Style Panel Utilities

export interface ColorOption {
  label: string;
  value: string;
  cssVar: string;
  color: string;
}

export interface SpacingOption {
  label: string;
  value: string;
  cssVar: string;
}

export interface RadiusOption {
  label: string;
  value: string;
  cssVar: string;
}

// CSS variable'dan değeri bul (palette, radius veya spacing'ten)
export const getValueFromCSSVar = (
  cssVar: string | number | undefined,
  palette: Record<string, string>,
  radius: Record<string, string>,
  spacing: Record<string, string>
): string => {
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

// Palette'den renk seçeneklerini al
export const getColorOptions = (palette: Record<string, string>): ColorOption[] => {
  return Object.entries(palette).map(([key, value]) => ({
    label: key.replace(/--pinnate-palette-/, '').replace(/-/g, ' '),
    value: value,
    cssVar: key,
    color: value // Hex color değeri
  }));
};

// Spacing seçeneklerini al
export const getSpacingOptions = (spacing: Record<string, string>): SpacingOption[] => {
  return Object.entries(spacing).map(([key, value]) => ({
    label: key.replace(/--pinnate-spacing-/, '').replace(/-/g, ' '),
    value: value,
    cssVar: key
  }));
};

// Radius seçeneklerini al
export const getRadiusOptions = (radius: Record<string, string>): RadiusOption[] => {
  return Object.entries(radius).map(([key, value]) => ({
    label: key.replace(/--pinnate-radius-/, '').replace(/-/g, ' '),
    value: value,
    cssVar: key
  }));
};

// CSS property adını camelCase'e çevir
export const toCamelCase = (property: string): string => {
  return property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

// Style objesini güvenli bir şekilde temizle
export const cleanStyleObject = (style: any): Record<string, string | number> => {
  const cleanStyle: Record<string, string | number> = {};
  Object.entries(style).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      cleanStyle[key] = value;
    }
  });
  return cleanStyle;
};

// Canvas component'ini recursive olarak bul
export const findCanvasComponent = (components: any[], componentId: string): any => {
  for (const comp of components) {
    if (comp.id === componentId) {
      return comp;
    }
    if (comp.children && comp.children.length > 0) {
      const found = findCanvasComponent(comp.children, componentId);
      if (found) return found;
    }
  }
  return null;
};

// Style değişikliğini işle
export const processStyleChange = (
  property: string,
  value: string,
  currentStyle: Record<string, any>,
  palette: Record<string, string>,
  radius: Record<string, string>,
  spacing: Record<string, string>
): Record<string, string | number> => {
  const newStyle: Record<string, string | number> = {};
  
  // Mevcut localStyle'dan geçerli değerleri kopyala
  Object.entries(currentStyle).forEach(([key, val]) => {
    if (typeof val === 'string' || typeof val === 'number') {
      newStyle[key] = val;
    }
  });
  
  // Sadece geçerli CSS property'leri ekle
  if (value && value.trim() !== '') {
    const cssProperty = toCamelCase(property);
    
    // Eğer color property'si ise CSS variable olarak geç
    if (property === 'color' || property === 'backgroundColor' || property === 'borderColor') {
      const paletteEntry = Object.entries(palette).find(([_key, val]) => val === value);
      if (paletteEntry) {
        newStyle[cssProperty] = `var(${paletteEntry[0]})`;
      } else {
        newStyle[cssProperty] = value;
      }
    } else if (property === 'borderRadius') {
      const radiusEntry = Object.entries(radius).find(([_key, val]) => val === value);
      if (radiusEntry) {
        newStyle[cssProperty] = `var(${radiusEntry[0]})`;
      } else {
        newStyle[cssProperty] = value;
      }
    } else if (property === 'margin' || property === 'padding' || property === 'gap') {
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
    const cssProperty = toCamelCase(property);
    delete newStyle[cssProperty];
  }
  
  return newStyle;
};
