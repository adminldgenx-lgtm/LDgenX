import { Link, useLocation } from 'react-router-dom';
import { useMotionLevel } from '../components/motion';
import { setMotionLevel } from '../lib/motion-preference';
import { useCatalog, useRoutes, type Locale } from '../i18n';
import { bases } from '../lib/routes';
import { getPage } from '../lib/pages';
import { listedExpertises } from '../lib/expertises';
import { footerDirectory } from '../lib/footer';
import { appointmentLink } from '../lib/appointment-link';
import { ChevronDown } from 'lucide-react';

export function Footer() {
  const { company, copy, services, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.footer;
  const reduced = useMotionLevel() === 'reduced';
  const meta = getPage(useLocation().pathname);
  const other: Locale = meta.locale === 'fr' ? 'en' : 'fr';
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to={r.home} className="footer-lockup" aria-label={ui.common.homeLink}>
            <img
              src="/brand/lockup-navy-160.webp"
              srcSet="/brand/lockup-navy-96.webp 343w, /brand/lockup-navy-160.webp 570w"
              sizes="186px"
              alt="LDgenX"
              width="570"
              height="160"
              loading="lazy"
            />
          </Link>
          <p>
            {t.tagline[0]}
            <br />
            {t.tagline[1]}
          </p>
        </div>
        <div>
          <p className="footer-label">{t.expertises}</p>
          {listedExpertises(services).map((s) => (
            <Link key={s.id} to={r.service(s.id)}>
              {s.title}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-label">{t.explore}</p>
          <Link to={r.applications}>{t.links.applications}</Link>
          <Link to={r.studies}>{t.links.studies}</Link>
          <Link to={r.innovations}>{t.links.innovation}</Link>
          <Link to={r.team}>{t.links.team}</Link>
          <Link to={r.publications}>{t.links.publications}</Link>
          <Link to={r.partners}>{t.links.partners}</Link>
          <Link to={r.resources}>{t.links.resources}</Link>
          <Link to={r.service('materiel')}>{t.links.equipment}</Link>
          <Link to={r.faq}>{t.links.faq}</Link>
          <Link to={r.glossary}>{t.links.glossary}</Link>
        </div>
        <div className="footer-contact">
          <p className="footer-label">{t.talk}</p>
          <a className="footer-email" href={`mailto:${company.email}`}>
            {company.email}
          </a>
          <p>
            {company.address}
            <br />
            {company.city}
          </p>
          {import.meta.env.VITE_PORTAL_ENABLED !== '0' && (
            <a href={`/espace/connexion?lang=${meta.locale}`}>{ui.common.clientArea}</a>
          )}
          <Link to={r.contact}>{copy.labels.quote}</Link>
          <a href={appointmentLink(meta.locale)} target="_blank" rel="noreferrer">
            {copy.labels.appointment}
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
        </div>
      </div>
      <nav className="container footer-directory" aria-label={t.directoryTitle}>
        <h2>{t.directoryTitle}</h2>
        <div className="footer-directory-grid">
          {footerDirectory(meta.locale).map((group) => (
            <details key={group.key} data-footer-group={group.key}>
              <summary>
                <span>{t.directoryGroups[group.key]}</span>
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <ul>
                {group.pages.map((page) => (
                  <li key={page.path}>
                    <Link to={page.path}>{page.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </nav>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {t.rights}
        </span>
        <div>
          <Link to={r.legal}>{t.legal}</Link>
          <Link to={r.privacy}>{t.privacy}</Link>
          <Link to={r.siteMap}>{t.links.siteMap}</Link>
          <Link to={r.terms} hrefLang="fr">
            {t.terms}
          </Link>
          <a href={company.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
          <Link
            to={meta.alternates[other] ?? bases[other].home}
            hrefLang={other}
            lang={other}
          >
            {t.otherLanguage}
          </Link>
          {/* Full or reduced animations, whatever the system asks; remembered on this browser. */}
          <button
            type="button"
            className="footer-motion"
            onClick={() => setMotionLevel(reduced ? 'full' : 'reduced')}
          >
            {reduced ? t.motionReduced : t.motionFull}
          </button>
        </div>
      </div>
    </footer>
  );
}
