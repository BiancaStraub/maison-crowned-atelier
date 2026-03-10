import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  cartCount?: number;
}

const Navigation = ({ cartCount = 0 }: NavigationProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On non-home pages, always show monogram
  const isHome = location.pathname === '/';
  const showMonogram = !isHome || scrolled;

  const navItems = [
    { label: 'MAISON CROWNED', action: () => { navigate('/'); setMenuOpen(false); } },
    { label: 'COLEÇÃO MASCULINA', action: () => { navigate('/colecao/masculina'); setMenuOpen(false); } },
    { label: 'COLEÇÃO FEMININA', action: () => { navigate('/colecao/feminina'); setMenuOpen(false); } },
    { label: `CARRINHO${cartCount > 0 ? ` (${cartCount})` : ''}`, action: () => { navigate('/carrinho'); setMenuOpen(false); } },
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        {!showMonogram ? (
          <motion.nav
            key="full-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 z-50 p-8 md:p-12"
          >
            <div className="flex flex-col gap-1.5">
              {navItems.map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-left font-body text-xs tracking-[0.2em] text-foreground/70 gold-hover"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.nav>
        ) : (
          <motion.button
            key="monogram"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            onClick={() => setMenuOpen(true)}
            className="fixed top-6 left-6 md:top-8 md:left-8 z-50 font-heading text-2xl tracking-[0.2em] text-foreground/80 gold-hover"
          >
            MC
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-background/98 flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  onClick={item.action}
                  className="font-heading text-2xl md:text-4xl tracking-[0.15em] text-foreground/80 gold-hover"
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setMenuOpen(false)}
                className="mt-12 font-body text-xs tracking-[0.3em] text-muted-foreground gold-hover"
              >
                FECHAR
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
