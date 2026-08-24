import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LOGOS } from "@slogodle/logos";
import { dayIndexFor } from "../lib/game-logic";
import { now } from "../lib/clock";
import { useDarkMode } from "../hooks/useDarkMode";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { fetchR2Logos, type R2Logo } from "../lib/r2-logos";
import {
  fetchLogoMetadata,
  saveLogoMetadata,
  type LogoMetadata,
  type UpsertLogoMetadataInput,
} from "../lib/logo-metadata";
import styles from "./admin.module.css";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: AdminPage,
});

type SortMode = "alpha" | "day";
type ViewMode = "table" | "grid";
type SourceMode = "local" | "r2";

function dayOffsetLabel(offset: number): string {
  return offset === 0 ? "Today" : `+${offset}d`;
}

function dateForOffset(offset: number): string {
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
  const [sourceMode, setSourceMode] = useState<SourceMode>("local");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");

  const [r2Logos, setR2Logos] = useState<R2Logo[] | null>(null);
  const [r2Error, setR2Error] = useState<string | null>(null);

  useEffect(() => {
    if (sourceMode !== "r2" || r2Logos !== null || r2Error !== null) return;
    fetchR2Logos()
      .then(setR2Logos)
      .catch((error: unknown) =>
        setR2Error(error instanceof Error ? error.message : String(error)),
      );
  }, [sourceMode, r2Logos, r2Error]);

  const [metadataList, setMetadataList] = useState<LogoMetadata[] | null>(
    null,
  );
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceMode !== "r2" || metadataList !== null || metadataError !== null)
      return;
    fetchLogoMetadata()
      .then(setMetadataList)
      .catch((error: unknown) =>
        setMetadataError(error instanceof Error ? error.message : String(error)),
      );
  }, [sourceMode, metadataList, metadataError]);

  const metadataByKey = new Map(
    (metadataList ?? []).map((metadata) => [metadata.r2Key, metadata]),
  );

  const handleMetadataSaved = (saved: LogoMetadata) => {
    setMetadataList((prev) => [
      ...(prev ?? []).filter((metadata) => metadata.r2Key !== saved.r2Key),
      saved,
    ]);
  };

  const query = search.trim().toLowerCase();
  const filteredR2Logos = (r2Logos ?? []).filter((logo) =>
    logo.key.toLowerCase().includes(query),
  );

  const todayIndex =
    ((dayIndexFor(now()) % LOGOS.length) + LOGOS.length) % LOGOS.length;
  const rows = LOGOS.map((logo, index) => ({
    logo,
    offset: (index - todayIndex + LOGOS.length) % LOGOS.length,
  }));

  const filteredRows = query
    ? rows.filter(({ logo }) => logo.name.toLowerCase().includes(query))
    : rows;

  const sortedRows =
    sortMode === "alpha"
      ? [...filteredRows].sort((a, b) => a.logo.name.localeCompare(b.logo.name))
      : [...filteredRows].sort((a, b) => a.offset - b.offset);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← Back to game
        </Link>
        <DarkModeToggle dark={dark} onDarkModeToggle={toggleDark} />
      </div>

      <h1 className={styles.title}>Admin — Logos ({LOGOS.length})</h1>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>Source</span>
        <button
          type="button"
          className={`${styles.sortBtn} ${sourceMode === "local" ? styles.sortBtnActive : ""}`}
          onClick={() => setSourceMode("local")}
        >
          Local logos
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${sourceMode === "r2" ? styles.sortBtnActive : ""}`}
          onClick={() => setSourceMode("r2")}
        >
          R2 bucket
        </button>
      </div>

      {sourceMode === "local" && (
        <>
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
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </>
      )}

      {sourceMode === "r2" && (
        <div className={styles.sortRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {sourceMode === "r2" ? (
        r2Error ? (
          <p className={styles.empty}>Failed to load R2 bucket: {r2Error}</p>
        ) : r2Logos === null ||
          (metadataList === null && metadataError === null) ? (
          <p className={styles.empty}>Loading R2 bucket…</p>
        ) : filteredR2Logos.length === 0 ? (
          <p className={styles.empty}>No objects match "{search}".</p>
        ) : (
          <div className={styles.r2List}>
            {metadataError && (
              <p className={styles.empty}>
                Could not load saved metadata: {metadataError}
              </p>
            )}
            {filteredR2Logos.map((logo) => (
              <R2LogoCard
                key={logo.key}
                logo={logo}
                metadata={metadataByKey.get(logo.key)}
                onSaved={handleMetadataSaved}
              />
            ))}
          </div>
        )
      ) : sortedRows.length === 0 ? (
        <p className={styles.empty}>No logos match "{search}".</p>
      ) : viewMode === "table" ? (
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
              {sortedRows.map(({ logo, offset }) => (
                <tr
                  key={logo.name}
                  className={`${styles.clickableRow} ${offset === 0 ? styles.todayRow : ""}`}
                  onClick={() =>
                    window.open(logo.gitLink, "_blank", "noopener,noreferrer")
                  }
                >
                  <td className={styles.iconCell}>
                    <img src={logo.icon} alt="" width={28} height={28} />
                  </td>
                  <td>{logo.name}</td>
                  <td>{logo.industry}</td>
                  <td>{logo.founded}</td>
                  <td>
                    {dateForOffset(offset)} ({dayOffsetLabel(offset)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedRows.map(({ logo, offset }) => (
            <div
              key={logo.name}
              className={`${styles.gridCell} ${offset === 0 ? styles.todayRow : ""}`}
            >
              <img src={logo.icon} alt="" width={120} height={120} />
              <span className={styles.gridName}>{logo.name}</span>
            </div>
          ))}
        </div>
      )}
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
  aspect: string;
}

function metadataToForm(metadata: LogoMetadata | undefined): R2LogoCardForm {
  return {
    name: metadata?.name ?? "",
    industry: metadata?.industry ?? "",
    founded: metadata?.founded?.toString() ?? "",
    description: metadata?.description ?? "",
    funFact: metadata?.funFact ?? "",
    gitLink: metadata?.gitLink ?? "",
    aspect: metadata?.aspect?.toString() ?? "",
  };
}

function R2LogoCard({
  logo,
  metadata,
  onSaved,
}: {
  logo: R2Logo;
  metadata: LogoMetadata | undefined;
  onSaved: (metadata: LogoMetadata) => void;
}) {
  const [form, setForm] = useState<R2LogoCardForm>(() =>
    metadataToForm(metadata),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const setField = (field: keyof R2LogoCardForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
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
      aspect: form.aspect ? Number(form.aspect) : null,
    };
    saveLogoMetadata({ data: input })
      .then((result) => {
        onSaved(result);
        setSaved(true);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : String(err)),
      )
      .finally(() => setSaving(false));
  };

  return (
    <div className={styles.r2Card}>
      <div className={styles.r2CardHeader}>
        <img src={logo.url} alt="" width={64} height={64} />
        <span className={styles.gridName}>{logo.key}</span>
      </div>
      <div className={styles.r2Body}>
        <div className={styles.r2Fields}>
          <input
            type="text"
            className={styles.r2Input}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setField("name")(e.target.value)}
          />
          <input
            type="text"
            className={styles.r2Input}
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => setField("industry")(e.target.value)}
          />
          <input
            type="number"
            className={styles.r2Input}
            placeholder="Founded year"
            value={form.founded}
            onChange={(e) => setField("founded")(e.target.value)}
          />
          <input
            type="number"
            step="any"
            className={styles.r2Input}
            placeholder="Aspect ratio"
            value={form.aspect}
            onChange={(e) => setField("aspect")(e.target.value)}
          />
          <input
            type="text"
            className={`${styles.r2Input} ${styles.r2FieldFull}`}
            placeholder="Git link"
            value={form.gitLink}
            onChange={(e) => setField("gitLink")(e.target.value)}
          />
          <textarea
            className={`${styles.r2Textarea} ${styles.r2FieldFull}`}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setField("description")(e.target.value)}
          />
          <textarea
            className={`${styles.r2Textarea} ${styles.r2FieldFull}`}
            placeholder="Fun fact"
            value={form.funFact}
            onChange={(e) => setField("funFact")(e.target.value)}
          />
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
          {error && <span className={styles.r2Error}>{error}</span>}
          {!error && saved && <span className={styles.r2Saved}>Saved</span>}
        </div>
      </div>
    </div>
  );
}
