import React from 'react';

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

export interface CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
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

// DraggableComponent Props
export interface DraggableComponentProps {
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
  canvasComponents: CanvasComponent[];
  copyComponent: (id: string) => void;
}

// DropZone Props
export interface DropZoneProps {
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
}
