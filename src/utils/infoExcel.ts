import * as XLSX from 'xlsx';
import type {
  InfoOrgNode,
  InfoSection,
  InformasiUnitConfig,
} from '@/src/data/informasiData';

const ORG_COLUMNS = [
  'No',
  'Jabatan',
  'Nama Pejabat',
  'Level (pimpinan/koordinator/pelaksana)',
  'Bidang / Tugas',
  'NIP',
];

function sanitizeSheetName(raw: string): string {
  const cleaned = raw.replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim();
  return (cleaned || 'Data').slice(0, 31);
}

function sanitizeFileSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'data';
}

function sectionToSheetMatrix(section: InfoSection): {
  columns: string[];
  rows: string[][];
  isOrg: boolean;
} {
  if (section.orgNodes && section.orgNodes.length > 0 && !section.columns) {
    return {
      columns: ORG_COLUMNS,
      rows: section.orgNodes.map((n, idx) => [
        String(idx + 1),
        n.role,
        n.name,
        n.level,
        n.division || '',
        n.nip || '',
      ]),
      isOrg: true,
    };
  }
  const columns =
    section.columns && section.columns.length > 0
      ? section.columns
      : ['No', 'Uraian', 'Keterangan'];
  const rows = section.rows || [];
  return { columns, rows, isOrg: false };
}

function buildWorksheet(columns: string[], rows: string[][]): XLSX.WorkSheet {
  const aoa: string[][] = [columns, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = columns.map((col, colIdx) => {
    let maxLen = col.length;
    for (let r = 0; r < rows.length; r += 1) {
      const cellVal = String(rows[r]?.[colIdx] ?? '');
      if (cellVal.length > maxLen) maxLen = cellVal.length;
    }
    return { wch: Math.min(48, Math.max(10, maxLen + 3)) };
  });
  return ws;
}

export function exportSectionToExcel(
  unit: InformasiUnitConfig,
  section: InfoSection
): void {
  const { columns, rows } = sectionToSheetMatrix(section);
  const wb = XLSX.utils.book_new();
  const ws = buildWorksheet(columns, rows);
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(section.label));

  const fileName = `Informasi_${sanitizeFileSlug(unit.shortTitle)}_${sanitizeFileSlug(
    section.label
  )}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadTemplateForSection(
  unit: InformasiUnitConfig,
  section: InfoSection
): void {
  const { columns, rows } = sectionToSheetMatrix(section);
  const sampleRows = rows.length > 0 ? rows.slice(0, 2) : [columns.map((_, i) => (i === 0 ? '1' : `Contoh ${columns[i]}`))];
  const wb = XLSX.utils.book_new();
  const ws = buildWorksheet(columns, sampleRows);
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(section.label));

  const fileName = `Template_${sanitizeFileSlug(unit.shortTitle)}_${sanitizeFileSlug(
    section.label
  )}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportUnitWorkbookToExcel(unit: InformasiUnitConfig): void {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  unit.sections.forEach((sec, idx) => {
    const { columns, rows } = sectionToSheetMatrix(sec);
    const ws = buildWorksheet(columns, rows);
    let sheetName = sanitizeSheetName(sec.label);
    if (usedNames.has(sheetName)) {
      sheetName = sanitizeSheetName(`${sec.label.slice(0, 27)}_${idx + 1}`);
    }
    usedNames.add(sheetName);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const fileName = `Informasi_Lengkap_${sanitizeFileSlug(unit.shortTitle)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export interface ParsedExcelSectionResult {
  sheetName: string;
  columns: string[];
  rows: string[][];
  orgNodes?: InfoOrgNode[];
}

export async function parseExcelFileForSection(
  file: File,
  targetSection: InfoSection
): Promise<ParsedExcelSectionResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
  }

  const targetSanitized = sanitizeSheetName(targetSection.label).toLowerCase();
  const matchedSheetName =
    wb.SheetNames.find(
      (name) => name.trim().toLowerCase() === targetSanitized
    ) ||
    wb.SheetNames.find((name) =>
      name.toLowerCase().includes(targetSection.label.toLowerCase().slice(0, 12))
    ) ||
    wb.SheetNames[0];

  const ws = wb.Sheets[matchedSheetName];
  if (!ws) {
    throw new Error('Lembar kerja Excel tidak dapat dibaca.');
  }

  const rawAoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  const nonEmptyRows = rawAoa
    .map((row) =>
      Array.isArray(row) ? row.map((cell) => String(cell ?? '').trim()) : []
    )
    .filter((row) => row.some((cell) => cell.length > 0));

  if (nonEmptyRows.length === 0) {
    throw new Error(
      'File Excel kosong. Pastikan baris pertama berisi nama kolom (header) dan baris berikutnya berisi data.'
    );
  }

  const headerRowRaw = nonEmptyRows[0];
  let lastNonEmptyCol = headerRowRaw.length - 1;
  while (lastNonEmptyCol >= 0 && !headerRowRaw[lastNonEmptyCol]) {
    lastNonEmptyCol -= 1;
  }

  const headerSlice = headerRowRaw.slice(0, Math.max(1, lastNonEmptyCol + 1)).slice(0, 20);
  const columns = headerSlice.map((col, idx) =>
    (col || `Kolom ${idx + 1}`).slice(0, 80)
  );

  if (columns.length === 0) {
    throw new Error('Header kolom pada baris pertama Excel tidak ditemukan.');
  }

  const dataRows = nonEmptyRows
    .slice(1, 5001)
    .map((row) => columns.map((_, idx) => (row[idx] ?? '').slice(0, 300)))
    .filter((row) => row.some((cell) => cell.length > 0));

  if (dataRows.length === 0) {
    throw new Error(
      'File Excel hanya berisi baris header tanpa baris data. Tambahkan minimal 1 baris data sebelum mengimpor.'
    );
  }

  const isOrgSection =
    targetSection.id === 'struktur-organisasi' ||
    Boolean(targetSection.orgNodes && targetSection.orgNodes.length > 0);

  let orgNodes: InfoOrgNode[] | undefined;
  if (isOrgSection) {
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

    orgNodes = dataRows.map((r) => {
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

  return {
    sheetName: matchedSheetName,
    columns,
    rows: dataRows,
    orgNodes,
  };
}
