import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const nextToast = { id, ...toast };
    setToasts((current) => [...current, nextToast]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-2xl border px-4 py-3 shadow-2xl transition transform duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500 text-red-200'
                : 'bg-sky-500/10 border-sky-500 text-sky-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{toast.title}</p>
                {toast.description && <p className="text-xs text-neutral-gray mt-1">{toast.description}</p>}
              </div>
              <button type="button" className="text-neutral-gray hover:text-neutral-white" onClick={() => removeToast(toast.id)}>
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
