import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BrainCircuit, Menu, X } from "lucide-react";
import "@/marketing.css";

const navigation = [
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs/api", label: "Documentation" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <div className="marketing-root">
      <a className="mk-skip-link" href="#marketing-content">Skip to content</a>
      <header className="mk-header" ref={headerRef}>
        <div className="mk-nav-inner">
          <Link to="/" className="mk-brand" aria-label="Cerebro home"><BrainCircuit size={25} strokeWidth={1.6} aria-hidden="true" /><span>Cerebro</span></Link>
          <nav className="mk-desktop-nav" aria-label="Main navigation">{navigation.map(({ to, label }) => <Link key={to} to={to} aria-current={location.pathname === to ? "page" : undefined}>{label}</Link>)}</nav>
          <div className="mk-nav-actions"><Link to="/login" className="mk-login-link">Log in</Link><Link to="/console" className="mk-button mk-button-white mk-pill mk-nav-cta">Try Cerebro <ArrowRight size={15} aria-hidden="true" /></Link><button type="button" className="mk-menu-toggle" ref={menuButton} aria-expanded={menuOpen} aria-controls="mk-mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} title={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}</button></div>
        </div>
        <nav className="mk-mobile-nav" id="mk-mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen}>{navigation.map(({ to, label }) => <Link key={to} to={to} aria-current={location.pathname === to ? "page" : undefined}>{label}<ArrowRight size={15} aria-hidden="true" /></Link>)}<Link to="/login">Log in <ArrowRight size={15} aria-hidden="true" /></Link></nav>
      </header>
      <main id="marketing-content">{children}</main>
      <footer className="mk-footer"><div className="mk-footer-inner"><div><Link to="/" className="mk-brand"><BrainCircuit size={23} strokeWidth={1.6} aria-hidden="true" /><span>Cerebro</span></Link><p>Infrastructure code, with the checks to go with it.</p></div><nav aria-label="Footer navigation"><Link to="/about">About</Link><Link to="/pricing">Pricing</Link><Link to="/docs/api">API docs</Link><Link to="/console">Console</Link></nav></div><div className="mk-footer-bottom"><span>&copy; {new Date().getFullYear()} Cerebro</span><span>Generate. Validate. Iterate.</span></div></footer>
    </div>
  );
}
