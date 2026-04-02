import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import FabricsSection from '@/components/FabricsSection';
import Footer from '@/components/Footer';
import capaMasculino from '@/assets/capa-masculino.png';
import capaFeminina from '@/assets/capa-feminina.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <HeroSection />

      {/* Collection intro */}
      <section className="py-section px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-heading text-3xl md:text-4xl tracking-[0.12em] text-foreground/80 leading-relaxed"
          >
            Cada peça é cortada como uma sentença definitiva — sem palavras supérfluas, sem gestos desnecessários.
          </motion.p>
        </div>
      </section>

      {/* Collection links */}
      <section className="py-section px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-24 md:gap-0 justify-center items-center">
          {[
            { label: 'COLEÇÃO MASCULINA', path: '/colecao/masculina', img: capaMasculino },
            { label: 'COLEÇÃO FEMININA', path: '/colecao/feminina', img: capaFeminina },
          ].map((col, i) => (
            <motion.button
              key={col.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              onClick={() => navigate(col.path)}
              className="flex-1 flex flex-col items-center gap-4 group"
            >
              <div className="w-64 h-80 md:w-72 md:h-96 overflow-hidden">
                <img
                  src={col.img}
                  alt={col.label}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="font-body text-[10px] tracking-[0.4em] text-muted-foreground group-hover:text-gold transition-colors duration-500">
                {col.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Tecidos Nobres */}
      <FabricsSection />

      {/* Statement */}
      <section className="py-section px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="font-body text-xs tracking-[0.3em] text-muted-foreground leading-loose"
          >
            ENVIO MUNDIAL VIA DHL EXPRESS — MEDIDAS SOB ENCOMENDA — TECIDOS ITALIANOS E BRASILEIROS — ALFAIATARIA DE PRECISÃO
          </motion.p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
