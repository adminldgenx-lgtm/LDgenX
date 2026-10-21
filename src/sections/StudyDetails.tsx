import { useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { StudyDetails as Details } from '../content/fr';
import { useCatalog } from '../i18n';
import { Reveal } from '../components/ui';
import { useReducedMotion, useSeen } from '../components/motion';
import { DecodeOnce } from '../components/Decode';
import { LiveList } from '../components/Steps';

/* The published figures of a case study, drawn from the numbers of its report: samples by
   region as bars, the path from samples to data as a sequence of counts, then what the
   analyses show, who did what and the source documents. */

export function StudyDetails({ details: d }: { details: Details }) {
  const { ui } = useCatalog();
  const bars = useRef<HTMLDivElement>(null);
  const funnel = useRef<HTMLOListElement>(null);
  const barsSeen = useSeen(bars);
  const funnelSeen = useSeen(funnel);
  const reduced = useReducedMotion();
  const max = Math.max(...d.regions.map((x) => x.value));
  const format = new Intl.NumberFormat(ui.htmlLang);
  return (
    <section className="section-space study-details">
      <div className="container">
        <div className="study-details-grid">
          <div className="study-regions">
            <h2 className="study-details-title">{d.regionsTitle}</h2>
            <div ref={bars} className="study-bars" data-seen={barsSeen || undefined}>
              {d.regions.map((region, i) => (
                <div
                  key={region.name}
                  className="study-bar"
                  style={{ '--v': region.value / max, '--i': i } as CSSProperties}
                >
                  <span className="study-bar-name">{region.name}</span>
                  <span className="study-bar-track" aria-hidden="true">
                    <span className="study-bar-fill" />
                  </span>
                  <span className="study-bar-value">{format.format(region.value)}</span>
                </div>
              ))}
            </div>
            <p className="study-note">{d.regionsNote}</p>
          </div>
          <div className="study-funnel">
            <h2 className="study-details-title">{d.funnelTitle}</h2>
            <ol ref={funnel} className="study-funnel-steps" data-seen={funnelSeen || undefined}>
              {d.funnel.map((step, i) => (
                <li key={step.label} style={{ '--i': i } as CSSProperties}>
                  <strong>
                    <DecodeOnce text={step.value} play={funnelSeen && !reduced} delay={i * 180} />
                  </strong>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="study-findings">
          <h2 className="study-details-title">{d.findingsTitle}</h2>
          <LiveList className="study-findings-list" items={d.findings} />
        </div>

        <div className="study-closing">
          <Reveal className="study-perspective">
            <h3>{d.perspectiveTitle}</h3>
            <p>{d.perspective}</p>
          </Reveal>
          <Reveal className="study-roles" delay={0.08}>
            <h3>{d.rolesTitle}</h3>
            <ul>
              {d.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="study-documents">
          <h3>{d.documentsTitle}</h3>
          <ul>
            {d.documents.map((doc) => (
              <li key={doc.url}>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <span className="study-document-label">{doc.label}</span>
                  <span className="study-document-meta">{doc.meta}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">{ui.common.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
