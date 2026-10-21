// Watches for new articles by the team: asks OpenAlex for the works of each member (by ORCID)
// and lists those whose DOI is not yet on the research page, with what is needed to add them
// (title, journal, year, authors, abstract when available). It changes nothing: each new
// article still needs a faithful French title, a summary and its points, checked by the team.
// The future admin panel can run the same query and draft these texts for review.
//
// Usage: node scripts/check-publications.mjs [--since=2024]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const since = Number(process.argv.find((a) => a.startsWith('--since='))?.split('=')[1] ?? 2016);
const research = readFileSync(path.join(root, 'src/content/research.fr.ts'), 'utf8');
const known = new Set([...research.matchAll(/doi: '([^']+)'/g)].map((m) => m[1].toLowerCase()));
const people = readFileSync(path.join(root, 'src/content/extra.fr.ts'), 'utf8');
// Each person's entry, from one `id:` to the next, with the ORCID it holds (if any).
const members = people
  .split(/\n {2}\{\n {4}id: /)
  .slice(1)
  .map((entry) => ({
    name: entry.match(/name: '([^']+)'/)?.[1],
    orcid: entry.match(/orcid: '([0-9X-]+)'/)?.[1],
  }))
  .filter((m) => m.name && m.orcid);

const abstract = (index) => {
  if (!index) return '';
  const words = [];
  for (const [word, positions] of Object.entries(index)) for (const p of positions) words[p] = word;
  return words.join(' ');
};

const found = new Map();
for (const member of members) {
  const url = `https://api.openalex.org/works?filter=author.orcid:${member.orcid},from_publication_date:${since}-01-01&per-page=100&mailto=info@ldgenx.fr`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`${member.name}: OpenAlex answered ${response.status}`);
    continue;
  }
  const { results } = await response.json();
  for (const work of results) {
    const doi = work.doi?.replace('https://doi.org/', '').toLowerCase();
    // Articles, reviews, chapters and reports; not datasets, errata or preprints of a listed article.
    if (
      !doi ||
      known.has(doi) ||
      ['paratext', 'dataset', 'erratum', 'editorial'].includes(work.type)
    )
      continue;
    if (
      work.type === 'preprint' &&
      research.toLowerCase().includes(String(work.title).toLowerCase().slice(0, 50))
    )
      continue;
    const entry = found.get(doi) ?? {
      doi,
      title: work.title,
      year: work.publication_year,
      journal: work.primary_location?.source?.display_name ?? '',
      type: work.type,
      authors: work.authorships.map((a) => a.author.display_name),
      abstract: abstract(work.abstract_inverted_index),
      members: [],
    };
    entry.members.push(member.name);
    found.set(doi, entry);
  }
}
if (!found.size)
  console.log(`No new article since ${since} for ${members.map((m) => m.name).join(', ')}.`);
for (const w of [...found.values()].sort((a, b) => b.year - a.year)) {
  console.log(`\n${w.year} · ${w.journal} · ${w.type}\n${w.title}\nhttps://doi.org/${w.doi}`);
  console.log(`Team: ${w.members.join(', ')}\nAuthors: ${w.authors.join(', ')}`);
  if (w.abstract)
    console.log(`Abstract: ${w.abstract.slice(0, 600)}${w.abstract.length > 600 ? '…' : ''}`);
}
