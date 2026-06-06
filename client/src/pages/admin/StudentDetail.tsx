import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getStudentApi, updateStudentApi, getStudentPaymentHistoryApi, getSessionsByGroupApi } from '../../api';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Student, Payment, Session } from '../../types';

const LEVELS = ['Primaire', 'Collège', 'Lycée', 'Bac'];

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessionStats, setSessionStats] = useState({ attended: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', level: '', parentPhone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, pRes] = await Promise.all([getStudentApi(id!), getStudentPaymentHistoryApi(id!)]);
        setStudent(sRes.data);
        setPayments(pRes.data);
        setForm({
          firstName: sRes.data.firstName,
          lastName: sRes.data.lastName,
          level: sRes.data.level,
          parentPhone: sRes.data.parentPhone,
        });

        // Compute attendance stats for current month
        const now = new Date();
        let attended = 0;
        let total = 0;
        for (const group of sRes.data.groups) {
          const sessRes = await getSessionsByGroupApi(group._id, now.getMonth() + 1, now.getFullYear());
          const groupSessions: Session[] = sessRes.data;
          for (const session of groupSessions) {
            const att = session.attendances.find((a) => a.student._id === id);
            if (att) {
              total++;
              if (att.present) attended++;
            }
          }
        }
        setSessionStats({ attended, total });
      } catch {
        showToast(t('error_generic'), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateStudentApi(id!, form);
      setStudent(res.data);
      setEditModal(false);
      showToast(t('saved'));
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !student) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/students')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">←</button>
        <h1 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
      </div>

      {/* Student info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{t('student_info')}</h2>
          <button onClick={() => setEditModal(true)} className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50">
            {t('edit')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">{t('level')} : </span><span className="font-medium">{t(student.level as 'Primaire')}</span></div>
          <div><span className="text-gray-500">{t('parent_phone')} : </span><span className="font-medium">{student.parentPhone}</span></div>
          <div className="col-span-2">
            <span className="text-gray-500">{t('student_groups')} : </span>
            <span className="font-medium">{student.groups.map((g) => g.name).join(', ') || '—'}</span>
          </div>
        </div>
      </div>

      {/* Attendance summary this month */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">{t('attendance_summary')}</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-blue-600">{sessionStats.attended}/{sessionStats.total}</div>
          <div className="text-sm text-gray-500">{t('sessions_attended')}</div>
        </div>
        {sessionStats.total > 0 && (
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(sessionStats.attended / sessionStats.total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('payment_history')}</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t('no_payment_history')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('month')}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('groups')}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('status')}</th>
                  <th className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('payment_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">{p.month}</td>
                    <td className="px-5 py-3 text-gray-600">{p.group.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${p.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {p.status === 'paid' ? '✅ Payé' : '❌ Non payé'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editModal && (
        <Modal title={t('edit_student')} onClose={() => setEditModal(false)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('first_name')}</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('last_name')}</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('level')}</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {LEVELS.map((l) => <option key={l} value={l}>{t(l as 'Primaire')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('parent_phone')}</label>
              <input type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50">
                {t('cancel')}
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {saving ? '...' : t('save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
