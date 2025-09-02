import React, { forwardRef, CSSProperties, useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiEdit3, FiMonitor, FiTrash2, FiCopy } from 'react-icons/fi';
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
  palette?: Record<string, string>; // Pinnate palette CSS variables
  radius?: Record<string, string>; // Pinnate radius CSS variables
  spacing?: Record<string, string>; // Pinnate spacing CSS variables
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
  canvasComponents: CanvasComponent[]; // Canvas components'ları prop olarak ekle
  copyComponent: (id: string) => void; // Copy fonksiyonu
}> = ({ component, index, moveComponent, deleteComponent, isSelected, selectComponent, addComponentToContainer, setCanvasComponents, selectedComponentId, onContainerHover, hoveredComponentId, zIndex = 1, canvasComponents, copyComponent }) => {
  const { getResponseData } = useApi();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'COMPONENT',
    item: { 
      index, 
      componentId: component.id,
      parentId: component.parentId 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'COMPONENT',
    hover: (item: { index: number; componentId: string; parentId?: string }) => {
      if (item.index === index && item.parentId === component.parentId) return;
      // Container component'ler için pozisyon değişikliği yapma
      if (component.metadata.type === 'container') return;
      
      // Aynı parent içindeyse moveComponent kullan
      if (item.parentId === component.parentId) {
        moveComponent(item.index, index);
        item.index = index;
      }
    },
    canDrop: () => component.metadata.type !== 'container',
  });

  // Container component'ler için drop zone
  const [{ isOver: isOverContainer }, containerDrop] = useDrop({
    accept: ['SIDEBAR_COMPONENT', 'COMPONENT'], // Hem sidebar hem canvas component'leri kabul et
    drop: (item: any) => {
      console.log('Container drop triggered:', {
        containerId: component.id,
        componentName: item.component?.name || item.index,
        isContainer: component.metadata.type === 'container',
        itemType: item.component?.type || 'canvas-component',
        fullItem: item
      });
      
      if (addComponentToContainer && component.metadata.type === 'container') {
        if (item.component) {
          // Sidebar'dan gelen component
          console.log('Adding sidebar component to container');
          addComponentToContainer(component.id, item.component);
        } else if (item.componentId && setCanvasComponents) {
          // Canvas'tan gelen component (ID ile)
          console.log('Moving canvas component to container by ID:', item.componentId);
          
          setCanvasComponents(prev => {
            // Component'i bul ve kaldır
            const findAndRemoveComponent = (components: CanvasComponent[]): { 
              found: CanvasComponent | null, 
              updated: CanvasComponent[] 
            } => {
              for (let i = 0; i < components.length; i++) {
                if (components[i].id === item.componentId) {
                  const found = components[i];
                  const updated = components.filter((_, idx) => idx !== i);
                  return { found, updated };
                }
                
                if (components[i].children && components[i].children!.length > 0) {
                  const result = findAndRemoveFromChildren(components[i].children!);
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
            
            const findAndRemoveFromChildren = (children: CanvasComponent[]): { 
              found: CanvasComponent | null, 
              updated: CanvasComponent[] 
            } => {
              for (let i = 0; i < children.length; i++) {
                if (children[i].id === item.componentId) {
                  const found = children[i];
                  const updated = children.filter((_, idx) => idx !== i);
                  return { found, updated };
                }
                
                if (children[i].children && children[i].children!.length > 0) {
                  const result = findAndRemoveFromChildren(children[i].children!);
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
            
            const { found, updated } = findAndRemoveComponent(prev);
            
            if (found) {
              // Component'i yeni container'a ekle
              const addToContainer = (components: CanvasComponent[]): CanvasComponent[] => {
                return components.map(comp => {
                  if (comp.id === component.id) {
                    return { 
                      ...comp, 
                      children: [...(comp.children || []), { ...found, parentId: component.id }] 
                    };
                  } else if (comp.children && comp.children.length > 0) {
                    return { ...comp, children: addToContainer(comp.children) };
                  }
                  return comp;
                });
              };
              
              return addToContainer(updated);
            }
            
            return prev;
          });
        }
      } else {
        console.log('Cannot add to container:', {
          hasAddFunction: !!addComponentToContainer,
          componentType: component.metadata.type,
          hasComponent: !!item.component,
          hasIndex: item.index !== undefined
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
        canDrop,
        itemType: _item.component ? 'sidebar' : 'canvas'
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
      
      // Pinnate component'ler için güvenli style handling
      const processedProps = processComponentProps(component.props, { getResponseData });
      
      // CSS property'leri filtrele, sadece gerçek CSS property'leri çıkar
      // Component'in kendi prop'larını (children, size, variant, color, etc.) koru
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
        margin,
        ...otherProps 
      } = processedProps;
      
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
      if (display) (combinedStyle as any).display = display;
      if (width) combinedStyle.width = width;
      if (height) combinedStyle.height = height;
      if (maxWidth) combinedStyle.maxWidth = maxWidth;
      if (maxHeight) combinedStyle.maxHeight = maxHeight;
      if (justifyContent) (combinedStyle as any).justifyContent = justifyContent;
      if (backgroundColor) combinedStyle.backgroundColor = backgroundColor;
      if (border) combinedStyle.border = border;
      if (borderRadius) combinedStyle.borderRadius = borderRadius;
      if (padding) combinedStyle.padding = padding;
      if (margin) combinedStyle.margin = margin;
      
      return <ComponentToRender {...otherProps} style={combinedStyle} className={className} id={id} />;
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
      
      // Style objesini güvenli hale getir
      const safeStyle: CSSProperties = {
        position: 'relative',
        minHeight: '1px',
        display: display || 'flex',
        width: width || '100%',
        height: height || 'auto',
        maxWidth: maxWidth || 'none',
        maxHeight: maxHeight || 'none',
        justifyContent: justifyContent || 'flex-start',
        backgroundColor: backgroundColor || 'transparent',
        border: border || (isSelected ? '1px dashed #6b3ff7' : 
               hoveredComponentId === component.id ? '1px solid #ff4444' : 'none'),
        borderRadius: borderRadius || '4px',
        padding: padding || '16px',
        margin: margin || '0',
        outlineOffset: '4px',
        zIndex: zIndex,
      };

      // Eğer style objesi varsa ve geçerliyse ekle
      if (style && typeof style === 'object' && !Array.isArray(style)) {
        Object.entries(style).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && 
              typeof key === 'string' && 
              (typeof value === 'string' || typeof value === 'number')) {
            (safeStyle as any)[key] = value;
          }
        });
      }

      return (
        <div 
          style={safeStyle}
          className={className}
          id={id}
          data-component
        > 
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
                  canvasComponents={canvasComponents} // Canvas components'ları ekle
                  copyComponent={copyComponent} // Copy fonksiyonu
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
              border: isOverContainer ? '2px dashed #6b3ff7' : 'none',
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

  // Component props'larını işle (hem Pinnate hem General için)
  const processedProps = processComponentProps(component.props, { getResponseData });
  
  // Style değerlerini al (önce style objesinden, sonra direkt props'lardan)
  const getStyleValue = (key: string) => {
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

  const componentWidth = getStyleValue('width');
  const componentDisplay = getStyleValue('display');

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        width: componentWidth && typeof componentWidth === 'string' && componentWidth.includes('px') ? (parseInt(componentWidth) + 12 + 'px') : componentWidth || '100%',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        display: componentDisplay || 'block',
        border: isSelected ? '2px solid #6b3ff7' : 'none',
        borderRadius: '6px',
        //padding: '4px',
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
              copyComponent(component.id);
            }}
            style={{
              background: '#28a745',
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
              e.currentTarget.style.backgroundColor = '#218838';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Copy component"
          >
            <FiCopy size={14} />
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
  copyComponent: (id: string) => void;
}> = ({ onDrop, components, moveComponent, deleteComponent, selectedComponentId, selectComponent, addComponentToContainer, setCanvasComponents, hoveredContainerId, onContainerHover, hoveredComponentId, copyComponent }) => {
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
        border: isOverCurrent ? '2px dashed #6b3ff7' : 'none',
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
                canvasComponents={components} // Canvas components'ları ekle
                copyComponent={copyComponent} // Copy fonksiyonu
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
      palette = {},
      radius = {},
      spacing = {},
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

    // Copy fonksiyonu - component'i clipboard'a kopyala
    const copyComponent = (componentId: string) => {
      const findComponentRecursive = (components: CanvasComponent[]): CanvasComponent | null => {
        for (const comp of components) {
          if (comp.id === componentId) {
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
      if (component) {
        setClipboard(component);
        console.log('📋 Component copied:', component.metadata.name);
      }
    };

    // Paste fonksiyonu - clipboard'dan component'i yapıştır
    const pasteComponent = (targetComponentId?: string) => {
      if (!clipboard) return;
      
      // Yeni ID'ler oluştur (recursive olarak)
      const generateNewIds = (comp: CanvasComponent): CanvasComponent => {
        return {
          ...comp,
          id: `component-${Date.now()}-${Math.random()}`,
          children: comp.children ? comp.children.map(generateNewIds) : []
        };
      };
      
      const newComponent = generateNewIds(clipboard);
      
      if (targetComponentId) {
        // Target component'in container olup olmadığını kontrol et
        const findTargetComponent = (components: CanvasComponent[]): CanvasComponent | null => {
          for (const comp of components) {
            if (comp.id === targetComponentId) {
              return comp;
            }
            if (comp.children && comp.children.length > 0) {
              const found = findTargetComponent(comp.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const targetComponent = findTargetComponent(canvasComponents);
        
        if (targetComponent && targetComponent.metadata.type === 'container') {
          // Container component'in içine yapıştır
          setCanvasComponents(prev => {
            const addToContainerRecursive = (components: CanvasComponent[]): CanvasComponent[] => {
              return components.map(comp => {
                if (comp.id === targetComponentId) {
                  return { ...comp, children: [...(comp.children || []), { ...newComponent, parentId: targetComponentId }] };
                } else if (comp.children && comp.children.length > 0) {
                  return { ...comp, children: addToContainerRecursive(comp.children) };
                }
                return comp;
              });
            };
            
            return addToContainerRecursive(prev);
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
        // General element'ler için güncel metadata'yı bul
        const allComponents = components.flatMap(cat => cat.components);
        const currentMetadata = allComponents.find(
          (meta: ComponentMetadata) => meta.name === comp.metadata.name
        );
        
        // Eski metadata ile güncel metadata'yı merge et
        const mergedMetadata = currentMetadata ? {
          ...currentMetadata, // Güncel metadata (yeni props'lar dahil)
          ...comp.metadata,   // Eski metadata (mevcut props değerleri korunur)
          props: {
            ...currentMetadata.props, // Güncel props tanımları
            ...comp.metadata.props    // Eski props değerleri (varsa)
          },
          initialValues: {
            ...currentMetadata.initialValues, // Güncel initial values
            ...comp.metadata.initialValues    // Eski initial values (varsa)
          }
        } : comp.metadata;
        
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
        const allComponents = components.flatMap(cat => cat.components);
        const originalMetadata = allComponents.find(
          (meta: ComponentMetadata) => meta.name === comp.metadata.name
        );
        
        if (originalMetadata) {
          console.log('✅ Re-injecting Pinnate p function for', comp.metadata.name, ':', typeof originalMetadata.p);
          
          // Pinnate component'ler için de metadata'yı merge et
          const mergedMetadata = {
            ...originalMetadata, // Güncel metadata (yeni props'lar dahil)
            ...comp.metadata,    // Eski metadata (mevcut props değerleri korunur)
            props: {
              ...originalMetadata.props, // Güncel props tanımları
              ...comp.metadata.props     // Eski props değerleri (varsa)
            },
            initialValues: {
              ...originalMetadata.initialValues, // Güncel initial values
              ...comp.metadata.initialValues     // Eski initial values (varsa)
            }
          };
          
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
    }, [selectedComponentId, clipboard]);

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
      console.log('🔄 Props change requested:', { componentId, newProps });
      
      setCanvasComponents(prev => {
        const updatePropsRecursive = (components: CanvasComponent[]): CanvasComponent[] => {
          return components.map(comp => {
            if (comp.id === componentId) {
              console.log('📝 Updating component props:', { 
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
              copyComponent={copyComponent}
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
            palette={palette} // Palette prop'unu geç
            radius={radius} // Radius prop'unu geç
            spacing={spacing} // Spacing prop'unu geç
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
