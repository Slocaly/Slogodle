import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { now } from "../lib/clock";
import { dayIndexFor } from "../lib/game-logic";
import { useDarkMode } from "../hooks/useDarkMode";
import { useSoundSettings } from "../hooks/useSoundSettings";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { fetchR2Logos, type R2Logo } from "../lib/r2-logos";
import { fetchIsAdmin } from "../lib/session";
import {
  fetchLogoMetadata,
  saveLogoMetadata,
  deleteLogo,
  reorderLogoMetadata,
  type LogoMetadata,
  type UpsertLogoMetadataInput,
} from "../lib/logo-metadata";
import styles from "./admin.module.css";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const isAdmin = await fetchIsAdmin();
    if (!isAdmin) {
      throw notFound();
    }
  },
  component: AdminPage,
});

const sortModeParser = parseAsStringLiteral(["alpha", "day"] as const).withDefault(
  "alpha",
);
const viewModeParser = parseAsStringLiteral(["table", "grid", "form"] as const).withDefault(
  "table",
);

interface AdminLogo {
  logo: R2Logo;
  metadata: LogoMetadata | undefined;
}

function displayName({ logo, metadata }: AdminLogo): string {
  return metadata?.name || logo.key;
}

function dayOffsetLabel(offset: number | null): string {
  if (offset === null) return "No day order";
  return offset === 0 ? "Today" : `+${offset}d`;
}

function dateForOffset(offset: number | null): string {
  if (offset === null) return "—";
  const d = now();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AdminPage() {
  const { dark, toggleDark } = useDarkMode();
  const { soundEnabled, toggleSound } = useSoundSettings();
  const { playClick, playBubble } = useSoundEffects(soundEnabled);
  const [sortMode, setSortMode] = useQueryState("sort", sortModeParser);
  const [viewMode, setViewMode] = useQueryState("view", viewModeParser);
  const [search, setSearch] = useState("");

  const [r2Logos, setR2Logos] = useState<R2Logo[] | null>(null);
  const [r2Error, setR2Error] = useState<string | null>(null);

  useEffect(() => {
    if (r2Logos !== null || r2Error !== null) return;
    fetchR2Logos()
      .then(setR2Logos)
      .catch((error: unknown) =>
        setR2Error(error instanceof Error ? error.message : String(error)),
      );
  }, [r2Logos, r2Error]);

  const [metadataList, setMetadataList] = useState<LogoMetadata[] | null>(
    null,
  );
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    if (metadataList !== null || metadataError !== null) return;
    fetchLogoMetadata()
      .then(setMetadataList)
      .catch((error: unknown) =>
        setMetadataError(error instanceof Error ? error.message : String(error)),
      );
  }, [metadataList, metadataError]);

  const metadataByKey = new Map(
    (metadataList ?? []).map((metadata) => [metadata.r2Key, metadata]),
  );

  const handleMetadataSaved = (saved: LogoMetadata) => {
    setMetadataList((prev) => [
      ...(prev ?? []).filter((metadata) => metadata.r2Key !== saved.r2Key),
      saved,
    ]);
  };

  const handleLogoDeleted = (r2Key: string) => {
    setR2Logos((prev) => (prev ?? []).filter((logo) => logo.key !== r2Key));
    setMetadataList((prev) =>
      (prev ?? []).filter((metadata) => metadata.r2Key !== r2Key),
    );
  };

  const entries: AdminLogo[] = (r2Logos ?? []).map((logo) => ({
    logo,
    metadata: metadataByKey.get(logo.key),
  }));

  const query = search.trim().toLowerCase();
  const filteredEntries = query
    ? entries.filter((entry) =>
        displayName(entry).toLowerCase().includes(query),
      )
    : entries;

  const alphaBank = [...filteredEntries].sort((a, b) =>
    displayName(a).localeCompare(displayName(b)),
  );
  const alphaTodayIndex =
    ((dayIndexFor(now()) % alphaBank.length) + alphaBank.length) %
    alphaBank.length;
  const alphaRows = alphaBank.map((entry, index) => ({
    entry,
    offset: (index - alphaTodayIndex + alphaBank.length) % alphaBank.length,
  }));

  const dayBank = filteredEntries
    .filter((entry) => entry.metadata?.dayOrder != null)
    .sort((a, b) => a.metadata!.dayOrder! - b.metadata!.dayOrder!);
  const unorderedEntries = filteredEntries.filter(
    (entry) => entry.metadata?.dayOrder == null,
  );
  const dayTodayIndex = dayBank.length
    ? ((dayIndexFor(now()) % dayBank.length) + dayBank.length) %
      dayBank.length
    : 0;
  const dayRows = [
    ...dayBank
      .map((entry, index) => ({
        entry,
        offset: (index - dayTodayIndex + dayBank.length) % dayBank.length,
      }))
      .sort((a, b) => a.offset - b.offset),
    ...unorderedEntries.map((entry) => ({ entry, offset: null })),
  ];

  const sortedRows = sortMode === "alpha" ? alphaRows : dayRows;
  const canReorder = sortMode === "day" && query === "";

  const handleReorder = (orderedR2Keys: string[]) => {
    const updates = orderedR2Keys.map((r2Key, index) => ({
      r2Key,
      dayOrder: index + 1,
    }));
    setMetadataList((prev) =>
      (prev ?? []).map((metadata) => {
        const update = updates.find((u) => u.r2Key === metadata.r2Key);
        return update ? { ...metadata, dayOrder: update.dayOrder } : metadata;
      }),
    );
    reorderLogoMetadata({ data: updates }).catch((error: unknown) =>
      setMetadataError(error instanceof Error ? error.message : String(error)),
    );
  };

  const loading =
    r2Error === null && (r2Logos === null || (metadataList === null && metadataError === null));

  return (
    <div className={styles.page}>
      <GameHeader
        dark={dark}
        onToggleDark={toggleDark}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        playClick={playClick}
        playBubble={playBubble}
        statsLinkTo="/admin/stats"
      />

      <div className={styles.content}>
        <Link to="/" className={styles.backLink}>
          ← Back to game
        </Link>

        <h1 className={styles.title}>Admin — Logos ({entries.length})</h1>

        <div className={styles.sortRow}>
        <span className={styles.sortLabel}>Sort by</span>
        <button
          type="button"
          className={`${styles.sortBtn} ${sortMode === "alpha" ? styles.sortBtnActive : ""}`}
          onClick={() => setSortMode("alpha")}
        >
          Alphabetical
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${sortMode === "day" ? styles.sortBtnActive : ""}`}
          onClick={() => setSortMode("day")}
        >
          Day (starting today)
        </button>
      </div>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>View</span>
        <button
          type="button"
          className={`${styles.sortBtn} ${viewMode === "table" ? styles.sortBtnActive : ""}`}
          onClick={() => setViewMode("table")}
        >
          Table
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${viewMode === "grid" ? styles.sortBtnActive : ""}`}
          onClick={() => setViewMode("grid")}
        >
          Grid
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${viewMode === "form" ? styles.sortBtnActive : ""}`}
          onClick={() => setViewMode("form")}
        >
          Form
        </button>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {r2Error ? (
        <p className={styles.empty}>Failed to load R2 bucket: {r2Error}</p>
      ) : loading ? (
        <p className={styles.empty}>Loading logos…</p>
      ) : sortedRows.length === 0 ? (
        <p className={styles.empty}>No logos match "{search}".</p>
      ) : (
        <>
          {metadataError && (
            <p className={styles.empty}>
              Could not load saved metadata: {metadataError}
            </p>
          )}
          {viewMode === "table" ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Industry</th>
                    <th>Founded</th>
                    <th>Day</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map(({ entry, offset }) => (
                    <tr
                      key={entry.logo.key}
                      className={`${entry.metadata?.gitLink ? styles.clickableRow : ""} ${offset === 0 ? styles.todayRow : ""}`}
                      onClick={() => {
                        if (entry.metadata?.gitLink) {
                          window.open(
                            entry.metadata.gitLink,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                      }}
                    >
                      <td className={styles.iconCell}>
                        <img src={entry.logo.url} alt="" width={28} height={28} />
                      </td>
                      <td>{displayName(entry)}</td>
                      <td>{entry.metadata?.industry ?? "—"}</td>
                      <td>{entry.metadata?.founded ?? "—"}</td>
                      <td>
                        {dateForOffset(offset)} ({dayOffsetLabel(offset)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : viewMode === "grid" ? (
            <div className={styles.grid}>
              {sortedRows.map(({ entry, offset }) => (
                <div
                  key={entry.logo.key}
                  className={`${styles.gridCell} ${offset === 0 ? styles.todayRow : ""}`}
                >
                  <img src={entry.logo.url} alt="" width={120} height={120} />
                  <span className={styles.gridName}>{displayName(entry)}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              {sortMode === "day" && query !== "" && (
                <p className={styles.empty}>
                  Clear the search to drag &amp; drop cards and reorder days.
                </p>
              )}
              {sortMode === "alpha" && (
                <p className={styles.empty}>
                  Switch to "Day" sort to drag &amp; drop cards and reorder
                  days.
                </p>
              )}
              <div className={styles.r2List}>
                {sortedRows.map(({ entry }, index) => (
                  <R2LogoCard
                    key={entry.logo.key}
                    logo={entry.logo}
                    metadata={entry.metadata}
                    onSaved={handleMetadataSaved}
                    onDeleted={handleLogoDeleted}
                    draggable={canReorder && entry.metadata?.dayOrder != null}
                    onDropReorder={(fromR2Key) => {
                      const from = dayBank.findIndex(
                        (e) => e.logo.key === fromR2Key,
                      );
                      const to = index;
                      if (from === -1 || from === to) return;
                      const reordered = [...dayBank];
                      const [moved] = reordered.splice(from, 1);
                      reordered.splice(to, 0, moved);
                      handleReorder(reordered.map((e) => e.logo.key));
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
      </div>

      <GameFooter />
    </div>
  );
}

interface R2LogoCardForm {
  name: string;
  industry: string;
  founded: string;
  description: string;
  funFact: string;
  gitLink: string;
}

function metadataToForm(metadata: LogoMetadata | undefined): R2LogoCardForm {
  return {
    name: metadata?.name ?? "",
    industry: metadata?.industry ?? "",
    founded: metadata?.founded?.toString() ?? "",
    description: metadata?.description ?? "",
    funFact: metadata?.funFact ?? "",
    gitLink: metadata?.gitLink ?? "",
  };
}

function R2LogoCard({
  logo,
  metadata,
  onSaved,
  onDeleted,
  draggable = false,
  onDropReorder,
}: {
  logo: R2Logo;
  metadata: LogoMetadata | undefined;
  onSaved: (metadata: LogoMetadata) => void;
  onDeleted: (r2Key: string) => void;
  draggable?: boolean;
  onDropReorder?: (fromR2Key: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<R2LogoCardForm>(() =>
    metadataToForm(metadata),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    setDeleting(true);
    setDeleteError(null);
    deleteLogo({ data: { r2Key: logo.key } })
      .then(() => {
        onDeleted(logo.key);
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof Error ? err.message : String(err));
        setDeleting(false);
      });
  };

  const setField = (field: keyof R2LogoCardForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleEdit = () => {
    setForm(metadataToForm(metadata));
    setError(null);
    setSaved(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(metadataToForm(metadata));
    setError(null);
    setEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    setError(null);
    const input: UpsertLogoMetadataInput = {
      r2Key: logo.key,
      name: form.name || null,
      industry: form.industry || null,
      founded: form.founded ? Number(form.founded) : null,
      description: form.description || null,
      funFact: form.funFact || null,
      gitLink: form.gitLink || null,
      aspect: metadata?.aspect ?? null,
    };
    saveLogoMetadata({ data: input })
      .then((result) => {
        onSaved(result);
        setSaved(true);
        setEditing(false);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : String(err)),
      )
      .finally(() => setSaving(false));
  };

  return (
    <div
      className={`${styles.r2Card} ${dragOver ? styles.r2CardDragOver : ""}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", logo.key);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (!onDropReorder) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const fromR2Key = e.dataTransfer.getData("text/plain");
        if (fromR2Key) onDropReorder?.(fromR2Key);
      }}
    >
      <div className={styles.r2CardHeader}>
        <img src={logo.url} alt="" width={64} height={64} />
        <span className={styles.gridName}>{logo.key}</span>
        <span className={styles.r2DayOrderBadge}>
          {metadata?.dayOrder != null ? `Day #${metadata.dayOrder}` : "No day order"}
        </span>
      </div>

      {deleteOpen && (
        <DeleteLogoModal
          fileName={logo.key}
          deleting={deleting}
          error={deleteError}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
      <div className={styles.r2Body}>
        {editing ? (
          <>
            <div className={styles.r2Fields}>
              <label className={styles.r2Field}>
                <span className={styles.r2Label}>Name</span>
                <input
                  type="text"
                  className={styles.r2Input}
                  value={form.name}
                  onChange={(e) => setField("name")(e.target.value)}
                />
              </label>
              <label className={styles.r2Field}>
                <span className={styles.r2Label}>Industry</span>
                <input
                  type="text"
                  className={styles.r2Input}
                  value={form.industry}
                  onChange={(e) => setField("industry")(e.target.value)}
                />
              </label>
              <label className={styles.r2Field}>
                <span className={styles.r2Label}>Founded year</span>
                <input
                  type="number"
                  className={styles.r2Input}
                  value={form.founded}
                  onChange={(e) => setField("founded")(e.target.value)}
                />
              </label>
              <label className={`${styles.r2Field} ${styles.r2FieldFull}`}>
                <span className={styles.r2Label}>
                  Git link
                  {form.gitLink && (
                    <a
                      href={form.gitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.r2GitLinkOpen}
                    >
                      Open ↗
                    </a>
                  )}
                </span>
                <input
                  type="text"
                  className={styles.r2Input}
                  value={form.gitLink}
                  onChange={(e) => setField("gitLink")(e.target.value)}
                />
              </label>
              <label className={`${styles.r2Field} ${styles.r2FieldFull}`}>
                <span className={styles.r2Label}>Description</span>
                <textarea
                  className={styles.r2Textarea}
                  value={form.description}
                  onChange={(e) => setField("description")(e.target.value)}
                />
              </label>
              <label className={`${styles.r2Field} ${styles.r2FieldFull}`}>
                <span className={styles.r2Label}>Fun fact</span>
                <textarea
                  className={styles.r2Textarea}
                  value={form.funFact}
                  onChange={(e) => setField("funFact")(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.r2CardFooter}>
              <button
                type="button"
                className={styles.r2SaveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                className={styles.r2CancelBtn}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              {error && <span className={styles.r2Error}>{error}</span>}
            </div>
          </>
        ) : (
          <ReadOnlyView
            metadata={metadata}
            saved={saved}
            onEdit={handleEdit}
            onDelete={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

function DeleteLogoModal({
  fileName,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  fileName: string;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canConfirm = confirmText === fileName && !deleting;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={styles.modalBox}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.modalTitle}>Delete logo</h3>
        <p className={styles.modalText}>
          This permanently deletes <strong>{fileName}</strong> from the
          bucket and its metadata. This can’t be undone.
        </p>
        <p className={styles.modalText}>
          Remember to also remove it from the <strong>logos</strong> package
          (packages/logos) — this doesn't touch that repo.
        </p>
        <p className={styles.modalText}>
          Type <strong>{fileName}</strong> to confirm.
        </p>
        <input
          type="text"
          className={styles.r2Input}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={fileName}
          autoFocus
        />
        <div className={styles.r2CardFooter}>
          <button
            type="button"
            className={styles.r2DeleteConfirmBtn}
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            className={styles.r2CancelBtn}
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          {error && <span className={styles.r2Error}>{error}</span>}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyView({
  metadata,
  saved,
  onEdit,
  onDelete,
}: {
  metadata: LogoMetadata | undefined;
  saved: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const incomplete =
    !metadata?.name ||
    !metadata?.industry ||
    !metadata?.founded ||
    !metadata?.gitLink;

  return (
    <>
      <div className={styles.r2ReadHeader}>
        <h3 className={styles.r2ReadTitle}>
          {metadata?.name || "Untitled logo"}
        </h3>
        {incomplete && (
          <span className={styles.r2Badge}>Incomplete</span>
        )}
      </div>

      <div className={styles.r2MetaRow}>
        <span className={styles.r2MetaItem}>
          {metadata?.industry || (
            <em className={styles.r2ReadEmpty}>No industry set</em>
          )}
        </span>
        <span className={styles.r2MetaDivider}>·</span>
        <span className={styles.r2MetaItem}>
          {metadata?.founded || (
            <em className={styles.r2ReadEmpty}>No founding year</em>
          )}
        </span>
      </div>

      <div className={styles.r2ReadGroup}>
        <span className={styles.r2ReadLabel}>Git link</span>
        {metadata?.gitLink ? (
          <a
            href={metadata.gitLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.r2ReadLink}
          >
            {metadata.gitLink}
          </a>
        ) : (
          <em className={styles.r2ReadEmpty}>Not set</em>
        )}
      </div>

      <div className={styles.r2ReadGroup}>
        <span className={styles.r2ReadLabel}>Description</span>
        {metadata?.description ? (
          <p className={styles.r2ReadText}>{metadata.description}</p>
        ) : (
          <em className={styles.r2ReadEmpty}>Not set</em>
        )}
      </div>

      {metadata?.funFact && (
        <div className={styles.r2FunFactBox}>
          <span className={styles.r2ReadLabel}>Fun fact</span>
          <p className={styles.r2ReadText}>{metadata.funFact}</p>
        </div>
      )}

      <div className={styles.r2CardFooter}>
        <button type="button" className={styles.r2SaveBtn} onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className={styles.r2DeleteBtn}
          onClick={onDelete}
        >
          Delete
        </button>
        {saved && <span className={styles.r2Saved}>Saved</span>}
      </div>
    </>
  );
}
