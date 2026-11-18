import { useEffect, useState } from 'react';
import { Calculator, CheckCircle2, Download, Info, RotateCcw } from 'lucide-react';

type ZakatMode = 'penghasilan' | 'maal' | 'fitrah';

export interface YearlyZakatRates {
  hijriYear: string;
  goldPricePerGram: number;
  ricePricePerKg: number;
  skReference: string;
}

export const ZAKAT_RATES_BY_YEAR: Record<number, YearlyZakatRates> = {
  2026: {
    hijriYear: '1447 H',
    goldPricePerGram: 1450000,
    ricePricePerKg: 16000,
    skReference: 'SK BAZNAS & Kemenag Kab. Murung Raya Tahun 2026 / 1447 H',
  },
  2025: {
    hijriYear: '1446 H',
    goldPricePerGram: 1320000,
    ricePricePerKg: 15000,
    skReference: 'SK BAZNAS & Kemenag Kab. Murung Raya Tahun 2025 / 1446 H',
  },
  2024: {
    hijriYear: '1445 H',
    goldPricePerGram: 1150000,
    ricePricePerKg: 14000,
    skReference: 'SK BAZNAS & Kemenag Kab. Murung Raya Tahun 2024 / 1445 H',
  },
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

function parseNumericInput(val: string): number {
  const digits = val.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

interface ZakatCalculatorProps {
  selectedYear: number;
  onDownloadSimulation?: (summaryText: string) => void;
  downloading?: boolean;
}

export function ZakatCalculator({
  selectedYear,
  onDownloadSimulation,
  downloading = false,
}: ZakatCalculatorProps) {
  const yearDefaults = ZAKAT_RATES_BY_YEAR[selectedYear] || ZAKAT_RATES_BY_YEAR[2026];
  const [mode, setMode] = useState<ZakatMode>('penghasilan');

  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(yearDefaults.goldPricePerGram);
  const [monthlySalary, setMonthlySalary] = useState<number>(8500000);
  const [monthlyBonus, setMonthlyBonus] = useState<number>(2500000);
  const [monthlyDebt, setMonthlyDebt] = useState<number>(0);

  const [savingsTotal, setSavingsTotal] = useState<number>(120000000);
  const [goldAssetsValue, setGoldAssetsValue] = useState<number>(25000000);
  const [otherAssetsValue, setOtherAssetsValue] = useState<number>(0);
  const [dueDebtTotal, setDueDebtTotal] = useState<number>(5000000);

  const [personCount, setPersonCount] = useState<number>(4);
  const [ricePricePerKg, setRicePricePerKg] = useState<number>(yearDefaults.ricePricePerKg);

  useEffect(() => {
    const nextDefaults = ZAKAT_RATES_BY_YEAR[selectedYear] || ZAKAT_RATES_BY_YEAR[2026];
    setGoldPricePerGram(nextDefaults.goldPricePerGram);
    setRicePricePerKg(nextDefaults.ricePricePerKg);
  }, [selectedYear]);

  const nisabYearly = 85 * goldPricePerGram;
  const nisabMonthly = nisabYearly / 12;

  const netMonthlyIncome = Math.max(0, monthlySalary + monthlyBonus - monthlyDebt);
  const incomeMeetsNisab = netMonthlyIncome >= nisabMonthly;
  const incomeZakatMonthly = incomeMeetsNisab ? netMonthlyIncome * 0.025 : 0;

  const netMaalAssets = Math.max(
    0,
    savingsTotal + goldAssetsValue + otherAssetsValue - dueDebtTotal
  );
  const maalMeetsNisab = netMaalAssets >= nisabYearly;
  const maalZakatYearly = maalMeetsNisab ? netMaalAssets * 0.025 : 0;

  const fitrahRiceKg = Math.max(0, personCount) * 2.5;
  const fitrahCashTotal = fitrahRiceKg * ricePricePerKg;

  const handleReset = () => {
    setGoldPricePerGram(yearDefaults.goldPricePerGram);
    setMonthlySalary(8500000);
    setMonthlyBonus(2500000);
    setMonthlyDebt(0);
    setSavingsTotal(120000000);
    setGoldAssetsValue(25000000);
    setOtherAssetsValue(0);
    setDueDebtTotal(5000000);
    setPersonCount(4);
    setRicePricePerKg(yearDefaults.ricePricePerKg);
  };

  const buildSummaryText = (): string => {
    return [
      '================================================================',
      'HASIL SIMULASI KALKULATOR ZAKAT - KEMENAG KAB. MURUNG RAYA',
      `Tahun Acuan : ${selectedYear} (${yearDefaults.hijriYear})`,
      `Referensi   : ${yearDefaults.skReference}`,
      '================================================================',
      `Harga Emas Acuan      : ${formatRupiah(goldPricePerGram)} / gram`,
      `Nisab Tahunan (85 gr) : ${formatRupiah(nisabYearly)}`,
      `Nisab Bulanan         : ${formatRupiah(nisabMonthly)}`,
      '',
      '1. ZAKAT PENGHASILAN / PROFESI (2,5%)',
      `   Penghasilan Bersih / Bulan : ${formatRupiah(netMonthlyIncome)}`,
      `   Status Nisab               : ${incomeMeetsNisab ? 'Mencapai Nisab (Wajib Zakat)' : 'Belum Mencapai Nisab'}`,
      `   Nominal Zakat / Bulan      : ${formatRupiah(incomeZakatMonthly)}`,
      '',
      '2. ZAKAT MAAL / HARTA (2,5%)',
      `   Total Harta Bersih         : ${formatRupiah(netMaalAssets)}`,
      `   Status Nisab               : ${maalMeetsNisab ? 'Mencapai Nisab (Wajib Zakat jika Haul 1 Tahun)' : 'Belum Mencapai Nisab'}`,
      `   Nominal Zakat / Tahun      : ${formatRupiah(maalZakatYearly)}`,
      '',
      '3. ZAKAT FITRAH',
      `   Jumlah Jiwa                : ${personCount} orang`,
      `   Harga Beras / Kg           : ${formatRupiah(ricePricePerKg)}`,
      `   Takaran Beras Total        : ${fitrahRiceKg.toLocaleString('id-ID')} Kg`,
      `   Konversi Tunai             : ${formatRupiah(fitrahCashTotal)}`,
      '================================================================',
      'Kantor Kementerian Agama Kabupaten Murung Raya - Puruk Cahu',
    ].join('\n');
  };

  return (
    <div className="border border-emerald-200 dark:border-emerald-800/80 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200/80 dark:border-emerald-800/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Kalkulator Perhitungan Zakat Tahun {selectedYear} ({yearDefaults.hijriYear})
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {yearDefaults.skReference}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Nilai</span>
          </button>
          {onDownloadSimulation && (
            <button
              type="button"
              disabled={downloading}
              onClick={() => onDownloadSimulation(buildSummaryText())}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Memproses...' : `Unduh Hasil (${selectedYear})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'penghasilan' as const, label: 'Zakat Penghasilan' },
          { id: 'maal' as const, label: 'Zakat Maal (Harta)' },
          { id: 'fitrah' as const, label: 'Zakat Fitrah' },
        ].map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                active
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {mode !== 'fitrah' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Harga Emas Acuan Tahun {selectedYear} per Gram (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={goldPricePerGram.toLocaleString('id-ID')}
              onChange={(e) => setGoldPricePerGram(parseNumericInput(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>
          <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              Nisab 85 Gram Emas / Tahun:{' '}
              <strong className="text-slate-900 dark:text-white font-mono-tabular">
                {formatRupiah(nisabYearly)}
              </strong>
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Setara Nisab per Bulan:{' '}
              <strong className="text-emerald-800 dark:text-emerald-400 font-mono-tabular">
                {formatRupiah(nisabMonthly)}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Mode 1: Zakat Penghasilan */}
      {mode === 'penghasilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penghasilan / Gaji Pokok per Bulan (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={monthlySalary.toLocaleString('id-ID')}
                onChange={(e) => setMonthlySalary(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tunjangan / Pendapatan Lain per Bulan (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyBonus.toLocaleString('id-ID')}
                onChange={(e) => setMonthlyBonus(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cicilan Utang / Kebutuhan Pokok Mendesak per Bulan (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyDebt.toLocaleString('id-ID')}
                onChange={(e) => setMonthlyDebt(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penghasilan Bersih per Bulan
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono-tabular mt-0.5">
                {formatRupiah(netMonthlyIncome)}
              </p>
            </div>

            <div
              className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
                incomeMeetsNisab
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {incomeMeetsNisab ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              )}
              <span>
                {incomeMeetsNisab
                  ? 'Penghasilan Anda telah mencapai nisab bulanan sehingga wajib menunaikan zakat penghasilan 2,5%.'
                  : 'Penghasilan bersih belum mencapai nisab bulanan. Anda tetap dapat menunaikan infak atau sedekah.'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Zakat Penghasilan Wajib (2,5% / Bulan)
              </p>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono-tabular">
                {formatRupiah(incomeZakatMonthly)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                Atau setara {formatRupiah(incomeZakatMonthly * 12)} / tahun
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Zakat Maal */}
      {mode === 'maal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Tabungan / Deposito / Giro (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={savingsTotal.toLocaleString('id-ID')}
                onChange={(e) => setSavingsTotal(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nilai Emas / Perak / Saham / Investasi (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={goldAssetsValue.toLocaleString('id-ID')}
                onChange={(e) => setGoldAssetsValue(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nilai Harta Perniagaan / Aset Lancar Lainnya (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otherAssetsValue.toLocaleString('id-ID')}
                onChange={(e) => setOtherAssetsValue(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Utang Pribadi Jatuh Tempo Tahun Ini (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={dueDebtTotal.toLocaleString('id-ID')}
                onChange={(e) => setDueDebtTotal(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Harta Bersih (Haul 1 Tahun)
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono-tabular mt-0.5">
                {formatRupiah(netMaalAssets)}
              </p>
            </div>

            <div
              className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
                maalMeetsNisab
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {maalMeetsNisab ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              )}
              <span>
                {maalMeetsNisab
                  ? 'Harta simpanan mencapai nisab 85 gram emas. Apabila telah dimiliki selama 1 tahun (haul), wajib zakat 2,5%.'
                  : 'Total harta bersih belum mencapai nisab tahunan (85 gram emas).'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Zakat Maal Wajib (2,5% / Tahun)
              </p>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono-tabular">
                {formatRupiah(maalZakatYearly)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Zakat Fitrah */}
      {mode === 'fitrah' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Jiwa / Anggota Keluarga
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={personCount}
                onChange={(e) => setPersonCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Harga Beras Acuan {selectedYear} per Kg di Murung Raya (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={ricePricePerKg.toLocaleString('id-ID')}
                onChange={(e) => setRicePricePerKg(parseNumericInput(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono-tabular border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Takaran Beras (2,5 kg × {personCount} jiwa)
              </p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono-tabular mt-0.5">
                {fitrahRiceKg.toLocaleString('id-ID')} Kg Beras
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Atau Konversi Uang Tunai ({yearDefaults.hijriYear})
              </p>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono-tabular">
                {formatRupiah(fitrahCashTotal)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nominal per jiwa: {formatRupiah(2.5 * ricePricePerKg)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
