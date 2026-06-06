import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getDashboardApi, generatePaymentsApi, updatePaymentApi } from '../../api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardData, Payment } from '../../types';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];
const getCurrentMonth = () => {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default function Dashboard() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      await generatePaymentsApi(getCurrentMonth());
      const res = await getDashboardApi();
      setData(res.data);
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (payment: Payment) => {
    setMarking(payment._id);
    try {
      await updatePaymentApi(payment._id, { status: 'paid' });
      showToast(t('saved'));
      load();
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setMarking(null);
    }
  };

  if (loading || !data) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title={t('total_students')} value={data.totalStudents} icon="👨‍🎓" color="blue" />
        <StatCard title={t('total_teachers')} value={data.totalTeachers} icon="👩‍🏫" color="purple" />
        <StatCard title={t('total_groups')} value={data.totalGroups} icon="📚" color="orange" />
        <StatCard title={t('revenue_this_month')} value={`${data.revenueThisMonth} DT`} icon="💰" color="green" />
      </div>

      {/* Unpaid students */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('unpaid_students')}</h2>
        </div>

        {data.unpaidThisMonth.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t('no_unpaid')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('name')}
                  </th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('groups')}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.unpaidThisMonth.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {p.student.firstName} {p.student.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{p.group.name}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => markPaid(p)}
                        disabled={marking === p._id}
                        className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {marking === p._id ? '...' : t('mark_paid')}
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
