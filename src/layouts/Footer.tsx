import { Link, useLocation } from 'react-router-dom';
import { useCatalog, useRoutes, type Locale } from '../i18n';
import { bases } from '../lib/routes';
import { getPage } from '../lib/pages';

export function Footer() {
  const { company, copy, services, applications, ui } = useCatalog();
  const r = useRoutes();
  const t = ui.footer;
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
          {services.slice(0, 6).map((s) => (
            <Link key={s.id} to={r.service(s.id)}>
              {s.title}
            </Link>
          ))}
          <Link to={r.service('tests-adn-cibles')}>{t.links.tests}</Link>
          <Link to={r.service('materiel')}>{t.links.equipment}</Link>
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
          <Link to={r.contact}>{copy.labels.quote}</Link>
          <a href={company.appointment} target="_blank" rel="noreferrer">
            {copy.labels.appointment}
            <span className="sr-only">{ui.common.newTab}</span>
          </a>
        </div>
      </div>
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
          <Link to={meta.alternates[other] ?? bases[other].home} hrefLang={other} lang={other}>
            {t.otherLanguage}
          </Link>
        </div>
      </div>
      <nav className="sr-only" aria-label={t.sectors}>
        {applications.map((a) => (
          <Link key={a.id} to={r.application(a.id)}>
            {a.title}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
