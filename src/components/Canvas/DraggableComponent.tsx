import React, { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FiArrowUp, FiTrash2, FiCopy } from 'react-icons/fi';
import { useApi } from '../../context/ApiContext';
import { processComponentProps } from '../../utils/templateBinding';
import { DraggableComponentProps } from '../../types/canvas';
import { getStyleValue, combineStyleProperties, getComponentLibrary, addToContainerRecursive, findAndRemoveComponent, removeComponentRecursive, isContainerComponent } from '../../utils/canvasHelpers';

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  component, 
  index, 
  moveComponent, 
  deleteComponent, 
  isSelected, 
  selectComponent, 
  selectParentComponent,
  addComponentToContainer, 
  setCanvasComponents, 
  selectedComponentId, 
  onContainerHover, 
  onComponentHover,
  hoveredComponentId, 
  zIndex = 1, 
  canvasComponents, 
  copyComponent 
}) => {
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

  // Container component'ler için drop zone (hem Pinnate hem general container'lar için)
  const [{ isOver: isOverContainer }, containerDrop] = useDrop({
    accept: ['SIDEBAR_COMPONENT', 'COMPONENT'], // Hem sidebar hem canvas component'leri kabul et
    drop: (item: any) => {
      
      if (addComponentToContainer && (component.metadata.type === 'container' || isContainerComponent(component.metadata.name))) {
        if (item.component) {
          // Sidebar'dan gelen component
          console.log('Adding sidebar component to container');
          addComponentToContainer(component.id, item.component);
        } else if (item.componentId && setCanvasComponents) {
          // Canvas'tan gelen component (ID ile)
          console.log('Moving canvas component to container by ID:', item.componentId);
          
          setCanvasComponents(prev => {
            // Helper function'ları kullan
            const { found, updated } = findAndRemoveComponent(prev, item.componentId);
            
            if (found) {
              // Component'i yeni container'a ekle
              return addToContainerRecursive(updated, component.id, { ...found, parentId: component.id });
            }
            
            return prev;
          });
        }
      } else {
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: (_item: any) => {
      const canDrop = component.metadata.type === 'container' || isContainerComponent(component.metadata.name);
      
      return canDrop;
    },
  });

  // Container hover durumunu global state'e bildir
  useEffect(() => {
    if ((component.metadata.type === 'container' || isContainerComponent(component.metadata.name)) && onContainerHover) {
      // Sadece bu container hover ediliyorsa callback'i çağır
      if (isOverContainer) {
        onContainerHover(component.id, true);
      } else {
        // Hover'dan çıkıldığında da bildir
        onContainerHover(component.id, false);
      }
    }
  }, [isOverContainer, component.id, component.metadata.type, component.metadata.name, onContainerHover]);

  const renderComponent = () => {
    // Pinnate component'ler için normal render (container olsa bile)
    if (component.metadata.p && component.library !== 'general') {
      const ComponentToRender = component.metadata.p;
      
      // Pinnate component'ler için güvenli style handling
      const processedProps = processComponentProps(component.props, { getResponseData });
      
      // CSS property'leri filtrele, sadece gerçek CSS property'leri çıkar
      // Component'in kendi prop'larını (children, size, variant, color, etc.) koru
      const { 
        id,
        ...otherProps 
      } = processedProps;
      
      // CSS property'leri style objesinde birleştir
      const combinedStyle = combineStyleProperties(processedProps);
      
      // Container ise children'ları da render et
      if (component.metadata.type === 'container' || isContainerComponent(component.metadata.name)) {
        
        return (
          <div style={{ position: 'relative' }}>
            <ComponentToRender {...otherProps} style={combinedStyle} id={id}>
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
                          setCanvasComponents(prev => removeComponentRecursive(prev, childId));
                        }
                      }}
                      isSelected={selectedComponentId === child.id}
                      selectComponent={selectComponent}
                      selectParentComponent={selectParentComponent}
                      addComponentToContainer={(containerId, metadata) => {
                        // Nested container'a component ekle - recursive olarak
                        console.log('Adding to nested container:', { containerId, componentName: metadata.name });
                        if (setCanvasComponents) {
                          const library = getComponentLibrary(metadata.name);
                          const newComponentId = `component-${Date.now()}-${Math.random()}`;
                          
                          const newComponent = {
                            id: newComponentId,
                            library,
                            metadata,
                            props: { ...metadata.initialValues },
                            children: [],
                            parentId: containerId,
                          };
                          
                          setCanvasComponents(prev => addToContainerRecursive(prev, containerId, newComponent));
                          
                          // Yeni eklenen component'i seç
                          if (selectComponent) {
                            selectComponent(newComponentId);
                          }
                        }
                      }}
                      setCanvasComponents={setCanvasComponents}
                      selectedComponentId={selectedComponentId}
                      onContainerHover={onContainerHover}
                      onComponentHover={onComponentHover}
                      hoveredComponentId={hoveredComponentId}
                      zIndex={zIndex + 1}
                      canvasComponents={canvasComponents}
                      copyComponent={copyComponent}
                    />
                  ))}
                </>
              )}
            </ComponentToRender>
            
            {/* Container drop zone - React DnD nested list example gibi */}
            {(component.metadata.type === 'container' || isContainerComponent(component.metadata.name)) && (() => {
              return true;
            })() && (
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
                  minHeight: '20px', // Minimum yükseklik ekle
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
            )}
          </div>
        );
      }
      
      return <ComponentToRender {...otherProps} style={combinedStyle} id={id} />;
    }
    
    // Container component'ler için özel render (sadece general container'lar)
    if (component.metadata.type === 'container' || isContainerComponent(component.metadata.name)) {
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
        margin,
        position,
        top,
        left,
        right,
        bottom,
        zIndex: propZIndex
      } = processedProps;
      
      // Style objesini güvenli hale getir
      const safeStyle: React.CSSProperties = {
        position: position || 'relative',
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
        zIndex: propZIndex || zIndex,
        // Position değerleri
        ...(top && { top }),
        ...(left && { left }),
        ...(right && { right }),
        ...(bottom && { bottom }),
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
                      setCanvasComponents(prev => removeComponentRecursive(prev, childId));
                    }
                  }}
                  isSelected={selectedComponentId === child.id}
                  selectComponent={selectComponent}
                  selectParentComponent={selectParentComponent}
                  addComponentToContainer={(containerId, metadata) => {
                    // Nested container'a component ekle - recursive olarak
                    console.log('Adding to nested container:', { containerId, componentName: metadata.name });
                    if (setCanvasComponents) {
                      const library = getComponentLibrary(metadata.name);
                      const newComponentId = `component-${Date.now()}-${Math.random()}`;
                      
                      const newComponent = {
                        id: newComponentId,
                        library,
                        metadata,
                        props: { ...metadata.initialValues },
                        children: [],
                        parentId: containerId,
                      };
                      
                      setCanvasComponents(prev => addToContainerRecursive(prev, containerId, newComponent));
                      
                      // Yeni eklenen component'i seç
                      if (selectComponent) {
                        selectComponent(newComponentId);
                      }
                    }
                  }}
                  setCanvasComponents={setCanvasComponents}
                  selectedComponentId={selectedComponentId}
                  onContainerHover={onContainerHover}
                  onComponentHover={onComponentHover}
                  hoveredComponentId={hoveredComponentId}
                  zIndex={zIndex + 1}
                  canvasComponents={canvasComponents}
                  copyComponent={copyComponent}
                />
              ))}
            </>
          )}
          
          {/* Container drop zone - React DnD nested list example gibi */}
          {(component.metadata.type === 'container' || isContainerComponent(component.metadata.name)) && (() => {
            return true;
          })() && (
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
          )}
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
  
  const componentWidth = getStyleValue(processedProps, 'width');
  const componentHeight = getStyleValue(processedProps, 'height');
  const componentMaxWidth = getStyleValue(processedProps, 'maxWidth');
  const componentMaxHeight = getStyleValue(processedProps, 'maxHeight');
  const componentDisplay = getStyleValue(processedProps, 'display');
  const componentPosition = getStyleValue(processedProps, 'position');
  const componentLeft = getStyleValue(processedProps, 'left');
  const componentRight = getStyleValue(processedProps, 'right');
  const componentBottom = getStyleValue(processedProps, 'bottom');
  const componentTop = getStyleValue(processedProps, 'top');
  const componentZIndex = getStyleValue(processedProps, 'zIndex');

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        width: componentWidth && typeof componentWidth === 'string' && componentWidth.includes('px') ? (parseInt(componentWidth) + 12 + 'px') : componentWidth || '100%',
        height: componentHeight && typeof componentHeight === 'string' && componentHeight.includes('px') ? (parseInt(componentHeight) + 12 + 'px') : componentHeight || 'auto',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: componentPosition || 'relative',
        ...(componentLeft && { left: componentLeft }),
        ...(componentRight && { right: componentRight }),
        ...(componentBottom && { bottom: componentBottom }),
        ...(componentTop && { top: componentTop }),
        zIndex: componentZIndex || zIndex,
        display: componentDisplay || 'block',
        maxWidth: componentMaxWidth || 'none',
        maxHeight: componentMaxHeight || 'none',
        border: isSelected ? '2px solid #6b3ff7' : 
                hoveredComponentId === component.id ? '1px solid #dc3545' : 'none',
        borderRadius: '6px',
        //transition: 'all 0.2s ease',
        backgroundColor: hoveredComponentId === component.id ? 'rgba(248, 249, 250, 0.5)' : 'transparent',
      }}
      data-component
      onMouseEnter={() => onComponentHover?.(component.id)}
      onMouseLeave={() => onComponentHover?.(undefined)}
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
        onMouseEnter={() => onComponentHover?.(component.id)}
        onMouseLeave={() => onComponentHover?.(undefined)}
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
              console.log('🔘 Parent button clicked for component:', component.id);
              console.log('🔧 selectParentComponent function:', selectParentComponent);
              selectParentComponent?.(component.id);
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
            title="Select parent component"
          >
            <FiArrowUp size={14} />
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
