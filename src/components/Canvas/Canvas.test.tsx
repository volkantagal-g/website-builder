import React from 'react';
import { render, screen } from '@testing-library/react';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('renders children correctly', () => {
    render(
      <Canvas>
        <div data-testid="test-child">Test Content</div>
      </Canvas>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');
  });

  it('applies custom styles correctly', () => {
    const { container } = render(
      <Canvas
        minHeight="50vh"
        verticalAlign="start"
        horizontalAlign="end"
        backgroundColor="red"
        padding="2rem"
      >
        <div>Content</div>
      </Canvas>
    );

    const canvasDiv = container.firstChild as HTMLElement;
    const computedStyle = window.getComputedStyle(canvasDiv);

    expect(canvasDiv).toHaveStyle({
      minHeight: '50vh',
      justifyContent: 'start',
      alignItems: 'end',
      backgroundColor: 'red',
      padding: '2rem',
    });
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Canvas ref={ref}>Content</Canvas>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional props to the root element', () => {
    render(
      <Canvas data-testid="canvas" className="custom-class">
        Content
      </Canvas>
    );

    const element = screen.getByTestId('canvas');
    expect(element).toHaveClass('custom-class');
  });
});
