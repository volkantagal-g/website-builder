export interface Breakpoint {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: string;
  category: 'mobile' | 'tablet' | 'desktop';
}

export const BREAKPOINTS: Breakpoint[] = [
  { id: 'mobile', name: 'Mobile', width: 375, height: 812, icon: '📱', category: 'mobile' },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: '📱', category: 'tablet' },
  { id: 'desktop', name: 'Desktop', width: 1200, height: 800, icon: '🖥️', category: 'desktop' },
  { id: 'large-desktop', name: 'Large Desktop', width: 1920, height: 1080, icon: '🖥️', category: 'desktop' },
];

export interface BreakpointStyles {
  [breakpointId: string]: {
    [propName: string]: unknown;
  };
}

export interface BreakpointProps {
  [breakpointId: string]: {
    [propName: string]: unknown;
  };
}
