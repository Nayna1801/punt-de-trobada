(function () {
  'use strict';

  const JOINED_KEY = 'punt-de-trobada:apuntado:v1';
  const CV_CENTER = [39.35, -0.45];
  const CV_ZOOM = 8;
  const MAX_FIT_ZOOM = 14;
  const POLL_MS = 6000;
  // Rectangulo aproximado de la Comunitat Valenciana para validar puntos nuevos.
  const CV_BOUNDS = { south: 37.8, north: 40.8, west: -1.55, east: 0.75 };

  const state = { time: Infinity, budget: Infinity, who: 'any', cats: new Set(), userPos: null, dayFilter: 'all' };
  let communityPlaces = [];
  let proposals = [];
  let joined = new Set();
  let pendingLatLng = null;
  let tempMarker = null;

  const $ = (sel, root = document) => root.querySelector(sel);

  function esc(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function readJoined() {
    try {
      return new Set(JSON.parse(localStorage.getItem(JOINED_KEY)) || []);
    } catch (_) {
      return new Set();
    }
  }

  function saveJoined() {
    try {
      localStorage.setItem(JOINED_KEY, JSON.stringify([...joined]));
    } catch (_) {
      // Sin almacenamiento: el "me apunto" solo dura la sesion.
    }
  }

  function formatDuration(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  function formatCost(cost) {
    return cost === 0 ? '<span class="tag free">Gratis</span>' : `<span class="tag">${String(cost).replace('.', ',')} €</span>`;
  }

  function distanceKm(a, b) {
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  }

  const allPlaces = () => [...PLACES, ...communityPlaces];

  /* ---------- Mapa y buscador ---------- */

  const map = L.map('map', { zoomControl: true, scrollWheelZoom: true }).setView(CV_CENTER, CV_ZOOM);
  // OSM exige cabecera Referer: funciona publicado o con un servidor local (npx serve), no abriendo index.html desde disco.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const markerLayer = L.layerGroup().addTo(map);
  const markersById = new Map();
  let userMarker = null;

  function activityMatches(a) {
    return (
      a.minutes <= state.time &&
      a.cost <= state.budget &&
      (state.who === 'any' || a.who.includes(state.who)) &&
      (state.cats.size === 0 || state.cats.has(a.cat))
    );
  }

  function computeResults() {
    const results = allPlaces()
      .map((place) => ({ place, acts: place.activities.filter(activityMatches) }))
      .filter((r) => r.acts.length > 0)
      .map((r) => ({ ...r, dist: state.userPos ? distanceKm(state.userPos, r.place) : null }));
    results.sort((a, b) => (state.userPos ? a.dist - b.dist : b.acts.length - a.acts.length || a.place.name.localeCompare(b.place.name, 'es')));
    return results;
  }

  function actsHtml(acts) {
    return `<ul class="act-list">${acts
      .map((a) => `
        <li style="--c:${CATEGORIES[a.cat].color}">
          <span class="dot" aria-hidden="true"></span>
          <span><b>${esc(a.title)}</b> ${formatCost(a.cost)}
            <span class="act-sub">${esc(CATEGORIES[a.cat].label)} · ${formatDuration(a.minutes)}${a.schedule ? ' · ' + esc(a.schedule) : ''}</span>
            ${a.desc ? `<span class="act-sub">${esc(a.desc)}</span>` : ''}
          </span>
        </li>`)
      .join('')}</ul>`;
  }

  function directionsUrl(place) {
    return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=transit`;
  }

  function placeMeta(r) {
    const base = `${PLACE_TYPES[r.place.type]} · ${r.place.city}`;
    return r.dist == null ? base : `${base} · a ${r.dist < 10 ? r.dist.toFixed(1).replace('.', ',') : Math.round(r.dist)} km`;
  }

  const communityTag = (place) => (place.community ? '<span class="tag community">Aportado por la comunidad</span>' : '');

  function popupHtml(r) {
    return `<div class="pop">
      <h3>${esc(r.place.name)}</h3>
      <p class="place-meta">${esc(placeMeta(r))}${r.place.address ? '<br>' + esc(r.place.address) : ''}</p>
      ${communityTag(r.place)}
      ${actsHtml(r.acts)}
      <a class="btn" href="${directionsUrl(r.place)}" target="_blank" rel="noopener">Cómo llegar</a>
    </div>`;
  }

  function pinIcon(r) {
    const color = CATEGORIES[r.acts[0].cat].color;
    return L.divIcon({
      className: 'pin',
      html: `<span style="--c:${color}"><b>${r.acts.length}</b></span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    });
  }

  function focusPlace(id) {
    const marker = markersById.get(id);
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: 0.8 });
    marker.openPopup();
    if (window.matchMedia('(max-width: 900px)').matches) $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function render({ fit = true } = {}) {
    const results = computeResults();
    markerLayer.clearLayers();
    markersById.clear();

    results.forEach((r) => {
      const marker = L.marker([r.place.lat, r.place.lng], { icon: pinIcon(r), title: r.place.name, keyboard: true })
        .bindPopup(popupHtml(r), { maxWidth: 320 })
        .addTo(markerLayer);
      markersById.set(r.place.id, marker);
    });

    const totalActs = results.reduce((n, r) => n + r.acts.length, 0);
    $('#count').textContent = results.length
      ? `${totalActs} ${totalActs === 1 ? 'plan' : 'planes'} en ${results.length} ${results.length === 1 ? 'lugar' : 'lugares'}`
      : 'Sin resultados';

    $('#results').innerHTML = results.length
      ? results.map((r) => `
          <li class="place-card" tabindex="0" data-id="${esc(r.place.id)}">
            <h3>${esc(r.place.name)}</h3>
            <p class="place-meta">${esc(placeMeta(r))}</p>
            ${communityTag(r.place)}
            ${actsHtml(r.acts)}
          </li>`).join('')
      : '<li class="empty">Ningún plan encaja con todo eso. Prueba a ampliar el tiempo o el presupuesto, o añade tú el punto que falta.</li>';

    if (fit && results.length && !state.userPos) {
      map.fitBounds(L.latLngBounds(results.map((r) => [r.place.lat, r.place.lng])), { padding: [40, 40], maxZoom: MAX_FIT_ZOOM });
    }
  }

  function buildChips() {
    $('#cat-chips').innerHTML = Object.entries(CATEGORIES)
      .map(([key, c]) => `<button type="button" data-cat="${key}" style="--c:${c.color}" aria-pressed="false">${esc(c.label)}</button>`)
      .join('');
  }

  function resetFilters() {
    Object.assign(state, { time: Infinity, budget: Infinity, who: 'any', userPos: null });
    state.cats.clear();
    document.querySelectorAll('#filters .seg').forEach((g) => g.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.value === 'any')));
    document.querySelectorAll('#cat-chips button').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
    if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
  }

  function bindFilters() {
    $('#filters').addEventListener('click', (e) => {
      const seg = e.target.closest('.seg button');
      if (seg) {
        const group = seg.parentElement;
        group.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === seg));
        const value = seg.dataset.value;
        const key = group.dataset.filter;
        state[key] = key === 'who' ? value : value === 'any' ? Infinity : Number(value);
        render();
        return;
      }
      const chip = e.target.closest('.chips button');
      if (chip) {
        const cat = chip.dataset.cat;
        state.cats.has(cat) ? state.cats.delete(cat) : state.cats.add(cat);
        chip.classList.toggle('on', state.cats.has(cat));
        chip.setAttribute('aria-pressed', String(state.cats.has(cat)));
        render();
      }
    });

    $('#btn-reset').addEventListener('click', () => {
      resetFilters();
      render();
    });

    $('#btn-near').addEventListener('click', onNearMe);

    $('#results').addEventListener('click', (e) => {
      const card = e.target.closest('.place-card');
      if (card) focusPlace(card.dataset.id);
    });
    $('#results').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.place-card');
      if (card) { e.preventDefault(); focusPlace(card.dataset.id); }
    });
  }

  function onNearMe() {
    const btn = $('#btn-near');
    if (!navigator.geolocation) {
      $('#count').textContent = 'Tu navegador no permite localizarte.';
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Localizando…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.circleMarker([state.userPos.lat, state.userPos.lng], {
          radius: 9, color: '#1b1b2f', weight: 3, fillColor: '#17a2c9', fillOpacity: 1,
        }).addTo(map).bindTooltip('Estás aquí');
        render({ fit: false });
        const nearest = computeResults()[0];
        const pts = [[state.userPos.lat, state.userPos.lng]];
        if (nearest) pts.push([nearest.place.lat, nearest.place.lng]);
        map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: MAX_FIT_ZOOM });
        btn.disabled = false;
        btn.textContent = 'Cerca de mí';
      },
      () => {
        $('#count').textContent = 'No pudimos acceder a tu ubicación. Revisa los permisos del navegador.';
        btn.disabled = false;
        btn.textContent = 'Cerca de mí';
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  /* ---------- Crear puntos en el mapa ---------- */

  const dialog = $('#add-dialog');
  const addForm = $('#add-form');

  function isInsideCV({ lat, lng }) {
    return lat >= CV_BOUNDS.south && lat <= CV_BOUNDS.north && lng >= CV_BOUNDS.west && lng <= CV_BOUNDS.east;
  }

  function setPicking(active) {
    document.body.classList.toggle('picking', active);
    $('#pick-banner').hidden = !active;
    map.off('click', onMapPick);
    if (active) {
      map.closePopup();
      map.on('click', onMapPick);
      $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearTempMarker() {
    if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
  }

  function onMapPick(e) {
    const point = { lat: e.latlng.lat, lng: e.latlng.lng };
    setPicking(false);
    if (!isInsideCV(point)) {
      $('#count').textContent = 'Ese punto queda fuera de la Comunitat Valenciana. Prueba de nuevo dentro del territorio.';
      return;
    }
    pendingLatLng = point;
    clearTempMarker();
    tempMarker = L.circleMarker([point.lat, point.lng], {
      radius: 11, color: '#1b1b2f', weight: 3, fillColor: '#ffc93c', fillOpacity: 1,
    }).addTo(map);
    $('#add-coords').textContent = `Ubicación elegida: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
    $('#add-error').hidden = true;
    dialog.showModal();
  }

  function buildAddForm() {
    addForm.elements.type.innerHTML = Object.entries(PLACE_TYPES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
    addForm.elements['act-cat'].innerHTML = Object.entries(CATEGORIES).map(([k, c]) => `<option value="${k}">${esc(c.label)}</option>`).join('');
  }

  function showAddError(message) {
    const el = $('#add-error');
    el.textContent = message;
    el.hidden = false;
  }

  async function onAddSubmit(e) {
    e.preventDefault();
    if (!pendingLatLng) return;
    const f = addForm.elements;
    const who = [...addForm.querySelectorAll('input[name="act-who"]:checked')].map((c) => c.value);
    if (who.length === 0) {
      showAddError('Elige al menos una opción en “¿Para quién?”.');
      return;
    }
    const place = {
      name: f.name.value.trim(),
      type: f.type.value,
      city: f.city.value.trim(),
      address: f.address.value.trim(),
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      activities: [{
        title: f['act-title'].value.trim(),
        cat: f['act-cat'].value,
        cost: Math.max(0, Number(f['act-cost'].value) || 0),
        minutes: Number(f['act-minutes'].value),
        who,
        schedule: f['act-schedule'].value.trim(),
        desc: f['act-desc'].value.trim(),
      }],
    };
    const submit = addForm.querySelector('button[type=submit]');
    submit.disabled = true;
    try {
      const saved = await Store.addPlace(place);
      communityPlaces = [...communityPlaces, saved];
      dialog.close();
      addForm.reset();
      resetFilters();
      render({ fit: false });
      focusPlace(saved.id);
    } catch (err) {
      showAddError('No se pudo guardar el punto. Inténtalo de nuevo en unos segundos.');
      console.error(err);
    } finally {
      submit.disabled = false;
    }
  }

  function bindAddPoint() {
    buildAddForm();
    $('#btn-add').addEventListener('click', () => setPicking(true));
    $('#btn-pick-cancel').addEventListener('click', () => setPicking(false));
    $('#btn-add-cancel').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { clearTempMarker(); pendingLatLng = null; });
    addForm.addEventListener('submit', onAddSubmit);
  }

  /* ---------- Muro comunitario ---------- */

  function renderDayFilter() {
    const days = ['all', ...WEEK_DAYS];
    $('#day-filter').innerHTML = days
      .map((d) => `<button type="button" data-day="${esc(d)}" class="${state.dayFilter === d ? 'on' : ''}" aria-pressed="${state.dayFilter === d}">${d === 'all' ? 'Toda la semana' : esc(d)}</button>`)
      .join('');
  }

  function renderBoard() {
    const days = state.dayFilter === 'all' ? WEEK_DAYS : [state.dayFilter];
    $('#board').innerHTML = days.map((day) => {
      const items = proposals
        .filter((p) => p.day === day)
        .sort((a, b) => b.votes - a.votes || (a.time || '').localeCompare(b.time || ''));
      const body = items.length
        ? `<ul>${items.map((p) => `
            <li class="proposal">
              <h4>${esc(p.title)}</h4>
              <p class="meta">${p.time ? esc(p.time) + ' · ' : ''}${p.place ? esc(p.place) + ' · ' : ''}${esc(p.author || 'Anónimo')}</p>
              ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
              <button type="button" class="join" data-id="${esc(p.id)}" aria-pressed="${joined.has(p.id)}">
                ${joined.has(p.id) ? 'Apuntado/a' : 'Me apunto'} · ${p.votes}
              </button>
            </li>`).join('')}</ul>`
        : '<p class="day-empty">Aún no hay planes. ¡Propón el primero!</p>';
      return `<section class="day-col"><h3>${esc(day)}</h3>${body}</section>`;
    }).join('');
  }

  function setSyncStatus(ok) {
    $('#sync-status').textContent = !Store.isRemote
      ? 'Modo local: las propuestas solo se guardan en este navegador.'
      : ok
        ? 'Muro compartido: lo que publiques lo verán todos en pocos segundos.'
        : 'Sin conexión con la base de datos. Reintentando…';
  }

  function bindWall() {
    $('#proposal-form [name=day]').innerHTML = WEEK_DAYS.map((d) => `<option>${d}</option>`).join('');
    $('#place-list').innerHTML = PLACES.map((p) => `<option value="${esc(p.name)}"></option>`).join('');

    $('#proposal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const f = new FormData(form);
      const title = String(f.get('title') || '').trim();
      if (!title) return;
      const submit = form.querySelector('button[type=submit]');
      submit.disabled = true;
      try {
        const saved = await Store.addProposal({
          day: f.get('day'),
          title,
          time: f.get('time') || '',
          place: String(f.get('place') || '').trim(),
          author: String(f.get('author') || '').trim() || 'Anónimo',
          desc: String(f.get('desc') || '').trim(),
        });
        proposals = [...proposals, saved];
        joined = new Set([...joined, saved.id]);
        saveJoined();
        state.dayFilter = 'all';
        renderDayFilter();
        renderBoard();
        form.reset();
        $('#board').scrollIntoView({ behavior: 'smooth', block: 'start' });
        setSyncStatus(true);
      } catch (err) {
        setSyncStatus(false);
        console.error(err);
      } finally {
        submit.disabled = false;
      }
    });

    $('#board').addEventListener('click', async (e) => {
      const btn = e.target.closest('.join');
      if (!btn) return;
      const id = btn.dataset.id;
      const delta = joined.has(id) ? -1 : 1;
      joined = new Set(delta === -1 ? [...joined].filter((x) => x !== id) : [...joined, id]);
      proposals = proposals.map((p) => (p.id === id ? { ...p, votes: Math.max(0, p.votes + delta) } : p));
      saveJoined();
      renderBoard();
      try {
        await Store.vote(id, delta);
      } catch (err) {
        setSyncStatus(false);
        console.error(err);
      }
    });

    $('#day-filter').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      state.dayFilter = btn.dataset.day;
      renderDayFilter();
      renderBoard();
    });
  }

  /* ---------- Sincronizacion ---------- */

  async function refresh() {
    try {
      const [nextProposals, nextPlaces] = await Promise.all([Store.listProposals(), Store.listPlaces()]);
      if (JSON.stringify(nextProposals) !== JSON.stringify(proposals)) {
        proposals = nextProposals;
        renderBoard();
      }
      if (JSON.stringify(nextPlaces) !== JSON.stringify(communityPlaces)) {
        communityPlaces = nextPlaces;
        // Evita cerrar el popup que la persona esta leyendo si no hay puntos nuevos.
        render({ fit: false });
      }
      setSyncStatus(true);
    } catch (err) {
      setSyncStatus(false);
      console.error(err);
    }
  }

  /* ---------- Arranque ---------- */

  joined = readJoined();
  buildChips();
  bindFilters();
  bindAddPoint();
  bindWall();
  renderDayFilter();
  renderBoard();
  render({ fit: false });
  setSyncStatus(true);
  refresh();
  if (Store.isRemote) {
    setInterval(() => { if (!document.hidden && !dialog.open) refresh(); }, POLL_MS);
  }
})();
