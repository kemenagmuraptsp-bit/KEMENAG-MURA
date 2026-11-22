import { useRef, useState } from 'react';
import {
  Building2,
  ChevronDown,
  ExternalLink,
  Layers,
  Network,
  Search,
  Users,
} from 'lucide-react';
import { PageView } from '@/src/types';
import { InformasiUnitId } from '@/src/data/informasiData';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { InformasiManagerPanel } from '@/src/components/InformasiManagerPanel';

interface InformasiUnitViewProps {
  selectedUnitId: InformasiUnitId;
  selectedSectionId: string;
  onSelectUnit: (unitId: InformasiUnitId, sectionId?: string) => void;
  onNavigate: (view: PageView) => void;
}

export function InformasiUnitView({
  selectedUnitId,
  selectedSectionId,
  onSelectUnit,
}: InformasiUnitViewProps) {
  const { infoUnits, isAdmin, isOperatorSeksi, assignedUnitId } = useAuthRole();
  const [tableQuery, setTableQuery] = useState('');
  const sectionDataRef = useRef<HTMLDivElement | null>(null);

  const activeUnit =
    infoUnits.find((u) => u.id === selectedUnitId) || infoUnits[0];
  const activeSection =
    activeUnit.sections.find((s) => s.id === selectedSectionId) ||
    activeUnit.sections[0];

  const canManageActiveUnit =
    isAdmin || (isOperatorSeksi && assignedUnitId === activeUnit.seksiUnitId);

  const hasOrgNodes = Boolean(activeSection.orgNodes && activeSection.orgNodes.length > 0);

  const queryLower = tableQuery.trim().toLowerCase();
  const filteredRows = activeSection.rows
    ? queryLower
      ? activeSection.rows.filter((row) =>
          row.some((cell) => cell.toLowerCase().includes(queryLower))
        )
      : activeSection.rows
    : [];

  const handleUnitChange = (unitId: InformasiUnitId) => {
    setTableQuery('');
    onSelectUnit(unitId);
  };

  const handleSectionChange = (sectionId: string) => {
    setTableQuery('');
    onSelectUnit(activeUnit.id, sectionId);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        sectionDataRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Header matching SubViews PageHeader */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Informasi Publik Satuan Kerja · Kankemenag Kab. Murung Raya
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeUnit.title}
            </h1>
            {activeUnit.externalUrl && (
              <a
                href={activeUnit.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors self-start"
              >
                <span>Buka Aplikasi SIPENDISMURA</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {activeUnit.description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* SATU BORDER TERPADU: Menu Informasi Seksi (Tier 1) + Pembatas + Menu Data Seksi (Tier 2) */}
        <div className="rounded-2xl border-2 border-[#0b1d3d]/30 dark:border-sky-300/25 shadow-sm overflow-hidden">
          {/* TIER 1: Menu Informasi Seksi (Transparan Navy Jelas) */}
          <div className="bg-[#0b1d3d]/75 dark:bg-[#071226]/80 backdrop-blur-md p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/20 pb-2.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-200">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Menu Informasi Seksi / Satuan Kerja</span>
              </div>
              <p className="text-xs text-sky-100/85">
                Seksi Terpilih:{' '}
                <strong className="text-white font-bold">
                  {activeUnit.shortTitle}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {infoUnits.map((unit) => {
                const isSelected = unit.id === activeUnit.id;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => handleUnitChange(unit.id)}
                    className={`group menu-expand-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/90 border-emerald-400 text-slate-950 shadow-xs'
                        : 'bg-white/15 border-sky-200/30 text-white hover:bg-white/25 hover:border-sky-200/55'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className="menu-expand-label">{unit.shortTitle}</span>
                  </button>
                );
              })}

              <span
                aria-hidden="true"
                className="hidden sm:block h-6 w-px bg-sky-200/30 mx-0.5"
              />

              <a
                href="https://sipendismura.my.id"
                target="_blank"
                rel="noopener noreferrer"
                className="group menu-expand-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-amber-300/60 bg-amber-400/20 text-amber-100 hover:bg-amber-400/30 hover:border-amber-300 whitespace-nowrap transition-all"
              >
                <span className="menu-expand-label">SIPENDISMURA</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Garis Pembatas Pembeda dalam Satu Border */}
          <div className="px-4 sm:px-5 py-1.5 bg-[#0b1d3d]/20 dark:bg-slate-900/80 border-y border-emerald-700/25 dark:border-sky-300/20 flex items-center gap-2">
            <ChevronDown className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b1d3d] dark:text-sky-200">
              Menu Data Seksi · {activeUnit.shortTitle}
            </span>
          </div>

          {/* TIER 2: Menu Data di Dalam Seksi (Transparan Emerald Jelas) */}
          <div className="bg-emerald-700/20 dark:bg-emerald-900/45 backdrop-blur-md p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {activeUnit.sections.map((section, idx) => {
                const isTabActive = section.id === activeSection.id;
                const isOrgTab = Boolean(section.orgNodes && section.orgNodes.length > 0);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionChange(section.id)}
                    className={`menu-expand-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                      isTabActive
                        ? 'bg-emerald-700/90 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-500 text-white shadow-xs'
                        : 'border-emerald-700/30 dark:border-emerald-400/30 bg-white/85 dark:bg-slate-950/75 text-slate-800 dark:text-slate-100 hover:border-emerald-600 hover:bg-white dark:hover:bg-slate-900 hover:text-emerald-800 dark:hover:text-emerald-300'
                    }`}
                  >
                    <span
                      className={`font-mono-tabular text-[11px] ${
                        isTabActive
                          ? 'text-emerald-200'
                          : 'text-emerald-700/80 dark:text-emerald-400/80'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {isOrgTab && <Network className="w-3.5 h-3.5 shrink-0 opacity-85" />}
                    <span className="menu-expand-label">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Role-scoped Excel & Data Management Panel for Super Admin & Authorized Operator Seksi */}
        {canManageActiveUnit && (
          <InformasiManagerPanel
            controlledUnitId={activeUnit.id}
            controlledSectionId={activeSection.id}
            compact
          />
        )}

        {/* Active Section Detail Card */}
        <div
          id="seksi-data-panel"
          ref={sectionDataRef}
          className="scroll-mt-32 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6 shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1.5 max-w-3xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {activeSection.updatedAt}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeSection.subtitle}
              </p>
            </div>
          </div>

          {/* Summary KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeSection.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 space-y-1"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {metric.label}
                </p>
                <p className="text-lg font-extrabold text-emerald-800 dark:text-emerald-400 font-mono-tabular">
                  {metric.value}
                </p>
                {metric.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {metric.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Tabular Data View */}
          {!hasOrgNodes && activeSection.columns && activeSection.rows && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Menampilkan{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {filteredRows.length}
                  </strong>{' '}
                  dari {activeSection.rows.length} baris data
                </p>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableQuery}
                    onChange={(e) => setTableQuery(e.target.value)}
                    placeholder={`Cari ${activeSection.label.toLowerCase()}...`}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-emerald-950 text-white">
                      {activeSection.columns.map((col, colIdx) => (
                        <th
                          key={`${col}-${colIdx}`}
                          className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={activeSection.columns.length}
                          className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                        >
                          Data dengan kata kunci &ldquo;{tableQuery}&rdquo; tidak ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rIdx) => (
                        <tr
                          key={`${activeSection.id}-row-${rIdx}`}
                          className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={`${activeSection.id}-cell-${rIdx}-${cIdx}`}
                              className={`px-4 py-3 align-top ${
                                cIdx === 0
                                  ? 'font-mono-tabular font-semibold text-slate-500 dark:text-slate-400 w-12'
                                  : cIdx === 1
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Organizational Structure View */}
          {hasOrgNodes && activeSection.orgNodes && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                <Network className="w-4 h-4" />
                <span>Susunan Organisasi &amp; Tata Kerja</span>
              </div>

              <div className="space-y-4">
                {activeSection.orgNodes
                  .filter((n) => n.level === 'pimpinan')
                  .map((node, idx) => (
                    <div
                      key={`org-pim-${idx}-${node.role}`}
                      className="rounded-xl border-2 border-emerald-700 bg-emerald-950 text-white p-5 text-center max-w-xl mx-auto shadow-sm"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                        {node.role}
                      </p>
                      <p className="text-base sm:text-lg font-extrabold mt-1">
                        {node.name}
                      </p>
                      {node.nip && (
                        <p className="text-[11px] font-mono-tabular text-emerald-200/90 mt-0.5">
                          NIP {node.nip}
                        </p>
                      )}
                      {node.division && (
                        <p className="text-xs text-emerald-100/80 mt-1">
                          {node.division}
                        </p>
                      )}
                    </div>
                  ))}

                <div className="w-px h-5 bg-emerald-500/60 mx-auto" aria-hidden="true" />

                {activeSection.orgNodes
                  .filter((n) => n.level === 'koordinator')
                  .map((node, idx) => (
                    <div
                      key={`org-koor-${idx}-${node.role}`}
                      className="rounded-xl border border-emerald-600/50 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-center max-w-xl mx-auto"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                        {node.role}
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {node.name}
                      </p>
                      {node.nip && (
                        <p className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400 mt-0.5">
                          NIP {node.nip}
                        </p>
                      )}
                      {node.division && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {node.division}
                        </p>
                      )}
                    </div>
                  ))}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {activeSection.orgNodes
                    .filter((n) => n.level === 'pelaksana')
                    .map((node, idx) => (
                      <div
                        key={`org-pel-${idx}-${node.role}`}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-1.5"
                      >
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>Pelaksana / Fungsional</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {node.role}
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {node.name}
                        </p>
                        {node.nip && (
                          <p className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
                            NIP {node.nip}
                          </p>
                        )}
                        {node.division && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {node.division}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeSection.footnote && (
            <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
              {activeSection.footnote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
