import React from 'react';
import { render, screen } from '@testing-library/react';
import { FullPage } from './FullPage';

describe('FullPage', () => {
  it('renders children correctly', () => {
    render(
      <FullPage>
        <div data-testid="test-child">Test Content</div>
      </FullPage>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');
  });

  it('applies custom styles correctly', () => {
    const { container } = render(
      <FullPage
        minHeight="50vh"
        verticalAlign="start"
        horizontalAlign="end"
        backgroundColor="red"
        padding="2rem"
      >
        <div>Content</div>
      </FullPage>
    );

    const fullPageDiv = container.firstChild as HTMLElement;
    const computedStyle = window.getComputedStyle(fullPageDiv);

    expect(fullPageDiv).toHaveStyle({
      minHeight: '50vh',
      justifyContent: 'start',
      alignItems: 'end',
      backgroundColor: 'red',
      padding: '2rem',
    });
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<FullPage ref={ref}>Content</FullPage>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional props to the root element', () => {
    render(
      <FullPage data-testid="full-page" className="custom-class">
        Content
      </FullPage>
    );

    const element = screen.getByTestId('full-page');
    expect(element).toHaveClass('custom-class');
  });
});
