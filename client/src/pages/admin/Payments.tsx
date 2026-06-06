import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getPaymentsApi, generatePaymentsApi, updatePaymentApi } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Payment } from '../../types';

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonthIndex = () => new Date().getMonth();

export default function Payments() {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthIndex());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const monthStr = `${MONTHS_FR[selectedMonth]} ${selectedYear}`;

  const load = async () => {
    setLoading(true);
    try {
      await generatePaymentsApi(monthStr);
      const res = await getPaymentsApi(monthStr);
      setPayments(res.data);
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedMonth, selectedYear]);

  const togglePayment = async (payment: Payment) => {
    setToggling(payment._id);
    try {
      const newStatus = payment.status === 'paid' ? 'unpaid' : 'paid';
      const res = await updatePaymentApi(payment._id, { status: newStatus });
      setPayments((prev) => prev.map((p) => (p._id === payment._id ? res.data : p)));
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setToggling(null);
    }
  };

  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const unpaidCount = payments.filter((p) => p.status === 'unpaid').length;
  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.group?.monthlyPrice || 0), 0);

  const yearOptions = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('payments')}</h1>
      </div>

      {/* Month picker */}
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{t('month')} :</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {MONTHS_FR.map((m, i) => (
              <option key={i} value={i}>
                {lang === 'ar' ? MONTHS_AR[i] : m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">✅ {t('total_paid_count')}</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{paidCount}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">❌ {t('total_unpaid_count')}</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{unpaidCount}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">💰 {t('total_revenue')}</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{totalRevenue} DT</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{t('no_payments')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[t('name'), t('groups'), t('status'), t('payment_date'), t('action')].map((h) => (
                    <th key={h} className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {payment.student.firstName} {payment.student.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{payment.group.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        payment.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {payment.status === 'paid' ? '✅ Payé' : '❌ Non payé'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => togglePayment(payment)}
                        disabled={toggling === payment._id}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                          payment.status === 'paid'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {toggling === payment._id ? '...' : payment.status === 'paid' ? '❌ Annuler' : '✅ Marquer payé'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
