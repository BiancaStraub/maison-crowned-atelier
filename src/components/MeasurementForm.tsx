import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MeasurementFormProps {
  gender: 'masculina' | 'feminina';
  onSubmit: (measurements: Record<string, string>) => void;
}

const measurementFields = [
  { key: 'pescoco', label: 'PESCOÇO', unit: 'cm' },
  { key: 'ombro', label: 'OMBRO', unit: 'cm' },
  { key: 'torax', label: 'TÓRAX / BUSTO', unit: 'cm' },
  { key: 'cintura', label: 'CINTURA', unit: 'cm' },
  { key: 'quadril', label: 'QUADRIL', unit: 'cm' },
  { key: 'manga', label: 'MANGA', unit: 'cm' },
  { key: 'altura', label: 'ALTURA', unit: 'cm' },
];

const MeasurementForm = ({ gender, onSubmit }: MeasurementFormProps) => {
  const [measurements, setMeasurements] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasMissingField = measurementFields.some(
      field => !(measurements[field.key] ?? '').trim()
    );

    if (hasMissingField) {
      toast.error('Por favor, preencha todas as medidas obrigatórias.');
      return;
    }

    const normalizedMeasurements = measurementFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = (measurements[field.key] ?? '').trim();
      return acc;
    }, {});

    onSubmit(normalizedMeasurements);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24 w-full max-w-5xl mx-auto">
      {/* Croqui silhouette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full lg:w-1/2 flex justify-center"
      >
        <svg
          viewBox="0 0 200 600"
          className="w-48 md:w-56 h-auto"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="0.5"
          opacity="0.4"
        >
          {gender === 'feminina' ? (
            // Female croqui
            <>
              {/* Head */}
              <ellipse cx="100" cy="45" rx="18" ry="22" />
              {/* Neck */}
              <line x1="93" y1="67" x2="91" y2="90" />
              <line x1="107" y1="67" x2="109" y2="90" />
              {/* Shoulders */}
              <line x1="91" y1="90" x2="55" y2="105" />
              <line x1="109" y1="90" x2="145" y2="105" />
              {/* Torso */}
              <path d="M 55 105 Q 60 180, 75 220" />
              <path d="M 145 105 Q 140 180, 125 220" />
              {/* Waist */}
              <path d="M 75 220 Q 80 240, 70 280" />
              <path d="M 125 220 Q 120 240, 130 280" />
              {/* Hips */}
              <path d="M 70 280 Q 65 310, 80 350" />
              <path d="M 130 280 Q 135 310, 120 350" />
              {/* Legs */}
              <path d="M 80 350 Q 82 430, 85 520" />
              <path d="M 120 350 Q 118 430, 115 520" />
              {/* Feet */}
              <line x1="85" y1="520" x2="75" y2="530" />
              <line x1="115" y1="520" x2="125" y2="530" />
              {/* Arms */}
              <path d="M 55 105 Q 40 180, 35 260" />
              <path d="M 145 105 Q 160 180, 165 260" />
            </>
          ) : (
            // Male croqui
            <>
              {/* Head */}
              <ellipse cx="100" cy="42" rx="17" ry="21" />
              {/* Neck */}
              <line x1="92" y1="63" x2="89" y2="85" />
              <line x1="108" y1="63" x2="111" y2="85" />
              {/* Shoulders */}
              <line x1="89" y1="85" x2="45" y2="100" />
              <line x1="111" y1="85" x2="155" y2="100" />
              {/* Torso */}
              <path d="M 45 100 Q 55 180, 70 230" />
              <path d="M 155 100 Q 145 180, 130 230" />
              {/* Waist */}
              <path d="M 70 230 Q 72 250, 68 275" />
              <path d="M 130 230 Q 128 250, 132 275" />
              {/* Hips */}
              <path d="M 68 275 Q 65 300, 78 340" />
              <path d="M 132 275 Q 135 300, 122 340" />
              {/* Legs */}
              <path d="M 78 340 Q 80 420, 82 520" />
              <path d="M 122 340 Q 120 420, 118 520" />
              {/* Feet */}
              <line x1="82" y1="520" x2="72" y2="530" />
              <line x1="118" y1="520" x2="128" y2="530" />
              {/* Arms */}
              <path d="M 45 100 Q 30 180, 28 270" />
              <path d="M 155 100 Q 170 180, 172 270" />
            </>
          )}

          {/* Measurement guide lines */}
          {/* Neck */}
          <line x1="88" y1="75" x2="112" y2="75" stroke="hsl(var(--gold))" strokeWidth="0.3" strokeDasharray="2" />
          {/* Shoulders */}
          <line x1="50" y1="100" x2="150" y2="100" stroke="hsl(var(--gold))" strokeWidth="0.3" strokeDasharray="2" />
          {/* Chest */}
          <line x1="55" y1="150" x2="145" y2="150" stroke="hsl(var(--gold))" strokeWidth="0.3" strokeDasharray="2" />
          {/* Waist */}
          <line x1="70" y1="230" x2="130" y2="230" stroke="hsl(var(--gold))" strokeWidth="0.3" strokeDasharray="2" />
          {/* Hips */}
          <line x1="65" y1="285" x2="135" y2="285" stroke="hsl(var(--gold))" strokeWidth="0.3" strokeDasharray="2" />
        </svg>
      </motion.div>

      {/* Form inputs */}
      <motion.form
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full lg:w-1/2 flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <h3 className="font-heading text-2xl tracking-[0.15em] text-foreground mb-4">
          PERSONALIZAR MEDIDAS
        </h3>
        <p className="font-body text-xs tracking-[0.1em] text-muted-foreground mb-8">
          Insira suas medidas em centímetros para uma peça perfeitamente ajustada ao seu corpo.
        </p>

        {measurementFields.map((field, i) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-4"
          >
            <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground w-32 shrink-0">
              {field.label}
            </label>
            <input
              type="text"
              className="measure-input flex-1"
              placeholder="—"
              value={measurements[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required
              aria-required="true"
            />
            <span className="font-body text-[10px] text-muted-foreground tracking-wider">
              {field.unit}
            </span>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          type="submit"
          className="mt-8 font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 self-start gold-hover transition-colors"
        >
          SALVAR MEDIDAS
        </motion.button>
      </motion.form>
    </div>
  );
};

export default MeasurementForm;
