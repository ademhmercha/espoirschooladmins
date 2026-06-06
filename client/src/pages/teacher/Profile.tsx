import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { updateTeacherApi } from '../../api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t('passwords_no_match'), 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mot de passe trop court (min 6 caractères)', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await updateTeacherApi(user._id, { password: newPassword });
      updateUser(res.data);
      setNewPassword('');
      setConfirmPassword('');
      showToast(t('password_changed'));
    } catch {
      showToast(t('error_generic'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">{t('my_profile')}</h1>

      {/* Profile info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {user.subject && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-lg">📘</span>
              <div>
                <p className="text-xs text-gray-400">{t('subject')}</p>
                <p className="font-medium text-gray-900">{user.subject}</p>
              </div>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-lg">📞</span>
              <div>
                <p className="text-xs text-gray-400">{t('phone')}</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-lg">📧</span>
            <div>
              <p className="text-xs text-gray-400">{t('email')}</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">{t('change_password')}</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('new_password')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirm_password')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {saving ? '...' : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}
