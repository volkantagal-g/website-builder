import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiGrid, FiList, FiMove } from 'react-icons/fi';
import { ComponentMetadata } from '../FullPage';

export interface PropsMenuProps {
  selectedComponent: ComponentMetadata | null;
  onPropsChange: (componentId: string, newProps: Record<string, any>) => void;
  componentId?: string;
  canvasData?: any; // Component ağacı için
  onComponentMove?: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void; // Component taşıma için
  onComponentHover?: (componentId: string | undefined) => void; // Component hover için
  onComponentSelect?: (componentId: string) => void; // Component seçimi için
}

export const PropsMenu: React.FC<PropsMenuProps> = ({ 
  selectedComponent, 
  onPropsChange, 
  componentId,
  canvasData,
  onComponentMove,
  onComponentHover,
  onComponentSelect
}) => {
  const [isMinimized, setIsMinimized] = useState(true); // Başlangıçta minimize
  const [localProps, setLocalProps] = useState<Record<string, any>>({});
  const [height, setHeight] = useState(300);
  const [previousHeight, setPreviousHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // Yeni: active tab
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  
  // Debug için console.log
  console.log('PropsMenu render:', {
    isMinimized,
    height,
    activeTab,
    selectedComponent: !!selectedComponent,
    selectedComponentName: selectedComponent?.name,
    componentId,
    canvasData: canvasData?.length || 0,
    localProps: Object.keys(localProps),
    draggedComponentId,
    dragOverId,
    dragPosition
  });

  // Component değiştiğinde local props'u güncelle
  React.useEffect(() => {
    if (selectedComponent) {
      // Canvas'tan gelen gerçek component props'larını kullan
      // Eğer canvasData varsa, seçili component'i bul ve props'larını al
      if (canvasData && componentId) {
        const findComponentProps = (components: any[]): Record<string, any> | null => {
          for (const comp of components) {
            if (comp.id === componentId) {
              return comp.props;
            }
            if (comp.children && comp.children.length > 0) {
              const found = findComponentProps(comp.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const canvasProps = findComponentProps(canvasData);
        if (canvasProps) {
          console.log('Loading props from canvas:', canvasProps);
          setLocalProps(canvasProps);
        } else {
          console.log('Using initial values from metadata:', selectedComponent.initialValues);
          setLocalProps({ ...selectedComponent.initialValues });
        }
      } else {
        console.log('Using initial values from metadata:', selectedComponent.initialValues);
        setLocalProps({ ...selectedComponent.initialValues });
      }
      
      // Component seçiliyse maximize et
      setIsMinimized(false);
      // Eski height'ı geri yükle
      setHeight(previousHeight);
    }
    // Component seçili değilse otomatik minimize etme
  }, [selectedComponent, previousHeight, canvasData, componentId]);

  // Height değişikliklerini ayrı useEffect'te izle
  React.useEffect(() => {
    if (height > 0) {
      setPreviousHeight(height);
    }
  }, [height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newHeight = window.innerHeight - e.clientY;
    const clampedHeight = Math.max(100, Math.min(300, newHeight));
    setHeight(clampedHeight);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const handlePropChange = (propName: string, value: any) => {
    const newProps = { ...localProps, [propName]: value };
    setLocalProps(newProps);
    
    if (componentId) {
      onPropsChange(componentId, newProps);
    }
  };

  const handleApplyChanges = () => {
    if (componentId) {
      onPropsChange(componentId, localProps);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    e.dataTransfer.setData('text/plain', componentId);
    setDraggedComponentId(componentId);
    console.log('Drag started:', componentId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'inside';
    
    if (y < height * 0.3) {
      position = 'before';
    } else if (y > height * 0.7) {
      position = 'after';
    } else {
      position = 'inside';
    }
    
    setDragOverId(targetId);
    setDragPosition(position);
    
    console.log('Drag over:', { targetId, position });
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId && targetId && draggedId !== targetId && onComponentMove) {
      const position = dragPosition || 'after';
      console.log('Drop:', { draggedId, targetId, position });
      
      onComponentMove(draggedId, targetId, position);
    }
    
    // Reset drag state
    setDraggedComponentId(null);
    setDragOverId(null);
    setDragPosition(null);
  };

  // Component ağacını recursive olarak render et
  const renderComponentTree = (components: any[], level: number = 0) => {
    if (!components || components.length === 0) {
      return (
        <div style={{ 
          padding: '8px 16px', 
          color: '#999', 
          fontSize: '12px',
          fontStyle: 'italic'
        }}>
          No components
        </div>
      );
    }

    return components.map((component, index) => {
      const isDragged = draggedComponentId === component.id;
      const isDragOver = dragOverId === component.id;
      const isContainer = component.metadata?.type === 'container';
      
      return (
        <div key={component.id || index} style={{ marginLeft: level * 20 }}>
          {/* Drop zone before component */}
          {isDragOver && dragPosition === 'before' && (
            <div style={{
              height: '4px',
              backgroundColor: '#007bff',
              margin: '4px 0',
              borderRadius: '2px',
              opacity: 0.8,
            }} />
          )}
          
          <div 
            draggable
            onDragStart={(e) => handleDragStart(e, component.id)}
            onDragOver={(e) => handleDragOver(e, component.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, component.id)}
            onMouseEnter={() => onComponentHover?.(component.id)}
            onMouseLeave={() => onComponentHover?.(undefined)}
            onClick={() => onComponentSelect?.(component.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              fontSize: '13px',
              backgroundColor: isDragged ? '#e3f2fd' : 
                             isDragOver ? '#f0f8ff' : 'transparent',
              border: isDragged ? '1px dashed #007bff' : 
                     isDragOver ? '1px solid #007bff' : '1px solid transparent',
              opacity: isDragged ? 0.5 : 1,
              // Hover border ekle - kırmızı border
              boxShadow: isDragOver ? '0 0 0 2px #ff4444' : 'none',
            }}
          >
            <FiMove size={12} style={{ marginRight: '8px', color: '#666', opacity: 0.7 }} />
            <FiGrid size={12} style={{ marginRight: '8px', color: '#666' }} />
            <span style={{ color: '#333', fontWeight: '500' }}>
              {component.metadata?.name || component.name || 'Unknown Component'}
            </span>
            {isContainer && (
              <span style={{ 
                marginLeft: '8px', 
                color: '#007bff', 
                fontSize: '11px',
                backgroundColor: '#e3f2fd',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                Container
              </span>
            )}
            {component.children && component.children.length > 0 && (
              <span style={{ 
                marginLeft: '8px', 
                color: '#666', 
                fontSize: '11px',
                backgroundColor: '#e9ecef',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {component.children.length}
              </span>
            )}
          </div>
          
          {/* Drop zone inside container */}
          {isContainer && isDragOver && dragPosition === 'inside' && (
            <div style={{
              margin: '4px 0',
              padding: '8px',
              backgroundColor: '#e3f2fd',
              border: '1px dashed #007bff',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#007bff',
            }}>
              Drop here to nest
            </div>
          )}
          
          {/* Nested components */}
          {component.children && component.children.length > 0 && (
            <div style={{ marginLeft: '16px' }}>
              {renderComponentTree(component.children, level + 1)}
            </div>
          )}
          
          {/* Drop zone after component */}
          {isDragOver && dragPosition === 'after' && (
            <div style={{
              height: '4px',
              backgroundColor: '#007bff',
              margin: '4px 0',
              borderRadius: '2px',
              opacity: 0.8,
            }} />
          )}
        </div>
      );
    });
  };

  const renderPropInput = (propName: string, propType: string, currentValue: any) => {
    const value = localProps[propName] ?? currentValue;

    // Array tipindeki props için özel kontrol
    if (propType.includes('[]') || Array.isArray(value)) {
      const arrayValue = Array.isArray(value) ? value : [];
      
      return (
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#495057',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {propName}
            </label>
            <button
              onClick={() => {
                const newArray = [...arrayValue, { id: Date.now(), label: 'New Option', value: 'new-option' }];
                handlePropChange(propName, newArray);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              + Add Item
            </button>
          </div>
          
          <div style={{
            maxHeight: '120px',
            overflow: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
          }}>
            {arrayValue.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '12px',
                fontStyle: 'italic',
                padding: '16px',
              }}>
                No items. Click "Add Item" to add options.
              </div>
            ) : (
              arrayValue.map((item, index) => (
                <div key={item.id || index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  marginBottom: '8px',
                }}>
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => {
                      const newArray = [...arrayValue];
                      newArray[index] = { ...item, label: e.target.value };
                      handlePropChange(propName, newArray);
                    }}
                    placeholder="Label"
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => {
                      const newArray = [...arrayValue];
                      newArray[index] = { ...item, value: e.target.value };
                      handlePropChange(propName, newArray);
                    }}
                    placeholder="Value"
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                  <button
                    onClick={() => {
                      const newArray = arrayValue.filter((_, i) => i !== index);
                      handlePropChange(propName, newArray);
                    }}
                    style={{
                      padding: '4px 6px',
                      fontSize: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                    title="Remove Item"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Display için özel kontrol
    if (propName === 'display') {
      const displayOptions = [
        'block', 'inline', 'inline-block', 'flex', 'inline-flex', 
        'grid', 'inline-grid', 'none', 'contents', 'table', 'table-row', 
        'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 
        'table-header-group', 'table-row-group', 'table-caption', 'ruby', 
        'ruby-base', 'ruby-text', 'ruby-base-container', 'ruby-text-container'
      ];
      return (
        <select
          value={value || 'block'}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {displayOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Width için özel kontrol
    if (propName === 'width') {
      const widthOptions = [
        'auto', 'fit-content', 'max-content', 'min-content', 'revert', 'unset',
        '0', '1px', '2px', '5px', '10px', '20px', '50px', '100px', '200px', '500px',
        '1%', '5%', '10%', '25%', '50%', '75%', '100%',
        '1em', '2em', '3em', '5em', '10em',
        '1rem', '2rem', '3rem', '5rem', '10rem',
        '1vw', '2vw', '5vw', '10vw', '25vw', '50vw', '100vw',
        '1ch', '2ch', '5ch', '10ch', '20ch', '50ch'
      ];
      return (
        <select
          value={value || '100%'}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {widthOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Height için özel kontrol
    if (propName === 'height') {
      const heightOptions = [
        'auto', 'fit-content', 'max-content', 'min-content', 'revert', 'unset',
        '0', '1px', '2px', '5px', '10px', '20px', '50px', '100px', '200px', '500px',
        '1%', '5%', '10%', '25%', '50%', '75%', '100%',
        '1em', '2em', '3em', '5em', '10em',
        '1rem', '2rem', '3rem', '5rem', '10rem',
        '1vh', '2vh', '5vh', '10vh', '25vh', '50vh', '100vh',
        '1ch', '2ch', '5ch', '10ch', '20ch', '50ch'
      ];
      return (
        <select
          value={value || 'auto'}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {heightOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Max-width için özel kontrol
    if (propName === 'maxWidth') {
      const maxWidthOptions = [
        'none', 'max-content', 'min-content', 'fit-content', 'revert', 'unset',
        '0', '1px', '2px', '5px', '10px', '20px', '50px', '100px', '200px', '500px',
        '1%', '5%', '10%', '25%', '50%', '75%', '100%',
        '1em', '2em', '3em', '5em', '10em',
        '1rem', '2rem', '3rem', '5rem', '10rem',
        '1vw', '2vw', '5vw', '10vw', '25vw', '50vw', '100vw',
        '1ch', '2ch', '5ch', '10ch', '20ch', '50ch'
      ];
      return (
        <select
          value={value || 'none'}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {maxWidthOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Max-height için özel kontrol
    if (propName === 'maxHeight') {
      const maxHeightOptions = [
        'none', 'max-content', 'min-content', 'fit-content', 'revert', 'unset',
        '0', '1px', '2px', '5px', '10px', '20px', '50px', '100px', '200px', '500px',
        '1%', '5%', '10%', '25%', '50%', '75%', '100%',
        '1em', '2em', '3em', '5em', '10em',
        '1rem', '2rem', '3rem', '5rem', '10rem',
        '1vh', '2vh', '5vh', '10vh', '25vh', '50vh', '100vh',
        '1ch', '2ch', '5ch', '10ch', '20ch', '50ch'
      ];
      return (
        <select
          value={value || 'none'}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {maxHeightOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // Select type için özel kontrol
    if (propType.includes('|')) {
      const options = propType.split('|').map(opt => opt.trim());
      return (
        <select
          value={value || options[0]}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    switch (propType.toLowerCase()) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder={`Enter ${propName}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handlePropChange(propName, Number(e.target.value))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder={`Enter ${propName}`}
          />
        );

      case 'boolean':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div
              onClick={() => handlePropChange(propName, !value)}
              style={{
                position: 'relative',
                width: '44px',
                height: '24px',
                backgroundColor: value ? '#007bff' : '#e9ecef',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transform: value ? 'translateX(20px)' : 'translateX(0)',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder={`Enter ${propName}`}
          />
        );
    }
  };

  if (isMinimized) {
    return (
      <div 
        data-props-menu
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          transition: isResizing ? 'none' : 'height 0.3s ease, opacity 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: '14px', color: '#666' }}>
          {selectedComponent ? `Props: ${selectedComponent.name}` : 'No component selected'}
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#666',
          }}
          title="Maximize props menu"
        >
          <FiChevronUp size={20} />
        </button>
      </div>
    );
  }

  return (
    <div 
      data-props-menu
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: isMinimized ? '40px' : `${height}px`,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e9ecef',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transition: isResizing ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          height: '8px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: '#dee2e6',
          borderRadius: '2px',
        }} />
      </div>

      {/* Header */}
      <div style={{
        height: '50px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: '#f8f9fa',
        flexShrink: 0, // Prevent shrinking
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
            Component Panel
          </h3>
          {selectedComponent && (
            <span style={{
              fontSize: '12px',
              color: '#666',
              backgroundColor: '#e9ecef',
              padding: '4px 8px',
              borderRadius: '12px',
            }}>
              {selectedComponent.name}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleApplyChanges}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            title="Apply changes"
          >
            Apply
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
            }}
            title="Minimize props menu"
          >
            <FiChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Tab Menu - Chrome DevTools Style */}
      <div style={{
        height: '40px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        flexShrink: 0, // Prevent shrinking
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          gap: '0',
        }}>
          {/* Properties Tab */}
          <button
            onClick={() => setActiveTab('properties')}
            style={{
              height: '100%',
              padding: '0 16px',
              backgroundColor: activeTab === 'properties' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'properties' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'properties' ? '#007bff' : '#666',
              fontSize: '13px',
              fontWeight: activeTab === 'properties' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '0',
            }}
          >
            <FiGrid size={14} />
            Properties
          </button>

          {/* Tree View Tab */}
          <button
            onClick={() => setActiveTab('tree')}
            style={{
              height: '100%',
              padding: '0 16px',
              backgroundColor: activeTab === 'tree' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'tree' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'tree' ? '#007bff' : '#666',
              fontSize: '13px',
              fontWeight: activeTab === 'tree' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '0',
            }}
          >
            <FiList size={14} />
            Tree View
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        opacity: isMinimized ? 0 : 1,
        transform: isMinimized ? 'translateY(10px)' : 'translateY(0)',
        transition: isResizing ? 'none' : 'opacity 0.3s ease, transform 0.3s ease',
        minHeight: 0, // Allow flex shrinking
      }}>
        {activeTab === 'properties' && (
          <div style={{ padding: '20px' }}>
            {!selectedComponent ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#999',
                fontSize: '14px',
              }}>
                Select a component to edit its props
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(selectedComponent.props).map(([propName, propType]) => (
                  <div key={propName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span>{propName}</span>
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'monospace',
                        backgroundColor: '#f8f9fa',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}>
                        {propType}
                      </span>
                    </label>
                    {renderPropInput(propName, propType, selectedComponent.initialValues[propName])}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tree' && (
          <div style={{
            padding: '8px 0',
            backgroundColor: '#ffffff',
          }}>
            <div style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fafafa',
            }}>
              Component Tree - Drag to reorder or nest
            </div>
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              padding: '8px 0',
            }}>
              {renderComponentTree(canvasData || [])}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
