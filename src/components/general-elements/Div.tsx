import React from 'react';

interface DivProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Div: React.FC<DivProps> = ({ 
  children, 
  className, 
  id, 
  style = {} 
}) => {
  return (
    <div 
      className={className}
      id={id}
      style={style}
    >
      {children}
    </div>
  );
};
