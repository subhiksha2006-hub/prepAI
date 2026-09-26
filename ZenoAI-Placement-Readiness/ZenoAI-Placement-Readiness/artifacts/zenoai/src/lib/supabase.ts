export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://endbzityjlqpfqkmcvxe.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function fetchPrepAIRest<T = any>(endpoint = 'prepAI'): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return [];
  }
}
