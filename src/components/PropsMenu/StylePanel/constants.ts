// Style Panel Constants
export const STYLE_TABS = [
  { key: 'layout', label: 'Layout' },
  { key: 'colors', label: 'Colors' },
  { key: 'typography', label: 'Typography' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'border', label: 'Border' }
] as const;

export type StyleTabKey = typeof STYLE_TABS[number]['key'];

// Display options
export const DISPLAY_OPTIONS = [
  { value: 'block', label: 'Block' },
  { value: 'inline', label: 'Inline' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'inline-flex', label: 'Inline Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'inline-grid', label: 'Inline Grid' },
  { value: 'none', label: 'None' }
];

// Justify Content options
export const JUSTIFY_CONTENT_OPTIONS = [
  { value: 'flex-start', label: 'Flex Start' },
  { value: 'flex-end', label: 'Flex End' },
  { value: 'center', label: 'Center' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' }
];

// Width options
export const WIDTH_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'fit-content', label: 'Fit Content' },
  { value: 'max-content', label: 'Max Content' },
  { value: 'min-content', label: 'Min Content' },
  { value: '-webkit-fill-available', label: 'Fill Available' },
  { value: 'inherit', label: 'Inherit' },
  { value: 'initial', label: 'Initial' },
  { value: 'unset', label: 'Unset' }
];

// Height options
export const HEIGHT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'fit-content', label: 'Fit Content' },
  { value: 'max-content', label: 'Max Content' },
  { value: 'min-content', label: 'Min Content' },
  { value: '-webkit-fill-available', label: 'Fill Available' },
  { value: 'inherit', label: 'Inherit' },
  { value: 'initial', label: 'Initial' },
  { value: 'unset', label: 'Unset' }
];

// Font Size options
export const FONT_SIZE_OPTIONS = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
  { value: '36px', label: '36px' },
  { value: '48px', label: '48px' }
];

// Font Weight options
export const FONT_WEIGHT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' }
];

// Text Align options
export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' }
];

// Border Style options
export const BORDER_STYLE_OPTIONS = [
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

// Border Width options
export const BORDER_WIDTH_OPTIONS = [
  { label: 'No border', value: '0px', cssVar: '--no-border' },
  { label: 'Thin', value: '1px', cssVar: '--border-thin' },
  { label: 'Medium', value: '2px', cssVar: '--border-medium' },
  { label: 'Thick', value: '3px', cssVar: '--border-thick' },
  { label: 'Extra thick', value: '4px', cssVar: '--border-extra-thick' },
  { label: 'Very thick', value: '5px', cssVar: '--border-very-thick' },
  { label: 'Ultra thick', value: '6px', cssVar: '--border-ultra-thick' },
  { label: 'Super thick', value: '8px', cssVar: '--border-super-thick' },
  { label: 'Mega thick', value: '10px', cssVar: '--border-mega-thick' }
];

// Min Width options (subset of width options)
export const MIN_WIDTH_OPTIONS = [
  { value: '0', label: '0' },
  { value: 'auto', label: 'Auto' },
  { value: 'fit-content', label: 'Fit Content' },
  { value: 'max-content', label: 'Max Content' },
  { value: 'min-content', label: 'Min Content' },
  { value: '-webkit-fill-available', label: 'Fill Available' },
  { value: 'inherit', label: 'Inherit' },
  { value: 'initial', label: 'Initial' },
  { value: 'unset', label: 'Unset' }
];

// Max Width options (includes 'none')
export const MAX_WIDTH_OPTIONS = [
  { value: 'none', label: 'None' },
  ...WIDTH_OPTIONS
];
