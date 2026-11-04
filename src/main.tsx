import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { generateSeedData } from './mock/seed';
import { useStore } from './store';

const init = () => {
  const { orders, clients } = useStore.getState();
  if (orders.length === 0 || clients.length === 0) {
    generateSeedData();
  }
};

init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
