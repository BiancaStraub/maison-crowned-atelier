import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const ORDER_STATUSES = ['Em Medição', 'Corte e Costura', 'Controle de Qualidade', 'Enviado', 'Entregue'];

type Tab = 'financeiro' | 'pedidos' | 'fornecedores' | 'funcionarios' | 'producao' | 'medidas';

interface AdminOrder {
  id: string; status: string; total: number; created_at: string; shipping_name: string | null; user_id: string;
  order_items: { product_name: string; price: number }[];
}
interface Supplier { id: string; name: string; fabric_type: string; contact: string | null; cnpj: string | null; email: string | null; telefone: string | null; }
interface Employee { id: string; nome: string; cargo: string; cpf: string | null; }
interface Expense { id: string; description: string; amount: number; category: string; created_at: string; }
interface ClientMeasurement { id: string; user_id: string; label: string; busto: string | null; cintura: string | null; quadril: string | null; pescoco: string | null; ombro: string | null; manga: string | null; altura: string | null; }

const Admin = () => {
  const navigate = useNavigate();
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('financeiro');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clientMeasurements, setClientMeasurements] = useState<ClientMeasurement[]>([]);
  const [loading, setLoading] = useState(false);

  const [newSupplier, setNewSupplier] = useState({ name: '', fabric_type: '', contact: '', cnpj: '', email: '', telefone: '' });
  const [newEmployee, setNewEmployee] = useState({ nome: '', cargo: '', cpf: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Geral' });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setTimeout(() => {
      if (adminEmail === 'admin@maisoncrowned.com' && adminPassword === 'admin123') {
        setAdminAuthenticated(true);
        toast.success('Acesso de Administrador Autorizado');
        fetchData();
      } else {
        toast.error('Credenciais inválidas. Acesso negado.');
      }
      setAdminLoginLoading(false);
    }, 500);
  };

  useEffect(() => {
    // no-op: data loaded after admin login
  }, []);

  const fetchData = async () => {
    const [ordersRes, suppliersRes, employeesRes, expensesRes, measRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(product_name, price)').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('employees').select('*').order('nome'),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('measurements').select('*').order('created_at', { ascending: false }),
    ]);
    setOrders((ordersRes.data as AdminOrder[]) || []);
    setSuppliers((suppliersRes.data as Supplier[]) || []);
    setEmployees((employeesRes.data as Employee[]) || []);
    setExpenses((expensesRes.data as Expense[]) || []);
    setClientMeasurements((measRes.data as ClientMeasurement[]) || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toast.error('Erro ao atualizar'); return; }
    toast.success('Status atualizado');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const addSupplier = async () => {
    if (!newSupplier.name || !newSupplier.fabric_type) return;
    const { data, error } = await supabase.from('suppliers').insert([newSupplier]).select().single();
    if (error) { toast.error('Erro ao adicionar'); return; }
    setSuppliers(prev => [...prev, data as Supplier]);
    setNewSupplier({ name: '', fabric_type: '', contact: '', cnpj: '', email: '', telefone: '' });
    toast.success('Fornecedor adicionado');
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success('Removido');
  };

  const addEmployee = async () => {
    if (!newEmployee.nome || !newEmployee.cargo) return;
    const { data, error } = await supabase.from('employees').insert([newEmployee]).select().single();
    if (error) { toast.error('Erro ao adicionar'); return; }
    setEmployees(prev => [...prev, data as Employee]);
    setNewEmployee({ nome: '', cargo: '', cpf: '' });
    toast.success('Funcionário adicionado');
  };

  const deleteEmployee = async (id: string) => {
    await supabase.from('employees').delete().eq('id', id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success('Removido');
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    const { data, error } = await supabase.from('expenses').insert([{ ...newExpense, amount: parseInt(newExpense.amount) }]).select().single();
    if (error) { toast.error('Erro ao adicionar'); return; }
    setExpenses(prev => [data as Expense, ...prev]);
    setNewExpense({ description: '', amount: '', category: 'Geral' });
    toast.success('Despesa registrada');
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const toDo = orders.filter(o => ['Em Medição', 'Corte e Costura', 'Controle de Qualidade'].includes(o.status));
  const toShip = orders.filter(o => o.status === 'Enviado');

  if (!adminAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground text-center">ADMIN LOGIN</h1>
          <div className="mt-4 w-12 h-px bg-gold mx-auto" />

          <form onSubmit={handleAdminLogin} className="mt-12 flex flex-col gap-6">
            <div>
              <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">E-MAIL</label>
              <input type="email" required className="measure-input w-full mt-1" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            </div>
            <div>
              <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">SENHA</label>
              <input type="password" required className="measure-input w-full mt-1" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={adminLoginLoading}
              className="mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-10 py-3 transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {adminLoginLoading ? 'VERIFICANDO...' : 'ENTRAR'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-[9px] tracking-[0.2em] text-muted-foreground/40">
            Teste: admin@maisoncrowned.com / admin123
          </p>

          <button
            onClick={() => navigate('/')}
            className="mt-8 block mx-auto font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover"
          >
            ← VOLTAR
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground tracking-[0.2em] animate-pulse">CARREGANDO...</p>
      </div>
    );
  }

  const adminTabs: { key: Tab; label: string }[] = [
    { key: 'financeiro', label: 'FINANCEIRO' },
    { key: 'pedidos', label: 'PEDIDOS' },
    { key: 'fornecedores', label: 'FORNECEDORES' },
    { key: 'funcionarios', label: 'FUNCIONÁRIOS' },
    { key: 'producao', label: 'PRODUÇÃO' },
    { key: 'medidas', label: 'MEDIDAS CLIENTES' },
  ];

  const inputClass = "measure-input w-full mt-1";
  const labelClass = "font-body text-[10px] tracking-[0.2em] text-muted-foreground";
  const btnClass = "mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-8 py-2 transition-opacity hover:opacity-80";

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground">PAINEL ADMIN</h1>
        <div className="mt-4 w-12 h-px bg-gold" />

        <div className="mt-12 flex gap-6 border-b border-border overflow-x-auto">
          {adminTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`font-body text-[10px] tracking-[0.3em] pb-3 whitespace-nowrap transition-colors ${tab === t.key ? 'text-gold border-b border-gold' : 'text-muted-foreground gold-hover'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* FINANCEIRO */}
        {tab === 'financeiro' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border p-6">
                <p className={labelClass}>RECEITA TOTAL</p>
                <p className="mt-2 font-heading text-3xl tracking-[0.1em] text-gold">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="border border-border p-6">
                <p className={labelClass}>GASTOS TOTAIS</p>
                <p className="mt-2 font-heading text-3xl tracking-[0.1em] text-destructive">{formatPrice(totalExpenses)}</p>
              </div>
              <div className="border border-border p-6">
                <p className={labelClass}>LUCRO</p>
                <p className={`mt-2 font-heading text-3xl tracking-[0.1em] ${profit >= 0 ? 'text-gold' : 'text-destructive'}`}>{formatPrice(profit)}</p>
              </div>
            </div>

            {/* Add expense */}
            <div className="border border-border p-6 mt-8">
              <h3 className={`${labelClass} mb-4`}>REGISTRAR DESPESA</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>DESCRIÇÃO</label><input className={inputClass} value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))} /></div>
                <div><label className={labelClass}>VALOR (R$)</label><input className={inputClass} type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><label className={labelClass}>CATEGORIA</label><input className={inputClass} value={newExpense.category} onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))} /></div>
              </div>
              <button onClick={addExpense} className={btnClass}>ADICIONAR</button>
            </div>

            {/* Expenses list */}
            {expenses.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className={`text-left ${labelClass} py-3`}>DESCRIÇÃO</th>
                    <th className={`text-left ${labelClass} py-3`}>CATEGORIA</th>
                    <th className={`text-right ${labelClass} py-3`}>VALOR</th>
                    <th className={`text-right ${labelClass} py-3`}>DATA</th>
                  </tr></thead>
                  <tbody>
                    {expenses.slice(0, 20).map(e => (
                      <tr key={e.id} className="border-b border-border/50">
                        <td className="py-3 font-body text-sm text-foreground/80">{e.description}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{e.category}</td>
                        <td className="py-3 font-body text-sm text-destructive text-right">{formatPrice(e.amount)}</td>
                        <td className="py-3 font-body text-[10px] text-muted-foreground text-right">{new Date(e.created_at).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {orders.length === 0 ? <p className="font-body text-sm text-muted-foreground">Nenhum pedido.</p> : (
              <div className="flex flex-col gap-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-border p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="font-body text-[10px] text-muted-foreground/60 mt-1">{new Date(order.created_at).toLocaleDateString('pt-BR')} — {order.shipping_name || 'N/A'}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          {order.order_items.map((item, j) => <span key={j} className="font-body text-xs text-foreground/60">{item.product_name}</span>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-body text-sm text-gold">{formatPrice(order.total)}</span>
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className="bg-secondary text-foreground font-body text-[10px] tracking-wider border border-border px-3 py-1.5 focus:outline-none focus:border-gold">
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* FORNECEDORES */}
        {tab === 'fornecedores' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="border border-border p-6 mb-8">
              <h3 className={`${labelClass} mb-4`}>NOVO FORNECEDOR</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>NOME</label><input className={inputClass} value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className={labelClass}>CNPJ</label><input className={inputClass} value={newSupplier.cnpj} onChange={e => setNewSupplier(p => ({ ...p, cnpj: e.target.value }))} /></div>
                <div><label className={labelClass}>TIPO DE TECIDO</label><input className={inputClass} value={newSupplier.fabric_type} onChange={e => setNewSupplier(p => ({ ...p, fabric_type: e.target.value }))} /></div>
                <div><label className={labelClass}>E-MAIL</label><input className={inputClass} value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} /></div>
                <div><label className={labelClass}>TELEFONE</label><input className={inputClass} value={newSupplier.telefone} onChange={e => setNewSupplier(p => ({ ...p, telefone: e.target.value }))} /></div>
                <div><label className={labelClass}>CONTATO</label><input className={inputClass} value={newSupplier.contact} onChange={e => setNewSupplier(p => ({ ...p, contact: e.target.value }))} /></div>
              </div>
              <button onClick={addSupplier} className={btnClass}>ADICIONAR</button>
            </div>
            {suppliers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className={`text-left ${labelClass} py-3`}>NOME</th>
                    <th className={`text-left ${labelClass} py-3`}>CNPJ</th>
                    <th className={`text-left ${labelClass} py-3`}>TECIDO</th>
                    <th className={`text-left ${labelClass} py-3`}>E-MAIL</th>
                    <th className={`text-left ${labelClass} py-3`}>TELEFONE</th>
                    <th className={`text-right ${labelClass} py-3`}>AÇÃO</th>
                  </tr></thead>
                  <tbody>
                    {suppliers.map(s => (
                      <tr key={s.id} className="border-b border-border/50">
                        <td className="py-3 font-body text-sm text-foreground/80">{s.name}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{s.cnpj || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{s.fabric_type}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{s.email || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{s.telefone || '—'}</td>
                        <td className="py-3 text-right"><button onClick={() => deleteSupplier(s.id)} className="font-body text-[10px] tracking-[0.2em] text-destructive gold-hover">REMOVER</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* FUNCIONÁRIOS */}
        {tab === 'funcionarios' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <div className="border border-border p-6 mb-8">
              <h3 className={`${labelClass} mb-4`}>NOVO FUNCIONÁRIO</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelClass}>NOME</label><input className={inputClass} value={newEmployee.nome} onChange={e => setNewEmployee(p => ({ ...p, nome: e.target.value }))} /></div>
                <div><label className={labelClass}>CARGO</label><input className={inputClass} value={newEmployee.cargo} onChange={e => setNewEmployee(p => ({ ...p, cargo: e.target.value }))} /></div>
                <div><label className={labelClass}>CPF</label><input className={inputClass} value={newEmployee.cpf} onChange={e => setNewEmployee(p => ({ ...p, cpf: e.target.value }))} /></div>
              </div>
              <button onClick={addEmployee} className={btnClass}>ADICIONAR</button>
            </div>
            {employees.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className={`text-left ${labelClass} py-3`}>NOME</th>
                    <th className={`text-left ${labelClass} py-3`}>CARGO</th>
                    <th className={`text-left ${labelClass} py-3`}>CPF</th>
                    <th className={`text-right ${labelClass} py-3`}>AÇÃO</th>
                  </tr></thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e.id} className="border-b border-border/50">
                        <td className="py-3 font-body text-sm text-foreground/80">{e.nome}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{e.cargo}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{e.cpf || '—'}</td>
                        <td className="py-3 text-right"><button onClick={() => deleteEmployee(e.id)} className="font-body text-[10px] tracking-[0.2em] text-destructive gold-hover">REMOVER</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* PRODUÇÃO */}
        {tab === 'producao' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <h3 className="font-body text-xs tracking-[0.3em] text-gold mb-4">PEÇAS A SEREM FEITAS ({toDo.length})</h3>
            {toDo.length === 0 ? <p className="font-body text-sm text-muted-foreground mb-8">Nenhuma peça em produção.</p> : (
              <div className="flex flex-col gap-4 mb-8">
                {toDo.map(o => (
                  <div key={o.id} className="border border-border p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <div className="flex gap-2 mt-1">{o.order_items.map((i, j) => <span key={j} className="font-body text-xs text-foreground/60">{i.product_name}</span>)}</div>
                    </div>
                    <span className="font-body text-[10px] tracking-wider text-gold">{o.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-body text-xs tracking-[0.3em] text-gold mb-4">PEÇAS A SEREM ENVIADAS ({toShip.length})</h3>
            {toShip.length === 0 ? <p className="font-body text-sm text-muted-foreground">Nenhuma peça para enviar.</p> : (
              <div className="flex flex-col gap-4">
                {toShip.map(o => (
                  <div key={o.id} className="border border-border p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <div className="flex gap-2 mt-1">{o.order_items.map((i, j) => <span key={j} className="font-body text-xs text-foreground/60">{i.product_name}</span>)}</div>
                    </div>
                    <span className="font-body text-[10px] tracking-wider text-gold">ENVIADO</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* MEDIDAS CLIENTES */}
        {tab === 'medidas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            {clientMeasurements.length === 0 ? <p className="font-body text-sm text-muted-foreground">Nenhuma medida registrada.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    <th className={`text-left ${labelClass} py-3`}>CLIENTE</th>
                    <th className={`text-left ${labelClass} py-3`}>PERFIL</th>
                    <th className={`text-left ${labelClass} py-3`}>BUSTO</th>
                    <th className={`text-left ${labelClass} py-3`}>CINTURA</th>
                    <th className={`text-left ${labelClass} py-3`}>QUADRIL</th>
                    <th className={`text-left ${labelClass} py-3`}>PESCOÇO</th>
                    <th className={`text-left ${labelClass} py-3`}>OMBRO</th>
                    <th className={`text-left ${labelClass} py-3`}>MANGA</th>
                    <th className={`text-left ${labelClass} py-3`}>ALTURA</th>
                  </tr></thead>
                  <tbody>
                    {clientMeasurements.map(m => (
                      <tr key={m.id} className="border-b border-border/50">
                        <td className="py-3 font-body text-[10px] text-foreground/60">{m.user_id.slice(0, 8)}</td>
                        <td className="py-3 font-body text-sm text-gold">{m.label}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.busto || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.cintura || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.quadril || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.pescoco || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.ombro || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.manga || '—'}</td>
                        <td className="py-3 font-body text-sm text-foreground/60">{m.altura || '—'}</td>
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
