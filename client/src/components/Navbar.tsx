import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-gray-700 text-sm hidden sm:block">
          {user?.name}
          {user?.subject && <span className="text-gray-400 font-normal"> — {user.subject}</span>}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLang}
          className="px-3 py-1.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
          title="Toggle language"
        >
          {lang === 'fr' ? 'عر' : 'FR'}
        </button>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
