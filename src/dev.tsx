import { createRoot } from 'react-dom/client';
import { Canvas } from './components/Canvas';
import { PinnateProvider, Components, p, defaultTokens } from 'pinnate';
import { PinnateIcon } from './icons/pinnate';
import './styles/global.css';
import 'pinnate/dist/index.css';
import { generateAllPaletteCSSVariables } from 'pinnate/tokens/colors';
import { generateAllRadiusCSSVariables } from 'pinnate/tokens/radius';
import { generateAllSpacingCSSVariables } from 'pinnate/tokens/spacing';

const App = () => {
  console.log(Components);
  // Components'i p key'i ile map et
  const componentsWithP = Components.map(comp => ({
    ...comp,
    category: comp.category || 'Uncategorized', // Fallback category
    p: p[comp.name] // p[comp.name] ile gerçek component'i al
  }));

  //console.log(componentsWithP);
  
  return (
    <PinnateProvider tokens={defaultTokens}>
      <Canvas
        components={[{name: 'Pinnate', logo: <PinnateIcon /> ,components: componentsWithP}]}
        palette={generateAllPaletteCSSVariables()}
        radius={generateAllRadiusCSSVariables()}
        spacing={generateAllSpacingCSSVariables()}
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
