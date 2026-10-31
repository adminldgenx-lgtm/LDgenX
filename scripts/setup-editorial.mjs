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
for (const [version, name] of [
  ["20261030110000", "editorial_management"],
  ["20261030113000", "editorial_page_paths"],
  ["20261031090000", "editorial_social_images"],
]) {
  const applied = await query(
    `select version from supabase_migrations.schema_migrations where version=${literal(version)}`,
  );
  if (!applied.length) {
    const migration = await readFile(
      `supabase/migrations/${version}_${name}.sql`,
      "utf8",
    );
    await query(
      `begin; ${migration}\n insert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(version)},${literal(name)},array[${literal(migration)}]); commit;`,
    );
    console.log(name + " migration applied.");
  }
}
console.log(
  JSON.stringify(
    await query(
      "select kind,locale,count(*)::int as count from public.cms_entries group by kind,locale order by kind,locale",
    ),
  ),
);
