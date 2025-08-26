import { createRoot } from 'react-dom/client';
import { FullPage } from './components/FullPage';
import { PinnateProvider, Components } from 'pinnate';
import './styles/global.css';
import 'pinnate/dist/index.css';

const App = () => {
  console.log(Components);
  
  return (
    <PinnateProvider>
      <FullPage>
        <h1>Website Builder</h1>
        <p>Development ortamına hoş geldiniz!</p>
        <button className="mt-3">Örnek Buton</button>
      </FullPage>
    </PinnateProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
