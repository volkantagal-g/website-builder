import { forwardRef, CSSProperties, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Sidebar } from '../Sidebar';
import { CanvasActions } from '../CanvasActions';
import { PropsMenu } from '../PropsMenu';
import { ZoomControl } from '../ZoomControl';
import { ZOOM_CONSTANTS } from '../../constants/zoom';
import { STORAGE_KEYS } from '../../constants/storage';
import { ApiProvider, useApi } from '../../context/ApiContext';
import { BreakpointProvider, useBreakpointContext } from '../../context/BreakpointContext';
import { CanvasProps, CanvasComponent, ComponentMetadata } from '../../types/canvas';
import { DevicePreset } from '../DeviceSelector/DeviceSelector';
import { useCanvas } from '../../hooks/useCanvas';
import { useCanvasRestore } from '../../hooks/useCanvasRestore';
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard';
import { DropZone } from './DropZone';

// Canvas içeriği için ayrı component
const CanvasContent: React.FC<{
  backgroundColor: string;
  components: Array<{
    name: string;
    logo?: React.ReactNode;
    components: ComponentMetadata[];
  }>;
  style?: CSSProperties;
  children: React.ReactNode;
  palette: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, unknown>;
  ref: React.Ref<HTMLDivElement>;
  props: Record<string, unknown>;
}> = ({ backgroundColor: _backgroundColor, components, style, children, palette, radius, spacing, typography, ref, props }) => {
  // Flatten components array for easier access
  const flattenedComponents = components.flatMap(cat => cat.components);
  
  // Use custom hooks
  const canvasState = useCanvas(flattenedComponents);
  useCanvasRestore(flattenedComponents, canvasState.setCanvasComponents);
  
  // Breakpoint context
  const { selectedBreakpoint } = useBreakpointContext();
  
  // Breakpoint değiştiğinde device'ı güncelle
  useEffect(() => {
    setCurrentDevice({
      id: selectedBreakpoint.id,
      name: selectedBreakpoint.name,
      width: selectedBreakpoint.width,
      height: selectedBreakpoint.height,
      icon: <></>,
      category: selectedBreakpoint.category
    });
  }, [selectedBreakpoint]);
  
  // Preview state
  const [isPreview, setIsPreview] = useState(false);
  
  // Zoom state
  const [zoom, setZoom] = useState(() => {
    const savedZoom = localStorage.getItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY);
    return savedZoom ? parseFloat(savedZoom) : 1;
  });
  
  // PropsMenu height state
  const [propsMenuHeight, setPropsMenuHeight] = useState(0);
  
  // Device state - breakpoint'e göre ayarla
  const [currentDevice, setCurrentDevice] = useState<DevicePreset>(() => {
    // Breakpoint'e göre device oluştur
    return {
      id: selectedBreakpoint.id,
      name: selectedBreakpoint.name,
      width: selectedBreakpoint.width,
      height: selectedBreakpoint.height,
      icon: <></>,
      category: selectedBreakpoint.category
    };
  });
  
  // Device change handler
  const handleDeviceChange = (device: DevicePreset) => {
    setCurrentDevice(device);
    // Device'ı localStorage'a kaydet
    localStorage.setItem(STORAGE_KEYS.CANVAS_DEVICE, JSON.stringify({
      ...device,
      icon: undefined // Icon'u JSON'da saklama
    }));
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
    setZoom(1);
    localStorage.setItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY, '1');
  };
  
  // Keyboard shortcuts
  useCanvasKeyboard(
    canvasState.selectedComponentId,
    canvasState.clipboard,
    canvasState.copyComponent,
    canvasState.pasteComponent
  );

  // Endpoint'leri yükle ve "Run All" fonksiyonunu otomatik çalıştır
  const { executeAllActiveEndpoints } = useApi();
  const [hasRunInitialEndpoints, setHasRunInitialEndpoints] = useState(false);

  // Sayfa yüklendiğinde endpoint'leri otomatik çalıştır
  useEffect(() => {
    if (!hasRunInitialEndpoints) {
      console.log('🚀 Auto-executing endpoints on page load');
      executeAllActiveEndpoints();
      setHasRunInitialEndpoints(true);
    }
  }, [executeAllActiveEndpoints, hasRunInitialEndpoints]);

  // Canvas components değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (canvasState.canvasComponents.length > 0) {
      console.log('💾 Saving canvas to localStorage:', canvasState.canvasComponents.length, 'components');
      
      // metadata.p'yi kaldırarak kaydet (JSON'da saklanamaz)
      const componentsForStorage = canvasState.canvasComponents.map(comp => ({
        ...comp,
        metadata: {
          ...comp.metadata,
          p: undefined // Function'ı kaldır
        }
      }));
      
      // Mevcut canvas data'yı oku (endpoint'leri korumak için)
      const savedCanvasData = localStorage.getItem(STORAGE_KEYS.CANVAS_COMPONENTS);
      let existingEndpoints = [];
      
      if (savedCanvasData) {
        try {
          const parsed = JSON.parse(savedCanvasData);
          if (parsed.endpoints && Array.isArray(parsed.endpoints)) {
            existingEndpoints = parsed.endpoints;
          }
        } catch (error) {
          console.error('Error reading existing endpoints:', error);
        }
      }
      
      // Canvas data'yı endpoints ile birlikte kaydet
      const canvasData = {
        components: componentsForStorage,
        endpoints: existingEndpoints // Mevcut endpoint'leri koru
      };
      
      localStorage.setItem(STORAGE_KEYS.CANVAS_COMPONENTS, JSON.stringify(canvasData));
      console.log('✅ Saved to localStorage');
    }
  }, [canvasState.canvasComponents]);

  // Bu useEffect artık gerekli değil - device change handler'da kaydediyoruz

  const containerStyle: CSSProperties = {
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: '0',
    ...(style || {}),
  };

  const canvasStyle: CSSProperties = {
    width: `${selectedBreakpoint.width}px`,
    height: `${selectedBreakpoint.height}px`,
    backgroundColor: '#ffffff',
    overflow: 'auto',
    transform: `scale(${zoom})`,
    transformOrigin: 'center top',
    transition: 'transform 0.2s ease, width 0.3s ease, height 0.3s ease',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  return (
    <div ref={ref} style={containerStyle} {...props}>
      {/* Canvas Actions Header */}
      <CanvasActions 
        canvasData={canvasState.canvasComponents}
        onSave={(version) => console.log('Save requested for version:', version)}
        onReset={() => console.log('Reset requested')}
        onDeviceChange={handleDeviceChange}
        currentDevice={currentDevice}
        onPreviewToggle={setIsPreview}
      />

      <ZoomControl
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        minZoom={ZOOM_CONSTANTS.MIN_ZOOM}
        maxZoom={ZOOM_CONSTANTS.MAX_ZOOM}
        zoomStep={ZOOM_CONSTANTS.ZOOM_STEP}
        propsMenuHeight={propsMenuHeight}
      />

      <div 
        style={{
          flex: '1',
          overflow: 'auto',
          display: 'flex',
          //alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={canvasState.handleCanvasClick}
      >
        <div style={canvasStyle} data-canvas>
          <DropZone
            onDrop={canvasState.addComponent}
            components={canvasState.canvasComponents}
            moveComponent={canvasState.moveComponent}
            deleteComponent={canvasState.deleteComponent}
            selectedComponentId={canvasState.selectedComponentId}
            selectComponent={canvasState.selectComponent}
            selectParentComponent={canvasState.selectParentComponent}
            addComponentToContainer={canvasState.addComponentToContainer}
            setCanvasComponents={canvasState.setCanvasComponents}
            hoveredContainerId={canvasState.hoveredContainerId}
            hoveredComponentId={canvasState.hoveredComponentId}
            copyComponent={canvasState.copyComponent}
            onContainerHover={(containerId, isHovering) => {
              if (isHovering) {
                canvasState.setHoveredContainerId(containerId);
              } else if (canvasState.hoveredContainerId === containerId) {
                canvasState.setHoveredContainerId(null);
              }
            }}
            onComponentHover={(componentId) => canvasState.setHoveredComponentId(componentId || null)}
            isPreview={isPreview}
          />
          
          {children}
        </div>
      </div>

      <Sidebar
        width={320}
        height={400}
        initialPosition={{ x: 50, y: 150 }}
        backgroundColor="#ffffff"
        shadow={true}
        components={components}
        onDrag={() => {}}
        onDragEnd={() => {}}
      />

      <PropsMenu
        selectedComponent={canvasState.getSelectedComponentMetadata()}
        onPropsChange={canvasState.handlePropsChange}
        componentId={canvasState.selectedComponentId || undefined}
        canvasData={canvasState.canvasComponents}
        palette={palette}
        radius={radius}
        spacing={spacing}
        typography={typography}
        onComponentHover={(componentId) => canvasState.setHoveredComponentId(componentId || null)}
        onComponentSelect={(componentId) => canvasState.setSelectedComponentId(componentId)}
        onHeightChange={setPropsMenuHeight}
        onComponentMove={(dragId, targetId, position) => {
          const moveComponentInTree = (components: CanvasComponent[]): CanvasComponent[] => {
            const findComponent = (comps: CanvasComponent[]): CanvasComponent | undefined => {
              for (const comp of comps) {
                if (comp.id === dragId) {
                  return comp;
                }
                if (comp.children && comp.children.length > 0) {
                  const found = findComponent(comp.children);
                  if (found) return found;
                }
              }
              return undefined;
            };
            
            const draggedComponent: CanvasComponent | undefined = findComponent(components);
            
            if (!draggedComponent) {
              console.error('Dragged component not found:', dragId);
              return components;
            }
            
            const removeComponent = (comps: CanvasComponent[]): CanvasComponent[] => {
              return comps.map(comp => {
                if (comp.id === dragId) {
                  return null; // Bu component'i kaldır
                }
                if (comp.children && comp.children.length > 0) {
                  return {
                    ...comp,
                    children: removeComponent(comp.children)
                  };
                }
                return comp;
              }).filter(comp => comp !== null) as CanvasComponent[];
            };
            
            let newComponents = removeComponent([...components]);
            
            if (position === 'inside') {
              const addToContainer = (comps: CanvasComponent[]): CanvasComponent[] => {
                return comps.map(comp => {
                  if (comp.id === targetId) {
                    return {
                      ...comp,
                      children: [...(comp.children || []), {
                        ...draggedComponent!,
                        parentId: comp.id
                      }]
                    };
                  }
                  if (comp.children && comp.children.length > 0) {
                    return { ...comp, children: addToContainer(comp.children) };
                  }
                  return comp;
                });
              };
              
              newComponents = addToContainer(newComponents);
            } else {
              // Target component'i recursive olarak bul
              const findTargetRecursive = (comps: CanvasComponent[]): { component: CanvasComponent, parentArray: CanvasComponent[], index: number } | null => {
                for (let i = 0; i < comps.length; i++) {
                  if (comps[i].id === targetId) {
                    return { component: comps[i], parentArray: comps, index: i };
                  }
                  const children = comps[i].children;
                  if (children && children.length > 0) {
                    const found = findTargetRecursive(children);
                    if (found) return found;
                  }
                }
                return null;
              };
              
              const targetInfo = findTargetRecursive(newComponents);
              
              if (targetInfo) {
                const componentToAdd = {
                  ...draggedComponent,
                  parentId: targetInfo.component.parentId
                };
                
                if (position === 'before') {
                  targetInfo.parentArray.splice(targetInfo.index, 0, componentToAdd);
                } else {
                  targetInfo.parentArray.splice(targetInfo.index + 1, 0, componentToAdd);
                }
              } else {
                console.error('Target component not found for before/after positioning');
              }
            }
            
            return newComponents;
          };
          
          canvasState.setCanvasComponents(prev => moveComponentInTree(prev));
        }}
      />
    </div>
  );
};

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      backgroundColor = 'transparent',
      components = [],
      style,
      children,
      palette = {},
      radius = {},
      spacing = {},
      typography = {},
      ...props
    },
    ref
  ) => {
      return (
    <ApiProvider>
      <BreakpointProvider>
        <DndProvider backend={HTML5Backend}>
          <CanvasContent
            backgroundColor={backgroundColor}
            components={components}
            style={style}
            children={children}
            palette={palette}
            radius={radius}
            spacing={spacing}
            typography={typography}
            ref={ref}
            props={props}
          />
        </DndProvider>
      </BreakpointProvider>
    </ApiProvider>
  );
  }
);

Canvas.displayName = 'Canvas';
