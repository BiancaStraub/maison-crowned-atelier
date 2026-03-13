import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const ORDER_STATUSES = ['Em Medição', 'Corte e Costura', 'Controle de Qualidade', 'Enviado', 'Entregue'];

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string | null;
  user_id: string;
  order_items: { product_name: string; price: number }[];
}

interface Supplier {
  id: string;
  name: string;
  fabric_type: string;
  contact: string | null;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tab, setTab] = useState<'orders' | 'suppliers' | 'sales'>('sales');
  const [newSupplier, setNewSupplier] = useState({ name: '', fabric_type: '', contact: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }
    if (user && isAdmin) fetchData();
  }, [user, isAdmin, authLoading]);

  const fetchData = async () => {
    const [ordersRes, suppliersRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(product_name, price)').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*').order('name'),
    ]);
    setOrders((ordersRes.data as AdminOrder[]) || []);
    setSuppliers((suppliersRes.data as Supplier[]) || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const addSupplier = async () => {
    if (!newSupplier.name || !newSupplier.fabric_type) return;
    const { data, error } = await supabase.from('suppliers').insert([newSupplier]).select().single();
    if (error) {
      toast.error('Erro ao adicionar fornecedor');
    } else {
      setSuppliers(prev => [...prev, data as Supplier]);
      setNewSupplier({ name: '', fabric_type: '', contact: '' });
      toast.success('Fornecedor adicionado');
    }
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success('Fornecedor removido');
  };

  // Sales data
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = new Date(order.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground tracking-[0.2em] animate-pulse">CARREGANDO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground">PAINEL ADMIN</h1>
        <div className="mt-4 w-12 h-px bg-gold" />

        {/* Tabs */}
        <div className="mt-12 flex gap-8 border-b border-border">
          {(['sales', 'orders', 'suppliers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-body text-[10px] tracking-[0.3em] pb-3 transition-colors ${
                tab === t ? 'text-gold border-b border-gold' : 'text-muted-foreground gold-hover'
              }`}
            >
              {t === 'sales' ? 'VENDAS' : t === 'orders' ? 'PEDIDOS' : 'FORNECEDORES'}
            </button>
          ))}
        </div>

        {/* Sales Tab */}
        {tab === 'sales' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border p-6">
                <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">RECEITA TOTAL</p>
                <p className="mt-2 font-heading text-3xl tracking-[0.1em] text-gold">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="border border-border p-6">
                <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">TOTAL PEDIDOS</p>
                <p className="mt-2 font-heading text-3xl tracking-[0.1em] text-foreground">{totalOrders}</p>
              </div>
              <div className="border border-border p-6">
                <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">LUCRO ESTIMADO (40%)</p>
                <p className="mt-2 font-heading text-3xl tracking-[0.1em] text-gold">{formatPrice(Math.round(totalRevenue * 0.4))}</p>
              </div>
            </div>

            {/* Revenue chart bars */}
            <div className="mt-12">
              <h3 className="font-body text-[10px] tracking-[0.3em] text-muted-foreground mb-6">RECEITA POR MÊS</h3>
              {Object.keys(monthlyRevenue).length === 0 ? (
                <p className="font-body text-sm text-muted-foreground/50">Nenhuma venda registrada.</p>
              ) : (
                <div className="flex items-end gap-4 h-48">
                  {Object.entries(monthlyRevenue).map(([month, revenue]) => {
                    const maxRev = Math.max(...Object.values(monthlyRevenue));
                    const height = maxRev > 0 ? (revenue / maxRev) * 100 : 0;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <span className="font-body text-[8px] text-gold">{formatPrice(revenue)}</span>
                        <div
                          className="w-full bg-gold/20 border border-gold/30 transition-all"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                        <span className="font-body text-[8px] tracking-wider text-muted-foreground">{month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {orders.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Nenhum pedido.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-border p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} — {order.shipping_name || 'N/A'}
                        </p>
                        <div className="mt-2 flex flex-col gap-1">
                          {order.order_items.map((item, j) => (
                            <span key={j} className="font-body text-xs text-foreground/60">{item.product_name}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-body text-sm text-gold">{formatPrice(order.total)}</span>
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className="bg-secondary text-foreground font-body text-[10px] tracking-wider border border-border px-3 py-1.5 focus:outline-none focus:border-gold"
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Suppliers Tab */}
        {tab === 'suppliers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {/* Add supplier form */}
            <div className="border border-border p-6 mb-8">
              <h3 className="font-body text-[10px] tracking-[0.3em] text-muted-foreground mb-4">NOVO FORNECEDOR</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">NOME</label>
                  <input
                    className="measure-input w-full mt-1"
                    value={newSupplier.name}
                    onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">TIPO DE TECIDO</label>
                  <input
                    className="measure-input w-full mt-1"
                    value={newSupplier.fabric_type}
                    onChange={e => setNewSupplier(p => ({ ...p, fabric_type: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] text-muted-foreground">CONTATO</label>
                  <input
                    className="measure-input w-full mt-1"
                    value={newSupplier.contact}
                    onChange={e => setNewSupplier(p => ({ ...p, contact: e.target.value }))}
                  />
                </div>
              </div>
              <button
                onClick={addSupplier}
                className="mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-8 py-2 transition-opacity hover:opacity-80"
              >
                ADICIONAR
              </button>
            </div>

            {/* Suppliers table */}
            {suppliers.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-body text-[10px] tracking-[0.3em] text-muted-foreground py-3">NOME</th>
                      <th className="text-left font-body text-[10px] tracking-[0.3em] text-muted-foreground py-3">TECIDO</th>
                      <th className="text-left font-body text-[10px] tracking-[0.3em] text-muted-foreground py-3">CONTATO</th>
                      <th className="text-right font-body text-[10px] tracking-[0.3em] text-muted-foreground py-3">AÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map(s => (
                      <tr key={s.id} className="border-b border-border/50">
                        <td className="py-3 font-body text-sm text-foreground/80">{s.name}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{s.fabric_type}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{s.contact || '—'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteSupplier(s.id)}
                            className="font-body text-[10px] tracking-[0.2em] text-destructive gold-hover"
                          >
                            REMOVER
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default Admin;
