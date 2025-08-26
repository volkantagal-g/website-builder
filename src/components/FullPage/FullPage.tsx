import React, { forwardRef, CSSProperties, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import { Sidebar } from '../Sidebar';
import { CanvasActions } from '../CanvasActions';

export interface ComponentMetadata {
  name: string;
  description: string;
  category?: string;
  props: Record<string, string>;
  initialValues: Record<string, any>;
  type: string;
  p?: React.ComponentType<any>;
}

export interface CanvasComponent {
  id: string;
  metadata: ComponentMetadata;
  props: Record<string, any>;
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
}> = ({ component, index, moveComponent, deleteComponent, isSelected, selectComponent }) => {
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
      moveComponent(item.index, index);
      item.index = index;
    },
  });

  const renderComponent = () => {
    if (component.metadata.p) {
      const ComponentToRender = component.metadata.p;
      return <ComponentToRender {...component.props} />;
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
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
        display: 'block',
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
          zIndex: 20,
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
}> = ({ onDrop, components, moveComponent, deleteComponent, selectedComponentId, selectComponent }) => {
  const [{ isOver: isOverCurrent }, drop] = useDrop({
    accept: 'SIDEBAR_COMPONENT',
    drop: (item: { component: ComponentMetadata }) => {
      onDrop(item.component);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        maxHeight: 'calc(100vh - 50px)',
        minHeight: '200px',
        border: isOverCurrent ? '2px dashed #007bff' : '2px dashed #ddd',
        borderRadius: '8px',
        backgroundColor: isOverCurrent ? '#f0f8ff' : 'transparent',
        padding: '20px',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
        overflow: 'auto',
      }}
    >
      {isOverCurrent ? (
        <div style={{ color: '#007bff', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>
          
        </div>
      ) : components.length === 0 ? (
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

    // Global click handler - component dışına tıklandığında seçimi kapat
    const handleCanvasClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedComponentId(null);
      }
    };

    const addComponent = (metadata: ComponentMetadata) => {
      const newComponent: CanvasComponent = {
        id: `component-${Date.now()}-${Math.random()}`,
        metadata,
        props: { ...metadata.initialValues },
      };
      setCanvasComponents(prev => [...prev, newComponent]);
    };

    const moveComponent = (dragIndex: number, hoverIndex: number) => {
      setCanvasComponents(prev => {
        const newComponents = [...prev];
        const draggedComponent = newComponents[dragIndex];
        newComponents.splice(dragIndex, 1);
        newComponents.splice(hoverIndex, 0, draggedComponent);
        return newComponents;
      });
    };

    const deleteComponent = (componentId: string) => {
      setCanvasComponents(prev => prev.filter(comp => comp.id !== componentId));
      setSelectedComponentId(null);
    };

    const selectComponent = (componentId: string) => {
      setSelectedComponentId(componentId);
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
            onDrag={(position) => console.log('Sürükleniyor:', position)}
            onDragEnd={(position) => console.log('Sürükleme bitti:', position)}
          />
        </div>
      </DndProvider>
    );
  }
);

FullPage.displayName = 'FullPage';
