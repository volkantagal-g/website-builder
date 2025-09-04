const CSS_SIZE_OPTIONS = [
  'auto', 'fit-content', 'max-content', 'min-content', '-webkit-fill-available', 'inherit', 'initial' ,'revert', 'revert-layer' ,'unset'
];

// Palette'den color değerlerini al
export const getColorOptionsFromPalette = (palette: Record<string, string>) => {
  const baseOptions = ['transparent', 'inherit', 'initial', 'unset'];
  const paletteColors = Object.values(palette).filter(color => 
    color && typeof color === 'string' && color.startsWith('#')
  );
  return [...baseOptions, ...paletteColors];
};

// Typography'den font size değerlerini al
export const getFontSizeOptionsFromTypography = (typography: Record<string, any>) => {
  const baseOptions = [
    'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large',
    'smaller', 'larger', 'inherit', 'initial', 'unset'
  ];
  
  const typographyFontSizes: string[] = [];
  
  // Typography objesini recursive olarak tarayarak font size değerlerini bul
  const extractFontSizes = (obj: any) => {
    if (typeof obj === 'string') {
      // String değerler içinde px, rem, em içerenleri al
      if (obj.includes('px') || obj.includes('rem') || obj.includes('em')) {
        typographyFontSizes.push(obj);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      // Obje ise içindeki değerleri recursive olarak kontrol et
      Object.values(obj).forEach(extractFontSizes);
    }
  };
  
  // Typography'den font size değerlerini çıkar
  Object.values(typography).forEach(extractFontSizes);
  
  // Duplicate'leri kaldır ve sırala
  const uniqueFontSizes = [...new Set(typographyFontSizes)].sort((a, b) => {
    // Numeric değerleri sırala (px, rem, em)
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  });
  
  return [...baseOptions, ...uniqueFontSizes];
};

export const CSS_PROPERTY_OPTIONS = {
  display: [
    'block', 'inline', 'inline-block', 'flex', 'inline-flex', 
    'grid', 'inline-grid', 'none', 'contents', 'table', 'table-row', 
    'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 
    'table-header-group', 'table-row-group', 'table-caption', 'ruby', 
    'ruby-base', 'ruby-text', 'ruby-base-container', 'ruby-text-container'
  ],
  
  width: CSS_SIZE_OPTIONS,
  height: CSS_SIZE_OPTIONS,
  maxWidth: CSS_SIZE_OPTIONS,
  maxHeight: CSS_SIZE_OPTIONS,
  
  fontSize: [], // Will be populated from typography
  
  fontWeight: [
    'normal', 'bold', 'bolder', 'lighter', 'inherit', 'initial', 'unset',
    '100', '200', '300', '400', '500', '600', '700', '800', '900'
  ],
  
  textAlign: [
    'left', 'right', 'center', 'justify', 'justify-all', 'start', 'end', 'match-parent', 'inherit', 'initial', 'unset'
  ],
  
  border: [
    'none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'
  ],
  
  borderRadius: [
    '0', '2px', '4px', '6px', '8px', '12px', '16px', '20px', '50%', '9999px',
    '4px 8px', '8px 16px', '2px 4px 8px 16px'
  ],
  
  padding: [
    '0', '2px', '4px', '6px', '8px', '12px', '16px', '20px', '24px', '32px',
    '4px 8px', '8px 16px', '16px 24px', '8px 16px 24px 32px'
  ],
  
  margin: [
    '0', '2px', '4px', '6px', '8px', '12px', '16px', '20px', '24px', '32px',
    '4px 8px', '8px 16px', '16px 24px', '8px 16px 24px 32px', 'auto'
  ],
  
  backgroundColor: [], // Will be populated from palette
  color: [], // Will be populated from palette
  
  justifyContent: [
    'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 
    'space-evenly', 'stretch', 'inherit', 'initial', 'unset'
  ]
} as const;

export const CSS_PROPERTY_DEFAULTS = {
  display: 'block',
  width: '100%',
  height: 'auto',
  maxWidth: 'none',
  maxHeight: 'none',
  fontSize: '16px',
  fontWeight: 'normal',
  textAlign: 'left',
  border: '1px solid #ccc',
  borderRadius: '0',
  padding: '16px',
  margin: '0',
  backgroundColor: 'transparent',
  color: '#333333',
  justifyContent: 'flex-start'
} as const;

// CSS_PROPERTY_OPTIONS'ı palette ve typography ile güncelle
export const getCSSPropertyOptions = (palette: Record<string, string>, typography: Record<string, any>) => {
  const colorOptions = getColorOptionsFromPalette(palette);
  const fontSizeOptions = getFontSizeOptionsFromTypography(typography);
  
  return {
    ...CSS_PROPERTY_OPTIONS,
    backgroundColor: colorOptions,
    color: colorOptions,
    fontSize: fontSizeOptions
  };
};

export type CSSPropertyName = keyof typeof CSS_PROPERTY_OPTIONS;
export type CSSPropertyValue = string;
