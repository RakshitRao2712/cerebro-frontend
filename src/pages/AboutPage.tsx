"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/ui/header-2";
import {
  ArrowRight,
  MessageSquareText,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
  Layers,
  GitBranch,
  Terminal,
  Braces,
  ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Intersection-Observer fade-in hook                                  */
/* ------------------------------------------------------------------ */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Pipeline steps data                                                 */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    num: "01",
    icon: MessageSquareText,
    title: "Describe Your Infrastructure",
    short: "Plain-English prompt → intent parsed",
    detail:
      "You describe what you need in natural language and pick a tool — Terraform, Ansible, Kubernetes, or Dockerfile. The system parses your intent and selects the right generation strategy.",
    color: "text-blue-400",
    border: "border-blue-500/30",
    glow: "bg-blue-500/10",
  },
  {
    num: "02",
    icon: Cpu,
    title: "Generator Agent Writes Code",
    short: "AI agent produces raw IaC output",
    detail:
      "A specialised Generator AI agent writes the raw infrastructure-as-code. It uses tool-specific templates, best practices, and the full context of your request to produce a first draft.",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "bg-cyan-500/10",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Real CLI Validation",
    short: "terraform validate · ansible-lint · kube-linter",
    detail:
      "The generated code is executed against the real CLI validator inside an isolated sandbox — not AI opinion, actual tooling. terraform validate, ansible-lint, kube-linter, or hadolint run exactly as they would in your CI pipeline.",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "bg-emerald-500/10",
  },
  {
    num: "04",
    icon: AlertTriangle,
    title: "Evaluator Agent Diagnoses Errors",
    short: "Raw stderr → structured feedback",
    detail:
      "If validation fails, an Evaluator AI agent reads the raw error output — every line of stderr — and produces a structured diagnosis: what broke, why, and exactly what the Generator should fix.",
    color: "text-amber-400",
    border: "border-amber-500/30",
    glow: "bg-amber-500/10",
  },
  {
    num: "05",
    icon: RefreshCw,
    title: "Automatic Self-Correction Loop",
    short: "Rewrite → re-validate → repeat",
    detail:
      "The feedback is fed back to the Generator agent, which rewrites the code. This loop repeats automatically — generate, validate, evaluate, retry — until the code passes or a retry cap is hit. No human intervention required.",
    color: "text-orange-400",
    border: "border-orange-500/30",
    glow: "bg-orange-500/10",
  },
  {
    num: "06",
    icon: FileCheck2,
    title: "Deliver Validated Code + Full Log",
    short: "Proven-valid output with correction history",
    detail:
      "You receive the final validated code plus a complete log of every attempt — every error, every fix, every iteration. Full transparency into how the code reached its proven-valid state.",
    color: "text-teal-400",
    border: "border-teal-500/30",
    glow: "bg-teal-500/10",
  },
];

/* ------------------------------------------------------------------ */
/*  Architecture principles                                             */
/* ------------------------------------------------------------------ */
const PRINCIPLES = [
  {
    icon: Layers,
    title: "Strategy Pattern Architecture",
    description:
      "Each tool (Terraform, Ansible, K8s, Dockerfile) is a pluggable strategy. Adding support for Helm, CloudFormation, or GitHub Actions requires zero changes to the core orchestration engine.",
  },
  {
    icon: GitBranch,
    title: "Multi-Agent Separation",
    description:
      "Generator and Evaluator are distinct agents with isolated contexts. The Generator never sees its own errors directly — only the Evaluator's structured feedback. This prevents error-fixation loops.",
  },
  {
    icon: Terminal,
    title: "Sandboxed Execution",
    description:
      "All CLI validators run in isolated containers. No generated code touches your infrastructure. The sandbox mirrors production tooling versions so validation results are reliable.",
  },
  {
    icon: Braces,
    title: "Deterministic Proof, Not AI Opinion",
    description:
      'The validation step is mechanical — real parsers, real linters, real compilers. If Cerebro says "valid", it means the tool\'s own validator said "valid". No hallucination, no guessing.',
  },
];

/* ------------------------------------------------------------------ */
/*  Step Card Component                                                 */
/* ------------------------------------------------------------------ */
function StepCard({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  const { ref, visible } = useReveal(0.1);
  const [expanded, setExpanded] = useState(false);
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border ${step.border} bg-white/[0.02] backdrop-blur-sm p-6 md:p-8 transition-all duration-700 hover:bg-white/[0.04] hover:border-white/20 cursor-pointer ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Glow */}
      <div
        className={`absolute -inset-px rounded-2xl ${step.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`}
      />

      <div className="flex items-start gap-5">
        {/* Number badge */}
        <div className="flex-shrink-0">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${step.glow} border ${step.border}`}
          >
            <Icon className={`w-5 h-5 ${step.color}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`font-mono text-xs font-bold ${step.color} opacity-60`}
            >
              STEP {step.num}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">
            {step.title}
          </h3>
          <p className="text-sm text-white/50 font-mono">{step.short}</p>

          {/* Expandable detail */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              expanded ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm text-white/60 leading-relaxed">
              {step.detail}
            </p>
          </div>

          <button
            className={`mt-3 flex items-center gap-1 text-xs ${step.color} opacity-50 hover:opacity-100 transition-opacity`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? "Show less" : "Read more"}
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Connector line (not on last) */}
      {index < STEPS.length - 1 && (
        <div className="absolute -bottom-8 left-11 w-px h-8 bg-gradient-to-b from-white/10 to-transparent hidden md:block" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated flow diagram (CSS-based)                                   */
/* ------------------------------------------------------------------ */
function FlowDiagram() {
  const { ref, visible } = useReveal(0.2);

  const nodes = [
    { label: "Prompt", color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
    { label: "Generate", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" },
    { label: "Validate", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
    { label: "Evaluate", color: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
    { label: "Retry", color: "bg-orange-500/20 border-orange-500/40 text-orange-300" },
    { label: "Deliver", color: "bg-teal-500/20 border-teal-500/40 text-teal-300" },
  ];

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-center gap-2 overflow-x-auto py-4">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2">
            <div
              className={`px-5 py-3 rounded-xl border font-mono text-sm font-medium ${node.color} transition-all duration-500 hover:scale-105`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {node.label}
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col items-center gap-2 py-4">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex flex-col items-center gap-2">
            <div
              className={`px-5 py-3 rounded-xl border font-mono text-sm font-medium ${node.color}`}
            >
              {node.label}
            </div>
            {i < nodes.length - 1 && (
              <div className="w-px h-4 bg-white/10" />
            )}
          </div>
        ))}
      </div>

      {/* Retry loop annotation */}
      <div className="flex justify-center mt-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5">
          <RefreshCw className="w-3 h-3 text-orange-400 animate-spin" style={{ animationDuration: "3s" }} />
          <span className="text-xs text-orange-300/70 font-mono">
            Steps 2–5 loop automatically until valid
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Principle Card Component                                            */
/* ------------------------------------------------------------------ */
function PrincipleCard({
  principle,
  index,
}: {
  principle: (typeof PRINCIPLES)[0];
  index: number;
}) {
  const { ref, visible } = useReveal(0.1);
  const Icon = principle.icon;

  return (
    <div
      ref={ref}
      className={`group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-700 hover:border-white/15 hover:bg-white/[0.04] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 mb-4 group-hover:bg-white/10 transition-colors">
        <Icon className="w-5 h-5 text-white/60" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">
        {principle.title}
      </h3>
      <p className="text-sm text-white/40 leading-relaxed">
        {principle.description}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function AboutPage() {
  return (
    <div className="relative bg-black min-h-screen text-white">
      <Header />

      {/* ---- Hero ---- */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/8 rounded-[100%] blur-[140px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            How Cerebro Works
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
            AI writes it.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Real tools prove it.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50 leading-relaxed">
            Cerebro is an autonomous, multi-agent AI system that generates,
            validates, and self-corrects cloud infrastructure code — until it's
            mechanically proven valid, before you ever see it.
          </p>
        </div>
      </section>

      {/* ---- Flow Overview ---- */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <FlowDiagram />
        </div>
      </section>

      {/* ---- Detailed Steps ---- */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              The Pipeline, Step by Step
            </h2>
            <p className="mt-3 text-white/40 text-sm">
              Click any step to expand the technical details.
            </p>
          </div>

          <div className="space-y-6 md:space-y-10">
            {STEPS.map((step, i) => (
              <StepCard key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Architecture Principles ---- */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="border-t border-white/5 pt-20">
            <div className="text-center mb-16">
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                Under the Hood
              </span>
              <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
                Architecture Principles
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {PRINCIPLES.map((p, i) => (
                <PrincipleCard key={p.title} principle={p} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-12 md:p-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to stop guessing?
            </h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">
              Get infrastructure code that's been proven to work before you ever
              see it. No hallucinated syntax. No deprecated APIs. Just valid
              code.
            </p>
            <Link
              to="/console"
              className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/90 hover:scale-105"
            >
              Try Cerebro
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold tracking-tight">Cerebro</span>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link to="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-white/60 transition-colors">
              About
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
