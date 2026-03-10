import { motion } from 'framer-motion';

const fabrics = [
  {
    name: 'LINHO',
    nameEn: 'Linen',
    description: 'Fibra natural de caimento solto e respirabilidade incomparável. Amassa com nobreza — cada vinco conta uma história de movimento.',
    origin: 'Itália & Bélgica',
  },
  {
    name: 'ZIBELINE',
    nameEn: 'Zibeline',
    description: 'Superfície acetinada com corpo estruturado. Reflete a luz com sutileza, criando silhuetas esculturais para noites de gala.',
    origin: 'França',
  },
  {
    name: 'CREPE',
    nameEn: 'Crêpe',
    description: 'Textura granulada que confere fluidez e elegância discreta. Drapeado natural que acompanha cada gesto do corpo.',
    origin: 'Itália',
  },
  {
    name: 'LÃ',
    nameEn: 'Wool',
    description: 'Lã fria de alto torção, com memória de forma impecável. A base da alfaiataria clássica — corte limpo, caimento perfeito.',
    origin: 'Inglaterra & Austrália',
  },
  {
    name: 'ALGODÃO',
    nameEn: 'Cotton',
    description: 'Algodão egípcio de fibra longa, toque sedoso e durabilidade excepcional. Conforto que não compromete a estrutura.',
    origin: 'Egito & Brasil',
  },
];

const FabricsSection = () => {
  return (
    <section className="py-section px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="font-body text-[10px] tracking-[0.5em] text-muted-foreground">
            MATÉRIA-PRIMA
          </span>
          <h2 className="font-heading text-4xl md:text-5xl tracking-[0.15em] text-foreground mt-4">
            TECIDOS NOBRES
          </h2>
          <div className="mt-6 w-12 h-px bg-gold mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {fabrics.map((fabric, i) => (
            <motion.div
              key={fabric.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-card p-10 md:p-12 flex flex-col"
            >
              <span className="font-body text-[9px] tracking-[0.4em] text-gold">
                {fabric.origin}
              </span>
              <h3 className="font-heading text-2xl tracking-[0.15em] text-foreground mt-3">
                {fabric.name}
              </h3>
              <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground mt-1">
                {fabric.nameEn}
              </span>
              <div className="mt-4 w-8 h-px bg-border" />
              <p className="font-body text-xs text-muted-foreground leading-relaxed mt-4 flex-1">
                {fabric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FabricsSection;
