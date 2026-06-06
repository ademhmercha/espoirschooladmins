import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  getGroupApi, getStudentsApi, addStudentToGroupApi, removeStudentFromGroupApi,
  getSessionsByGroupApi, createSessionApi,
  getPaymentsApi, generatePaymentsApi, updatePaymentApi,
} from '../../api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Group, Student, Session, Payment } from '../../types';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];
const getCurrentMonth = () => { const d = new Date(); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

type Tab = 'students' | 'sessions' | 'payments';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('students');

  // Session modal state
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [savingSession, setSavingSession] = useState(false);

  // Add student modal
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  // Remove student confirm
  const [removeTarget, setRemoveTarget] = useState<{ _id: string; firstName: string; lastName: string } | null>(null);

  const loadGroup = async () => {
    try {
      const res = await getGroupApi(id!);
      setGroup(res.data);
      const initAttendance: Record<string, boolean> = {};
      res.data.students.forEach((s: { _id: string }) => { initAttendance[s._id] = true; });
      setAttendance(initAttendance);
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

  const loadSessions = async () => {
    const d = new Date();
    const res = await getSessionsByGroupApi(id!, d.getMonth() + 1, d.getFullYear());
    setSessions(res.data);
  };

  const loadPayments = async () => {
    await generatePaymentsApi(getCurrentMonth());
    const res = await getPaymentsApi(getCurrentMonth(), id);
    setPayments(res.data);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadGroup();
        const [, , studentsRes] = await Promise.all([
          loadSessions(), loadPayments(), getStudentsApi(),
        ]);
        setAllStudents(studentsRes.data);
      } catch {
        showToast(t('error_generic'), 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const availableStudents = allStudents.filter(
    (s) => !group?.students.some((gs) => gs._id === s._id)
  );

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    try {
      await addStudentToGroupApi(id!, selectedStudent);
      showToast(t('saved'));
      setAddStudentModal(false);
      setSelectedStudent('');
      loadGroup();
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

  const handleRemoveStudent = async () => {
    if (!removeTarget) return;
    try {
      await removeStudentFromGroupApi(id!, removeTarget._id);
      showToast(t('deleted'));
      setRemoveTarget(null);
      loadGroup();
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

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
    setSavingSession(true);
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
      setSavingSession(false);
    }
  };

  const togglePayment = async (payment: Payment) => {
    try {
      const newStatus = payment.status === 'paid' ? 'unpaid' : 'paid';
      await updatePaymentApi(payment._id, { status: newStatus });
      setPayments((prev) => prev.map((p) => p._id === payment._id ? { ...p, status: newStatus, paidAt: newStatus === 'paid' ? new Date().toISOString() : null } : p));
    } catch {
      showToast(t('error_generic'), 'error');
    }
  };

  if (loading || !group) return <LoadingSpinner fullPage />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'students', label: t('students_tab') },
    { key: 'sessions', label: t('sessions_tab') },
    { key: 'payments', label: t('payments_tab') },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/groups')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-sm text-gray-500">
            {group.teacher.name} · {group.subject} · {group.schedule} · {group.monthlyPrice} DT/mois
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Students tab */}
          {tab === 'students' && (
            <div className="space-y-4">
              <button
                onClick={() => setAddStudentModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
              >
                + {t('add_student_to_group')}
              </button>

              {group.students.length === 0 ? (
                <div className="text-center py-10 text-gray-400">{t('no_students_in_group')}</div>
              ) : (
                <div className="space-y-2">
                  {group.students.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                        {s.parentPhone && <span className="text-sm text-gray-500 ms-3">{s.parentPhone}</span>}
                      </div>
                      <button
                        onClick={() => setRemoveTarget(s)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sessions tab */}
          {tab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {sessions.length}/4 {t('sessions_counter')}
                  {sessions.length >= 4 && <span className="ms-2 text-orange-600">({t('max_sessions_reached')})</span>}
                </span>
                <button
                  onClick={openSessionModal}
                  disabled={sessions.length >= 4}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + {t('new_session')}
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">{t('no_sessions')}</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, i) => {
                    const presentCount = session.attendances.filter((a) => a.present).length;
                    return (
                      <div key={session._id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            Séance {sessions.length - i} — {new Date(session.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {presentCount}/{session.attendances.length} {t('presences')}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {session.attendances.map((a) => (
                            <span
                              key={a.student._id}
                              className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                                a.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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

          {/* Payments tab */}
          {tab === 'payments' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{getCurrentMonth()}</p>
              {payments.length === 0 ? (
                <div className="text-center py-10 text-gray-400">{t('no_payments')}</div>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-900">{p.student.firstName} {p.student.lastName}</span>
                      <button
                        onClick={() => togglePayment(p)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors ${
                          p.status === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {p.status === 'paid' ? '✅ ' + t('paid').replace(' ✅','') : '❌ ' + t('unpaid').replace(' ❌','')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add student modal */}
      {addStudentModal && (
        <Modal title={t('add_student_to_group')} onClose={() => setAddStudentModal(false)} size="sm">
          <div className="space-y-4">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t('select_student')}</option>
              {availableStudents.map((s) => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAddStudentModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50">
                {t('cancel')}
              </button>
              <button onClick={handleAddStudent} disabled={!selectedStudent} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {t('add')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Session modal */}
      {sessionModal && (
        <Modal title={t('new_session')} onClose={() => setSessionModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('session_date')}</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t('students_tab')}</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {group.students.map((s) => (
                  <label
                    key={s._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                  >
                    <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${attendance[s._id] ? 'text-green-600' : 'text-red-500'}`}>
                        {attendance[s._id] ? t('present') : t('absent')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttendance((prev) => ({ ...prev, [s._id]: !prev[s._id] }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          attendance[s._id] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${attendance[s._id] ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSessionModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50">
                {t('cancel')}
              </button>
              <button onClick={handleSaveSession} disabled={savingSession} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {savingSession ? '...' : t('validate')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {removeTarget && (
        <ConfirmDialog
          message={t('remove_student_confirm')}
          onConfirm={handleRemoveStudent}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
