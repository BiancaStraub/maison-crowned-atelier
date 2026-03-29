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
    if (!auth.isAuthenticated || auth.role !== 'client') {
      navigate('/login');
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
    if (!newMeasurement.label) { toast.error('Dê um nome ao perfil de medidas'); return; }
    const entry: PersistedMeasurement = {
      id: crypto.randomUUID(),
      label: newMeasurement.label,
      user_email: userEmail,
      busto: newMeasurement.busto || null,
      cintura: newMeasurement.cintura || null,
      quadril: newMeasurement.quadril || null,
      pescoco: newMeasurement.pescoco || null,
      ombro: newMeasurement.ombro || null,
      manga: newMeasurement.manga || null,
      altura: newMeasurement.altura || null,
      created_at: new Date().toISOString(),
    };
    const next = appendPersistedMeasurement(entry).filter(m => m.user_email === userEmail);
    setMeasurements(next);
    toast.success('Medidas salvas!');
    setNewMeasurement({ label: '', busto: '', cintura: '', quadril: '', pescoco: '', ombro: '', manga: '', altura: '' });
  };

  const deleteMeasurement = (id: string) => {
    const allMeasurements = getPersistedMeasurements().filter(measurement => measurement.id !== id);
    setPersistedMeasurements(allMeasurements);
    setMeasurements(allMeasurements.filter(measurement => measurement.user_email === userEmail));
    toast.success('Medidas removidas');
  };

  const saveAddress = () => {
    if (!newAddress.street || !newAddress.city) { toast.error('Preencha os campos obrigatórios'); return; }
    const entry: Address = { id: crypto.randomUUID(), ...newAddress };
    setAddresses(prev => [entry, ...prev]);
    toast.success('Endereço salvo!');
    setNewAddress({ label: 'Principal', street: '', city: '', state: '', zip: '', country: 'Brasil' });
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success('Endereço removido');
  };

  // Collect product IDs from delivered orders for reviews
  const deliveredProducts = orders
    .filter(o => o.status === 'Entregue')
    .flatMap(o => o.order_items.map(i => i.product_id));
  const uniqueDeliveredProducts = [...new Set(deliveredProducts)];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground tracking-[0.2em] animate-pulse">CARREGANDO...</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pedidos', label: 'MEUS PEDIDOS' },
    { key: 'medidas', label: 'MINHAS MEDIDAS' },
    { key: 'carrinho', label: 'MEU CARRINHO' },
    { key: 'enderecos', label: 'MEUS ENDEREÇOS' },
    { key: 'avaliacoes', label: 'AVALIAÇÕES' },
  ];

  const measureFields = [
    { key: 'busto', label: 'BUSTO' }, { key: 'cintura', label: 'CINTURA' }, { key: 'quadril', label: 'QUADRIL' },
    { key: 'pescoco', label: 'PESCOÇO' }, { key: 'ombro', label: 'OMBRO' }, { key: 'manga', label: 'MANGA' },
    { key: 'altura', label: 'ALTURA' },
  ];

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground">MINHA CONTA</h1>
            <div className="mt-4 w-12 h-px bg-gold" />
          </div>
          <button onClick={handleSignOut} className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover">SAIR</button>
        </div>
        <p className="mt-6 font-body text-xs tracking-[0.2em] text-muted-foreground">{userEmail}</p>

        {/* Tabs */}
        <div className="mt-12 flex gap-6 border-b border-border overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-body text-[10px] tracking-[0.3em] pb-3 whitespace-nowrap transition-colors ${
                tab === t.key ? 'text-gold border-b border-gold' : 'text-muted-foreground gold-hover'
              }`}
            >
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
              <div className="flex flex-col gap-8">
                {orders.map((order, i) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-border p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">PEDIDO #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="font-body text-[10px] tracking-[0.2em] text-muted-foreground/60 mt-1">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="font-body text-sm tracking-[0.1em] text-gold">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-1">
                      {order.order_items.map((item, j) => (
                        <p key={j} className="font-body text-xs text-foreground/70 tracking-wider">{item.product_name} — {formatPrice(item.price)}</p>
                      ))}
                    </div>
                    {/* Status Timeline */}
                    <div className="mt-6">
                      <div className="flex items-center gap-1">
                        {ORDER_STATUSES.map((status, idx) => {
                          const currentIdx = ORDER_STATUSES.indexOf(order.status);
                          const isActive = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;
                          return (
                            <div key={status} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full flex items-center">
                                <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${isCurrent ? 'bg-gold border-gold' : isActive ? 'bg-gold/50 border-gold/50' : 'bg-transparent border-border'}`} />
                                {idx < ORDER_STATUSES.length - 1 && <div className={`flex-1 h-px ${isActive ? 'bg-gold/40' : 'bg-border'}`} />}
                              </div>
                              <span className={`font-body text-[8px] tracking-[0.15em] text-center leading-tight ${isCurrent ? 'text-gold' : isActive ? 'text-foreground/40' : 'text-muted-foreground/30'}`}>{status.toUpperCase()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
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
                <input className="measure-input w-full mt-1" placeholder="Ex: Casual, Formal..." value={newMeasurement.label} onChange={e => setNewMeasurement(p => ({ ...p, label: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {measureFields.map(f => (
                  <div key={f.key}>
                    <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">{f.label}</label>
                    <input className="measure-input w-full mt-1" placeholder="cm" value={(newMeasurement as any)[f.key]} onChange={e => setNewMeasurement(p => ({ ...p, [f.key]: e.target.value }))} />
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
