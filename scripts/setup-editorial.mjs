// Additive CMS setup only. Does not change Auth, email, DNS or existing portal tables.
import { readFile } from "node:fs/promises";
import { query, literal } from "./lib/supabase-management.mjs";
const version = "20261029120000";
const applied = await query(
  `select version from supabase_migrations.schema_migrations where version=${literal(version)}`,
);
if (!applied.length) {
  const migration = await readFile(
    `supabase/migrations/${version}_editorial.sql`,
    "utf8",
  );
  await query(
    `begin; ${migration}\n insert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(version)},'editorial',array[${literal(migration)}]); commit;`,
  );
  console.log("Editorial migration applied.");
} else console.log("Editorial migration already applied.");
const entries = JSON.parse(
  await readFile(".prerender/editorial-seed.json", "utf8"),
);
for (let i = 0; i < entries.length; i += 8) {
  const part = entries.slice(i, i + 8);
  await query(
    `begin; ${part.map((e) => `insert into public.cms_entries(id,kind,locale,slug,group_id,legacy_id,draft) values(${[e.id, e.kind, e.locale, e.slug, e.groupId, e.legacyId].map(literal).join(",")},${literal(JSON.stringify(e.document))}::jsonb) on conflict(id) do nothing;`).join("\n")} commit;`,
  );
}
console.log(
  JSON.stringify(
    await query(
      "select kind,locale,count(*)::int as count from public.cms_entries group by kind,locale order by kind,locale",
    ),
  ),
);
