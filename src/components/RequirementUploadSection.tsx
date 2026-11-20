import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { TicketAttachmentDraft } from '@/src/firebase';
import {
  formatAttachmentBytes,
  prepareRequirementAttachmentFile,
} from '@/src/utils/serviceDocumentTemplates';

interface RequirementUploadSectionProps {
  requirements: string[];
  attachmentsByIndex: Record<number, TicketAttachmentDraft>;
  onChangeAttachment: (index: number, attachment: TicketAttachmentDraft | null) => void;
  isSignedIn: boolean;
  onRequestLogin?: () => void;
}

export function TicketAttachmentPreviewModal({
  attachment,
  onClose,
}: {
  attachment: TicketAttachmentDraft | null;
  onClose: () => void;
}) {
  if (!attachment) return null;

  const isPdf = attachment.mimeType === 'application/pdf';

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau berkas ${attachment.fileName}`}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
              Persyaratan #{attachment.requirementIndex + 1} · {formatAttachmentBytes(attachment.fileSize)}
            </p>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {attachment.fileName}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {attachment.requirementLabel}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={attachment.dataUrl}
              download={attachment.fileName}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Tutup pratinjau berkas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 flex items-center justify-center min-h-[360px]">
          {isPdf ? (
            <iframe
              src={attachment.dataUrl}
              title={attachment.fileName}
              className="w-full h-[68vh] rounded-lg border border-slate-300 dark:border-slate-700 bg-white"
            />
          ) : (
            <img
              src={attachment.dataUrl}
              alt={attachment.fileName}
              className="max-w-full max-h-[70vh] object-contain rounded-lg border border-slate-300 dark:border-slate-700 bg-white shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function RequirementUploadSection({
  requirements,
  attachmentsByIndex,
  onChangeAttachment,
  isSignedIn,
  onRequestLogin,
}: RequirementUploadSectionProps) {
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<TicketAttachmentDraft | null>(null);

  const uploadedCount = Object.keys(attachmentsByIndex).length;

  const handleFilePicked = async (
    idx: number,
    reqLabel: string,
    file: File | undefined
  ) => {
    if (!file) return;
    setUploadError('');
    setProcessingIndex(idx);
    try {
      const prepared = await prepareRequirementAttachmentFile(file, idx, reqLabel);
      onChangeAttachment(idx, prepared);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Gagal memproses berkas yang dipilih.'
      );
    } finally {
      setProcessingIndex(null);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Unggah Berkas Persyaratan Layanan</span>
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Format PDF (maks 560 KB) atau Foto JPG/PNG/WEBP (kompresi otomatis) untuk diperiksa
            Operator PTSP dan Seksi.
          </p>
        </div>
        <span className="font-mono-tabular text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
          {uploadedCount} / {requirements.length} berkas siap kirim
        </span>
      </div>

      {!isSignedIn && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <span>
            Untuk mengirimkan lampiran berkas persyaratan ke Operator PTSP &amp; Seksi secara
            daring, silakan login menggunakan Akun Google atau NIP terlebih dahulu.
          </span>
          {onRequestLogin && (
            <button
              type="button"
              onClick={onRequestLogin}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold whitespace-nowrap shrink-0"
            >
              Login Sekarang
            </button>
          )}
        </div>
      )}

      {uploadError && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        {requirements.map((reqLabel, idx) => {
          const att = attachmentsByIndex[idx];
          const isBusy = processingIndex === idx;
          const inputId = `req-upload-${idx}-${reqLabel.slice(0, 12).replace(/[^a-zA-Z0-9]/g, '')}`;

          return (
            <div
              key={idx}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60"
            >
              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-mono-tabular font-bold text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
                    0{idx + 1}.
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {reqLabel}
                  </span>
                </div>

                {att && (
                  <div className="pl-6 flex flex-wrap items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    {att.mimeType === 'application/pdf' ? (
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="font-semibold truncate max-w-[220px]">{att.fileName}</span>
                    <span className="font-mono-tabular text-slate-500 dark:text-slate-400">
                      ({formatAttachmentBytes(att.fileSize)})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-6 sm:pl-0">
                {att && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewAttachment(att)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeAttachment(idx, null)}
                      title="Hapus berkas"
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-slate-950 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-semibold text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <label
                  htmlFor={inputId}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    att
                      ? 'border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  } ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isBusy ? 'Memproses...' : att ? 'Ganti Berkas' : 'Unggah Berkas'}</span>
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleFilePicked(idx, reqLabel, file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <TicketAttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
}
