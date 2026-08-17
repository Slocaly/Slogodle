import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { LOGOS } from '../data/logos'
import { dayIndexFor } from '../lib/game-logic'
import { now } from '../lib/clock'
import styles from './admin.module.css'

export const Route = createFileRoute('/admin')({
  ssr: false,
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound()
    }
  },
  component: AdminPage,
})

type SortMode = 'alpha' | 'day'
type ViewMode = 'table' | 'grid'

function dayOffsetLabel(offset: number): string {
  return offset === 0 ? 'Today' : `+${offset}d`
}

function dateForOffset(offset: number): string {
  const d = now()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function AdminPage() {
  const [sortMode, setSortMode] = useState<SortMode>('alpha')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')

  const todayIndex = ((dayIndexFor(now()) % LOGOS.length) + LOGOS.length) % LOGOS.length
  const rows = LOGOS.map((logo, index) => ({
    logo,
    offset: (index - todayIndex + LOGOS.length) % LOGOS.length,
  }))

  const query = search.trim().toLowerCase()
  const filteredRows = query ? rows.filter(({ logo }) => logo.name.toLowerCase().includes(query)) : rows

  const sortedRows =
    sortMode === 'alpha'
      ? [...filteredRows].sort((a, b) => a.logo.name.localeCompare(b.logo.name))
      : [...filteredRows].sort((a, b) => a.offset - b.offset)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin — Logos ({LOGOS.length})</h1>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>Sort by</span>
        <button
          type="button"
          className={`${styles.sortBtn} ${sortMode === 'alpha' ? styles.sortBtnActive : ''}`}
          onClick={() => setSortMode('alpha')}
        >
          Alphabetical
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${sortMode === 'day' ? styles.sortBtnActive : ''}`}
          onClick={() => setSortMode('day')}
        >
          Day (starting today)
        </button>
      </div>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>View</span>
        <button
          type="button"
          className={`${styles.sortBtn} ${viewMode === 'table' ? styles.sortBtnActive : ''}`}
          onClick={() => setViewMode('table')}
        >
          Table
        </button>
        <button
          type="button"
          className={`${styles.sortBtn} ${viewMode === 'grid' ? styles.sortBtnActive : ''}`}
          onClick={() => setViewMode('grid')}
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

      {sortedRows.length === 0 ? (
        <p className={styles.empty}>No logos match "{search}".</p>
      ) : viewMode === 'table' ? (
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
                  className={`${styles.clickableRow} ${offset === 0 ? styles.todayRow : ''}`}
                  onClick={() => window.open(logo.gitLink, '_blank', 'noopener,noreferrer')}
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
            <div key={logo.name} className={`${styles.gridCell} ${offset === 0 ? styles.todayRow : ''}`}>
              <img src={logo.icon} alt="" width={120} height={120} />
              <span className={styles.gridName}>{logo.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
