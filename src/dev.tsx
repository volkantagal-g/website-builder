import { createRoot } from 'react-dom/client';
import { Canvas } from './components/Canvas';
import { PinnateProvider, Components, p, defaultTokens } from 'pinnate';
import { PinnateIcon } from './icons/pinnate';
import './styles/global.css';
import 'pinnate/dist/index.css';
import { generateAllPaletteCSSVariables } from 'pinnate/tokens/colors';
import { generateAllRadiusCSSVariables } from 'pinnate/tokens/radius';
import { generateAllSpacingCSSVariables } from 'pinnate/tokens/spacing';
import {generateAllTypographyCSSVariables} from 'pinnate/tokens/typography';

const App = () => {
  console.log('Typography CSS Variables:', generateAllTypographyCSSVariables());
  // Components'i p key'i ile map et
  const componentsWithP = Components.map(comp => ({
    ...comp,
    category: comp.category || 'Uncategorized', // Fallback category
    p: p[comp.name] // p[comp.name] ile gerçek component'i al
  }));

  // Form component'ini container olarak işaretle
  const componentsWithContainerTypes = componentsWithP.map(comp => {
    if (comp.name === 'Form') {
      return {
        ...comp,
        type: 'container'
      };
    }
    return comp;
  });

  const formComponent = componentsWithContainerTypes.find(c => c.name === 'Form');
  console.log('🔍 FORM COMPONENT METADATA:', formComponent);
  console.log('🔍 FORM COMPONENT TYPE:', formComponent?.type);
  console.log('🔍 FORM COMPONENT NAME:', formComponent?.name);

  //console.log(componentsWithP);
  
  return (
    <PinnateProvider tokens={defaultTokens}>
      <Canvas
        components={[{name: 'Pinnate', logo: <PinnateIcon /> ,components: componentsWithContainerTypes}]}
        palette={generateAllPaletteCSSVariables()}
        radius={generateAllRadiusCSSVariables()}
        spacing={generateAllSpacingCSSVariables()}
        typography={generateAllTypographyCSSVariables()}
        >
      </Canvas>
    </PinnateProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
