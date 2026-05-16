import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast-Container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md
              animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto
              ${toast.type === 'success' ? 'bg-emerald-600/95 border-emerald-400 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-600/95 border-blue-400 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-500/95 border-yellow-300 text-slate-900' : ''}
              ${toast.type === 'error' ? 'bg-red-600/95 border-red-400 text-white' : ''}
            `}
          >
            <div className="flex-1 text-sm font-black uppercase tracking-wide">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};