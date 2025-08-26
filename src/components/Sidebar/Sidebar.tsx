import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { useDrag } from 'react-dnd';
import { DraggableIcon } from '../../icons/draggable';
import { ComponentMetadata } from '../FullPage';

// Draggable Component Item
const DraggableSidebarComponent: React.FC<{ comp: ComponentMetadata }> = ({ comp }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SIDEBAR_COMPONENT',
    item: { component: comp },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '8px',
        cursor: 'grab',
        border: '1px solid #e9ecef',
        fontSize: '13px',
        transition: 'all 0.2s ease',
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#e9ecef';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <strong style={{ color: '#333' }}>{comp.name}</strong>
      <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
        {comp.description}
      </div>
    </div>
  );
};

export interface SidebarProps {
  /**
   * Sidebar'ın genişliği
   */
  width?: string | number;
  /**
   * Sidebar'ın yüksekliği
   */
  height?: string | number;
  /**
   * Sidebar'ın başlangıç pozisyonu (x, y)
   */
  initialPosition?: { x: number; y: number };
  /**
   * Sidebar'ın arka plan rengi
   */
  backgroundColor?: string;
  /**
   * Sidebar'ın gölge efekti
   */
  shadow?: boolean;
  /**
   * Component metadata'ları
   */
  components?: Array<{
    name: string;
    components: ComponentMetadata[];
  }>;
  /**
   * Sidebar'ın içeriği
   */
  children?: React.ReactNode;
  /**
   * Sürükleme sırasında callback
   */
  onDrag?: (position: { x: number; y: number }) => void;
  /**
   * Sürükleme bittiğinde callback
   */
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width = 300,
  height = '100%',
  initialPosition = { x: 0, y: 0 },
  backgroundColor = '#ffffff',
  shadow = true,
  components = [],
  children,
  onDrag,
  onDragEnd,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const [currentWidth, setCurrentWidth] = useState(typeof width === 'number' ? width : 300);
  const [currentHeight, setCurrentHeight] = useState(typeof height === 'number' ? height : 400);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (!sidebarRef.current) return;
    
    const rect = sidebarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sidebarRef.current) return;
    
    const rect = sidebarRef.current.getBoundingClientRect();
    setResizeOffset({
      x: e.clientX - rect.right,
      y: e.clientY - rect.bottom,
    });
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Ekran sınırlarını kontrol et
      const maxX = window.innerWidth - currentWidth;
      const maxY = window.innerHeight - currentHeight;

      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));

      const newPosition = { x: clampedX, y: clampedY };
      setPosition(newPosition);
      onDrag?.(newPosition);
    }

    if (isResizing) {
      const newWidth = e.clientX - position.x - resizeOffset.x;
      const newHeight = e.clientY - position.y - resizeOffset.y;

      // Minimum boyutları kontrol et
      const minWidth = 200;
      const minHeight = 150;
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;

      const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

      setCurrentWidth(clampedWidth);
      setCurrentHeight(clampedHeight);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.(position);
    }
    if (isResizing) {
      setIsResizing(false);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeOffset, position, onDrag]);

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: `${currentWidth}px`,
    height: `${currentHeight}px`,
    backgroundColor,
    boxShadow: shadow ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
    borderRadius: '6px',
    overflow: 'hidden',
    zIndex: 1000,
    userSelect: 'none',
    transition: (isDragging || isResizing) ? 'none' : 'all 0.2s ease',
  };

  const headerStyle: CSSProperties = {
    padding: '16px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #e5e5e5',
    cursor: 'grab',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const contentStyle: CSSProperties = {
    padding: '16px',
    height: `calc(100% - 70px)`,
    overflow: 'auto',
  };

  const resizeHandleStyle: CSSProperties = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '20px',
    height: '20px',
    cursor: 'nw-resize',
    backgroundColor: 'transparent',
    zIndex: 1001,
  };

  const renderComponents = () => {
    if (!components || components.length === 0) {
      return children;
    }

    return components.map((lib) => (
      <div key={lib.name} style={{ marginBottom: '24px' }}>
        <h4 style={{ 
          color: '#333', 
          marginBottom: '16px', 
          fontSize: '16px',
          fontWeight: '600',
          borderBottom: '2px solid #007bff',
          paddingBottom: '8px'
        }}>
          {lib.name}
        </h4>
        {Object.entries(
          lib.components.reduce((acc, comp) => {
            const category = comp.category || 'Uncategorized';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(comp);
            return acc;
          }, {} as Record<string, ComponentMetadata[]>)
        ).map(([category, comps]) => (
          <div key={category} style={{ marginBottom: '20px' }}>
            <h5 style={{ 
              color: '#666', 
              fontSize: '13px', 
              marginBottom: '12px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {category}
            </h5>
            {comps.map((comp) => (
              <DraggableSidebarComponent key={comp.name} comp={comp} />
            ))}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div
      ref={sidebarRef}
      style={sidebarStyle}
    >
      <div 
        style={headerStyle}
        onMouseDown={handleHeaderMouseDown}
        className={isDragging ? 'dragging' : ''}
      >
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
          Component Library
        </div>
        <DraggableIcon />
      </div>
      <div style={contentStyle}>
        {renderComponents()}
      </div>
      
      {/* Resize Handle */}
      <div
        style={resizeHandleStyle}
        onMouseDown={handleResizeMouseDown}
        title="Resize sidebar"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.6 }}
        >
          <path
            d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};
