import { pageCopy } from '../content/pages.fr';
import { type PageMeta } from '../lib/pages';
import { company, copy } from '../content/fr';
import { directContact } from '../lib/contact';
import {
  PageHero,
  Eyebrow,
  Reveal,
  Photo,
  FinalCTA,
  SectionHeading,
  TextLink,
} from '../components/ui';
import { TeamList, PartnerList } from '../sections/Collections';

export function AboutPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.about} />
      <section className="detail-section">
        <div className="container">
          <div className="detail-intro">
            <Reveal>
              <Eyebrow>Une chaîne scientifique complète</Eyebrow>
              <h2>
                Du terrain à l’analyse.
                <br />
                De l’analyse au sens.
              </h2>
            </Reveal>
            <Reveal>
              <p>{copy.home.introductionBody}</p>
              <p className="detail-note">
                Conception scientifique, échantillonnage, analyses moléculaires, séquençage,
                bioinformatique et interprétation : nous relions les étapes au contexte de votre
                projet.
              </p>
            </Reveal>
          </div>
          <Reveal className="about-image">
            <Photo
              name="laboratoire"
              alt="Travail de laboratoire associant analyses moléculaires et données génomiques"
            />
          </Reveal>
          <SectionHeading
            eyebrow="Les scientifiques derrière LDgenX"
            title={copy.home.teamTitle}
            body={copy.home.teamIntro}
            link={{ to: '/a-propos/equipe', label: copy.labels.team }}
          />
          <TeamList />
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <SectionHeading
            eyebrow="Un écosystème qui nous entoure"
            title="Des liens pour\nfaire avancer la science."
            link={{ to: '/a-propos/partenaires', label: 'Découvrir notre écosystème' }}
          />
          <PartnerList />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function TeamPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.team} />
      <section className="section-space delivery-section" aria-labelledby="team-title">
        <div className="container">
          <h2 id="team-title" className="sr-only">
            Les membres de l’équipe
          </h2>
          <TeamList detailed />
          <a
            className="source-link"
            href="https://www.ldgenx.fr/a-propos/equipe"
            target="_blank"
            rel="noreferrer"
          >
            Parcours scientifiques de l’équipe
          </a>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function PartnersPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.partners} />
      <section className="section-space delivery-section">
        <div className="container">
          <PartnerList />
          <a
            className="source-link"
            href="https://www.ldgenx.fr/a-propos/partenaires"
            target="_blank"
            rel="noreferrer"
          >
            Les relations présentées par LDgenX
          </a>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}

export function LegalPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.legal} />
      <section className="detail-section">
        <div className="container legal-content">
          <h2>Éditeur</h2>
          <p>
            LDgenX SAS · SIREN 952 193 837
            <br />
            RCS Montpellier · Code NAF 7112B
            <br />
            Capital social : 50 000 €
          </p>
          <p>
            {company.address}
            <br />
            {company.city}
            <br />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
          <h2>Contenus scientifiques et illustrations</h2>
          <p>
            Les présentations scientifiques s’appuient sur les informations publiques de LDgenX. Les
            études et ressources renvoient aux sources utilisées. Les illustrations fournies pour ce
            site ne constituent pas un reportage photographique des projets présentés.
          </p>
          <h2>Informations de publication</h2>
          <p>
            Cette version de travail doit être complétée, avant sa publication, par l’identité du
            responsable de publication et les coordonnées de l’hébergeur effectivement retenu. Ces
            informations ne sont pas présumées à partir d’un environnement de développement.
          </p>
          <TextLink to="/contact">Contacter LDgenX</TextLink>
        </div>
      </section>
    </>
  );
}

export function PrivacyPage({ meta }: { meta: PageMeta }) {
  return (
    <>
      <PageHero meta={meta} {...pageCopy.privacy} />
      <section className="detail-section">
        <div className="container legal-content">
          <h2>Navigation</h2>
          <p>
            Cette version ne comporte ni outil d’analyse d’audience, ni publicité, ni cookie de
            suivi. Les polices et les illustrations sont servies depuis le site. Aucun compte
            utilisateur n’est nécessaire.
          </p>
          {directContact ? (
            <>
              <h2>Formulaire de contact</h2>
              <p>
                Les informations saisies dans le formulaire sont transmises à l’équipe LDgenX par
                l’intermédiaire du service d’envoi de formulaires retenu par l’entreprise, dans le
                seul but de répondre à votre demande. Elles ne sont pas enregistrées dans un
                stockage du navigateur.
              </p>
            </>
          ) : (
            <>
              <h2>Préparation d’un e-mail</h2>
              <p>
                Le formulaire prépare un message dans votre application de messagerie. Les données
                saisies ne sont pas enregistrées dans un stockage du navigateur et ne sont pas
                transmises à un serveur de formulaire par ce site. L’envoi reste à votre initiative
                dans votre messagerie.
              </p>
            </>
          )}
          <p>
            Le message contient les informations que vous avez renseignées pour permettre à l’équipe
            LDgenX de comprendre votre demande. Une copie dans le presse-papiers n’est créée que si
            vous utilisez l’action « Copier mon message ».
          </p>
          <h2>Liens externes</h2>
          <p>
            Le lien de rendez-vous et le site anglais ouvrent des services distincts. Leur
            fonctionnement et leur traitement des données sont régis par leurs propres politiques.
          </p>
          <h2>Contact et demandes relatives aux données</h2>
          <p>
            Pour toute question sur vos échanges avec LDgenX, contactez{' '}
            <a href={`mailto:${company.email}`}>{company.email}</a>. Les modalités de conservation
            et de traitement des messages reçus par l’entreprise doivent être confirmées par LDgenX
            avant la publication de la politique définitive.
          </p>
        </div>
      </section>
    </>
  );
}
