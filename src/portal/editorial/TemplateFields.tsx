import { useContext, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import type { Catalog } from "../../content/catalog";
import { imageUrl } from "../../lib/images";
import { MediaImage } from "../../editorial/media-view";
import {
  templateFields,
  type ContentKind,
  type EditorialMedia,
  type FieldSpec,
} from "../../../supabase/functions/_shared/editorial";
import { Button } from "../ui";
import { useWords } from "./labels";
import { FieldsDisabled } from "./fields-context";

type Words = [fr: string, en: string];
interface Label {
  label: Words;
  help?: Words;
  /** Headings of the two columns of a repeated row. */
  columns?: [Words, Words];
}
/** What each field is called on screen, in the order of the page it fills. */
export const fieldLabels: Record<ContentKind, Record<string, Label>> = {
  page: {},
  article: {
    service: {
      label: ["Expertise liée", "Related expertise"],
      help: [
        "Un lien vers cette expertise s’affiche à la fin de l’article.",
        "A link to this expertise appears at the end of the article.",
      ],
    },
  },
  study: {
    facts: {
      label: ["En bref", "In brief"],
      help: [
        "Le tableau de chiffres et de faits sous l’image.",
        "The table of figures and facts under the picture.",
      ],
      columns: [
        ["Intitulé", "Label"],
        ["Valeur", "Value"],
      ],
    },
    context: { label: ["Contexte", "Context"] },
    question: { label: ["Question", "Question"] },
    approach: { label: ["Approche", "Approach"] },
    result: {
      label: ["Enseignements", "Lessons"],
      help: [
        "Laissez vide tant que les résultats ne sont pas publiables.",
        "Leave empty while results cannot be published.",
      ],
    },
    service: {
      label: ["Expertise liée", "Related expertise"],
      help: [
        "Présentée en bas de page, avec un lien.",
        "Shown at the foot of the page, with a link.",
      ],
    },
    source: {
      label: ["Lien vers la source publiée", "Link to the published source"],
    },
    ongoing: { label: ["Étude en cours", "Study in progress"] },
  },
  publication: {
    authors: {
      label: ["Auteurs", "Authors"],
      help: [
        "Un auteur par ligne, tel que publié.",
        "One author per line, as published.",
      ],
    },
    members: { label: ["Auteurs de l’équipe", "Team authors"] },
    authorNote: {
      label: ["Note sur les auteurs", "Author note"],
      help: ["Par exemple, contribution égale.", "For example, equal contribution."],
    },
    issue: {
      label: ["Volume, numéro, pages", "Volume, issue, pages"],
      help: ["Tels que publiés.", "As published."],
    },
    online: { label: ["Première publication en ligne", "First published online"] },
    type: { label: ["Type d’article", "Paper type"] },
    text: { label: ["Version consultée", "Version consulted"] },
    licence: { label: ["Licence de l’article", "Paper licence"] },
    question: { label: ["La question", "The question"] },
    approach: { label: ["L’approche", "The approach"] },
    finding: { label: ["Ce que l’article apporte", "What the paper adds"] },
    limit: { label: ["Les limites", "Limitations"] },
    themes: { label: ["Thèmes", "Themes"] },
    services: { label: ["Expertises liées", "Related expertise"] },
    applications: { label: ["Applications liées", "Related applications"] },
    preprint: { label: ["Lien de la prépublication", "Preprint link"] },
    links: {
      label: ["Autres liens", "Other links"],
      columns: [
        ["Intitulé", "Label"],
        ["Lien", "Link"],
      ],
    },
    figures: { label: ["Figures", "Figures"] },
  },
  service: {
    headline: {
      label: ["Grand titre de la page", "Page headline"],
      help: [
        "La phrase en grand en haut de la page. Le titre court sert aux menus.",
        "The large sentence at the top of the page. The short title is used in menus.",
      ],
    },
    short: {
      label: ["Description courte", "Short description"],
      help: ["Pour les cartes et les menus.", "For cards and menus."],
    },
    scope: {
      label: ["Ce que couvre l’expertise", "What the expertise covers"],
      help: ["Une ligne.", "One line."],
    },
    need: { label: ["Votre besoin", "Your need"] },
    approaches: {
      label: ["Méthodes", "Methods"],
      columns: [
        ["Titre", "Title"],
        ["Texte", "Text"],
      ],
    },
    prestations: {
      label: ["Prestations", "Services"],
      help: ["Une prestation par ligne.", "One service per line."],
    },
    uses: {
      label: ["Champs d’usage", "Uses"],
      help: ["Un usage par ligne.", "One use per line."],
    },
    sectors: { label: ["Applications liées", "Related applications"] },
    cases: { label: ["Cas présentés", "Cases shown"] },
  },
  application: {
    headline: {
      label: ["Grand titre de la page", "Page headline"],
      help: [
        "La phrase en grand en haut de la page. Le titre court sert aux menus.",
        "The large sentence at the top of the page. The short title is used in menus.",
      ],
    },
    scope: {
      label: ["Ce que couvre l’application", "What the application covers"],
      help: ["Une ligne, reprise sur les cartes.", "One line, shown on cards."],
    },
    needs: {
      label: ["Besoins du secteur", "Sector needs"],
      columns: [
        ["Titre", "Title"],
        ["Texte", "Text"],
      ],
    },
    uses: {
      label: ["Usages", "Uses"],
      help: ["Un usage par ligne.", "One use per line."],
    },
    examples: {
      label: ["Exemples de projets", "Project examples"],
      help: ["Un exemple par ligne.", "One example per line."],
    },
    approaches: {
      label: ["Approches proposées", "Approaches offered"],
      columns: [
        ["Titre", "Title"],
        ["Texte", "Text"],
      ],
    },
    deliverables: {
      label: ["Livrables", "Deliverables"],
      help: ["Un livrable par ligne.", "One deliverable per line."],
    },
    services: { label: ["Expertises liées", "Related expertise"] },
  },
};

export interface Option {
  id: string;
  label: string;
}
export type FieldOptions = Record<string, Option[]>;
/** The choices offered by the fields, in the language of the content. */
export function fieldOptions(catalog: Catalog): FieldOptions {
  const services = catalog.services.map((s) => ({ id: s.id, label: s.title }));
  const applications = catalog.applications.map((a) => ({
    id: a.id,
    label: a.title,
  }));
  return {
    service: services,
    services,
    sectors: applications,
    applications,
    members: catalog.people.map((p) => ({ id: p.id, label: p.name })),
    themes: Object.entries(catalog.ui.research.themes).map(([id, label]) => ({
      id,
      label: String(label),
    })),
  };
}
const choiceLabels: Record<string, Words> = {
  article: ["Article", "Article"],
  review: ["Synthèse (review)", "Review"],
  published: ["Article publié", "Published paper"],
  preprint: ["Prépublication", "Preprint"],
  abstract: ["Résumé publié", "Published abstract"],
};
/** Empty rows left in a form are not content. */
export function tidyFields(kind: ContentKind, values: Record<string, unknown>) {
  const tidy = { ...values };
  for (const spec of templateFields[kind])
    if (spec.type === "rows" && Array.isArray(tidy[spec.key]))
      tidy[spec.key] = (tidy[spec.key] as Record<string, string>[]).filter(
        (row) => Object.values(row).some((value) => value.trim()),
      );
    else if (spec.type === "cases" && Array.isArray(tidy[spec.key]))
      tidy[spec.key] = (tidy[spec.key] as { title: string }[]).filter((row) =>
        row.title.trim(),
      );
  return tidy;
}

/** A picture chosen in a form: an upload, or one of the site's own. */
function FieldPicture({
  name,
  media,
}: {
  name?: string;
  media: EditorialMedia[];
}) {
  if (!name) return <ImagePlus size={22} aria-hidden="true" />;
  if (name.startsWith("cms-media:"))
    return (
      <MediaImage
        image={{ alt: "", caption: "", credit: "", licenceUrl: "" }}
        media={media.find((m) => m.id === name.slice("cms-media:".length))}
        sizes="120px"
      />
    );
  return <img src={imageUrl(name)} alt="" loading="lazy" />;
}
type PickPicture = (use: (name: string, media: EditorialMedia) => void) => void;
function Rows<T>({
  rows,
  onChange,
  blank,
  render,
  addLabel,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  blank: () => T;
  render: (row: T, set: (row: T) => void, index: number) => ReactNode;
  addLabel: string;
}) {
  const l = useWords();
  const disabled = useContext(FieldsDisabled);
  const move = (from: number, to: number) => {
    const next = [...rows];
    next.splice(to, 0, ...next.splice(from, 1));
    onChange(next);
  };
  return (
    <div className="cms-rows">
      {rows.map((row, i) => (
        <div className="cms-row" key={i}>
          <div className="cms-row-fields">
            {render(
              row,
              (value) => onChange(rows.map((r, n) => (n === i ? value : r))),
              i,
            )}
          </div>
          <div className="cms-row-tools">
            <button
              type="button"
              disabled={disabled || i === 0}
              aria-label={l("Monter", "Move up")}
              onClick={() => move(i, i - 1)}
            >
              <ArrowUp size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={disabled || i === rows.length - 1}
              aria-label={l("Descendre", "Move down")}
              onClick={() => move(i, i + 1)}
            >
              <ArrowDown size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={disabled}
              aria-label={l("Retirer", "Remove")}
              onClick={() => onChange(rows.filter((_, n) => n !== i))}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
      <Button
        variant="secondary"
        size="small"
        disabled={disabled}
        onClick={() => onChange([...rows, blank()])}
      >
        <Plus size={15} aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  );
}
function Field({
  spec,
  label,
  value,
  onChange,
  options,
  media,
  pickPicture,
}: {
  spec: FieldSpec;
  label: Label;
  value: unknown;
  onChange: (value: unknown) => void;
  options: Option[];
  media: EditorialMedia[];
  pickPicture: PickPicture;
}) {
  const l = useWords();
  const disabled = useContext(FieldsDisabled);
  const title = l(...label.label);
  const help = label.help && <small>{l(...label.help)}</small>;
  const add = l("Ajouter une ligne", "Add a row");
  if (spec.type === "flag")
    return (
      <label className="cms-review">
        <input
          type="checkbox"
          disabled={disabled}
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{title}</span>
      </label>
    );
  if (spec.type === "picks") {
    const chosen = (value as string[] | undefined) ?? [];
    return (
      <fieldset className="cms-picks">
        <legend>{title}</legend>
        {options.map((option) => (
          <label key={option.id}>
            <input
              type="checkbox"
              disabled={disabled}
              checked={chosen.includes(option.id)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...chosen, option.id]
                    : chosen.filter((id) => id !== option.id),
                )
              }
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  if (spec.type === "rows") {
    const [first, second] = spec.columns!;
    const rows = (value as Record<string, string>[] | undefined) ?? [];
    return (
      <div className="cms-field-group">
        <strong>{title}</strong>
        {help}
        <Rows
          rows={rows}
          onChange={onChange}
          addLabel={add}
          blank={() => ({ [first]: "", [second]: "" })}
          render={(row, set) => (
            <>
              <label>
                {l(...label.columns![0])}
                <input
                  className="p-input"
                  disabled={disabled}
                  value={row[first] ?? ""}
                  maxLength={3000}
                  onChange={(e) => set({ ...row, [first]: e.target.value })}
                />
              </label>
              <label>
                {l(...label.columns![1])}
                {second === "text" ? (
                  <textarea
                    className="p-input"
                    rows={3}
                    disabled={disabled}
                    value={row[second] ?? ""}
                    maxLength={3000}
                    onChange={(e) => set({ ...row, [second]: e.target.value })}
                  />
                ) : (
                  <input
                    className="p-input"
                    type={second === "url" ? "url" : "text"}
                    disabled={disabled}
                    value={row[second] ?? ""}
                    maxLength={3000}
                    onChange={(e) => set({ ...row, [second]: e.target.value })}
                  />
                )}
              </label>
            </>
          )}
        />
      </div>
    );
  }
  if (spec.type === "figures") {
    const rows = (value as Record<string, string>[] | undefined) ?? [];
    return (
      <div className="cms-field-group">
        <strong>{title}</strong>
        <Rows
          rows={rows}
          onChange={onChange}
          addLabel={l("Ajouter une figure", "Add a figure")}
          blank={() => ({ image: "", label: "", caption: "", credit: "", licence: "" })}
          render={(row, set) => (
            <div className="cms-picture-row">
              <button
                type="button"
                className="cms-picture-pick"
                disabled={disabled}
                aria-label={l("Choisir l’image", "Choose image")}
                onClick={() =>
                  pickPicture((name, item) => {
                    const size = item.variants.at(-1);
                    set({
                      ...row,
                      image: name,
                      width: String(size?.width ?? 0),
                      height: String(size?.height ?? 0),
                    });
                  })
                }
              >
                <FieldPicture name={row.image} media={media} />
              </button>
              <div>
                <label>
                  {l("Intitulé", "Label")}
                  <input
                    className="p-input"
                    disabled={disabled}
                    value={row.label ?? ""}
                    maxLength={120}
                    placeholder="Figure 1"
                    onChange={(e) => set({ ...row, label: e.target.value })}
                  />
                </label>
                <label>
                  {l("Légende", "Caption")}
                  <textarea
                    className="p-input"
                    rows={2}
                    disabled={disabled}
                    value={row.caption ?? ""}
                    maxLength={3000}
                    onChange={(e) => set({ ...row, caption: e.target.value })}
                  />
                </label>
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  if (spec.type === "cases") {
    const rows =
      (value as { title: string; image?: string; link?: unknown }[] | undefined) ?? [];
    return (
      <div className="cms-field-group">
        <strong>{title}</strong>
        <Rows<{ title: string; image?: string; link?: unknown }>
          rows={rows}
          onChange={onChange}
          addLabel={l("Ajouter un cas", "Add a case")}
          blank={() => ({ title: "" })}
          render={(row, set) => (
            <div className="cms-picture-row">
              <button
                type="button"
                className="cms-picture-pick"
                disabled={disabled}
                aria-label={l("Choisir l’image", "Choose image")}
                onClick={() => pickPicture((name) => set({ ...row, image: name }))}
              >
                <FieldPicture name={row.image} media={media} />
              </button>
              <label>
                {l("Titre", "Title")}
                <input
                  className="p-input"
                  disabled={disabled}
                  value={row.title}
                  maxLength={400}
                  onChange={(e) => set({ ...row, title: e.target.value })}
                />
              </label>
            </div>
          )}
        />
      </div>
    );
  }
  const text = typeof value === "string" ? value : "";
  return (
    <label>
      {title}
      {spec.type === "long" ? (
        <textarea
          className="p-input"
          rows={5}
          disabled={disabled}
          value={text}
          maxLength={8000}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : spec.type === "list" ? (
        <textarea
          className="p-input"
          rows={5}
          disabled={disabled}
          value={((value as string[] | undefined) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
        />
      ) : spec.type === "pick" || spec.type === "choice" ? (
        <select
          disabled={disabled}
          value={text}
          aria-label={title}
          onChange={(e) => onChange(e.target.value)}
        >
          {spec.type === "pick" && (
            <option value="">{l("Aucune", "None")}</option>
          )}
          {spec.type === "pick"
            ? options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))
            : spec.options!.map((option) => (
                <option key={option} value={option}>
                  {l(...(choiceLabels[option] ?? [option, option]))}
                </option>
              ))}
        </select>
      ) : (
        <input
          className="p-input"
          type={spec.type === "url" ? "url" : spec.type === "date" ? "date" : "text"}
          disabled={disabled}
          value={text}
          maxLength={spec.type === "text" ? 600 : 2000}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {help}
    </label>
  );
}
/** The form of a section: one field for each part of its page template. */
export function TemplateFields({
  kind,
  values,
  onChange,
  options,
  media,
  pickPicture,
}: {
  kind: ContentKind;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  options: FieldOptions;
  media: EditorialMedia[];
  pickPicture: PickPicture;
}) {
  return (
    <>
      {templateFields[kind].map((spec) => (
        <Field
          key={spec.key}
          spec={spec}
          label={fieldLabels[kind][spec.key]}
          value={values[spec.key]}
          options={options[spec.key] ?? []}
          media={media}
          pickPicture={pickPicture}
          onChange={(value) => onChange({ ...values, [spec.key]: value })}
        />
      ))}
    </>
  );
}
