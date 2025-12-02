import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContainer';
import { LoadingSpinner } from './components/LoadingSpinner';
import './index.css';

const Lobby = lazy(() => import('./pages/Lobby').then(m => ({ default: m.Lobby })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoadingSpinner size="large" text="Loading..." />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}> 
              <Route index element={<Navigate to="/lobby" replace />} />
              <Route 
                path="lobby" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Lobby />
                  </Suspense>
                } 
              />
              <Route 
                path="profile/:id" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                } 
              />
              <Route 
                path="leaderboard" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Leaderboard />
                  </Suspense>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
