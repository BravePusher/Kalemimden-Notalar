import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, KeyRound, X, AlertCircle, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'McKuru' && password === 'kalemimdenotalar') {
      setError('');
      setUsername('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-crust/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-mantle border border-surface1 rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-surface1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-mauve/20 border border-mauve/30 flex items-center justify-center text-mauve">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">Admin Girişi</h3>
                <p className="text-xs text-subtext0">Yönetim paneline erişmek için giriş yapın</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-subtext0 hover:text-text hover:bg-surface0 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red/10 border border-red/30 rounded-xl text-red text-sm flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtext1 mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-mauve" /> Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                autoFocus
                className="w-full bg-surface0 border border-surface1 rounded-xl px-4 py-2.5 text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtext1 mb-1.5 flex items-center gap-1.5">
                <KeyRound size={14} className="text-mauve" /> Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="w-full bg-surface0 border border-surface1 rounded-xl px-4 py-2.5 text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve transition-colors text-sm"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-subtext0 hover:bg-surface0 hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-mauve text-base font-semibold px-6 py-2.5 rounded-xl hover:bg-mauve/90 transition-colors shadow-lg shadow-mauve/20 text-sm"
              >
                <LogIn size={16} />
                <span>Giriş Yap</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
