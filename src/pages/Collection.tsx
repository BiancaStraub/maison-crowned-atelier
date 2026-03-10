import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';

const Collection = () => {
  const { gender } = useParams<{ gender: string }>();
  const collection = gender === 'feminina' ? 'feminina' : 'masculina';
  const collectionProducts = products.filter(p => p.collection === collection);
  const title = collection === 'masculina' ? 'COLEÇÃO MASCULINA' : 'COLEÇÃO FEMININA';

  return (
    <div className="bg-background min-h-screen">
      {/* Collection header */}
      <section className="h-screen flex flex-col items-center justify-center snap-section">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-body text-[10px] tracking-[0.5em] text-muted-foreground mb-6"
        >
          MAISON CROWNED
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-heading text-4xl md:text-6xl tracking-[0.2em] text-foreground"
        >
          {title}
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 w-16 h-px bg-gold origin-center"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-6 font-body text-xs tracking-[0.2em] text-muted-foreground"
        >
          {collectionProducts.length} PEÇAS
        </motion.p>
      </section>

      {/* Products */}
      {collectionProducts.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}

      <div className="py-section" />
      <Footer />
    </div>
  );
};

export default Collection;
