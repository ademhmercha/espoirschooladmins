import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getGroupApi, getSessionsByGroupApi, createSessionApi } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Group, Session } from '../../types';

type Tab = 'students' | 'sessions';

export default function TeacherGroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('sessions');

  // Session modal
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const loadSessions = async () => {
    const d = new Date();
    const res = await getSessionsByGroupApi(id!, d.getMonth() + 1, d.getFullYear());
    setSessions(res.data);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [gRes] = await Promise.all([getGroupApi(id!), ]);
        setGroup(gRes.data);
        const init: Record<string, boolean> = {};
        gRes.data.students.forEach((s: { _id: string }) => { init[s._id] = true; });
        setAttendance(init);
        const d = new Date();
        const sRes = await getSessionsByGroupApi(id!, d.getMonth() + 1, d.getFullYear());
        setSessions(sRes.data);
      } catch {
        showToast(t('error_generic'), 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const openSessionModal = () => {
    if (!group) return;
    if (sessions.length >= 4) { showToast(t('max_sessions_reached'), 'error'); return; }
    const init: Record<string, boolean> = {};
    group.students.forEach((s) => { init[s._id] = true; });
    setAttendance(init);
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionModal(true);
  };

  const handleSaveSession = async () => {
    if (!group) return;
    setSaving(true);
    try {
      const attendances = group.students.map((s) => ({
        student: s._id,
        present: attendance[s._id] ?? true,
      }));
      await createSessionApi({ group: id, date: sessionDate, attendances });
      showToast(t('session_saved'));
      setSessionModal(false);
      loadSessions();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg === 'Maximum 4 sessions per month reached' ? t('max_sessions_reached') : t('error_generic'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !group) return <LoadingSpinner fullPage />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sessions', label: t('sessions_tab') },
    { key: 'students', label: t('students_tab') },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/teacher/my-groups')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 text-xl">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-sm text-gray-500">{group.subject} · {group.schedule}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Sessions tab — teacher-friendly, phone-first */}
          {tab === 'sessions' && (
            <div className="space-y-4">
              {/* Counter + new session button */}
              <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <p className="text-5xl font-black text-blue-600">{sessions.length}/4</p>
                <p className="text-blue-700 font-medium mt-1">{t('sessions_this_month')}</p>
              </div>

              <button
                onClick={openSessionModal}
                disabled={sessions.length >= 4}
                className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
              >
                + {t('new_session')}
              </button>

              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">{t('no_sessions')}</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, i) => {
                    const presentCount = session.attendances.filter((a) => a.present).length;
                    return (
                      <div key={session._id} className="p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900 text-base">
                            Séance {sessions.length - i}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-green-600">{presentCount}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-2xl font-bold text-gray-700">{session.attendances.length}</span>
                          <span className="text-sm text-gray-500 ms-1">{t('presences')}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {session.attendances.map((a) => (
                            <span
                              key={a.student._id}
                              className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                                a.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 line-through opacity-70'
                              }`}
                            >
                              {a.student.firstName} {a.student.lastName}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Students tab */}
          {tab === 'students' && (
            <div>
              {group.students.length === 0 ? (
                <div className="text-center py-10 text-gray-400">{t('no_students_in_group')}</div>
              ) : (
                <div className="space-y-2">
                  {group.students.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                      {s.parentPhone && (
                        <a href={`tel:${s.parentPhone}`} className="text-sm text-blue-600 font-medium">
                          📞 {s.parentPhone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session modal — full screen on mobile */}
      {sessionModal && (
        <Modal title={`${t('new_session')} — ${sessions.length + 1}/4`} onClose={() => setSessionModal(false)} size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('session_date')}</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">{t('students_tab')}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const all: Record<string, boolean> = {};
                      group.students.forEach((s) => { all[s._id] = true; });
                      setAttendance(all);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    Tous présents
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {group.students.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setAttendance((prev) => ({ ...prev, [s._id]: !prev[s._id] }))}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                      attendance[s._id]
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="font-semibold text-gray-900 text-base">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className={`text-2xl ${attendance[s._id] ? '' : 'opacity-50'}`}>
                      {attendance[s._id] ? '✅' : '❌'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSession}
              disabled={saving}
              className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? t('loading') : `✅ ${t('validate')}`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
