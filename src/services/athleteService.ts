import { supabase } from '../lib/supabase';

// Função para buscar todos os atletas salvos na nuvem
export async function fetchAthletesFromSupabase() {
  const env = (import.meta as any).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/athletes?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Erro ao buscar atletas do Supabase:', err);
    return [];
  }
}

// Função para salvar um novo atleta com senha/código de acesso na nuvem
export async function saveAthleteToSupabase(athleteData: {
  name: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  accessCode: string;
  birthDate: string;
}) {
  const env = (import.meta as any).env || {};
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) return false;

  const payload = {
    full_name: athleteData.name,
    guardian_name: `${athleteData.guardianName} [Senha Portal: ${athleteData.accessCode}]`,
    disability_type: `Idade: ${athleteDateToAge(athleteData.birthDate)}`,
    swating_experience: 'Atleta cadastrado via Painel ADM',
    phone: athleteData.guardianPhone,
    email: athleteData.guardianEmail || 'contato@acedep.org.br',
    status: 'Ativo'
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/athletes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erro ao salvar atleta na nuvem.');
  }

  return true;
}

function athleteDateToAge(dateStr: string) {
  if (!dateStr) return 'N/I';
  const birth = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  return age.toString();
}
