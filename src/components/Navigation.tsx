import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartContext } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCartContext();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/60 backdrop-blur-xl border-b border-border/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          {/* Left: User icon / Login */}
          <button
            onClick={() => go(user ? '/dashboard' : '/login')}
            className="font-body text-[10px] tracking-[0.3em] text-foreground/60 gold-hover"
          >
            {user ? 'CONTA' : 'LOGIN'}
          </button>

          {/* Center: Brand */}
          <button
            onClick={() => go('/')}
            className="font-heading text-lg md:text-xl tracking-[0.25em] text-foreground gold-hover"
          >
            MAISON CROWNED
          </button>

          {/* Right: Cart */}
          <button
            onClick={() => go('/carrinho')}
            className="font-body text-[10px] tracking-[0.3em] text-foreground/60 gold-hover relative"
          >
            CART
            {count > 0 && (
              <span className="absolute -top-1 -right-4 w-4 h-4 bg-gold text-primary-foreground text-[8px] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border/20"
            >
              <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-center gap-12 h-10">
                {[
                  { label: 'MASCULINA', path: '/colecao/masculina' },
                  { label: 'FEMININA', path: '/colecao/feminina' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => go(item.path)}
                    className={`font-body text-[9px] tracking-[0.3em] gold-hover transition-colors ${
                      location.pathname === item.path ? 'text-gold' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex flex-col items-center gap-8" onClick={e => e.stopPropagation()}>
              {['/', '/colecao/masculina', '/colecao/feminina', '/carrinho'].map((path, i) => {
                const labels = ['MAISON CROWNED', 'COLEÇÃO MASCULINA', 'COLEÇÃO FEMININA', `CARRINHO${count > 0 ? ` (${count})` : ''}`];
                return (
                  <motion.button
                    key={path}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => go(path)}
                    className="font-heading text-2xl md:text-4xl tracking-[0.15em] text-foreground/80 gold-hover"
                  >
                    {labels[i]}
                  </motion.button>
                );
              })}
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-12 font-body text-xs tracking-[0.3em] text-muted-foreground gold-hover"
              >
                FECHAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
