import React from 'react';
// import { FiZoomIn, FiZoomOut, FiRotateCcw } from 'react-icons/fi';

export interface ZoomControlProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minZoom = 0.25,
  maxZoom = 3,
  zoomStep = 0.1
}) => {
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;
  
  // Zoom step bilgisini tooltip'te göster
  const zoomStepPercent = Math.round(zoomStep * 100);

  return (
    <div style={{
      position: 'fixed',
      bottom: '120px',
      right: '60px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      padding: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 999,
    }}>
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: canZoomOut ? '#f8f9fa' : '#f1f3f4',
          color: canZoomOut ? '#495057' : '#adb5bd',
          cursor: canZoomOut ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (canZoomOut) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }
        }}
        onMouseLeave={(e) => {
          if (canZoomOut) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }
        }}
        title={`Zoom Out (${zoomStepPercent}%)`}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>−</span>
      </button>

      {/* Zoom Level Display */}
      <div style={{
        minWidth: '50px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#495057',
        userSelect: 'none',
      }}>
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: canZoomIn ? '#f8f9fa' : '#f1f3f4',
          color: canZoomIn ? '#495057' : '#adb5bd',
          cursor: canZoomIn ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (canZoomIn) {
            e.currentTarget.style.backgroundColor = '#e9ecef';
          }
        }}
        onMouseLeave={(e) => {
          if (canZoomIn) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }
        }}
        title={`Zoom In (${zoomStepPercent}%)`}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span>
      </button>

      {/* Reset Zoom Button */}
      <button
        onClick={onZoomReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa',
          color: '#495057',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }}
        title="Reset Zoom"
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>↺</span>
      </button>
    </div>
  );
};
