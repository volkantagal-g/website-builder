import React from 'react';
import { useDrop } from 'react-dnd';
import { DropZoneProps } from '../../types/canvas';
import { DraggableComponent } from './DraggableComponent';

export const DropZone: React.FC<DropZoneProps> = ({ 
  onDrop, 
  components, 
  moveComponent, 
  deleteComponent, 
  selectedComponentId, 
  selectComponent, 
  selectParentComponent,
  addComponentToContainer, 
  setCanvasComponents, 
  hoveredContainerId, 
  onContainerHover, 
  onComponentHover,
  hoveredComponentId, 
  copyComponent 
}) => {
  const [{ isOver: isOverCurrent }, drop] = useDrop({
    accept: 'SIDEBAR_COMPONENT',
    drop: (item: { component: any }) => {
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
                selectParentComponent={selectParentComponent}
                addComponentToContainer={addComponentToContainer}
                setCanvasComponents={setCanvasComponents}
                selectedComponentId={selectedComponentId}
                onContainerHover={onContainerHover}
                onComponentHover={onComponentHover}
                hoveredComponentId={hoveredComponentId}
                zIndex={11}
                canvasComponents={components}
                copyComponent={copyComponent}
              />
            ))}
        </div>
      )}
    </div>
  );
};
