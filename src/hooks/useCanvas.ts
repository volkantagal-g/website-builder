import { useState } from 'react';
import { CanvasComponent, ComponentMetadata } from '../types/canvas';
import { DevicePreset } from '../components/DeviceSelector/DeviceSelector';
import { ZOOM_CONSTANTS } from '../constants/zoom';
import { 
  findComponentRecursive, 
  removeComponentRecursive, 
  addToContainerRecursive, 
  updatePropsRecursive,
  generateNewIds,
  getComponentLibrary
} from '../utils/canvasHelpers';

export const useCanvas = (components: ComponentMetadata[]) => {
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DevicePreset>({
    id: 'laptop',
    name: 'Laptop',
    width: 1366,
    height: 768,
    icon: null,
    category: 'desktop'
  });
  const [zoom, setZoom] = useState(() => {
    const savedZoom = localStorage.getItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY);
    return savedZoom ? parseFloat(savedZoom) : ZOOM_CONSTANTS.DEFAULT_ZOOM;
  });
  const [clipboard, setClipboard] = useState<CanvasComponent | null>(null);

  // Global click handler - component dışına tıklandığında seçimi kapat
  const handleCanvasClick = (e: React.MouseEvent) => {
    // PropsMenu alanına tıklandıysa seçimi kapatma
    const target = e.target as HTMLElement;
    if (target.closest('[data-props-menu]')) {
      return;
    }
    
    // Component'e tıklanmadıysa ve canvas'a tıklandıysa selected component'ı temizle
    if (target.closest('[data-canvas]') && !target.closest('[data-component]')) {
      setSelectedComponentId(null);
    }
  };

  const addComponent = (metadata: ComponentMetadata, parentId?: string) => {
    console.log('addComponent called:', { componentName: metadata.name, parentId });
    
    // Component'in hangi library'den geldiğini belirle
    const library = getComponentLibrary(metadata.name);
    
    // Pinnate component'ler için p function'ı geri ekle
    let finalMetadata = metadata;
    if (library === 'pinnate' && !metadata.p) {
      // Components array'inden orijinal metadata'yı bul
      const originalMetadata = components.find(
        (meta: ComponentMetadata) => meta.name === metadata.name
      );
      
      if (originalMetadata && originalMetadata.p) {
        console.log('🔧 Re-injecting p function for new component:', metadata.name);
        finalMetadata = {
          ...metadata,
          p: originalMetadata.p
        };
      } else {
        console.log('❌ No p function found for:', metadata.name);
      }
    }
    
    const newComponent: CanvasComponent = {
      id: `component-${Date.now()}-${Math.random()}`,
      library, // Library bilgisini ekle
      metadata: finalMetadata, // Güncellenmiş metadata'yı kullan
      props: { ...metadata.initialValues },
      children: [],
      parentId,
    };
    
    if (parentId) {
      console.log('Adding to container:', parentId);
      // Container'a component ekle - recursive olarak
      setCanvasComponents(prev => {
        const updated = addToContainerRecursive(prev, parentId, newComponent);
        console.log('Updated canvas components:', updated);
        return updated;
      });
      
      // Container'ı selected yap
      setSelectedComponentId(parentId);
    } else {
      console.log('Adding to main canvas');
      // Ana canvas'a component ekle
      setCanvasComponents(prev => [...prev, newComponent]);
      
      // Yeni eklenen component'i otomatik seç
      setSelectedComponentId(newComponent.id);
    }
  };

  const addComponentToContainer = (containerId: string, metadata: ComponentMetadata) => {
    console.log('addComponentToContainer called:', { containerId, componentName: metadata.name });
    addComponent(metadata, containerId);
  };

  // Copy fonksiyonu - component'i clipboard'a kopyala
  const copyComponent = (componentId: string) => {
    const component = findComponentRecursive(canvasComponents, componentId);
    if (component) {
      setClipboard(component);
      console.log('📋 Component copied:', component.metadata.name);
    }
  };

  // Paste fonksiyonu - clipboard'dan component'i yapıştır
  const pasteComponent = (targetComponentId?: string) => {
    if (!clipboard) return;
    
    const newComponent = generateNewIds(clipboard);
    
    if (targetComponentId) {
      // Target component'in container olup olmadığını kontrol et
      const targetComponent = findComponentRecursive(canvasComponents, targetComponentId);
      
      if (targetComponent && targetComponent.metadata.type === 'container') {
        // Container component'in içine yapıştır
        setCanvasComponents(prev => {
          return addToContainerRecursive(prev, targetComponentId, { ...newComponent, parentId: targetComponentId });
        });
        
        // Target component'i seç
        setSelectedComponentId(targetComponentId);
      } else {
        // Target component container değilse ana canvas'a yapıştır
        setCanvasComponents(prev => [...prev, newComponent]);
        
        // Yeni component'i seç
        setSelectedComponentId(newComponent.id);
      }
    } else {
      // Ana canvas'a yapıştır
      setCanvasComponents(prev => [...prev, newComponent]);
      
      // Yeni component'i seç
      setSelectedComponentId(newComponent.id);
    }
    
    console.log('📋 Component pasted:', newComponent.metadata.name);
  };

  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    setCanvasComponents(prev => {
      const newComponents = [...prev];
      const draggedComponent = newComponents[dragIndex];
      newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, draggedComponent);
      return newComponents;
    });
    // Drag edilen component'i otomatik seç
    const movedComponent = canvasComponents[hoverIndex];
    if (movedComponent) {
      setSelectedComponentId(movedComponent.id);
    }
  };

  const deleteComponent = (componentId: string) => {
    setCanvasComponents(prev => removeComponentRecursive(prev, componentId));
    setSelectedComponentId(null);
  };

  const handleDeviceChange = (device: DevicePreset) => {
    setCurrentDevice(device);
    console.log('Device changed to:', device);
  };

  const selectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handlePropsChange = (componentId: string, newProps: Record<string, any>) => {
    console.log('🔄 Props change requested:', { componentId, newProps });
    
    setCanvasComponents(prev => {
      const updated = updatePropsRecursive(prev, componentId, newProps);
      console.log('✅ Canvas components updated:', updated);
      return updated;
    });
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => {
      const newZoom = Math.min(prev + ZOOM_CONSTANTS.ZOOM_STEP, ZOOM_CONSTANTS.MAX_ZOOM);
      localStorage.setItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY, newZoom.toString());
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - ZOOM_CONSTANTS.ZOOM_STEP, ZOOM_CONSTANTS.MIN_ZOOM);
      localStorage.setItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY, newZoom.toString());
      return newZoom;
    });
  };

  const handleZoomReset = () => {
    setZoom(ZOOM_CONSTANTS.DEFAULT_ZOOM);
    localStorage.setItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY, ZOOM_CONSTANTS.DEFAULT_ZOOM.toString());
  };

  const getSelectedComponentMetadata = (): ComponentMetadata | null => {
    if (!selectedComponentId) return null;
    
    const component = findComponentRecursive(canvasComponents, selectedComponentId);
    return component ? component.metadata : null;
  };

  return {
    // State
    canvasComponents,
    selectedComponentId,
    hoveredContainerId,
    hoveredComponentId,
    currentDevice,
    zoom,
    clipboard,
    
    // Setters
    setCanvasComponents,
    setSelectedComponentId,
    setHoveredContainerId,
    setHoveredComponentId,
    setCurrentDevice,
    setZoom,
    setClipboard,
    
    // Actions
    handleCanvasClick,
    addComponent,
    addComponentToContainer,
    copyComponent,
    pasteComponent,
    moveComponent,
    deleteComponent,
    handleDeviceChange,
    selectComponent,
    handlePropsChange,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    getSelectedComponentMetadata,
  };
};
