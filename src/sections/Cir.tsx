import { useRef } from 'react';
import { useCatalog, useRoutes } from '../i18n';
import { Button, Eyebrow, Reveal } from '../components/ui';
import { useReducedMotion, useSeen } from '../components/motion';
import { DecodeOnce } from '../components/Decode';
import { AmbientField } from '../components/AmbientField';

/** The research tax credit, set large: LDgenX's approval and what it returns to the client. */
export function CirBlock() {
  const { cir: t } = useCatalog();
  const r = useRoutes();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const reduced = useReducedMotion();
  return (
    <section className="cir-section" aria-labelledby="cir-title">
      <AmbientField tone="dark" className="cir-field" />
      <div ref={ref} className="container cir-layout" data-seen={seen || undefined}>
        <div className="cir-figure">
          <span className="cir-value">
            <DecodeOnce text={t.value} play={seen && !reduced} />
          </span>
          <span className="cir-value-label">{t.valueLabel}</span>
        </div>
        <Reveal className="cir-copy">
          <Eyebrow light>{t.eyebrow}</Eyebrow>
          <h2 id="cir-title">{t.title}</h2>
          <p>{t.text}</p>
          <p className="cir-note">{t.note}</p>
          <Button to={r.contact} variant="light">
            {t.action}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
