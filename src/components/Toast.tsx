import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const colorMap = {
            success: 'bg-green/10 border-green/30 text-green',
            error: 'bg-red/10 border-red/30 text-red',
            info: 'bg-mauve/10 border-mauve/30 text-mauve',
          };

          const IconMap = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info,
          };

          const Icon = IconMap[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md bg-mantle/95 shadow-2xl ${colorMap[toast.type]}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="shrink-0" />
                <span className="text-sm font-medium text-text">{toast.message}</span>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-lg text-subtext0 hover:text-text hover:bg-surface0 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
