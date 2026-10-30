import { useState } from "react";
import { type CalendarPreferences } from "../../supabase/functions/_shared/calendar";
import { useI18n } from "./i18n";
import { Button, Card, Field } from "./ui";
export function CalendarPreferencesForm({
  settings,
  teamId,
  attention,
  disabled,
  save,
}: {
  settings: CalendarPreferences;
  teamId: string | null;
  attention: boolean;
  disabled: boolean;
  save: (p: CalendarPreferences, id?: string) => void;
}) {
  const { locale } = useI18n(),
    fr = locale === "fr";
  const [form, setForm] = useState(settings),
    [id, setId] = useState(teamId ?? "");
  const checks: [
    keyof Pick<
      CalendarPreferences,
      | "shareBlockTitles"
      | "shareClientDetails"
      | "shareAppointmentNotes"
      | "shareMeetingLink"
    >,
    string,
    string,
  ][] = [
    [
      "shareBlockTitles",
      fr
        ? "Afficher l’intitulé des créneaux bloqués"
        : "Show blocked-time titles",
      fr
        ? "Exemple : « Réunion laboratoire · Toute l’équipe »."
        : "Example: “Lab meeting · Whole team”.",
    ],
    [
      "shareClientDetails",
      fr
        ? "Partager le nom et l’organisation du client"
        : "Share client name and organisation",
      fr
        ? "Désactivé par défaut. À activer uniquement pour les agendas de travail autorisés à recevoir ces données."
        : "Off by default. Enable only for work calendars authorized to receive these details.",
    ],
    [
      "shareAppointmentNotes",
      fr ? "Partager le sujet du rendez-vous" : "Share appointment subject",
      fr
        ? "Le sujet peut contenir des informations confidentielles. Il reste dans LDgenX tant que cette option est désactivée."
        : "The subject may contain confidential information. It stays in LDgenX while this is off.",
    ],
    [
      "shareMeetingLink",
      fr
        ? "Inclure le lien de visioconférence"
        : "Include the video meeting link",
      fr
        ? "Le lien saisi dans la fiche du rendez-vous permet de rejoindre l’échange depuis Google."
        : "The link entered in the appointment record lets you join from Google.",
    ],
  ];
  return (
    <Card
      title={
        fr
          ? "Contenu et organisation dans Google"
          : "Google event content and organisation"
      }
    >
      <form
        className="p-stack"
        onSubmit={(e) => {
          e.preventDefault();
          save(form, id.trim() && id.trim() !== teamId ? id.trim() : undefined);
        }}
      >
        <Field
          label={
            fr
              ? "Créneaux concernant toute l’équipe"
              : "Whole-team blocked times"
          }
        >
          {(field) => (
            <select
              id={field}
              value={form.teamBlocks}
              disabled={disabled}
              onChange={(e) =>
                setForm({
                  ...form,
                  teamBlocks: e.target
                    .value as CalendarPreferences["teamBlocks"],
                })
              }
            >
              <option value="shared">
                {fr
                  ? "Un seul événement dans « LDgenX · Équipe »"
                  : "One event in “LDgenX · Équipe”"}
              </option>
              <option value="per_host">
                {fr
                  ? "Une copie dans chaque agenda individuel"
                  : "One copy in every individual calendar"}
              </option>
            </select>
          )}
        </Field>
        <p className="p-help">
          {fr
            ? "L’agenda équipe bloque les disponibilités de toutes les personnes réservables. Les rendez-vous individuels restent dans leur agenda dédié. Dans Google, cochez « LDgenX · Équipe » pour afficher les créneaux communs."
            : "The team calendar blocks availability for every bookable staff member. Individual appointments keep their dedicated calendars. In Google, select “LDgenX · Équipe” to display shared blocked times."}
        </p>
        {checks.map(([key, label, help]) => (
          <div key={key}>
            <label className="p-check">
              <input
                type="checkbox"
                checked={form[key]}
                disabled={disabled}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              <strong>{label}</strong>
            </label>
            <p className="p-help">{help}</p>
          </div>
        ))}
        <div className="p-calendar-fields">
          <Field
            label={fr ? "Rappel avant les rendez-vous" : "Appointment reminder"}
          >
            {(field) => (
              <select
                id={field}
                value={form.reminderMinutes ?? "none"}
                disabled={disabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reminderMinutes:
                      e.target.value === "none" ? null : Number(e.target.value),
                  })
                }
              >
                <option value="none">
                  {fr ? "Aucun rappel" : "No reminder"}
                </option>
                {[5, 10, 15, 30, 60].map((n) => (
                  <option key={n} value={n}>
                    {n} min
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={fr ? "Langue des événements" : "Event language"}>
            {(field) => (
              <select
                id={field}
                value={form.language}
                disabled={disabled}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value as "fr" | "en" })
                }
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            )}
          </Field>
        </div>
        <p className="p-help">
          {fr
            ? "Les rappels sont des notifications Google, sans envoi d’e-mail. Chaque événement contient un lien direct vers sa fiche LDgenX pour le modifier en vérifiant les disponibilités."
            : "Reminders use Google notifications, without email. Each event links directly to its LDgenX record for editing with availability checks."}
        </p>
        <details open={attention || undefined}>
          <summary>
            {fr
              ? "Options avancées de l’agenda équipe"
              : "Advanced team-calendar options"}
          </summary>
          <Field
            label={fr ? "Identifiant de l’agenda équipe" : "Team calendar ID"}
            help={
              fr
                ? "À utiliser uniquement pour reprendre un agenda créé par cette application, après vérification dans Google. Les agendas individuels et l’agenda principal ne peuvent pas être utilisés ici."
                : "Use only to recover a calendar created by this application after checking Google. Individual and primary calendars cannot be used here."
            }
          >
            {(field) => (
              <input
                id={field}
                value={id}
                maxLength={254}
                onChange={(e) => setId(e.target.value)}
                disabled={disabled}
              />
            )}
          </Field>
        </details>
        <Button type="submit" busy={disabled}>
          {fr
            ? "Enregistrer et mettre à jour Google"
            : "Save and update Google"}
        </Button>
      </form>
    </Card>
  );
}
