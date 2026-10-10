import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Circle, LoaderCircle, LockKeyhole, X } from 'lucide-react';
import type { Generation } from '@/lib/api';

export function Button({ children, variant = 'primary', busy = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; busy?: boolean }) {
  return <button {...props} disabled={props.disabled || busy} className={`btn btn-${variant} ${className}`}>{busy && <LoaderCircle size={15} className="spin" />}{children}</button>;
}
export function Notice({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' | 'success' | 'warning' }) {
  return <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}><AlertCircle size={17} /><div>{children}</div></div>;
}
export function Loading({ label = 'Loading workspace' }: { label?: string }) { return <div className="loading-state" role="status"><LoaderCircle className="spin" size={21} /><span>{label}</span></div>; }
export function EmptyState({ icon: Icon = Circle, title, description, children }: { icon?: ComponentType<{ size?: number }>; title: string; description?: string; children?: ReactNode }) {
  return <div className="empty-state"><Icon size={28} /><h2>{title}</h2>{description && <p>{description}</p>}{children}</div>;
}
export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="heading-actions">{children}</div>}</div>;
}
export function UpgradeGate({ title, description, plan = 'Pro' }: { title: string; description: string; plan?: string }) {
  return <div className="upgrade-gate"><LockKeyhole size={28} /><span className="eyebrow">Cerebro {plan}</span><h2>{title}</h2><p>{description}</p><Link to={`/pricing`} className="btn btn-primary">Explore {plan}<ArrowRight size={16} /></Link></div>;
}
const statusLabels: Record<Generation['status'], string> = { QUEUED: 'Queued', RUNNING: 'Running', SUCCEEDED: 'Validated', FAILED: 'Failed', CANCELLED: 'Cancelled' };
export function StatusPill({ status }: { status: Generation['status'] }) { return <span className={`status-pill status-${status.toLowerCase()}`}>{status === 'SUCCEEDED' ? <Check size={12} /> : status === 'RUNNING' ? <LoaderCircle size={12} className="spin" /> : <Circle size={7} fill="currentColor" />}{statusLabels[status] || status}</span>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className="modal" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}><div className="modal-heading"><h2>{title}</h2><button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div>{children}</dialog>;
}
