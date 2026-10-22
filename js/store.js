// Capa de datos: Supabase (REST) si hay configuracion, localStorage si no.
// Expone window.Store con la misma API en ambos modos.
(function () {
  'use strict';

  const cfg = window.APP_CONFIG || {};
  const remote = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const base = remote ? `${cfg.SUPABASE_URL.replace(/\/$/, '')}/rest/v1` : '';
  // Las claves publicables nuevas (sb_publishable_...) no son JWT y solo van en 'apikey'.
  const authHeaders = remote
    ? {
        apikey: cfg.SUPABASE_ANON_KEY,
        ...(cfg.SUPABASE_ANON_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${cfg.SUPABASE_ANON_KEY}` } : {}),
        'Content-Type': 'application/json',
      }
    : {};

  const LOCAL_PROPOSALS = 'punt-de-trobada:muro:v2';
  const LOCAL_PLACES = 'punt-de-trobada:puntos:v1';

  function readLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // Almacenamiento no disponible (modo privado, cuota): la sesion sigue en memoria.
    }
  }

  async function request(path, options = {}) {
    const res = await fetch(base + path, { ...options, headers: { ...authHeaders, ...options.headers } });
    if (!res.ok) throw new Error(`Base de datos: error ${res.status} ${await res.text()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  const proposalFromRow = (r) => ({
    id: r.id, day: r.day, title: r.title, time: r.time || '', place: r.place || '',
    author: r.author || 'Anónimo', desc: r.descr || '', votes: r.votes,
  });

  const placeFromRow = (r) => ({
    id: r.id, name: r.name, type: r.type, city: r.city || '', address: r.address || '',
    lat: r.lat, lng: r.lng, activities: r.activities || [], community: true,
  });

  window.Store = {
    isRemote: remote,

    async listProposals() {
      if (!remote) return readLocal(LOCAL_PROPOSALS, null) || SEED_PROPOSALS.map((p) => ({ ...p }));
      const rows = await request('/proposals?select=*&order=created_at.asc');
      return rows.map(proposalFromRow);
    },

    async addProposal(p) {
      if (!remote) {
        const saved = { ...p, id: `u${Date.now()}`, votes: 1 };
        writeLocal(LOCAL_PROPOSALS, [...(await this.listProposals()), saved]);
        return saved;
      }
      const rows = await request('/proposals', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ day: p.day, title: p.title, time: p.time, place: p.place, author: p.author, descr: p.desc, votes: 1 }),
      });
      return proposalFromRow(rows[0]);
    },

    async vote(id, delta) {
      if (!remote) {
        const next = (await this.listProposals()).map((p) => (p.id === id ? { ...p, votes: Math.max(0, p.votes + delta) } : p));
        writeLocal(LOCAL_PROPOSALS, next);
        return;
      }
      await request('/rpc/vote_proposal', { method: 'POST', body: JSON.stringify({ p_id: id, p_delta: delta }) });
    },

    async listPlaces() {
      if (!remote) return readLocal(LOCAL_PLACES, []);
      const rows = await request('/places?select=*&order=created_at.asc');
      return rows.map(placeFromRow);
    },

    async addPlace(place) {
      if (!remote) {
        const saved = { ...place, id: `u${Date.now()}`, community: true };
        writeLocal(LOCAL_PLACES, [...(await this.listPlaces()), saved]);
        return saved;
      }
      const rows = await request('/places', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          name: place.name, type: place.type, city: place.city, address: place.address,
          lat: place.lat, lng: place.lng, activities: place.activities,
        }),
      });
      return placeFromRow(rows[0]);
    },
  };
})();
