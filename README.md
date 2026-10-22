# Punt de Trobada

Mapa de ocio joven (gratuito o asequible) de la Comunitat Valenciana y muro comunitario para proponer planes semanales. Proyecto universitario.

- Web estática (HTML + CSS + JS, Leaflet). Sin build.
- Datos compartidos en Supabase: ejecutar `supabase/schema.sql` y rellenar `js/config.js`. Sin configurar, funciona en modo local.
- En local, sirve la carpeta con `npx serve` (las teselas de OpenStreetMap no cargan abriendo `index.html` desde disco).
- Los lugares son reales; las actividades, horarios y precios son ejemplos ilustrativos.
