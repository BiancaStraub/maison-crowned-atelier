import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-main.jpg';

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden snap-section">
      {/* SVG filter for fabric displacement */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="displacement">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              seed="2"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015;0.018;0.015"
                dur="8s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Hero image with displacement */}
      <div className="absolute inset-0 fabric-displace">
        <img
          src={heroImage}
          alt="Maison Crowned - Bespoke Tailoring"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-24 md:pb-32 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading tracking-[0.2em] text-foreground text-center"
        >
          MAISON CROWNED
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-6 font-body text-xs tracking-[0.4em] text-foreground/50 uppercase"
        >
          Alfaiataria Sob Medida
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-12 w-px h-16 bg-foreground/20"
        />
      </div>
    </section>
  );
};

export default HeroSection;
