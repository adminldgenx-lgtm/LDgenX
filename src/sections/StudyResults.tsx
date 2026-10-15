import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { FileText } from 'lucide-react';
import { useCatalog } from '../i18n';
import { AnimatedHeading, useReducedMotion, useSeen } from '../components/motion';
import { Eyebrow, Reveal } from '../components/ui';
import { LiveList, StepRows } from '../components/Steps';
import { DecodeOnce } from '../components/Decode';
import { Figure } from '../components/Figure';

/* The published results of the Artois-Picardie study, in three views: the species detected,
   the diversity site by site, and the detailed analyses. Every value and figure comes from the
   final report and the restitution slides published by the Agence de l’eau; nothing is redrawn
   from data that has not been published. */

export function StudyResults() {
  const { artoisPicardie: ap, ui } = useCatalog();
  const t = ui.results;
  const [tab, setTab] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? t.tabs.length - 1
          : (tab + step + t.tabs.length) % t.tabs.length;
    setTab(next);
    tabs.current[next]?.focus();
  };
  return (
    <section className="section-space results-section" aria-label={t.eyebrow}>
      <div className="container">
        <div className="results-head">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <AnimatedHeading text={t.title} />
          </div>
          <Reveal delay={0.1}>
            <p>{t.intro}</p>
          </Reveal>
        </div>
        <KeyFigures />
        <div className="results-overview">
          <Reveal className="results-findings">
            <h3>{t.objectives}</h3>
            <LiveList items={ap.objectives} />
            <h3>{t.findings}</h3>
            <LiveList items={ap.findings} />
          </Reveal>
          <Reveal delay={0.08}>
            <Figure
              image={ap.figures.stations.image}
              alt={ap.figures.stations.caption}
              caption={ap.figures.stations.caption}
            />
          </Reveal>
        </div>
        <div className="results-tabs" role="tablist" aria-label={t.tabsLabel}>
          {t.tabs.map((label, i) => (
            <button
              key={label}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`results-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`results-panel-${i}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={onKey}
            >
              {label}
            </button>
          ))}
        </div>
        {t.tabs.map((label, i) => (
          <div
            key={label}
            id={`results-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`results-tab-${i}`}
            className="results-panel"
            hidden={tab !== i}
          >
            {i === 0 && <SpeciesView />}
            {i === 1 && <SitesView />}
            {i === 2 && <AnalysesView />}
          </div>
        ))}
        <Reveal className="results-documents">
          <h3>{t.documents}</h3>
          <ul>
            {ap.documents.map((d) => (
              <li key={d.href}>
                <a href={d.href} target="_blank" rel="noreferrer">
                  <FileText size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span className="results-document-title">{d.title}</span>
                  <span className="results-document-meta">
                    {d.date} · {d.kind}
                  </span>
                  <span className="sr-only">{ui.common.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="results-credit">{ap.credit}</p>
        </Reveal>
      </div>
    </section>
  );
}

function KeyFigures() {
  const { artoisPicardie: ap } = useCatalog();
  const ref = useRef<HTMLDListElement>(null);
  const seen = useSeen(ref);
  const reduced = useReducedMotion();
  return (
    <dl ref={ref} className="results-figures">
      {ap.keyFigures.map((f, i) => (
        <div key={f.label} style={{ '--i': i } as CSSProperties}>
          <dt>{f.label}</dt>
          <dd>
            <DecodeOnce text={f.value} play={seen && !reduced} delay={120 + i * 150} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SpeciesView() {
  const { artoisPicardie: ap, ui } = useCatalog();
  const t = ui.results;
  const [marker, setMarker] = useState<'teleo' | 'elas'>('teleo');
  const figure = marker === 'teleo' ? ap.figures.speciesTeleo : ap.figures.speciesElas;
  return (
    <div className="results-species">
      <div>
        <h3>{t.core}</h3>
        <h4>{t.coreEstuaries}</h4>
        <LiveList items={ap.core.estuaries} className="species-list" />
        <h4>{t.corePorts}</h4>
        <LiveList items={ap.core.ports} className="species-list" />
        <p className="results-small">{t.corePortsFrequent}</p>
        <LiveList items={ap.core.portsFrequent} className="species-list" />
        <div className="results-caution">
          <h4>{t.caution}</h4>
          <p>{ap.caution}</p>
        </div>
      </div>
      <div>
        <div className="results-switch" role="group" aria-label={t.marker}>
          {(['teleo', 'elas'] as const).map((m) => (
            <button key={m} type="button" aria-pressed={marker === m} onClick={() => setMarker(m)}>
              {m === 'teleo' ? 'Teleo' : 'Elas02'}
            </button>
          ))}
        </div>
        <div className="results-swap" key={marker}>
          <Figure image={figure.image} alt={figure.caption} caption={figure.caption} />
        </div>
      </div>
    </div>
  );
}

function SitesView() {
  const { artoisPicardie: ap, ui } = useCatalog();
  const t = ui.results;
  const [chosen, setChosen] = useState(0);
  const site = ap.sites[chosen];
  const max = Math.max(...ap.sites.flatMap((s) => s.sectors.map((x) => x.richness)));
  return (
    <div className="results-sites">
      <div className="results-site-picker" role="group" aria-label={t.sitePicker}>
        {ap.sites.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={chosen === i}
            data-setting={s.setting}
            onClick={() => setChosen(i)}
          >
            <span>{s.name}</span>
            <span className="results-site-area">{s.area}</span>
          </button>
        ))}
      </div>
      <div className="results-site" key={site.id} aria-live="polite">
        <div className="results-site-text">
          <h3>{site.name}</h3>
          <p>{site.synthesis}</p>
          <div className="results-sectors">
            {site.sectors.map((sector, i) => (
              <article
                key={sector.name}
                className="results-sector"
                style={{ '--i': i, '--w': sector.richness / max } as CSSProperties}
              >
                <h4>
                  {t.sector} · {sector.name}
                </h4>
                <div className="results-richness">
                  <span className="results-richness-bar" aria-hidden="true" />
                  <p>
                    <strong>{t.species(sector.richness)}</strong>
                    {sector.richnessNote && <span>, {sector.richnessNote}</span>}
                  </p>
                </div>
                <dl>
                  <div>
                    <dt>{t.date}</dt>
                    <dd>{sector.date}</dd>
                  </div>
                  <div>
                    <dt>{t.mode}</dt>
                    <dd>{sector.mode}</dd>
                  </div>
                  <div>
                    <dt>{t.salinity}</dt>
                    <dd>{sector.salinity}</dd>
                  </div>
                  <div>
                    <dt>{t.turbidity}</dt>
                    <dd>{sector.turbidity}</dd>
                  </div>
                  <div>
                    <dt>{t.volume}</dt>
                    <dd>{sector.volume}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <p className="results-small">{ap.richnessNote}</p>
        </div>
        <Figure
          image={site.figure}
          alt={`${t.siteFigure} ${site.name}`}
          caption={`${t.siteFigure} ${site.name}.`}
        />
      </div>
      <Figure
        className="results-wide-figure"
        image={ap.figures.richness.image}
        alt={ap.figures.richness.caption}
        caption={ap.figures.richness.caption}
      />
    </div>
  );
}

function AnalysesView() {
  const { artoisPicardie: ap, ui } = useCatalog();
  const t = ui.results;
  return (
    <div className="results-analyses">
      <div className="results-block">
        <h3>{t.protocol}</h3>
        <StepRows items={ap.protocol} as="h3" />
      </div>
      <div className="results-block results-pair">
        <div>
          <h3>{t.guilds}</h3>
          <dl className="results-guilds">
            {ap.guilds.map((g, i) => (
              <div key={g.code} style={{ '--i': i } as CSSProperties}>
                <dt>
                  <abbr>{g.code}</abbr> {g.name}
                </dt>
                <dd>{g.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Figure
          image={ap.figures.guilds.image}
          alt={ap.figures.guilds.caption}
          caption={ap.figures.guilds.caption}
        />
      </div>
      <div className="results-block results-pair">
        <div>
          <h3>{t.comparison}</h3>
          <LiveList items={ap.comparison} />
        </div>
        <div className="results-figure-stack">
          <Figure
            image={ap.figures.venn.image}
            alt={ap.figures.venn.caption}
            caption={ap.figures.venn.caption}
          />
          <Figure
            image={ap.figures.guildsTrawl.image}
            alt={ap.figures.guildsTrawl.caption}
            caption={ap.figures.guildsTrawl.caption}
          />
        </div>
      </div>
      <div className="results-block results-pair">
        <div>
          <h3>{t.turbidityTitle}</h3>
          <p>{ap.turbidity}</p>
          <h3>{t.perspectives}</h3>
          <LiveList items={ap.perspectives} />
        </div>
        <Figure
          image={ap.figures.turbidity.image}
          alt={ap.figures.turbidity.caption}
          caption={ap.figures.turbidity.caption}
        />
      </div>
      <Figure
        className="results-wide-figure"
        image={ap.figures.localDiversity.image}
        alt={ap.figures.localDiversity.caption}
        caption={ap.figures.localDiversity.caption}
      />
    </div>
  );
}
