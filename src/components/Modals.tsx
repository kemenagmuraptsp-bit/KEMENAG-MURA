import { useEffect, useState } from 'react';
import { X, CheckCircle2, Clock, FileCheck2, MapPin, ThumbsUp, Lightbulb, Sparkles, Eye } from 'lucide-react';
import { ServiceUnit, NewsArticle, GalleryItem, PTSPTicket } from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { createCloudPtspTicket, type TicketAttachmentDraft } from '@/src/firebase';
import { RequirementUploadSection } from '@/src/components/RequirementUploadSection';

interface ServiceModalProps {
  unit: ServiceUnit | null;
  onClose: () => void;
  onTicketCreated: (ticket: PTSPTicket) => void;
}

export function ServiceDetailModal({ unit, onClose, onTicketCreated }: ServiceModalProps) {
  const {
    user,
    isEligibleUser,
    isVerifiedEmployee,
    isVerifiedKuaEmployee,
    myVerifiedEmployee,
    accountTier,
    openLoginModal,
  } = useAuthRole();
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [mode, setMode] = useState<'info' | 'request'>('info');
  const [applicantName, setApplicantName] = useState('');
  const [nikOrNip, setNikOrNip] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentsByReq, setAttachmentsByReq] = useState<
    Record<number, TicketAttachmentDraft>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<
    (PTSPTicket & { savedToCloud?: boolean; uploadedCount?: number }) | null
  >(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (myVerifiedEmployee?.fullName && !applicantName) {
      setApplicantName(myVerifiedEmployee.fullName);
    } else if (user?.displayName && !applicantName) {
      setApplicantName(user.displayName);
    }
  }, [myVerifiedEmployee?.fullName, user?.displayName]);

  if (!unit) return null;

  const activeSub =
    unit.subServices.find((s) => s.id === selectedSubId) || unit.subServices[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unit.id === 'kepegawaian' && !isVerifiedEmployee) {
      setFormError('Menu Kepegawaian hanya dapat diakses melalui halaman Layanan setelah login & diverifikasi Admin.');
      return;
    }
    if (activeSub.id === 'bi-tauliyah-wali-hakim' && !isVerifiedKuaEmployee) {
      setFormError('Permohonan Tauliyah Wali Hakim khusus pegawai KUA Kecamatan terverifikasi Admin.');
      return;
    }
    if (!applicantName.trim() || !phone.trim() || phone.trim().length < 8) {
      setFormError('Mohon lengkapi nama pemohon dan nomor WhatsApp aktif.');
      return;
    }

    const attachmentList = Object.values(attachmentsByReq).sort(
      (a, b) => a.requirementIndex - b.requirementIndex
    );

    if ((!user || !isEligibleUser) && attachmentList.length > 0) {
      setFormError(
        'Anda sudah melampirkan berkas persyaratan. Silakan login terlebih dahulu agar berkas dapat dikirim ke Operator PTSP & Seksi.'
      );
      return;
    }

    setFormError('');

    if (user && isEligibleUser) {
      setSubmitting(true);
      try {
        const isEmployeeService =
          unit.id === 'kepegawaian' || activeSub.id === 'bi-tauliyah-wali-hakim';
        const cloudTicket = await createCloudPtspTicket({
          user,
          accountTier: accountTier === 'tamu' ? 'masyarakat' : accountTier,
          unitId: unit.id,
          unitTitle: unit.title,
          subServiceId: activeSub.id,
          serviceTitle: activeSub.title,
          applicantName: applicantName.trim(),
          phone: phone.trim(),
          institution:
            nikOrNip.trim() ||
            (isEmployeeService ? myVerifiedEmployee?.unitKerja : undefined),
          nip: isEmployeeService ? myVerifiedEmployee?.nip : undefined,
          notes: notes.trim() || undefined,
          totalDocsCount: activeSub.requirements.length,
          attachments: attachmentList,
        });
        setSubmittedTicket({
          ticketNo: cloudTicket.ticketNo,
          unitTitle: cloudTicket.unitTitle,
          serviceTitle: cloudTicket.serviceTitle,
          applicantName: cloudTicket.applicantName,
          phone: cloudTicket.phone,
          submittedAt: cloudTicket.submittedAtLabel,
          status: 'Diproses Verifikasi',
          savedToCloud: true,
          uploadedCount: attachmentList.length,
        });
        setAttachmentsByReq({});
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan tiket dan berkas ke akun Anda.'
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticket: PTSPTicket = {
      ticketNo: `PTSP-MURA-2026-${randomNum}`,
      unitTitle: unit.title,
      serviceTitle: activeSub.title,
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
    setSubmittedTicket(ticket);
    setAttachmentsByReq({});
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div>
            <p className="text-xs font-mono-tabular text-emerald-700 font-semibold">
              {unit.code} · {unit.officer}
            </p>
            <h2 id="service-modal-title" className="text-lg font-bold text-slate-900">
              {unit.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Tutup detail layanan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Segmented Toggle */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('info');
                setSubmittedTicket(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'info'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standar & Persyaratan
            </button>
            <button
              type="button"
              onClick={() => setMode('request')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'request'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ajukan Permohonan Daring
            </button>
          </div>

          {/* Sub-service Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pilih Jenis Layanan
            </label>
            <div className="grid grid-cols-1 gap-2">
              {unit.subServices.map((sub) => {
                const selected = sub.id === activeSub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      setAttachmentsByReq({});
                      setSubmittedTicket(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selected
                        ? 'border-emerald-700 bg-emerald-50/60 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-sm font-semibold">{sub.title}</span>
                      <span className="text-xs text-emerald-800 font-medium shrink-0">
                        {sub.sla} · {sub.fee}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'info' ? (
            <div className="border border-slate-200 rounded-xl p-5 space-y-5 bg-slate-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Estimasi Waktu Penyelesaian</p>
                    <p className="text-sm font-semibold text-slate-900">{activeSub.sla}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Biaya / Tarif Pelayanan</p>
                    <p className="text-sm font-semibold text-emerald-800">{activeSub.fee}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2.5">
                  Persyaratan Administrasi
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {activeSub.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="font-mono-tabular text-xs text-emerald-700 font-semibold mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Produk Layanan</p>
                  <p className="text-sm font-medium text-slate-900">{activeSub.output}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('request')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Ajukan Layanan Ini
                </button>
              </div>
            </div>
          ) : submittedTicket ? (
            <div className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Permohonan Layanan Berhasil Didaftarkan
                  </h3>
                  <p className="text-sm text-slate-700">
                    Simpan nomor registrasi berikut untuk verifikasi berkas di loket PTSP Kankemenag
                    Kabupaten Murung Raya, Puruk Cahu.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-emerald-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Nomor Tiket PTSP</span>
                  <span className="font-mono-tabular font-bold text-emerald-800">
                    {submittedTicket.ticketNo}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Status Permohonan</span>
                  <span className="font-semibold text-slate-900">{submittedTicket.status}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Nama Pemohon</span>
                  <span className="font-medium text-slate-900">{submittedTicket.applicantName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Layanan Dipilih</span>
                  <span className="font-medium text-slate-900">{submittedTicket.serviceTitle}</span>
                </div>
                {submittedTicket.savedToCloud && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500 block">Berkas Persyaratan Terunggah</span>
                    <span className="font-semibold text-emerald-800">
                      {submittedTicket.uploadedCount ?? 0} berkas dikirim ke Operator PTSP &amp; Seksi.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setNikOrNip('');
                    setPhone('');
                    setNotes('');
                    setAttachmentsByReq({});
                  }}
                  className="px-4 py-2 text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  Buat Permohonan Lain
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Formulir Registrasi Antrean & Permohonan PTSP
              </h3>
              {formError && (
                <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Lengkap Pemohon *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzan"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NIK / NIP / Nama Lembaga (Opsional)
                </label>
                <input
                  type="text"
                  value={nikOrNip}
                  onChange={(e) => setNikOrNip(e.target.value)}
                  placeholder="Contoh: MAN 1 Murung Raya atau NIK"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keterangan Tambahan / Keperluan
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan ringkas keperluan atau kecamatan asal Anda di Murung Raya..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <RequirementUploadSection
                requirements={activeSub.requirements}
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
                  onClick={() => setMode('info')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors"
                >
                  {submitting ? 'Menyimpan Tiket...' : 'Dapatkan Nomor Tiket PTSP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

interface ArticleModalProps {
  article: NewsArticle | null;
  reactions: Record<string, { bermanfaat: number; informatif: number; inspiratif: number }>;
  userReacted: Record<string, string | null>;
  onReact: (articleId: string, type: 'bermanfaat' | 'informatif' | 'inspiratif') => void;
  onClose: () => void;
}

export function ArticleReaderModal({
  article,
  reactions,
  userReacted,
  onReact,
  onClose,
}: ArticleModalProps) {
  if (!article) return null;

  const counts = reactions[article.id] || article.reactions;
  const activeReaction = userReacted[article.id];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <article className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-800">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.date}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            aria-label="Tutup berita"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <h1
            id="article-modal-title"
            className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"
          >
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-xs text-slate-500 pb-4 border-b border-slate-200">
            <span>Humas Kankemenag Kab. Murung Raya</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono-tabular">
              <Eye className="w-3.5 h-3.5" />
              {article.views} kali dibaca
            </span>
          </div>

          <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200">
            <SafeImage
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-2xl mx-auto space-y-4 font-serif-editorial text-base sm:text-[17px] text-slate-800 leading-relaxed">
            {article.content.map((para, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-emerald-800 first-letter:float-left first-letter:mr-2.5 first-letter:leading-none'
                    : ''
                }
              >
                {para}
              </p>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-600">
              Bagaimana pendapat Anda mengenai berita ini?
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'bermanfaat' as const, label: 'Bermanfaat', icon: ThumbsUp, count: counts.bermanfaat },
                { key: 'informatif' as const, label: 'Informatif', icon: Lightbulb, count: counts.informatif },
                { key: 'inspiratif' as const, label: 'Inspiratif', icon: Sparkles, count: counts.inspiratif },
              ].map((btn) => {
                const Icon = btn.icon;
                const active = activeReaction === btn.key;
                return (
                  <button
                    key={btn.key}
                    type="button"
                    onClick={() => onReact(article.id, btn.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      active
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{btn.label}</span>
                    <span className="font-mono-tabular font-semibold">({btn.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

interface GalleryLightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export function GalleryLightboxModal({ item, onClose }: GalleryLightboxProps) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-emerald-800">{item.category}</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>{item.date}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
            aria-label="Tutup pratinjau foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="aspect-[16/10] bg-slate-100">
          <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>

        <div className="p-5 space-y-1.5">
          <h3 id="gallery-modal-title" className="text-base font-bold text-slate-900">
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{item.location}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

interface SearchModalProps {
  open: boolean;
  services: ServiceUnit[];
  articles: NewsArticle[];
  onClose: () => void;
  onSelectService: (u: ServiceUnit) => void;
  onSelectArticle: (a: NewsArticle) => void;
}

export function GlobalSearchModal({
  open,
  services,
  articles,
  onClose,
  onSelectService,
  onSelectArticle,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matchedServices = q
    ? services.filter(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.subServices.some((s) => s.title.toLowerCase().includes(q))
      )
    : services.slice(0, 4);

  const matchedArticles = q
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    : articles.slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian cepat portal Kemenag Murung Raya"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari layanan PTSP, berita, KUA, madrasah, wakaf..."
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
          >
            Tutup
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Layanan PTSP ({matchedServices.length})
            </h3>
            <div className="space-y-1.5">
              {matchedServices.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onSelectService(u);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
                >
                  <p className="text-sm font-bold text-slate-900">{u.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{u.shortDesc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Berita & Informasi ({matchedArticles.length})
            </h3>
            <div className="space-y-1.5">
              {matchedArticles.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onSelectArticle(a);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.category} · {a.date}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
