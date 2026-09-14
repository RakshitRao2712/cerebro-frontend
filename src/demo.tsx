"use client";

import { useEffect, useState } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";

const settings = { word: "CEREBRO", scrollLength: 2.4, interactive: true, annotations: false };
const family = '"Druk Super", Arial, sans-serif';
let fontLoad: Promise<void> | undefined;

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  const [face, setFace] = useState<string | null>(null);
  useEffect(() => {
    let settled = false;
    const finish = (value: string) => { if (!settled) { settled = true; setFace(value); } };
    fontLoad ??= new FontFace("Druk Super", 'url("/Druk-Super-Trial.otf")', { weight: "700 900" })
      .load().then((font) => { document.fonts.add(font); });
    const timeout = window.setTimeout(() => finish("Arial, sans-serif"), 3000);
    void fontLoad.then(() => finish(family), () => finish("Arial, sans-serif"));
    return () => { settled = true; clearTimeout(timeout); };
  }, []);
  return (
    <div data-demo-scroll data-slipstream-demo role="region" aria-label="Cerebro"
      style={{ width: "100%", background: "#000", containerType: "inline-size", fontFamily: face ?? "Arial, sans-serif" }}>
      <style>{`
        [data-slipstream-demo] section{--gp-paper:#000 !important;--gp-ink:#ff8c00 !important;--gp-field:#ff8c00 !important;--gp-foreground:#ff8c00 !important;}
        [data-slipstream-demo] [data-gp-caption]{display:none;}
        [data-slipstream-demo] [data-gp-hint]{display:none;}
        [data-slipstream-demo] [data-gp-enter]{display:none;}
        [data-slipstream-demo] [data-gp-touch-picker]{display:none;}
        [data-slipstream-demo] [data-gp-select]{display:none;}
        [data-slipstream-demo] [data-gp-content]{padding:5.5rem clamp(1.25rem,5cqw,5rem) 6.5rem;font-family:inherit;}
        [data-slipstream-demo] section,[data-slipstream-demo] [data-gp-caption]{font-family:inherit;}
      `}</style>
      {face ? <GlyphPortal word={s.word} fontFamily={family} fontWeight={900} style={{ fontFamily: family, color: "#ff8c00" }} scrollLength={s.scrollLength} interactive={s.interactive} annotations={s.annotations} enterLabel="" front={<></>}>
        <></>
      </GlyphPortal> : <div role="status" style={{ height: "100%", display: "grid", placeItems: "center", color: "#ff8c00", fontSize: 12 }}>Loading type…</div>}
    </div>
  );
}
