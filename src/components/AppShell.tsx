import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, BookOpen, BrainCircuit, ChevronRight, FolderGit2, GitBranch, History, LogOut, Menu, Plus, Settings2, Terminal, Users, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/api';
import { Button, Loading, Notice } from './AppUI';

const navigation = [
  { to: '/console', icon: Terminal, label: 'Console', end: true },
  { to: '/console/import', icon: GitBranch, label: 'Import repository' },
  { to: '/projects', icon: FolderGit2, label: 'Projects' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/team', icon: Users, label: 'Team' },
];
export default function AppShell() {
  const { user, loading, error, health, refresh, logout } = useAuth();
  const location = useLocation(); const navigate = useNavigate();
  const [menu, setMenu] = useState(false); const [logoutError, setLogoutError] = useState('');
  if (loading) return <Loading />;
  if (!user && error) return <main className="connection-error"><Notice>{error}</Notice><Button onClick={() => { void refresh(); }}>Retry connection</Button><Link to="/" className="btn btn-secondary">Back home</Link></main>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  const current = [...navigation, { to: '/settings', label: 'Settings' }].find(item => item.to === location.pathname)?.label || 'Project';
  const limit = user.usage?.limit; const used = user.usage?.used || 0;
  return <div className="app-shell">
    {menu && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <aside className={`app-sidebar ${menu ? 'is-open' : ''}`}>
      <Link to="/" className="app-brand"><BrainCircuit size={27} strokeWidth={1.5} /><span>Cerebro</span><span className="brand-beta">BETA</span></Link>
      <button className="new-run-button" onClick={() => { setMenu(false); navigate(`/console?new=${Date.now()}`); }}><Plus size={17} />New generation<span>+</span></button>
      <span className="sidebar-caption">WORKSPACE</span>
      <nav className="app-nav" aria-label="Workspace">{navigation.map(({ to, icon: Icon, label, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenu(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={17} strokeWidth={1.6} /><span>{label}</span>{((to === '/projects' || to === '/console/import') && user.plan === 'FREE') && <span className="nav-plan">PRO</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="usage-block"><div><span>{user.plan.charAt(0) + user.plan.slice(1).toLowerCase()} plan</span><Link to="/pricing" aria-label="View plans" title="View plans"><ArrowUpRight size={16} /></Link></div><div className="usage-track"><span style={{ width: `${limit && limit > 0 ? Math.min(100, used / limit * 100) : 0}%` }} /></div><p>{used} {limit && limit > 0 ? `of ${limit}` : ''} generations this month</p></div>
        <nav className="app-nav" aria-label="Account"><Link to="/docs/api"><BookOpen size={17} strokeWidth={1.6} />API documentation<ArrowUpRight className="nav-tail" size={13} /></Link><NavLink to="/settings" onClick={() => setMenu(false)}><Settings2 size={17} strokeWidth={1.6} />Settings</NavLink></nav>
        <div className="sidebar-account"><span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><span>{user.email}</span></div><button aria-label="Sign out" title="Sign out" className="icon-btn" onClick={async () => { try { await logout(); navigate('/'); } catch (e) { setLogoutError(errorMessage(e)); } }}><LogOut size={16} /></button></div>
        {logoutError && <Notice>{logoutError}</Notice>}
      </div>
    </aside>
    <div className="app-main"><header className="app-topbar"><button className="icon-btn mobile-menu-button" aria-label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu(!menu)}>{menu ? <X size={20} /> : <Menu size={20} />}</button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={13} /><strong>{current}</strong></div><Link to="/settings?tab=integrations" className={`system-status ${health?.aiConfigured ? 'ready' : ''}`}><Activity size={13} /><span>{!health ? 'Server unavailable' : health.aiConfigured ? 'AI connected' : 'Setup required'}</span></Link></header><main className="workspace-content"><Outlet /></main><footer className="app-footer"><span>Cerebro / Infrastructure, proven.</span><Link to="/about">How it works <ArrowUpRight size={12} /></Link></footer></div>
  </div>;
}
