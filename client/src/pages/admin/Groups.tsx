import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getGroupsApi, createGroupApi, updateGroupApi, deleteGroupApi, getTeachersApi } from '../../api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Group, User } from '../../types';

const LEVELS = ['Primaire', 'Collège', 'Lycée', 'Bac'];

interface GroupForm {
  name: string;
  teacher: string;
  subject: string;
  level: string;
  schedule: string;
  monthlyPrice: string;
}

const empty: GroupForm = { name: '', teacher: '', subject: '', level: '', schedule: '', monthlyPrice: '' };

export default function Groups() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState<GroupForm>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  const load = async () => {
    try {
      const [g, u] = await Promise.all([getGroupsApi(), getTeachersApi()]);
      setGroups(g.data);
      setTeachers(u.data);
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (g: Group) => {
    setEditing(g);
    setForm({
      name: g.name, teacher: g.teacher._id, subject: g.subject,
      level: g.level, schedule: g.schedule, monthlyPrice: String(g.monthlyPrice),
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, monthlyPrice: Number(form.monthlyPrice) };
      if (editing) await updateGroupApi(editing._id, payload);
      else await createGroupApi(payload);
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
      await deleteGroupApi(deleteTarget._id);
      showToast(t('deleted'));
      setDeleteTarget(null);
      load();
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

  const levelColors: Record<string, string> = {
    Primaire: 'bg-green-50 text-green-700',
    Collège: 'bg-blue-50 text-blue-700',
    Lycée: 'bg-purple-50 text-purple-700',
    Bac: 'bg-orange-50 text-orange-700',
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('groups')}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <span>+</span> {t('add_group')}
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          {t('no_groups')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/groups/${group._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{group.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ms-2 ${levelColors[group.level] || 'bg-gray-50 text-gray-600'}`}>
                  {t(group.level as 'Primaire')}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                <p>👩‍🏫 <span className="font-medium">{group.teacher.name}</span></p>
                <p>📘 {group.subject}</p>
                <p>🕐 {group.schedule}</p>
                <p>👨‍🎓 {group.students.length} {t('students_count')}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="font-bold text-blue-600">{group.monthlyPrice} DT/mois</span>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(group)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(group)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editing ? t('edit_group') : t('add_group')} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('group_name')}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher')}</label>
              <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">{t('select_teacher')}</option>
                {teachers.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('subject')}</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('schedule')}</label>
              <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: Lundi 15h" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('monthly_price')}</label>
              <input type="number" min="0" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} required
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

      {deleteTarget && (
        <ConfirmDialog onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
