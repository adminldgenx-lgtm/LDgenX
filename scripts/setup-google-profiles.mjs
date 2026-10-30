import { readFile } from "node:fs/promises";
import { query, literal } from "./lib/supabase-management.mjs";
const version = "20261029130000";
if (
  !(
    await query(
      `select version from supabase_migrations.schema_migrations where version=${literal(version)}`,
    )
  ).length
) {
  const migration = await readFile(
    `supabase/migrations/${version}_google_profiles.sql`,
    "utf8",
  );
  await query(
    `begin; ${migration} insert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(version)},'google_profiles',array[${literal(migration)}]); commit;`,
  );
}
console.log(
  "New Google profiles map given/family names; every new profile remains a pending client. Existing roles and profiles unchanged.",
);
