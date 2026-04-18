import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import 'react-loading-skeleton/dist/skeleton.css';

// Lazy loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Refined Loading Spinner Component
const FullPageLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
    <div className="relative">
      {/* Outer Ring */}
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
      {/* Inner Pulsing Icon/Dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
    </div>
    <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
      Syncing...
    </p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <FullPageLoader />;
  
  return user ? (
    <div className="animate-in fade-in duration-500">
      {children}
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Modern Toaster Styling */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl',
          duration: 3000,
          style: {
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
          }
        }}
      />
      
      <BrowserRouter>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                <LoginPage />
              </div>
            } />
            <Route path="/register" element={
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                <RegisterPage />
              </div>
            } />

            {/* Private/Protected Routes */}
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Catch all - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;