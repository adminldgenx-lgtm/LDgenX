import { ChevronDown } from 'lucide-react';
import { copy, faq, projectPractice } from '../content/fr';
import { AnimatedHeading } from '../components/motion';
import { Eyebrow, ProjectActions, Reveal } from '../components/ui';

export function ProjectPractice({ intro }: { intro: string }) {
  return (
    <section className="section-space practice-section">
      <div className="container practice-layout">
        <div className="practice-heading">
          <Eyebrow>{projectPractice.eyebrow}</Eyebrow>
          <AnimatedHeading className="display-small" text={projectPractice.title} />
          <Reveal delay={0.1}>
            <p className="practice-intro">{intro}</p>
            <ProjectActions />
          </Reveal>
        </div>
        <div className="practice-lists">
          <Reveal className="practice-list">
            <h3>{projectPractice.prepareTitle}</h3>
            <ul>
              {projectPractice.prepare.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="practice-list" delay={0.08}>
            <h3>{projectPractice.defineTitle}</h3>
            <ul>
              {projectPractice.define.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Faq({ title = 'Les réponses\navant le premier échange.' }: { title?: string }) {
  return (
    <section className="section-space faq-section">
      <div className="container faq-layout">
        <div>
          <Eyebrow>{copy.labels.faq}</Eyebrow>
          <AnimatedHeading className="display-small" text={title} />
        </div>
        <div className="faq-list">
          {faq.map((item, i) => (
            <details key={item.question} name="faq" open={i === 0}>
              <summary>
                <h3>{item.question}</h3>
                <ChevronDown className="faq-toggle" size={18} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
