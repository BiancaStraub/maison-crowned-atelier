import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, formatPrice } from '@/data/products';
import MeasurementForm from '@/components/MeasurementForm';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showMeasurements, setShowMeasurements] = useState(false);
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

  const handleMeasurements = (measurements: Record<string, string>) => {
    toast.success('Medidas registradas com sucesso', {
      description: 'Suas medidas foram salvas para esta peça.',
    });
    setShowMeasurements(false);
  };

  const handleAddToCart = () => {
    toast.success(`${product.name} adicionado ao carrinho`, {
      description: formatPrice(product.price),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!showMeasurements ? (
          <motion.div
            key="product"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col lg:flex-row"
          >
            {/* Product visual */}
            <div className="w-full lg:w-1/2 h-[60vh] lg:h-screen flex items-center justify-center bg-secondary/50">
              <div className={`w-72 h-[420px] md:w-96 md:h-[560px] bg-gradient-to-b ${getGradient(product.color)} flex items-center justify-center`}>
                <span className="font-heading text-8xl tracking-[0.1em] text-foreground/8 select-none">
                  {product.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Product info */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-0">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate(-1)}
                className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover mb-12 self-start"
              >
                ← VOLTAR
              </motion.button>

              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-body text-[10px] tracking-[0.4em] text-muted-foreground"
              >
                {product.collection === 'masculina' ? 'COLEÇÃO MASCULINA' : 'COLEÇÃO FEMININA'}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-heading text-5xl md:text-6xl tracking-[0.15em] text-foreground mt-4"
              >
                {product.name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-heading text-xl tracking-[0.1em] text-foreground/50 mt-2"
              >
                {product.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 w-12 h-px bg-border"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="font-body text-sm text-muted-foreground leading-relaxed mt-8 max-w-md"
              >
                {product.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex gap-6"
              >
                <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">
                  {product.fabric}
                </span>
                <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">
                  {product.color}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="font-body text-lg tracking-[0.15em] text-gold mt-8"
              >
                {formatPrice(product.price)}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-12 flex flex-col gap-4"
              >
                <button
                  onClick={() => setShowMeasurements(true)}
                  className="font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 self-start gold-hover transition-colors"
                >
                  PERSONALIZAR MEDIDAS
                </button>
                <button
                  onClick={handleAddToCart}
                  className="font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 self-start gold-hover transition-colors"
                >
                  ADICIONAR AO CARRINHO
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="measurements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-24"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setShowMeasurements(false)}
              className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover mb-12 self-start ml-8 md:ml-16"
            >
              ← VOLTAR À PEÇA
            </motion.button>
            <MeasurementForm
              gender={product.collection}
              onSubmit={handleMeasurements}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
