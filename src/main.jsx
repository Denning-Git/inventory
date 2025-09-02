import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'
import AppRouter from './mainLayout/Router'
import { ToastProvider } from './components/Toast'
import { useAuthStore } from './store/authStore';
useAuthStore.getState().initialize();

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)