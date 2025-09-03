import React, { useEffect, useRef, useCallback } from 'react';
import { CanvasComponent, ComponentMetadata } from '../types/canvas';
import { STORAGE_KEYS } from '../constants/storage';
import { mergeComponentMetadata } from '../utils/canvasHelpers';
import { CSSProperties } from 'react';

export const useCanvasRestore = (
  components: ComponentMetadata[],
  setCanvasComponents: React.Dispatch<React.SetStateAction<CanvasComponent[]>>
) => {
  const isRestoringRef = useRef(false);
  const lastComponentsRef = useRef<ComponentMetadata[]>([]);
  const restoreComponent = (comp: CanvasComponent) => {
    // Component'in kaynağını belirle
    const isGeneralElement = ['Div'].includes(comp.metadata.name);
    const library = isGeneralElement ? 'general' : 'pinnate';
    
    if (isGeneralElement) {
      // General element'ler için güncel metadata'yı bul
      const currentMetadata = components.find(
        (meta: ComponentMetadata) => meta.name === comp.metadata.name
      );
      
      // Eski metadata ile güncel metadata'yı merge et
      const mergedMetadata = mergeComponentMetadata(currentMetadata, comp.metadata);
      
      return {
        ...comp,
        library,
        metadata: {
          ...mergedMetadata,
          p: ({ children, style, ...props }: any) => {
            // CSS property'leri style objesinde birleştir
            const combinedStyle: CSSProperties = {};
            
            // Sadece geçerli değerleri ekle
            if (style && typeof style === 'object' && !Array.isArray(style)) {
              Object.entries(style).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && 
                    (typeof value === 'string' || typeof value === 'number')) {
                  (combinedStyle as any)[key] = value;
                }
              });
            }
            
            // Diğer CSS property'leri ekle
            if (props.display) (combinedStyle as any).display = props.display;
            if (props.width) combinedStyle.width = props.width;
            if (props.height) combinedStyle.height = props.height;
            if (props.maxWidth) combinedStyle.maxWidth = props.maxWidth;
            if (props.maxHeight) combinedStyle.maxHeight = props.maxHeight;
            if (props.minWidth) combinedStyle.minWidth = props.minWidth;
            if (props.minHeight) combinedStyle.minHeight = props.minHeight;
            if (props.justifyContent) (combinedStyle as any).justifyContent = props.justifyContent;
            if (props.backgroundColor) combinedStyle.backgroundColor = props.backgroundColor;
            if (props.border) combinedStyle.border = props.border;
            if (props.borderRadius) combinedStyle.borderRadius = props.borderRadius;
            if (props.padding) combinedStyle.padding = props.padding;
            if (props.margin) combinedStyle.margin = props.margin;
            
            return (
              <div style={combinedStyle} {...props}>
                {children && children.length > 0 ? children.map((child: CanvasComponent) => restoreComponent(child)) : <></>}
              </div>
            );
          }
        }
      };
    } else {
      // Pinnate Component için orijinal metadata'yı bul
      console.log('🔍 Looking for Pinnate component:', comp.metadata.name);
      console.log('📊 Available components:', components.map(c => ({ name: c.name, hasP: !!c.p })));
      
      const originalMetadata = components.find(
        (meta: ComponentMetadata) => meta.name === comp.metadata.name
      );
      
      if (originalMetadata) {
        console.log('✅ Re-injecting Pinnate p function for', comp.metadata.name, ':', typeof originalMetadata.p);
        console.log('🎯 Original metadata p function:', originalMetadata.p);
        
        // Pinnate component'ler için de metadata'yı merge et
        const mergedMetadata = mergeComponentMetadata(originalMetadata, comp.metadata);
        
        return {
          ...comp,
          library, // Library bilgisini ekle
          metadata: {
            ...mergedMetadata,
            p: originalMetadata.p // Pinnate function'ı geri ekle
          }
        };
      }
      
      console.log('❌ No Pinnate metadata found for:', comp.metadata.name);
      console.log('📋 Available Pinnate components:', components.map(c => ({ name: c.name, hasP: !!c.p })));
      return comp;
    }
  };

  // Recursive olarak tüm nested component'leri restore et (memoized)
  const restoreComponentRecursive = useCallback((comp: any): CanvasComponent => {
    // Önce component'i restore et
    const restoredComp = restoreComponent(comp);
    
    // Eğer children varsa, onları da recursive olarak restore et
    if (restoredComp.children && restoredComp.children.length > 0) {
      console.log('🔄 Restoring nested components for:', restoredComp.metadata.name, 'children count:', restoredComp.children.length);
      
      const restoredChildren = restoredComp.children.map((child: any) => {
        console.log('  🔄 Restoring child:', child.metadata?.name || 'unknown');
        return restoreComponentRecursive(child);
      });
      
      return {
        ...restoredComp,
        children: restoredChildren
      };
    }
    
    return restoredComp;
  }, [components]);

  // Canvas components değiştiğinde localStorage'a kaydet
  useEffect(() => {
    // Bu effect'i useCanvas hook'unda kullanacağız
  }, []);

  // Components prop'u yüklendiğinde localStorage'dan canvas'ı geri yükle
  useEffect(() => {
    // Eğer zaten restore işlemi yapılıyorsa, bu effect'i atla
    if (isRestoringRef.current) {
      return;
    }

    // Components değişmemişse, restore işlemini yapma
    if (components.length === 0 || 
        (lastComponentsRef.current.length === components.length && 
         lastComponentsRef.current.every((comp, index) => comp.name === components[index]?.name))) {
      return;
    }

    // Components'i güncelle
    lastComponentsRef.current = components;

    const savedComponents = localStorage.getItem(STORAGE_KEYS.CANVAS_COMPONENTS);
    
    if (savedComponents) {
      try {
        console.log('📂 Loading canvas from localStorage');
        isRestoringRef.current = true;
        
        const parsedComponents = JSON.parse(savedComponents);
        
        // localStorage'dan yüklenen component'lere metadata.p'yi geri ekle
        // Recursive olarak tüm nested component'leri restore et
        const restoredComponents = parsedComponents.map((comp: any) => {
          console.log('🔄 Starting recursive restore for:', comp.metadata?.name || 'unknown');
          return restoreComponentRecursive(comp);
        });
        
        console.log('Final restored components:', restoredComponents);
        setCanvasComponents(restoredComponents);
        
        // Restore işlemi tamamlandı
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      } catch (error) {
        console.error('Error parsing localStorage components:', error);
        isRestoringRef.current = false;
      }
    } else {
      console.log('No saved components found in localStorage');
    }
  }, [components, setCanvasComponents, restoreComponentRecursive]);

  return {
    restoreComponent,
    restoreComponentRecursive,
  };
};
