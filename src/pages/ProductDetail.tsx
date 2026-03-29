import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, formatPrice } from '@/data/products';
import { useCartContext } from '@/contexts/CartContext';
import MeasurementForm from '@/components/MeasurementForm';
import ProductReviews from '@/components/ProductReviews';
import { toast } from 'sonner';
import { appendPersistedMeasurement, getPersistedAuth } from '@/lib/localStore';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartContext();
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [savedMeasurements, setSavedMeasurements] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState(0);
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground tracking-[0.2em]">PEÇA NÃO ENCONTRADA</p>
      </div>
    );
  }

  const getGradient = (color: string) => {
    const gradients: Record<string, string> = {
      'Green Military': 'from-[hsl(120,15%,25%)] to-[hsl(120,10%,35%)]',
      'Black': 'from-[hsl(0,0%,8%)] to-[hsl(0,0%,15%)]',
      'Beige/White': 'from-[hsl(35,30%,75%)] to-[hsl(35,25%,85%)]',
      'Beige': 'from-[hsl(35,30%,70%)] to-[hsl(35,25%,80%)]',
      'White': 'from-[hsl(0,0%,90%)] to-[hsl(0,0%,96%)]',
      'Nude/Salmon': 'from-[hsl(15,40%,75%)] to-[hsl(15,35%,85%)]',
      'Nude/Beige': 'from-[hsl(30,30%,75%)] to-[hsl(30,25%,82%)]',
      'Rose/Beige': 'from-[hsl(350,25%,75%)] to-[hsl(350,20%,85%)]',
      'White/Beige': 'from-[hsl(40,20%,88%)] to-[hsl(40,15%,94%)]',
      'Black/Rose': 'from-[hsl(350,15%,20%)] to-[hsl(350,20%,35%)]',
      'Salmon': 'from-[hsl(10,50%,70%)] to-[hsl(10,45%,80%)]',
      'Rose/White': 'from-[hsl(350,30%,80%)] to-[hsl(350,20%,90%)]',
    };
    return gradients[color] || 'from-secondary to-muted';
  };

  // Generate thumbnail views (front, back, detail, fabric)
  const views = ['FRENTE', 'COSTAS', 'DETALHE', 'TECIDO'];
  const viewChars = [product.name.charAt(0), product.name.charAt(1) || 'B', '✦', '◈'];

  const handleMeasurements = (measurements: Record<string, string>) => {
    const auth = getPersistedAuth();
    appendPersistedMeasurement({
      id: crypto.randomUUID(),
      label: `Medidas ${product.name}`,
      user_email: auth.email || 'cliente@maisoncrowned.com',
      busto: measurements.torax || null,
      cintura: measurements.cintura || null,
      quadril: measurements.quadril || null,
      pescoco: measurements.pescoco || null,
      ombro: measurements.ombro || null,
      manga: measurements.manga || null,
      altura: measurements.altura || null,
      created_at: new Date().toISOString(),
    });

    setSavedMeasurements(measurements);
    toast.success('Medidas registradas com sucesso', { description: 'Suas medidas foram salvas para esta peça.' });
    setShowMeasurements(false);
  };

  const handleAddToCart = () => {
    addItem(product, Object.keys(savedMeasurements).length > 0 ? savedMeasurements : undefined);
    toast.success(`${product.name} adicionado ao carrinho`, { description: formatPrice(product.price) });
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!showMeasurements ? (
          <motion.div key="product" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="min-h-screen flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 h-[60vh] lg:h-screen flex flex-col items-center justify-center bg-secondary/50 gap-6">
                {/* Main view */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className={`w-64 h-[360px] md:w-80 md:h-[460px] bg-gradient-to-b ${getGradient(product.color)} flex items-center justify-center`}
                  >
                    <span className="font-heading text-7xl tracking-[0.1em] text-foreground/8 select-none">
                      {viewChars[activeView]}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Thumbnails */}
                <div className="flex gap-3">
                  {views.map((view, idx) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(idx)}
                      className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b ${getGradient(product.color)} flex items-center justify-center transition-all border-2 ${
                        activeView === idx ? 'border-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                    >
                      <span className="font-heading text-lg text-foreground/10 select-none">{viewChars[idx]}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-6">
                  {views.map((view, idx) => (
                    <span
                      key={view}
                      className={`font-body text-[8px] tracking-[0.2em] cursor-pointer transition-colors ${
                        activeView === idx ? 'text-gold' : 'text-muted-foreground/40'
                      }`}
                      onClick={() => setActiveView(idx)}
                    >
                      {view}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-0">
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  onClick={() => navigate(-1)} className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover mb-12 self-start">
                  ← VOLTAR
                </motion.button>

                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-body text-[10px] tracking-[0.4em] text-muted-foreground">
                  {product.collection === 'masculina' ? 'COLEÇÃO MASCULINA' : 'COLEÇÃO FEMININA'}
                </motion.span>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-heading text-5xl md:text-6xl tracking-[0.15em] text-foreground mt-4">
                  {product.name}
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-heading text-xl tracking-[0.1em] text-foreground/50 mt-2">
                  {product.subtitle}
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 w-12 h-px bg-border" />

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="font-body text-sm text-muted-foreground leading-relaxed mt-8 max-w-md">
                  {product.description}
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 flex gap-6">
                  <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">{product.fabric}</span>
                  <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">{product.color}</span>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-body text-lg tracking-[0.15em] text-gold mt-8">
                  {formatPrice(product.price)}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-12 flex flex-col gap-4">
                  <button onClick={() => setShowMeasurements(true)} className="font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 self-start gold-hover transition-colors">
                    PERSONALIZAR MEDIDAS
                  </button>
                  <button onClick={handleAddToCart} className="font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 self-start gold-hover transition-colors">
                    ADICIONAR AO CARRINHO
                  </button>
                </motion.div>

                <ProductReviews productId={product.id} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="measurements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={() => setShowMeasurements(false)} className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover mb-12 self-start ml-8 md:ml-16">
              ← VOLTAR À PEÇA
            </motion.button>
            <MeasurementForm gender={product.collection} onSubmit={handleMeasurements} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
