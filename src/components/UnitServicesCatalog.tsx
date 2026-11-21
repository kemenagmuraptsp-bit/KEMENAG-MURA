import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck2,
  FileText,
  LayoutGrid,
  Lock,
  Search,
  X,
} from 'lucide-react';
import { PTSPTicket, ServiceTemplate, ServiceUnit, SubService } from '@/src/types';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { createCloudPtspTicket, type TicketAttachmentDraft } from '@/src/firebase';
import { SelfServiceInfoWorkspace } from '@/src/components/SelfServiceInfoWorkspace';
import { KepegawaianAccessGate } from '@/src/components/KepegawaianGateAndAdmin';
import { RequirementUploadSection } from '@/src/components/RequirementUploadSection';

interface UnitServicesCatalogProps {
  unit: ServiceUnit;
  highlightedSubId: string;
  onOpenServiceSidebar: () => void;
  onTicketCreated: (ticket: PTSPTicket) => void;
}

function downloadWordTemplate(tpl: ServiceTemplate) {
  const blob = new Blob(['\ufeff', tpl.contentHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = tpl.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function UnitServicesCatalog({
  unit,
  highlightedSubId,
  onOpenServiceSidebar,
  onTicketCreated,
}: UnitServicesCatalogProps) {
  const {
    user,
    isEligibleUser,
    isNipSession,
    isVerifiedEmployee,
    isVerifiedKuaEmployee,
    myVerifiedEmployee,
    accountTier,
    openLoginModal,
  } = useAuthRole();

  const [filterText, setFilterText] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string>(
    highlightedSubId || unit.subServices[0]?.id || ''
  );
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(
    highlightedSubId || unit.subServices[0]?.id || null
  );
  const [panelMode, setPanelMode] = useState<'detail' | 'form'>('detail');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentsByReq, setAttachmentsByReq] = useState<
    Record<number, TicketAttachmentDraft>
  >({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{
    ticketNo: string;
    status: string;
    applicantName: string;
    serviceTitle: string;
    uploadedCount: number;
    savedToCloud: boolean;
  } | null>(null);

  const isKepegawaianLocked = unit.id === 'kepegawaian' && !isVerifiedEmployee;

  useEffect(() => {
    const nextId =
      unit.subServices.find((s) => s.id === highlightedSubId)?.id ||
      unit.subServices[0]?.id ||
      '';
    setFilterText('');
    setSelectedSubId(nextId);
    setMobileExpandedId(nextId);
    setPanelMode('detail');
    setCreatedTicket(null);
    setFormError('');
    setPreviewTemplateId(null);
    setAttachmentsByReq({});
  }, [unit.id, highlightedSubId]);

  useEffect(() => {
    if (myVerifiedEmployee?.fullName && !applicantName) {
      setApplicantName(myVerifiedEmployee.fullName);
    } else if (user?.displayName && !applicantName) {
      setApplicantName(user.displayName);
    }
  }, [myVerifiedEmployee?.fullName, user?.displayName]);

  const query = filterText.trim().toLowerCase();
  const visibleServices = query
    ? unit.subServices.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.requirements.some((r) => r.toLowerCase().includes(query)) ||
          s.output.toLowerCase().includes(query)
      )
    : unit.subServices;

  const activeSub =
    visibleServices.find((s) => s.id === selectedSubId) ||
    unit.subServices.find((s) => s.id === selectedSubId) ||
    visibleServices[0] ||
    unit.subServices[0];

  const handleSelectRow = (subId: string) => {
    setSelectedSubId(subId);
    setMobileExpandedId((prev) => (prev === subId ? null : subId));
    setPanelMode('detail');
    setCreatedTicket(null);
    setFormError('');
    setPreviewTemplateId(null);
    setAttachmentsByReq({});
  };

  const handleCopyPreview = async (tpl: ServiceTemplate) => {
    try {
      await navigator.clipboard.writeText(tpl.previewText);
      setCopiedTemplateId(tpl.id);
      window.setTimeout(() => {
        setCopiedTemplateId((prev) => (prev === tpl.id ? null : prev));
      }, 2000);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleSubmit = async (e: React.FormEvent, sub: SubService) => {
    e.preventDefault();

    if (unit.id === 'kepegawaian' && !isVerifiedEmployee) {
      setFormError('Layanan Kepegawaian hanya dapat diajukan oleh pegawai terverifikasi Admin.');
      return;
    }
    if (sub.id === 'bi-tauliyah-wali-hakim' && !isVerifiedKuaEmployee) {
      setFormError(
        'Permohonan Tauliyah Wali Hakim hanya dapat diajukan oleh Pegawai KUA Kecamatan yang terverifikasi Admin.'
      );
      return;
    }
    if (!applicantName.trim() || phone.trim().length < 8) {
      setFormError('Mohon lengkapi nama pemohon dan nomor WhatsApp aktif.');
      return;
    }
    setFormError('');

    const attachmentList = Object.values(attachmentsByReq).sort(
      (a, b) => a.requirementIndex - b.requirementIndex
    );

    if ((!user || !isEligibleUser) && attachmentList.length > 0) {
      setFormError(
        'Anda sudah melampirkan berkas persyaratan. Silakan klik "Login Akun" di atas terlebih dahulu agar berkas terkirim ke Operator PTSP & Seksi.'
      );
      return;
    }

    const isEmployeeService =
      unit.id === 'kepegawaian' || sub.id === 'bi-tauliyah-wali-hakim';

    if (user && isEligibleUser) {
      setSubmitting(true);
      try {
        const cloudTicket = await createCloudPtspTicket({
          user,
          accountTier: accountTier === 'tamu' ? 'masyarakat' : accountTier,
          unitId: unit.id,
          unitTitle: unit.title,
          subServiceId: sub.id,
          serviceTitle: sub.title,
          applicantName: applicantName.trim(),
          phone: phone.trim(),
          institution:
            institution.trim() ||
            (isEmployeeService ? myVerifiedEmployee?.unitKerja : undefined),
          nip: isEmployeeService ? myVerifiedEmployee?.nip : undefined,
          notes: notes.trim() || undefined,
          totalDocsCount: sub.requirements.length,
          attachments: attachmentList,
        });
        setCreatedTicket({
          ticketNo: cloudTicket.ticketNo,
          status: cloudTicket.status,
          applicantName: cloudTicket.applicantName,
          serviceTitle: cloudTicket.serviceTitle,
          uploadedCount: attachmentList.length,
          savedToCloud: true,
        });
        setPhone('');
        setInstitution('');
        setNotes('');
        setAttachmentsByReq({});
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan tiket ke akun Anda. Coba lagi.'
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const num = Math.floor(1000 + Math.random() * 9000);
    const ticket: PTSPTicket = {
      ticketNo: `PTSP-MURA-2026-${num}`,
      unitTitle: unit.title,
      serviceTitle: sub.title,
      applicantName: applicantName.trim(),
      phone: phone.trim(),
      submittedAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      status: 'Diproses Verifikasi',
    };
    onTicketCreated(ticket);
    setCreatedTicket({
      ticketNo: ticket.ticketNo,
      status: ticket.status,
      applicantName: ticket.applicantName,
      serviceTitle: ticket.serviceTitle,
      uploadedCount: 0,
      savedToCloud: false,
    });
    setApplicantName('');
    setPhone('');
    setInstitution('');
    setNotes('');
    setAttachmentsByReq({});
  };

  const renderDetailContent = (sub: SubService) => {
    const subIdx = unit.subServices.findIndex((item) => item.id === sub.id);
    const numberLabel = String(subIdx + 1).padStart(2, '0');
    const templates = sub.templates || [];
    const isSelfServiceInfo =
      sub.id === 'bi-kalkulator-zakat' || sub.id === 'bi-jadwal-sholat';
    const isKuaLocked =
      sub.id === 'bi-tauliyah-wali-hakim' && !isVerifiedKuaEmployee;

    return (
      <div className="p-5 sm:p-7 space-y-6">
        {/* Detail Header */}
        <div className="space-y-2 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono-tabular font-bold text-emerald-700 dark:text-emerald-400">
              Layanan {numberLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>{unit.officer}</span>
            {sub.restrictedScope === 'kua' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400">
                  {isKuaLocked && <Lock className="w-3 h-3 shrink-0" />}
                  <span>Khusus Pegawai KUA Kecamatan</span>
                </span>
              </>
            )}
            {isSelfServiceInfo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">
                  Layanan Mandiri per Tahun (Tanpa Tiket PTSP)
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
            {sub.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Produk / Output:{' '}
            <strong className="text-slate-800 dark:text-slate-200">{sub.output}</strong>
          </p>

          {/* Compact Operational Utility Strip (SLA & Fee without nested boxes) */}
          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Waktu:</span>
              <strong className="font-mono-tabular text-slate-900 dark:text-white">
                {sub.sla}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Biaya:</span>
              <strong className="text-emerald-800 dark:text-emerald-400">{sub.fee}</strong>
            </span>
          </div>
        </div>

        {/* Special Case 1: Zakat / Imsakiyah Self-Service Workspace */}
        {isSelfServiceInfo ? (
          <SelfServiceInfoWorkspace
            mode={sub.id === 'bi-kalkulator-zakat' ? 'zakat' : 'imsakiyah'}
          />
        ) : isKuaLocked ? (
          /* Special Case 2: KUA Tauliyah Gate */
          <div className="space-y-5">
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Persyaratan Administrasi KUA Kecamatan
              </h4>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {sub.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono-tabular text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 shrink-0">
                      0{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <KepegawaianAccessGate serviceTitle={sub.title} gateMode="kua" />
            </div>
          </div>
        ) : createdTicket ? (
          /* Ticket Created Confirmation */
          <div className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Permohonan Layanan Berhasil Didaftarkan
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  {createdTicket.savedToCloud
                    ? `Tiket dan riwayat pengajuan telah tersimpan otomatis pada akun Google (${user?.email}).`
                    : 'Pengajuan tercatat pada sesi perangkat ini. Simpan nomor tiket berikut untuk verifikasi di loket PTSP Puruk Cahu.'}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xs">
              <div>
                <dt className="text-slate-500">Nomor Tiket PTSP</dt>
                <dd className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400 text-sm mt-0.5">
                  {createdTicket.ticketNo}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {createdTicket.status}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Nama Pemohon</dt>
                <dd className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {createdTicket.applicantName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Layanan</dt>
                <dd className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {createdTicket.serviceTitle}
                </dd>
              </div>
              {createdTicket.savedToCloud && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Berkas Persyaratan Terkirim</dt>
                  <dd className="font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
                    {createdTicket.uploadedCount} berkas dikirim ke Operator PTSP &amp; Seksi untuk
                    verifikasi.
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCreatedTicket(null);
                  setPanelMode('form');
                }}
                className="menu-expand-btn px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap shrink-0"
              >
                <span className="menu-expand-label">Ajukan Permohonan Lagi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedTicket(null);
                  setPanelMode('detail');
                }}
                className="menu-expand-btn px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg whitespace-nowrap shrink-0"
              >
                <span className="menu-expand-label">Kembali ke Persyaratan</span>
              </button>
            </div>
          </div>
        ) : panelMode === 'form' ? (
          /* Inline Application Form */
          <form onSubmit={(e) => void handleSubmit(e, sub)} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Pendaftaran Permohonan PTSP
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user
                    ? isVerifiedEmployee &&
                      (unit.id === 'kepegawaian' || sub.id === 'bi-tauliyah-wali-hakim')
                      ? `Tersimpan otomatis ke Akun Pegawai (${
                          myVerifiedEmployee?.nip
                            ? `NIP ${myVerifiedEmployee.nip}`
                            : isNipSession
                            ? `NIP ${user.email?.split('@')[0]}`
                            : user.email
                        })`
                      : `Tersimpan otomatis ke Akun (${
                          isNipSession ? `NIP ${user.email?.split('@')[0]}` : user.email
                        })`
                    : 'Mode Pengajuan Biasa (tanpa login)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelMode('detail')}
                className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0"
              >
                ← Lihat Persyaratan & Template
              </button>
            </div>

            {!user && (
              <div className="py-3 px-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-slate-700 dark:text-slate-300">
                  Masuk dengan <strong>Akun Google</strong> agar riwayat & notifikasi lonceng status
                  tiket tersimpan permanen.
                </p>
                <button
                  type="button"
                  onClick={() => openLoginModal('google')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold whitespace-nowrap shrink-0"
                >
                  Login Akun
                </button>
              </div>
            )}

            {formError && (
              <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pemohon *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Nama lengkap sesuai KTP / SK"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {unit.id === 'kepegawaian' || sub.id === 'bi-tauliyah-wali-hakim'
                  ? 'Unit Kerja / KUA Kecamatan Pegawai (Opsional)'
                  : 'Instansi / Sekolah / Rumah Ibadah / Lembaga (Opsional)'}
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder={
                  sub.id === 'bi-tauliyah-wali-hakim'
                    ? myVerifiedEmployee?.unitKerja || 'Contoh: KUA Kec. Murung'
                    : unit.id === 'kepegawaian'
                    ? myVerifiedEmployee?.unitKerja || 'Contoh: Subbag TU / KUA / Madrasah'
                    : 'Contoh: Masjid, Gereja, Pura, Madrasah, atau Instansi'
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Keterangan Keperluan & Kecamatan Asal
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan ringkas keperluan Anda dan kecamatan di Kab. Murung Raya..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>

            <RequirementUploadSection
              requirements={sub.requirements}
              attachmentsByIndex={attachmentsByReq}
              onChangeAttachment={(idx, att) =>
                setAttachmentsByReq((prev) => {
                  const next = { ...prev };
                  if (att) {
                    next[idx] = att;
                  } else {
                    delete next[idx];
                  }
                  return next;
                })
              }
              isSignedIn={Boolean(user && isEligibleUser)}
              onRequestLogin={() => openLoginModal('google')}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPanelMode('detail')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {submitting ? 'Menyimpan Tiket...' : 'Kirim & Dapatkan Tiket PTSP'}
              </button>
            </div>
          </form>
        ) : (
          /* Standard Service Detail: Uploadable Requirements + Conditional Templates + Primary CTA */
          <div className="space-y-6">
            <RequirementUploadSection
              title="Kelengkapan & Unggah Berkas Persyaratan"
              requirements={sub.requirements}
              attachmentsByIndex={attachmentsByReq}
              onChangeAttachment={(idx, att) =>
                setAttachmentsByReq((prev) => {
                  const next = { ...prev };
                  if (att) {
                    next[idx] = att;
                  } else {
                    delete next[idx];
                  }
                  return next;
                })
              }
              isSignedIn={Boolean(user && isEligibleUser)}
              onRequestLogin={() => openLoginModal('google')}
            />

            {/* Templates Section (flat hairline divider instead of nested cards) */}
            {templates.length > 0 && (
              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Format Template Dokumen Persyaratan</span>
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {templates.length} format siap pakai (.doc)
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
                  {templates.map((tpl) => {
                    const isPreviewOpen = previewTemplateId === tpl.id;
                    const isCopied = copiedTemplateId === tpl.id;
                    return (
                      <div key={tpl.id} className="py-3.5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {tpl.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {tpl.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewTemplateId(isPreviewOpen ? null : tpl.id)
                              }
                              className="menu-expand-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="menu-expand-label">{isPreviewOpen ? 'Tutup' : 'Pratinjau'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadWordTemplate(tpl)}
                              className="menu-expand-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="menu-expand-label">Unduh (.doc)</span>
                            </button>
                          </div>
                        </div>

                        {isPreviewOpen && (
                          <div className="pt-2 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Pratinjau Format Surat / Formulir
                              </span>
                              <button
                                type="button"
                                onClick={() => void handleCopyPreview(tpl)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 dark:text-emerald-400">
                                      Tersalin
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin Teks</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-[11px] sm:text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 overflow-x-auto whitespace-pre-wrap">
                              {tpl.previewText}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {Object.keys(attachmentsByReq).length > 0
                    ? `${Object.keys(attachmentsByReq).length} dari ${sub.requirements.length} berkas persyaratan siap dikirim.`
                    : 'Unggah berkas persyaratan di atas sebelum mengajukan layanan.'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lanjutkan ke formulir pendaftaran untuk mendapatkan nomor tiket PTSP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreatedTicket(null);
                  setPanelMode('form');
                }}
                className="menu-expand-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap shrink-0 shadow-xs"
              >
                <span className="menu-expand-label">Ajukan Layanan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Compact Institutional Unit Header Strip */}
      <div className="px-5 py-5 sm:px-7 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b border-emerald-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-semibold">
            <span>Bidang {unit.code}</span>
            <span aria-hidden="true">·</span>
            <span>{unit.officer}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{unit.subServices.length} Layanan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Layanan Seksi / Bidang {unit.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isKepegawaianLocked && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-emerald-300/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={`Cari di ${unit.title}...`}
                className="w-full pl-8 pr-8 py-2 text-xs bg-slate-950/50 border border-emerald-700/80 rounded-lg text-white placeholder:text-emerald-200/60 focus:outline-none focus:border-emerald-400"
              />
              {filterText && (
                <button
                  type="button"
                  onClick={() => setFilterText('')}
                  aria-label="Hapus filter"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-200/75 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onOpenServiceSidebar}
            className="menu-expand-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-emerald-400/30 text-white text-xs font-bold whitespace-nowrap shrink-0"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="menu-expand-label">Ganti Bidang (Sidebar Kiri)</span>
          </button>
        </div>
      </div>

      {/* Kepegawaian Locked Gate OR Compact Split Directory / Mobile Accordion */}
      {isKepegawaianLocked ? (
        <KepegawaianAccessGate
          serviceTitle={`Bidang ${unit.title} (${unit.subServices.length} Layanan Pegawai)`}
          gateMode="kepegawaian"
        />
      ) : (
        <>
          {/* DESKTOP MASTER-DETAIL SPLIT DIRECTORY (Compact, Low Vertical Footprint) */}
          <div className="hidden lg:grid lg:grid-cols-12 items-start">
            {/* Left Directory List (All Services of Active Section) */}
            <div className="lg:col-span-5 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 divide-y divide-slate-200/80 dark:divide-slate-800">
              {visibleServices.map((sub) => {
                const origIdx = unit.subServices.findIndex((item) => item.id === sub.id);
                const numberLabel = String(origIdx + 1).padStart(2, '0');
                const active = activeSub?.id === sub.id;
                const templateCount = sub.templates?.length || 0;
                const isKuaRestricted = sub.restrictedScope === 'kua';
                const isSelfService =
                  sub.id === 'bi-kalkulator-zakat' || sub.id === 'bi-jadwal-sholat';

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSelectRow(sub.id)}
                    className={`service-expand-row group/svc w-full text-left px-4 py-4 flex items-start justify-between gap-3 ${
                      active
                        ? 'bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-white dark:from-emerald-950/65 dark:via-emerald-950/35 dark:to-slate-900'
                        : 'hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-white dark:hover:from-emerald-950/40 dark:hover:to-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
                      <span
                        className={`w-7 h-7 rounded-lg font-mono-tabular text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                          active
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 group-hover/svc:bg-emerald-600 group-hover/svc:text-white group-hover/svc:scale-105 group-hover/svc:shadow-xs'
                        }`}
                      >
                        {numberLabel}
                      </span>
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <p className="leading-snug pr-2">
                          <span
                            className={`service-expand-title text-sm leading-snug ${
                              active
                                ? 'font-bold text-emerald-950 dark:text-white'
                                : 'font-semibold text-slate-800 dark:text-slate-200 group-hover/svc:text-emerald-800 dark:group-hover/svc:text-emerald-300 group-hover/svc:font-bold'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 transition-colors group-hover/svc:text-slate-600 dark:group-hover/svc:text-slate-300">
                          <span className="font-mono-tabular">{sub.sla}</span>
                          <span aria-hidden="true">·</span>
                          <span>{sub.fee === 'Rp 0 (Gratis)' ? 'Gratis' : sub.fee}</span>
                          {templateCount > 0 && !isKuaRestricted && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-amber-700 dark:text-amber-400">
                                {templateCount} Template (.doc)
                              </span>
                            </>
                          )}
                          {isKuaRestricted && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                                Khusus Pegawai KUA
                              </span>
                            </>
                          )}
                          {isSelfService && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-teal-700 dark:text-teal-400">
                                Tanpa Tiket
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                        active
                          ? 'bg-emerald-700 text-white shadow-xs translate-x-0.5'
                          : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 group-hover/svc:bg-emerald-600 group-hover/svc:text-white group-hover/svc:translate-x-1'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                );
              })}

              {visibleServices.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Layanan tidak ditemukan untuk kata kunci "{filterText}".
                </div>
              )}
            </div>

            {/* Right Detail Workspace (Sticky, Full Requirements + Template + Ajukan Layanan) */}
            <div className="lg:col-span-7 lg:sticky lg:top-24 bg-white dark:bg-slate-900">
              {activeSub ? (
                renderDetailContent(activeSub)
              ) : (
                <div className="p-10 text-center text-sm text-slate-500">
                  Pilih salah satu layanan di daftar sebelah kiri untuk melihat detail persyaratan.
                </div>
              )}
            </div>
          </div>

          {/* MOBILE COMPACT ACCORDION DIRECTORY */}
          <div className="lg:hidden divide-y divide-slate-200/90 dark:divide-slate-800">
            {visibleServices.map((sub) => {
              const origIdx = unit.subServices.findIndex((item) => item.id === sub.id);
              const numberLabel = String(origIdx + 1).padStart(2, '0');
              const isOpen = mobileExpandedId === sub.id;
              const templateCount = sub.templates?.length || 0;

              return (
                <div key={sub.id} className="bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => handleSelectRow(sub.id)}
                    aria-expanded={isOpen}
                    className={`service-expand-row group/svc w-full text-left px-4 py-4 flex items-start justify-between gap-3 ${
                      isOpen
                        ? 'bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white dark:from-emerald-950/55 dark:to-slate-900'
                        : 'hover:bg-gradient-to-r hover:from-emerald-50/75 hover:to-white dark:hover:from-emerald-950/35 dark:hover:to-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
                      <span
                        className={`w-7 h-7 rounded-lg font-mono-tabular text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                          isOpen
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 group-hover/svc:bg-emerald-600 group-hover/svc:text-white group-hover/svc:scale-105'
                        }`}
                      >
                        {numberLabel}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="leading-snug pr-2">
                          <span
                            className={`service-expand-title text-sm font-bold leading-snug ${
                              isOpen
                                ? 'text-emerald-950 dark:text-white'
                                : 'text-slate-900 dark:text-white group-hover/svc:text-emerald-800 dark:group-hover/svc:text-emerald-300'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sub.sla} · {sub.fee === 'Rp 0 (Gratis)' ? 'Gratis' : sub.fee}
                          {templateCount > 0 ? ` · ${templateCount} Template (.doc)` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                        isOpen
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover/svc:bg-emerald-600 group-hover/svc:text-white'
                      }`}
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                      {renderDetailContent(sub)}
                    </div>
                  )}
                </div>
              );
            })}

            {visibleServices.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Layanan tidak ditemukan untuk kata kunci "{filterText}".
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
