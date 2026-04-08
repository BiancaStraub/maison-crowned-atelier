import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '@/contexts/CartContext';
import { formatPrice } from '@/data/products';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { appendPersistedOrder, getPersistedAuth, getPersistedMeasurements } from '@/lib/localStore';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCartContext();
  const [showCheckout, setShowCheckout] = useState(false);
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', country: '', zip: '',
  });

  useEffect(() => {
    const auth = getPersistedAuth();
    if (auth.isAuthenticated && auth.role === 'admin') {
      toast.error('Área restrita ao cliente. Redirecionando ao painel administrativo.');
      navigate('/admin');
    }
  }, [navigate]);

  const hasSavedMeasurements = () => {
    const auth = getPersistedAuth();
    const userEmail = auth.email || 'cliente@maisoncrowned.com';

    return getPersistedMeasurements().some(measurement =>
      measurement.user_email === userEmail &&
      [
        measurement.busto,
        measurement.cintura,
        measurement.quadril,
        measurement.pescoco,
        measurement.ombro,
        measurement.manga,
        measurement.altura,
      ].every(value => typeof value === 'string' && value.trim().length > 0)
    );
  };

  const handleCheckout = () => {
    if (!hasSavedMeasurements()) {
      toast.error('Atenção: Você precisa cadastrar suas medidas no seu Painel antes de encomendar uma peça sob medida.');
      return;
    }

    const requiredShippingValues = [
      shipping.name,
      shipping.email,
      shipping.address,
      shipping.city,
      shipping.country,
      shipping.zip,
    ];

    const hasMissingShippingField = requiredShippingValues.some(value => !value.trim());
    if (hasMissingShippingField) {
      toast.error('Preencha todos os campos obrigatórios de entrega para finalizar a compra.');
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email.trim());
    if (!emailIsValid) {
      toast.error('Informe um e-mail válido para finalizar a compra.');
      return;
    }

    const auth = getPersistedAuth();
    appendPersistedOrder({
      id: crypto.randomUUID(),
      status: 'Em Medição',
      total,
      created_at: new Date().toISOString(),
      shipping_name: shipping.name.trim() || null,
      user_email: auth.email || 'cliente@maisoncrowned.com',
      order_items: items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    });

    toast.success('Pedido confirmado!', {
      description: 'Você receberá um e-mail de confirmação com o rastreamento DHL Express.',
    });
    clearCart();
    setShowCheckout(false);
  };

  if (items.length === 0 && !showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-5xl tracking-[0.2em] text-foreground"
          >
            CARRINHO
          </motion.h1>
          <div className="mt-6 w-12 h-px bg-gold" />
          <p className="mt-8 font-body text-sm text-muted-foreground tracking-[0.15em]">
            Seu carrinho está vazio.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-12 font-body text-xs tracking-[0.3em] text-foreground/70 border-b border-foreground/20 pb-2 gold-hover transition-colors"
          >
            EXPLORAR COLEÇÕES
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground">CARRINHO</h1>
        <div className="mt-4 w-12 h-px bg-gold" />

        {!showCheckout ? (
          <>
            <div className="mt-12 flex flex-col gap-8">
              {items.map((item, i) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-6 border-b border-border pb-8"
                >
                  <div className="w-20 h-28 bg-secondary flex items-center justify-center shrink-0">
                    <span className="font-heading text-2xl text-foreground/10">
                      {item.product.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl tracking-[0.1em] text-foreground">
                      {item.product.name}
                    </h3>
                    <p className="font-body text-[10px] tracking-[0.2em] text-muted-foreground mt-1">
                      {item.product.subtitle} — {item.product.fabric}
                    </p>
                    {item.measurements && Object.keys(item.measurements).length > 0 && (
                      <p className="font-body text-[9px] tracking-[0.2em] text-gold mt-2">
                        SOB MEDIDA
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="font-body text-xs text-muted-foreground gold-hover"
                      >
                        −
                      </button>
                      <span className="font-body text-sm text-foreground tracking-wider">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="font-body text-xs text-muted-foreground gold-hover"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-auto font-body text-[10px] tracking-[0.2em] text-muted-foreground gold-hover"
                      >
                        REMOVER
                      </button>
                    </div>
                  </div>
                  <span className="font-body text-sm tracking-[0.1em] text-gold shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-end gap-4 border-t border-border pt-8">
              <div className="flex items-baseline gap-6">
                <span className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">TOTAL</span>
                <span className="font-heading text-2xl tracking-[0.1em] text-foreground">{formatPrice(total)}</span>
              </div>
              <p className="font-body text-[9px] tracking-[0.2em] text-muted-foreground">
                ENVIO VIA DHL INTERNATIONAL EXPRESS — WORLDWIDE
              </p>
              <button
                onClick={() => setShowCheckout(true)}
                className="mt-4 font-body text-xs tracking-[0.3em] text-foreground border border-foreground/20 px-8 py-3 gold-hover transition-colors hover:border-gold"
              >
                FINALIZAR PEDIDO
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="font-body text-[10px] tracking-[0.25em] text-muted-foreground border-b border-border pb-1 gold-hover"
              >
                CADASTRAR MEDIDAS NO PAINEL
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <button
              onClick={() => setShowCheckout(false)}
              className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover mb-8"
            >
              ← VOLTAR AO CARRINHO
            </button>

            <h2 className="font-heading text-2xl tracking-[0.15em] text-foreground mb-2">
              ENVIO & ENTREGA
            </h2>
            <p className="font-body text-[10px] tracking-[0.2em] text-muted-foreground mb-8">
              DHL INTERNATIONAL WORLDWIDE EXPRESS — 120+ PAÍSES
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              {[
                { key: 'name', label: 'NOME COMPLETO' },
                { key: 'email', label: 'E-MAIL' },
                { key: 'address', label: 'ENDEREÇO' },
                { key: 'city', label: 'CIDADE' },
                { key: 'country', label: 'PAÍS' },
                { key: 'zip', label: 'CEP / ZIP' },
              ].map(field => (
                <div key={field.key} className={field.key === 'address' ? 'md:col-span-2' : ''}>
                  <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">
                    {field.label}
                  </label>
                  <input
                    type={field.key === 'email' ? 'email' : 'text'}
                    className="measure-input w-full mt-1"
                    value={shipping[field.key as keyof typeof shipping]}
                    onChange={e => setShipping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    required
                    aria-required="true"
                  />
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-baseline gap-6">
              <span className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">TOTAL</span>
              <span className="font-heading text-2xl tracking-[0.1em] text-foreground">{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-8 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-10 py-3 transition-opacity hover:opacity-80"
            >
              CONFIRMAR PEDIDO
            </button>
          </motion.div>
        )}
      </div>
      <div className="py-section" />
      <Footer />
    </div>
  );
};

export default Cart;
