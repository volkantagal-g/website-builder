import React, { useState, useEffect, useRef } from 'react';
import { FiChevronUp, FiChevronDown, FiGrid, FiList, FiMove, FiGlobe, FiEdit, FiMonitor } from 'react-icons/fi';
import { ComponentMetadata } from '../../types/canvas';
import { PropInputFactory } from './PropInputFactory';
import { INITIAL_PROPS_MENU_HEIGHT, MAX_PROPS_MENU_HEIGHT } from './constants';
import { BREAKPOINTS, BreakpointProps } from '../../types/breakpoints';
import { useBreakpointContext } from '../../context/BreakpointContext';

import { ApiEndpointsPanel } from './ApiEndpointsPanel';
import { StylePanel } from './StylePanel';

export interface PropsMenuProps {
  selectedComponent: ComponentMetadata | null;
  onPropsChange: (componentId: string, newProps: Record<string, any>, breakpointProps?: Record<string, Record<string, any>>) => void;
  componentId?: string;
  canvasData?: any; // Component ağacı için
  palette?: Record<string, string>; // Pinnate palette CSS variables
  radius?: Record<string, string>; // Pinnate radius CSS variables
  spacing?: Record<string, string>; // Pinnate spacing CSS variables
  typography?: Record<string, any>; // Pinnate typography CSS variables
  onComponentMove?: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void; // Component taşıma için
  onComponentHover?: (componentId: string | undefined) => void; // Component hover için
  onComponentSelect?: (componentId: string) => void; // Component seçimi için
  onHeightChange?: (height: number) => void; // Height değişikliği için callback
}

export const PropsMenu: React.FC<PropsMenuProps> = ({ 
  selectedComponent, 
  onPropsChange, 
  componentId,
  canvasData,
  palette = {},
  radius = {},
  spacing = {},
  typography = {},
  onComponentMove,
  onComponentHover,
  onComponentSelect,
  onHeightChange
}) => {
  const [isMinimized, setIsMinimized] = useState(true); // Başlangıçta minimize
  const [localProps, setLocalProps] = useState<Record<string, any>>({});
  const [height, setHeight] = useState(INITIAL_PROPS_MENU_HEIGHT);
  const [previousHeight, setPreviousHeight] = useState(INITIAL_PROPS_MENU_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // Yeni: active tab
  const [showBreakpointMenu, setShowBreakpointMenu] = useState(false); // Breakpoint menüsü görünürlüğü
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const treeViewRef = useRef<HTMLDivElement>(null);
  const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Breakpoint state - context'ten al
  const { selectedBreakpoint, setSelectedBreakpoint, isAutoMode, setIsAutoMode } = useBreakpointContext();
  const [breakpointProps, setBreakpointProps] = useState<BreakpointProps>({});

  // Breakpoint değiştiğinde props'ları güncelle
  React.useEffect(() => {
    if (selectedComponent && canvasData && componentId) {
      const findComponentProps = (components: any[]): { props: Record<string, any>; breakpointProps?: Record<string, Record<string, any>> } | null => {
        for (const comp of components) {
          if (comp.id === componentId) {
            return { props: comp.props, breakpointProps: comp.breakpointProps };
          }
          if (comp.children && comp.children.length > 0) {
            const found = findComponentProps(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const componentData = findComponentProps(canvasData);
      if (componentData) {
        // Canvas'tan gelen breakpoint props'larını yükle
        if (componentData.breakpointProps) {
          setBreakpointProps(componentData.breakpointProps);
        }
        
        // Breakpoint'e göre props'ları birleştir - sadece canvas'tan gelen breakpoint props'larını kullan
        const currentBreakpointProps = componentData.breakpointProps?.[selectedBreakpoint.id] || {};
        const mergedProps = { ...componentData.props, ...currentBreakpointProps };
        setLocalProps(mergedProps);
      }
    }
  }, [selectedBreakpoint.id, selectedComponent, canvasData, componentId]);

  // Tree View'da seçili component'e scroll yap ve tüm tree'sini aç
  useEffect(() => {
    if (activeTab === 'tree' && componentId && treeViewRef.current) {
      // Seçili component'in tüm parent'larını aç
      const expandPathToComponent = (components: any[], targetId: string, path: string[] = []): string[] => {
        for (const comp of components) {
          const currentPath = [...path, comp.id];
          if (comp.id === targetId) {
            return currentPath;
          }
          if (comp.children && comp.children.length > 0) {
            const found = expandPathToComponent(comp.children, targetId, currentPath);
            if (found.length > 0) {
              return found;
            }
          }
        }
        return [];
      };

      const pathToComponent = expandPathToComponent(canvasData || [], componentId);
      if (pathToComponent.length > 0) {
        setExpandedComponents(prev => {
          const newSet = new Set(prev);
          pathToComponent.forEach(id => newSet.add(id));
          return newSet;
        });
      }

      // Kısa bir gecikme ile scroll yap (DOM güncellenmesi için)
      setTimeout(() => {
        const selectedElement = treeViewRef.current?.querySelector(`[data-component-id="${componentId}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [activeTab, componentId, canvasData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }
    };
  }, []);

  // Component değiştiğinde local props'u güncelle
  React.useEffect(() => {
    if (selectedComponent) {
      // Canvas'tan gelen gerçek component props'larını kullan
      // Eğer canvasData varsa, seçili component'i bul ve props'larını al
      if (canvasData && componentId) {
        const findComponentProps = (components: any[]): { props: Record<string, any>; breakpointProps?: Record<string, Record<string, any>> } | null => {
          for (const comp of components) {
            if (comp.id === componentId) {
              return { props: comp.props, breakpointProps: comp.breakpointProps };
            }
            if (comp.children && comp.children.length > 0) {
              const found = findComponentProps(comp.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const componentData = findComponentProps(canvasData);
        if (componentData) {
          // Canvas'tan gelen breakpoint props'larını yükle
          if (componentData.breakpointProps) {
            setBreakpointProps(componentData.breakpointProps);
          }
          
          // Breakpoint'e göre props'ları birleştir
          const currentBreakpointProps = componentData.breakpointProps?.[selectedBreakpoint.id] || breakpointProps[selectedBreakpoint.id] || {};
          const mergedProps = { ...componentData.props, ...currentBreakpointProps };
          setLocalProps(mergedProps);
        } else {
          const currentBreakpointProps = breakpointProps[selectedBreakpoint.id] || {};
          const mergedProps = { ...selectedComponent.initialValues, ...currentBreakpointProps };
          setLocalProps(mergedProps);
        }
      } else {
        const currentBreakpointProps = breakpointProps[selectedBreakpoint.id] || {};
        const mergedProps = { ...selectedComponent.initialValues, ...currentBreakpointProps };
        setLocalProps(mergedProps);
      }
      
      // Component seçiliyse maximize et
      setIsMinimized(false);
      // Eski height'ı geri yükle - sadece component değiştiğinde
      if (previousHeight !== INITIAL_PROPS_MENU_HEIGHT) {
        setHeight(previousHeight);
      }
    }
    // Component seçili değilse otomatik minimize etme
  }, [selectedComponent, canvasData, componentId, selectedBreakpoint, breakpointProps]); // previousHeight dependency'si kaldırıldı

  // Height değişikliklerini ayrı useEffect'te izle - sadece resize sırasında
  React.useEffect(() => {
    if (height > 0 && isResizing) {
      setPreviousHeight(height);
    }
  }, [height, isResizing]);

  // Height değiştiğinde parent'a bildir
  React.useEffect(() => {
    if (onHeightChange) {
      onHeightChange(isMinimized ? 0 : height);
    }
  }, [height, isMinimized, onHeightChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newHeight = window.innerHeight - e.clientY;
    const clampedHeight = Math.max(100, Math.min(MAX_PROPS_MENU_HEIGHT, newHeight));
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
    // Local props'u güncelle (sadece görüntü için)
    const newProps = { ...localProps, [propName]: value };
    setLocalProps(newProps);
    
    // Breakpoint'e özel props'ları güncelle
    const updatedBreakpointProps = {
      ...breakpointProps,
      [selectedBreakpoint.id]: {
        ...breakpointProps[selectedBreakpoint.id],
        [propName]: value
      }
    };
    setBreakpointProps(updatedBreakpointProps);
    
    if (componentId) {
      // Sadece breakpoint props'larını gönder, base props'ları değiştirme
      console.log('🔧 Sending breakpoint props:', { componentId, updatedBreakpointProps });
      onPropsChange(componentId, {}, updatedBreakpointProps);
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
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'inside';
    
    // Daha büyük threshold'lar ve daha stabil logic
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }
    
    // Debounce ile state güncellemesi (titremeyi önlemek için)
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
    
    dragOverTimeoutRef.current = setTimeout(() => {
      // Sadece değişiklik varsa state'i güncelle
      if (dragOverId !== targetId || dragPosition !== position) {
        setDragOverId(targetId);
        setDragPosition(position);
      }
    }, 16); // ~60fps için 16ms debounce
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
      const isSelected = componentId === component.id; // Seçili component kontrolü
      const hasChildren = component.children && component.children.length > 0;
      const isExpanded = expandedComponents.has(component.id);
      const isHovered = hoveredComponentId === component.id;
      
      return (
        <div key={component.id || index} style={{ marginLeft: level * 20 }}>
          {/* Drop zone before component */}
          {isDragOver && dragPosition === 'before' && (
            <div style={{
              height: '6px',
              backgroundColor: '#6b3ff7',
              margin: '6px 0',
              borderRadius: '3px',
              opacity: 0.9,
              boxShadow: '0 0 8px rgba(107, 63, 247, 0.3)',
            }} />
          )}
          
          <div 
            data-component-id={component.id}
            draggable
            onDragStart={(e) => handleDragStart(e, component.id)}
            onDragOver={(e) => handleDragOver(e, component.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, component.id)}
            onMouseEnter={() => {
              setHoveredComponentId(component.id);
              onComponentHover?.(component.id);
            }}
            onMouseLeave={() => {
              setHoveredComponentId(null);
              onComponentHover?.(undefined);
            }}
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
                             isDragOver ? '#f0f8ff' : 
                             isHovered ? '#f8f9fa' : 'transparent',
              border: isSelected ? '2px solid #6b3ff7' :
                     isDragged ? '1px dashed #6b3ff7' : 
                     isDragOver ? '1px solid #6b3ff7' : 
                     isHovered ? '1px solid #e0e0e0' : '1px solid transparent',
              opacity: isDragged ? 0.5 : 1,
              // Hover border ekle - kırmızı border
              boxShadow: isDragOver ? '0 0 0 2px #ff4444' : 
                         isHovered ? '0 0 0 1px #e0e0e0' : 'none',
            }}
          >
            <FiMove size={12} style={{ marginRight: '8px', color: '#666', opacity: 0.7 }} />
            
            {/* Expand/Collapse Icon */}
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedComponents(prev => {
                    const newSet = new Set(prev);
                    if (isExpanded) {
                      newSet.delete(component.id);
                    } else {
                      newSet.add(component.id);
                    }
                    return newSet;
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  marginRight: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isExpanded ? (
                  <FiChevronDown size={12} style={{ color: '#666' }} />
                ) : (
                  <FiChevronUp size={12} style={{ color: '#666', transform: 'rotate(-90deg)' }} />
                )}
              </button>
            ) : (
              <div style={{ width: '16px', marginRight: '4px' }} />
            )}
            
            <FiGrid size={12} style={{ marginRight: '8px', color: '#666' }} />
            <span style={{ color: '#333', fontWeight: '500' }}>
              {component.metadata?.name || component.name || 'Unknown Component'}
            </span>
            {isContainer && (
              <span style={{ 
                marginLeft: '8px', 
                color: '#6b3ff7', 
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
              margin: '6px 0',
              padding: '12px',
              backgroundColor: '#e3f2fd',
              border: '2px dashed #6b3ff7',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#6b3ff7',
              fontWeight: '500',
              boxShadow: '0 0 12px rgba(107, 63, 247, 0.2)',
            }}>
              Drop here to nest
            </div>
          )}
          
          {/* Nested components - sadece expand edildiğinde göster */}
          {hasChildren && isExpanded && (
            <div style={{ marginLeft: '16px' }}>
              {renderComponentTree(component.children, level + 1)}
            </div>
          )}
          
          {/* Drop zone after component */}
          {isDragOver && dragPosition === 'after' && (
            <div style={{
              height: '6px',
              backgroundColor: '#6b3ff7',
              margin: '6px 0',
              borderRadius: '3px',
              opacity: 0.9,
              boxShadow: '0 0 8px rgba(107, 63, 247, 0.3)',
            }} />
          )}
        </div>
      );
    });
  };

  const renderPropInput = (propName: string, propType: string | { type: string; options?: string[] }, currentValue: unknown) => {
    return PropInputFactory.createInput({
      propName,
      propType,
      currentValue: localProps[propName] ?? currentValue,
      onChange: handlePropChange,
      palette: palette,
      typography: typography,
      initialValue: selectedComponent?.initialValues[propName]
    });
  };


  // Get nested object properties recursively - use metadata for prop types
  const getNestedObjectProperties = (obj: any, prefix = ''): Array<{name: string, type: string, path: string}> => {
    const result: Array<{name: string, type: string, path: string}> = [];
    
    if (!obj || typeof obj !== 'object') {
      return result;
    }
        
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        result.push(...getNestedObjectProperties(value, fullPath));
      } else {
        // Use metadata prop type if available, otherwise determine from value
        let type = 'string'; // Default to string for most inputs
        
        // Check if we have metadata for this prop
        if (selectedComponent?.props && selectedComponent.props[key]) {
          type = selectedComponent.props[key];
        } else {
          // Fallback to value-based type detection
          if (Array.isArray(value)) {
            type = 'array';
          } else if (typeof value === 'boolean') {
            type = 'boolean';
          } else if (typeof value === 'number') {
            type = 'number';
          } else if (value === null || value === undefined) {
            type = 'string'; // Treat null/undefined as string for input purposes
          }
        }
        
        result.push({
          name: key,
          type: type,
          path: fullPath
        });
      }
    });
    
    return result;
  };

  // Get nested value from initialValues using dot notation path
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
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
              backgroundColor: '#6b3ff7',
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

      {/* Breakpoint Selector - Hidden by default */}
      {showBreakpointMenu && (
        <div style={{
          height: '40px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <FiMonitor size={14} color="#666" />
          <span style={{
            fontSize: '10px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Breakpoint:
          </span>
          <button
            onClick={() => setIsAutoMode(!isAutoMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 6px',
              backgroundColor: isAutoMode ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isAutoMode ? '#218838' : '#545b62';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isAutoMode ? '#28a745' : '#6c757d';
            }}
          >
            {isAutoMode ? 'AUTO' : 'MANUAL'}
          </button>
          {!isAutoMode && (
            <button
              onClick={() => setIsAutoMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 6px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '9px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#138496';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#17a2b8';
              }}
            >
              RESET
            </button>
          )}
          <div style={{
            display: 'flex',
            gap: '3px',
          }}>
            {BREAKPOINTS.map((breakpoint) => (
              <button
                key={breakpoint.id}
                onClick={() => {
                  if (!isAutoMode) {
                    setSelectedBreakpoint(breakpoint);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 8px',
                  backgroundColor: selectedBreakpoint.id === breakpoint.id ? '#6b3ff7' : '#ffffff',
                  color: selectedBreakpoint.id === breakpoint.id ? '#ffffff' : '#666',
                  border: `1px solid ${selectedBreakpoint.id === breakpoint.id ? '#6b3ff7' : '#e9ecef'}`,
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: '500',
                  cursor: isAutoMode ? 'not-allowed' : 'pointer',
                  opacity: isAutoMode ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isAutoMode && selectedBreakpoint.id !== breakpoint.id) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#6b3ff7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAutoMode && selectedBreakpoint.id !== breakpoint.id) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e9ecef';
                  }
                }}
              >
                <span>{breakpoint.icon}</span>
                <span>{breakpoint.name}</span>
                <span style={{ fontSize: '8px', opacity: 0.7 }}>
                  {breakpoint.width}×{breakpoint.height}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

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
              borderBottom: activeTab === 'properties' ? '2px solid #6b3ff7' : '2px solid transparent',
              color: activeTab === 'properties' ? '#6b3ff7' : '#666',
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

          {/* Style Tab */}
          <button
            onClick={() => setActiveTab('style')}
            style={{
              height: '100%',
              padding: '0 16px',
              backgroundColor: activeTab === 'style' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'style' ? '2px solid #6b3ff7' : '2px solid transparent',
              color: activeTab === 'style' ? '#6b3ff7' : '#666',
              fontSize: '13px',
              fontWeight: activeTab === 'style' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '0',
            }}
          >
            <FiEdit size={14} />
            Style
          </button>

          {/* Tree View Tab */}
          <button
            onClick={() => setActiveTab('tree')}
            style={{
              height: '100%',
              padding: '0 16px',
              backgroundColor: activeTab === 'tree' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'tree' ? '2px solid #6b3ff7' : '2px solid transparent',
              color: activeTab === 'tree' ? '#6b3ff7' : '#666',
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
          
          {/* API Endpoints Tab */}
          <button
            onClick={() => setActiveTab('api')}
            style={{
              height: '100%',
              padding: '0 16px',
              backgroundColor: activeTab === 'api' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'api' ? '2px solid #6b3ff7' : '2px solid transparent',
              color: activeTab === 'api' ? '#6b3ff7' : '#666',
              fontSize: '13px',
              fontWeight: activeTab === 'api' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '0',
            }}
          >
            <FiGlobe size={14} />
            API Endpoints
          </button>
        </div>
        
        {/* Breakpoint Toggle Button */}
        <button
          onClick={() => setShowBreakpointMenu(!showBreakpointMenu)}
          style={{
            height: '100%',
            padding: '0 12px',
            backgroundColor: showBreakpointMenu ? '#6b3ff7' : 'transparent',
            border: 'none',
            color: showBreakpointMenu ? '#ffffff' : '#666',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '0',
            marginLeft: 'auto',
          }}
          onMouseEnter={(e) => {
            if (!showBreakpointMenu) {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            if (!showBreakpointMenu) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <FiMonitor size={14} />
        </button>
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
                {getNestedObjectProperties(selectedComponent.initialValues || selectedComponent.props).map((prop) => (
                  <div key={prop.path} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span>{prop.path}</span>
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'monospace',
                        backgroundColor: '#f8f9fa',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}>
                        {prop.type}
                      </span>
                    </label>
                    {renderPropInput(prop.path, prop.type, getNestedValue(selectedComponent.initialValues, prop.path))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div style={{
            padding: '8px 0',
            backgroundColor: '#ffffff',
          }}>
            <StylePanel 
              palette={palette} 
              radius={radius}
              spacing={spacing}
              typography={typography}
              selectedComponent={selectedComponent} 
              componentId={componentId} 
              canvasData={canvasData}
              onPropsChange={onPropsChange} 
            />
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
            <div 
              ref={treeViewRef}
              style={{
                maxHeight: `${MAX_PROPS_MENU_HEIGHT}px`,
                overflow: 'auto',
                padding: '8px 0',
              }}>
              {renderComponentTree(canvasData || [])}
            </div>
          </div>
        )}

        {activeTab === 'api' && <ApiEndpointsPanel />}
      </div>
    </div>
  );
};
