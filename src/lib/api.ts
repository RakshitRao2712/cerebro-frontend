export type Plan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
export type Tool = 'TERRAFORM' | 'KUBERNETES' | 'DOCKERFILE' | 'ANSIBLE';
export interface User { id: string; name: string; email: string; plan: Plan; teamId?: string; usage: { used: number; limit: number | null; resetAt: string } }
export interface Health { status: string; aiConfigured: boolean; validators: { tool: Tool; available: boolean }[]; billingConfigured: boolean; githubConfigured: boolean; devBilling?: boolean; validationMode?: string; version: string }
export interface Artifact { filename: string; code: string; tool: Tool }
export interface RunEvent { timestamp: string; level: 'info' | 'success' | 'warning' | 'error'; message: string; tool?: Tool; attempt?: number }
export interface Generation { id: string; title: string; prompt: string; tools: Tool[]; projectId?: string; repositoryUrl?: string; status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'; createdAt: string; updatedAt: string; attempts: number; files: Artifact[]; events: RunEvent[]; error?: string; reviewStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'CHANGES_REQUESTED'; comments: { id: string; author: string; body: string; createdAt: string }[] }
export interface Project { id: string; name: string; description: string; createdAt: string; generationCount: number }
export interface Repository { url: string; name: string; description: string; defaultBranch: string; language: string; files: string[]; context: string }
export interface Team { name: string; members: { id: string; name: string; email: string; role: string }[]; invites: { id: string; email: string; role: string }[]; audit: { id: string; message: string; createdAt: string }[]; reviewQueue: Generation[] }
export interface ApiKey { id: string; name: string; prefix: string; createdAt: string; key?: string }

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) { super(message); this.status = status; this.code = code; }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options, credentials: 'same-origin',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Cerebro could not reach the server. Check your connection and try again.', 0);
  }
  const body = await response.text();
  let data: any;
  try { data = body ? JSON.parse(body) : null; } catch { data = null; }
  if (!response.ok) {
    const fallback = response.status >= 500 ? 'The Cerebro server is unavailable. Please try again shortly.' : 'The request could not be completed.';
    throw new ApiError(data?.message || fallback, response.status, data?.code);
  }
  if (body && data === null) throw new ApiError('The server returned an unexpected response.', 502);
  return data as T;
}

export const post = <T,>(path: string, body?: unknown) => api<T>(path, { method: 'POST', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
export const patch = <T,>(path: string, body: unknown) => api<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';
export const paid = (plan?: Plan) => !!plan && plan !== 'FREE';
export const teamPlan = (plan?: Plan) => plan === 'TEAM' || plan === 'ENTERPRISE';
export const toolNames: Record<Tool, string> = { TERRAFORM: 'Terraform', KUBERNETES: 'Kubernetes', DOCKERFILE: 'Dockerfile', ANSIBLE: 'Ansible' };
export const dateTime = (date?: string) => date ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date)) : '';
export const isActive = (run?: Generation | null) => run?.status === 'RUNNING' || run?.status === 'QUEUED';

export async function copyText(text: string) { await navigator.clipboard.writeText(text); }
export function downloadFile(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name.split('/').pop() || 'artifact.txt';
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
