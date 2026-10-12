import { pageCopy, formCopy, contactPaths } from '../content/pages.fr';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { company, applications, projectPractice } from '../content/fr';
import { type PageMeta } from '../lib/pages';
import { directContact, sendContact } from '../lib/contact';
import { PageHero, Eyebrow, Reveal } from '../components/ui';
import { Faq } from '../sections/Practice';

type Status = { tone: 'info' | 'success' | 'error'; text: string } | null;

export function ContactPage({ meta }: { meta: PageMeta }) {
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const statusMessage = useRef<HTMLParagraphElement>(null);
  // A confirmation or an error below the fold is brought into view.
  useEffect(() => {
    if (!status || status.tone === 'info') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    statusMessage.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [status]);
  const mode = directContact ? formCopy.direct : formCopy.mailto;
  function buildMessage(form: HTMLFormElement) {
    const values = new FormData(form);
    const value = (key: string, fallback: string) => String(values.get(key) || fallback);
    const subject = `Projet ${value('sector', 'scientifique')} — ${value('organization', value('name', ''))}`;
    const body = `Bonjour à l’équipe LDgenX,\n\n${value('message', '')}\n\nSecteur : ${value('sector', 'À préciser')}\nÉchantillons ou données : ${value('material', 'À préciser')}\nCalendrier : ${value('timeline', 'À préciser')}\nNom : ${value('name', '')}\nOrganisation : ${value('organization', 'Non renseignée')}\nE-mail : ${value('email', '')}`;
    return { subject, body };
  }
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!directContact) {
      const { subject, body } = buildMessage(form);
      window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus({ tone: 'info', text: formCopy.prepared });
      return;
    }
    setSending(true);
    setStatus({ tone: 'info', text: formCopy.sending });
    try {
      await sendContact(form);
      form.reset();
      setStatus({ tone: 'success', text: formCopy.sent });
    } catch {
      setStatus({ tone: 'error', text: formCopy.failed });
    } finally {
      setSending(false);
    }
  }
  async function copyMessage(form: HTMLFormElement | null) {
    if (!form || !form.reportValidity()) return;
    const { body } = buildMessage(form);
    try {
      await navigator.clipboard.writeText(body);
      setStatus({ tone: 'info', text: formCopy.copied });
    } catch {
      setStatus({ tone: 'error', text: formCopy.unavailable });
    }
  }
  return (
    <>
      <PageHero meta={meta} {...pageCopy.contact} />
      <section className="contact-paths-section">
        <div className="container contact-paths">
          <Reveal className="contact-path contact-path-primary">
            <h2>{contactPaths.appointment.title}</h2>
            <p>{contactPaths.appointment.text}</p>
            <a
              className="button button-light"
              href={company.appointment}
              target="_blank"
              rel="noreferrer"
            >
              {contactPaths.appointment.action}
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Reveal>
          <Reveal className="contact-path" delay={0.06}>
            <h2>{contactPaths.form.title}</h2>
            <p>{contactPaths.form.text}</p>
            <a className="text-link" href="#project-form">
              {contactPaths.form.action}
            </a>
          </Reveal>
          <Reveal className="contact-path" delay={0.12}>
            <h2>{contactPaths.email.title}</h2>
            <p>{contactPaths.email.text}</p>
            <a className="contact-email" href={`mailto:${company.email}`}>
              {company.email}
            </a>
          </Reveal>
        </div>
      </section>
      <section className="detail-section">
        <div className="container contact-layout">
          <Reveal className="contact-information">
            <Eyebrow>{formCopy.eyebrow}</Eyebrow>
            <h2 className="pre-line">{formCopy.title}</h2>
            <p>{formCopy.intro}</p>
            <div className="contact-checklist">
              <h3>{formCopy.checklistTitle}</h3>
              <ul>
                {projectPractice.prepare.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="contact-address">
              <p>
                {company.address}
                <br />
                {company.city}
              </p>
            </div>
          </Reveal>
          <Reveal>
            <form id="project-form" className="contact-form" onSubmit={onSubmit}>
              <div className="form-row">
                <label className="form-field">
                  {formCopy.name}
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={150}
                    placeholder={formCopy.namePlaceholder}
                  />
                </label>
                <label className="form-field">
                  {formCopy.email}
                  <input
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                    maxLength={200}
                    placeholder={formCopy.emailPlaceholder}
                  />
                </label>
              </div>
              <div className="form-row">
                <label className="form-field">
                  {formCopy.organization}
                  <input
                    name="organization"
                    autoComplete="organization"
                    maxLength={200}
                    placeholder={formCopy.organizationPlaceholder}
                  />
                </label>
                <label className="form-field">
                  {formCopy.sector}
                  <select name="sector" defaultValue="">
                    <option value="">{formCopy.sectorPlaceholder}</option>
                    {applications.map((s) => (
                      <option key={s.slug}>{s.title}</option>
                    ))}
                    <option>{formCopy.other}</option>
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label className="form-field">
                  {formCopy.material}
                  <select name="material" defaultValue="">
                    <option value="">{formCopy.materialPlaceholder}</option>
                    {formCopy.materials.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  {formCopy.timeline}
                  <input
                    name="timeline"
                    maxLength={200}
                    placeholder={formCopy.timelinePlaceholder}
                  />
                </label>
              </div>
              <label className="form-field">
                {formCopy.message}
                <textarea
                  name="message"
                  required
                  minLength={15}
                  maxLength={3500}
                  placeholder={formCopy.messagePlaceholder}
                />
              </label>
              <label className="form-consent">
                <input type="checkbox" name="privacy" required />
                <span>
                  {formCopy.privacyBefore}
                  <Link to="/politique-confidentialite">{formCopy.privacyLink}</Link>
                  {mode.privacyAfter}
                </span>
              </label>
              <p className="form-note">{mode.note}</p>
              <div className="form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={sending}
                  aria-busy={sending || undefined}
                >
                  {mode.submit}
                </button>
                <button
                  className="copy-button"
                  type="button"
                  onClick={(e) => copyMessage(e.currentTarget.form)}
                >
                  {formCopy.copy}
                </button>
              </div>
              {/* The live region stays in place so every new message is announced. */}
              <div role="status" aria-live="polite">
                {status && (
                  <p
                    key={status.text}
                    ref={statusMessage}
                    className={`form-status form-status-${status.tone}`}
                  >
                    {status.text}
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </section>
      <Faq title={'Avant de nous écrire.'} />
    </>
  );
}
