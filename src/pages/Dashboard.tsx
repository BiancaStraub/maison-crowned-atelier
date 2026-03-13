import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { signOut } from '@/lib/auth';
import { formatPrice } from '@/data/products';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const ORDER_STATUSES = ['Em Medição', 'Corte e Costura', 'Controle de Qualidade', 'Enviado', 'Entregue'];

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_name: string | null;
  order_items: { product_name: string; price: number }[];
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(product_name, price)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Até logo!');
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground tracking-[0.2em] animate-pulse">CARREGANDO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground">MINHA CONTA</h1>
            <div className="mt-4 w-12 h-px bg-gold" />
          </div>
          <button onClick={handleSignOut} className="font-body text-[10px] tracking-[0.3em] text-muted-foreground gold-hover">
            SAIR
          </button>
        </div>

        <p className="mt-6 font-body text-xs tracking-[0.2em] text-muted-foreground">
          {user?.email}
        </p>

        <h2 className="mt-16 font-heading text-2xl tracking-[0.15em] text-foreground">MEUS PEDIDOS</h2>
        <div className="mt-2 w-8 h-px bg-border" />

        {orders.length === 0 ? (
          <p className="mt-8 font-body text-sm text-muted-foreground tracking-[0.15em]">
            Nenhum pedido encontrado.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-8">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-border p-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">
                      PEDIDO #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="font-body text-[10px] tracking-[0.2em] text-muted-foreground/60 mt-1">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="font-body text-sm tracking-[0.1em] text-gold">
                    {formatPrice(order.total)}
                  </span>
                </div>

                {/* Items */}
                <div className="mt-4 flex flex-col gap-1">
                  {order.order_items.map((item, j) => (
                    <p key={j} className="font-body text-xs text-foreground/70 tracking-wider">
                      {item.product_name} — {formatPrice(item.price)}
                    </p>
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
                            <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                              isCurrent ? 'bg-gold border-gold' : isActive ? 'bg-gold/50 border-gold/50' : 'bg-transparent border-border'
                            }`} />
                            {idx < ORDER_STATUSES.length - 1 && (
                              <div className={`flex-1 h-px ${isActive ? 'bg-gold/40' : 'bg-border'}`} />
                            )}
                          </div>
                          <span className={`font-body text-[8px] tracking-[0.15em] text-center leading-tight ${
                            isCurrent ? 'text-gold' : isActive ? 'text-foreground/40' : 'text-muted-foreground/30'
                          }`}>
                            {status.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="py-section" />
      <Footer />
    </div>
  );
};

export default Dashboard;
