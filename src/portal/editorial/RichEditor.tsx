import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  useEditorState,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link2,
  ImagePlus,
  Film,
  Table2,
  Trash2,
} from "lucide-react";
import type {
  ContentImage,
  ContentNode,
  EditorialMedia,
} from "../../../supabase/functions/_shared/editorial";
import { safeLink } from "../../../supabase/functions/_shared/editorial";
import { MediaImage } from "../../editorial/media-view";
import { useWords } from "./labels";
interface MediaStore {
  current: EditorialMedia[];
  listeners: Set<() => void>;
}
const DisabledContext = createContext(false);
export function ImageFields({
  image,
  onChange,
}: {
  image: ContentImage;
  onChange: (v: ContentImage) => void;
}) {
  const l = useWords(),
    disabled = useContext(DisabledContext);
  return (
    <div className="cms-image-fields">
      {(["alt", "caption", "credit", "licenceUrl"] as const).map((key) => (
        <label key={key}>
          {key === "alt"
            ? l(
                "Texte alternatif · ce que montre l’image",
                "Alternative text · what the image shows",
              )
            : key === "caption"
              ? l("Légende scientifique", "Scientific caption")
              : key === "credit"
                ? l("Crédit / titulaire des droits", "Credit / rights holder")
                : l(
                    "Lien de licence ou source (HTTPS)",
                    "Licence or source link (HTTPS)",
                  )}
          <input
            disabled={disabled}
            className="p-input"
            value={image[key]}
            maxLength={
              key === "caption" ? 2000 : key === "licenceUrl" ? 2000 : 500
            }
            onChange={(e) => onChange({ ...image, [key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}
function FigureNode({
  node,
  updateAttributes,
  deleteNode,
  store,
}: NodeViewProps & { store: MediaStore }) {
  const l = useWords(),
    disabled = useContext(DisabledContext),
    media = useSyncExternalStore(
      (listener) => {
        store.listeners.add(listener);
        return () => {
          store.listeners.delete(listener);
        };
      },
      () => store.current,
    ),
    image = node.attrs as ContentImage;
  return (
    <NodeViewWrapper className="cms-editor-figure" contentEditable={false}>
      <MediaImage
        image={image}
        media={media.find((m) => m.id === image.mediaId)}
      />
      <details>
        <summary>
          {l(
            "Légende, accessibilité et droits",
            "Caption, accessibility and rights",
          )}
        </summary>
        <ImageFields image={image} onChange={updateAttributes} />
      </details>
      <button type="button" disabled={disabled} onClick={deleteNode}>
        {l("Retirer cette figure", "Remove this figure")}
      </button>
    </NodeViewWrapper>
  );
}
function VideoNode({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const l = useWords(),
    disabled = useContext(DisabledContext);
  return (
    <NodeViewWrapper className="cms-editor-video" contentEditable={false}>
      <strong>
        ▶ {l("Vidéo", "Video")} ·{" "}
        {node.attrs.url || l("Fichier importé", "Uploaded file")}
      </strong>
      {(["title", "caption", "transcript"] as const).map((key) => (
        <label key={key}>
          {key === "title"
            ? l("Titre de la vidéo", "Video title")
            : key === "caption"
              ? l("Légende", "Caption")
              : l(
                  "Transcription / description accessible",
                  "Transcript / accessible description",
                )}
          <textarea
            disabled={disabled}
            className="p-input"
            rows={key === "transcript" ? 3 : 2}
            maxLength={key === "title" ? 300 : key === "caption" ? 2000 : 20000}
            value={node.attrs[key]}
            onChange={(e) => updateAttributes({ [key]: e.target.value })}
          />
        </label>
      ))}
      <button type="button" disabled={disabled} onClick={deleteNode}>
        {l("Retirer cette vidéo", "Remove this video")}
      </button>
    </NodeViewWrapper>
  );
}
function EvidenceNode() {
  const l = useWords();
  return (
    <NodeViewWrapper contentEditable={false} className="cms-editor-evidence">
      {l(
        "Données, carte et figures du dossier validé · conservées sur la page publiée.",
        "Validated case data, map and figures · preserved on the published page.",
      )}
    </NodeViewWrapper>
  );
}
const FigureExtension = Node.create<{ resolveStore: () => MediaStore }>({
  addOptions() {
    return { resolveStore: () => ({ current: [], listeners: new Set() }) };
  },
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return Object.fromEntries(
      ["mediaId", "staticSrc", "alt", "caption", "credit", "licenceUrl"].map(
        (k) => [k, { default: "" }],
      ),
    );
  },
  parseHTML() {
    return [{ tag: "figure[data-cms-figure]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { "data-cms-figure": "" }),
    ];
  },
  addNodeView() {
    const store = this.options.resolveStore();
    return ReactNodeViewRenderer((props) => (
      <FigureNode {...props} store={store} />
    ));
  },
});
const VideoExtension = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return Object.fromEntries(
      ["mediaId", "posterId", "url", "title", "caption", "transcript"].map(
        (k) => [k, { default: "" }],
      ),
    );
  },
  parseHTML() {
    return [{ tag: "figure[data-cms-video]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { "data-cms-video": "" }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoNode);
  },
});
const EvidenceExtension = Node.create({
  name: "studyEvidence",
  group: "block",
  atom: true,
  addAttributes() {
    return { id: { default: "" } };
  },
  renderHTML() {
    return ["div", { "data-cms-evidence": "" }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(EvidenceNode);
  },
});
export interface RichHandle {
  insert: (node: ContentNode) => void;
  set: (node: ContentNode) => void;
}
export function RichEditor({
  body,
  onChange,
  media,
  disabled,
  onImage,
  onVideo,
  handle,
}: {
  body: ContentNode;
  onChange: (v: ContentNode) => void;
  media: EditorialMedia[];
  disabled: boolean;
  onImage: () => void;
  onVideo: () => void;
  handle: { current: RichHandle | null };
}) {
  const l = useWords(),
    mediaStore = useRef<MediaStore>({ current: media, listeners: new Set() });
  useEffect(() => {
    mediaStore.current.current = media;
    mediaStore.current.listeners.forEach((listener) => listener());
  }, [media]);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: false, defaultProtocol: "https" },
      }),
      TableKit.configure({ table: { resizable: false } }),
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: l(
          "Rédigez ici. Utilisez des paragraphes courts, des titres et des références précises.",
          "Write here. Use short paragraphs, headings and precise references.",
        ),
      }),
      FigureExtension.configure({ resolveStore: () => mediaStore.current }),
      VideoExtension,
      EvidenceExtension,
    ],
    content: body,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        "aria-label": l("Texte du document", "Document body"),
        "data-testid": "cms-body",
      },
      transformPastedHTML: (html) => html.replace(/<img\b[^>]*>/gi, ""),
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as ContentNode),
  });
  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [disabled, editor]);
  useEffect(() => {
    handle.current = editor
      ? {
          insert: (node) => {
            // Insert after a selected atom, and outside any enclosing table. A newly
            // added video must not replace the figure whose caption was just edited.
            const { selection } = editor.state;
            let position = selection.to;
            for (let depth = selection.$from.depth; depth > 0; depth--) {
              if (selection.$from.node(depth).type.name === "table") {
                position = selection.$from.after(depth);
                break;
              }
            }
            editor
              .chain()
              .focus()
              .insertContentAt(position, [node, { type: "paragraph" }])
              .run();
          },
          set: (node) => {
            editor.commands.setContent(node, { emitUpdate: false });
          },
        }
      : null;
    return () => {
      handle.current = null;
    };
  }, [editor, handle]);
  useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            selection: editor.state.selection.from,
            stored: editor.state.storedMarks,
            doc: editor.state.doc,
          }
        : null,
  });
  if (!editor) return <p>{l("Chargement de l’éditeur…", "Loading editor…")}</p>;
  const tool = (
    label: string,
    action: () => void,
    icon: React.ReactNode,
    active = false,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={action}
    >
      {icon}
    </button>
  );
  return (
    <>
      <DisabledContext.Provider value={disabled}>
        <div className="cms-rich">
          <div
            className="cms-toolbar"
            role="toolbar"
            aria-label={l("Mise en forme", "Formatting")}
          >
            <select
              aria-label={l("Style du paragraphe", "Paragraph style")}
              disabled={disabled}
              value={
                editor.isActive("heading")
                  ? String(editor.getAttributes("heading").level)
                  : "p"
              }
              onChange={(e) => {
                if (e.target.value === "p")
                  editor.chain().focus().setParagraph().run();
                else
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: Number(e.target.value) as 2 | 3 | 4,
                    })
                    .run();
              }}
            >
              <option value="p">{l("Paragraphe", "Paragraph")}</option>
              {[2, 3, 4].map((h) => (
                <option key={h} value={h}>
                  H{h}
                </option>
              ))}
            </select>
            {tool(
              l("Gras", "Bold"),
              () => {
                editor.chain().focus().toggleBold().run();
              },
              <Bold size={17} />,
              editor.isActive("bold"),
            )}
            {tool(
              l("Italique · noms latins", "Italic · Latin names"),
              () => {
                editor.chain().focus().toggleItalic().run();
              },
              <Italic size={17} />,
              editor.isActive("italic"),
            )}
            {tool(
              l("Souligné", "Underline"),
              () => {
                editor.chain().focus().toggleUnderline().run();
              },
              <Underline size={17} />,
              editor.isActive("underline"),
            )}
            {tool(
              l("Indice", "Subscript"),
              () => {
                editor.chain().focus().toggleSubscript().run();
              },
              <SubIcon size={17} />,
              editor.isActive("subscript"),
            )}
            {tool(
              l("Exposant", "Superscript"),
              () => {
                editor.chain().focus().toggleSuperscript().run();
              },
              <SuperIcon size={17} />,
              editor.isActive("superscript"),
            )}
            {tool(
              l("Liste", "Bullet list"),
              () => {
                editor.chain().focus().toggleBulletList().run();
              },
              <List size={17} />,
              editor.isActive("bulletList"),
            )}
            {tool(
              l("Liste numérotée", "Numbered list"),
              () => {
                editor.chain().focus().toggleOrderedList().run();
              },
              <ListOrdered size={17} />,
              editor.isActive("orderedList"),
            )}
            {tool(
              l("Citation", "Quote"),
              () => {
                editor.chain().focus().toggleBlockquote().run();
              },
              <Quote size={17} />,
              editor.isActive("blockquote"),
            )}
            {tool(
              l(
                "Lien HTTPS · vide pour retirer",
                "HTTPS link · empty to remove",
              ),
              () => {
                const value = window.prompt(
                  l(
                    "Adresse HTTPS ou chemin interne. Laissez vide pour retirer le lien.",
                    "HTTPS address or internal path. Leave empty to remove.",
                  ),
                  String(editor.getAttributes("link").href ?? ""),
                );
                if (value === null) return;
                if (!value) {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                  return;
                }
                try {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: safeLink(value) })
                    .run();
                } catch {
                  window.alert(
                    l(
                      "Le lien doit être une adresse HTTPS valide ou un chemin interne.",
                      "The link must be a valid HTTPS address or internal path.",
                    ),
                  );
                }
              },
              <Link2 size={17} />,
              editor.isActive("link"),
            )}
            {tool(
              l("Insérer une figure", "Insert figure"),
              onImage,
              <ImagePlus size={17} />,
            )}
            {tool(
              l("Insérer une vidéo", "Insert video"),
              onVideo,
              <Film size={17} />,
            )}
            {tool(
              l("Insérer un tableau", "Insert table"),
              () => {
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
              },
              <Table2 size={17} />,
            )}
            {editor.isActive("table") && (
              <>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  + {l("ligne", "row")}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  + {l("colonne", "column")}
                </button>
                {tool(
                  l("Retirer la ligne", "Delete row"),
                  () => {
                    editor.chain().focus().deleteRow().run();
                  },
                  "− " + l("ligne", "row"),
                )}
                {tool(
                  l("Retirer la colonne", "Delete column"),
                  () => {
                    editor.chain().focus().deleteColumn().run();
                  },
                  "− " + l("colonne", "column"),
                )}
                {tool(
                  l("Retirer le tableau", "Delete table"),
                  () => {
                    editor.chain().focus().deleteTable().run();
                  },
                  <Trash2 size={17} />,
                )}
              </>
            )}
            {tool(
              l("Annuler", "Undo"),
              () => {
                editor.chain().focus().undo().run();
              },
              <Undo2 size={17} />,
            )}
            {tool(
              l("Rétablir", "Redo"),
              () => {
                editor.chain().focus().redo().run();
              },
              <Redo2 size={17} />,
            )}
          </div>
          <fieldset disabled={disabled}>
            <EditorContent editor={editor} />
          </fieldset>
        </div>
      </DisabledContext.Provider>
    </>
  );
}
