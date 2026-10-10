import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUp, Box, Check, ChevronRight, CircleCheck, Code2, Container, FileCode2, FolderGit2, GitBranch, History, Layers3, LoaderCircle, Plus, ShieldCheck, Sparkles, Square, Terminal, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, dateTime, errorMessage, isActive, paid, post, toolNames, type Generation, type Project, type Repository, type Tool } from '@/lib/api';
import { useResource } from '@/lib/useResource';
import { Button, Loading, Notice, PageHeading, StatusPill, UpgradeGate } from '@/components/AppUI';
import GenerationResult from '@/components/GenerationResult';

const tools: { value: Tool; icon: typeof Box; label: string; validator: string }[] = [
  { value: 'TERRAFORM', icon: Layers3, label: 'Terraform', validator: 'terraform validate' },
  { value: 'KUBERNETES', icon: Box, label: 'Kubernetes', validator: 'kube-linter' },
  { value: 'DOCKERFILE', icon: Container, label: 'Dockerfile', validator: 'hadolint' },
  { value: 'ANSIBLE', icon: Terminal, label: 'Ansible', validator: 'ansible-lint' },
];
const examples: { title: string; detail: string; prompt: string; tool: Tool; icon: typeof Box }[] = [
  { title: 'Containerize an app', detail: 'A lean, multi-stage Docker build', prompt: 'Create a production-ready multi-stage Dockerfile for a Node.js 22 application. Install dependencies with npm ci, run as a non-root user, expose port 3000, and include a health check.', tool: 'DOCKERFILE', icon: Container },
  { title: 'Build a cloud foundation', detail: 'Terraform for your next service', prompt: 'Create a Terraform module for an AWS VPC in ap-south-1 with two public and two private subnets across availability zones. Include variables, outputs, sensible tags, and no hardcoded credentials.', tool: 'TERRAFORM', icon: Layers3 },
  { title: 'Prepare a deployment', detail: 'Kubernetes, with the essentials', prompt: 'Create a Kubernetes deployment and ClusterIP service for a web application on port 8080, with two replicas, CPU and memory limits, readiness and liveness probes, and a non-root security context.', tool: 'KUBERNETES', icon: Box },
];

export default function ConsolePage({ importMode = false }: { importMode?: boolean }) {
  const { user, health, refresh } = useAuth(); const [params, setParams] = useSearchParams();
  const runId = params.get('run'); const newKey = params.get('new');
  const [prompt, setPrompt] = useState(params.get('prompt') || '');
  const [selectedTools, setSelectedTools] = useState<Tool[]>(['TERRAFORM']);
  const [projectId, setProjectId] = useState(params.get('project') || '');
  const [run, setRun] = useState<Generation | null>(null); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [loadError, setLoadError] = useState(''); const [loadingRun, setLoadingRun] = useState(false);
  const [repoUrl, setRepoUrl] = useState(''); const [repository, setRepository] = useState<Repository | null>(null); const [importing, setImporting] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [pollVersion, setPollVersion] = useState(0);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const projects = useResource<Project[]>(paid(user?.plan) ? '/projects' : null);
  const recent = useResource<Generation[]>('/generations');

  useEffect(() => { setRun(null); setError(''); setLoadError(''); setContextId(null); setPrompt(params.get('prompt') || ''); setProjectId(params.get('project') || ''); }, [newKey, importMode]);
  useEffect(() => {
    if (!runId) { setRun(null); setLoadingRun(false); return; }
    let cancelled = false; let timer: ReturnType<typeof setTimeout>; const controller = new AbortController();
    setLoadingRun(true); setLoadError('');
    const poll = async () => {
      try {
        const value = await api<Generation>(`/generations/${encodeURIComponent(runId)}`, { signal: controller.signal });
        if (cancelled) return;
        setRun(value); setLoadingRun(false); setLoadError('');
        if (isActive(value)) timer = setTimeout(poll, 1800);
        else { recent.reload(); void refresh(); }
      } catch (e) { if (!cancelled) { setLoadError(errorMessage(e)); setLoadingRun(false); } }
    };
    void poll();
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, [runId, pollVersion, refresh, recent.reload]);

  const selectTool = (tool: Tool) => {
    if (!paid(user?.plan)) setSelectedTools([tool]);
    else setSelectedTools(current => current.includes(tool) ? current.length > 1 ? current.filter(value => value !== tool) : current : [...current, tool]);
  };
  const submit = async (event?: FormEvent) => {
    event?.preventDefault(); if (!prompt.trim() || busy || isActive(run)) return;
    setBusy(true); setError('');
    try {
      const value = await post<Generation>('/generations', { prompt: prompt.trim(), tools: selectedTools, ...(projectId ? { projectId } : {}), ...(repository ? { repositoryUrl: repository.url } : {}), ...(contextId ? { contextGenerationId: contextId } : {}) });
      setRun(value); setContextId(null); setParams({ run: value.id }); recent.reload(); void refresh();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const importRepo = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setImporting(true); setRepository(null);
    try { setRepository(await post<Repository>('/github/import', { url: repoUrl.trim() })); }
    catch (e) { setError(errorMessage(e)); } finally { setImporting(false); }
  };
  const iterate = useCallback((value: Generation, edited?: string) => {
    setContextId(value.id); setSelectedTools(value.tools); setProjectId(value.projectId || '');
    setPrompt(edited ? `Validate and correct these changes to the previous generation:\n\n${edited}` : '');
    promptRef.current?.focus(); promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (importMode && !paid(user?.plan)) return <><PageHeading title="Import repository" description="Infrastructure that knows your codebase." /><UpgradeGate title="Bring your repository into the loop." description="Connect a GitHub repository, detect its stack, and generate coordinated infrastructure with Cerebro Pro." /></>;
  return <div className={`console-page ${runId ? 'has-run' : ''}`}>
    <PageHeading eyebrow={importMode ? 'GITHUB / IMPORT' : 'CEREBRO CONSOLE'} title={importMode ? 'Start with your codebase.' : runId ? run?.title || 'Generation workspace' : 'What are we building?'} description={importMode ? 'A repository. A little context. Infrastructure that fits.' : runId ? 'Every file, validation result, and correction in one place.' : 'Describe your infrastructure. Let Cerebro work through the details.'}>
      <Link className="muted-link" to="/history"><History size={15} />View history<ChevronRight size={14} /></Link>
    </PageHeading>
    {importMode && <section className="repository-import"><form onSubmit={importRepo}><label className="field" htmlFor="repo-url">GitHub repository</label><div className="repo-input"><GitBranch size={19} /><input id="repo-url" type="url" required placeholder="https://github.com/your-team/your-project" value={repoUrl} onChange={event => { setRepoUrl(event.target.value); setRepository(null); }} /><Button type="submit" busy={importing}><ArrowDown size={16} />Import</Button></div></form>{repository && <div className="repository-context"><div><Check size={17} /><strong>{repository.name}</strong><span>{repository.language}</span><span className="mono">{repository.defaultBranch}</span></div><p>{repository.description}</p><details><summary>{repository.files.length} files detected</summary><ul>{repository.files.map(file => <li key={file}><FileCode2 size={13} />{file}</li>)}</ul></details></div>}</section>}
    <form className="prompt-composer" onSubmit={submit}>
      <div className="composer-heading"><span><Sparkles size={16} />{contextId ? 'Refine your infrastructure' : 'Describe your infrastructure'}</span>{paid(user?.plan) && <label className="project-picker"><FolderGit2 size={15} /><select aria-label="Save to project" value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">No project</option>{projects.data?.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}</div>
      {contextId && <div className="context-tag"><GitBranch size={12} />Using previous generation as context<button type="button" onClick={() => setContextId(null)} className="icon-btn" aria-label="Remove previous context"><X size={12} /></button></div>}
      <textarea ref={promptRef} id="infrastructure-prompt" aria-label="Infrastructure description" placeholder="A Kubernetes deployment for my Node.js app, with autoscaling, health checks, and a secure service..." value={prompt} required minLength={10} maxLength={20000} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); if (prompt.trim().length >= 10) void submit(); } }} />
      <div className="composer-footer"><div className="tool-picker" aria-label="Infrastructure tools">{tools.map(({ value, icon: Icon, label }) => <button type="button" className={`tool-option tool-${value.toLowerCase()} ${selectedTools.includes(value) ? 'selected' : ''}`} key={value} aria-pressed={selectedTools.includes(value)} title={label} onClick={() => selectTool(value)}><Icon size={16} /><span>{label}</span>{selectedTools.includes(value) && <Check size={12} />}</button>)}</div><Button type="submit" busy={busy} disabled={prompt.trim().length < 10 || isActive(run) || (importMode && !repository)} title="Generate infrastructure">{busy ? 'Starting' : 'Generate'}<ArrowUp size={17} /></Button></div>
    </form>
    <div className="composer-meta"><span><ShieldCheck size={13} />{selectedTools.length} {selectedTools.length === 1 ? 'tool' : 'tools'}<span className="meta-dot">/</span>Up to {user?.plan === 'FREE' ? 3 : 5} attempts</span><span>{user?.usage.limit && user.usage.limit > 0 ? `${Math.max(0, user.usage.limit - user.usage.used)} generations remaining` : 'Unlimited generations'}</span></div>
    {projects.error && <Notice tone="warning">Project list unavailable. {projects.error}</Notice>}
    {error && <Notice>{error}</Notice>}
    {loadError && <Notice>{loadError} <button className="text-button" onClick={() => setPollVersion(value => value + 1)}>Retry loading</button></Notice>}
    {loadingRun && !run && <Loading label="Loading generation" />}
    {run && <><div className="run-summary"><div><StatusPill status={run.status} /><span>{run.attempts || 0} attempts</span><span>{dateTime(run.createdAt)}</span></div>{isActive(run) && <Button variant="secondary" onClick={async () => { try { await post(`/generations/${run.id}/cancel`); setPollVersion(value => value + 1); } catch (e) { setError(errorMessage(e)); } }}><Square size={12} />Cancel</Button>}</div><GenerationResult run={run} onChange={setRun} onIterate={iterate} /></>}
    {!runId && !importMode && <>
      <section className="starter-section"><div className="section-heading"><h2>A place to start</h2><span>Or make it your own</span></div><div className="starter-grid">{examples.map(({ title, detail, prompt: examplePrompt, tool, icon: Icon }) => <button key={title} className="starter" onClick={() => { setPrompt(examplePrompt); setSelectedTools([tool]); promptRef.current?.focus(); }}><Icon size={20} strokeWidth={1.5} /><h3>{title}</h3><p>{detail}</p><ArrowUp size={15} className="starter-arrow" /></button>)}</div></section>
      <section className="recent-section"><div className="section-heading"><h2>Recent generations</h2><Link to="/history">View all<ArrowRight size={14} /></Link></div>{recent.loading ? <Loading label="Loading recent generations" /> : recent.error ? <Notice>{recent.error}</Notice> : !recent.data?.length ? <div className="recent-empty"><Code2 size={22} /><div><strong>Your first build belongs here.</strong><p>Completed generations and their validation history will appear in your workspace.</p></div><Plus size={16} /></div> : <div className="recent-list">{recent.data.slice(0, 4).map(item => <Link key={item.id} to={`/console?run=${item.id}`}><FileCode2 size={18} /><div><strong>{item.title}</strong><span>{item.tools.map(tool => toolNames[tool]).join(' + ')}<span className="meta-dot">/</span>{dateTime(item.createdAt)}</span></div><StatusPill status={item.status} /><ChevronRight size={15} /></Link>)}</div>}</section>
      <section className="validation-strip"><CircleCheck size={18} /><div><strong>Built. Checked. Refined.</strong><p>Real CLI validators verify each result before it earns a pass.</p></div><div className="validator-names">{tools.map(tool => <span key={tool.value}>{health?.validators?.find(item => item.tool === tool.value)?.available ? <span className="ready-dot" /> : <span className="unready-dot" />}{tool.validator}</span>)}</div></section>
    </>}
    {isActive(run) && <div className="run-in-progress" role="status"><LoaderCircle className="spin" size={15} />Cerebro is working. You can leave this page and return from History.</div>}
  </div>;
}
