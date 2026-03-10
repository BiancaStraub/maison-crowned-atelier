const Footer = () => {
  return (
    <footer className="py-24 px-6 md:px-12 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <span className="font-heading text-3xl tracking-[0.2em] text-gold">MC</span>
          <p className="mt-4 font-body text-[10px] tracking-[0.2em] text-muted-foreground max-w-xs leading-relaxed">
            ALFAIATARIA SOB MEDIDA. CADA PEÇA É UMA DECLARAÇÃO DE INDIVIDUALIDADE, CORTADA COM PRECISÃO E ENTREGUE AO MUNDO INTEIRO VIA DHL EXPRESS.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">ENVIO INTERNACIONAL</span>
          <span className="font-body text-[10px] tracking-[0.2em] text-foreground/50">DHL EXPRESS — WORLDWIDE</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">CONTATO</span>
          <span className="font-body text-[10px] tracking-[0.2em] text-foreground/50">ATELIER@MAISONCROWNED.COM</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-border">
        <p className="font-body text-[9px] tracking-[0.2em] text-muted-foreground/50">
          © 2026 MAISON CROWNED. TODOS OS DIREITOS RESERVADOS.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
