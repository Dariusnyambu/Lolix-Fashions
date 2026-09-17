import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing. Copy .env.example to .env and add your project credentials.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Some browsers reuse cached cross-origin responses (headers included) for
    // identical URLs regardless of which origin issued the request, since
    // Supabase's REST API doesn't send a `Vary: Origin` header. That can replay
    // a stale Access-Control-Allow-Origin value from an earlier dev session
    // (e.g. `vite preview` on :4173) and cause spurious CORS failures on :5173.
    // Forcing `cache: 'no-store'` means every request always hits the network.
    fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  },
});
