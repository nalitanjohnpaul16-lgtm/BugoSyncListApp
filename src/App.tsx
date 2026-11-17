import React, { useEffect, useState } from 'react';
import { useApp, AppProvider } from './context/AppContext';
import { WelcomePage } from './components/auth/WelcomePage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { GuestPortalView } from './components/guest/GuestPortalView';
import { AdminLayout } from './components/admin/AdminLayout';
import { ResidentLayout } from './components/resident/ResidentLayout';
import { Clock } from 'lucide-react';

const SessionTimeoutModal: React.FC = () => {
  const { isSessionTimedOut, dismissSessionTimeout, setAuthView } = useApp();

  if (!isSessionTimedOut) return null;

  const handleSignInAgain = () => {
    dismissSessionTimeout();
    setAuthView('login');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-200 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900">Session Locked (Inactivity)</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            For security, your session was automatically locked after 15 minutes of inactivity on this device.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleSignInAgain}
            className="w-full py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Sign In Again
          </button>
          <button
            onClick={dismissSessionTimeout}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { role, authView } = useApp();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <>
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm no-print">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 1. Unauthenticated / Guest View Flow */}
      {role === 'guest' && (
        <>
          {authView === 'login' && <LoginPage />}
          {authView === 'register' && <RegisterPage />}
          {authView === 'guest' && <GuestPortalView />}
          {authView === 'welcome' && <WelcomePage />}
        </>
      )}

      {/* 2. Admin Operations Portal */}
      {role === 'admin' && <AdminLayout />}

      {/* 3. Resident Operations Portal */}
      {role === 'resident' && <ResidentLayout />}

      {/* Global Modals: Session Security Timeout */}
      <SessionTimeoutModal />
    </>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
