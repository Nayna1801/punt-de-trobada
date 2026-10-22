-- Ejecutar una sola vez en Supabase: SQL Editor > New query > pegar > Run.
-- Demo universitaria: cualquiera puede leer y crear; nadie puede borrar ni editar (salvo votar).

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  title text not null,
  time text not null default '',
  place text not null default '',
  author text not null default 'Anónimo',
  descr text not null default '',
  votes int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  city text not null default '',
  address text not null default '',
  lat double precision not null,
  lng double precision not null,
  activities jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table proposals enable row level security;
alter table places enable row level security;

drop policy if exists "leer propuestas" on proposals;
drop policy if exists "crear propuestas" on proposals;
drop policy if exists "leer puntos" on places;
drop policy if exists "crear puntos" on places;

create policy "leer propuestas" on proposals for select using (true);
create policy "crear propuestas" on proposals for insert with check (true);
create policy "leer puntos" on places for select using (true);
create policy "crear puntos" on places for insert with check (true);

-- Votar de forma atomica sin dar permiso de UPDATE general.
create or replace function vote_proposal(p_id uuid, p_delta int)
returns void
language sql
security definer
set search_path = public
as $$
  update proposals set votes = greatest(0, votes + sign(p_delta)::int) where id = p_id;
$$;

grant execute on function vote_proposal(uuid, int) to anon;

-- Propuestas de ejemplo para que el muro no arranque vacio.
insert into proposals (day, title, time, place, author, descr, votes) values
  ('Lunes', 'Running suave para principiantes', '19:30', 'Jardín del Turia', 'Marta', 'Ritmo de charla, 5 km y estiramientos al final.', 14),
  ('Martes', 'Torneo de Catán y Carcassonne', '18:00', 'Parque de l’Aigüera', 'Dani', 'Traigo dos juegos, traed los vuestros.', 9),
  ('Miércoles', 'Cine y debate', '19:00', 'La Nau · Universitat de València', 'Colectivo Cineclub', 'Votamos la peli entre las propuestas de la semana.', 31),
  ('Jueves', 'Open mic: poesía y canciones', '20:00', 'Biblioteca Valenciana Nicolau Primitiu', 'Lucía', 'Cinco minutos por persona, micro abierto.', 18),
  ('Viernes', 'Fútbol 7 mixto', '19:00', 'Polideportivo La Petxina', 'Hugo', 'Equipos al azar, juego limpio, 2 € para la pista.', 26),
  ('Sábado', 'Limpieza de playa + vóley', '10:00', 'Playa de la Malvarrosa', 'Voluntariado Joven', 'Una hora de recogida y partidos después.', 22),
  ('Domingo', 'Baile urbano en la plaza', '18:00', 'Plaça d’Espanya', 'Nuria', 'Salsa, kizomba y hip hop; cualquier nivel.', 20);
