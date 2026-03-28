
-- Add CPF to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;

-- Create addresses table
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text DEFAULT 'Principal',
  street text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text NOT NULL DEFAULT 'Brasil',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create measurements table
CREATE TABLE public.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Padrão',
  busto text,
  cintura text,
  quadril text,
  pescoco text,
  ombro text,
  manga text,
  altura text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own measurements" ON public.measurements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all measurements" ON public.measurements FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cargo text NOT NULL,
  cpf text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage employees" ON public.employees FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount integer NOT NULL,
  category text NOT NULL DEFAULT 'Geral',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add CNPJ, email, telefone to suppliers
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS telefone text;
