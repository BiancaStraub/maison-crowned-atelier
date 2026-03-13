import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '@/lib/auth';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error('Erro ao criar conta', { description: error.message });
    } else {
      toast.success('Conta criada com sucesso!', { description: 'Verifique seu e-mail para confirmar.' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <h1 className="font-heading text-4xl tracking-[0.2em] text-foreground text-center">CRIAR CONTA</h1>
        <div className="mt-4 w-12 h-px bg-gold mx-auto" />

        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-6">
          <div>
            <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">NOME COMPLETO</label>
            <input
              type="text"
              required
              className="measure-input w-full mt-1"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">E-MAIL</label>
            <input
              type="email"
              required
              className="measure-input w-full mt-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">SENHA</label>
            <input
              type="password"
              required
              minLength={6}
              className="measure-input w-full mt-1"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 font-body text-xs tracking-[0.3em] text-primary-foreground bg-gold px-10 py-3 transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
          </button>
        </form>

        <p className="mt-8 text-center font-body text-[10px] tracking-[0.2em] text-muted-foreground">
          JÁ TEM CONTA?{' '}
          <Link to="/login" className="text-gold gold-hover">ENTRAR</Link>
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

export default SignUp;
