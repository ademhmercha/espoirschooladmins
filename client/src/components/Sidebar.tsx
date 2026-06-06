import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKey } from '../data/translations';

interface NavItem {
  to: string;
  icon: string;
  key: TranslationKey;
}

const adminLinks: NavItem[] = [
  { to: '/dashboard', icon: '📊', key: 'dashboard' },
  { to: '/teachers', icon: '👩‍🏫', key: 'teachers' },
  { to: '/groups', icon: '📚', key: 'groups' },
  { to: '/students', icon: '👨‍🎓', key: 'students' },
  { to: '/payments', icon: '💰', key: 'payments' },
];

const teacherLinks: NavItem[] = [
  { to: '/teacher/my-groups', icon: '📚', key: 'my_groups' },
  { to: '/teacher/profile', icon: '👤', key: 'profile' },
];

interface SidebarProps {
  role: 'admin' | 'teacher';
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const links = role === 'admin' ? adminLinks : teacherLinks;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 z-30 w-64 bg-white border-gray-200 flex flex-col
          transform transition-transform duration-250 ease-in-out
          ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
          ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
          md:static md:translate-x-0
        `}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-100 shrink-0">
          <span className="text-xl font-bold text-blue-600">L'Espoir</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-lg font-semibold text-gray-500">الأمل</span>
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span>{t(link.key)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
