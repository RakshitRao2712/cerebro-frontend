import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Minus,
} from "lucide-react";
import MarketingLayout from "@/components/MarketingLayout";
import { useAuth } from "@/lib/auth";

export default function PricingPage() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const proPrice = annual ? "$190" : "$19";
  const proPeriod = annual ? "/year" : "/month";

  const faqs = [
    {
      q: "How does the automated validation retry loop work?",
      a: "When you submit a prompt, Cerebro runs the generated code through official CLI linters (terraform validate, kube-linter, hadolint, ansible-lint). If errors or warnings occur, our diagnostic evaluator parses the error output and guides the generator to fix the code automatically—up to 3 times on Free, and up to 5 times on Pro and Team.",
    },
    {
      q: "Are the CLI tools executed on real cloud infrastructure?",
      a: "No. Validators run in sandboxed, ephemeral containers that verify syntax, resource references, module schemas, and best-practice rules without provisioning real resources or requiring cloud provider credentials.",
    },
    {
      q: "Can I cancel or switch plans at any time?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time from your account Settings > Billing page. Changes take effect at the end of the current billing cycle with no cancellation penalties.",
    },
    {
      q: "What happens if I exceed my monthly generation quota?",
      a: "On the Free plan, generations pause until your monthly reset date. On Pro and Team plans, you can either purchase generation packs or easily upgrade your seat count directly from the billing console.",
    },
    {
      q: "How does GitHub repository import work in Cerebro Pro?",
      a: "Cerebro inspects your repository structure (such as package.json, pom.xml, or existing charts) to detect language runtimes, exposed ports, and required cloud services, generating perfectly tailored infrastructure that matches your code.",
    },
    {
      q: "Is my proprietary infrastructure code kept private?",
      a: "Yes. Your prompts and generated configurations are strictly isolated to your account workspace. We never use your code or architectural data to train public AI models.",
    },
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="mk-pricing-hero" aria-labelledby="pricing-title">
        <p className="mk-eyebrow">
          <span className="mk-eyebrow-dot" /> Transparent Pricing
        </p>
        <h1 id="pricing-title">Predictable plans for proven infrastructure.</h1>
        <p>
          Start for free to explore the validation loop, or choose a plan with multi-tool
          coordination, GitHub context, and team collaboration.
        </p>

        {/* Billing Switcher */}
        <div className="mk-billing-toggle-wrap">
          <span style={{ color: !annual ? "#eee" : "#888", fontWeight: !annual ? 600 : 400 }}>
            Monthly
          </span>
          <div className="mk-toggle-btn" role="group" aria-label="Billing interval">
            <button
              type="button"
              className={`mk-toggle-option ${!annual ? "active" : ""}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`mk-toggle-option ${annual ? "active" : ""}`}
              onClick={() => setAnnual(true)}
            >
              Annual
            </button>
          </div>
          <span style={{ color: annual ? "#eee" : "#888", fontWeight: annual ? 600 : 400 }}>
            Yearly
          </span>
          <span className="mk-save-badge">Save 17%</span>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="mk-pricing-grid" aria-label="Pricing tiers">
        {/* FREE PLAN */}
        <div className="mk-plan-card">
          <div className="mk-plan-top">
            <h2>Free</h2>
            <p>For developers exploring autonomous IaC validation.</p>
          </div>
          <div className="mk-plan-price-wrap">
            <span className="mk-price-amount">$0</span>
            <span className="mk-price-period">/forever</span>
          </div>
          <Link to="/console" className="mk-button mk-button-secondary mk-plan-cta">
            {user ? "Go to console" : "Get started free"}
          </Link>
          <ul className="mk-plan-features">
            <li>
              <Check size={16} /> 10 generations per month
            </li>
            <li>
              <Check size={16} /> Up to 3 validation retries per run
            </li>
            <li>
              <Check size={16} /> Single-tool generation (TF, K8s, Docker, Ansible)
            </li>
            <li>
              <Check size={16} /> Last 5 generations saved in history
            </li>
            <li>
              <Check size={16} /> Standard CLI linting &amp; verification
            </li>
            <li>
              <Check size={16} /> Community documentation
            </li>
          </ul>
        </div>

        {/* PRO PLAN */}
        <div className="mk-plan-card popular">
          <div className="mk-popular-badge">Most popular</div>
          <div className="mk-plan-top">
            <h2>Pro</h2>
            <p>For cloud and DevOps engineers building real systems.</p>
          </div>
          <div className="mk-plan-price-wrap">
            <span className="mk-price-amount">{proPrice}</span>
            <span className="mk-price-period">{proPeriod}</span>
          </div>
          <Link
            to={user ? "/settings?tab=billing&upgrade=PRO" : "/login"}
            className="mk-button mk-button-primary mk-plan-cta"
          >
            {user?.plan === "PRO" ? "Current plan" : "Upgrade to Pro"}
          </Link>
          <ul className="mk-plan-features">
            <li>
              <Check size={16} /> <strong>100 generations per month</strong>
            </li>
            <li>
              <Check size={16} /> <strong>Up to 5 validation retries</strong> per run
            </li>
            <li>
              <Check size={16} /> Coordinated multi-tool generations
            </li>
            <li>
              <Check size={16} /> GitHub repository stack detection
            </li>
            <li>
              <Check size={16} /> Unlimited history &amp; project organization
            </li>
            <li>
              <Check size={16} /> Export entire bundle as zip archive
            </li>
            <li>
              <Check size={16} /> Priority generation queue
            </li>
          </ul>
        </div>

        {/* TEAM PLAN */}
        <div className="mk-plan-card">
          <div className="mk-plan-top">
            <h2>Team</h2>
            <p>For platform teams collaborating on infrastructure code.</p>
          </div>
          <div className="mk-plan-price-wrap">
            <span className="mk-price-amount">$49</span>
            <span className="mk-price-period">/seat/mo</span>
          </div>
          <Link
            to={user ? "/settings?tab=billing&upgrade=TEAM" : "/login"}
            className="mk-button mk-button-secondary mk-plan-cta"
          >
            {user?.plan === "TEAM" ? "Current plan" : "Upgrade to Team"}
          </Link>
          <ul className="mk-plan-features">
            <li>
              <Check size={16} /> <strong>Unlimited team generations</strong>
            </li>
            <li>
              <Check size={16} /> Up to 5 validation retries per run
            </li>
            <li>
              <Check size={16} /> Shared team workspace &amp; projects
            </li>
            <li>
              <Check size={16} /> Peer code review, comments &amp; approval flows
            </li>
            <li>
              <Check size={16} /> Team member role permissions (Admin, Member)
            </li>
            <li>
              <Check size={16} /> Programmatic API keys for CI/CD runners
            </li>
            <li>
              <Check size={16} /> Consolidated team billing (min 3 seats)
            </li>
          </ul>
        </div>

        {/* ENTERPRISE PLAN */}
        <div className="mk-plan-card">
          <div className="mk-plan-top">
            <h2>Enterprise</h2>
            <p>For organizations needing custom compliance &amp; private VPCs.</p>
          </div>
          <div className="mk-plan-price-wrap">
            <span className="mk-price-amount" style={{ fontSize: "28px" }}>
              Custom
            </span>
            <span className="mk-price-period">agreement</span>
          </div>
          <a
            href="mailto:sales@cerebro.dev?subject=Cerebro%20Enterprise%20Inquiry"
            className="mk-button mk-button-secondary mk-plan-cta"
          >
            Contact sales
          </a>
          <ul className="mk-plan-features">
            <li>
              <Check size={16} /> Dedicated runner VPCs &amp; air-gapped support
            </li>
            <li>
              <Check size={16} /> Custom corporate linters &amp; OPA policies
            </li>
            <li>
              <Check size={16} /> SSO / SAML 2.0 &amp; SCIM provisioning
            </li>
            <li>
              <Check size={16} /> Complete immutable audit trail
            </li>
            <li>
              <Check size={16} /> 99.9% uptime SLA guarantee
            </li>
            <li>
              <Check size={16} /> Dedicated infrastructure architect
            </li>
          </ul>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="mk-compare-wrap" aria-labelledby="compare-heading">
        <h2 id="compare-heading" className="mk-compare-title">
          Detailed feature breakdown
        </h2>
        <div className="mk-table-responsive">
          <table className="mk-compare-table">
            <thead>
              <tr>
                <th className="col-feature">Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Team</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-feature">Monthly generations</td>
                <td>10</td>
                <td>100</td>
                <td>Unlimited</td>
                <td>Custom</td>
              </tr>
              <tr>
                <td className="col-feature">Validation retries per run</td>
                <td>3 attempts</td>
                <td>5 attempts</td>
                <td>5 attempts</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td className="col-feature">Supported tools (TF, K8s, Docker, Ansible)</td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">Coordinated multi-tool generations</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">GitHub repository import</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">Project organization</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">Generation history retention</td>
                <td>Last 5 runs</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td className="col-feature">Team reviews &amp; approvals</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">CI/CD API access</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">Dedicated sandbox runners</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
              <tr>
                <td className="col-feature">SAML 2.0 / SSO &amp; SCIM</td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Minus size={16} className="minus" />
                </td>
                <td>
                  <Check size={16} className="check" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mk-faq-wrap" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mk-faq-title">
          Frequently asked questions
        </h2>
        <p className="mk-faq-subtitle">
          Everything you need to know about Cerebro plans and billing.
        </p>

        <div className="mk-faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`mk-faq-item ${openFaq === index ? "open" : ""}`}>
              <button
                type="button"
                className="mk-faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaq === index}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} />
              </button>
              {openFaq === index && <div className="mk-faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-closing">
          <div>
            <p className="mk-eyebrow">Start generating</p>
            <h2>Proven code in minutes. No credit card required.</h2>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/console" className="mk-button mk-button-white mk-pill">
              Try Cerebro Free <ArrowRight size={16} />
            </Link>
            <Link to="/docs/api" className="mk-button mk-button-secondary mk-pill">
              API Documentation
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
