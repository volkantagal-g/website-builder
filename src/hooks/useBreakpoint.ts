import { useState, useEffect } from 'react';
import { BREAKPOINTS, Breakpoint } from '../types/breakpoints';

export const useBreakpoint = (): Breakpoint => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(BREAKPOINTS[0]);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      // Breakpoint'leri genişliğe göre sırala (küçükten büyüğe)
      const sortedBreakpoints = [...BREAKPOINTS].sort((a, b) => a.width - b.width);
      
      // Mevcut genişliğe uygun en büyük breakpoint'i bul
      let selectedBreakpoint = sortedBreakpoints[0]; // Varsayılan olarak en küçük
      
      for (const breakpoint of sortedBreakpoints) {
        if (width >= breakpoint.width) {
          selectedBreakpoint = breakpoint;
        } else {
          break;
        }
      }
      
      setCurrentBreakpoint(selectedBreakpoint);
    };

    // İlk yüklemede çalıştır
    updateBreakpoint();

    // Pencere boyutu değiştiğinde çalıştır
    window.addEventListener('resize', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  return currentBreakpoint;
};
