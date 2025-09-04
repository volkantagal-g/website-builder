import { CanvasComponent, ComponentMetadata } from '../types/canvas';
import { CSSProperties } from 'react';

/**
 * Component'i recursive olarak bulur
 */
export const findComponentRecursive = (
  components: CanvasComponent[], 
  componentId: string
): CanvasComponent | null => {
  for (const comp of components) {
    if (comp.id === componentId) {
      return comp;
    }
    if (comp.children && comp.children.length > 0) {
      const found = findComponentRecursive(comp.children, componentId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Component'i recursive olarak kaldırır
 */
export const removeComponentRecursive = (
  components: CanvasComponent[], 
  componentId: string
): CanvasComponent[] => {
  return components
    .filter(comp => comp.id !== componentId)
    .map(comp => {
      if (comp.children && comp.children.length > 0) {
        return { ...comp, children: removeComponentRecursive(comp.children, componentId) };
      }
      return comp;
    });
};

/**
 * Component'i container'a ekler
 */
export const addToContainerRecursive = (
  components: CanvasComponent[], 
  containerId: string, 
  newComponent: CanvasComponent
): CanvasComponent[] => {
  return components.map(comp => {
    if (comp.id === containerId) {
      return { ...comp, children: [...(comp.children || []), newComponent] };
    } else if (comp.children && comp.children.length > 0) {
      return { ...comp, children: addToContainerRecursive(comp.children, containerId, newComponent) };
    }
    return comp;
  });
};

/**
 * Component props'larını recursive olarak günceller
 */
export const updatePropsRecursive = (
  components: CanvasComponent[], 
  componentId: string, 
  newProps: Record<string, any>
): CanvasComponent[] => {
  return components.map(comp => {
    if (comp.id === componentId) {
      return { ...comp, props: newProps };
    } else if (comp.children && comp.children.length > 0) {
      return { ...comp, children: updatePropsRecursive(comp.children, componentId, newProps) };
    }
    return comp;
  });
};

/**
 * Component'i bul ve kaldır (drag & drop için)
 */
export const findAndRemoveComponent = (components: CanvasComponent[], componentId: string): { 
  found: CanvasComponent | null, 
  updated: CanvasComponent[] 
} => {
  for (let i = 0; i < components.length; i++) {
    if (components[i].id === componentId) {
      const found = components[i];
      const updated = components.filter((_, idx) => idx !== i);
      return { found, updated };
    }
    
    if (components[i].children && components[i].children!.length > 0) {
      const result = findAndRemoveFromChildren(components[i].children!, componentId);
      if (result.found) {
        const updated = components.map(comp => 
          comp.id === components[i].id 
            ? { ...comp, children: result.updated }
            : comp
        );
        return { found: result.found, updated };
      }
    }
  }
  return { found: null, updated: components };
};

/**
 * Children'dan component'i bul ve kaldır
 */
export const findAndRemoveFromChildren = (children: CanvasComponent[], componentId: string): { 
  found: CanvasComponent | null, 
  updated: CanvasComponent[] 
} => {
  for (let i = 0; i < children.length; i++) {
    if (children[i].id === componentId) {
      const found = children[i];
      const updated = children.filter((_, idx) => idx !== i);
      return { found, updated };
    }
    
    if (children[i].children && children[i].children!.length > 0) {
      const result = findAndRemoveFromChildren(children[i].children!, componentId);
      if (result.found) {
        const updated = children.map(comp => 
          comp.id === children[i].id 
            ? { ...comp, children: result.updated }
            : comp
        );
        return { found: result.found, updated };
      }
    }
  }
  return { found: null, updated: children };
};

/**
 * Yeni ID'ler oluştur (recursive olarak)
 */
export const generateNewIds = (comp: CanvasComponent): CanvasComponent => {
  return {
    ...comp,
    id: `component-${Date.now()}-${Math.random()}`,
    children: comp.children ? comp.children.map(generateNewIds) : []
  };
};

/**
 * Component'in hangi library'den geldiğini belirle
 */
export const getComponentLibrary = (componentName: string): string => {
  const isGeneralElement = ['Div'].includes(componentName);
  return isGeneralElement ? 'general' : 'pinnate';
};

/**
 * Component'in container olup olmadığını belirle
 */
export const isContainerComponent = (componentName: string): boolean => {
  const containerComponents = ['Div', 'Form'];
  return containerComponents.includes(componentName);
};

/**
 * Style değerlerini al (önce style objesinden, sonra direkt props'lardan)
 */
export const getStyleValue = (processedProps: any, key: string): any => {
  // Önce style objesinden kontrol et
  if (processedProps.style && processedProps.style[key]) {
    return processedProps.style[key];
  }
  // Sonra direkt props'lardan kontrol et
  if (processedProps[key]) {
    return processedProps[key];
  }
  return null;
};

/**
 * CSS property'leri style objesinde birleştir
 */
export const combineStyleProperties = (processedProps: any): CSSProperties => {
  const combinedStyle: CSSProperties = {};
  
  // Sadece geçerli değerleri ekle
  if (processedProps.style && typeof processedProps.style === 'object' && !Array.isArray(processedProps.style)) {
    Object.entries(processedProps.style).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          (typeof value === 'string' || typeof value === 'number')) {
        (combinedStyle as any)[key] = value;
      }
    });
  }
  
  // Diğer CSS property'leri ekle
  const cssProps = ['display', 'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight', 
                   'justifyContent', 'backgroundColor', 'border', 'borderRadius', 'padding', 'margin',
                   'position', 'top', 'left', 'right', 'bottom', 'zIndex'];
  
  cssProps.forEach(prop => {
    if (processedProps[prop]) {
      (combinedStyle as any)[prop] = processedProps[prop];
    }
  });
  
  return combinedStyle;
};

/**
 * Component metadata'sını merge et
 */
export const mergeComponentMetadata = (
  currentMetadata: ComponentMetadata | undefined,
  storedMetadata: ComponentMetadata
): ComponentMetadata => {
  if (!currentMetadata) return storedMetadata;
  
  return {
    ...currentMetadata, // Güncel metadata (yeni props'lar dahil)
    ...storedMetadata,   // Eski metadata (mevcut props değerleri korunur)
    props: {
      ...currentMetadata.props, // Güncel props tanımları
      ...storedMetadata.props    // Eski props değerleri (varsa)
    },
    initialValues: {
      ...currentMetadata.initialValues, // Güncel initial values
      ...storedMetadata.initialValues    // Eski initial values (varsa)
    }
  };
};
