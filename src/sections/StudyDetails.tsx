import { useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { StudyDetails as Details } from '../content/fr';
import { useCatalog } from '../i18n';
import { Reveal } from '../components/ui';
import { useSeen } from '../components/motion';
import { DecodeOnce } from '../components/Decode';
import { LiveList } from '../components/Steps';
import { Figure } from '../components/Figure';

// Display width of a report figure: low-resolution originals are shown smaller to stay sharp.
const FIGURE_WIDTH = { wide: 1100, medium: 760 };

/* Horizontal bars that grow when they come into view, scaled to the largest value. */
function Bars({ rows, unit = '' }: { rows: { name: string; value: number }[]; unit?: string }) {
  const { ui } = useCatalog();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const max = Math.max(...rows.map((x) => x.value));
  const format = new Intl.NumberFormat(ui.htmlLang);
  return (
    <div ref={ref} className="study-bars" data-seen={seen || undefined}>
      {rows.map((row, i) => (
        <div
          key={row.name}
          className="study-bar"
          style={{ '--v': row.value / max, '--i': i } as CSSProperties}
        >
          <span className="study-bar-name">{row.name}</span>
          <span className="study-bar-track" aria-hidden="true">
            <span className="study-bar-fill" />
          </span>
          <span className="study-bar-value">
            {format.format(row.value)}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* The published figures of a case study, drawn from the numbers of its report: samples by
   region as bars, the path from samples to data as a sequence of counts, then what the
   analyses show, who did what and the source documents. */

export function StudyDetails({ details: d }: { details: Details }) {
  const { ui } = useCatalog();
  const funnel = useRef<HTMLOListElement>(null);
  const funnelSeen = useSeen(funnel);
  return (
    <section className="section-space study-details">
      <div className="container">
        <div className="study-details-grid" data-single={!d.regions || undefined}>
          {d.regions && (
            <div className="study-regions">
              <h2 className="study-details-title">{d.regionsTitle}</h2>
              <Bars rows={d.regions} unit={d.regionsUnit} />
              <p className="study-note">{d.regionsNote}</p>
            </div>
          )}
          <div className="study-funnel">
            <h2 className="study-details-title">{d.funnelTitle}</h2>
            <ol ref={funnel} className="study-funnel-steps" data-seen={funnelSeen || undefined}>
              {d.funnel.map((step, i) => (
                <li key={step.label} style={{ '--i': i } as CSSProperties}>
                  <strong>
                    <DecodeOnce text={step.value} play={funnelSeen} delay={i * 180} />
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

        {d.figures && (
          <div className="study-figures">
            <h2 className="study-details-title">{d.figuresTitle}</h2>
            <div className="study-figures-grid">
              {d.figures.map((f) =>
                'bars' in f ? (
                  <figure key={f.caption} className="study-figure-bars">
                    <Bars rows={f.bars} />
                    <figcaption className="study-note">{f.caption}</figcaption>
                  </figure>
                ) : (
                  <Figure
                    key={f.image}
                    image={f.image}
                    alt={f.caption}
                    caption={f.caption}
                    className={f.size ? `study-figure-${f.size}` : ''}
                    sizes={`(max-width: 800px) 92vw, ${FIGURE_WIDTH[f.size ?? 'wide']}px`}
                  />
                ),
              )}
            </div>
          </div>
        )}

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

        {d.documents && (
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
        )}
      </div>
    </section>
  );
}
