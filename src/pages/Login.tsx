import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === 'cliente@maisoncrowned.com' && password === 'cliente123') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        toast.success('Bem-vindo à Maison Crowned');
        navigate('/dashboard');
      } else {
        toast.error('E-mail ou senha incorretos.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground text-center">ENTRAR</h1>
        <div className="mt-4 w-12 h-px bg-gold mx-auto" />

        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-6">
          <div>
            <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">E-MAIL</label>
            <input type="email" required className="measure-input w-full mt-1" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">SENHA</label>
            <input type="password" required className="measure-input w-full mt-1" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-10 py-3 transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <p className="mt-4 text-center font-body text-[9px] tracking-[0.15em] text-muted-foreground/50">
          Teste Cliente: cliente@maisoncrowned.com / cliente123
        </p>

        <p className="mt-6 text-center font-body text-[10px] tracking-[0.2em] text-muted-foreground">
          NÃO TEM CONTA?{' '}
          <Link to="/signup" className="text-gold gold-hover">CRIAR CONTA</Link>
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
};

export default Login;
