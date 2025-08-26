import React, { forwardRef, CSSProperties, useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import { Sidebar } from '../Sidebar';
import { CanvasActions } from '../CanvasActions';
import { PropsMenu, ComponentMetadata } from '../PropsMenu';

export interface CanvasComponent {
  id: string;
  metadata: ComponentMetadata;
  props: Record<string, any>;
  children?: CanvasComponent[]; // Container component'ler için nested component'ler
  parentId?: string; // Parent container'ın ID'si
}

export interface FullPageProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundColor?: string;
  components?: Array<{
    name: string;
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
}> = ({ component, index, moveComponent, deleteComponent, isSelected, selectComponent, addComponentToContainer, setCanvasComponents, selectedComponentId, onContainerHover }) => {
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
      onContainerHover(component.id, isOverContainer);
    }
  }, [isOverContainer, component.id, component.metadata.type, onContainerHover]);

  const renderComponent = () => {
    if (component.metadata.p) {
      const ComponentToRender = component.metadata.p;
      return <ComponentToRender {...component.props} />;
    }
    
    // Container component'ler için özel render
    if (component.metadata.type === 'container') {
      return (
        <div 
          style={{
            ...component.props.style,
            position: 'relative',
            minHeight: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            padding: '16px',
            backgroundColor: 'transparent',
          }}
          className={component.props.className}
          id={component.props.id}
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
            <div style={{ 
              width: '100%', 
              zIndex: 11,
            }}>
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
                    // Nested component'i sil
                    console.log('Deleting nested component:', { childId, containerId: component.id });
                    setCanvasComponents?.(prev => 
                      prev.map(comp => 
                        comp.id === component.id 
                          ? { ...comp, children: comp.children?.filter(c => c.id !== childId) || [] }
                          : comp
                      )
                    );
                  }}
                  isSelected={selectedComponentId === child.id}
                  selectComponent={selectComponent}
                  addComponentToContainer={addComponentToContainer}
                  setCanvasComponents={setCanvasComponents}
                  selectedComponentId={selectedComponentId}
                />
              ))}
            </div>
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
              border: isOverContainer ? '2px dashed #007bff' : '2px dashed transparent',
              borderRadius: '4px',
              backgroundColor: isOverContainer ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
              zIndex: 10,
            }}
            className="container-drop-zone"
          >
            {isOverContainer && (
              <div style={{
                color: '#007bff',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #007bff',
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

  console.log('DraggableComponent render:', {
    componentId: component.id,
    componentType: component.metadata.type,
    componentName: component.metadata.name,
    hasAddFunction: !!addComponentToContainer
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        width: component.metadata.type === 'container' ? '100%' : 'fit-content',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        display: 'block',
        border: isSelected ? '2px solid #007bff' : '2px solid transparent',
        borderRadius: '6px',
        padding: '4px',
        transition: 'all 0.2s ease',
      }}
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
      
      {/* Seçim butonları */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '-40px',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 1000,
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit component:', component.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
            title="Edit component"
          >
            <FiEdit3 />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComponent(component.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.color = '#dc3545';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
            title="Delete component"
          >
            <FiTrash2 />
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
  isOverAnyContainer: boolean;
  onContainerHover?: (containerId: string, isHovering: boolean) => void;
}> = ({ onDrop, components, moveComponent, deleteComponent, selectedComponentId, selectComponent, addComponentToContainer, setCanvasComponents, isOverAnyContainer, onContainerHover }) => {
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
      const canDrop = !isOverAnyContainer;
      
      console.log('Ana DropZone canDrop check:', { 
        isOverAnyContainer, 
        canDrop 
      });
      
      return canDrop;
    },
  });

  return (
    <div
      ref={drop}
      style={{
        maxHeight: 'calc(100vh - 50px)',
        minHeight: '200px',
        border: isOverCurrent ? '2px dashed #007bff' : '2px dashed #ddd',
        borderRadius: '8px',
        //backgroundColor: isOverCurrent ? 'transparent' : 'transparent',
        padding: '20px',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
        overflow: 'auto',
      }}
    >
      {components.length === 0 ? (
        <div style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
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
    const [isOverAnyContainer, setIsOverAnyContainer] = useState(false);

    // Global click handler - component dışına tıklandığında seçimi kapat
    const handleCanvasClick = (e: React.MouseEvent) => {
      // PropsMenu alanına tıklandıysa seçimi kapatma
      const target = e.target as HTMLElement;
      if (target.closest('[data-props-menu]')) {
        return;
      }
    };

    const addComponent = (metadata: ComponentMetadata, parentId?: string) => {
      console.log('addComponent called:', { componentName: metadata.name, parentId });
      
      const newComponent: CanvasComponent = {
        id: `component-${Date.now()}-${Math.random()}`,
        metadata,
        props: { ...metadata.initialValues },
        children: [],
        parentId,
      };
      
      if (parentId) {
        console.log('Adding to container:', parentId);
        // Container'a component ekle
        setCanvasComponents(prev => {
          const updated = prev.map(comp => 
            comp.id === parentId 
              ? { ...comp, children: [...(comp.children || []), newComponent] }
              : comp
          );
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
      setCanvasComponents(prev => prev.filter(comp => comp.id !== componentId));
      setSelectedComponentId(null);
    };

    const selectComponent = (componentId: string) => {
      setSelectedComponentId(componentId);
    };

    const handlePropsChange = (componentId: string, newProps: Record<string, any>) => {
      setCanvasComponents(prev => 
        prev.map(comp => 
          comp.id === componentId 
            ? { ...comp, props: newProps }
            : comp
        )
      );
    };

    const getSelectedComponentMetadata = (): ComponentMetadata | null => {
      if (!selectedComponentId) return null;
      const component = canvasComponents.find(comp => comp.id === selectedComponentId);
      return component ? component.metadata : null;
    };

    const containerStyle: CSSProperties = {
      flexDirection: 'column',
      width: '100vw',
      height: 'calc(100vh - 50px)',
      backgroundColor,
      boxSizing: 'border-box',
      overflow: 'hidden',
      ...style,
    };

    const canvasStyle: CSSProperties = {
      width: '100%',
      height: 'calc(100% - 50px)',
      padding: '0 24px',
      backgroundColor: '#ffffff',
      overflow: 'auto',
    };

    return (
      <DndProvider backend={HTML5Backend}>
        <CanvasActions 
          canvasData={canvasComponents}
          onSave={(version) => console.log('Save requested for version:', version)}
          onReset={() => console.log('Reset requested')}
        />
        <div ref={ref} style={containerStyle} {...props} onClick={handleCanvasClick}>
          <div style={canvasStyle}>
            <DropZone
              onDrop={addComponent}
              components={canvasComponents}
              moveComponent={moveComponent}
              deleteComponent={deleteComponent}
              selectedComponentId={selectedComponentId}
              selectComponent={selectComponent}
              addComponentToContainer={addComponentToContainer}
              setCanvasComponents={setCanvasComponents}
              isOverAnyContainer={isOverAnyContainer}
              onContainerHover={(_containerId, isHovering) => {
                setIsOverAnyContainer(isHovering);
              }}
            />
            
            {children}
          </div>

          <Sidebar
            width={320}
            height={400}
            initialPosition={{ x: 50, y: 100 }}
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
          />
        </div>
      </DndProvider>
    );
  }
);

FullPage.displayName = 'FullPage';
