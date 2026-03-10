import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Product, formatPrice } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const navigate = useNavigate();

  // Generate a placeholder gradient based on color
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8 }}
      className="snap-section flex flex-col md:flex-row items-center justify-center min-h-screen px-6 md:px-0 cursor-pointer"
      onClick={() => navigate(`/produto/${product.id}`)}
    >
      {/* Product visual - alternating sides */}
      <div className={`w-full md:w-1/2 flex justify-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
        <div className={`w-80 h-[480px] md:w-96 md:h-[560px] bg-gradient-to-b ${getGradient(product.color)} flex items-center justify-center`}>
          <span className="font-heading text-6xl md:text-7xl tracking-[0.15em] text-foreground/10 select-none">
            {product.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className={`w-full md:w-1/2 flex flex-col items-center md:items-start mt-12 md:mt-0 ${index % 2 === 1 ? 'md:order-1 md:pl-24' : 'md:pl-24'}`}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-body text-[10px] tracking-[0.4em] text-muted-foreground mb-4"
        >
          {product.fabric} — {product.color}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="font-heading text-4xl md:text-5xl tracking-[0.15em] text-foreground"
        >
          {product.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="font-heading text-lg tracking-[0.1em] text-foreground/50 mt-2"
        >
          {product.subtitle}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="font-body text-sm tracking-[0.15em] text-gold mt-6"
        >
          {formatPrice(product.price)}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
