import React, { useState, useRef, useEffect, CSSProperties } from 'react';

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
  children,
  onDrag,
  onDragEnd,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sidebarRef.current) return;
    
    const rect = sidebarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Ekran sınırlarını kontrol et
    const maxX = window.innerWidth - (typeof width === 'number' ? width : 300);
    const maxY = window.innerHeight - (typeof height === 'number' ? height : window.innerHeight);

    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));

    const newPosition = { x: clampedX, y: clampedY };
    setPosition(newPosition);
    onDrag?.(newPosition);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.(position);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, onDrag]);

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    backgroundColor,
    boxShadow: shadow ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: 1000,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
  };

  const headerStyle: CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    cursor: 'grab',
    userSelect: 'none',
  };

  const contentStyle: CSSProperties = {
    padding: '16px',
    height: 'calc(100% - 60px)',
    overflow: 'auto',
  };

  return (
    <div
      ref={sidebarRef}
      style={sidebarStyle}
      onMouseDown={handleMouseDown}
    >
      <div style={headerStyle}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#495057' }}>
          Sidebar
        </div>
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};
