// Base de datos compartida (Supabase). Si se deja vacio, la web funciona en modo local:
// los datos solo se guardan en el navegador de cada persona.
// La clave "anon" es publica por diseno; la seguridad la dan las politicas de supabase/schema.sql.
window.APP_CONFIG = {
  SUPABASE_URL: 'https://iorxoeozolvwnwfxggbp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_9C8HAgNcGOG5zSqDxCy62Q__t9EVfWm', // clave publicable (pensada para ir en el navegador)
};
