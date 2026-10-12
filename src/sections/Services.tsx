import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { services, copy } from '../content/fr';
import { Photo, PhotoStack, Reveal, TextLink } from '../components/ui';

export function ServicesExplorer() {
  const [active, setActive] = useState(0);
  return (
    <div className="services-explorer">
      <Reveal className="services-visual">
        <PhotoStack
          className="services-image"
          items={services.map((s) => ({ image: s.image, alt: '' }))}
          active={active}
          sizes="(max-width: 850px) 1px, 45vw"
        />
        <p className="services-caption" key={services[active].slug}>
          {services[active].scope}
        </p>
        <TextLink to={`/services/${services[active].slug}`}>{copy.labels.learn}</TextLink>
      </Reveal>
      <div className="service-rows services-desktop-list">
        {services.map((s, i) => (
          <Reveal key={s.slug}>
            <Link
              to={`/services/${s.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`service-row ${active === i ? 'is-active' : ''}`}
            >
              <h3>{s.title}</h3>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="services-mobile-list">
        {services.map((service, i) => (
          <details key={service.slug} name="expertises" open={i === 0}>
            <summary>
              <h3>{service.title}</h3>
              <ChevronDown className="service-toggle" size={18} aria-hidden="true" />
            </summary>
            <div className="service-mobile-preview">
              <div className="service-mobile-image">
                <Photo name={service.image} alt="" sizes="(max-width: 800px) 90vw, 1px" />
              </div>
              <p>{service.scope}</p>
              <TextLink to={`/services/${service.slug}`}>{copy.labels.learn}</TextLink>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
