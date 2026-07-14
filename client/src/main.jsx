import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { appConfig } from './config';
import './styles.css';

const routerElement =
  appConfig.routerMode === 'hash' ? (
    <HashRouter>
      <App />
    </HashRouter>
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {routerElement}
  </StrictMode>,
);
