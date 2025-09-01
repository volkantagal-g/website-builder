import { createRoot } from 'react-dom/client';
import { FullPage } from './components/FullPage';
import { PinnateProvider, Components, p } from 'pinnate';
import { generateAllPaletteCSSVariables } from 'pinnate/tokens/colors';
import { PinnateIcon } from './icons/pinnate';
import './styles/global.css';
import 'pinnate/dist/index.css';

const App = () => {
  console.log(generateAllPaletteCSSVariables());
  // Components'i p key'i ile map et
  const componentsWithP = Components.map(comp => ({
    ...comp,
    category: comp.category || 'Uncategorized', // Fallback category
    p: p[comp.name] // p[comp.name] ile gerçek component'i al
  }));

  //console.log(componentsWithP);
  
  return (
    <PinnateProvider>
      <FullPage components={[{name: 'Pinnate', logo: <PinnateIcon /> ,components: componentsWithP}]}>
      </FullPage>
    </PinnateProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
