import React, { forwardRef, CSSProperties, useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiEdit3, FiMonitor, FiTrash2 } from 'react-icons/fi';
import { Sidebar } from '../Sidebar';
import { CanvasActions } from '../CanvasActions';
import { PropsMenu } from '../PropsMenu';
import { ZoomControl } from '../ZoomControl';
import { ZOOM_CONSTANTS } from '../../constants/zoom';
import { STORAGE_KEYS } from '../../constants/storage';
import { DevicePreset } from '../DeviceSelector/DeviceSelector';
import { ApiProvider, useApi } from '../../context/ApiContext';
import { processComponentProps } from '../../utils/templateBinding';

// ComponentMetadata interface'ini burada tanımlayalım
export interface ComponentMetadata {
  name: string;
  description: string;
  category?: string;
  props: Record<string, any>;
  initialValues: Record<string, any>;
  type: string;
  p?: React.ComponentType<any>;
}

export interface CanvasComponent {
  id: string;
  library: string; // Component'in hangi library'den geldiği (pinnate, general)
  metadata: ComponentMetadata;
  props: Record<string, any>;
  children?: CanvasComponent[]; // Container component'ler için nested component'ler
  parentId?: string; // Parent container'ın ID'si
}

export interface FullPageProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundColor?: string;
  components?: Array<{
    name: string;
    logo?: React.ReactNode;
    components: ComponentMetadata[];
  }>;
  children?: React.ReactNode;
}

// Draggable Component Item
const DraggableComponent: React.FC<{
  component: CanvasComponent;
  index: number;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  deleteComponent: (id: string) => void;
  isSelected: boolean;
  selectComponent: (id: string) => void;
  addComponentToContainer?: (containerId: string, metadata: ComponentMetadata) => void;
  setCanvasComponents?: React.Dispatch<React.SetStateAction<CanvasComponent[]>>;
  selectedComponentId?: string | null;
  onContainerHover?: (containerId: string, isHovering: boolean) => void;
  hoveredComponentId?: string | null;
  zIndex?: number;
}> = ({ component, index, moveComponent, deleteComponent, isSelected, selectComponent, addComponentToContainer, setCanvasComponents, selectedComponentId, onContainerHover, hoveredComponentId, zIndex = 1 }) => {
  const { getResponseData } = useApi();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'COMPONENT',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'COMPONENT',
    hover: (item: { index: number }) => {
      if (item.index === index) return;
      // Container component'ler için pozisyon değişikliği yapma
      if (component.metadata.type === 'container') return;
      moveComponent(item.index, index);
      item.index = index;
    },
    canDrop: () => component.metadata.type !== 'container',
  });

  // Container component'ler için drop zone
  const [{ isOver: isOverContainer }, containerDrop] = useDrop({
    accept: 'SIDEBAR_COMPONENT',
    drop: (item: any) => {
      console.log('Container drop triggered:', {
        containerId: component.id,
        componentName: item.component?.name,
        isContainer: component.metadata.type === 'container',
        itemType: item.component?.type,
        fullItem: item
      });
      
      if (addComponentToContainer && component.metadata.type === 'container' && item.component) {
        console.log('Adding component to container');
        addComponentToContainer(component.id, item.component);
      } else {
        console.log('Cannot add to container:', {
          hasAddFunction: !!addComponentToContainer,
          componentType: component.metadata.type,
          hasComponent: !!item.component
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: (_item: any) => {
      const canDrop = component.metadata.type === 'container';
      
      console.log('Container canDrop check:', { 
        componentId: component.id, 
        componentType: component.metadata.type, 
        canDrop 
      });
      return canDrop;
    },
  });

  // Container hover durumunu global state'e bildir
  useEffect(() => {
    if (component.metadata.type === 'container' && onContainerHover) {
      // Sadece bu container hover ediliyorsa callback'i çağır
      if (isOverContainer) {
        onContainerHover(component.id, true);
      } else {
        // Hover'dan çıkıldığında da bildir
        onContainerHover(component.id, false);
      }
    }
  }, [isOverContainer, component.id, component.metadata.type, onContainerHover]);

  const renderComponent = () => {
    if (component.metadata.p && component.library !== 'general') {
      const ComponentToRender = component.metadata.p;
      
      return <ComponentToRender {...component.props} />;
    }
    
    // Container component'ler için özel render
    if (component.metadata.type === 'container') {
      // Process container props with template binding
      const processedProps = processComponentProps(component.props, { getResponseData });
      
      // CSS property'leri style objesinden çıkar, sadece style ve diğer valid prop'ları kullan
      const { 
        style, 
        className, 
        id, 
        display, 
        width, 
        height, 
        maxWidth, 
        maxHeight, 
        justifyContent, 
        backgroundColor, 
        border, 
        borderRadius, 
        padding, 
        margin
      } = processedProps;
      
      return (
        <div 
          style={{
            ...style,
            position: 'relative',
            minHeight: '60px',
            display: display || 'flex',
            width: width || '100%',
            height: height || 'auto',
            maxWidth: maxWidth || 'none',
            maxHeight: maxHeight || 'none',
            justifyContent: justifyContent || 'flex-start',
            backgroundColor: backgroundColor || 'transparent',
            border: border || (isSelected ? '1px dashed #6b3ff7' : 
                   hoveredComponentId === component.id ? '1px solid #ff4444' : '1px dashed #ccc'),
            borderRadius: borderRadius || '4px',
            padding: padding || '16px',
            margin: margin || '0',
            outlineOffset: '4px',
            zIndex: zIndex,
          }}
          className={className}
          id={id}
          data-component
        >
          {/* Container içeriği - sadece children yoksa göster */}
          {(!component.children || component.children.length === 0) && (
            <div style={{ 
              color: '#666', 
              fontSize: '14px', 
              textAlign: 'center',
              pointerEvents: 'none',
              marginBottom: '8px',
              zIndex: 1,
            }}>
              {component.props.children}
            </div>
          )}
          
          {/* Nested component'ler */}
          {component.children && component.children.length > 0 && (
            <>
              {component.children.map((child, childIndex) => (
                <DraggableComponent
                  key={child.id}
                  component={child}
                  index={childIndex}
                  moveComponent={(dragIndex, hoverIndex) => {
                    // Nested component'ler arası sıralama
                    console.log('Moving nested component:', { dragIndex, hoverIndex, containerId: component.id });
                  }}
                  deleteComponent={(childId) => {
                    // Nested component'i sil - recursive olarak
                    console.log('Deleting nested component:', { childId, containerId: component.id });
                    if (setCanvasComponents) {
                      const deleteFromContainerRecursive = (components: CanvasComponent[]): CanvasComponent[] => {
                        return components.map(comp => {
                          if (comp.id === component.id) {
                            return { ...comp, children: comp.children?.filter(c => c.id !== childId) || [] };
                          } else if (comp.children && comp.children.length > 0) {
                            return { ...comp, children: deleteFromContainerRecursive(comp.children) };
                          }
                          return comp;
                        });
                      };
                      
                      setCanvasComponents(prev => deleteFromContainerRecursive(prev));
                    }
                  }}
                  isSelected={selectedComponentId === child.id}
                  selectComponent={selectComponent}
                  addComponentToContainer={(containerId, metadata) => {
                    // Nested container'a component ekle - recursive olarak
                    console.log('Adding to nested container:', { containerId, componentName: metadata.name });
                    if (setCanvasComponents) {
                      const addToNestedContainer = (components: CanvasComponent[]): CanvasComponent[] => {
                        return components.map(comp => {
                          if (comp.id === containerId) {
                            // Component'in hangi library'den geldiğini belirle
                            const isGeneralElement = ['Div'].includes(metadata.name);
                            const library = isGeneralElement ? 'general' : 'pinnate';
                            
                            return { ...comp, children: [...(comp.children || []), {
                              id: `component-${Date.now()}-${Math.random()}`,
                              library, // Library bilgisini ekle
                              metadata,
                              props: { ...metadata.initialValues },
                              children: [],
                              parentId: containerId,
                            }] };
                          } else if (comp.children && comp.children.length > 0) {
                            return { ...comp, children: addToNestedContainer(comp.children) };
                          }
                          return comp;
                        });
                      };
                      
                      setCanvasComponents(prev => addToNestedContainer(prev));
                    }
                  }}
                  setCanvasComponents={setCanvasComponents}
                  selectedComponentId={selectedComponentId}
                  onContainerHover={onContainerHover}
                  hoveredComponentId={hoveredComponentId}
                  zIndex={zIndex + 1}
                />
              ))}
            </>
          )}
          
          {/* Container drop zone - React DnD nested list example gibi */}
          <div
            ref={containerDrop}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: isOverContainer ? '2px dashed #6b3ff7' : '2px dashed transparent',
              borderRadius: '4px',
              backgroundColor: isOverContainer ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
              zIndex: 9,
            }}
            onClick={() => selectComponent(component.id)}
            className="container-drop-zone"
          >
            {isOverContainer && (
              <div style={{
                color: '#6b3ff7',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #6b3ff7',
              }}>
                Drop component here
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <strong>{component.metadata.name}</strong>
        <p>{component.metadata.description}</p>
      </div>
    );
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        width: component.props?.width && typeof component.props.width === 'string' && component.props.width.includes('px') ? (parseInt(component.props.width) + 12 + 'px') : '100%',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        display: 'block',
        border: isSelected ? '2px solid #6b3ff7' : '2px solid transparent',
        borderRadius: '6px',
        padding: '4px',
        transition: 'all 0.2s ease',
      }}
      data-component
    >
      {/* Görünmez overlay div */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
        onClick={() => selectComponent(component.id)}
      />
      
      {/* Seçim butonları - Sağ alt tarafta */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          right: '8px',
          bottom: '8px',
          display: 'flex',
          gap: '6px',
          zIndex: 1000,
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit component:', component.id);
            }}
            style={{
              background: '#6b3ff7',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b3ff7';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Edit component"
          >
            <FiEdit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComponent(component.id);
            }}
            style={{
              background: '#dc3545',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c82333';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Delete component"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
      
      {renderComponent()}
    </div>
  );
};

// Drop Zone for new components
const DropZone: React.FC<{
  onDrop: (component: ComponentMetadata) => void;
  components: CanvasComponent[];
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  deleteComponent: (id: string) => void;
  selectedComponentId: string | null;
  selectComponent: (id: string) => void;
  addComponentToContainer?: (containerId: string, metadata: ComponentMetadata) => void;
  setCanvasComponents?: React.Dispatch<React.SetStateAction<CanvasComponent[]>>;
  hoveredContainerId: string | null;
  onContainerHover?: (containerId: string, isHovering: boolean) => void;
  hoveredComponentId: string | null;
}> = ({ onDrop, components, moveComponent, deleteComponent, selectedComponentId, selectComponent, addComponentToContainer, setCanvasComponents, hoveredContainerId, onContainerHover, hoveredComponentId }) => {
  const [{ isOver: isOverCurrent }, drop] = useDrop({
    accept: 'SIDEBAR_COMPONENT',
    drop: (item: { component: ComponentMetadata }) => {
      onDrop(item.component);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
    canDrop: () => {
      // Mouse herhangi bir container üzerinde hover varsa drop yapma
      const canDrop = !hoveredContainerId;
      
      return canDrop;
    },
  });

  return (
    <div
      ref={drop}
      style={{
        height: '100%',
        border: isOverCurrent ? '2px dashed #6b3ff7' : '2px dashed #ddd',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        overflow: 'auto',
      }}
    >
      {components.length === 0 ? (
        <div style={{ color: '#999', fontSize: '14px', textAlign: 'center', paddingTop: '24px' }}>
          Sidebar'dan component sürükleyin
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%' }}>
          {components.map((component, index) => (
            <DraggableComponent
              key={component.id}
              component={component}
              index={index}
              moveComponent={moveComponent}
              deleteComponent={deleteComponent}
              isSelected={selectedComponentId === component.id}
              selectComponent={selectComponent}
              addComponentToContainer={addComponentToContainer}
              setCanvasComponents={setCanvasComponents}
              selectedComponentId={selectedComponentId}
              onContainerHover={onContainerHover}
              hoveredComponentId={hoveredComponentId}
              zIndex={11}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FullPage = forwardRef<HTMLDivElement, FullPageProps>(
  (
    {
      backgroundColor = 'transparent',
      components = [],
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>([]);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
    const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
    const [currentDevice, setCurrentDevice] = useState<DevicePreset>({
      id: 'laptop',
      name: 'Laptop',
      width: 1366,
      height: 768,
      icon: <FiMonitor size={16} />,
      category: 'desktop'
    });
    const [zoom, setZoom] = useState(() => {
      const savedZoom = localStorage.getItem(ZOOM_CONSTANTS.ZOOM_STORAGE_KEY);
      return savedZoom ? parseFloat(savedZoom) : ZOOM_CONSTANTS.DEFAULT_ZOOM;
    });

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
      const isGeneralElement = ['Div'].includes(metadata.name);
      const library = isGeneralElement ? 'general' : 'pinnate';
      
      // Pinnate component'ler için p function'ı geri ekle
      let finalMetadata = metadata;
      if (library === 'pinnate' && !metadata.p) {
        // Components array'inden orijinal metadata'yı bul
        const allComponents = components.flatMap(cat => cat.components);
        const originalMetadata = allComponents.find(
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
          const addToContainerRecursive = (components: CanvasComponent[]): CanvasComponent[] => {
            return components.map(comp => {
              if (comp.id === parentId) {
                return { ...comp, children: [...(comp.children || []), newComponent] };
              } else if (comp.children && comp.children.length > 0) {
                return { ...comp, children: addToContainerRecursive(comp.children) };
              }
              return comp;
            });
          };
          
          const updated = addToContainerRecursive(prev);
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
      setCanvasComponents(prev => {
        const deleteFromContainerRecursive = (components: CanvasComponent[]): CanvasComponent[] => {
          return components
            .filter(comp => comp.id !== componentId)
            .map(comp => {
              if (comp.children && comp.children.length > 0) {
                return { ...comp, children: deleteFromContainerRecursive(comp.children) };
              }
              return comp;
            });
        };
        
        return deleteFromContainerRecursive(prev);
      });
      setSelectedComponentId(null);
    };

    const handleDeviceChange = (device: DevicePreset) => {
      setCurrentDevice(device);
      console.log('Device changed to:', device);
    };

    const selectComponent = (componentId: string) => {
      setSelectedComponentId(componentId);
    };

    const restoreComponent = (comp: CanvasComponent) => {
      // Component'in kaynağını belirle
      const isGeneralElement = ['Div'].includes(comp.metadata.name);
      const library = isGeneralElement ? 'general' : 'pinnate';
      
      if (isGeneralElement) {
        return {
          ...comp,
          library,
          metadata: {
            ...comp.metadata,
            p: ({ children, style, ...props }: any) => (
              <div style={style} {...props}>
                {children && children.length > 0 ? children.map((child: CanvasComponent) => restoreComponent(child)) : <></>}
              </div>
            )
          }
        };
      } else {
        // Pinnate Component için orijinal metadata'yı bul
        const allComponents = components.flatMap(cat => cat.components);
        const originalMetadata = allComponents.find(
          (meta: ComponentMetadata) => meta.name === comp.metadata.name
        );
        
        if (originalMetadata) {
          console.log('✅ Re-injecting Pinnate p function for', comp.metadata.name, ':', typeof originalMetadata.p);
          return {
            ...comp,
            library, // Library bilgisini ekle
            metadata: {
              ...comp.metadata,
              p: originalMetadata.p // Pinnate function'ı geri ekle
            }
          };
        }
        
        console.log('❌ No Pinnate metadata found for:', comp.metadata.name);
        return comp;
      }
    };

    // Recursive olarak tüm nested component'leri restore et
    const restoreComponentRecursive = (comp: any): CanvasComponent => {
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
    };

    // Canvas components değiştiğinde localStorage'a kaydet
    useEffect(() => {
      if (canvasComponents.length > 0) {
        console.log('💾 Saving canvas to localStorage:', canvasComponents.length, 'components');
        
        // metadata.p'yi kaldırarak kaydet (JSON'da saklanamaz)
        const componentsForStorage = canvasComponents.map(comp => ({
          ...comp,
          metadata: {
            ...comp.metadata,
            p: undefined // Function'ı kaldır
          }
        }));
        
        localStorage.setItem(STORAGE_KEYS.CANVAS_COMPONENTS, JSON.stringify(componentsForStorage));
        console.log('✅ Saved to localStorage');
      } else {
        //localStorage.removeItem(STORAGE_KEYS.CANVAS_COMPONENTS);
        //console.log('🗑️ Removed from localStorage');
      }
    }, [canvasComponents]);

    // Components prop'u yüklendiğinde localStorage'dan canvas'ı geri yükle
    useEffect(() => {
      if (components.length > 0) {
        const savedComponents = localStorage.getItem(STORAGE_KEYS.CANVAS_COMPONENTS);
        
        if (savedComponents) {
          try {
            console.log('📂 Loading canvas from localStorage');
            const parsedComponents = JSON.parse(savedComponents);
            
                         // localStorage'dan yüklenen component'lere metadata.p'yi geri ekle
             // Recursive olarak tüm nested component'leri restore et
             const restoredComponents = parsedComponents.map((comp: any) => {
               console.log('🔄 Starting recursive restore for:', comp.metadata?.name || 'unknown');
               return restoreComponentRecursive(comp);
             });
            
            console.log('Final restored components:', restoredComponents);
            setCanvasComponents(restoredComponents);
          } catch (error) {
            console.error('Error parsing localStorage components:', error);
          }
        } else {
          console.log('No saved components found in localStorage');
        }
      }
    }, [components]);

    // Selected component değiştiğinde localStorage'a kaydet
    useEffect(() => {
      if (selectedComponentId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_COMPONENT, selectedComponentId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_COMPONENT);
      }
    }, [selectedComponentId]);

    // Current device değiştiğinde localStorage'a kaydet
    useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.CANVAS_DEVICE, JSON.stringify({
        ...currentDevice,
        icon: undefined // Icon'u JSON'da saklama
      }));
    }, [currentDevice]);

    const handlePropsChange = (componentId: string, newProps: Record<string, any>) => {
      console.log('Props change requested:', { componentId, newProps });
      
      setCanvasComponents(prev => {
        const updatePropsRecursive = (components: CanvasComponent[]): CanvasComponent[] => {
          return components.map(comp => {
            if (comp.id === componentId) {
              console.log('Updating component props:', { 
                componentId: comp.id, 
                oldProps: comp.props, 
                newProps 
              });
              return { ...comp, props: newProps };
            } else if (comp.children && comp.children.length > 0) {
              return { ...comp, children: updatePropsRecursive(comp.children) };
            }
            return comp;
          });
        };
        
        const updated = updatePropsRecursive(prev);
        console.log('Canvas components updated:', updated);
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
      
      const findComponentRecursive = (components: CanvasComponent[]): CanvasComponent | null => {
        for (const comp of components) {
          if (comp.id === selectedComponentId) {
            return comp;
          }
          if (comp.children && comp.children.length > 0) {
            const found = findComponentRecursive(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const component = findComponentRecursive(canvasComponents);
      return component ? component.metadata : null;
    };

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
      width: `${currentDevice.width}px`,
      height: `${currentDevice.height}px`,
      margin: '0 auto',
      backgroundColor: '#ffffff',
      overflow: 'auto',
      transform: `scale(${zoom})`,
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
          canvasData={canvasComponents}
          onSave={(version) => console.log('Save requested for version:', version)}
          onReset={() => console.log('Reset requested')}
          onDeviceChange={handleDeviceChange}
          currentDevice={currentDevice}
        />
        <div ref={ref} style={containerStyle} {...props} onClick={handleCanvasClick}>
          <div style={canvasStyle} data-canvas>
            <DropZone
              onDrop={addComponent}
              components={canvasComponents}
              moveComponent={moveComponent}
              deleteComponent={deleteComponent}
              selectedComponentId={selectedComponentId}
              selectComponent={selectComponent}
              addComponentToContainer={addComponentToContainer}
              setCanvasComponents={setCanvasComponents}
              hoveredContainerId={hoveredContainerId}
              hoveredComponentId={hoveredComponentId}
              onContainerHover={(containerId, isHovering) => {
                if (isHovering) {
                  // Yeni bir container hover ediliyor
                  setHoveredContainerId(containerId);
                } else if (hoveredContainerId === containerId) {
                  // Hover edilen container'dan çıkıldı
                  setHoveredContainerId(null);
                }
                // Diğer container'lar hover ediliyorsa onları etkileme
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
            selectedComponent={getSelectedComponentMetadata()}
            onPropsChange={handlePropsChange}
            componentId={selectedComponentId || undefined}
            canvasData={canvasComponents}
            onComponentHover={(componentId) => setHoveredComponentId(componentId || null)}
            onComponentSelect={(componentId) => setSelectedComponentId(componentId)}
            onComponentMove={(dragId, targetId, position) => {
              console.log('Component move requested:', { dragId, targetId, position });
              
              // Component'leri recursive olarak bul ve taşı
              const moveComponentInTree = (components: CanvasComponent[]): CanvasComponent[] => {
                // Dragged component'i bul
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
                
                // Component'i kaldır
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
                
                // Target'a component'i ekle
                if (position === 'inside') {
                  // Container'ın içine ekle
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
                  // Before veya after için main canvas'da işle
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
              
              setCanvasComponents(prev => moveComponentInTree(prev));
            }}
          />
        </div>

        {/* Zoom Control */}
        <ZoomControl
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          minZoom={ZOOM_CONSTANTS.MIN_ZOOM}
          maxZoom={ZOOM_CONSTANTS.MAX_ZOOM}
          zoomStep={ZOOM_CONSTANTS.ZOOM_STEP}
        />
        </DndProvider>
      </ApiProvider>
    );
  }
);

FullPage.displayName = 'FullPage';
