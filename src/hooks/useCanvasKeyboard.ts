import { useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';

export const useCanvasKeyboard = (
  selectedComponentId: string | null,
  clipboard: any,
  copyComponent: (id: string) => void,
  pasteComponent: (targetComponentId?: string) => void
) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedComponentId) {
        e.preventDefault();
        copyComponent(selectedComponentId);
      }
      
      // Ctrl/Cmd + V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        // Seçili component'in içine paste yap
        pasteComponent(selectedComponentId || undefined);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, clipboard, copyComponent, pasteComponent]);

  // Selected component değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (selectedComponentId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_COMPONENT, selectedComponentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_COMPONENT);
    }
  }, [selectedComponentId]);
};
