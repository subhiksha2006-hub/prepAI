export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://endbzityjlqpfqkmcvxe.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

/**
 * Lightweight REST helper to query Supabase REST API directly
 * Endpoint: /rest/v1/prepAI
 */
export async function querySupabaseTable<T = any>(tableName: string, options: { method?: string; body?: any; query?: string } = {}): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}${options.query ? `?${options.query}` : ''}`;
  
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[Supabase REST] ${options.method || 'GET'} ${tableName} returned ${res.status}: ${errorText}`);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Supabase REST] Network error connecting to ${SUPABASE_URL}:`, err);
    return [];
  }
}
