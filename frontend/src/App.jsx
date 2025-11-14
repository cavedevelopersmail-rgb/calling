import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ImportProvider } from './contexts/ImportContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { CallLogs } from './pages/CallLogs';
import { ScheduleCall } from './pages/ScheduleCall';
import { ImportScheduledCalls } from './pages/ImportScheduledCalls';
import { EditImportData } from './pages/EditImportData';

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
      case 'import':
        return <ImportScheduledCalls />;
      case 'edit-data':
        return <EditImportData />;
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
      <ImportProvider>
        <AppContent />
      </ImportProvider>
    </AuthProvider>
  );
}

export default App;
