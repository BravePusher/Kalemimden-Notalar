/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
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
  Heart,
  Feather
} from 'lucide-react';
import { POEMS } from './data/poems';
import { Poem } from './types';

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredPoems = useMemo(() => {
    if (activeCategory === 'all') return POEMS;
    return POEMS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-base text-text flex overflow-hidden">
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
          <div className="p-6 flex items-center gap-3 border-b border-surface1">
            <div className="w-10 h-10 rounded-xl bg-mauve flex items-center justify-center text-base">
              <Music size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Kalemimden</h1>
              <p className="text-xs text-subtext0 font-medium">Notalar & Şiirler</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedPoem(null);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${activeCategory === cat.id 
                    ? 'bg-surface0 text-mauve shadow-lg' 
                    : 'hover:bg-surface0/50 text-subtext1 hover:text-text'}
                `}
              >
                <cat.icon size={20} className={activeCategory === cat.id ? 'text-mauve' : 'text-subtext0 group-hover:text-mauve'} />
                <span className="font-medium">{cat.name}</span>
                {activeCategory === cat.id && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-mauve" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-surface1 bg-crust/50">
            <p className="text-[10px] uppercase tracking-widest text-overlay0 font-bold mb-2">Hakkında</p>
            <p className="text-xs text-subtext0 leading-relaxed">
              Burası, Efdal ve arkadaşlarının şiirlerini paylaşmak için oluşturduğu bir blog sayfasıdır.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-base/80 backdrop-blur-md border-b border-surface1 z-30">
          <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-surface0 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <Feather size={18} className="text-mauve" />
            <span className="text-sm font-medium text-subtext0">
              {CATEGORIES.find(c => c.id === activeCategory)?.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-overlay0 font-mono">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              CANLI BLOG
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {selectedPoem ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <button 
                  onClick={() => setSelectedPoem(null)}
                  className="flex items-center gap-2 text-sm text-subtext0 hover:text-mauve transition-colors mb-4 group"
                >
                  <X size={16} className="group-hover:rotate-90 transition-transform" />
                  Listeye Dön
                </button>

                <div className="space-y-2">
                  <h2 className="text-4xl lg:text-5xl font-bold text-text tracking-tight">
                    {selectedPoem.title}
                  </h2>
                  <div className="flex items-center gap-3 text-mauve font-medium">
                    <User size={16} />
                    <span>{selectedPoem.poet}</span>
                  </div>
                </div>

                <div className="bg-surface0/30 p-8 lg:p-12 rounded-3xl border border-surface1/50 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Feather size={120} />
                  </div>
                  <div className="poem-content text-lg lg:text-xl italic font-serif space-y-1">
                    {selectedPoem.content.map((line, i) => (
                      <p key={i} className={line === '' ? 'h-6' : ''}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <div className="w-24 h-1 bg-surface1 rounded-full" />
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredPoems.map((poem, index) => (
                    <motion.button
                      key={poem.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedPoem(poem)}
                      className="group text-left bg-surface0/40 hover:bg-surface0 p-6 rounded-2xl border border-surface1/50 hover:border-mauve/50 transition-all duration-300 hover:shadow-xl hover:shadow-mauve/5"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 bg-base rounded-lg text-mauve group-hover:bg-mauve group-hover:text-base transition-colors">
                            <Feather size={20} />
                          </div>
                          <ChevronRight size={18} className="text-overlay0 group-hover:text-mauve group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">{poem.title}</h3>
                        <p className="text-sm text-subtext0 mb-4 line-clamp-3 italic">
                          {poem.content[0]}...
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-xs font-bold text-mauve/80 uppercase tracking-wider">
                          <User size={12} />
                          {poem.poet}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <footer className="p-4 text-center text-[10px] text-overlay0 border-t border-surface1 bg-mantle/50">
          &copy; 2026 Kalemimden Notalar • Catppuccin Mocha Theme
        </footer>
      </main>

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
