import { useState, useEffect } from 'react';
import { CanvasComponent } from '../types/canvas';
import { Breakpoint } from '../types/breakpoints';

export const useBreakpointProps = (component: CanvasComponent, selectedBreakpoint: Breakpoint) => {
  const [breakpointProps, setBreakpointProps] = useState<Record<string, any>>({});

  // Mevcut breakpoint'e göre props'ları hesapla
  useEffect(() => {
    console.log('🔍 useBreakpointProps - component.breakpointProps:', component.breakpointProps);
    console.log('🔍 useBreakpointProps - selectedBreakpoint.id:', selectedBreakpoint.id);
    
    if (component.breakpointProps && component.breakpointProps[selectedBreakpoint.id]) {
      console.log('🔍 useBreakpointProps - found breakpoint props:', component.breakpointProps[selectedBreakpoint.id]);
      setBreakpointProps(component.breakpointProps[selectedBreakpoint.id]);
    } else {
      console.log('🔍 useBreakpointProps - no breakpoint props found, using empty object');
      setBreakpointProps({});
    }
  }, [component.breakpointProps, selectedBreakpoint.id]);

  // Breakpoint'e özel prop değişikliği
  const updateBreakpointProp = (propName: string, value: any) => {
    const newBreakpointProps = {
      ...component.breakpointProps,
      [selectedBreakpoint.id]: {
        ...component.breakpointProps?.[selectedBreakpoint.id],
        [propName]: value
      }
    };
    
    return newBreakpointProps;
  };

  // Final props'ları hesapla (base props + breakpoint props)
  const getFinalProps = () => {
    return {
      ...component.props,
      ...breakpointProps
    };
  };

  return {
    breakpointProps,
    updateBreakpointProp,
    getFinalProps
  };
};
