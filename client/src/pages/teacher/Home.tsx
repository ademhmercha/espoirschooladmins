import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getGroupsApi } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Group } from '../../types';

export default function TeacherHome() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroupsApi()
      .then((res) => setGroups(res.data))
      .catch(() => showToast(t('error_generic'), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const levelColors: Record<string, string> = {
    Primaire: 'bg-green-50 text-green-700 border-green-200',
    Collège: 'bg-blue-50 text-blue-700 border-blue-200',
    Lycée: 'bg-purple-50 text-purple-700 border-purple-200',
    Bac: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">{t('my_groups')}</h1>

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-gray-400">{t('no_groups')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => navigate(`/teacher/groups/${group._id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${levelColors[group.level] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {t(group.level as 'Primaire')}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📘</span>
                  <span className="font-medium">{group.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>{group.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👨‍🎓</span>
                  <span>{group.students.length} {t('students_count')}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50">
                <span className="text-blue-600 text-sm font-semibold">Voir les séances →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
