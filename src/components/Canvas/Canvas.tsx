import { forwardRef, CSSProperties, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Sidebar } from '../Sidebar';
import { CanvasActions } from '../CanvasActions';
import { PropsMenu } from '../PropsMenu';
import { ZoomControl } from '../ZoomControl';
import { ZOOM_CONSTANTS } from '../../constants/zoom';
import { STORAGE_KEYS } from '../../constants/storage';
import { ApiProvider } from '../../context/ApiContext';
import { CanvasProps, CanvasComponent } from '../../types/canvas';
import { useCanvas } from '../../hooks/useCanvas';
import { useCanvasRestore } from '../../hooks/useCanvasRestore';
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard';
import { DropZone } from './DropZone';

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
      ...props
    },
    ref
  ) => {
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
        
        localStorage.setItem(STORAGE_KEYS.CANVAS_COMPONENTS, JSON.stringify(componentsForStorage));
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
      ...style,
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
      <ApiProvider>
        <DndProvider backend={HTML5Backend}>
          <CanvasActions 
            canvasData={canvasState.canvasComponents}
            onSave={(version) => console.log('Save requested for version:', version)}
            onReset={() => console.log('Reset requested')}
            onDeviceChange={canvasState.handleDeviceChange}
            currentDevice={canvasState.currentDevice}
          />
          <div ref={ref} style={containerStyle} {...props} onClick={canvasState.handleCanvasClick}>
            <div style={canvasStyle} data-canvas>
              <DropZone
                onDrop={canvasState.addComponent}
                components={canvasState.canvasComponents}
                moveComponent={canvasState.moveComponent}
                deleteComponent={canvasState.deleteComponent}
                selectedComponentId={canvasState.selectedComponentId}
                selectComponent={canvasState.selectComponent}
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
              onComponentHover={(componentId) => canvasState.setHoveredComponentId(componentId || null)}
              onComponentSelect={(componentId) => canvasState.setSelectedComponentId(componentId)}
              onComponentMove={(dragId, targetId, position) => {
                console.log('Component move requested:', { dragId, targetId, position });
                
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
                    return comps.filter(comp => {
                      if (comp.id === dragId) {
                        return false;
                      }
                      if (comp.children && comp.children.length > 0) {
                        comp.children = removeComponent(comp.children);
                      }
                      return true;
                    });
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
                    const targetIndex = newComponents.findIndex(c => c.id === targetId);
                    if (targetIndex !== -1) {
                      const componentToAdd = {
                        ...draggedComponent,
                        parentId: undefined
                      };
                      
                      if (position === 'before') {
                        newComponents.splice(targetIndex, 0, componentToAdd);
                      } else {
                        newComponents.splice(targetIndex + 1, 0, componentToAdd);
                      }
                    }
                  }
                  
                  return newComponents;
                };
                
                canvasState.setCanvasComponents(prev => moveComponentInTree(prev));
              }}
            />
          </div>

          <ZoomControl
            zoom={canvasState.zoom}
            onZoomIn={canvasState.handleZoomIn}
            onZoomOut={canvasState.handleZoomOut}
            onZoomReset={canvasState.handleZoomReset}
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
