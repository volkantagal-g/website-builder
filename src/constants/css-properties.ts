const CSS_SIZE_OPTIONS = [
  'auto', 'fit-content', 'max-content', 'min-content', '-webkit-fill-available', 'inherit', 'initial' ,'revert', 'revert-layer' ,'unset'
];

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
  
  fontSize: [
    'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large',
    'smaller', 'larger', 'inherit', 'initial', 'unset',
    '8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px',
    '0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '2rem', '2.5rem', '3rem',
    '0.5em', '0.75em', '1em', '1.25em', '1.5em', '2em', '2.5em', '3em'
  ],
  
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
  
  backgroundColor: [
    'transparent', 'inherit', 'initial', 'unset',
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
    '#6c757d', '#495057', '#343a40', '#212529', '#000000',
    '#6b3ff7', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14',
    '#20c997', '#17a2b8', '#6c757d', '#e83e8c'
  ],
  
  color: [
    'inherit', 'initial', 'unset',
    '#000000', '#212529', '#343a40', '#495057', '#6c757d', '#adb5bd',
    '#ced4da', '#dee2e6', '#e9ecef', '#f8f9fa', '#ffffff',
    '#6b3ff7', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'
  ],
  
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
  borderRadius: '4px',
  padding: '16px',
  margin: '0',
  backgroundColor: 'transparent',
  color: '#333333',
  justifyContent: 'flex-start'
} as const;

export type CSSPropertyName = keyof typeof CSS_PROPERTY_OPTIONS;
export type CSSPropertyValue = string;
