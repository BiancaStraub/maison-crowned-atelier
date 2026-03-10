import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Cart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-heading text-4xl md:text-5xl tracking-[0.2em] text-foreground"
        >
          CARRINHO
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 w-12 h-px bg-gold origin-center"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 font-body text-sm text-muted-foreground tracking-[0.15em]"
        >
          Seu carrinho está vazio.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 font-body text-[10px] tracking-[0.2em] text-muted-foreground/50"
        >
          ENVIO VIA DHL INTERNATIONAL EXPRESS — ENTREGA MUNDIAL
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => navigate('/')}
          className="mt-12 font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 gold-hover transition-colors"
        >
          EXPLORAR COLEÇÕES
        </motion.button>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
