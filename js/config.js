// Base de datos compartida (Supabase). Si se deja vacio, la web funciona en modo local:
// los datos solo se guardan en el navegador de cada persona.
// La clave "anon" es publica por diseno; la seguridad la dan las politicas de supabase/schema.sql.
window.APP_CONFIG = {
  SUPABASE_URL: 'https://iorxoeozolvwnwfxggbp.supabase.co',
  SUPABASE_ANON_KEY: '', // Project Settings > API Keys > "Publishable key" (sb_publishable_...) o "anon" en Legacy
};
