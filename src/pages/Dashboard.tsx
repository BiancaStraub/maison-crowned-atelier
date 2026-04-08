import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/data/products';
import { useCartContext } from '@/contexts/CartContext';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import { toast } from 'sonner';
import {
  STORAGE_KEYS,
  appendPersistedMeasurement,
  clearPersistedAuth,
  getPersistedAuth,
  getPersistedMeasurements,
  getPersistedOrders,
  setPersistedMeasurements,
  subscribeStorage,
  type PersistedMeasurement,
  type PersistedOrder,
} from '@/lib/localStore';

const ORDER_STATUSES = ['Em Medição', 'Corte e Costura', 'Controle de Qualidade', 'Enviado', 'Entregue'];

type Tab = 'pedidos' | 'medidas' | 'carrinho' | 'enderecos' | 'avaliacoes';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string | null;
  order_items: { product_name: string; price: number; product_id: string }[];
}

interface Measurement {
  id: string;
  label: string;
  busto: string | null;
  cintura: string | null;
  quadril: string | null;
  pescoco: string | null;
  ombro: string | null;
  manga: string | null;
  altura: string | null;
}

interface Address {
  id: string;
  label: string | null;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => getPersistedAuth());
  const userEmail = auth.email || 'cliente@maisoncrowned.com';
  const { items, removeItem, updateQuantity, total } = useCartContext();
  const [tab, setTab] = useState<Tab>('pedidos');
  const [orders, setOrders] = useState<PersistedOrder[]>([]);
  const [measurements, setMeasurements] = useState<PersistedMeasurement[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // New measurement form
  const [newMeasurement, setNewMeasurement] = useState({
    label: '', busto: '', cintura: '', quadril: '', pescoco: '', ombro: '', manga: '', altura: ''
  });

  // New address form
  const [newAddress, setNewAddress] = useState({
    label: 'Principal', street: '', city: '', state: '', zip: '', country: 'Brasil'
  });

  useEffect(() => {
    const refreshAuth = () => setAuth(getPersistedAuth());
    const refreshOrders = () => {
      const email = getPersistedAuth().email;
      const clientOrders = getPersistedOrders().filter(order => order.user_email === email);
      setOrders(clientOrders);
    };
    const refreshMeasurements = () => {
      const email = getPersistedAuth().email;
      const clientMeasurements = getPersistedMeasurements().filter(measurement => measurement.user_email === email);
      setMeasurements(clientMeasurements);
    };

    refreshAuth();
    refreshOrders();
    refreshMeasurements();

    const unsubAuth = subscribeStorage(STORAGE_KEYS.auth, refreshAuth);
    const unsubOrders = subscribeStorage(STORAGE_KEYS.orders, refreshOrders);
    const unsubMeasurements = subscribeStorage(STORAGE_KEYS.measurements, refreshMeasurements);

    return () => {
      unsubAuth();
      unsubOrders();
      unsubMeasurements();
    };
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else if (auth.role === 'admin') {
      toast.error('Área restrita ao cliente. Redirecionando ao painel administrativo.');
      navigate('/admin');
    }
  }, [auth, navigate]);

  const handleSignOut = () => {
    clearPersistedAuth();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    toast.success('Até logo!');
    navigate('/');
  };

  const saveMeasurement = () => {
    const requiredMeasurementKeys: (keyof typeof newMeasurement)[] = [
      'label',
      'busto',
      'cintura',
      'quadril',
      'pescoco',
      'ombro',
      'manga',
      'altura',
    ];

    const hasMissingField = requiredMeasurementKeys.some(key => !newMeasurement[key].trim());
    if (hasMissingField) {
      toast.error('Por favor, preencha todas as medidas obrigatórias.');
      return;
    }

    const entry: PersistedMeasurement = {
      id: crypto.randomUUID(),
      label: newMeasurement.label.trim(),
      user_email: userEmail,
      busto: newMeasurement.busto.trim(),
      cintura: newMeasurement.cintura.trim(),
      quadril: newMeasurement.quadril.trim(),
      pescoco: newMeasurement.pescoco.trim(),
      ombro: newMeasurement.ombro.trim(),
      manga: newMeasurement.manga.trim(),
      altura: newMeasurement.altura.trim(),
      created_at: new Date().toISOString(),
    };
    const next = appendPersistedMeasurement(entry).filter(m => m.user_email === userEmail);
    setMeasurements(next);
    toast.success('Medidas salvas!');
    setNewMeasurement({ label: '', busto: '', cintura: '', quadril: '', pescoco: '', ombro: '', manga: '', altura: '' });
  };

  const deleteMeasurement = (id: string) => {
    const next = getPersistedMeasurements().filter(m => m.id !== id);
    setPersistedMeasurements(next);
    setMeasurements(next.filter(m => m.user_email === userEmail));
    toast.success('Perfil de medidas removido.');
  };

  const saveAddress = () => {
    if (!newAddress.street.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.zip.trim()) {
      toast.error('Preencha todos os campos do endereço.');
      return;
    }
    const entry: Address = { id: crypto.randomUUID(), ...newAddress };
    setAddresses(prev => [entry, ...prev]);
    toast.success('Endereço salvo!');
    setNewAddress({ label: 'Principal', street: '', city: '', state: '', zip: '', country: 'Brasil' });
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success('Endereço removido.');
  };

  const measureFields = [
    { key: 'busto', label: 'BUSTO' },
    { key: 'cintura', label: 'CINTURA' },
    { key: 'quadril', label: 'QUADRIL' },
    { key: 'pescoco', label: 'PESCOÇO' },
    { key: 'ombro', label: 'OMBRO' },
    { key: 'manga', label: 'MANGA' },
    { key: 'altura', label: 'ALTURA' },
  ];

  const uniqueDeliveredProducts = Array.from(
    new Set(
      orders
        .filter(o => o.status === 'Entregue')
        .flatMap(o => o.order_items.map(i => i.product_id))
    )
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pedidos', label: 'PEDIDOS' },
    { key: 'medidas', label: 'MEDIDAS' },
    { key: 'carrinho', label: 'CARRINHO' },
    { key: 'enderecos', label: 'ENDEREÇOS' },
    { key: 'avaliacoes', label: 'AVALIAÇÕES' },
  ];

  const getStatusIndex = (status: string) => ORDER_STATUSES.indexOf(status);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-[0.3em] text-foreground">MEU PAINEL</h1>
          <p className="font-body text-[10px] tracking-[0.2em] text-muted-foreground mt-1">{userEmail}</p>
        </div>
        
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-6 border-b border-border pb-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`font-body text-[10px] tracking-[0.3em] pb-2 transition-colors ${tab === t.key ? 'text-gold border-b border-gold' : 'text-muted-foreground gold-hover'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {orders.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground tracking-[0.15em]">Nenhum pedido encontrado.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="font-body text-[10px] tracking-[0.2em] text-gold">{order.status}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="flex gap-1 mb-4">
                      {ORDER_STATUSES.map((s, i) => (
                        <div key={s} className={`h-1 flex-1 ${i <= getStatusIndex(order.status) ? 'bg-gold' : 'bg-border'}`} />
                      ))}
                    </div>
                    {order.order_items.map((item, idx) => (
                      <p key={idx} className="font-body text-xs text-foreground">{item.product_name} — {formatPrice(item.price)}</p>
                    ))}
                    <p className="font-body text-[10px] text-muted-foreground mt-2">Total: {formatPrice(order.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* MEDIDAS */}
        {tab === 'medidas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="border border-border p-6 mb-8">
              <h3 className="font-body text-[10px] tracking-[0.3em] text-muted-foreground mb-4">NOVO PERFIL DE MEDIDAS</h3>
              <div className="mb-4">
                <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">NOME DO PERFIL</label>
                <input className="measure-input w-full mt-1" placeholder="Ex: Casual, Formal..." value={newMeasurement.label} onChange={e => setNewMeasurement(p => ({ ...p, label: e.target.value }))} required aria-required="true" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {measureFields.map(f => (
                  <div key={f.key}>
                    <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">{f.label}</label>
                    <input className="measure-input w-full mt-1" placeholder="cm" value={(newMeasurement as any)[f.key]} onChange={e => setNewMeasurement(p => ({ ...p, [f.key]: e.target.value }))} required aria-required="true" />
                  </div>
                ))}
              </div>
              <button onClick={saveMeasurement} className="mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-8 py-2 transition-opacity hover:opacity-80">SALVAR MEDIDAS</button>
            </div>

            {measurements.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Nenhum perfil de medidas cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {measurements.map(m => (
                  <div key={m.id} className="border border-border p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-xs tracking-[0.2em] text-gold">{m.label}</p>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                        {measureFields.map(f => (
                          <span key={f.key} className="font-body text-[10px] text-muted-foreground">
                            {f.label}: {(m as any)[f.key] || '—'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deleteMeasurement(m.id)} className="font-body text-[10px] tracking-[0.2em] text-destructive gold-hover shrink-0">REMOVER</button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* CARRINHO */}
        {tab === 'carrinho' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {items.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground tracking-[0.15em]">Seu carrinho está vazio.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map(item => (
                  <div key={item.product.id} className="border border-border p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-body text-xs tracking-[0.2em] text-foreground">{item.product.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.product.subtitle} — {formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="font-body text-sm text-muted-foreground gold-hover">−</button>
                      <span className="font-body text-xs text-foreground w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="font-body text-sm text-muted-foreground gold-hover">+</button>
                      <button onClick={() => removeItem(item.product.id)} className="font-body text-[10px] text-destructive ml-4">✕</button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">TOTAL</span>
                  <span className="font-body text-lg tracking-[0.1em] text-gold">{formatPrice(total)}</span>
                </div>
                <button onClick={() => navigate('/carrinho')} className="mt-2 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-8 py-3 self-end transition-opacity hover:opacity-80">
                  FINALIZAR COMPRA
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ENDEREÇOS */}
        {tab === 'enderecos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="border border-border p-6 mb-8">
              <h3 className="font-body text-[10px] tracking-[0.3em] text-muted-foreground mb-4">NOVO ENDEREÇO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">APELIDO</label>
                  <input className="measure-input w-full mt-1" value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">RUA / ENDEREÇO</label>
                  <input className="measure-input w-full mt-1" value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">CIDADE</label>
                  <input className="measure-input w-full mt-1" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">ESTADO</label>
                  <input className="measure-input w-full mt-1" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">CEP</label>
                  <input className="measure-input w-full mt-1" value={newAddress.zip} onChange={e => setNewAddress(p => ({ ...p, zip: e.target.value }))} />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">PAÍS</label>
                  <input className="measure-input w-full mt-1" value={newAddress.country} onChange={e => setNewAddress(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
              <button onClick={saveAddress} className="mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-8 py-2 transition-opacity hover:opacity-80">SALVAR ENDEREÇO</button>
            </div>

            {addresses.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {addresses.map(a => (
                  <div key={a.id} className="border border-border p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-body text-xs tracking-[0.2em] text-gold">{a.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-1">{a.street}, {a.city} - {a.state}, {a.zip}</p>
                      <p className="font-body text-[10px] text-muted-foreground/60">{a.country}</p>
                    </div>
                    <button onClick={() => deleteAddress(a.id)} className="font-body text-[10px] tracking-[0.2em] text-destructive gold-hover shrink-0">REMOVER</button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* AVALIAÇÕES */}
        {tab === 'avaliacoes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {uniqueDeliveredProducts.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground tracking-[0.15em]">Avaliações disponíveis após a entrega dos pedidos.</p>
            ) : (
              <div className="flex flex-col gap-8">
                {uniqueDeliveredProducts.map(pid => (
                  <div key={pid}>
                    <ProductReviews productId={pid} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <div className="py-section" />
      <Footer />
    </div>
  );
};

export default Dashboard;
