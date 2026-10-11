import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Blocks,
  Box,
  CheckCircle2,
  Cpu,
  GitBranch,
  Layers3,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import MarketingLayout from "@/components/MarketingLayout";

interface PipelineStep {
  id: string;
  number: string;
  title: string;
  short: string;
  description: string;
  tool: string;
  command: string;
  output: string;
  statusType: "success" | "warn" | "err";
  metrics: {
    duration: string;
    engine: string;
    sandboxing: string;
  };
}

const pipelineSteps: PipelineStep[] = [
  {
    id: "intent",
    number: "01",
    title: "Plain-English Intent Parsing",
    short: "Natural language parsed into declarative infrastructure specs.",
    description:
      "You specify your deployment goals, security requirements, and target provider. Cerebro's parser identifies the right IaC ecosystem (Terraform, Kubernetes, Dockerfile, or Ansible) and extracts constraints like replica counts, security contexts, and resource quotas.",
    tool: "Cerebro Intent Engine",
    command: "$ cerebro parse --target terraform",
    output: `> Parsing intent: "Provision secure S3 bucket with versioning and public block"
✓ Identified target tool: Terraform (aws provider >= 5.0)
✓ Constraints extracted:
  - aws_s3_bucket.assets
  - aws_s3_bucket_versioning.assets [status=Enabled]
  - aws_s3_bucket_public_access_block.assets [strict=all]
✓ Strategy dispatched to code generator.`,
    statusType: "success",
    metrics: {
      duration: "180ms",
      engine: "Semantic AST Planner",
      sandboxing: "Stateless In-Memory",
    },
  },
  {
    id: "generation",
    number: "02",
    title: "Multi-Tool Code Generation",
    short: "High-fidelity generation aware of current provider schemas.",
    description:
      "Cerebro generates structured code with complete resource bindings. Unlike generic LLMs that produce hallucinated arguments or deprecated syntax, Cerebro's generation prompts are tuned against current provider schemas and idiomatic module structures.",
    tool: "Terraform HCL Generator",
    command: "$ cerebro generate --module main.tf",
    output: `Generated main.tf (35 lines, 3 resources)
-------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  bucket = "cerebro-example-assets"
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}
-------------------------------------------------------
✓ File written to ephemeral runner environment.`,
    statusType: "success",
    metrics: {
      duration: "640ms",
      engine: "IaC Model Pipeline",
      sandboxing: "Ephemeral Runner",
    },
  },
  {
    id: "validation",
    number: "03",
    title: "Sandboxed CLI Tool Validation",
    short: "Real industrial CLIs execute against the generated files.",
    description:
      "The generated code is mounted into an isolated sandbox where authentic binaries—terraform validate, kube-linter, hadolint, or ansible-lint—are executed. We do not mock linters: the actual tool compiles and validates the configuration.",
    tool: "Terraform CLI 1.9.0",
    command: "$ terraform init -backend=false && terraform validate",
    output: `Initializing provider plugins...
- Finding hashicorp/aws versions matching ">= 5.0.0"...
- Installing hashicorp/aws v5.48.0...

Validating configuration...
Error: Missing required argument
  on main.tf line 28, in resource "aws_s3_bucket_public_access_block" "assets":
  28: resource "aws_s3_bucket_public_access_block" "assets" {

The argument "block_public_acls" is required, but no definition was found.`,
    statusType: "err",
    metrics: {
      duration: "1.2s",
      engine: "Native CLI Binary in Sandbox",
      sandboxing: "MicroVM / Isolated cgroup",
    },
  },
  {
    id: "evaluation",
    number: "04",
    title: "Diagnostic Evaluation & Diagnosis",
    short: "Validator errors are translated into actionable repair plans.",
    description:
      "When a CLI tool fails or flags warnings, Cerebro's diagnostic evaluator parses stdout/stderr and error exit codes. It pinpoints the exact line, rule identifier, and schema expectation, formulating a surgical correction plan.",
    tool: "Cerebro Evaluator",
    command: "$ cerebro diagnose --log validate.stderr",
    output: `[Evaluator] Exit code 1 from 'terraform validate'
Detected error: TS-TF-MISSING-ARG
File: main.tf, Line: 28
Target: aws_s3_bucket_public_access_block.assets
Resolution Plan:
  + Inject block_public_acls = true
  + Inject block_public_policy = true
  + Inject ignore_public_acls = true
  + Inject restrict_public_buckets = true
Dispatching retry 2 of 5...`,
    statusType: "warn",
    metrics: {
      duration: "310ms",
      engine: "CLI Log Diagnostic Parser",
      sandboxing: "Zero-disk memory state",
    },
  },
  {
    id: "correction",
    number: "05",
    title: "Self-Correction & Proven Delivery",
    short: "Automated iteration until the configuration is mechanically clean.",
    description:
      "The correction is applied and re-tested in the sandbox. The loop repeats until all checks succeed or the retry limit is reached. You receive clean code with a complete audit record of every pass, warning, and fix.",
    tool: "Validation Passed",
    command: "$ terraform validate",
    output: `Success! The configuration is valid.

All 4 public access block attributes verified.
Syntax: OK
Type consistency: OK
References: OK
0 errors, 0 warnings.
Output verified and signed for download.`,
    statusType: "success",
    metrics: {
      duration: "890ms",
      engine: "Deterministic Loop Complete",
      sandboxing: "Artifact Certified",
    },
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Zero Hallucination Policy",
    description:
      "LLMs frequently invent flags, combine incompatible provider versions, or use deprecated APIs. Cerebro never trusts generated code blindly: it only passes once native CLIs mechanically confirm correctness.",
  },
  {
    icon: RefreshCw,
    title: "Autonomous Self-Correction",
    description:
      "When a linter or validator flags an issue, Cerebro doesn't ask you to manually debug syntax. The evaluator analyzes stdout and stderr, diagnoses the cause, and applies targeted revisions automatically.",
  },
  {
    icon: Cpu,
    title: "Native CLI Toolchains",
    description:
      "We run real binaries—terraform validate, kube-linter, hadolint, and ansible-lint—inside isolated sandbox containers. No mock validators or approximate heuristics.",
  },
  {
    icon: GitBranch,
    title: "Verifiable Audit Trail",
    description:
      "Every run preserves its attempt history, exact validator logs, and evaluator deductions. You know exactly what was checked, why fixes were made, and how the final code was proven.",
  },
];

export default function AboutPage() {
  const [activeStepId, setActiveStepId] = useState(pipelineSteps[0].id);
  const activeStep = pipelineSteps.find((s) => s.id === activeStepId) || pipelineSteps[0];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="mk-about-hero" aria-labelledby="about-title">
        <p className="mk-eyebrow">
          <span className="mk-eyebrow-dot" /> Architecture &amp; Methodology
        </p>
        <h1 id="about-title">
          AI writes it. <br />
          <span className="mk-gradient-text">Real tools prove it.</span>
        </h1>
        <p>
          Cerebro is an autonomous infrastructure generation system that couples large language
          models with real CLI toolchains. Code is generated, tested, and self-corrected in a closed
          loop before you ever review it.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/console" className="mk-button mk-button-white mk-pill">
            Open console <ArrowRight size={15} />
          </Link>
          <Link to="/pricing" className="mk-button mk-button-secondary mk-pill">
            View plans &amp; pricing
          </Link>
        </div>
      </section>

      {/* Interactive Pipeline Explorer */}
      <section className="mk-section" aria-labelledby="pipeline-heading" style={{ paddingTop: 0 }}>
        <div className="mk-section-intro">
          <div>
            <p className="mk-eyebrow">Step by step</p>
            <h2 id="pipeline-heading">The Cerebro verification loop</h2>
          </div>
          <p>
            Explore each stage of the autonomous loop. See how plain English instructions are
            parsed, converted to IaC, verified against real CLI toolchains, and corrected on the fly.
          </p>
        </div>

        <div className="mk-pipeline-box">
          {/* Step Selector Tabs */}
          <div className="mk-pipeline-nav" role="tablist" aria-label="Pipeline Stages">
            {pipelineSteps.map((step) => (
              <button
                key={step.id}
                role="tab"
                aria-selected={activeStep.id === step.id}
                className={`mk-pipeline-tab ${activeStep.id === step.id ? "active" : ""}`}
                onClick={() => setActiveStepId(step.id)}
              >
                <span className="num">{step.number}</span>
                <span>{step.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Step Content */}
          <div className="mk-pipeline-content">
            <div className="mk-pipeline-info">
              <span className="mk-eyebrow">Step {activeStep.number}</span>
              <h3>{activeStep.title}</h3>
              <p>{activeStep.description}</p>

              <div className="mk-pipeline-meta">
                <div className="mk-meta-row">
                  <span>Execution engine:</span>
                  <strong>{activeStep.metrics.engine}</strong>
                </div>
                <div className="mk-meta-row">
                  <span>Typical latency:</span>
                  <strong>{activeStep.metrics.duration}</strong>
                </div>
                <div className="mk-meta-row">
                  <span>Isolation:</span>
                  <strong>{activeStep.metrics.sandboxing}</strong>
                </div>
              </div>
            </div>

            {/* Terminal Visual */}
            <div className="mk-pipeline-visual">
              <div className="mk-terminal-header">
                <div className="mk-terminal-dots">
                  <span className="mk-terminal-dot" />
                  <span className="mk-terminal-dot" />
                  <span className="mk-terminal-dot" />
                </div>
                <span>{activeStep.tool}</span>
              </div>
              <div style={{ color: "#777", marginBottom: "10px" }}>{activeStep.command}</div>
              <pre
                className={
                  activeStep.statusType === "success"
                    ? "mk-code-success"
                    : activeStep.statusType === "warn"
                    ? "mk-code-warn"
                    : "mk-code-err"
                }
              >
                {activeStep.output}
              </pre>
            </div>
          </div>
        </div>

        {/* Workflow steps cards */}
        <div className="mk-feature-grid">
          <article>
            <Zap size={24} aria-hidden="true" />
            <span className="mk-step-index">01</span>
            <h3>Prompt to Plan</h3>
            <p>
              Natural language is transformed into a structured blueprint with exact resource
              requirements and cloud provider conventions.
            </p>
          </article>
          <article>
            <Terminal size={24} aria-hidden="true" />
            <span className="mk-step-index">02</span>
            <h3>Real CLI Execution</h3>
            <p>
              Sandboxed runners execute actual validators. Error codes, stdout, and stderr are
              captured in full detail.
            </p>
          </article>
          <article>
            <CheckCircle2 size={24} aria-hidden="true" />
            <span className="mk-step-index">03</span>
            <h3>Proven Artifact</h3>
            <p>
              Only configurations that pass validation are signed and delivered, accompanied by an
              unabridged verification audit trail.
            </p>
          </article>
        </div>
      </section>

      {/* Principles Section */}
      <section className="mk-section" aria-labelledby="principles-heading">
        <div className="mk-section-intro">
          <div>
            <p className="mk-eyebrow">Engineering standard</p>
            <h2 id="principles-heading">Guiding principles</h2>
          </div>
          <p>
            Why we chose deterministic toolchains over speculative model completions. How Cerebro
            guarantees enterprise-grade infrastructure reliability.
          </p>
        </div>

        <div className="mk-principles-grid">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.title} className="mk-principle-card">
                <div className="mk-principle-icon">
                  <Icon size={22} />
                </div>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Toolchains */}
      <section className="mk-validation-band">
        <div className="mk-section mk-validation-inner">
          <div>
            <p className="mk-eyebrow">Verified Ecosystems</p>
            <h2>Industrial validators for every layer of your stack.</h2>
            <p>
              From cloud provisioning and container images to Kubernetes deployments and host
              configuration, Cerebro leverages the gold standard of open-source tooling.
            </p>
            <Link to="/docs/api" className="mk-text-link">
              Explore API specifications <ArrowRight size={16} />
            </Link>
          </div>
          <ul className="mk-validator-list">
            <li>
              <span>
                <Blocks size={18} className="mk-terraform" /> Terraform
              </span>
              <code>terraform validate</code>
            </li>
            <li>
              <span>
                <Workflow size={18} className="mk-kubernetes" /> Kubernetes
              </span>
              <code>kube-linter</code>
            </li>
            <li>
              <span>
                <Box size={18} className="mk-dockerfile" /> Dockerfile
              </span>
              <code>hadolint</code>
            </li>
            <li>
              <span>
                <Layers3 size={18} className="mk-ansible" /> Ansible
              </span>
              <code>ansible-lint</code>
            </li>
          </ul>
        </div>
      </section>

      {/* Closing Banner */}
      <section className="mk-section">
        <div className="mk-closing">
          <div>
            <p className="mk-eyebrow">Get started</p>
            <h2>Stop debugging hallucinated infrastructure.</h2>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/console" className="mk-button mk-button-white mk-pill">
              Try Cerebro Free <ArrowRight size={16} />
            </Link>
            <Link to="/pricing" className="mk-button mk-button-secondary mk-pill">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
