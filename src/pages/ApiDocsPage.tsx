import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clipboard, Terminal } from 'lucide-react';
import { copyText } from '@/lib/api';
import { Button, Notice } from '@/components/AppUI';
import '@/workspace-pages.css';

function CodeSample({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!copied) return; const timer = setTimeout(() => setCopied(false), 2500); return () => clearTimeout(timer); }, [copied]);
  const copy = async () => {
    setBusy(true); setError('');
    try { await copyText(code); setCopied(true); }
    catch { setError('Clipboard access failed. Select and copy the example manually.'); }
    finally { setBusy(false); }
  };
  return <div className="wp-code-sample"><div className="wp-code-heading"><span>{title}</span><Button variant="ghost" busy={busy} aria-label={`Copy ${title}`} onClick={copy}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied' : 'Copy'}</Button></div><pre tabIndex={0} aria-label={title}><code>{code}</code></pre>{error && <Notice>{error}</Notice>}</div>;
}

const createExample = `curl --request POST "$CEREBRO_URL/api/generations" \
  --header "Authorization: Bearer $CEREBRO_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "prompt": "Create a production-ready Dockerfile for a Node.js service on port 3000",
    "tools": ["DOCKERFILE"]
  }'`;
const pollExample = `curl "$CEREBRO_URL/api/generations/$GENERATION_ID" \
  --header "Authorization: Bearer $CEREBRO_API_KEY"`;
const listExample = `curl "$CEREBRO_URL/api/generations" \
  --header "Authorization: Bearer $CEREBRO_API_KEY"`;

export function ApiDocsPage() {
  return <div className="wp-docs">
    <header className="wp-docs-header"><Link to="/" className="wp-docs-brand" aria-label="Cerebro home"><Terminal size={22} />Cerebro</Link><nav aria-label="Documentation navigation"><Link to="/pricing">Pricing</Link><Link to="/console" className="btn btn-secondary">Open app<ArrowRight size={15} /></Link></nav></header>
    <div className="wp-docs-layout">
      <aside className="wp-docs-nav"><span className="wp-docs-eyebrow">Developer documentation</span><nav aria-label="On this page"><a href="#authentication">Authentication</a><a href="#create-generation">Create a generation</a><a href="#generation-status">Poll for results</a><a href="#list-generations">List generations</a><a href="#tools">Tools</a><a href="#usage">Usage and access</a><a href="#errors">Errors</a></nav></aside>
      <main className="wp-docs-main">
        <div className="wp-docs-title"><span className="wp-docs-eyebrow">API reference</span><h1>Cerebro API</h1><p>Generate infrastructure, follow validation, and retrieve artifacts from your own workflows.</p></div>
        <section id="authentication" className="wp-docs-section"><h2>Authentication</h2><p>API access requires a Team or Enterprise account. Create a key in <Link to="/settings?tab=api">Settings → API keys</Link> and send it in the <code>Authorization</code> header with every request.</p>
          <CodeSample title="Bearer authentication" code={'Authorization: Bearer YOUR_API_KEY'} />
          <p>The key is shown once when it is created. Store it in your server or CI secret manager. Keep it out of browser bundles, URLs, and source control.</p>
          <p>In these examples, <code>CEREBRO_URL</code> is the origin of your Cerebro deployment, without a trailing slash. Set <code>CEREBRO_API_KEY</code> to your secret key in your shell or CI environment. All API paths start with <code>/api</code>.</p>
        </section>
        <section id="create-generation" className="wp-docs-section"><h2>Create a generation</h2><div className="wp-endpoint"><span>POST</span><code>/api/generations</code></div><p>Submit a prompt and the tools you need. Generation is asynchronous: the response contains the generation ID and its current state. A successful submission does not mean validation has finished.</p>
          <div className="wp-table-scroll" role="region" aria-label="Generation request fields" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Description</th></tr></thead><tbody><tr><td><code>prompt</code></td><td>string</td><td>Required. Describe the infrastructure you want to generate.</td></tr><tr><td><code>tools</code></td><td>string[]</td><td>Required. One or more supported tool identifiers.</td></tr><tr><td><code>projectId</code></td><td>string</td><td>Optional. An existing project the account can access.</td></tr></tbody></table></div>
          <CodeSample title="Create generation with curl" code={createExample} /><p>Read <code>id</code> from the returned generation and use it as <code>GENERATION_ID</code> in the next request. Submission consumes generation usage according to your account plan.</p>
        </section>
        <section id="generation-status" className="wp-docs-section"><h2>Poll for results</h2><div className="wp-endpoint"><span className="wp-method-get">GET</span><code>/api/generations/:id</code></div><CodeSample title="Get generation with curl" code={pollExample} /><p>Poll the same ID while its status is <code>QUEUED</code> or <code>RUNNING</code>. Wait between requests and back off on transient failures. Stop when it reaches a terminal state.</p>
          <div className="wp-table-scroll" role="region" aria-label="Generation statuses" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">Status</th><th scope="col">Meaning</th><th scope="col">Terminal</th></tr></thead><tbody><tr><td><code>QUEUED</code></td><td>Accepted and waiting to run.</td><td>No</td></tr><tr><td><code>RUNNING</code></td><td>Generation or validation is in progress.</td><td>No</td></tr><tr><td><code>SUCCEEDED</code></td><td>The run completed successfully.</td><td>Yes</td></tr><tr><td><code>FAILED</code></td><td>The run failed. Inspect its error and events.</td><td>Yes</td></tr><tr><td><code>CANCELLED</code></td><td>The run was cancelled.</td><td>Yes</td></tr></tbody></table></div>
          <p>A generation includes <code>id</code>, <code>title</code>, <code>prompt</code>, <code>tools</code>, <code>status</code>, <code>createdAt</code>, <code>updatedAt</code>, <code>attempts</code>, <code>files</code>, and <code>events</code>. Each file contains <code>filename</code>, <code>code</code>, and <code>tool</code>. Events include <code>timestamp</code>, <code>level</code>, and <code>message</code>.</p>
          <p>Use the final status and validation events to decide whether to consume artifacts. Do not deploy a partial result from an active or failed run.</p>
        </section>
        <section id="list-generations" className="wp-docs-section"><h2>List generations</h2><div className="wp-endpoint"><span className="wp-method-get">GET</span><code>/api/generations</code></div><p>Returns the generations accessible to the authenticated account. Access and history retention are governed by the account's plan.</p><CodeSample title="List generations with curl" code={listExample} /></section>
        <section id="tools" className="wp-docs-section"><h2>Supported tools</h2><p>Use these exact, case-sensitive identifiers in <code>tools</code>.</p><div className="wp-table-scroll" role="region" aria-label="Supported tools" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">Identifier</th><th scope="col">Output</th></tr></thead><tbody><tr><td><code>TERRAFORM</code></td><td>Terraform infrastructure configuration</td></tr><tr><td><code>KUBERNETES</code></td><td>Kubernetes manifests</td></tr><tr><td><code>DOCKERFILE</code></td><td>Docker container build configuration</td></tr><tr><td><code>ANSIBLE</code></td><td>Ansible automation</td></tr></tbody></table></div><p>Validation availability depends on the server's installed tools and configuration. Check <Link to="/settings?tab=integrations">integration status</Link> and the generation's events for the validation actually performed.</p></section>
        <section id="usage" className="wp-docs-section"><h2>Usage and access</h2><p>API keys are available to Team and Enterprise accounts. A key authenticates as the account that created it and does not bypass plan limits or project permissions. API generation requests use the same account usage allowance as the application.</p><p>Review your current usage and reset date in <Link to="/settings?tab=billing">billing settings</Link>. Free accounts have access to their last 5 generations in the app; Pro adds full history and projects. Free and Pro do not include API keys.</p><p>Enterprise single sign-on requires enterprise identity configuration. Bearer API keys are separate from interactive sign-in.</p></section>
        <section id="errors" className="wp-docs-section"><h2>Errors</h2><p>Check the HTTP status before reading a generation response. JSON errors use a human-readable <code>message</code> and may include a machine-readable <code>code</code>.</p><CodeSample title="Error response shape" code={'{\n  "message": "Description of the error",\n  "code": "ERROR_CODE"\n}'} />
          <div className="wp-table-scroll" role="region" aria-label="HTTP error handling" tabIndex={0}><table className="wp-table"><thead><tr><th scope="col">HTTP status</th><th scope="col">Handling</th></tr></thead><tbody><tr><td><code>400</code></td><td>Correct invalid or missing request fields before retrying.</td></tr><tr><td><code>401</code></td><td>Check your bearer key; it may be missing, invalid, or revoked.</td></tr><tr><td><code>403</code></td><td>Check the account's plan and permission to access the resource.</td></tr><tr><td><code>404</code></td><td>Check the resource ID and the authenticated account's access.</td></tr><tr><td><code>429</code></td><td>Check usage limits and any retry guidance returned by the server.</td></tr><tr><td><code>5xx</code></td><td>The server or a required service is unavailable. Back off before retrying.</td></tr></tbody></table></div>
          <p>A network timeout does not prove that a submission failed. Check existing generations before repeating a <code>POST</code> to avoid creating a duplicate run. Failures after submission are reported by the generation's <code>FAILED</code> status, <code>error</code>, and <code>events</code>.</p>
        </section>
      </main>
    </div>
    <footer className="wp-docs-footer"><span>Cerebro API documentation</span><Link to="/settings?tab=api">Manage API keys<ArrowRight size={15} /></Link></footer>
  </div>;
}
