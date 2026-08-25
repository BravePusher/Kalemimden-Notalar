import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Poem } from '../types';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  poem: Poem | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  poem,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !poem) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
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
          className="relative w-full max-w-md bg-mantle border border-red/30 rounded-3xl p-6 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-3">
            <div className="w-12 h-12 rounded-2xl bg-red/10 border border-red/30 flex items-center justify-center text-red">
              <AlertTriangle size={24} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-subtext0 hover:text-text hover:bg-surface0 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-text mt-3">Şiiri Sil</h3>
          <p className="text-sm text-subtext0 mt-2 leading-relaxed">
            <span className="font-semibold text-text">"{poem.title}"</span> başlıklı şiiri Firebase Firestore veritabanından kalıcı olarak silmek istediğinize emin misiniz?
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-subtext0 hover:bg-surface0 hover:text-text transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red text-base font-semibold px-5 py-2.5 rounded-xl hover:bg-red/90 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="inline-block w-4 h-4 border-2 border-base border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>Kalıcı Olarak Sil</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
