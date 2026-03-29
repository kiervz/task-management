import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App.tsx';
import { store } from './store/index.ts';
import { Toaster } from './components/ui/sonner.tsx';
import AuthProvider from './providers/AuthProvider.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>

      <Toaster richColors closeButton />
    </Provider>
  </StrictMode>,
);
