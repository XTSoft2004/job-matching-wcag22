import { useState } from 'react';
import { DollarSign, Users, Shield, FileText, HelpCircle } from 'lucide-react';

export default function GrossToNet() {
  const [grossSalary, setGrossSalary] = useState<string>('15000000');
  const [dependents, setDependents] = useState<number>(0);
  const [insuranceSalary, setInsuranceSalary] = useState<string>('');
  const [isCustomInsurance, setIsCustomInsurance] = useState<boolean>(false);

  // Constants for 2026 Vietnamese Labor Law
  const REGION_MAX_SALARY_BH = 46800000; // 20 * Basic salary (assumed 2.34M)
  const PERSONAL_RELIEF = 11000000;
  const DEPENDENT_RELIEF = 4400000;

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const calculate = () => {
    const gross = parseFloat(grossSalary) || 0;
    const depCount = dependents || 0;
    
    // Custom or Gross insurance salary base
    let insBase = isCustomInsurance ? (parseFloat(insuranceSalary) || 0) : gross;
    // Max cap for BHXH & BHYT is 20 times basic salary
    const bhxhBase = Math.min(insBase, REGION_MAX_SALARY_BH);
    const bhytBase = Math.min(insBase, REGION_MAX_SALARY_BH);
    // BHTN base cap is 20 times regional minimum salary (typically around 93.6M)
    const bhtnBase = Math.min(insBase, 93600000);

    // Insurance rates
    const bhxh = bhxhBase * 0.08;
    const bhyt = bhytBase * 0.015;
    const bhtn = bhtnBase * 0.01;
    const totalInsurance = bhxh + bhyt + bhtn;

    // Income before tax
    const incomeBeforeTax = gross - totalInsurance;

    // Reliefs
    const personalRelief = PERSONAL_RELIEF;
    const dependentRelief = depCount * DEPENDENT_RELIEF;
    const totalRelief = personalRelief + dependentRelief;

    // Taxable income
    const taxableIncome = Math.max(0, incomeBeforeTax - totalRelief);

    // Personal Income Tax (PIT) - Progressive rates
    let pit = 0;
    const brackets = [
      { limit: 5000000, rate: 0.05 },
      { limit: 10000000, rate: 0.10 },
      { limit: 18000000, rate: 0.15 },
      { limit: 32000000, rate: 0.20 },
      { limit: 52000000, rate: 0.25 },
      { limit: 80000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 }
    ];

    let remainingTaxable = taxableIncome;
    let prevLimit = 0;
    const breakdown = [];

    for (let i = 0; i < brackets.length; i++) {
      const { limit, rate } = brackets[i];
      const currentRange = limit - prevLimit;
      
      if (remainingTaxable > 0) {
        const taxableInBracket = Math.min(remainingTaxable, currentRange);
        const taxInBracket = taxableInBracket * rate;
        pit += taxInBracket;
        
        breakdown.push({
          level: i + 1,
          taxable: taxableInBracket,
          rate: rate * 100,
          tax: taxInBracket
        });
        
        remainingTaxable -= taxableInBracket;
      }
      prevLimit = limit;
    }

    const netSalary = gross - totalInsurance - pit;

    return {
      gross,
      bhxh,
      bhyt,
      bhtn,
      totalInsurance,
      incomeBeforeTax,
      personalRelief,
      dependentRelief,
      totalRelief,
      taxableIncome,
      pit,
      netSalary,
      breakdown
    };
  };

  const results = calculate();

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Công Cụ Tính Lương Gross To Net
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          Áp dụng quy định Bảo Hiểm và Thuế Thu Nhập Cá Nhân mới nhất năm 2026. Công cụ giúp bạn dễ dàng chuyển đổi mức lương Gross sang Net nhanh chóng và chính xác.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (4 cols) */}
        <section className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" aria-label="Nhập thông tin lương">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            Nhập thông tin tính lương
          </h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="gross-salary" className="block text-sm font-semibold text-gray-700 mb-2">
                Lương Gross (VND) <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold text-sm">₫</span>
                </div>
                <input
                  type="number"
                  name="gross-salary"
                  id="gross-salary"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-base font-medium"
                  placeholder="Ví dụ: 15,000,000"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="dependents" className="block text-sm font-semibold text-gray-700 mb-2">
                Số người phụ thuộc (Người)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  name="dependents"
                  id="dependents"
                  min="0"
                  value={dependents}
                  onChange={(e) => setDependents(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-base font-medium"
                  placeholder="0"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Giảm trừ {formatVND(DEPENDENT_RELIEF)}/tháng đối với mỗi người phụ thuộc.</p>
            </div>

            <div className="border-t border-gray-150 pt-4">
              <div className="flex items-center mb-3">
                <input
                  id="custom-insurance-toggle"
                  name="custom-insurance-toggle"
                  type="checkbox"
                  checked={isCustomInsurance}
                  onChange={(e) => setIsCustomInsurance(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="custom-insurance-toggle" className="ml-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                  Đóng bảo hiểm trên mức lương khác
                </label>
              </div>

              {isCustomInsurance && (
                <div>
                  <label htmlFor="insurance-salary" className="block text-sm font-semibold text-gray-700 mb-2">
                    Lương đóng bảo hiểm (VND)
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-bold text-sm">₫</span>
                    </div>
                    <input
                      type="number"
                      name="insurance-salary"
                      id="insurance-salary"
                      value={insuranceSalary}
                      onChange={(e) => setInsuranceSalary(e.target.value)}
                      className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-base font-medium"
                      placeholder="Ví dụ: 5,000,000"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Results (7 cols) */}
        <section className="lg:col-span-7 space-y-6" aria-label="Kết quả chuyển đổi">
          {/* Main Net Result Box */}
          <div className="bg-gradient-to-br from-[#004D25] to-[#002B14] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-5">
              <DollarSign className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-sm font-bold tracking-wider text-emerald-100 uppercase">LƯƠNG THỰC NHẬN (NET)</p>
                <p className="text-3xl md:text-4xl font-black mt-1 text-emerald-400" id="calculated-net-salary">
                  {formatVND(results.netSalary)}
                </p>
              </div>
              <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-emerald-800/60 pt-3 md:pt-0 md:pl-6">
                <p className="text-xs font-semibold text-emerald-200">Lương Gross ban đầu: {formatVND(results.gross)}</p>
                <p className="text-xs font-semibold text-emerald-200 mt-1">Tổng bảo hiểm đóng: {formatVND(results.totalInsurance)}</p>
                <p className="text-xs font-semibold text-emerald-200 mt-1">Thuế thu nhập cá nhân: {formatVND(results.pit)}</p>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-150 bg-gray-50/70">
              <h3 className="font-bold text-gray-900 text-base">Chi tiết các khoản khấu trừ</h3>
            </div>
            
            <div className="divide-y divide-gray-100 text-sm">
              <div className="px-6 py-3.5 flex justify-between items-center bg-emerald-50/20">
                <span className="font-bold text-emerald-900">Lương GROSS</span>
                <span className="font-bold text-emerald-950 text-base">{formatVND(results.gross)}</span>
              </div>
              
              <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Bảo hiểm xã hội (8%)
                </span>
                <span className="font-medium text-gray-900">-{formatVND(results.bhxh)}</span>
              </div>

              <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Bảo hiểm y tế (1.5%)
                </span>
                <span className="font-medium text-gray-900">-{formatVND(results.bhyt)}</span>
              </div>

              <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Bảo hiểm thất nghiệp (1%)
                </span>
                <span className="font-medium text-gray-900">-{formatVND(results.bhtn)}</span>
              </div>

              <div className="px-6 py-3.5 flex justify-between items-center bg-gray-50/50">
                <span className="font-bold text-gray-800">Thu nhập trước thuế</span>
                <span className="font-bold text-gray-900">{formatVND(results.incomeBeforeTax)}</span>
              </div>

              <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-500">Giảm trừ gia cảnh bản thân</span>
                <span className="font-medium text-gray-600">-{formatVND(results.personalRelief)}</span>
              </div>

              {results.dependentRelief > 0 && (
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-gray-500">Giảm trừ người phụ thuộc ({dependents} người)</span>
                  <span className="font-medium text-gray-600">-{formatVND(results.dependentRelief)}</span>
                </div>
              )}

              <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-800 font-semibold">Thu nhập tính thuế</span>
                <span className="font-bold text-gray-900">{formatVND(results.taxableIncome)}</span>
              </div>

              <div className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Thuế thu nhập cá nhân (TNCN)
                </span>
                <span className="font-bold text-red-600">-{formatVND(results.pit)}</span>
              </div>

              <div className="px-6 py-4 flex justify-between items-center bg-emerald-500/10">
                <span className="font-bold text-emerald-950 text-base">Thực nhận (NET)</span>
                <span className="font-extrabold text-emerald-700 text-lg">{formatVND(results.netSalary)}</span>
              </div>
            </div>
          </div>

          {/* PIT progressive tax details */}
          {results.pit > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 text-base">Chi tiết lũy tiến thuế cá nhân</h4>
              <div className="space-y-3">
                {results.breakdown.map((row) => (
                  <div key={row.level} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Bậc {row.level} ({row.rate}%): Thu nhập tính thuế {formatVND(row.taxable)}</span>
                    <span className="font-semibold text-gray-900">{formatVND(row.tax)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Info Section */}
      <section className="mt-12 bg-gray-50 border border-gray-200 rounded-2xl p-6" aria-labelledby="rules-heading">
        <h3 id="rules-heading" className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          Quy tắc khấu trừ và thuế lũy tiến
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">1. Bảo hiểm bắt buộc năm 2026</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>BHXH: 8% (Lương trần tối đa tính BH: {formatVND(REGION_MAX_SALARY_BH)})</li>
              <li>BHYT: 1.5% (Lương trần tối đa tính BH: {formatVND(REGION_MAX_SALARY_BH)})</li>
              <li>BHTN: 1% (Lương trần tối đa tính BH: {formatVND(93600000)})</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">2. Giảm trừ thuế thu nhập cá nhân</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Giảm trừ gia cảnh bản thân: {formatVND(PERSONAL_RELIEF)}/tháng</li>
              <li>Giảm trừ người phụ thuộc: {formatVND(DEPENDENT_RELIEF)}/tháng/người</li>
              <li>Thuế lũy tiến từng phần áp dụng từ mức thuế suất 5% đến 35%.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
