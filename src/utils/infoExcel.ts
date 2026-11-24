import readXlsxFile from 'read-excel-file/browser';
import writeXlsxFile, { type Sheet, type SheetData } from 'write-excel-file/browser';
import type {
  InfoOrgNode,
  InfoSection,
  InformasiUnitConfig,
} from '@/src/data/informasiData';
import { neutralizeSpreadsheetCell } from '@/src/utils/security';

const MAX_SPREADSHEET_FILE_BYTES = 5 * 1024 * 1024; // 5 MB safety cap

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
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'data'
  );
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

function buildSafeSheetPayload(
  columns: string[],
  rows: string[][]
): { data: SheetData; columnWidths: { width: number }[] } {
  const headerRow = columns.map((col) => ({
    value: neutralizeSpreadsheetCell(col),
    fontWeight: 'bold' as const,
  }));

  const bodyRows = rows.map((row) =>
    columns.map((_, colIdx) => ({
      value: neutralizeSpreadsheetCell(row?.[colIdx] ?? ''),
    }))
  );

  const columnWidths = columns.map((col, colIdx) => {
    let maxLen = col.length;
    for (let r = 0; r < rows.length; r += 1) {
      const cellVal = String(rows[r]?.[colIdx] ?? '');
      if (cellVal.length > maxLen) maxLen = cellVal.length;
    }
    return { width: Math.min(48, Math.max(12, maxLen + 3)) };
  });

  return {
    data: [headerRow, ...bodyRows],
    columnWidths,
  };
}

export function exportSectionToExcel(
  unit: InformasiUnitConfig,
  section: InfoSection
): void {
  const { columns, rows } = sectionToSheetMatrix(section);
  const { data, columnWidths } = buildSafeSheetPayload(columns, rows);
  const fileName = `Informasi_${sanitizeFileSlug(unit.shortTitle)}_${sanitizeFileSlug(
    section.label
  )}.xlsx`;

  void writeXlsxFile(data, {
    sheet: sanitizeSheetName(section.label),
    columns: columnWidths,
  }).toFile(fileName);
}

export function downloadTemplateForSection(
  unit: InformasiUnitConfig,
  section: InfoSection
): void {
  const { columns, rows } = sectionToSheetMatrix(section);
  const sampleRows =
    rows.length > 0
      ? rows.slice(0, 2)
      : [columns.map((_, i) => (i === 0 ? '1' : `Contoh ${columns[i]}`))];
  const { data, columnWidths } = buildSafeSheetPayload(columns, sampleRows);
  const fileName = `Template_${sanitizeFileSlug(unit.shortTitle)}_${sanitizeFileSlug(
    section.label
  )}.xlsx`;

  void writeXlsxFile(data, {
    sheet: sanitizeSheetName(section.label),
    columns: columnWidths,
  }).toFile(fileName);
}

export function exportUnitWorkbookToExcel(unit: InformasiUnitConfig): void {
  const usedNames = new Set<string>();
  const sheets: Sheet<File | Blob>[] = unit.sections.map((sec, idx) => {
    const { columns, rows } = sectionToSheetMatrix(sec);
    const { data, columnWidths } = buildSafeSheetPayload(columns, rows);
    let sheetName = sanitizeSheetName(sec.label);
    if (usedNames.has(sheetName)) {
      sheetName = sanitizeSheetName(`${sec.label.slice(0, 27)}_${idx + 1}`);
    }
    usedNames.add(sheetName);
    return {
      sheet: sheetName,
      data,
      columns: columnWidths,
    };
  });

  const fileName = `Informasi_Lengkap_${sanitizeFileSlug(unit.shortTitle)}.xlsx`;
  void writeXlsxFile(sheets).toFile(fileName);
}

/**
 * Safe RFC-4180 CSV parser (handles quoted cells, commas, semicolons, and escaped quotes)
 * without relying on vulnerable third-party spreadsheet parsers.
 */
function parseCsvTextToRows(text: string): string[][] {
  const cleanedText = text.replace(/^\uFEFF/, '');
  const firstLine = cleanedText.split(/\r?\n/, 1)[0] ?? '';
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? ';'
      : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanedText.length; i += 1) {
    const ch = cleanedText[i];
    const next = cleanedText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
      i += 1;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function formatCellValue(cell: unknown): string {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
    return cell.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return String(cell).trim();
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
  if (!file) {
    throw new Error('Pilih file Excel (.xlsx) atau CSV (.csv) terlebih dahulu.');
  }
  if (file.size === 0) {
    throw new Error('File yang dipilih kosong.');
  }
  if (file.size > MAX_SPREADSHEET_FILE_BYTES) {
    throw new Error('Ukuran file maksimal 5 MB untuk keamanan dan stabilitas impor data.');
  }

  const lowerName = file.name.toLowerCase();
  const isCsv = lowerName.endsWith('.csv') || file.type === 'text/csv';
  const isXlsx =
    lowerName.endsWith('.xlsx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (lowerName.endsWith('.xls') && !isXlsx) {
    throw new Error(
      'Format lama .xls tidak didukung demi keamanan. Simpan ulang file sebagai .xlsx atau .csv di Microsoft Excel / LibreOffice.'
    );
  }
  if (!isCsv && !isXlsx) {
    throw new Error('Format file harus .xlsx atau .csv.');
  }

  let matchedSheetName = sanitizeSheetName(targetSection.label);
  let rawAoa: unknown[][];

  if (isCsv) {
    const text = await file.text();
    rawAoa = parseCsvTextToRows(text);
    matchedSheetName = 'CSV';
  } else {
    const sheets = await readXlsxFile(file);
    if (!sheets || sheets.length === 0) {
      throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
    }

    const targetSanitized = sanitizeSheetName(targetSection.label).toLowerCase();
    const matchedSheet =
      sheets.find((s) => s.sheet.trim().toLowerCase() === targetSanitized) ||
      sheets.find((s) =>
        s.sheet.toLowerCase().includes(targetSection.label.toLowerCase().slice(0, 12))
      ) ||
      sheets[0];

    if (!matchedSheet || !Array.isArray(matchedSheet.data)) {
      throw new Error('Lembar kerja Excel tidak dapat dibaca.');
    }

    matchedSheetName = matchedSheet.sheet;
    rawAoa = matchedSheet.data;
  }

  const nonEmptyRows = rawAoa
    .map((row) =>
      Array.isArray(row) ? row.map((cell) => formatCellValue(cell)) : []
    )
    .filter((row) => row.some((cell) => cell.length > 0));

  if (nonEmptyRows.length === 0) {
    throw new Error(
      'File kosong. Pastikan baris pertama berisi nama kolom (header) dan baris berikutnya berisi data.'
    );
  }

  const headerRowRaw = nonEmptyRows[0];
  let lastNonEmptyCol = headerRowRaw.length - 1;
  while (lastNonEmptyCol >= 0 && !headerRowRaw[lastNonEmptyCol]) {
    lastNonEmptyCol -= 1;
  }

  const headerSlice = headerRowRaw
    .slice(0, Math.max(1, lastNonEmptyCol + 1))
    .slice(0, 20);
  const columns = headerSlice.map((col, idx) =>
    (col || `Kolom ${idx + 1}`).slice(0, 80)
  );

  if (columns.length === 0) {
    throw new Error('Header kolom pada baris pertama tidak ditemukan.');
  }

  const dataRows = nonEmptyRows
    .slice(1, 5001)
    .map((row) => columns.map((_, idx) => (row[idx] ?? '').slice(0, 300)))
    .filter((row) => row.some((cell) => cell.length > 0));

  if (dataRows.length === 0) {
    throw new Error(
      'File hanya berisi baris header tanpa baris data. Tambahkan minimal 1 baris data sebelum mengimpor.'
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
    const nameIdx = findIdx(
      ['nama', 'pejabat'],
      columns.length > 2 ? 2 : Math.min(1, columns.length - 1)
    );
    const levelIdx = findIdx(['level', 'tingkat'], columns.length > 3 ? 3 : -1);
    const divIdx = findIdx(
      ['bidang', 'tugas', 'divisi', 'keterangan'],
      columns.length > 4 ? 4 : -1
    );
    const nipIdx = findIdx(['nip'], columns.length > 5 ? 5 : -1);

    orgNodes = dataRows.map((r) => {
      const rawLevel = (levelIdx >= 0 ? r[levelIdx] : '').toLowerCase();
      const level: InfoOrgNode['level'] = rawLevel.includes('pimpinan')
        ? 'pimpinan'
        : rawLevel.includes('koordinator') ||
            rawLevel.includes('kasi') ||
            rawLevel.includes('kasubbag')
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
