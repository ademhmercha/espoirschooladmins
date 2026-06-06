import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getStudentsApi, createStudentApi, updateStudentApi, deleteStudentApi, getPaymentsApi, generatePaymentsApi } from '../../api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Student, Payment } from '../../types';

const LEVELS = ['Primaire', 'Collège', 'Lycée', 'Bac'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const getCurrentMonth = () => { const d = new Date(); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

interface StudentForm { firstName: string; lastName: string; level: string; parentPhone: string; }
const empty: StudentForm = { firstName: '', lastName: '', level: '', parentPhone: '' };

export default function Students() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const load = async () => {
    try {
      const month = getCurrentMonth();
      await generatePaymentsApi(month);
      const [sRes, pRes] = await Promise.all([getStudentsApi(), getPaymentsApi(month)]);
      setStudents(sRes.data);
      setPayments(pRes.data);
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ firstName: s.firstName, lastName: s.lastName, level: s.level, parentPhone: s.parentPhone });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateStudentApi(editing._id, form);
      else await createStudentApi(form);
      showToast(t('saved'));
      closeModal();
      load();
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudentApi(deleteTarget._id);
      showToast(t('deleted'));
      setDeleteTarget(null);
      load();
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

  const getStudentPaymentStatus = (studentId: string): 'paid' | 'unpaid' | 'none' => {
    const studentPayments = payments.filter((p) => p.student._id === studentId);
    if (studentPayments.length === 0) return 'none';
    return studentPayments.every((p) => p.status === 'paid') ? 'paid' : 'unpaid';
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q);
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 shrink-0">{t('students')}</h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_student')}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
          />
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shrink-0"
          >
            + {t('add_student')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{search ? 'Aucun résultat' : t('no_students')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[t('name'), t('level'), t('parent_phone'), t('student_groups'), t('payment_status_month'), t('action')].map((h) => (
                    <th key={h} className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student) => {
                  const status = getStudentPaymentStatus(student._id);
                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => navigate(`/students/${student._id}`)}
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{t(student.level as 'Primaire')}</td>
                      <td className="px-5 py-3.5 text-gray-600">{student.parentPhone}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {student.groups.map((g) => (
                            <span key={g._id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {status === 'paid' && <span className="text-green-600 font-medium text-xs">✅ Payé</span>}
                        {status === 'unpaid' && <span className="text-red-600 font-medium text-xs">❌ Non payé</span>}
                        {status === 'none' && <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(student)} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                            {t('edit')}
                          </button>
                          <button onClick={() => setDeleteTarget(student)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                            {t('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? t('edit_student') : t('add_student')} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="">{t('select_level')}</option>
                {LEVELS.map((l) => <option key={l} value={l}>{t(l as 'Primaire')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('parent_phone')}</label>
              <input type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50">
                {t('cancel')}
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {saving ? '...' : t('save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <ConfirmDialog onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
