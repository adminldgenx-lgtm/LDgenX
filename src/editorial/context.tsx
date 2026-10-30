import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getPage, type PageMeta } from "../lib/pages";
import { editorialMeta, filterEditorialAlternates } from "./meta";
import type {
  EditorialSummary,
  PublishedDocument,
} from "../../supabase/functions/_shared/editorial";

export interface EditorialBootstrap {
  index: EditorialSummary[];
  document: PublishedDocument | null;
}
const empty: EditorialBootstrap = { index: [], document: null };
interface EditorialState {
  index: EditorialSummary[];
  documents: Record<string, PublishedDocument>;
  failures: Record<string, string>;
  load: (path: string) => void;
}
const EditorialContext = createContext<EditorialState>({
  index: [],
  documents: {},
  failures: {},
  load: () => {},
});
const publicBase = import.meta.env?.DEV
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/editorial/public`
  : "/api/editorial";
async function publicJson(path: string) {
  const response = await fetch(publicBase + path, {
    headers: { apikey: import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ?? "" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok)
    throw new Error(
      response.status === 404 || response.status === 410
        ? "not-found"
        : "unavailable",
    );
  return response.json();
}
export function readEditorialBootstrap(): EditorialBootstrap {
  try {
    return (
      JSON.parse(
        document.getElementById("ldgenx-editorial")?.textContent ?? "null",
      ) ?? empty
    );
  } catch {
    return empty;
  }
}
export function EditorialProvider({
  initial = empty,
  children,
}: {
  initial?: EditorialBootstrap;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(initial.index);
  const [documents, setDocuments] = useState<Record<string, PublishedDocument>>(
    initial.document ? { [initial.document.path]: initial.document } : {},
  );
  const [failures, setFailures] = useState<Record<string, string>>({});
  const pending = useMemo(() => new Set<string>(), []);
  useEffect(() => {
    let alive = true;
    const update = () =>
      publicJson("/index")
        .then((data) => {
          if (alive && Array.isArray(data)) setIndex(data);
        })
        .catch(() => {});
    void update();
    const focus = () => {
      if (document.visibilityState === "visible") void update();
    };
    document.addEventListener("visibilitychange", focus);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", focus);
    };
  }, []);
  const state: EditorialState = {
    index,
    documents,
    failures,
    load(path) {
      if (pending.has(path) || documents[path]) return;
      pending.add(path);
      void publicJson(`/document?path=${encodeURIComponent(path)}`)
        .then((data) => {
          setDocuments((old) => ({ ...old, [path]: data }));
          setFailures((old) => {
            const next = { ...old };
            delete next[path];
            return next;
          });
        })
        .catch((error) =>
          setFailures((old) => ({ ...old, [path]: error.message })),
        )
        .finally(() => pending.delete(path));
    },
  };
  return (
    <EditorialContext.Provider value={state}>
      {children}
    </EditorialContext.Provider>
  );
}
export const useEditorial = () => useContext(EditorialContext);
export function resolveEditorialMeta(
  path: string,
  index: EditorialSummary[],
): PageMeta {
  const normalized = path.replace(/\/+$/, "") || "/";
  const row = index.find((p) => p.path === normalized);
  const fallback = getPage(path);
  if (!row)
    return index.length ? filterEditorialAlternates(fallback, index) : fallback;
  if (row.status === "withdrawn")
    return {
      ...fallback,
      kind: "not-found",
      noindex: true,
      alternates: {},
      path: normalized,
    };
  return editorialMeta(row, index);
}
export function usePublicMeta(path: string) {
  return resolveEditorialMeta(path, useEditorial().index);
}
