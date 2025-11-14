import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { CallLogs } from './pages/CallLogs';
import { ScheduleCall } from './pages/ScheduleCall';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'logs':
        return <CallLogs />;
      case 'schedule':
        return <ScheduleCall />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
