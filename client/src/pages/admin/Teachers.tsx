import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getTeachersApi, createTeacherApi, updateTeacherApi, deleteTeacherApi } from '../../api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User } from '../../types';

interface TeacherForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  subject: string;
}

const empty: TeacherForm = { name: '', email: '', password: '', phone: '', subject: '' };

export default function Teachers() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<TeacherForm>(empty);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const load = async () => {
    try {
      const res = await getTeachersApi();
      setTeachers(res.data);
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (t: User) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, password: '', phone: t.phone, subject: t.subject });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: form.name, email: form.email, phone: form.phone, subject: form.subject };
      if (form.password) payload.password = form.password;

      if (editing) {
        await updateTeacherApi(editing._id, payload);
      } else {
        if (!form.password) { showToast(t('password') + ' requis', 'error'); setSaving(false); return; }
        await createTeacherApi({ ...payload, password: form.password });
      }
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
      await deleteTeacherApi(deleteTarget._id);
      showToast(t('deleted'));
      setDeleteTarget(null);
      load();
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('teachers')}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <span>+</span> {t('add_teacher')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {teachers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{t('no_teachers')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[t('teacher_name'), t('subject'), t('phone'), t('groups_count'), t('action')].map((h) => (
                    <th key={h} className="text-start px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{teacher.subject || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{teacher.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                        {teacher.groupCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(teacher)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(teacher)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? t('edit_teacher') : t('add_teacher')} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: t('teacher_name'), key: 'name', type: 'text', required: true },
              { label: t('email'), key: 'email', type: 'email', required: true },
              { label: editing ? t('new_password_optional') : t('password'), key: 'password', type: 'password', required: !editing },
              { label: t('phone'), key: 'phone', type: 'tel', required: false },
              { label: t('subject'), key: 'subject', type: 'text', required: false },
            ].map(({ label, key, type, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof TeacherForm]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                {t('cancel')}
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? '...' : t('save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
