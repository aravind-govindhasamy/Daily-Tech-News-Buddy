import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './components/FirebaseProvider.tsx';

// Catch chunk loading errors and force a hard reload to clear stale caches
window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('Failed to fetch dynamically imported module') || e.message.includes('Importing a module script failed'))) {
    console.log('Chunk load error detected, forcing reload...');
    window.location.reload();
  }
});

// Also listen for Vite's specific preload error event
window.addEventListener('vite:preloadError', (event) => {
  console.log('Vite preload error detected, forcing reload...');
  window.location.reload();
});

// Register Service Worker for offline and caching support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[Service Worker] Registered with scope:', reg.scope);
        
        // Listen for updates to the service worker to trigger a reload
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                console.log('New service worker activated. Reloading page to apply updates...');
                // Allow a tiny delay for the SW to take control
                setTimeout(() => window.location.reload(), 200);
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error('[Service Worker] Registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

