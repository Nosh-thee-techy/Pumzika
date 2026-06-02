import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
import Landing from './pages/Landing';
import Sidebar from './components/shared/Sidebar';
import MobileNav from './components/shared/MobileNav';
import HostOnboarding from './pages/host/HostOnboarding';
import HostDashboard from './pages/host/HostDashboard';
import HostMap from './pages/host/HostMap';
import HostAskAI from './pages/host/HostAskAI';
import GuestOnboarding from './pages/guest/GuestOnboarding';
import GuestDashboard from './pages/guest/GuestDashboard';
import NeighborhoodExplorer from './pages/guest/NeighborhoodExplorer';
import ListingInsights from './pages/guest/ListingInsights';

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
      <MobileNav />
    </div>
  );
}

function HostProtected({ children }) {
  const { role, hostProperty } = useRole();
  if (role !== 'host') return <Navigate to="/" replace />;
  if (!hostProperty) return <Navigate to="/host/onboarding" replace />;
  return children;
}

function GuestProtected({ children }) {
  const { role, guestPrefs } = useRole();
  if (role !== 'guest') return <Navigate to="/" replace />;
  if (!guestPrefs) return <Navigate to="/guest/onboarding" replace />;
  return children;
}

function HostOnboardingRoute() {
  const { role, hostProperty } = useRole();
  if (role !== 'host') return <Navigate to="/" replace />;
  if (hostProperty) return <Navigate to="/host/dashboard" replace />;
  return <HostOnboarding />;
}

function GuestOnboardingRoute() {
  const { role, guestPrefs } = useRole();
  if (role !== 'guest') return <Navigate to="/" replace />;
  if (guestPrefs) return <Navigate to="/guest/dashboard" replace />;
  return <GuestOnboarding />;
}

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/host/onboarding" element={<HostOnboardingRoute />} />
          <Route path="/host/dashboard" element={<HostProtected><AppLayout><HostDashboard /></AppLayout></HostProtected>} />
          <Route path="/host/map" element={<HostProtected><AppLayout><HostMap /></AppLayout></HostProtected>} />
          <Route path="/host/ask" element={<HostProtected><AppLayout><HostAskAI /></AppLayout></HostProtected>} />

          <Route path="/guest/onboarding" element={<GuestOnboardingRoute />} />
          <Route path="/guest/dashboard" element={<GuestProtected><AppLayout><GuestDashboard /></AppLayout></GuestProtected>} />
          <Route path="/guest/explore" element={<GuestProtected><AppLayout><NeighborhoodExplorer /></AppLayout></GuestProtected>} />
          <Route path="/guest/listing/:id" element={<GuestProtected><AppLayout><ListingInsights /></AppLayout></GuestProtected>} />

          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/host/dashboard" replace />} />
          <Route path="/map" element={<Navigate to="/host/map" replace />} />
          <Route path="/ask" element={<Navigate to="/host/ask" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
