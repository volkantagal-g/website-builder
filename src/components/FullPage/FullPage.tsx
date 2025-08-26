import React, { forwardRef, CSSProperties } from 'react';
import { Sidebar } from '../Sidebar';
//import {Components} from '../../../node_modules/pinnate/dist';

export interface FullPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Sayfanın minimum yüksekliği. Varsayılan olarak 100vh
   */
  minHeight?: string;
  /**
   * İçeriğin dikey hizalaması
   */
  verticalAlign?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /**
   * İçeriğin yatay hizalaması
   */
  horizontalAlign?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /**
   * Arka plan rengi
   */
  backgroundColor?: string;
  /**
   * İç boşluk (padding)
   */
  padding?: string | number;
  /**
   * Component'in içeriği
   */
  children?: React.ReactNode;
}

export const FullPage = forwardRef<HTMLDivElement, FullPageProps>(
  (
    {
      minHeight = '100vh',
      verticalAlign = 'center',
      horizontalAlign = 'center',
      backgroundColor = 'transparent',
      padding = '1rem',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const containerStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      minHeight,
      width: '100%',
      backgroundColor,
      padding,
      justifyContent: verticalAlign,
      alignItems: horizontalAlign,
      boxSizing: 'border-box',
      ...style,
    };

    //console.log(Components);

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {children}

        <Sidebar
          width={320}
          height={400}
          initialPosition={{ x: 50, y: 100 }}
          backgroundColor="#ffffff"
          shadow={true}
          onDrag={(position) => console.log('Sürükleniyor:', position)}
          onDragEnd={(position) => console.log('Sürükleme bitti:', position)}
        >
          <h3>Sidebar İçeriği</h3>
          <p>Bu sidebar'ı sürükleyebilirsiniz!</p>
          <p>Header kısmından tutup istediğiniz yere taşıyabilirsiniz.</p>
          <div style={{ marginTop: '20px' }}>
            <button style={{ width: '100%', marginBottom: '10px' }}>
              Menü Öğesi 2
            </button>
            <button style={{ width: '100%' }}>
              Menü Öğesi 3
            </button>
          </div>
        </Sidebar>
      </div>
    );
  }
);

FullPage.displayName = 'FullPage';
