/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  User, 
  Users, 
  MessageSquare, 
  Menu, 
  X, 
  ChevronRight, 
  Music, 
  Feather, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  LogIn,
  LogOut,
  Lock
} from 'lucide-react';
import { Poem } from './types';
import { 
  subscribeToPoems, 
  createPoem, 
  updatePoem, 
  deletePoem,
  seedInitialPoems
} from './services/poemService';
import { PoemModal } from './components/PoemModal';
import { DeleteModal } from './components/DeleteModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';

const CATEGORIES = [
  { id: 'all', name: 'Tüm Şiirler', icon: Book, color: 'mauve' },
  { id: 'Melih Duru', name: 'Melih Duru', icon: User, color: 'blue' },
  { id: 'Efdal Ürkmez', name: 'Efdal Ürkmez', icon: User, color: 'sapphire' },
  { id: 'Belinay Çelik', name: 'Belinay Çelik', icon: User, color: 'lavender' },
  { id: 'Kemal Can Doğan', name: 'Kemal Can Doğan', icon: User, color: 'pink' },
  { id: 'Düet Şiirler', name: 'Düet Şiirler', icon: Users, color: 'peach' },
  { id: 'Sizden Gelenler', name: 'Sizden Gelenler', icon: MessageSquare, color: 'green' },
];

export default function App() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [deletingPoem, setDeletingPoem] = useState<Poem | null>(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('admin_auth', 'true');
    addToast('success', 'Admin girişi başarılı. Hoş geldiniz, McKuru!');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_auth');
    addToast('info', 'Admin oturumu kapatıldı.');
  };

  // Subscribe to real-time updates from Firebase Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToPoems(
      (updatedPoems) => {
        setPoems(updatedPoems);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to load poems from Firestore:', error);
        addToast('error', 'Veritabanına bağlanırken sorun oluştu.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update selectedPoem if it gets updated in the live list
  useEffect(() => {
    if (selectedPoem) {
      const refreshed = poems.find((p) => p.id === selectedPoem.id);
      if (refreshed) {
        setSelectedPoem(refreshed);
      }
    }
  }, [poems]);

  // Filter poems by category & search query
  const filteredPoems = useMemo(() => {
    let result = poems;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.poet.toLowerCase().includes(query) ||
          p.content.some((line) => line.toLowerCase().includes(query))
      );
    }
    return result;
  }, [poems, activeCategory, searchQuery]);

  const handleSavePoem = async (poemData: {
    title: string;
    poet: string;
    category: string;
    content: string[];
  }) => {
    if (!isAdmin) {
      addToast('error', 'Bu işlemi gerçekleştirmek için admin girişi yapmalısınız.');
      return;
    }

    if (editingPoem) {
      await updatePoem(editingPoem.id, poemData);
      addToast('success', `"${poemData.title}" şiiri başarıyla güncellendi.`);
      setEditingPoem(null);
    } else {
      await createPoem(poemData);
      addToast('success', `"${poemData.title}" şiiri kaydedildi ve yayımlandı.`);
    }
  };

  const handleDeletePoem = async () => {
    if (!isAdmin) {
      addToast('error', 'Bu işlemi gerçekleştirmek için admin girişi yapmalısınız.');
      return;
    }

    if (!deletingPoem) return;
    const title = deletingPoem.title;
    await deletePoem(deletingPoem.id);
    if (selectedPoem?.id === deletingPoem.id) {
      setSelectedPoem(null);
    }
    addToast('success', `"${title}" şiiri başarıyla silindi.`);
    setDeletingPoem(null);
  };

  const handleReseed = async () => {
    if (!isAdmin) {
      addToast('error', 'Bu işlem için admin girişi gereklidir.');
      return;
    }
    if (confirm('Varsayılan şiirleri tekrar veritabanına yüklemek istiyor musunuz?')) {
      try {
        await seedInitialPoems();
        addToast('success', 'Varsayılan şiirler veritabanına aktarıldı.');
      } catch (err: any) {
        addToast('error', 'Yükleme başarısız oldu: ' + err.message);
      }
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-base text-text flex overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-crust/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-mantle border-r border-surface1 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-surface1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-mauve flex items-center justify-center text-base shadow-lg shadow-mauve/20">
                <Music size={22} />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight">Kalemimden</h1>
                <p className="text-xs text-subtext0 font-medium">Notalar & Şiirler</p>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 text-subtext0 hover:text-text hover:bg-surface0 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Publish Action (Admin Only) */}
          {isAdmin && (
            <div className="px-4 pt-4">
              <button
                onClick={() => {
                  setEditingPoem(null);
                  setIsAddModalOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-mauve text-base font-semibold px-4 py-2.5 rounded-2xl shadow-lg shadow-mauve/20 hover:bg-mauve/90 active:scale-98 transition-all"
              >
                <Plus size={18} />
                <span>Yeni Şiir Yayımla</span>
              </button>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-overlay0 mb-2">Kategoriler</p>
            {CATEGORIES.map((cat) => {
              const count = cat.id === 'all' 
                ? poems.length 
                : poems.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedPoem(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group
                    ${activeCategory === cat.id 
                      ? 'bg-surface0 text-mauve font-semibold shadow-md' 
                      : 'hover:bg-surface0/50 text-subtext1 hover:text-text'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon size={18} className={activeCategory === cat.id ? 'text-mauve' : 'text-subtext0 group-hover:text-mauve'} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-mauve/20 text-mauve font-bold' : 'bg-surface1/60 text-overlay0'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Admin Area at the bottom left */}
          <div className="p-4 border-t border-surface1 bg-crust/50">
            {isAdmin ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                    <span className="text-xs font-semibold text-text">Admin: <span className="text-mauve font-mono">McKuru</span></span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-mauve/20 text-mauve">
                    Yönetici
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface0 hover:bg-surface1 text-red hover:text-red/90 text-xs font-semibold transition-colors border border-surface1"
                >
                  <LogOut size={14} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface0/70 hover:bg-surface0 text-subtext0 hover:text-mauve text-xs font-semibold transition-all border border-surface1/80 group"
              >
                <Lock size={14} className="text-overlay0 group-hover:text-mauve transition-colors" />
                <span>Admin Girişi</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-base/80 backdrop-blur-md border-b border-surface1 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className="lg:hidden p-2 hover:bg-surface0 rounded-xl transition-colors text-subtext0 hover:text-text"
            >
              <Menu size={22} />
            </button>
            
            <div className="flex items-center gap-2">
              <Feather size={18} className="text-mauve" />
              <span className="text-sm font-semibold text-text">
                {CATEGORIES.find((c) => c.id === activeCategory)?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-overlay0" />
              <input
                type="text"
                placeholder="Şiir veya şair ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface0/60 border border-surface1 rounded-xl pl-9 pr-3 py-1.5 text-xs text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-overlay0 hover:text-text"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Publish Button (Admin Only) */}
            {isAdmin ? (
              <button
                onClick={() => {
                  setEditingPoem(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-mauve text-base font-semibold px-3.5 py-1.5 rounded-xl text-xs hover:bg-mauve/90 active:scale-95 transition-all shadow-md shadow-mauve/15"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">Şiir Yayımla</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 bg-surface0 hover:bg-surface1 text-subtext0 hover:text-text px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border border-surface1"
              >
                <Lock size={13} />
                <span className="hidden sm:inline">Admin Girişi</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {/* Mobile Search Input */}
            <div className="sm:hidden mb-6 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-overlay0" />
              <input
                type="text"
                placeholder="Şiir veya şair ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface0 border border-surface1 rounded-2xl pl-9 pr-4 py-2.5 text-sm text-text placeholder:text-overlay0 focus:outline-none focus:border-mauve"
              />
            </div>

            {/* Sizden Gelenler Welcome Banner */}
            {activeCategory === 'Sizden Gelenler' && !selectedPoem && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 lg:p-8 bg-surface0/50 border border-mauve/30 rounded-3xl relative overflow-hidden shadow-xl"
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mauve/10 border border-mauve/20 text-mauve text-xs font-semibold">
                      <Sparkles size={14} />
                      Sizden Gelenler Duvarı
                    </div>
                    <h2 className="text-2xl font-bold text-text">Şiirinizi Bizimle Paylaşın</h2>
                    <p className="text-sm text-subtext0 leading-relaxed">
                      Burası sizin yayımlatmak istediğiniz şiirleri eklediğimiz ortak duvardır. Şiirlerinizi Google Form üzerinden bize iletebilirsiniz.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingPoem(null);
                          setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-mauve text-base font-semibold px-5 py-2.5 rounded-2xl shadow-lg shadow-mauve/20 hover:bg-mauve/90 transition-all text-sm"
                      >
                        <Plus size={18} />
                        <span>Şiir Ekle</span>
                      </button>
                    )}
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSfVsEuUxiqrZJxF_I3GbZwCnA9ulsEGuTsQEX1DwFmQIXzbwg/viewform?usp=sf_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-surface1 text-text hover:bg-surface2 px-4 py-2.5 rounded-2xl transition-colors text-sm font-medium border border-surface2 shadow-sm"
                    >
                      <span>Google Form İle Gönder</span>
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading Indicator */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-3 border-mauve border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-subtext0 font-medium">Şiirler yükleniyor...</p>
              </div>
            ) : selectedPoem ? (
              /* Single Poem View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedPoem(null)}
                    className="flex items-center gap-2 text-sm text-subtext0 hover:text-mauve transition-colors group"
                  >
                    <X size={16} className="group-hover:rotate-90 transition-transform" />
                    Listeye Dön
                  </button>

                  {/* Admin Only Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPoem(selectedPoem)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface0 hover:bg-surface1 text-subtext0 hover:text-mauve text-xs font-semibold transition-colors border border-surface1"
                      >
                        <Edit3 size={14} />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => setDeletingPoem(selectedPoem)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red/10 hover:bg-red/20 text-red text-xs font-semibold transition-colors border border-red/20"
                      >
                        <Trash2 size={14} />
                        <span>Sil</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-full bg-mauve/15 border border-mauve/20 text-mauve text-xs font-bold">
                    {selectedPoem.category}
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-text tracking-tight">
                    {selectedPoem.title}
                  </h2>
                  <div className="flex items-center gap-2.5 text-mauve font-medium text-base">
                    <User size={18} />
                    <span>{selectedPoem.poet}</span>
                  </div>
                </div>

                <div className="bg-surface0/30 p-8 lg:p-14 rounded-3xl border border-surface1/50 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Feather size={140} />
                  </div>
                  <div className="poem-content text-lg lg:text-xl italic font-serif space-y-1.5">
                    {selectedPoem.content.map((line, i) => (
                      <p key={i} className={line === '' ? 'h-6' : ''}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <div className="w-24 h-1 bg-surface1 rounded-full" />
                </div>
              </motion.div>
            ) : filteredPoems.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20 bg-surface0/20 border border-surface1/40 rounded-3xl p-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-surface0 flex items-center justify-center text-overlay0">
                  <Feather size={28} />
                </div>
                <h3 className="text-lg font-bold text-text">Henüz şiir bulunmuyor</h3>
                <p className="text-sm text-subtext0 max-w-md mx-auto">
                  {searchQuery ? 'Arama kriterlerinize uygun şiir bulunamadı.' : 'Bu kategoride henüz bir şiir bulunmuyor.'}
                </p>
                {isAdmin && (
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setEditingPoem(null);
                        setIsAddModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-mauve text-base font-semibold px-4 py-2 rounded-xl text-xs hover:bg-mauve/90 transition-all"
                    >
                      <Plus size={16} />
                      <span>Şiir Yayımla</span>
                    </button>
                    <button
                      onClick={handleReseed}
                      className="flex items-center gap-2 bg-surface1 text-subtext0 hover:text-text px-4 py-2 rounded-xl text-xs transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>Varsayılanları Yükle</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Poems Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredPoems.map((poem, index) => (
                    <motion.div
                      key={poem.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: index * 0.02 }}
                      className="group relative bg-surface0/40 hover:bg-surface0 p-6 rounded-3xl border border-surface1/50 hover:border-mauve/40 transition-all duration-300 hover:shadow-xl hover:shadow-mauve/5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2.5 bg-base rounded-2xl text-mauve group-hover:bg-mauve group-hover:text-base transition-colors shadow-sm">
                            <Feather size={18} />
                          </div>
                          
                          {/* Admin Only action buttons */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPoem(poem);
                                }}
                                title="Düzenle"
                                className="p-2 rounded-xl text-subtext0 hover:text-mauve hover:bg-surface1 transition-colors"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingPoem(poem);
                                }}
                                title="Sil"
                                className="p-2 rounded-xl text-subtext0 hover:text-red hover:bg-red/10 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedPoem(poem)}
                          className="text-left w-full focus:outline-none"
                        >
                          <h3 className="text-xl font-bold text-text mb-2 group-hover:text-mauve transition-colors line-clamp-1">
                            {poem.title}
                          </h3>
                          <p className="text-xs text-subtext0 mb-4 line-clamp-3 italic font-serif leading-relaxed">
                            {poem.content[0]}
                            {poem.content[1] && <br />}
                            {poem.content[1]}
                          </p>
                        </button>
                      </div>

                      <div className="pt-3 mt-2 border-t border-surface1/40 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-mauve">
                          <User size={13} />
                          {poem.poet}
                        </span>

                        <button
                          onClick={() => setSelectedPoem(poem)}
                          className="flex items-center gap-1 text-xs font-medium text-subtext0 group-hover:text-text hover:underline"
                        >
                          <span>Oku</span>
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <footer className="p-4 text-center text-xs text-overlay0 border-t border-surface1 bg-mantle/50 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
          <span>&copy; 2026 Kalemimden Notalar • Catppuccin Mocha Tema</span>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="text-[11px] text-mauve font-medium flex items-center gap-1">
                <ShieldCheck size={13} /> Yönetici Modu Aktif
              </span>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[11px] text-overlay0 hover:text-mauve transition-colors"
              >
                Yönetici Girişi
              </button>
            )}
          </div>
        </footer>
      </main>

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Add / Edit Poem Modal (Admin Only) */}
      <PoemModal
        isOpen={isAddModalOpen || !!editingPoem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPoem(null);
        }}
        onSave={handleSavePoem}
        initialPoem={editingPoem}
        defaultCategory={activeCategory}
      />

      {/* Delete Confirmation Modal (Admin Only) */}
      <DeleteModal
        isOpen={!!deletingPoem}
        onClose={() => setDeletingPoem(null)}
        onConfirm={handleDeletePoem}
        poem={deletingPoem}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #313244;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #45475a;
        }
      `}</style>
    </div>
  );
}

