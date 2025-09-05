import React, { createContext, useContext, useState, useEffect } from 'react';
import { Breakpoint } from '../types/breakpoints';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface BreakpointContextType {
  selectedBreakpoint: Breakpoint;
  setSelectedBreakpoint: (breakpoint: Breakpoint) => void;
  isAutoMode: boolean;
  setIsAutoMode: (isAuto: boolean) => void;
  detectedBreakpoint: Breakpoint;
}

const BreakpointContext = createContext<BreakpointContextType | undefined>(undefined);

export const BreakpointProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const detectedBreakpoint = useBreakpoint();
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<Breakpoint>(detectedBreakpoint);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [lastManualBreakpoint, setLastManualBreakpoint] = useState<Breakpoint | null>(null);

  // Otomatik mod aktifken algılanan breakpoint'i kullan
  useEffect(() => {
    if (isAutoMode) {
      setSelectedBreakpoint(detectedBreakpoint);
    } else {
      // Manuel modda da ekran boyutu değiştiğinde otomatik seçim yap
      // Sadece eğer kullanıcı daha önce manuel seçim yapmamışsa
      if (!lastManualBreakpoint) {
        setSelectedBreakpoint(detectedBreakpoint);
      }
    }
  }, [detectedBreakpoint, isAutoMode, lastManualBreakpoint]);

  // Manuel breakpoint seçimi
  const handleSetSelectedBreakpoint = (breakpoint: Breakpoint) => {
    setSelectedBreakpoint(breakpoint);
    setLastManualBreakpoint(breakpoint);
  };

  // Otomatik moda geçiş
  const handleSetIsAutoMode = (isAuto: boolean) => {
    setIsAutoMode(isAuto);
    if (isAuto) {
      // Otomatik moda geçerken algılanan breakpoint'i kullan
      setSelectedBreakpoint(detectedBreakpoint);
      setLastManualBreakpoint(null);
    }
  };

  return (
    <BreakpointContext.Provider
      value={{
        selectedBreakpoint,
        setSelectedBreakpoint: handleSetSelectedBreakpoint,
        isAutoMode,
        setIsAutoMode: handleSetIsAutoMode,
        detectedBreakpoint,
      }}
    >
      {children}
    </BreakpointContext.Provider>
  );
};

export const useBreakpointContext = () => {
  const context = useContext(BreakpointContext);
  if (context === undefined) {
    throw new Error('useBreakpointContext must be used within a BreakpointProvider');
  }
  return context;
};
