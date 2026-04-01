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
...
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
