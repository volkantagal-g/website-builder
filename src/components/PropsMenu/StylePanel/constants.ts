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
  { value: '100%', label: '100%' },
  { value: '90%', label: '90%' },
  { value: '80%', label: '80%' },
  { value: '75%', label: '75%' },
  { value: '66.666667%', label: '66.67% (2/3)' },
  { value: '60%', label: '60%' },
  { value: '50%', label: '50%' },
  { value: '40%', label: '40%' },
  { value: '33.333333%', label: '33.33% (1/3)' },
  { value: '25%', label: '25%' },
  { value: '20%', label: '20%' },
  { value: '10%', label: '10%' },
  { value: '100px', label: '100px' },
  { value: '150px', label: '150px' },
  { value: '200px', label: '200px' },
  { value: '250px', label: '250px' },
  { value: '300px', label: '300px' },
  { value: '350px', label: '350px' },
  { value: '400px', label: '400px' },
  { value: '450px', label: '450px' },
  { value: '500px', label: '500px' },
  { value: '600px', label: '600px' },
  { value: '700px', label: '700px' },
  { value: '800px', label: '800px' },
  { value: '900px', label: '900px' },
  { value: '1000px', label: '1000px' },
  { value: '1200px', label: '1200px' },
  { value: '1400px', label: '1400px' },
  { value: '1600px', label: '1600px' },
  { value: '1800px', label: '1800px' },
  { value: '2000px', label: '2000px' },
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
  { value: '100vh', label: '100vh (Full Viewport)' },
  { value: '90vh', label: '90vh' },
  { value: '80vh', label: '80vh' },
  { value: '75vh', label: '75vh' },
  { value: '66.666667vh', label: '66.67vh (2/3)' },
  { value: '60vh', label: '60vh' },
  { value: '50vh', label: '50vh (Half Viewport)' },
  { value: '40vh', label: '40vh' },
  { value: '33.333333vh', label: '33.33vh (1/3)' },
  { value: '25vh', label: '25vh' },
  { value: '20vh', label: '20vh' },
  { value: '10vh', label: '10vh' },
  { value: '100%', label: '100%' },
  { value: '90%', label: '90%' },
  { value: '80%', label: '80%' },
  { value: '75%', label: '75%' },
  { value: '66.666667%', label: '66.67% (2/3)' },
  { value: '60%', label: '60%' },
  { value: '50%', label: '50%' },
  { value: '40%', label: '40%' },
  { value: '33.333333%', label: '33.33% (1/3)' },
  { value: '25%', label: '25%' },
  { value: '20%', label: '20%' },
  { value: '10%', label: '10%' },
  { value: '50px', label: '50px' },
  { value: '75px', label: '75px' },
  { value: '100px', label: '100px' },
  { value: '125px', label: '125px' },
  { value: '150px', label: '150px' },
  { value: '175px', label: '175px' },
  { value: '200px', label: '200px' },
  { value: '250px', label: '250px' },
  { value: '300px', label: '300px' },
  { value: '350px', label: '350px' },
  { value: '400px', label: '400px' },
  { value: '450px', label: '450px' },
  { value: '500px', label: '500px' },
  { value: '600px', label: '600px' },
  { value: '700px', label: '700px' },
  { value: '800px', label: '800px' },
  { value: '900px', label: '900px' },
  { value: '1000px', label: '1000px' },
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
  { value: '10%', label: '10%' },
  { value: '20%', label: '20%' },
  { value: '25%', label: '25%' },
  { value: '33.333333%', label: '33.33% (1/3)' },
  { value: '40%', label: '40%' },
  { value: '50px', label: '50px' },
  { value: '75px', label: '75px' },
  { value: '100px', label: '100px' },
  { value: '125px', label: '125px' },
  { value: '150px', label: '150px' },
  { value: '175px', label: '175px' },
  { value: '200px', label: '200px' },
  { value: '250px', label: '250px' },
  { value: '300px', label: '300px' },
  { value: '350px', label: '350px' },
  { value: '400px', label: '400px' },
  { value: '450px', label: '450px' },
  { value: '500px', label: '500px' },
  { value: '600px', label: '600px' },
  { value: '700px', label: '700px' },
  { value: '800px', label: '800px' },
  { value: '900px', label: '900px' },
  { value: '1000px', label: '1000px' },
  { value: 'inherit', label: 'Inherit' },
  { value: 'initial', label: 'Initial' },
  { value: 'unset', label: 'Unset' }
];

// Max Width options (includes 'none')
export const MAX_WIDTH_OPTIONS = [
  { value: 'none', label: 'None' },
  ...WIDTH_OPTIONS
];
