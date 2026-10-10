import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUp, Blocks, Box, Braces, Check, ChevronRight, Code2, FileCode2, History, Layers3, Plus, RotateCcw, Settings2, Terminal, Workflow } from "lucide-react";
import MarketingLayout from "@/components/MarketingLayout";

const examples = {
  Terraform: {
    icon: Blocks,
    className: "mk-terraform",
    file: "main.tf",
    prompt: "Create an AWS S3 bucket with versioning enabled and public access blocked.",
    command: "$ terraform validate",
    correction: "Added all four public access block settings.",
    result: "Success! The configuration is valid.",
    code: [
      'resource "aws_s3_bucket" "assets" {',
      '  bucket = "cerebro-example-assets"',
      "}",
      "",
      'resource "aws_s3_bucket_versioning" "assets" {',
      "  bucket = aws_s3_bucket.assets.id",
      "  versioning_configuration {",
      '    status = "Enabled"',
      "  }",
      "}",
      "",
      'resource "aws_s3_bucket_public_access_block" "assets" {',
      "  bucket                  = aws_s3_bucket.assets.id",
      "  block_public_acls       = true",
      "  block_public_policy     = true",
      "  ignore_public_acls      = true",
      "  restrict_public_buckets = true",
      "}",
    ],
  },
  Kubernetes: {
    icon: Workflow,
    className: "mk-kubernetes",
    file: "deployment.yaml",
    prompt: "Write a Kubernetes deployment for an nginx service with resource limits and a health check.",
    command: "$ kube-linter lint deployment.yaml",
    correction: "Added resource limits and a readiness probe.",
    result: "Example result: configured checks passed.",
    code: [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: web",
      "spec:",
      "  replicas: 2",
      "  # Remaining deployment fields omitted",
      "  template:",
      "    spec:",
      "      containers:",
      "        - name: nginx",
      "          image: nginx:1.27-alpine",
      "          resources:",
      '            limits: { cpu: "500m", memory: "128Mi" }',
      "          readinessProbe:",
      "            httpGet: { path: /, port: 80 }",
    ],
  },
  Dockerfile: {
    icon: Box,
    className: "mk-dockerfile",
    file: "Dockerfile",
    prompt: "Create a Dockerfile for a Node.js application that installs production dependencies and runs as a non-root user.",
    command: "$ hadolint Dockerfile",
    correction: "Switched the runtime to the non-root node user.",
    result: "Example result: no lint findings.",
    code: [
      "FROM node:22-alpine",
      "",
      "WORKDIR /app",
      "",
      "COPY package.json package-lock.json ./",
      "RUN npm ci --omit=dev",
      "",
      "COPY --chown=node:node . .",
      "",
      "ENV NODE_ENV=production",
      "USER node",
      "",
      "EXPOSE 3000",
      'CMD ["node", "server.js"]',
    ],
  },
  Ansible: {
    icon: Layers3,
    className: "mk-ansible",
    file: "playbook.yml",
    prompt: "Write an Ansible playbook to install nginx and ensure the service is enabled and running on Ubuntu hosts.",
    command: "$ ansible-lint playbook.yml",
    correction: "Used fully qualified Ansible module names.",
    result: "Example result: no lint findings.",
    code: [
      "---",
      "- name: Configure web servers",
      "  hosts: web",
      "  become: true",
      "  tasks:",
      "    - name: Install nginx",
      "      ansible.builtin.apt:",
      "        name: nginx",
      "        state: present",
      "        update_cache: true",
      "",
      "    - name: Start nginx",
      "      ansible.builtin.service:",
      "        name: nginx",
      "        state: started",
      "        enabled: true",
    ],
  },
};

type Tool = keyof typeof examples;
const toolNames = Object.keys(examples) as Tool[];

function CodeLine({ line }: { line: string }) {
  const tokens = line.split(/("[^"\n]*"|\b(?:true|false|resource|FROM|WORKDIR|COPY|RUN|ENV|USER|EXPOSE|CMD)\b|#.*)/g);
  return <>{tokens.map((token, index) => (
    <span key={index} className={token.startsWith('"') ? "mk-code-string" : token.startsWith("#") ? "mk-code-comment" : /^(true|false|resource|FROM|WORKDIR|COPY|RUN|ENV|USER|EXPOSE|CMD)$/.test(token) ? "mk-code-keyword" : undefined}>{token}</span>
  ))}</>;
}

function WorkspacePreview() {
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool>("Terraform");
  const [prompt, setPrompt] = useState(examples.Terraform.prompt);
  const example = examples[tool];

  function chooseTool(next: Tool) {
    if (!prompt.trim() || toolNames.some((name) => examples[name].prompt === prompt)) setPrompt(examples[next].prompt);
    setTool(next);
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (prompt.trim()) navigate(`/console?prompt=${encodeURIComponent(prompt.trim())}`);
  }

  return (
    <section className="mk-preview" aria-label="Interactive example workspace">
      <div className="mk-preview-topbar">
        <span><Terminal size={15} aria-hidden="true" /> Cerebro console</span>
        <span className="mk-example-label">Example workspace</span>
        <Link to="/console" className="mk-preview-open">Open console <ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
      <div className="mk-preview-body">
        <aside className="mk-preview-sidebar" aria-label="Example workspace navigation">
          <Link to="/console" className="mk-preview-new"><Plus size={15} aria-hidden="true" /> New generation</Link>
          <span className="mk-sidebar-caption">WORKSPACE</span>
          <span className="mk-sidebar-active"><Code2 size={15} aria-hidden="true" /> Generation</span>
          <Link to="/console"><History size={15} aria-hidden="true" /> History</Link>
          <span className="mk-sidebar-caption">EXAMPLE FILE</span>
          <span className="mk-preview-filename"><FileCode2 size={14} aria-hidden="true" /> {example.file}</span>
          <Link to="/settings" className="mk-preview-settings"><Settings2 size={15} aria-hidden="true" /> Settings</Link>
        </aside>
        <div className="mk-preview-workspace">
          <div className="mk-preview-heading"><span>From intent to infrastructure</span><span className="mk-example-label">Illustrative run</span></div>
          <div className="mk-tool-picker" role="group" aria-label="Example infrastructure tool">
            {toolNames.map((name) => {
              const Icon = examples[name].icon;
              return <button key={name} type="button" aria-pressed={tool === name} className={tool === name ? "is-selected" : ""} onClick={() => chooseTool(name)}><Icon size={15} className={examples[name].className} aria-hidden="true" />{name}</button>;
            })}
          </div>
          <form className="mk-prompt-form" onSubmit={submitPrompt}>
            <label className="mk-sr-only" htmlFor="mk-infrastructure-prompt">Describe your infrastructure</label>
            <textarea id="mk-infrastructure-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} maxLength={10000} required placeholder="Describe your infrastructure..." />
            <button type="submit" className="mk-prompt-submit" disabled={!prompt.trim()} aria-label="Open this prompt in Cerebro" title="Open this prompt in Cerebro"><ArrowUp size={19} aria-hidden="true" /></button>
          </form>
          <div className="mk-preview-output">
            <div className="mk-preview-log">
              <div className="mk-output-heading"><Terminal size={14} aria-hidden="true" /> Example validation log</div>
              <ol className="mk-log-steps">
                <li><Check size={14} aria-hidden="true" /><div><span>Generate</span><p>Draft created from the request.</p></div></li>
                <li><RotateCcw size={14} aria-hidden="true" /><div><span>Evaluate &amp; refine</span><p>{example.correction}</p></div></li>
                <li><Check size={14} aria-hidden="true" /><div><span>Validate again</span><code>{example.command}</code></div></li>
              </ol>
              <p className="mk-log-result">{example.result}</p>
              <p className="mk-preview-note">Sample output, not a live validation. Code excerpts are for illustration.</p>
            </div>
            <div className="mk-preview-code">
              <div className="mk-output-heading"><FileCode2 size={14} aria-hidden="true" /><span>{example.file}</span><span className="mk-code-caption">Example excerpt</span></div>
              <pre aria-label={`${tool} example code`} tabIndex={0}><code>{example.code.map((line, index) => <span className="mk-code-line" key={index}><span className="mk-line-number" aria-hidden="true">{index + 1}</span><span><CodeLine line={line} /></span>{"\n"}</span>)}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <MarketingLayout>
      <section className="mk-home-hero" aria-labelledby="mk-home-title">
        <div className="mk-hero-copy">
          <p className="mk-eyebrow">Autonomous infrastructure code</p>
          <h1 id="mk-home-title">Cerebro</h1>
          <p className="mk-hero-tagline">Infrastructure, proven.</p>
          <p className="mk-hero-description">Describe what you need. AI writes the code, real CLI tools check it, and an evaluator guides the fixes.</p>
          <Link to="/console" className="mk-button mk-button-white mk-pill">Start building <ArrowRight size={17} aria-hidden="true" /></Link>
          <div className="mk-supported-tools" aria-label="Supported infrastructure tools">
            {toolNames.map((name) => {
              const Icon = examples[name].icon;
              return <span key={name}><Icon size={18} className={examples[name].className} aria-hidden="true" />{name}</span>;
            })}
          </div>
        </div>
        <div className="mk-preview-container"><WorkspacePreview /></div>
      </section>
      <section className="mk-section mk-workflow-section" aria-labelledby="mk-workflow-title">
        <div className="mk-section-intro"><div><p className="mk-eyebrow">A loop with a purpose</p><h2 id="mk-workflow-title">A first draft is just the start.</h2></div><p>Generation is followed by tooling, feedback, and another attempt. Every run ends with code and a record of what happened.</p></div>
        <div className="mk-feature-grid">
          <article><Braces size={24} aria-hidden="true" /><span className="mk-step-index">01</span><h3>Describe. Generate.</h3><p>Turn a plain-language request into Terraform, Kubernetes, Dockerfile, or Ansible code.</p></article>
          <article><Terminal size={24} aria-hidden="true" /><span className="mk-step-index">02</span><h3>Check. Correct.</h3><p>CLI validators produce real feedback. The evaluator diagnoses findings and guides the next revision, up to the retry limit.</p></article>
          <article><FileCode2 size={24} aria-hidden="true" /><span className="mk-step-index">03</span><h3>Review. Make it yours.</h3><p>Inspect the final code, validation results, and attempt history before taking it into your own workflow.</p></article>
        </div>
        <Link to="/about" className="mk-text-link">Inside the Cerebro loop <ChevronRight size={16} aria-hidden="true" /></Link>
      </section>
      <section className="mk-validation-band">
        <div className="mk-section mk-validation-inner"><div><p className="mk-eyebrow">Evidence alongside the code</p><h2>Checked by the tools<br />you already work with.</h2><p>Validation checks syntax and configured rules. Your infrastructure still needs review, planning, and testing in its target environment.</p><Link to="/docs/api" className="mk-text-link">Explore the API <ArrowRight size={16} aria-hidden="true" /></Link></div><ul className="mk-validator-list"><li><span><Blocks size={18} className="mk-terraform" aria-hidden="true" />Terraform</span><code>terraform validate</code></li><li><span><Workflow size={18} className="mk-kubernetes" aria-hidden="true" />Kubernetes</span><code>kube-linter</code></li><li><span><Box size={18} className="mk-dockerfile" aria-hidden="true" />Dockerfile</span><code>hadolint</code></li><li><span><Layers3 size={18} className="mk-ansible" aria-hidden="true" />Ansible</span><code>ansible-lint</code></li></ul></div>
      </section>
      <section className="mk-section mk-closing"><div><p className="mk-eyebrow">Start with an idea</p><h2>Give your infrastructure a first draft.</h2></div><Link to="/console" className="mk-button mk-button-white mk-pill">Open Cerebro <ArrowRight size={17} aria-hidden="true" /></Link></section>
    </MarketingLayout>
  );
}
