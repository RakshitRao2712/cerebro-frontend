import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Clipboard, CreditCard, ExternalLink, Folder,
  History, KeyRound, MailPlus, Pencil, Plus, RefreshCw, Search, Settings2, Trash2,
  Users, X,
} from 'lucide-react';
import {
  api, copyText, dateTime, errorMessage, isActive, paid, patch, post, teamPlan,
  toolNames, type ApiKey, type Generation, type Plan, type Project, type Team,
  type Tool, type User,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useResource } from '@/lib/useResource';
import { Button, EmptyState, Loading, Modal, Notice, PageHeading, StatusPill, UpgradeGate } from '@/components/AppUI';
import '@/workspace-pages.css';

export { ApiDocsPage } from './ApiDocsPage';

const tools = Object.keys(toolNames) as Tool[];
const runStatuses: Generation['status'][] = ['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'];
const statusNames: Record<Generation['status'], string> = {
  QUEUED: 'Queued', RUNNING: 'Running', SUCCEEDED: 'Validated', FAILED: 'Failed', CANCELLED: 'Cancelled',
};
const runUrl = (id: string) => `/console?run=${encodeURIComponent(id)}`;
const projectUrl = (id: string) => `/projects/${encodeURIComponent(id)}`;

function ReadError({ error, retry }: { error: string; retry: () => void }) {
  return <Notice><div className="wp-error"><span>{error}</span><Button variant="secondary" onClick={retry}><RefreshCw size={14} />Retry</Button></div></Notice>;
}

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    setError(''); setBusy(true);
    try { await copyText(value); setCopied(true); }
    catch { setError('Clipboard access failed. Select and copy the value manually.'); }
    finally { setBusy(false); }
  };
  return <div className="wp-copy-action"><Button variant="secondary" busy={busy} onClick={copy} aria-label={label}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied' : label}</Button>{error && <span className="wp-inline-error" role="alert">{error}</span>}</div>;
}

function SecretValue({ title, value, onDismiss, children }: { title: string; value: string; onDismiss: () => void; children: ReactNode }) {
  return <section className="wp-secret" aria-label={title}>
    <div className="wp-section-heading"><h3>{title}</h3><button type="button" className="icon-btn" aria-label={`Dismiss ${title.toLowerCase()}`} title="Dismiss secret" onClick={onDismiss}><X size={17} /></button></div>
    <p>{children}</p>
    <div className="wp-secret-value"><input aria-label={title} value={value} readOnly autoComplete="off" spellCheck={false} onFocus={event => event.currentTarget.select()} /><CopyButton value={value} label="Copy" /></div>
  </section>;
}

function ConfirmDelete({ title, description, action, onClose, onDeleted }: {
  title: string; description: ReactNode; action: () => Promise<unknown>; onClose: () => void; onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const remove = async () => {
    setBusy(true); setError('');
    try { await action(); onDeleted(); }
    catch (e) { setError(errorMessage(e)); setBusy(false); }
  };
  return <Modal title={title} onClose={() => { if (!busy) onClose(); }}>
    <div className="wp-modal-content"><p>{description}</p>{error && <Notice>{error}</Notice>}
      <div className="wp-form-actions"><Button variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button variant="danger" busy={busy} onClick={remove}><Trash2 size={15} />{title.startsWith('Revoke') ? 'Revoke' : 'Delete'}</Button></div>
    </div>
  </Modal>;
}

function RunTable({ runs }: { runs: Generation[] }) {
  return <div className="wp-table-scroll" role="region" aria-label="Generations" tabIndex={0}>
    <table className="wp-table"><thead><tr><th scope="col">Generation</th><th scope="col">Tools</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col"><span className="wp-sr-only">Open generation</span></th></tr></thead>
      <tbody>{runs.map(run => <tr key={run.id}>
        <td className="wp-run-name"><Link to={runUrl(run.id)}>{run.title || 'Untitled generation'}</Link><p title={run.prompt}>{run.prompt}</p></td>
        <td><div className="wp-tool-list">{run.tools.map(tool => <span key={tool}>{toolNames[tool]}</span>)}</div></td>
        <td><StatusPill status={run.status} /></td>
        <td className="wp-nowrap"><time dateTime={run.createdAt}>{dateTime(run.createdAt)}</time></td>
        <td><Link className="icon-btn" to={runUrl(run.id)} title="Open generation" aria-label={`Open ${run.title || 'generation'}`}><ArrowRight size={16} /></Link></td>
      </tr>)}</tbody>
    </table>
  </div>;
}

export function HistoryPage() {
  const { user } = useAuth();
  const resource = useResource<Generation[]>('/generations');
  const [search, setSearch] = useState('');
  const [tool, setTool] = useState('');
  const [status, setStatus] = useState('');
  const runs = useMemo(() => [...(resource.data || [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [resource.data]);
  const filtered = runs.filter(run => (!search.trim() || `${run.title} ${run.prompt}`.toLowerCase().includes(search.trim().toLowerCase())) && (!tool || run.tools.includes(tool as Tool)) && (!status || run.status === status));
  const hasFilters = !!(search || tool || status);
  return <div className="wp-page">
    <PageHeading eyebrow="Workspace" title="Generation history" description="Your infrastructure generations and validation results."><Button variant="secondary" onClick={resource.reload} busy={resource.loading}><RefreshCw size={15} />Refresh</Button><Link className="btn btn-primary" to="/console"><Plus size={16} />New generation</Link></PageHeading>
    {user?.plan === 'FREE' && <Notice tone="info">Free includes your last 5 generations in history. Pro includes full history. <Link to="/settings?tab=billing&upgrade=PRO">Review Pro</Link></Notice>}
    {resource.data && <dl className="wp-metrics" aria-label="Available history metrics">
      <div><dt>Available generations</dt><dd>{runs.length}</dd></div>
      <div><dt>Validated</dt><dd className="wp-mint">{runs.filter(run => run.status === 'SUCCEEDED').length}</dd></div>
      <div><dt>In progress</dt><dd>{runs.filter(isActive).length}</dd></div>
      <div><dt>Failed</dt><dd>{runs.filter(run => run.status === 'FAILED').length}</dd></div>
    </dl>}
    <div className="wp-filters">
      <label className="wp-search"><Search size={17} /><span className="wp-sr-only">Search generation titles or prompts</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search titles or prompts" /></label>
      <label className="field"><span className="wp-sr-only">Filter by tool</span><select value={tool} onChange={e => setTool(e.target.value)}><option value="">All tools</option>{tools.map(item => <option key={item} value={item}>{toolNames[item]}</option>)}</select></label>
      <label className="field"><span className="wp-sr-only">Filter by status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{runStatuses.map(item => <option key={item} value={item}>{statusNames[item]}</option>)}</select></label>
      {hasFilters && <Button variant="ghost" onClick={() => { setSearch(''); setTool(''); setStatus(''); }}><X size={14} />Clear</Button>}
    </div>
    {resource.loading ? <Loading label="Loading generation history" /> : resource.error ? <ReadError error={resource.error} retry={resource.reload} /> : runs.length === 0 ? <EmptyState icon={History} title="No generations yet" description="Your first generation will appear here."><Link className="btn btn-primary" to="/console"><Plus size={16} />New generation</Link></EmptyState> : filtered.length === 0 ? <EmptyState icon={Search} title="No matching generations" description="Try another prompt, tool, or status." /> : <><div className="wp-result-count" role="status">{filtered.length} of {runs.length} generations</div><RunTable runs={filtered} /></>}
  </div>;
}

function ProjectForm({ project, onClose, onSaved }: { project?: Project; onClose: () => void; onSaved: (project: Project) => void }) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!name.trim()) return;
    setBusy(true); setError('');
    try {
      const body = { name: name.trim(), description: description.trim() };
      const saved = project ? await patch<Project>(`/projects/${encodeURIComponent(project.id)}`, body) : await post<Project>('/projects', body);
      if (!saved?.id) throw new Error('The server did not return the saved project. Refresh projects to check the result.');
      onSaved(saved);
    } catch (e) { setError(errorMessage(e)); setBusy(false); }
  };
  return <Modal title={project ? 'Edit project' : 'Create project'} onClose={() => { if (!busy) onClose(); }}><form className="wp-form wp-modal-content" onSubmit={save}>
    <label className="field">Project name<input autoFocus required value={name} onChange={e => setName(e.target.value)} placeholder="Production infrastructure" disabled={busy} /></label>
    <label className="field">Description <span className="wp-muted">Optional</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Infrastructure scope and context" disabled={busy} /></label>
    {error && <Notice>{error}</Notice>}
    <div className="wp-form-actions"><Button variant="secondary" type="button" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" busy={busy} disabled={!name.trim()}>{project ? <Check size={15} /> : <Plus size={15} />}{project ? 'Save project' : 'Create project'}</Button></div>
  </form></Modal>;
}

export function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const resource = useResource<Project[]>(paid(user?.plan) ? '/projects' : null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  if (!paid(user?.plan)) return <div className="wp-page"><PageHeading title="Projects" /><UpgradeGate title="Give your infrastructure a home" description="Organize generations into projects with Cerebro Pro or a higher plan." /></div>;
  return <div className="wp-page">
    <PageHeading eyebrow="Workspace" title="Projects" description="Keep related infrastructure generations together."><Button onClick={() => setCreating(true)}><Plus size={16} />Create project</Button></PageHeading>
    {resource.loading ? <Loading label="Loading projects" /> : resource.error ? <ReadError error={resource.error} retry={resource.reload} /> : !resource.data?.length ? <EmptyState icon={Folder} title="No projects yet" description="Create a project for your next infrastructure build."><Button onClick={() => setCreating(true)}><Plus size={16} />Create project</Button></EmptyState> : <div className="wp-project-grid">{resource.data.map(project => <article className="wp-project" key={project.id}>
      <div className="wp-project-top"><Folder size={21} /><button type="button" className="icon-btn" onClick={() => setDeleting(project)} aria-label={`Delete ${project.name}`} title="Delete project"><Trash2 size={16} /></button></div>
      <h2><Link to={projectUrl(project.id)}>{project.name}</Link></h2><p>{project.description || 'No description'}</p>
      <div className="wp-project-footer"><span>{project.generationCount} {project.generationCount === 1 ? 'generation' : 'generations'}</span><Link to={projectUrl(project.id)} className="icon-btn" aria-label={`Open ${project.name}`} title="Open project"><ArrowRight size={17} /></Link></div>
    </article>)}</div>}
    {creating && <ProjectForm onClose={() => setCreating(false)} onSaved={project => navigate(projectUrl(project.id))} />}
    {deleting && <ConfirmDelete title="Delete project" description={<>Delete <strong>{deleting.name}</strong>? This removes the project from your workspace.</>} onClose={() => setDeleting(null)} action={() => api(`/projects/${encodeURIComponent(deleting.id)}`, { method: 'DELETE' })} onDeleted={() => { setDeleting(null); resource.reload(); }} />}
  </div>;
}

export function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const allowed = paid(user?.plan);
  const project = useResource<Project>(allowed && id ? `/projects/${encodeURIComponent(id)}` : null);
  const generations = useResource<Generation[]>(allowed && id ? '/generations' : null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const runs = [...(generations.data || [])].filter(run => run.projectId === id).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (!allowed) return <div className="wp-page"><PageHeading title="Project" /><UpgradeGate title="Projects are included with Pro" description="Upgrade to organize your generations into projects." /></div>;
  return <div className="wp-page">
    <Link className="wp-back" to="/projects"><ArrowLeft size={15} />All projects</Link>
    {project.loading ? <Loading label="Loading project" /> : project.error ? <ReadError error={project.error} retry={project.reload} /> : !project.data ? <EmptyState icon={Folder} title="Project not found" /> : <>
      <PageHeading eyebrow="Project" title={project.data.name} description={project.data.description || undefined}>
        <Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={15} />Edit</Button>
        <button type="button" className="icon-btn" title="Delete project" aria-label="Delete project" onClick={() => setDeleting(true)}><Trash2 size={17} /></button>
        <Link className="btn btn-primary" to={`/console?project=${encodeURIComponent(project.data.id)}`}><Plus size={16} />New generation</Link>
      </PageHeading>
      <div className="wp-section-heading"><h2>Generations {generations.data && <span className="wp-count">{runs.length}</span>}</h2><Button variant="ghost" onClick={generations.reload} busy={generations.loading}><RefreshCw size={15} />Refresh</Button></div>
      {generations.loading ? <Loading label="Loading project generations" /> : generations.error ? <ReadError error={generations.error} retry={generations.reload} /> : !runs.length ? <EmptyState icon={History} title="No generations in this project" description="Start a generation with this project's context."><Link className="btn btn-primary" to={`/console?project=${encodeURIComponent(project.data.id)}`}><Plus size={16} />New generation</Link></EmptyState> : <RunTable runs={runs} />}
      {editing && <ProjectForm project={project.data} onClose={() => setEditing(false)} onSaved={saved => { project.setData(saved); setEditing(false); }} />}
      {deleting && <ConfirmDelete title="Delete project" description={<>Delete <strong>{project.data.name}</strong>? This removes the project from your workspace.</>} onClose={() => setDeleting(false)} action={() => api(`/projects/${encodeURIComponent(project.data!.id)}`, { method: 'DELETE' })} onDeleted={() => navigate('/projects')} />}
    </>}
  </div>;
}

function AcceptInvitation({ onAccepted }: { onAccepted: () => void }) {
  const [params, setParams] = useSearchParams();
  const queryToken = params.get('token') || '';
  const [token, setToken] = useState(queryToken);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const { user, refresh } = useAuth();
  useEffect(() => { setToken(queryToken); setAccepted(false); }, [queryToken]);
  const accept = async (event: FormEvent) => {
    event.preventDefault(); if (!token.trim()) return;
    setBusy(true); setError('');
    try {
      await post('/team/accept', { token: token.trim() });
      const next = new URLSearchParams(params); next.delete('token'); setParams(next, { replace: true });
      setToken(''); await refresh(); setAccepted(true); onAccepted();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };
  return <section className="wp-section wp-invitation">
    <div className="wp-section-heading"><h2>Join a team</h2></div>
    {accepted ? <Notice tone="success">Invitation accepted. Your team membership has been updated.</Notice> : <form onSubmit={accept} className="wp-form">
      <p className="wp-muted">Accept an invitation as {user?.email}. Invitations can be accepted on any plan.</p>
      <div className="wp-inline-form"><label className="field">Invitation token<input required value={token} onChange={e => setToken(e.target.value)} placeholder="Paste your invitation token" autoComplete="off" spellCheck={false} disabled={busy} /></label><Button type="submit" busy={busy} disabled={!token.trim()}><Users size={15} />Accept invitation</Button></div>
      {error && <Notice>{error}</Notice>}
    </form>}
  </section>;
}

export function TeamPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const allowed = teamPlan(user?.plan);
  const resource = useResource<Team>(allowed ? '/team' : null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [busy, setBusy] = useState<'name' | 'invite' | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitation, setInvitation] = useState('');
  const [revoking, setRevoking] = useState<Team['invites'][number] | null>(null);
  useEffect(() => { if (resource.data) setName(resource.data.name); }, [resource.data?.name]);
  const memberRole = resource.data?.members.find(member => member.id === user?.id)?.role.toUpperCase();
  const canManage = memberRole === 'ADMIN' || memberRole === 'OWNER';
  const saveName = async (event: FormEvent) => {
    event.preventDefault(); if (!name.trim()) return;
    setBusy('name'); setError(''); setSuccess('');
    try { await patch('/team', { name: name.trim() }); setSuccess('Team name saved.'); resource.reload(); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(''); }
  };
  const invite = async (event: FormEvent) => {
    event.preventDefault(); setBusy('invite'); setError(''); setSuccess(''); setInvitation('');
    try {
      const result = await post<{ token?: string; url?: string; link?: string; inviteUrl?: string }>('/team/invites', { email: email.trim(), role });
      const link = result?.token ? `${window.location.origin}/team?token=${encodeURIComponent(result.token)}` : result?.inviteUrl || result?.url || result?.link;
      if (link) setInvitation(link);
      else setError('The invitation was created, but the server did not return an invitation link or token. Revoke it and create a new invitation to share a link.');
      setEmail(''); resource.reload();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(''); }
  };
  return <div className="wp-page">
    <PageHeading eyebrow="Workspace" title="Team" description="Members, invitations, and infrastructure reviews.">{allowed && <Button variant="secondary" onClick={resource.reload} busy={resource.loading}><RefreshCw size={15} />Refresh</Button>}</PageHeading>
    {(params.has('token') || !allowed) && <AcceptInvitation onAccepted={resource.reload} />}
    {!allowed ? <UpgradeGate title="Build infrastructure with your team" description="Team and Enterprise plans include shared reviews, members, and an audit trail." plan="Team" /> : <>
      {error && <Notice>{error}</Notice>}{success && <Notice tone="success">{success}</Notice>}
      {invitation && <SecretValue title="One-time invitation link" value={invitation} onDismiss={() => setInvitation('')}>Copy this link now and share it with the invited person. Local email delivery is not configured; no invitation email has been sent. This link is shown only once and can be used once.</SecretValue>}
      {resource.loading ? <Loading label="Loading team" /> : resource.error ? <ReadError error={resource.error} retry={resource.reload} /> : resource.data && <>
        <section className="wp-section">
          <div className="wp-section-heading"><h2>Team details</h2><span className="wp-muted">{resource.data.members.length} {resource.data.members.length === 1 ? 'member' : 'members'}</span></div>
          {canManage ? <form onSubmit={saveName} className="wp-inline-form"><label className="field">Team name<input required value={name} disabled={!!busy} onChange={e => setName(e.target.value)} /></label><Button type="submit" variant="secondary" busy={busy === 'name'} disabled={!!busy || !name.trim() || name.trim() === resource.data.name}><Check size={15} />Save name</Button></form> : <><h3>{resource.data.name}</h3><p className="wp-muted">Team owners and admins manage names and invitations.</p></>}
        </section>
        <section className="wp-section"><div className="wp-section-heading"><h2>Members</h2></div>
          <div className="wp-table-scroll" role="region" aria-label="Team members" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th></tr></thead><tbody>{resource.data.members.map(member => <tr key={member.id}><td>{member.name}{member.id === user?.id && <span className="wp-muted"> (you)</span>}</td><td>{member.email}</td><td><span className="wp-tag">{member.role}</span></td></tr>)}</tbody></table></div>
          {!resource.data.members.length && <p className="wp-muted">No members returned by the server.</p>}
        </section>
        <section className="wp-section"><div className="wp-section-heading"><h2>Invitations</h2></div>
          {canManage && <form className="wp-inline-form wp-invite-form" onSubmit={invite}><label className="field">Email address<input type="email" required value={email} disabled={!!busy} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" /></label><label className="field">Role<select value={role} disabled={!!busy} onChange={e => setRole(e.target.value as 'MEMBER' | 'ADMIN')}><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></select></label><Button type="submit" busy={busy === 'invite'} disabled={!!busy || !email.trim()}><MailPlus size={16} />Create invitation</Button></form>}
          {resource.data.invites.length ? <div className="wp-table-scroll" role="region" aria-label="Pending invitations" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th>{canManage && <th scope="col"><span className="wp-sr-only">Actions</span></th>}</tr></thead><tbody>{resource.data.invites.map(item => <tr key={item.id}><td>{item.email}</td><td>{item.role}</td><td className="wp-muted">Pending</td>{canManage && <td><Button variant="ghost" onClick={() => setRevoking(item)}><X size={14} />Revoke</Button></td>}</tr>)}</tbody></table></div> : <p className="wp-muted wp-empty-line">No pending invitations.</p>}
        </section>
        <section className="wp-section"><div className="wp-section-heading"><h2>Review queue <span className="wp-count">{resource.data.reviewQueue.length}</span></h2></div>{resource.data.reviewQueue.length ? <RunTable runs={resource.data.reviewQueue} /> : <p className="wp-muted">No generations awaiting review.</p>}</section>
        <section className="wp-section"><div className="wp-section-heading"><h2>Audit activity</h2></div>{resource.data.audit.length ? <ol className="wp-audit">{resource.data.audit.map(event => <li key={event.id}><span>{event.message}</span><time dateTime={event.createdAt}>{dateTime(event.createdAt)}</time></li>)}</ol> : <p className="wp-muted">No audit activity yet.</p>}</section>
        {!params.has('token') && <AcceptInvitation onAccepted={resource.reload} />}
      </>}
      {revoking && <ConfirmDelete title="Revoke invitation" description={<>Revoke the invitation for <strong>{revoking.email}</strong>? Its invitation token will no longer work.</>} onClose={() => setRevoking(null)} action={() => api(`/team/invites/${encodeURIComponent(revoking.id)}`, { method: 'DELETE' })} onDeleted={() => { setRevoking(null); setInvitation(''); resource.reload(); }} />}
    </>}
  </div>;
}

const settingsTabs = [{ id: 'profile', name: 'Profile' }, { id: 'billing', name: 'Billing' }, { id: 'integrations', name: 'Integrations' }, { id: 'api', name: 'API keys' }] as const;

export function SettingsPage() {
  const [params] = useSearchParams();
  const requested = params.get('tab') || (params.has('upgrade') ? 'billing' : 'profile');
  const tab = settingsTabs.some(item => item.id === requested) ? requested : 'profile';
  return <div className="wp-page">
    <PageHeading eyebrow="Account" title="Settings" description="Manage your account, plan, and connected services." />
    <nav className="wp-tabs" aria-label="Settings sections">{settingsTabs.map(item => <Link key={item.id} to={`/settings?tab=${item.id}`} aria-current={tab === item.id ? 'page' : undefined}>{item.name}</Link>)}</nav>
    {tab === 'profile' && <ProfileSettings />}{tab === 'billing' && <BillingSettings />}{tab === 'integrations' && <IntegrationSettings />}{tab === 'api' && <ApiKeySettings />}
  </div>;
}

function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { setName(user?.name || ''); }, [user?.name]);
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!name.trim()) return;
    setBusy(true); setError(''); setSaved(false);
    try {
      const updated = await patch<User>('/account', { name: name.trim() });
      if (!updated?.id) throw new Error('The server did not return the updated profile. Refresh to verify your changes.');
      setUser(updated); setSaved(true);
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };
  return <section className="wp-section"><div className="wp-section-heading"><h2>Profile</h2></div><form className="wp-form wp-form-narrow" onSubmit={save}>
    <label className="field">Full name<input autoComplete="name" required value={name} disabled={busy} onChange={e => { setName(e.target.value); setSaved(false); }} /></label>
    <label className="field">Email address<input type="email" value={user?.email || ''} readOnly /></label>
    {error && <Notice>{error}</Notice>}{saved && <Notice tone="success">Profile saved.</Notice>}
    <div className="wp-form-actions wp-actions-start"><Button type="submit" busy={busy} disabled={!name.trim() || name.trim() === user?.name}><Check size={15} />Save changes</Button></div>
  </form></section>;
}

function BillingSettings() {
  const { user, health, refresh, refreshHealth } = useAuth();
  const [params] = useSearchParams();
  const [plan, setPlan] = useState<'PRO' | 'TEAM'>(params.get('upgrade') === 'TEAM' ? 'TEAM' : 'PRO');
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [developmentPlan, setDevelopmentPlan] = useState<Plan>(user?.plan || 'FREE');
  const [developmentResult, setDevelopmentResult] = useState('');
  useEffect(() => { if (params.get('upgrade') === 'PRO' || params.get('upgrade') === 'TEAM') setPlan(params.get('upgrade') as 'PRO' | 'TEAM'); }, [params]);
  useEffect(() => { setDevelopmentPlan(user?.plan || 'FREE'); }, [user?.plan]);
  const redirect = async (path: string, body?: unknown) => {
    setBusy(path); setError('');
    try {
      const result = await post<{ url: string }>(path, body);
      if (!result?.url) throw new Error('The billing service did not return a checkout URL. Please try again.');
      const url = new URL(result.url, window.location.origin);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('The billing service returned an invalid URL.');
      window.location.assign(url.href);
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(''); }
  };
  const changeDevelopmentPlan = async (event: FormEvent) => {
    event.preventDefault(); setBusy('development'); setError(''); setDevelopmentResult('');
    try { await post('/billing/development-plan', { plan: developmentPlan }); await refresh(); setDevelopmentResult('Development plan updated. No payment was taken.'); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(''); }
  };
  const checkHealth = async () => { setBusy('health'); await refreshHealth(); setBusy(''); };
  return <div className="wp-settings-content">
    <section className="wp-section"><div className="wp-section-heading"><h2>Current plan</h2><span className="wp-tag">{user?.plan}</span></div>
      <div className="wp-billing-current"><div><h3>{user?.plan === 'FREE' ? 'Free' : user?.plan === 'PRO' ? 'Pro' : user?.plan === 'TEAM' ? 'Team' : 'Enterprise'}</h3><p className="wp-muted">{user?.usage.used ?? 0} of {user?.usage.limit === null ? 'unlimited' : user?.usage.limit ?? 'unknown'} generations used{user?.usage.resetAt ? ` · Resets ${dateTime(user.usage.resetAt)}` : ''}</p></div><Button variant="secondary" busy={busy === '/billing/portal'} disabled={!!busy || !health?.billingConfigured || !paid(user?.plan)} onClick={() => redirect('/billing/portal')}><CreditCard size={16} />Manage subscription<ExternalLink size={14} /></Button></div>
    </section>
    {error && <Notice>{error}</Notice>}
    {!health ? <Notice tone="warning"><div className="wp-error"><span>Billing configuration is unavailable. Refresh service status before checkout.</span><Button variant="secondary" busy={busy === 'health'} disabled={!!busy} onClick={checkHealth}><RefreshCw size={14} />Refresh status</Button></div></Notice> : !health.billingConfigured && <Notice tone="warning">Payments are not configured on this server. Checkout and the billing portal are unavailable.</Notice>}
    <section className="wp-section"><div className="wp-section-heading"><h2>Plans</h2></div>
      <div className="wp-plan-summary"><div><h3>Free</h3><p>Last 5 generations in history</p></div><strong>$0</strong></div>
      <fieldset className="wp-plan-options" disabled={!!busy}><legend className="wp-sr-only">Choose a plan to review</legend>
        <label className={`wp-plan-option ${plan === 'PRO' ? 'wp-selected' : ''}`}><input type="radio" name="billing-plan" checked={plan === 'PRO'} onChange={() => setPlan('PRO')} /><span><strong>Pro</strong><span>Projects and full generation history</span></span><span className="wp-plan-price">$19<small>/month</small><span>$190/year with annual billing</span></span></label>
        <label className={`wp-plan-option ${plan === 'TEAM' ? 'wp-selected' : ''}`}><input type="radio" name="billing-plan" checked={plan === 'TEAM'} onChange={() => { setPlan('TEAM'); setInterval('monthly'); }} /><span><strong>Team</strong><span>Team workspace, reviews, and API keys</span></span><span className="wp-plan-price">$49<small>/seat/month</small><span>Minimum 3 seats · $147/month minimum</span></span></label>
      </fieldset>
      <div className="wp-plan-summary"><div><h3>Enterprise</h3><p>SSO requires enterprise identity configuration.</p></div><span className="wp-muted">Custom agreement</span></div>
    </section>
    <section className="wp-section"><div className="wp-section-heading"><h2>Review {plan === 'PRO' ? 'Pro' : 'Team'}</h2></div>
      {plan === 'PRO' && <fieldset className="wp-interval" disabled={!!busy}><legend>Billing interval</legend><label><input type="radio" name="billing-interval" checked={interval === 'monthly'} onChange={() => setInterval('monthly')} />Monthly · $19</label><label><input type="radio" name="billing-interval" checked={interval === 'yearly'} onChange={() => setInterval('yearly')} />Yearly · $190</label></fieldset>}
      <p className="wp-checkout-total">{plan === 'TEAM' ? '$147/month minimum for 3 seats at $49 per seat.' : interval === 'yearly' ? '$190 billed annually.' : '$19 billed monthly.'}</p>
      <p className="wp-muted">Review subscription and payment details in checkout before confirming your purchase.</p>
      <Button busy={busy === '/billing/checkout'} disabled={!!busy || !health?.billingConfigured || user?.plan === plan} onClick={() => redirect('/billing/checkout', { plan, interval: plan === 'TEAM' ? 'monthly' : interval })}><CreditCard size={16} />{user?.plan === plan ? 'Current plan' : 'Continue to checkout'}<ArrowRight size={15} /></Button>
    </section>
    {health?.devBilling && <section className="wp-section wp-development"><div className="wp-section-heading"><h2>Development billing</h2><span className="wp-tag">Development only</span></div><p className="wp-muted">Change plan access for local testing. This does not create a paid subscription.</p>
      <form className="wp-inline-form" onSubmit={changeDevelopmentPlan}><label className="field">Development plan<select value={developmentPlan} disabled={!!busy} onChange={e => setDevelopmentPlan(e.target.value as Plan)}>{(['FREE', 'PRO', 'TEAM', 'ENTERPRISE'] as Plan[]).map(item => <option key={item} value={item}>{item}</option>)}</select></label><Button variant="secondary" type="submit" busy={busy === 'development'} disabled={!!busy || developmentPlan === user?.plan}><Settings2 size={15} />Apply development plan</Button></form>
      {developmentResult && <Notice tone="success">{developmentResult}</Notice>}
    </section>}
  </div>;
}

function IntegrationSettings() {
  const { health, refreshHealth } = useAuth();
  const [busy, setBusy] = useState(false);
  const refresh = async () => { setBusy(true); try { await refreshHealth(); } finally { setBusy(false); } };
  const services = [
    { name: 'AI generation', description: 'Generation provider configuration', configured: health?.aiConfigured },
    { name: 'GitHub', description: 'Repository integration configuration', configured: health?.githubConfigured },
    { name: 'Billing', description: 'Checkout and subscription portal', configured: health?.billingConfigured },
  ];
  return <div className="wp-settings-content"><section className="wp-section"><div className="wp-section-heading"><h2>Service integrations</h2><Button variant="secondary" busy={busy} onClick={refresh}><RefreshCw size={15} />Refresh status</Button></div>
    {!health && <Notice tone="warning">Service health is unavailable. Configuration status cannot be verified.</Notice>}
    <div className="wp-service-list">{services.map(service => <div className="wp-service" key={service.name}><div><h3>{service.name}</h3><p>{service.description}</p></div><span className={`wp-service-status ${service.configured ? 'wp-mint' : 'wp-muted'}`}>{service.configured === undefined ? 'Unknown' : service.configured ? 'Configured' : 'Missing configuration'}</span></div>)}</div>
  </section><section className="wp-section"><div className="wp-section-heading"><h2>Validation tools</h2>{health?.validationMode && <span className="wp-tag">{health.validationMode}</span>}</div>
    <div className="wp-service-list">{tools.map(tool => { const available = health?.validators.find(item => item.tool === tool)?.available; return <div className="wp-service" key={tool}><h3>{toolNames[tool]}</h3><span className={available ? 'wp-mint' : 'wp-muted'}>{available === undefined ? 'Unknown' : available ? 'Available' : 'Not installed'}</span></div>; })}</div>
    {health && <p className="wp-muted wp-health-meta">Server status: {health.status} · Version: {health.version}</p>}
  </section><section className="wp-section"><div className="wp-section-heading"><h2>Enterprise identity</h2></div><p className="wp-muted">Single sign-on requires enterprise identity configuration. Provider readiness is not reported by this server's health endpoint.</p></section></div>;
}

function ApiKeySettings() {
  const { user } = useAuth();
  const allowed = teamPlan(user?.plan);
  const resource = useResource<ApiKey[]>(allowed ? '/account/keys' : null);
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  useEffect(() => { if (!allowed) setSecret(''); }, [allowed]);
  const create = async (event: FormEvent) => {
    event.preventDefault(); if (!name.trim()) return;
    setBusy(true); setError(''); setSecret('');
    try {
      const result = await post<ApiKey>('/account/keys', { name: name.trim() });
      if (result?.key) setSecret(result.key);
      else setError('The key was created, but its secret was not returned. Revoke it and create another key.');
      setName(''); resource.reload();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };
  if (!allowed) return <UpgradeGate title="API access for your workflows" description="API keys are available on Team and Enterprise plans." plan="Team" />;
  return <section className="wp-section"><div className="wp-section-heading"><h2>API keys</h2><Link className="btn btn-secondary" to="/docs/api">API documentation<ArrowRight size={15} /></Link></div>
    <p className="wp-muted">Use bearer keys to create and retrieve generations. Treat keys like passwords.</p>
    <form className="wp-inline-form wp-key-form" onSubmit={create}><label className="field">Key name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Production CI" disabled={busy} /></label><Button type="submit" busy={busy} disabled={!name.trim() || !!secret}><Plus size={16} />Create key</Button></form>
    {error && <Notice>{error}</Notice>}
    {secret && <SecretValue title="Your new API key" value={secret} onDismiss={() => setSecret('')}>Copy this key now. It is shown only once and will disappear when you leave this view. Dismiss it after saving it securely.</SecretValue>}
    {resource.loading ? <Loading label="Loading API keys" /> : resource.error ? <ReadError error={resource.error} retry={resource.reload} /> : !resource.data?.length ? <EmptyState icon={KeyRound} title="No API keys" description="Create a key for your first API integration." /> : <div className="wp-table-scroll" role="region" aria-label="API keys" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">Name</th><th scope="col">Prefix</th><th scope="col">Created</th><th scope="col"><span className="wp-sr-only">Actions</span></th></tr></thead><tbody>{resource.data.map(key => <tr key={key.id}><td>{key.name}</td><td><code>{key.prefix}...</code></td><td className="wp-nowrap">{dateTime(key.createdAt)}</td><td><Button variant="ghost" onClick={() => setRevoking(key)}><Trash2 size={14} />Revoke</Button></td></tr>)}</tbody></table></div>}
    {revoking && <ConfirmDelete title="Revoke API key" description={<>Revoke <strong>{revoking.name}</strong>? Applications using this key will lose access immediately.</>} onClose={() => setRevoking(null)} action={() => api(`/account/keys/${encodeURIComponent(revoking.id)}`, { method: 'DELETE' })} onDeleted={() => { setRevoking(null); setSecret(''); resource.reload(); }} />}
  </section>;
}
