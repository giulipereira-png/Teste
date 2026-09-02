// Configuração de login com liberação direta para o e-mail da ADM
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = {
  auth: {
    async getSession() {
      const savedAdmin = localStorage.getItem('acedep_admin_logged');
      if (savedAdmin) {
        return { data: { session: { user: { email: savedAdmin } } } };
      }
      return { data: { session: null } };
    },
    async signInWithPassword({ email, password }: any) {
      const cleanEmail = email.trim().toLowerCase();
      
      // LIBERAÇÃO DIRETA: Se for o seu e-mail, entra na hora independentemente do banco
      if (cleanEmail === 'giuli.pereira@gmail.com') {
        localStorage.setItem('acedep_admin_logged', cleanEmail);
        return { data: { session: { user: { email: cleanEmail } } }, error: null };
      }

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${cleanEmail}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('acedep_admin_logged', cleanEmail);
          return { data: { session: { user: { email: cleanEmail } } }, error: null };
        }
        
        return { data: { session: null }, error: { message: 'E-mail não autorizado como administrador.' } };
      } catch (err) {
        return { data: { session: null }, error: { message: 'Erro de conexão com o banco de dados.' } };
      }
    },
    async signOut() {
      localStorage.removeItem('acedep_admin_logged');
      return { error: null };
    }
  }
};

export async function insertAthlete(data: {
  full_name: string;
  guardian_name: string;
  disability_type: string;
  swating_experience: string;
  phone: string;
  email: string;
  status: string;
}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('As chaves do Supabase não foram encontradas.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/athletes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro ao salvar no banco de dados.');
  }

  return true;
}
