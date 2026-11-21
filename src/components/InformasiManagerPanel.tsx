import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  getInformasiUnitBySeksiId,
  type InfoOrgNode,
  type InfoSection,
  type InformasiUnitConfig,
  type InformasiUnitId,
} from '@/src/data/informasiData';
import {
  resetInfoSectionData,
  saveInfoSectionData,
  type SeksiUnitId,
} from '@/src/firebase';
import {
  downloadTemplateForSection,
  exportSectionToExcel,
  exportUnitWorkbookToExcel,
  parseExcelFileForSection,
  type ParsedExcelSectionResult,
} from '@/src/utils/infoExcel';

interface InformasiManagerPanelProps {
  /** Optional controlled unit when embedded inside InformasiUnitView */
  controlledUnitId?: InformasiUnitId;
  /** Optional controlled section when embedded inside InformasiUnitView */
  controlledSectionId?: string;
  /** Compact inline mode vs full console tab mode */
  compact?: boolean;
}

const ORG_COLUMNS_FALLBACK = [
  'No',
  'Jabatan',
  'Nama Pejabat',
  'Level (pimpinan/koordinator/pelaksana)',
  'Bidang / Tugas',
  'NIP',
];

function formatSectionRowsForEdit(section: InfoSection): {
  columns: string[];
  rows: string[][];
  isOrgMode: boolean;
} {
  if (section.orgNodes && section.orgNodes.length > 0 && !section.columns) {
    return {
      columns: ORG_COLUMNS_FALLBACK,
      rows: section.orgNodes.map((n, idx) => [
        String(idx + 1),
        n.role,
        n.name,
        n.level,
        n.division || '',
        n.nip || '',
      ]),
      isOrgMode: true,
    };
  }
  const cols =
    section.columns && section.columns.length > 0
      ? section.columns
      : ['No', 'Uraian', 'Keterangan'];
  const rows = (section.rows || []).map((r) => cols.map((_, i) => r[i] ?? ''));
  return { columns: cols, rows, isOrgMode: false };
}

function rowsToOrgNodes(columns: string[], rows: string[][]): InfoOrgNode[] {
  const colLower = columns.map((c) => c.toLowerCase());
  const findIdx = (keys: string[], fallback: number) => {
    const found = colLower.findIndex((c) => keys.some((k) => c.includes(k)));
    return found >= 0 ? found : fallback;
  };
  const roleIdx = findIdx(['jabatan', 'role', 'posisi'], columns.length > 1 ? 1 : 0);
  const nameIdx = findIdx(['nama', 'pejabat'], columns.length > 2 ? 2 : Math.min(1, columns.length - 1));
  const levelIdx = findIdx(['level', 'tingkat'], columns.length > 3 ? 3 : -1);
  const divIdx = findIdx(['bidang', 'tugas', 'divisi', 'keterangan'], columns.length > 4 ? 4 : -1);
  const nipIdx = findIdx(['nip'], columns.length > 5 ? 5 : -1);

  return rows.map((r) => {
    const rawLevel = (levelIdx >= 0 ? r[levelIdx] : '').toLowerCase();
    const level: InfoOrgNode['level'] = rawLevel.includes('pimpinan')
      ? 'pimpinan'
      : rawLevel.includes('koordinator') || rawLevel.includes('kasi') || rawLevel.includes('kasubbag')
      ? 'koordinator'
      : 'pelaksana';
    const node: InfoOrgNode = {
      role: r[roleIdx] || 'Jabatan Unit',
      name: r[nameIdx] || '-',
      level,
    };
    if (divIdx >= 0 && r[divIdx]) node.division = r[divIdx];
    if (nipIdx >= 0 && r[nipIdx]) node.nip = r[nipIdx];
    return node;
  });
}

function formatErrorMsg(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (raw.includes('Missing or insufficient permissions') || raw.includes('permission-denied')) {
    return 'Akses ditolak oleh aturan keamanan Firestore. Pastikan akun Anda aktif sebagai Super Admin atau Operator Seksi yang sesuai dengan unit data ini.';
  }
  return raw || 'Terjadi kesalahan saat memproses data Menu Informasi.';
}

export function InformasiManagerPanel({
  controlledUnitId,
  controlledSectionId,
  compact = false,
}: InformasiManagerPanelProps) {
  const {
    user,
    isAdmin,
    isOperatorSeksi,
    assignedUnitId,
    assignedUnitTitle,
    myVerifiedEmployee,
    infoUnits,
    cloudInfoSections,
  } = useAuthRole();

  const authorizedUnits = useMemo<InformasiUnitConfig[]>(() => {
    if (isAdmin) return infoUnits;
    if (isOperatorSeksi && assignedUnitId && assignedUnitId !== 'all') {
      const matched = getInformasiUnitBySeksiId(assignedUnitId);
      if (matched) {
        return infoUnits.filter((u) => u.id === matched.id);
      }
    }
    return [];
  }, [isAdmin, isOperatorSeksi, assignedUnitId, infoUnits]);

  const [selectedUnitId, setSelectedUnitId] = useState<InformasiUnitId>(
    controlledUnitId || authorizedUnits[0]?.id || 'kepegawaian'
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    controlledSectionId || authorizedUnits[0]?.sections[0]?.id || 'data-asn-kemenag'
  );

  useEffect(() => {
    if (controlledUnitId) {
      setSelectedUnitId(controlledUnitId);
    } else if (
      authorizedUnits.length > 0 &&
      !authorizedUnits.some((u) => u.id === selectedUnitId)
    ) {
      setSelectedUnitId(authorizedUnits[0].id);
    }
  }, [controlledUnitId, authorizedUnits, selectedUnitId]);

  const activeUnit = useMemo(() => {
    return (
      authorizedUnits.find((u) => u.id === selectedUnitId) || authorizedUnits[0] || null
    );
  }, [authorizedUnits, selectedUnitId]);

  useEffect(() => {
    if (!activeUnit) return;
    if (
      controlledSectionId &&
      activeUnit.sections.some((s) => s.id === controlledSectionId)
    ) {
      setSelectedSectionId(controlledSectionId);
    } else if (!activeUnit.sections.some((s) => s.id === selectedSectionId)) {
      setSelectedSectionId(activeUnit.sections[0]?.id || '');
    }
  }, [activeUnit, controlledSectionId, selectedSectionId]);

  const activeSection = useMemo(() => {
    if (!activeUnit) return null;
    return (
      activeUnit.sections.find((s) => s.id === selectedSectionId) ||
      activeUnit.sections[0] ||
      null
    );
  }, [activeUnit, selectedSectionId]);

  const [editColumns, setEditColumns] = useState<string[]>([]);
  const [editRows, setEditRows] = useState<string[][]>([]);
  const [editFootnote, setEditFootnote] = useState<string>('');
  const [isOrgMode, setIsOrgMode] = useState<boolean>(false);
  const [showEditorGrid, setShowEditorGrid] = useState<boolean>(!compact);
  const [pendingImport, setPendingImport] = useState<ParsedExcelSectionResult | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeSection) return;
    const formatted = formatSectionRowsForEdit(activeSection);
    setEditColumns(formatted.columns);
    setEditRows(formatted.rows);
    setEditFootnote(activeSection.footnote || '');
    setIsOrgMode(formatted.isOrgMode);
    setPendingImport(null);
  }, [activeUnit?.id, activeSection?.id, activeSection?.updatedAt, activeSection?.rows?.length]);

  if (!user || authorizedUnits.length === 0 || !activeUnit || !activeSection) {
    return null;
  }

  const hasCloudOverride = cloudInfoSections.some(
    (c) => c.seksiUnitId === activeUnit.seksiUnitId && c.sectionId === activeSection.id
  );

  const actorName = isAdmin
    ? 'Super Admin Kemenag Mura'
    : myVerifiedEmployee?.fullName ||
      `Operator ${assignedUnitTitle || activeUnit.shortTitle}`;

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg('');
    setFeedback('');
    try {
      const parsed = await parseExcelFileForSection(file, activeSection);
      setPendingImport(parsed);
      setShowEditorGrid(true);
    } catch (err) {
      setErrorMsg(formatErrorMsg(err));
    }
  };

  const handleApplyAndSaveImport = async (saveNow: boolean) => {
    if (!pendingImport) return;
    setEditColumns(pendingImport.columns);
    setEditRows(pendingImport.rows);

    if (!saveNow) {
      setPendingImport(null);
      setFeedback(
        `Berhasil memuat ${pendingImport.rows.length} baris dari sheet "${pendingImport.sheetName}" ke editor. Silakan periksa lalu klik Simpan ke Portal.`
      );
      return;
    }

    setBusy(true);
    setErrorMsg('');
    setFeedback('');
    try {
      const updatedMetrics = activeSection.metrics.map((m, idx) =>
        idx === 0
          ? {
              ...m,
              value: `${pendingImport.rows.length} Data`,
            }
          : m
      );

      await saveInfoSectionData({
        seksiUnitId: activeUnit.seksiUnitId as SeksiUnitId,
        infoUnitId: activeUnit.id,
        sectionId: activeSection.id,
        sectionLabel: activeSection.label,
        title: activeSection.title,
        subtitle: activeSection.subtitle,
        columns: pendingImport.columns,
        rows: pendingImport.rows,
        metrics: updatedMetrics,
        orgNodes: isOrgMode
          ? pendingImport.orgNodes || rowsToOrgNodes(pendingImport.columns, pendingImport.rows)
          : undefined,
        footnote: editFootnote,
        updatedByName: actorName,
      });

      setPendingImport(null);
      setFeedback(
        `Impor Excel berhasil! ${pendingImport.rows.length} baris untuk "${activeUnit.shortTitle} → ${activeSection.label}" telah disimpan dan langsung tampil di Menu Informasi.`
      );
    } catch (err) {
      setErrorMsg(formatErrorMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveManual = async () => {
    setBusy(true);
    setErrorMsg('');
    setFeedback('');
    try {
      const cleanRows = editRows.filter((r) => r.some((cell) => cell.trim().length > 0));
      const updatedMetrics = activeSection.metrics.map((m, idx) =>
        idx === 0
          ? {
              ...m,
              value: `${cleanRows.length} Data`,
            }
          : m
      );

      await saveInfoSectionData({
        seksiUnitId: activeUnit.seksiUnitId as SeksiUnitId,
        infoUnitId: activeUnit.id,
        sectionId: activeSection.id,
        sectionLabel: activeSection.label,
        title: activeSection.title,
        subtitle: activeSection.subtitle,
        columns: editColumns,
        rows: cleanRows,
        metrics: updatedMetrics,
        orgNodes: isOrgMode ? rowsToOrgNodes(editColumns, cleanRows) : undefined,
        footnote: editFootnote,
        updatedByName: actorName,
      });

      setFeedback(
        `Perubahan data "${activeUnit.shortTitle} → ${activeSection.label}" berhasil disimpan ke portal.`
      );
    } catch (err) {
      setErrorMsg(formatErrorMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResetDefault = async () => {
    setBusy(true);
    setErrorMsg('');
    setFeedback('');
    try {
      await resetInfoSectionData(activeUnit.seksiUnitId as SeksiUnitId, activeSection.id);
      setPendingImport(null);
      setFeedback(
        `Data "${activeUnit.shortTitle} → ${activeSection.label}" dikembalikan ke data bawaan portal.`
      );
    } catch (err) {
      setErrorMsg(formatErrorMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAddRow = () => {
    const nextIdx = String(editRows.length + 1);
    const blankRow = editColumns.map((_, i) => (i === 0 ? nextIdx : ''));
    setEditRows((prev) => [...prev, blankRow]);
    setShowEditorGrid(true);
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    setEditRows((prev) =>
      prev.map((row, ri) =>
        ri === rIdx ? row.map((cell, ci) => (ci === cIdx ? val : cell)) : row
      )
    );
  };

  const handleRemoveRow = (rIdx: number) => {
    setEditRows((prev) => prev.filter((_, ri) => ri !== rIdx));
  };

  return (
    <div className="rounded-2xl border border-teal-300 dark:border-teal-800 bg-teal-50/40 dark:bg-slate-900/90 p-4 sm:p-6 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-teal-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-teal-800 dark:text-teal-300">
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>
              {isAdmin
                ? 'Pengelola Menu Informasi (Super Admin · Semua Seksi)'
                : `Pengelola Menu Informasi — Kewenangan ${activeUnit.shortTitle}`}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Ekspor, Impor Excel &amp; Pembaruan Data {activeUnit.shortTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Unggah file Excel (.xlsx / .xls / .csv) atau edit baris langsung untuk mengisi data{' '}
            <strong>{activeSection.label}</strong>. Data tersimpan otomatis ke database portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeUnit.externalUrl && (
            <a
              href={activeUnit.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-600/40 bg-white dark:bg-slate-950 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Buka SIPENDISMURA</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={() => exportUnitWorkbookToExcel(activeUnit)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-700/40 bg-white dark:bg-slate-950 text-xs font-bold text-teal-900 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Semua Submenu ({activeUnit.shortTitle})</span>
          </button>
        </div>
      </div>

      {/* Unit & Section Selectors (when not locked by parent view) */}
      {!controlledUnitId && (
        <div className="space-y-3">
          {authorizedUnits.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {authorizedUnits.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`menu-expand-btn px-3.5 py-2 rounded-xl text-xs font-bold ${
                    u.id === activeUnit.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/70'
                  }`}
                >
                  <span className="menu-expand-label">{u.shortTitle}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {activeUnit.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSectionId(sec.id)}
                className={`menu-expand-btn px-3.5 py-2 rounded-xl text-xs font-bold border ${
                  sec.id === activeSection.id
                    ? 'border-emerald-700 bg-emerald-700 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:bg-emerald-50/60'
                }`}
              >
                <span className="menu-expand-label">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Excel Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => downloadTemplateForSection(activeUnit, activeSection)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Unduh Template Excel</span>
          </button>

          <button
            type="button"
            onClick={() => exportSectionToExcel(activeUnit, activeSection)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => void handleExcelFileChange(e)}
            className="hidden"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor dari Excel (.xlsx)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEditorGrid((prev) => !prev)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {showEditorGrid ? 'Tutup Editor Tabel' : 'Edit Baris Manual'}
          </button>

          {hasCloudOverride && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleResetDefault()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bawaan</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback & Error Banners */}
      {feedback && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="font-bold hover:underline shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-4 py-3 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="break-words [overflow-wrap:anywhere]">{errorMsg}</span>
        </div>
      )}

      {/* Pending Excel Import Preview */}
      {pendingImport && (
        <div className="rounded-xl border-2 border-teal-500 bg-white dark:bg-slate-950 p-4 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Pratinjau Impor File Excel
              </p>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Sheet &ldquo;{pendingImport.sheetName}&rdquo; · {pendingImport.rows.length} baris &times;{' '}
                {pendingImport.columns.length} kolom
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleApplyAndSaveImport(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{busy ? 'Menyimpan...' : 'Terapkan & Simpan ke Portal'}</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleApplyAndSaveImport(false)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Muat ke Editor Saja
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPendingImport(null)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Batal
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900">
                  {pendingImport.columns.map((col, ci) => (
                    <th
                      key={`imp-col-${ci}`}
                      className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {pendingImport.rows.slice(0, 5).map((row, ri) => (
                  <tr key={`imp-row-${ri}`}>
                    {row.map((cell, ci) => (
                      <td
                        key={`imp-cell-${ri}-${ci}`}
                        className="px-3 py-2 text-slate-700 dark:text-slate-300"
                      >
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pendingImport.rows.length > 5 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Menampilkan 5 baris pertama dari total {pendingImport.rows.length} baris yang akan diimpor.
            </p>
          )}
        </div>
      )}

      {/* Inline Editable Data Grid */}
      {showEditorGrid && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Editor Data: {activeSection.label} ({editRows.length} Baris)
              </h4>
              {isOrgMode && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kolom Level isi dengan: <code>pimpinan</code>, <code>koordinator</code>, atau{' '}
                  <code>pelaksana</code>.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-700/40 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSaveManual()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{busy ? 'Menyimpan...' : 'Simpan ke Portal'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900">
                <tr>
                  {editColumns.map((col, ci) => (
                    <th
                      key={`ed-col-${ci}`}
                      className="px-2.5 py-2 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="px-2.5 py-2 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 text-center w-14">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {editRows.map((row, rIdx) => (
                  <tr key={`ed-row-${rIdx}`}>
                    {editColumns.map((_, cIdx) => (
                      <td key={`ed-cell-${rIdx}-${cIdx}`} className="p-1.5">
                        <input
                          type="text"
                          value={row[cIdx] ?? ''}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          className={`w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 ${
                            cIdx === 0 ? 'w-14 font-mono-tabular' : 'min-w-[130px]'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(rIdx)}
                        title="Hapus baris"
                        className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Catatan Kaki / Sumber Data (Opsional)
            </label>
            <input
              type="text"
              maxLength={400}
              value={editFootnote}
              onChange={(e) => setEditFootnote(e.target.value)}
              placeholder="Contoh: Sumber data resmi Seksi Bimas Islam Kankemenag Murung Raya."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
