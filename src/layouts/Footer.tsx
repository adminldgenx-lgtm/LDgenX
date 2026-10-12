import { Link } from 'react-router-dom';
import { company, services, applications } from '../content/fr';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-lockup" aria-label="LDgenX — Accueil">
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
            La génomique appliquée.
            <br />
            La connaissance du vivant.
          </p>
        </div>
        <div>
          <p className="footer-label">Expertises</p>
          {services.slice(0, 6).map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`}>
              {s.title}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-label">Explorer</p>
          <Link to="/applications">Nos applications</Link>
          <Link to="/etudes-de-cas">Études de cas</Link>
          <Link to="/innovation">Innovation</Link>
          <Link to="/a-propos/equipe">Notre équipe</Link>
          <Link to="/a-propos/partenaires">Partenaires</Link>
          <Link to="/ressources">Ressources & Expertise</Link>
        </div>
        <div className="footer-contact">
          <p className="footer-label">Parlons science</p>
          <a className="footer-email" href={`mailto:${company.email}`}>
            {company.email}
          </a>
          <p>
            {company.address}
            <br />
            {company.city}
          </p>
          <Link to="/contact">Demander un devis</Link>
          <a href={company.appointment} target="_blank" rel="noreferrer">
            Prendre rendez-vous
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} LDgenX · Tous droits réservés</span>
        <div>
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/politique-confidentialite">Confidentialité</Link>
          <a href={company.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <a href={company.english}>English</a>
        </div>
      </div>
      <nav className="sr-only" aria-label="Secteurs d’application">
        {applications.map((a) => (
          <Link key={a.slug} to={`/applications/${a.slug}`}>
            {a.title}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
