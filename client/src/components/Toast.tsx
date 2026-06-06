import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const colors = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export default function Toast() {
  const { toasts } = useToast();
  const { isRTL } = useLanguage();

  return (
    <div className={`fixed bottom-4 z-50 flex flex-col gap-2 ${isRTL ? 'left-4' : 'right-4'}`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium min-w-[220px] ${colors[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
