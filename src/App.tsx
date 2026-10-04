import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import PricingPage from '@/pages/PricingPage';
import LoginPage from '@/pages/LoginPage';
import ConsolePage from '@/pages/ConsolePage';
import AppShell from '@/components/AppShell';
import { HistoryPage, ProjectsPage, ProjectPage, TeamPage, SettingsPage, ApiDocsPage } from '@/pages/WorkspacePages';
import { ArrowLeft } from 'lucide-react';

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.title = `${pathname === '/' ? 'Infrastructure, proven' : pathname.split('/').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' / ')} | Cerebro`; }, [pathname]);
  return null;
}
export default function App() {
  return <BrowserRouter><AuthProvider><RouteEffects /><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<LoginPage signup />} />
    <Route path="/docs/api" element={<ApiDocsPage />} />
    <Route element={<AppShell />}>
      <Route path="/console" element={<ConsolePage />} />
      <Route path="/console/import" element={<ConsolePage importMode />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
    <Route path="/dashboard" element={<Navigate to="/console" replace />} />
    <Route path="*" element={<main className="not-found"><span className="eyebrow">404 / CEREBRO</span><h1>This path goes nowhere.</h1><p>The page may have moved, or the address is incomplete.</p><Link to="/" className="btn btn-primary"><ArrowLeft size={17} />Back to Cerebro</Link></main>} />
  </Routes></AuthProvider></BrowserRouter>;
}
