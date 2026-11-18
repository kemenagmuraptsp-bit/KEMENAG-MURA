import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { KUA_BRANCHES } from '@/src/data/kemenagData';
import { sanitizeNipDigits, type EmployeeUnitCategory } from '@/src/firebase';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCaptchaCode(length = 5): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return out;
}

function CaptchaCanvas({
  code,
  onRefresh,
}: {
  code: string;
  onRefresh: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Noise lines
    for (let i = 0; i < 6; i += 1) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 36; i += 1) {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Characters
    const palette = ['#065f46', '#1e293b', '#312e81', '#0f766e', '#7c2d12'];
    const charStep = (w - 24) / code.length;
    for (let i = 0; i < code.length; i += 1) {
      const ch = code[i];
      ctx.save();
      const x = 16 + i * charStep + charStep * 0.3;
      const y = h / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() - 0.5) * 0.42;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 22px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = palette[i % palette.length];
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }, [code]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        width={176}
        height={48}
        aria-label="Gambar kode keamanan captcha"
        className="rounded-lg border border-slate-300 dark:border-slate-700 shrink-0 select-none"
      />
      <button
        type="button"
        onClick={onRefresh}
        title="Ganti kode captcha"
        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Ganti</span>
      </button>
    </div>
  );
}

export function LoginModal() {
  const {
    loginModalOpen,
    loginModalTab,
    openLoginModal,
    closeLoginModal,
    signInWithGoogle,
    signInWithNip,
    registerWithNip,
    authError,
    clearAuthError,
  } = useAuthRole();

  const [employeeMode, setEmployeeMode] = useState<'login' | 'register'>('login');
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Self-activation fields
  const [fullName, setFullName] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [unitCategory, setUnitCategory] = useState<EmployeeUnitCategory>('kankemenag');
  const [unitKerja, setUnitKerja] = useState('');

  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    if (!loginModalOpen) return;
    setLocalError('');
    clearAuthError();
    refreshCaptcha();
  }, [loginModalOpen, loginModalTab, employeeMode, refreshCaptcha]);

  useEffect(() => {
    if (!loginModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [loginModalOpen, closeLoginModal]);

  if (!loginModalOpen) return null;

  const handleGoogleLogin = async () => {
    setLocalError('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } finally {
      setBusy(false);
    }
  };

  const handleNipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    const cleanNip = sanitizeNipDigits(nip);
    if (cleanNip.length < 8) {
      setLocalError('NIP minimal harus 8 digit angka (contoh: NIP ASN 18 digit).');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password minimal harus 6 karakter.');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setLocalError('Kode keamanan (Captcha) tidak sesuai. Silakan periksa dan ketik ulang.');
      refreshCaptcha();
      return;
    }

    setBusy(true);
    try {
      if (employeeMode === 'login') {
        await signInWithNip(cleanNip, password);
        setPassword('');
        setCaptchaInput('');
      } else {
        if (fullName.trim().length < 2 || jabatan.trim().length < 2 || unitKerja.trim().length < 2) {
          setLocalError('Lengkapi Nama Lengkap, Jabatan, dan Unit Kerja Anda.');
          setBusy(false);
          return;
        }
        await registerWithNip({
          fullName: fullName.trim(),
          nip: cleanNip,
          password,
          jabatan: jabatan.trim(),
          unitKerja: unitKerja.trim(),
          unitCategory,
        });
        setPassword('');
        setCaptchaInput('');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Gagal masuk dengan akun pegawai.');
      refreshCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="px-5 py-4 bg-emerald-950 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <KemenagEmblem className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Kemenag Kab. Murung Raya
              </p>
              <h2 id="login-modal-title" className="text-sm font-extrabold truncate">
                Masuk Portal Layanan & PTSP
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Tutup jendela login"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <button
            type="button"
            onClick={() => openLoginModal('google')}
            className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              loginModalTab === 'google'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Akun Google</span>
          </button>
          <button
            type="button"
            onClick={() => openLoginModal('pegawai')}
            className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              loginModalTab === 'pegawai'
                ? 'border-indigo-700 text-indigo-800 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Login Pegawai (NIP)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {activeError && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-3 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{activeError}</span>
            </div>
          )}

          {loginModalTab === 'google' ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-900 p-4 space-y-2">
                <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
                  Akun Masyarakat & Pengguna Rutin PTSP
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dengan masuk menggunakan <strong>Akun Google</strong>, riwayat berkas pengajuan
                  PTSP, riwayat unduhan dokumen, serta <strong>lonceng notifikasi pesan terbaru</strong>{' '}
                  dari petugas akan aktif otomatis.
                </p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void handleGoogleLogin()}
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold flex items-center justify-center gap-3 shadow-xs transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.64 0 3.11.56 4.27 1.66l3.2-3.2C17.53 1.7 14.96.6 12 .6 7.42.6 3.48 3.23 1.56 7.06l3.73 2.9C6.17 7.1 8.85 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.47c-.28 1.49-1.12 2.75-2.39 3.6l3.71 2.88c2.17-2 3.7-4.95 3.7-8.72z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.29 14.04A6.98 6.98 0 0 1 4.92 12c0-.71.13-1.4.37-2.04L1.56 7.06A11.4 11.4 0 0 0 .4 12c0 1.84.44 3.58 1.16 5.14l3.73-3.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.4c3.08 0 5.66-1.02 7.55-2.77l-3.71-2.88c-1.03.69-2.34 1.11-3.84 1.11-3.15 0-5.83-2.13-6.71-5.01l-3.73 3.1C3.48 20.77 7.42 23.4 12 23.4z"
                  />
                </svg>
                <span>{busy ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google'}</span>
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center pt-1">
                Pengunjung umum yang hanya sesekali berurusan tetap dapat mengajukan layanan PTSP
                Bidang A–E secara langsung tanpa login.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void handleNipSubmit(e)} className="space-y-3.5">
              <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/35 border border-indigo-200/80 dark:border-indigo-900 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {employeeMode === 'login' ? (
                  <>
                    Masuk khusus <strong>Pegawai Lingkup Kemenag Murung Raya & KUA Kecamatan</strong>{' '}
                    menggunakan NIP dan Password yang telah terverifikasi Admin.
                  </>
                ) : (
                  <>
                    Daftarkan <strong>NIP & Password</strong> Anda. Permohonan akan diperiksa
                    terlebih dahulu oleh Admin sebelum menu Kepegawaian dibuka.
                  </>
                )}
              </div>

              {employeeMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap & Gelar Sesuai SK *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Ahmad Fauzi, S.HI."
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Kategori Satker *
                      </label>
                      <select
                        value={unitCategory}
                        onChange={(e) => {
                          const val = e.target.value as EmployeeUnitCategory;
                          setUnitCategory(val);
                          if (val === 'kua_kecamatan' && !unitKerja.toLowerCase().includes('kua')) {
                            setUnitKerja('KUA Kec. Murung');
                          }
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                      >
                        <option value="kankemenag">Kantor Kemenag Kab.</option>
                        <option value="kua_kecamatan">KUA Kecamatan</option>
                        <option value="madrasah">Madrasah Negeri</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Unit Kerja *
                      </label>
                      {unitCategory === 'kua_kecamatan' ? (
                        <select
                          value={unitKerja}
                          onChange={(e) => setUnitKerja(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                        >
                          {KUA_BRANCHES.map((kua) => {
                            const label = `KUA Kec. ${kua.kecamatan}`;
                            return (
                              <option key={kua.id} value={label}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={unitKerja}
                          onChange={(e) => setUnitKerja(e.target.value)}
                          placeholder="Subbag TU / MAN 1 Mura"
                          className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jabatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      placeholder="Contoh: Kepala KUA / Penghulu / Analis Kepegawaian"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIP / NI PPPK (Angka) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={nip}
                  onChange={(e) => setNip(sanitizeNipDigits(e.target.value))}
                  placeholder="Contoh: 198805122015031002"
                  className="w-full px-3.5 py-2.5 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {employeeMode === 'login' ? 'Kata Sandi / Password *' : 'Buat Kata Sandi (Min. 6 Karakter) *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kode Keamanan (Captcha) *
                </label>
                <CaptchaCanvas code={captchaCode} onRefresh={refreshCaptcha} />
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="Ketik 5 huruf/angka pada gambar di atas"
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular uppercase tracking-widest border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-indigo-700"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                {employeeMode === 'login' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{busy ? 'Memeriksa Akun Pegawai...' : 'Masuk Sebagai Pegawai'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{busy ? 'Mengirim Aktivasi...' : 'Daftar NIP & Ajukan Verifikasi'}</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                {employeeMode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => setEmployeeMode('register')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Belum punya password NIP? Ajukan Aktivasi Pegawai</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEmployeeMode('login')}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline"
                  >
                    ← Kembali ke Form Login Pegawai
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
