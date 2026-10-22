// Lugares reales de la Comunitat Valenciana. Las actividades y horarios son EJEMPLOS ilustrativos
// para la demo del proyecto; en una version real vendrian de los ayuntamientos y de la comunidad.

const PLACE_TYPES = {
  centro_civico: 'Centro cívico y cultural',
  biblioteca: 'Biblioteca',
  polideportivo: 'Polideportivo',
  plaza: 'Plaza',
  parque: 'Parque',
  aire_libre: 'Espacio al aire libre',
};

const CATEGORIES = {
  deporte: { label: 'Deporte', color: '#ff5a36' },
  cultura: { label: 'Cultura', color: '#7b5cff' },
  naturaleza: { label: 'Naturaleza', color: '#1fa769' },
  musica: { label: 'Música', color: '#ff4fa3' },
  juegos: { label: 'Juegos', color: '#ffb800' },
  social: { label: 'Encuentro social', color: '#17a2c9' },
};

const PLACES = [
  {
    id: 'turia', name: 'Jardín del Turia', type: 'parque', city: 'València',
    lat: 39.4770, lng: -0.3630, address: 'Antiguo cauce del río Turia',
    activities: [
      { title: 'Running y calistenia al aire libre', cat: 'deporte', cost: 0, minutes: 60, who: ['solo', 'amigos'], schedule: 'Todos los días · 24 h', desc: 'Circuito de 9 km con zonas de barras y estiramientos.' },
      { title: 'Picnic y juegos de mesa', cat: 'juegos', cost: 0, minutes: 120, who: ['amigos', 'familia'], schedule: 'Sáb y dom · 11:00–20:00', desc: 'Trae tu juego y comparte manta con quien pase.' },
      { title: 'Ruta en bici por el cauce', cat: 'deporte', cost: 0, minutes: 90, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días', desc: 'Carril bici seguro hasta la Ciudad de las Artes y las Ciencias.' },
    ],
  },
  {
    id: 'cabecera', name: 'Parque de Cabecera', type: 'parque', city: 'València',
    lat: 39.4745, lng: -0.4025, address: 'Av. de Pío Baroja',
    activities: [
      { title: 'Paseo por el lago y la fauna', cat: 'naturaleza', cost: 0, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días · 8:00–22:00', desc: 'Patos, tortugas y mucha sombra.' },
      { title: 'Barca de pedales', cat: 'naturaleza', cost: 4, minutes: 30, who: ['amigos', 'familia'], schedule: 'Fines de semana · 11:00–19:00', desc: 'Alquiler por turnos de media hora.' },
    ],
  },
  {
    id: 'malvarrosa', name: 'Playa de la Malvarrosa', type: 'aire_libre', city: 'València',
    lat: 39.4770, lng: -0.3225, address: 'Paseo Marítimo',
    activities: [
      { title: 'Vóley playa libre', cat: 'deporte', cost: 0, minutes: 90, who: ['amigos'], schedule: 'Todos los días · tardes', desc: 'Redes instaladas, apúntate a un equipo.' },
      { title: 'Yoga al amanecer', cat: 'deporte', cost: 0, minutes: 60, who: ['solo', 'amigos'], schedule: 'Sáb · 9:00', desc: 'Sesión abierta organizada por colectivos del barrio.' },
      { title: 'Atardecer con guitarras', cat: 'musica', cost: 0, minutes: 120, who: ['solo', 'amigos'], schedule: 'Vie · 20:00', desc: 'Jam improvisada: trae instrumento o solo las ganas.' },
    ],
  },
  {
    id: 'bibval', name: 'Biblioteca Valenciana Nicolau Primitiu', type: 'biblioteca', city: 'València',
    lat: 39.4802, lng: -0.3815, address: 'C/ Hospital, 13',
    activities: [
      { title: 'Sala de estudio y lectura', cat: 'cultura', cost: 0, minutes: 180, who: ['solo', 'amigos'], schedule: 'L–V · 9:00–21:00', desc: 'Wifi, enchufes y silencio de verdad.' },
      { title: 'Club de lectura joven', cat: 'social', cost: 0, minutes: 90, who: ['solo', 'amigos'], schedule: 'Jue · 18:00', desc: 'Un libro al mes y charla sin deberes.' },
    ],
  },
  {
    id: 'ayuntamiento-vlc', name: 'Plaza del Ayuntamiento', type: 'plaza', city: 'València',
    lat: 39.4699, lng: -0.3763, address: 'Plaça de l’Ajuntament',
    activities: [
      { title: 'Música callejera y mercadillo', cat: 'musica', cost: 0, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'Sáb · 17:00–21:00', desc: 'Artistas locales y puestos de segunda mano.' },
      { title: 'Quedada de patinaje', cat: 'deporte', cost: 0, minutes: 90, who: ['amigos'], schedule: 'Dom · 11:00', desc: 'Grupo abierto, todos los niveles.' },
    ],
  },
  {
    id: 'petxina', name: 'Polideportivo La Petxina', type: 'polideportivo', city: 'València',
    lat: 39.4815, lng: -0.3945, address: 'Paseo de la Petxina, 42',
    activities: [
      { title: 'Baloncesto 3x3 libre', cat: 'deporte', cost: 2, minutes: 90, who: ['amigos'], schedule: 'L–V · 17:00–21:00', desc: 'Pistas abiertas con tarifa joven.' },
      { title: 'Piscina con carnet joven', cat: 'deporte', cost: 3.5, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'L–D · 8:00–21:30', desc: 'Entrada reducida para menores de 30.' },
    ],
  },
  {
    id: 'carme', name: 'Centre del Carme Cultura Contemporània', type: 'centro_civico', city: 'València',
    lat: 39.4793, lng: -0.3818, address: 'C/ Museu, 2',
    activities: [
      { title: 'Exposiciones de arte contemporáneo', cat: 'cultura', cost: 0, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'Mar–Dom · 10:00–20:00', desc: 'Acceso libre y talleres de mediación para jóvenes.' },
    ],
  },
  {
    id: 'nau', name: 'La Nau · Universitat de València', type: 'centro_civico', city: 'València',
    lat: 39.4745, lng: -0.3775, address: 'C/ Universitat, 2',
    activities: [
      { title: 'Ciclo de cine y debate', cat: 'cultura', cost: 0, minutes: 120, who: ['solo', 'amigos'], schedule: 'Mié · 19:00', desc: 'Pase de película seguido de coloquio abierto.' },
      { title: 'Conciertos en el claustro', cat: 'musica', cost: 0, minutes: 90, who: ['solo', 'amigos'], schedule: 'Jue · 20:00 (mensual)', desc: 'Música de cámara y grupos universitarios.' },
    ],
  },
  {
    id: 'albufera', name: 'Parque Natural de l’Albufera · El Palmar', type: 'aire_libre', city: 'València',
    lat: 39.3240, lng: -0.3390, address: 'El Palmar',
    activities: [
      { title: 'Observación de aves', cat: 'naturaleza', cost: 0, minutes: 120, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días · amanecer y atardecer', desc: 'Observatorios gratuitos junto al lago.' },
      { title: 'Paseo en barca por el lago', cat: 'naturaleza', cost: 6, minutes: 45, who: ['amigos', 'familia'], schedule: 'Todos los días · hasta el ocaso', desc: 'El atardecer más famoso de València.' },
    ],
  },
  {
    id: 'postiguet', name: 'Playa del Postiguet', type: 'aire_libre', city: 'Alicante',
    lat: 38.3452, lng: -0.4755, address: 'Av. de Villajoyosa',
    activities: [
      { title: 'Vóley playa y palas', cat: 'deporte', cost: 0, minutes: 90, who: ['amigos'], schedule: 'Todos los días', desc: 'Zona de redes junto al castillo.' },
      { title: 'Cine de verano en la arena', cat: 'cultura', cost: 0, minutes: 120, who: ['amigos', 'familia'], schedule: 'Vie (verano) · 22:00', desc: 'Trae toalla y sudadera.' },
    ],
  },
  {
    id: 'explanada', name: 'Explanada de España', type: 'plaza', city: 'Alicante',
    lat: 38.3412, lng: -0.4810, address: 'Paseo Explanada de España',
    activities: [
      { title: 'Música en directo y artesanía', cat: 'musica', cost: 0, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'Sáb y dom · 18:00–22:00', desc: 'Pequeños escenarios y puestos de artesanos.' },
    ],
  },
  {
    id: 'santabarbara', name: 'Parque de la Ereta · Castillo de Santa Bárbara', type: 'parque', city: 'Alicante',
    lat: 38.3485, lng: -0.4800, address: 'Camino del Castillo',
    activities: [
      { title: 'Senderismo suave con vistas', cat: 'naturaleza', cost: 0, minutes: 90, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días', desc: 'Subida a pie por el parque; atardecer sobre la bahía.' },
      { title: 'Fotografía y quedada de dibujo', cat: 'cultura', cost: 0, minutes: 120, who: ['solo', 'amigos'], schedule: 'Dom · 17:00', desc: 'Grupo informal de dibujo urbano.' },
    ],
  },
  {
    id: 'ribalta', name: 'Parc Ribalta', type: 'parque', city: 'Castelló de la Plana',
    lat: 39.9880, lng: -0.0415, address: 'Av. de Casalduch',
    activities: [
      { title: 'Ajedrez y petanca al aire libre', cat: 'juegos', cost: 0, minutes: 90, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días · tardes', desc: 'Mesas fijas, solo hace falta compañía.' },
      { title: 'Entrenamiento funcional en grupo', cat: 'deporte', cost: 0, minutes: 60, who: ['solo', 'amigos'], schedule: 'Mar y jue · 19:00', desc: 'Sesión guiada por voluntarios del barrio.' },
    ],
  },
  {
    id: 'pinar', name: 'Playa del Pinar', type: 'aire_libre', city: 'Castelló de la Plana',
    lat: 39.9780, lng: 0.0230, address: 'Grau de Castelló',
    activities: [
      { title: 'Kayak y paddle surf', cat: 'deporte', cost: 8, minutes: 90, who: ['amigos'], schedule: 'Sáb y dom · 10:00–19:00', desc: 'Alquiler con tarifa joven.' },
      { title: 'Hoguera y guitarras en San Juan', cat: 'musica', cost: 0, minutes: 180, who: ['amigos'], schedule: '23 de junio · noche', desc: 'Encuentro popular junto al mar.' },
    ],
  },
  {
    id: 'palmas', name: 'Desierto de las Palmas', type: 'aire_libre', city: 'Benicàssim',
    lat: 40.0690, lng: 0.0220, address: 'Parque Natural',
    activities: [
      { title: 'Ruta de senderismo señalizada', cat: 'naturaleza', cost: 0, minutes: 180, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días · amanecer', desc: 'Varias rutas circulares de nivel fácil y medio.' },
    ],
  },
  {
    id: 'palmeral', name: 'Palmeral de Elche', type: 'parque', city: 'Elx',
    lat: 38.2600, lng: -0.7070, address: 'Paseo del Palmeral',
    activities: [
      { title: 'Paseo por el Palmeral (Patrimonio Mundial)', cat: 'naturaleza', cost: 0, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días', desc: 'Más de 200.000 palmeras en plena ciudad.' },
      { title: 'Tarde de fotografía', cat: 'cultura', cost: 0, minutes: 90, who: ['solo', 'amigos'], schedule: 'Sáb · 18:00', desc: 'Quedada para aprender y compartir técnica.' },
    ],
  },
  {
    id: 'parque-elx', name: 'Parque Municipal de Elche', type: 'parque', city: 'Elx',
    lat: 38.2660, lng: -0.6985, address: 'Pg. de l’Estació',
    activities: [
      { title: 'Pista de skate y patinaje', cat: 'deporte', cost: 0, minutes: 90, who: ['solo', 'amigos'], schedule: 'Todos los días · tardes', desc: 'Pista libre con zona de iniciación.' },
      { title: 'Cine al fresco', cat: 'cultura', cost: 0, minutes: 120, who: ['amigos', 'familia'], schedule: 'Vie (verano) · 22:00', desc: 'Pantalla gigante bajo las palmeras.' },
    ],
  },
  {
    id: 'gandia', name: 'Playa de Gandia', type: 'aire_libre', city: 'Gandia',
    lat: 38.9930, lng: -0.1480, address: 'Paseo Marítimo Neptuno',
    activities: [
      { title: 'Vóley, fútbol playa y slackline', cat: 'deporte', cost: 0, minutes: 120, who: ['amigos'], schedule: 'Todos los días', desc: 'Zonas habilitadas con porterías y redes.' },
      { title: 'Concierto de grupos locales', cat: 'musica', cost: 0, minutes: 120, who: ['amigos', 'familia'], schedule: 'Sáb (verano) · 21:00', desc: 'Programación abierta a bandas jóvenes.' },
    ],
  },
  {
    id: 'xativa', name: 'Castell de Xàtiva', type: 'aire_libre', city: 'Xàtiva',
    lat: 38.9910, lng: -0.5170, address: 'Camí del Castell',
    activities: [
      { title: 'Ascensión al castillo y mirador', cat: 'naturaleza', cost: 2.5, minutes: 120, who: ['solo', 'amigos', 'familia'], schedule: 'Mar–Dom · 10:00–18:00', desc: 'Entrada reducida para jóvenes.' },
    ],
  },
  {
    id: 'sagunto', name: 'Teatro Romano de Sagunto', type: 'aire_libre', city: 'Sagunt',
    lat: 39.6790, lng: -0.2780, address: 'C/ Castillo, s/n',
    activities: [
      { title: 'Visita y noches de teatro clásico', cat: 'cultura', cost: 2, minutes: 90, who: ['solo', 'amigos', 'familia'], schedule: 'Mar–Dom · 10:00–18:00', desc: 'Visita al teatro y la acrópolis.' },
    ],
  },
  {
    id: 'alcoi', name: 'Plaça d’Espanya', type: 'plaza', city: 'Alcoi',
    lat: 38.7050, lng: -0.4740, address: 'Plaça d’Espanya',
    activities: [
      { title: 'Quedada de baile urbano', cat: 'social', cost: 0, minutes: 90, who: ['solo', 'amigos'], schedule: 'Dom · 18:00', desc: 'Todos los niveles, sin inscripción.' },
      { title: 'Intercambio de cómics y cartas', cat: 'juegos', cost: 0, minutes: 120, who: ['solo', 'amigos'], schedule: 'Sáb · 17:00', desc: 'Mesa abierta para coleccionistas y curiosos.' },
    ],
  },
  {
    id: 'aiguera', name: 'Parque de l’Aigüera', type: 'parque', city: 'Benidorm',
    lat: 38.5390, lng: -0.1300, address: 'Av. de Beniardà',
    activities: [
      { title: 'Ajedrez y juegos de mesa', cat: 'juegos', cost: 0, minutes: 90, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días · tardes', desc: 'Zona de mesas bajo el anfiteatro.' },
      { title: 'Calistenia y yoga', cat: 'deporte', cost: 0, minutes: 60, who: ['solo', 'amigos'], schedule: 'Lun y mié · 19:30', desc: 'Clases abiertas del programa municipal.' },
    ],
  },
  {
    id: 'torrevieja', name: 'Parque de las Naciones', type: 'parque', city: 'Torrevieja',
    lat: 37.9790, lng: -0.6830, address: 'C/ Ramón Gallud',
    activities: [
      { title: 'Mercadillo y música en directo', cat: 'musica', cost: 0, minutes: 90, who: ['amigos', 'familia'], schedule: 'Sáb · 19:00', desc: 'Pequeños conciertos de grupos de la zona.' },
      { title: 'Paseo en patinete o bici', cat: 'deporte', cost: 0, minutes: 60, who: ['solo', 'amigos', 'familia'], schedule: 'Todos los días', desc: 'Circuito llano y sombreado.' },
    ],
  },
];

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Propuestas iniciales del muro comunitario (el usuario añade las suyas).
const SEED_PROPOSALS = [
  { id: 's1', day: 'Lunes', title: 'Running suave para principiantes', time: '19:30', place: 'Jardín del Turia', author: 'Marta', desc: 'Ritmo de charla, 5 km y estiramientos al final.', votes: 14 },
  { id: 's2', day: 'Martes', title: 'Torneo de Catán y Carcassonne', time: '18:00', place: 'Parque de l’Aigüera', author: 'Dani', desc: 'Traigo dos juegos, traed los vuestros.', votes: 9 },
  { id: 's3', day: 'Miércoles', title: 'Cine y debate', time: '19:00', place: 'La Nau · Universitat de València', author: 'Colectivo Cineclub', desc: 'Votamos la peli entre las propuestas de la semana.', votes: 31 },
  { id: 's4', day: 'Jueves', title: 'Open mic: poesía y canciones', time: '20:00', place: 'Biblioteca Valenciana Nicolau Primitiu', author: 'Lucía', desc: 'Cinco minutos por persona, micro abierto.', votes: 18 },
  { id: 's5', day: 'Viernes', title: 'Fútbol 7 mixto', time: '19:00', place: 'Polideportivo La Petxina', author: 'Hugo', desc: 'Equipos al azar, juego limpio, 2 € para la pista.', votes: 26 },
  { id: 's6', day: 'Sábado', title: 'Limpieza de playa + vóley', time: '10:00', place: 'Playa de la Malvarrosa', author: 'Voluntariado Joven', desc: 'Una hora de recogida y partidos después.', votes: 22 },
  { id: 's7', day: 'Domingo', title: 'Baile urbano en la plaza', time: '18:00', place: 'Plaça d’Espanya', author: 'Nuria', desc: 'Salsa, kizomba y hip hop; cualquier nivel.', votes: 20 },
];
