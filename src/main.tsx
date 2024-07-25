import React from 'react';
import ReactDOM from 'react-dom/client';
import { StartProProvider } from './providers';
import App from './App';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.Fragment>
    <StartProProvider>
      <App />
    </StartProProvider>
  </React.Fragment>,
);
