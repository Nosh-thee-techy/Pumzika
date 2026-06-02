import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PropertyProvider, useProperty } from './context/PropertyContext';
import PropertyForm from './components/onboarding/PropertyForm';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import AskPage from './pages/AskPage';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen pb-16 lg:pb-0">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 min-h-0">{children}</main>
      <MobileNav />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { property } = useProperty();
  if (!property) return <Navigate to="/" replace />;
  return children;
}

function OnboardingRoute() {
  const { property } = useProperty();
  if (property) return <Navigate to="/dashboard" replace />;
  return <PropertyForm />;
}

export default function App() {
  return (
    <PropertyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingRoute />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MapPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AskPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PropertyProvider>
  );
}
