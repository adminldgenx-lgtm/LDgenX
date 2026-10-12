import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/global.css';

const container = document.getElementById('root')!;
const application = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
if (container.childElementCount > 0) hydrateRoot(container, application);
else createRoot(container).render(application);
