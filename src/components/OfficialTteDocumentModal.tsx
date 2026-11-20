import { BadgeCheck, CheckCircle2, FileCheck2, Printer, ShieldCheck, X } from 'lucide-react';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';
import { OFFICE_INFO } from '@/src/data/kemenagData';
import type { CloudPtspTicketRecord } from '@/src/firebase';
import { buildOfficialTteDocument } from '@/src/utils/serviceDocumentTemplates';

function DeterministicQrSvg({ seed }: { seed: string }) {
  const size = 21;
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) >>> 0;
  }

  const isFinder = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const finder = isFinder(r, c);
      if (finder !== null) {
        if (finder) rects.push({ x: c, y: r });
        continue;
      }
      const mix = ((hash ^ (r * 37 + c * 17)) * 2654435761) >>> 0;
      if ((mix & 3) === 0 || (mix & 5) === 5) {
        rects.push({ x: c, y: r });
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-16 h-16 shrink-0 rounded bg-white p-1 border border-slate-300"
      aria-label="Kode QR Verifikasi TTE"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {rects.map((pt) => (
        <rect
          key={`${pt.x}-${pt.y}`}
          x={pt.x}
          y={pt.y}
          width={1}
          height={1}
          fill="#064e3b"
        />
      ))}
    </svg>
  );
}

export function OfficialTteDocumentModal({
  ticket,
  mode,
  onClose,
}: {
  ticket: CloudPtspTicketRecord | null;
  mode: 'resi' | 'tte';
  onClose: () => void;
}) {
  if (!ticket) return null;

  const docData = buildOfficialTteDocument(ticket);
  const displayStatus =
    ticket.status === 'Diproses Verifikasi' ? 'Menunggu Verifikasi' : ticket.status;

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto print-tte-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'tte'
          ? `Dokumen TTE ${docData.docHeading}`
          : `Resi Tiket ${ticket.ticketNo}`
      }
    >
      <div
        className={`w-full ${
          mode === 'tte' ? 'max-w-4xl' : 'max-w-xl'
        } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 print-tte-shell`}
      >
        {/* Modal Toolbar (Hidden when printing) */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            {mode === 'tte' ? (
              <FileCheck2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            ) : (
              <Printer className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {mode === 'tte'
                  ? docData.isEndorsed
                    ? 'Dokumen Resmi Bertanda Tangan Elektronik (TTE Sah)'
                    : 'Pratinjau Draf Dokumen TTE Pimpinan'
                  : 'Tanda Terima / Resi Permohonan PTSP'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {ticket.ticketNo} · {ticket.serviceTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Tutup dokumen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-4 sm:p-7 bg-slate-100 dark:bg-slate-950/60 print:p-0 print:bg-white">
          {mode === 'resi' ? (
            <div className="print-tte-sheet bg-white text-slate-900 border-2 border-slate-800 rounded-xl p-6 space-y-4 text-xs shadow-sm print:shadow-none">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center gap-4">
                <KemenagEmblem className="w-12 h-12 shrink-0" />
                <div className="text-center flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                    Kementerian Agama Republik Indonesia
                  </p>
                  <p className="text-sm font-extrabold uppercase text-slate-900">
                    {OFFICE_INFO.officialName}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Pelayanan Terpadu Satu Pintu (PTSP) · {OFFICE_INFO.shortAddress}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block">Nomor Resi PTSP</span>
                  <span className="font-mono-tabular font-extrabold text-sm text-emerald-800">
                    {ticket.ticketNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tanggal Pengajuan</span>
                  <span className="font-semibold text-slate-900">{ticket.submittedAtLabel}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Jenis Layanan Dipilih</span>
                  <span className="font-bold text-slate-900">{ticket.serviceTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Unit / Seksi Tujuan</span>
                  <span className="font-semibold text-slate-900">
                    {ticket.dispatchedUnitTitle || ticket.unitTitle}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kelengkapan Berkas</span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {ticket.verifiedDocsCount ?? 0} dari {ticket.totalDocsCount ?? docData.verifiedRequirements.length} valid
                    {typeof ticket.uploadedDocsCount === 'number'
                      ? ` · ${ticket.uploadedDocsCount} berkas terunggah`
                      : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nama Pemohon</span>
                  <span className="font-semibold text-slate-900">
                    {ticket.applicantName}
                    {ticket.nip ? ` (NIP ${ticket.nip})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Instansi / Kontak</span>
                  <span className="font-semibold text-slate-900">
                    {ticket.institution || ticket.phone}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Status Terakhir</span>
                  <span className="font-bold text-emerald-800">{displayStatus}</span>
                </div>
                {ticket.adminNote && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block">Catatan Petugas</span>
                    <span className="text-slate-800">{ticket.adminNote}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="print-tte-sheet bg-white text-slate-900 border border-slate-300 rounded-xl p-6 sm:p-10 space-y-6 shadow-sm print:border-0 print:rounded-none print:shadow-none font-serif-editorial">
              {/* Banner status draf jika belum TTE Sah */}
              {!docData.isEndorsed && (
                <div className="font-sans rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 flex items-center gap-2 print:hidden">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    <strong>Draf Pratinjau Sebelum Pengesahan TTE:</strong> Dokumen ini akan
                    berstatus sah setelah Pimpinan menekan tombol{' '}
                    <strong>Sahkan TTE Pimpinan (Selesai)</strong>.
                  </span>
                </div>
              )}

              {/* KOP SURAT RESMI KEMENTERIAN AGAMA */}
              <header className="border-b-[3px] border-double border-slate-900 pb-4 flex items-center gap-4">
                <KemenagEmblem className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />
                <div className="flex-1 text-center space-y-0.5 font-sans">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900">
                    Kementerian Agama Republik Indonesia
                  </p>
                  <p className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-slate-950">
                    {OFFICE_INFO.officialName}
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-700">
                    {docData.unitSectionName}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {OFFICE_INFO.address} · Telp. {OFFICE_INFO.phone}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Email: {OFFICE_INFO.email} · Layanan PTSP: {OFFICE_INFO.ptspEmail}
                  </p>
                </div>
              </header>

              {/* JUDUL & NOMOR SURAT RESMI */}
              <section className="text-center space-y-1 pt-1">
                <h1 className="font-sans text-base sm:text-lg font-extrabold uppercase tracking-wide underline underline-offset-4 text-slate-950">
                  {docData.docHeading}
                </h1>
                <p className="font-mono-tabular text-xs font-bold text-slate-800">
                  Nomor: {docData.docNumber}
                </p>
                <p className="font-sans text-[11px] text-slate-600">
                  {docData.docSubHeading}
                </p>
              </section>

              {/* DASAR HUKUM & PEMBUKA */}
              <section className="space-y-3 text-[13px] leading-relaxed text-slate-900">
                <div className="space-y-1">
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                    Dasar &amp; Referensi Verifikasi:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-[13px]">
                    {docData.legalBasis.map((basis, idx) => (
                      <li key={idx}>{basis}</li>
                    ))}
                  </ol>
                </div>

                <p className="text-justify pt-1">{docData.openingParagraph}</p>
              </section>

              {/* TABEL DATA IDENTITAS PEMOHON & LAYANAN */}
              <section className="border border-slate-300 rounded-lg overflow-hidden font-sans text-xs">
                <table className="w-full border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    {docData.detailRows.map((row) => (
                      <tr key={row.label} className="align-top">
                        <td className="w-1/3 sm:w-56 px-3.5 py-2.5 bg-slate-50 font-semibold text-slate-700">
                          {row.label}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium text-slate-950">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* DIKTUM / KETENTUAN LAYANAN */}
              <section className="space-y-2 text-[13px] leading-relaxed text-slate-900">
                <p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
                  {docData.decisionTitle}
                </p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  {docData.decisionClauses.map((clause, idx) => (
                    <li key={idx} className="text-justify">
                      {clause}
                    </li>
                  ))}
                </ol>
              </section>

              {/* RINGKASAN KELENGKAPAN BERKAS TERVERIFIKASI */}
              <section className="font-sans border border-slate-200 rounded-lg p-3.5 bg-slate-50/70 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-800">
                    Kelengkapan Persyaratan Terverifikasi Seksi
                  </span>
                  <span className="font-mono-tabular font-bold text-emerald-800">
                    {docData.verifiedRequirements.filter((r) => r.checked).length} /{' '}
                    {docData.verifiedRequirements.length} syarat valid
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                  {docData.verifiedRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          req.checked ? 'text-emerald-700' : 'text-slate-300'
                        }`}
                      />
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* PENUTUP & BLOK TANDA TANGAN ELEKTRONIK (TTE) */}
              <section className="space-y-5 text-[13px] leading-relaxed text-slate-900">
                <p className="text-justify">{docData.closingParagraph}</p>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2 font-sans">
                  <div className="text-[11px] text-slate-600 space-y-1 max-w-xs">
                    <p className="font-bold text-slate-800">
                      Kode Verifikasi Elektronik:
                    </p>
                    <p className="font-mono-tabular font-bold text-emerald-800">
                      {docData.verificationCode}
                    </p>
                    <p>
                      Tiket: <span className="font-mono-tabular">{ticket.ticketNo}</span>
                    </p>
                  </div>

                  <div className="w-full sm:w-96 space-y-2">
                    <div className="text-xs space-y-0.5">
                      <p>Puruk Cahu, {docData.signedAtLabel}</p>
                      <p className="font-bold text-slate-950 whitespace-pre-line">
                        {docData.signerTitle}
                      </p>
                    </div>

                    {/* Kotak Stempel TTE BSrE */}
                    <div
                      className={`rounded-lg border-2 p-2.5 flex items-center gap-3 ${
                        docData.isEndorsed
                          ? 'border-emerald-700 bg-emerald-50/70'
                          : 'border-dashed border-amber-500 bg-amber-50/60'
                      }`}
                    >
                      <DeterministicQrSvg seed={docData.verificationCode} />
                      <div className="min-w-0 space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1 font-extrabold uppercase tracking-wide text-emerald-900">
                          <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            {docData.isEndorsed
                              ? 'Ditandatangani Secara Elektronik'
                              : 'Draf Menunggu TTE Pimpinan'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 truncate">{docData.signerName}</p>
                        <p className="font-mono-tabular text-slate-600">NIP. {docData.signerNip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FOOTER UU ITE */}
              <footer className="font-sans border-t border-slate-300 pt-3 text-[10px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>
                  Sesuai UU ITE No. 11 Tahun 2008 Pasal 5 Ayat (1), dokumen elektronik ini
                  merupakan alat bukti hukum yang sah.
                </span>
                <span className="font-mono-tabular font-semibold text-slate-700 shrink-0">
                  PTSP Kemenag Kab. Murung Raya
                </span>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
