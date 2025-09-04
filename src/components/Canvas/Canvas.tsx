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
import { CanvasProps, CanvasComponent, ComponentMetadata } from '../../types/canvas';
// import { DevicePreset } from '../DeviceSelector/DeviceSelector';
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

  // Current device değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANVAS_DEVICE, JSON.stringify({
      ...canvasState.currentDevice,
      icon: undefined // Icon'u JSON'da saklama
    }));
  }, [canvasState.currentDevice]);

  const containerStyle: CSSProperties = {
    flexDirection: 'column',
    width: '100vw',
    height: 'auto',
    backgroundColor: '#f0f0f0',
    boxSizing: 'border-box',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 20px 100px',
    ...(style || {}),
  };

  const canvasStyle: CSSProperties = {
    width: `${canvasState.currentDevice.width}px`,
    height: `${canvasState.currentDevice.height}px`,
    margin: '0 auto',
    backgroundColor: '#ffffff',
    overflow: 'auto',
    transform: `scale(${canvasState.zoom})`,
    transformOrigin: 'center top',
    transition: 'transform 0.2s ease',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  return (
    <div ref={ref} style={containerStyle} {...props} onClick={canvasState.handleCanvasClick}>
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
        />
        
        {children}
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
        <DndProvider backend={HTML5Backend}>
          <CanvasActions 
            canvasData={[]} // Bu kısım CanvasContent'te yönetilecek
            onSave={(version) => console.log('Save requested for version:', version)}
            onReset={() => console.log('Reset requested')}
            onDeviceChange={() => {}} // Bu kısım CanvasContent'te yönetilecek
            currentDevice={{
              id: 'iphone-11',
              name: 'iPhone 11',
              width: 375,
              height: 812,
              icon: <></>,
              category: 'mobile'
            }} // Bu kısım CanvasContent'te yönetilecek
          />
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
          <ZoomControl
            zoom={1} // Bu kısım CanvasContent'te yönetilecek
            onZoomIn={() => {}}
            onZoomOut={() => {}}
            onZoomReset={() => {}}
            minZoom={ZOOM_CONSTANTS.MIN_ZOOM}
            maxZoom={ZOOM_CONSTANTS.MAX_ZOOM}
            zoomStep={ZOOM_CONSTANTS.ZOOM_STEP}
          />
        </DndProvider>
      </ApiProvider>
    );
  }
);

Canvas.displayName = 'Canvas';
