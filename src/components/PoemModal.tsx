import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Feather, User, Tag, FileText, Check, AlertCircle } from 'lucide-react';
import { Poem } from '../types';

interface PoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poemData: { title: string; poet: string; category: string; content: string[] }) => Promise<void>;
  initialPoem?: Poem | null;
  defaultCategory?: string;
}

const DEFAULT_CATEGORIES = [
  'Melih Duru',
  'Efdal Ürkmez',
  'Belinay Çelik',
  'Kemal Can Doğan',
  'Düet Şiirler',
  'Sizden Gelenler',
];

export const PoemModal: React.FC<PoemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPoem,
  defaultCategory = 'Sizden Gelenler',
}) => {
  const [title, setTitle] = useState('');
  const [poet, setPoet] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPoem) {
      setTitle(initialPoem.title);
      setPoet(initialPoem.poet);
      if (DEFAULT_CATEGORIES.includes(initialPoem.category)) {
        setCategory(initialPoem.category);
        setIsCustomCategory(false);
      } else {
        setCategory('custom');
        setIsCustomCategory(true);
        setCustomCategory(initialPoem.category);
      }
      setContent(initialPoem.content.join('\n'));
    } else {
      setTitle('');
      setPoet('');
      const targetCat = defaultCategory === 'all' ? 'Sizden Gelenler' : defaultCategory;
      if (DEFAULT_CATEGORIES.includes(targetCat)) {
        setCategory(targetCat);
        setIsCustomCategory(false);
      } else {
        setCategory('custom');
        setIsCustomCategory(true);
        setCustomCategory(targetCat);
      }
      setContent('');
    }
    setError('');
  }, [initialPoem, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen şiir için bir başlık giriniz.');
      return;
    }
    if (!poet.trim()) {
      setError('Lütfen şair adını giriniz.');
      return;
    }
    if (!content.trim()) {
      setError('Lütfen şiir dizelerini giriniz.');
      return;
    }

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'Diğer') : category;

    try {
      setIsSubmitting(true);
      setError('');
      const lines = content.split('\n');
      await onSave({
        title: title.trim(),
        poet: poet.trim(),
        category: finalCategory,
        content: lines,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Şiir kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
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
          className="relative w-full max-w-2xl bg-mantle border border-surface1 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between pb-4 border-b border-surface1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mauve/20 border border-mauve/30 flex items-center justify-center text-mauve">
                <Feather size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">
                  {initialPoem ? 'Şiiri Düzenle' : 'Yeni Şiir Yayımla'}
                </h3>
                <p className="text-xs text-subtext0">
                  {initialPoem ? 'Değişiklikler anında Firestore veritabanına kaydedilir.' : 'Yeni eser bulut veritabanına eklenir ve anında yayınlanır.'}
                </p>
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-subtext1 mb-1.5 flex items-center gap-1.5">
                  <FileText size={14} className="text-mauve" /> Şiir Başlığı
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Sessizliğin Melodisi"
                  className="w-full bg-surface0 border border-surface1 rounded-xl px-4 py-2.5 text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-subtext1 mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-mauve" /> Şair / Yazar Adı
                </label>
                <input
                  type="text"
                  value={poet}
                  onChange={(e) => setPoet(e.target.value)}
                  placeholder="Örn: Melih Duru veya Tunahan"
                  className="w-full bg-surface0 border border-surface1 rounded-xl px-4 py-2.5 text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtext1 mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-mauve" /> Kategori
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setIsCustomCategory(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      !isCustomCategory && category === cat
                        ? 'bg-mauve/20 border-mauve text-mauve'
                        : 'bg-surface0/60 border-surface1 text-subtext0 hover:border-surface2'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtext1 mb-1.5 flex items-center gap-1.5">
                <Feather size={14} className="text-mauve" /> Şiir Dizeleri (İçerik)
              </label>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Her satıra bir dize gelecek şekilde şiirinizi yazınız...&#10;&#10;Kıtalar arasında boş bir satır bırakabilirsiniz."
                className="w-full bg-surface0 border border-surface1 rounded-2xl p-4 text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve transition-colors font-serif leading-relaxed text-sm custom-scrollbar"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-subtext0 hover:bg-surface0 hover:text-text transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-mauve text-base font-semibold px-6 py-2.5 rounded-xl hover:bg-mauve/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-base border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                <span>{initialPoem ? 'Değişiklikleri Kaydet' : 'Şiiri Yayımla'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
