import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Carga config desde el servidor
const res = await fetch('/api/config');
const { supabaseUrl, supabaseAnonKey } = await res.json();
window._supabase = createClient(supabaseUrl, supabaseAnonKey);

// Protección de rutas
window.requireAuth = async () => {
  const { data: { session } } = await window._supabase.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return null; }
  return session;
};

// Logout
window.logout = async () => {
  await window._supabase.auth.signOut();
  window.location.href = 'index.html';
};

// Genera código anónimo PAC-XXXX
window.generarCodigoAnonimo = () =>
  'PAC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
