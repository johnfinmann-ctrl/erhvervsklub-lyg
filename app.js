/* ================================================================
   LYNGBYGAARD ERHVERVSKLUB — app.js v8.9
   Al konfiguration samlet øverst. Ret her – ingen andre steder.

   CHANGELOG v8.9:
   · 10 officielle arrangementer for sæson 2027
   · Næste arrangement som forsidens vigtigste funktion
   · Komplet årskalender med alle 10 events
   · Tilmelding, afmelding, venteliste, "Tilføj til kalender"
   · Brevo e-mail bekræftelser
   · Web Push via Cloudflare Worker (ES256/AES-128-GCM)
   · Automatiske påmindelser 7, 3, 1 dag før frist + 1 dag før arr.
   · Admin: arrangementer, kommunikation (kanal-valg), nyheder
   · Kontrast-fixes, afskårne kort rettet, ikoner verificerede
   · Fast bundnavigation: Forside–Kalender–Tilmeld–EK-Golf–Oversigt
   · Premium Business Club Design: mørkegrøn, guld, creme
   · Push-status skjult hvis CF Worker ikke er konfigureret
   · Ingen Supabase, ingen betalte abonnementer

   TEKNISK STACK:
   · Frontend: single-file PWA på GitHub Pages
   · Backend: Google Apps Script Web App
   · Database: Google Sheets
   · E-mail: Brevo REST API
   · Push: Cloudflare Worker (VAPID/ES256)
   · Auth: Google OAuth (admin.html)
   ================================================================ */

'use strict';

/* ================================================================
   KONFIGURATION — ret KUN her
   ================================================================ */
const CONFIG = {
  klubNavn:  'Lyngbygaard Erhvervsklub',
  tagline:   'Erhverv, netværk og golfoplevelser i Lyngbygaard Golf',
  adresse:   'Lyngbygårdsvej 29, 8220 Brabrand',
  telefon:   '87 44 10 70',
  email:     'info@lyg.dk',
  website:   'https://lyg.dk',
  appUrl:    'https://lyngbygaard.github.io/erhvervsklub/',

  golfboxUrl: 'https://www.golfbox.dk/',

  heroTekst:   'Erhverv, netværk og golfoplevelser',
  heroUnder:   'Lyngbygaard Erhvervsklub samler virksomheder i Aarhus-regionen om golf, relationer og fællesskab.',
  heroBillede: './images/ek-klubhus.jpg',

  /* ── Google Apps Script backend ─────────────────────────── */
  scriptUrl:    'INDSÆT_APPS_SCRIPT_WEB_APP_URL',
  requestToken: 'INDSÆT_REQUEST_TOKEN',

  /* ── Cloudflare Worker til Web Push (v8.6+) ─────────────── */
  pushWorkerUrl: '',   // f.eks. 'https://lyg-push-worker.sub.workers.dev'

  /* ── Firmaarrangementer (uden priser) ───────────────────── */
  golfArrangementer: [
    { id:'ga1', titel:'Company Day',         besk:'En hel dag for din virksomhed — golf, forplejning og fællesskab.',  inkl:['Golf på Lyngbygaard-banen','Forplejning tilpasset jeres ønsker','Fleksibelt program','Professionel tilrettelæggelse'] },
    { id:'ga2', titel:'VIP-arrangement',     besk:'Skræddersyet oplevelse for jeres vigtigste gæster.',                inkl:['Personlig service','Eksklusiv oplevelse','Tilpasset program','Præmier og diplomer'] },
    { id:'ga3', titel:'Kundearrangement',    besk:'Styrk relationen til jeres kunder med golf og netværk.',            inkl:['Golf for alle niveauer','Frokost og netværk','Professionel afholdelse','Fleksibel dato'] },
    { id:'ga4', titel:'Medarbejderarrangement', besk:'Giv jeres team en dag at huske — golf og god stemning.',          inkl:['Golf for alle niveauer','Teambuilding','Forplejning','Sociale aktiviteter'] },
    { id:'ga5', titel:'Møde + Golf',         besk:'Kombinér produktivt møde med golf.',                                inkl:['Mødelokale med AV-udstyr','Golf på banen','Forplejning fra Brasseriet','Fleksibel dagorden'] },
    { id:'ga6', titel:'Golfoplevelse',       besk:'Bliv introduceret til golf i trygge rammer.',                       inkl:['Introduktion til golf','Professionel vejledning','Udstyr til rådighed','Hyggelig stemning'] }
  ],

  sponsorFordele: [
    { ikon:'👁️',  titel:'Synlighed',       tekst:'Logo på bane, hjemmeside, app og ved alle arrangementer.' },
    { ikon:'🤝', titel:'Netværk',         tekst:'Adgang til eksklusive erhvervsarrangementer og sponsor-lounge.' },
    { ikon:'⛳', titel:'Golf & events',   tekst:'Greenfee-invitationer, turneringer og firmaarrangementer.' },
    { ikon:'📣', titel:'PR & omtale',    tekst:'Omtale i nyhedsbrev, sociale medier og lokal presse.' },
    { ikon:'🎯', titel:'Direkte adgang', tekst:'Mød beslutningstagere fra 100+ virksomheder i Aarhus-regionen.' },
    { ikon:'🏆', titel:'Prestige',       tekst:'Stærk associering med Lyngbygaard Golf og lokalt erhvervsliv.' }
  ],

  billeder: {
    hero:    './images/klubhus-hero.jpg',
    ek:      './images/ek-klubhus.jpg',
    arr:     './images/ek-arrangement.jpg',
    klubhus: './images/klubhus.png',
    logo:    './images/lyg-logo-transparent.png'
  }
};

/* ================================================================
   10 OFFICIELLE ARRANGEMENTER SÆSON 2027
   Baseret på EK's historiske program — verificerede tider og steder.
   ================================================================ */
const ARR_2027 = [
  {
    id: 'e27-01',
    dato: '2027-02-03',
    tid: '17.00–21.00',
    titel: 'SIM Golf — Vinter Netværk',
    sted: 'Golfarena Aarhus, Hasselager Centervej 1',
    type: 'Golf / Netværk',
    besk: 'Årets første erhvervsarrangement. Netværk og konkurrence på indoor simulator-bane med middag og hygge efterfølgende.',
    maks: 24,
    frist: '2027-01-27',
    pris: 'Inkl. i medlemskabet',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-02',
    dato: '2027-03-03',
    tid: '17.00–21.00',
    titel: 'SIM Golf — Forårsrunde',
    sted: 'Golfarena Aarhus, Hasselager Centervej 1',
    type: 'Golf / Netværk',
    besk: 'Anden runde på indoor simulator inden sæsonstarten. Konkurrence, netværk og forplejning.',
    maks: 24,
    frist: '2027-02-24',
    pris: 'Inkl. i medlemskabet',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-03',
    dato: '2027-04-14',
    tid: '15.00–20.00',
    titel: 'Sæsonåbning — Første Runde',
    sted: 'Lyngbygaard Golf, Lyngbygårdsvej 29, Brabrand',
    type: 'Golf / Netværk',
    besk: 'Officiel åbning af golfsæsonen 2027 for erhvervsklubben. Networking, golf og festlig middag i Brasseriet.',
    maks: 48,
    frist: '2027-04-07',
    pris: 'Inkl. i medlemskabet',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-04',
    dato: '2027-05-07',
    tid: '10.00–17.00',
    titel: 'Hjemmekamp mod Himmerland BC',
    sted: 'Lyngbygaard Golf, Lyngbygårdsvej 29, Brabrand',
    type: 'Golf / Venskabskamp',
    besk: 'Traditionsrig venskabskamp mod Himmerland Business Club. Rytterspil, forplejning og netværk med naboklubben.',
    maks: 40,
    frist: '2027-04-30',
    pris: 'Inkl. i medlemskabet',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-05',
    dato: '2027-05-29',
    tid: '',
    titel: 'Udlandsrejse — Skotland 2027',
    sted: 'Skotland (Royal Troon / Turnberry)',
    type: 'Golfrejse',
    besk: 'Årets udlandsrejse til Skotland 29. maj – 1. juni. Golf på legendariske baner, skotsk whisky og uforglemmelige oplevelser.',
    maks: 20,
    frist: '2027-04-15',
    pris: 'Pris oplyses ved tilmelding',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-06',
    dato: '2027-06-10',
    tid: '15.00–21.00',
    titel: 'Sommerturnering & Netværksmiddag',
    sted: 'Lyngbygaard Golf, Lyngbygårdsvej 29, Brabrand',
    type: 'Turnering / Netværk',
    besk: 'Erhvervsklubbens store sommerturnering med efterfølgende gala-middag. Årets sportslige og sociale højdepunkt før sommerferien.',
    maks: 72,
    frist: '2027-06-03',
    pris: 'Inkl. i medlemskabet',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-07',
    dato: '2027-08-19',
    tid: '10.00–18.00',
    titel: 'Danish Golf Championship — VIP',
    sted: 'Great Northern Golf Club',
    type: 'Golfoplevelse / VIP',
    besk: 'Se Danmarksmesterskabet i golf fra VIP-tribunen med erhvervsklubben. Eksklusive faciliter, forplejning og netværk.',
    maks: 30,
    frist: '2027-08-05',
    pris: 'Pris oplyses ved tilmelding',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-08',
    dato: '2027-09-03',
    tid: '',
    titel: 'Jyllandstur 2027',
    sted: 'Nordvestjysk & Holstebro Golfklub',
    type: 'Golfrejse',
    besk: 'Todages golftur til Jylland 3.–4. september. Golf på to flotte jyske baner, fælles middag og god kammeratskab.',
    maks: 24,
    frist: '2027-08-20',
    pris: 'Pris oplyses ved tilmelding',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-09',
    dato: '2027-10-08',
    tid: '10.00–17.00',
    titel: 'EK-Mesterskaberne 2027',
    sted: 'Silkeborg Ry Golfklub',
    type: 'Mesterskab',
    besk: 'Erhvervsklubbens eget mesterskab på Silkeborg Ry Golfklub. Hvem løfter pokalen i 2027? Konkurrence, præmier og festlig eftermiddag.',
    maks: 48,
    frist: '2027-10-01',
    pris: 'Inkl. i medlemskabet',
    aaben: true,
    status: 'aktiv',
    billede: ''
  },
  {
    id: 'e27-10',
    dato: '2027-11-19',
    tid: '17.00–23.00',
    titel: 'Julefrokost & Gokart 2027',
    sted: 'Racehall Aarhus / Tangkrogen',
    type: 'Socialt arrangement',
    besk: 'Årets hyggeligste event! Gokart-konkurrence, julefrokost og fest. En festlig afslutning på erhvervsåret 2027.',
    maks: 60,
    frist: '2027-11-05',
    pris: 'Pris oplyses ved tilmelding',
    aaben: true,
    status: 'aktiv',
    billede: ''
  }
];

/* Arkiv 2026 */
const ARR_ARKIV_2026 = [
  { id:'a1',  dato:'2026-02-04', titel:'Høj Sol over Aarhus',         sted:'Hermans, Tivoli Friheden',                type:'Koncert / netværk',   maks:80,  status:'afholdt' },
  { id:'a2',  dato:'2026-03-04', titel:'SIM Golf (1)',                 sted:'Golfarena Aarhus',                        type:'Golf / netværk',      maks:24,  status:'afholdt' },
  { id:'a3',  dato:'2026-03-18', titel:'SIM Golf (2)',                 sted:'Golfarena Aarhus',                        type:'Golf / netværk',      maks:24,  status:'afholdt' },
  { id:'a4',  dato:'2026-03-24', titel:'Byudvikling & Bajere',         sted:'Aarhus',                                  type:'Netværksarrangement', maks:50,  status:'afholdt' },
  { id:'a5',  dato:'2026-04-22', titel:'Hjemmekamp mod Himmerland BC', sted:'Lyngbygaard Golf',                        type:'Venskabskamp',        maks:40,  status:'afholdt' },
  { id:'a6',  dato:'2026-05-01', titel:'Udlandsrejse — Skotland',      sted:'Skotland',                                type:'Golfrejse',           maks:20,  status:'afholdt' },
  { id:'a7',  dato:'2026-06-02', titel:'Tysklandstur',                 sted:'Timmendorfer Strand',                     type:'Golfrejse',           maks:20,  status:'afholdt' },
  { id:'a8',  dato:'2026-08-14', titel:'Danish Golf Championship',     sted:'Great Northern',                          type:'Golfoplevelse',       maks:30,  status:'afholdt' },
  { id:'a9',  dato:'2026-09-01', titel:'Jyllandstur',                  sted:'Nordvestjysk & Holstebro Golfklub',       type:'Golfrejse',           maks:24,  status:'afholdt' },
  { id:'a10', dato:'2026-10-09', titel:'EK-Mesterskaberne',            sted:'Silkeborg Ry Golfklub',                   type:'Mesterskab',          maks:48,  status:'afholdt' },
  { id:'a11', dato:'2026-11-20', titel:'Julefrokost & Gokart',         sted:'Racehall Aarhus',                         type:'Socialt arrangement', maks:60,  status:'afholdt' }
];

/* ================================================================
   STORAGE
   ================================================================ */
const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn('[DB]', e); } },
  del: k => localStorage.removeItem(k)
};

/* ================================================================
   API-KALD
   ================================================================ */
async function scriptFetch(body) {
  const url = CONFIG.scriptUrl;
  if (!url || url.startsWith('INDSÆT')) throw new Error('Apps Script URL ikke konfigureret');
  const resp = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, token: CONFIG.requestToken })
  });
  if (!resp.ok) throw new Error('Serverfejl: ' + resp.status);
  return resp.json();
}

async function scriptGet(params) {
  const url = CONFIG.scriptUrl;
  if (!url || url.startsWith('INDSÆT')) throw new Error('Apps Script URL ikke konfigureret');
  const qs = new URLSearchParams({ ...params, token: CONFIG.requestToken });
  const resp = await fetch(url + '?' + qs);
  if (!resp.ok) throw new Error('Serverfejl: ' + resp.status);
  return resp.json();
}

async function adminFetch(body) {
  const token = DB.get('ek_admin_token');
  if (!token) throw new Error('Ikke logget ind som admin');
  return scriptFetch({ ...body, adminToken: token });
}

/* ================================================================
   HJÆLPEFUNKTIONER
   ================================================================ */
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function datoStr(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('da-DK', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

function datoKort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('da-DK', { day:'numeric', month:'short' });
}

function dageHidtil(iso) {
  const nu = new Date();
  const maal = new Date(iso + 'T12:00:00');
  return Math.ceil((maal - nu) / 86400000);
}

function naestArr() {
  const idag = new Date().toISOString().slice(0,10);
  const arr = hentAktiveArr();
  return arr.find(a => a.dato >= idag && a.status !== 'aflyst') || null;
}

function hentAktiveArr() {
  const backend = DB.get('ek_arr_backend');
  if (backend && Array.isArray(backend) && backend.length) return backend;
  return ARR_2027.filter(a => a.status === 'aktiv');
}

function hentTilmeldinger() {
  return DB.get('ek_tilm') || [];
}

function erTilmeldt(arrId, email) {
  const tilm = hentTilmeldinger();
  return tilm.some(t => t.arrId === arrId && t.email === email && t.status !== 'afmeldt');
}

function brugerEmail() {
  const info = DB.get('ek_bruger');
  return info?.email || '';
}

/* ================================================================
   ROUTER & NAVIGATION
   ================================================================ */
const SIDER = ['forside','kalender','tilmelding','om','golfarr','sponsor','nyheder','kontakt','admin','mere'];
let aktivSide = 'forside';

function navTil(side, params = {}) {
  aktivSide = side;
  const mc = document.getElementById('main-content');
  if (!mc) return;

  // Scroll til top
  window.scrollTo(0,0);

  // Opdater nav
  document.querySelectorAll('#bottom-nav .nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.side === side);
  });

  // Render side
  const fns = {
    forside:    pgForside,
    kalender:   pgKalender,
    tilmelding: pgTilmelding,
    om:         pgOm,
    golfarr:    pgGolf,
    sponsor:    pgSponsor,
    nyheder:    pgNyheder,
    kontakt:    pgKontakt,
    admin:      pgAdmin,
    mere:       pgMere
  };
  mc.innerHTML = '';
  if (fns[side]) {
    mc.innerHTML = fns[side](params);
    efterRender(side, params);
  }
  opdaterInfoBjaelke();
}

function efterRender(side, params) {
  if (side === 'tilmelding') {
    if (params.id) {
      const sel = document.getElementById('tilm-arr-select');
      if (sel) sel.value = params.id;
      opdaterTilmeldFormular(params.id);
    }
  }
  if (side === 'kalender') {
    hentTilmeldtStatus();
  }
  if (side === 'admin') {
    checkAdminLogin();
  }
  if (side === 'forside') {
    hentForsideTilmelding();
  }
}

/* ================================================================
   INFORMATIONSBJÆLKE
   ================================================================ */
function opdaterInfoBjaelke() {
  const el = document.getElementById('info-bjaelke');
  if (!el) return;
  const arr = naestArr();
  if (!arr) { el.style.display = 'none'; return; }
  const dage = dageHidtil(arr.dato);
  const dageTekst = dage === 0 ? 'I DAG' : dage === 1 ? 'OM 1 DAG' : `OM ${dage} DAGE`;
  el.style.display = 'flex';
  el.innerHTML = `
    <div class="ib-inner" onclick="navTil('kalender')">
      <span class="ib-label">NÆSTE ARRANGEMENT</span>
      <span class="ib-sep">·</span>
      <span class="ib-titel">${esc(arr.titel)}</span>
      <span class="ib-sep">·</span>
      <span class="ib-dato">${datoKort(arr.dato)}</span>
      <span class="ib-badge">${dageTekst}</span>
    </div>`;
}

/* ================================================================
   FORSIDE
   ================================================================ */
function pgForside(params = {}) {
  const naest = naestArr();
  const arr = hentAktiveArr();
  const kommende = arr.filter(a => a.dato >= new Date().toISOString().slice(0,10)).slice(0,3);

  return `
<div class="side-forside">

  <!-- Hero -->
  <div class="hero-wrap">
    <div class="hero-bg" style="background-image:url('${CONFIG.billeder.hero}')"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-logo-wrap">
        <img src="${CONFIG.billeder.logo}" alt="LYG Logo" class="hero-logo" onerror="this.style.display='none'">
      </div>
      <p class="hero-over">LYNGBYGAARD GOLF</p>
      <h1 class="hero-titel">ERHVERVSKLUBBEN</h1>
      <p class="hero-sub">Golf · Relationer · Forretning</p>
    </div>
  </div>

  <!-- Næste arrangement — PRIMÆR CTA -->
  ${naest ? `
  <div class="naest-arr-banner" onclick="navTil('kalender', {id:'${naest.id}'})">
    <div class="nab-top">
      <span class="nab-label">NÆSTE ARRANGEMENT</span>
      <span class="nab-badge">${(() => { const d = dageHidtil(naest.dato); return d === 0 ? 'I DAG' : d === 1 ? 'OM 1 DAG' : `OM ${d} DAGE`; })()}</span>
    </div>
    <h2 class="nab-titel">${esc(naest.titel)}</h2>
    <div class="nab-meta">
      <span>📅 ${datoStr(naest.dato)}</span>
      ${naest.tid ? `<span>🕐 ${esc(naest.tid)}</span>` : ''}
      <span>📍 ${esc(naest.sted)}</span>
    </div>
    <p class="nab-besk">${esc(naest.besk)}</p>
    <div class="nab-cta-wrap">
      <button class="knap-p nab-cta" onclick="event.stopPropagation();navTil('tilmelding',{id:'${naest.id}'})">
        TILMELD DIG →
      </button>
      <button class="knap-sek nab-info" onclick="event.stopPropagation();navTil('kalender',{id:'${naest.id}'})">
        Læs mere
      </button>
    </div>
  </div>` : `
  <div class="naest-arr-banner ingen-arr">
    <p class="nab-label">SÆSON 2027</p>
    <h2 class="nab-titel">Alle 10 arrangementer er klar</h2>
    <button class="knap-p" onclick="navTil('kalender')">SE ÅRSKALENDER →</button>
  </div>`}

  <!-- Stats -->
  <div class="stats-bjaelke">
    <div class="stat-item"><span class="stat-tal">100+</span><span class="stat-lbl">Virksomheder</span></div>
    <div class="stat-sep"></div>
    <div class="stat-item"><span class="stat-tal">10</span><span class="stat-lbl">Arrangementer</span></div>
    <div class="stat-sep"></div>
    <div class="stat-item"><span class="stat-tal">35+</span><span class="stat-lbl">Års tradition</span></div>
  </div>

  <!-- Kommende events (mini) -->
  ${kommende.length ? `
  <div class="forside-sek">
    <h2 class="sek-h">Kommende arrangementer</h2>
    <div class="mini-arr-liste">
      ${kommende.map(a => `
      <div class="mini-arr-kort" onclick="navTil('kalender',{id:'${a.id}'})">
        <div class="mak-dato">
          <span class="mak-dag">${new Date(a.dato+'T12:00:00').getDate()}</span>
          <span class="mak-mdr">${new Date(a.dato+'T12:00:00').toLocaleDateString('da-DK',{month:'short'})}</span>
        </div>
        <div class="mak-info">
          <strong class="mak-titel">${esc(a.titel)}</strong>
          <span class="mak-type">${esc(a.type)}</span>
        </div>
        <svg class="mak-pil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>`).join('')}
    </div>
    <button class="knap-sek full-w" onclick="navTil('kalender')">Se alle 10 arrangementer →</button>
  </div>` : ''}

  <!-- Om EK -->
  <div class="forside-sek om-ek-sek">
    <h2 class="sek-h">Mere end golf</h2>
    <p class="sek-p">Erhvervsklubben samler virksomheder og beslutningstagere i Aarhus-regionen om relationer, netværk og golf. Med over 100 erhvervsmedlemmer er vi et af regionens stærkeste forretningsnetværk.</p>
    <div class="om-punkter-grid">
      <div class="om-p"><span class="om-ikon">🤝</span><strong>Netværk</strong><span>100+ virksomheder</span></div>
      <div class="om-p"><span class="om-ikon">⛳</span><strong>Golf & sport</strong><span>Turneringer og rejser</span></div>
      <div class="om-p"><span class="om-ikon">🏆</span><strong>EK-Mesterskabet</strong><span>Årets høydepunkt</span></div>
      <div class="om-p"><span class="om-ikon">📅</span><strong>10 events/år</strong><span>Fra SIM til julefrokost</span></div>
    </div>
    <button class="knap-sek" onclick="navTil('om')">Om Erhvervsklubben →</button>
  </div>

  <!-- EK-Golf -->
  <div class="forside-sek ekgolf-sek">
    <h2 class="sek-h">EK-Golf onsdage</h2>
    <p class="sek-p">Meld dig til erhvervsklubbens uformelle onsdagsgolf. Åbent for alle niveauer — fra begynder til rutineret spiller. Socialt og afslappet.</p>
    <button class="knap-p" onclick="navTil('om')">Læs om EK-Golf →</button>
  </div>

  <!-- Push-notifikationer (kun hvis konfigureret) -->
  <div id="push-sektion" style="display:none" class="forside-sek push-sek">
    <h2 class="sek-h">🔔 Push-notifikationer</h2>
    <p class="sek-p">Bliv automatisk informeret om nye arrangementer, påmindelser og ændringer — direkte på din telefon.</p>
    <div id="push-status-vis"></div>
    <button class="knap-sek" id="push-knap" onclick="togglePush()">Aktiver notifikationer</button>
  </div>

  <!-- Footer -->
  <footer class="app-footer">
    <div class="footer-logo">
      <img src="${CONFIG.billeder.logo}" alt="LYG" height="32" onerror="this.style.display='none'">
      <span>LYG Erhvervsklub</span>
    </div>
    <p class="footer-adresse">${esc(CONFIG.adresse)}</p>
    <p class="footer-kontakt"><a href="tel:${CONFIG.telefon}">${esc(CONFIG.telefon)}</a> · <a href="mailto:${CONFIG.email}">${esc(CONFIG.email)}</a></p>
    <p class="footer-lyg"><a href="${CONFIG.website}" target="_blank" rel="noopener">lyg.dk</a></p>
    <p class="footer-credit">Udviklet af <a href="https://nordic-operations.dk" target="_blank" rel="noopener">Nordic Operations</a></p>
    <p class="footer-ver">v8.9</p>
  </footer>
</div>`;
}

function hentForsideTilmelding() {
  // Vis push-sektion kun hvis CF Worker er konfigureret
  const pushSek = document.getElementById('push-sektion');
  if (pushSek && CONFIG.pushWorkerUrl && !CONFIG.pushWorkerUrl.startsWith('INDSÆT')) {
    pushSek.style.display = 'block';
    opdaterPushKnap();
  }
}

/* ================================================================
   KALENDER
   ================================================================ */
function pgKalender(params = {}) {
  const arr = hentAktiveArr();
  const tilm = hentTilmeldinger();
  const email = brugerEmail();
  const idag = new Date().toISOString().slice(0,10);
  const kommende = arr.filter(a => a.dato >= idag).sort((a,b) => a.dato.localeCompare(b.dato));
  const afholdte = arr.filter(a => a.dato < idag).sort((a,b) => b.dato.localeCompare(a.dato));

  return `
<div class="side-kalender">
  <div class="side-hd">
    <h1>Årskalender 2027</h1>
    <p class="side-sub">10 arrangementer — golf, netværk og oplevelser</p>
  </div>

  ${kommende.map(a => {
    const dage = dageHidtil(a.dato);
    const tilmeldt = email && erTilmeldt(a.arrId || a.id, email);
    const fristen = a.frist && new Date().toISOString().slice(0,10) > a.frist;
    return `
    <div class="arr-kort ${params.id === a.id ? 'fremhaevet' : ''}" id="arr-${a.id}">
      <div class="ak-top">
        <div class="ak-dato-boks">
          <span class="ak-dag">${new Date(a.dato+'T12:00:00').getDate()}</span>
          <span class="ak-mdr">${new Date(a.dato+'T12:00:00').toLocaleDateString('da-DK',{month:'long'})}</span>
          <span class="ak-aar">${new Date(a.dato+'T12:00:00').getFullYear()}</span>
        </div>
        <div class="ak-info">
          <span class="ak-type-badge">${esc(a.type)}</span>
          <h2 class="ak-titel">${esc(a.titel)}</h2>
          <div class="ak-meta">
            ${a.tid ? `<span>🕐 ${esc(a.tid)}</span>` : ''}
            <span>📍 ${esc(a.sted)}</span>
            ${a.maks ? `<span>👥 Maks ${a.maks} deltagere</span>` : ''}
          </div>
        </div>
        ${dage >= 0 && dage <= 7 ? `<span class="ak-haaster">${dage===0?'I DAG':`${dage}d`}</span>` : ''}
      </div>

      <p class="ak-besk">${esc(a.besk)}</p>

      ${a.frist ? `<div class="ak-frist ${fristen?'frist-udloebet':''}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${fristen ? 'Tilmeldingsfrist udløbet' : `Tilmeldingsfrist: ${datoStr(a.frist)}`}
      </div>` : ''}

      ${a.pris ? `<div class="ak-pris">💳 ${esc(a.pris)}</div>` : ''}

      <div class="ak-knapper">
        ${tilmeldt ? `
          <span class="tilmeldt-badge">✓ Tilmeldt</span>
          <button class="knap-sek sm" onclick="visAfmeldDialog('${esc(a.id)}','${esc(a.titel)}')">Afmeld</button>
        ` : fristen ? `
          <span class="frist-badge">Tilmelding lukket</span>
        ` : `
          <button class="knap-p" onclick="navTil('tilmelding',{id:'${esc(a.id)}'})">Tilmeld dig</button>
        `}
        <button class="knap-sek sm" onclick="tilfoejKalender('${esc(a.id)}')">📅 Tilføj til kalender</button>
      </div>

      <div id="afmeld-dialog-${a.id}" class="afmeld-dialog" style="display:none">
        <p>Bekræft afmelding fra <strong>${esc(a.titel)}</strong>?</p>
        <div style="display:flex;gap:.5rem;margin-top:.75rem">
          <button class="knap-p sm" onclick="gennemfoerAfmelding('${esc(a.id)}')">Ja, afmeld mig</button>
          <button class="knap-sek sm" onclick="document.getElementById('afmeld-dialog-${a.id}').style.display='none'">Annuller</button>
        </div>
        <div id="afmeld-status-${a.id}" class="form-status mt1"></div>
      </div>
    </div>`;
  }).join('')}

  ${afholdte.length ? `
  <div class="arkiv-sek">
    <h2 class="sek-h" style="margin-top:2rem">Afholdte arrangementer 2027</h2>
    ${afholdte.map(a=>`
    <div class="arr-kort arkiv-kort">
      <div class="ak-top">
        <div class="ak-dato-boks arkiv-dato">
          <span class="ak-dag">${new Date(a.dato+'T12:00:00').getDate()}</span>
          <span class="ak-mdr">${new Date(a.dato+'T12:00:00').toLocaleDateString('da-DK',{month:'short'})}</span>
        </div>
        <div class="ak-info">
          <span class="ak-type-badge muted-badge">${esc(a.type)}</span>
          <h2 class="ak-titel">${esc(a.titel)}</h2>
          <span class="muted">📍 ${esc(a.sted)}</span>
        </div>
        <span class="ak-afholdt-badge">Afholdt</span>
      </div>
    </div>`).join('')}
  </div>` : ''}

  <div class="tidl-arr-link">
    <button class="knap-sek" onclick="visTidligereArr()">Se tidligere arrangementer (2026)</button>
    <div id="tidl-arr-vis"></div>
  </div>
</div>`;
}

function visTidligereArr() {
  const el = document.getElementById('tidl-arr-vis');
  if (!el) return;
  if (el.innerHTML) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <h3 class="sek-h" style="margin-top:1.5rem">Arrangementer 2026</h3>
    ${ARR_ARKIV_2026.map(a=>`
    <div class="arr-kort arkiv-kort">
      <div class="ak-top">
        <div class="ak-dato-boks arkiv-dato">
          <span class="ak-dag">${new Date(a.dato+'T12:00:00').getDate()}</span>
          <span class="ak-mdr">${new Date(a.dato+'T12:00:00').toLocaleDateString('da-DK',{month:'short'})}</span>
        </div>
        <div class="ak-info">
          <span class="ak-type-badge muted-badge">${esc(a.type)}</span>
          <h2 class="ak-titel">${esc(a.titel)}</h2>
          <span class="muted">📍 ${esc(a.sted)}</span>
        </div>
        <span class="ak-afholdt-badge">Afholdt</span>
      </div>
    </div>`).join('')}`;
}

function hentTilmeldtStatus() {
  // Synkroniserer tilmeldtstatus med backend
  const email = brugerEmail();
  if (!email || CONFIG.scriptUrl.startsWith('INDSÆT')) return;
  scriptGet({ action: 'getMineArr', email }).then(r => {
    if (r.ok && r.arr) {
      DB.set('ek_tilm', r.arr);
    }
  }).catch(()=>{});
}

/* ================================================================
   TILMELDING
   ================================================================ */
function pgTilmelding(params = {}) {
  const arr = hentAktiveArr();
  const idag = new Date().toISOString().slice(0,10);
  const aktive = arr.filter(a => a.dato >= idag && a.aaben !== false);

  return `
<div class="side-tilmelding">
  <div class="side-hd">
    <h1>Tilmelding</h1>
    <p class="side-sub">Tilmeld dig et af sæsonens 10 arrangementer</p>
  </div>

  <div class="tilm-form-wrap">
    <div class="form-row">
      <label for="tilm-arr-select">Vælg arrangement</label>
      <select id="tilm-arr-select" class="input-felt" onchange="opdaterTilmeldFormular(this.value)">
        <option value="">— Vælg arrangement —</option>
        ${aktive.map(a => `<option value="${esc(a.id)}" ${params.id===a.id?'selected':''}>${datoKort(a.dato)} · ${esc(a.titel)}</option>`).join('')}
      </select>
    </div>

    <div id="tilm-arr-info" style="display:none" class="tilm-arr-info"></div>

    <form id="tilm-form" onsubmit="gennemfoerTilmelding(event)" style="display:none">
      <div class="form-row">
        <label for="tilm-navn">Fulde navn *</label>
        <input type="text" id="tilm-navn" class="input-felt" required autocomplete="name" placeholder="Jens Jensen">
      </div>
      <div class="form-row">
        <label for="tilm-email">E-mail *</label>
        <input type="email" id="tilm-email" class="input-felt" required autocomplete="email" placeholder="jens@virksomhed.dk">
      </div>
      <div class="form-row">
        <label for="tilm-virk">Virksomhed *</label>
        <input type="text" id="tilm-virk" class="input-felt" required autocomplete="organization" placeholder="Virksomhed A/S">
      </div>
      <div class="form-row">
        <label for="tilm-tlf">Telefon</label>
        <input type="tel" id="tilm-tlf" class="input-felt" autocomplete="tel" placeholder="+45 xx xx xx xx">
      </div>
      <div class="form-row">
        <label for="tilm-komm">Kommentar / allergier</label>
        <textarea id="tilm-komm" class="input-felt" rows="3" placeholder="Eventuelle ønsker eller allergier…"></textarea>
      </div>
      <div class="form-row gdpr-check">
        <label class="check-label">
          <input type="checkbox" id="tilm-gdpr" required>
          Jeg accepterer at mine oplysninger behandles i overensstemmelse med <a href="${CONFIG.website}/privatlivspolitik" target="_blank" rel="noopener">privatlivspolitikken</a> *
        </label>
      </div>
      <div id="tilm-status" class="form-status" style="display:none"></div>
      <button type="submit" class="knap-p full-w" style="margin-top:1rem" id="tilm-send-knap">Tilmeld mig</button>
    </form>

    <div id="tilm-bekr" style="display:none" class="tilm-bekr-boks">
      <div class="bekr-ikon">✓</div>
      <h2>Tilmelding modtaget</h2>
      <p id="tilm-bekr-tekst"></p>
      <button class="knap-sek" onclick="navTil('kalender')">Se kalender</button>
    </div>
  </div>

  <div class="mine-tilm-sek">
    <h2 class="sek-h">Mine tilmeldinger</h2>
    <div id="mine-tilm-vis">
      ${visMineTilmeldinger()}
    </div>
    <button class="knap-sek sm" onclick="opdaterMineTilmeldinger()">Opdater</button>
  </div>
</div>`;
}

function opdaterTilmeldFormular(arrId) {
  const arr = hentAktiveArr();
  const valgt = arr.find(a => a.id === arrId);
  const infoEl = document.getElementById('tilm-arr-info');
  const formEl = document.getElementById('tilm-form');
  if (!valgt || !infoEl || !formEl) {
    if (infoEl) infoEl.style.display = 'none';
    if (formEl) formEl.style.display = 'none';
    return;
  }
  infoEl.style.display = 'block';
  infoEl.innerHTML = `
    <div class="valgt-arr-info">
      <strong>${esc(valgt.titel)}</strong>
      <span>📅 ${datoStr(valgt.dato)}${valgt.tid?' · 🕐 '+esc(valgt.tid):''}</span>
      <span>📍 ${esc(valgt.sted)}</span>
      ${valgt.pris ? `<span>💳 ${esc(valgt.pris)}</span>` : ''}
      ${valgt.maks ? `<span>👥 Maks ${valgt.maks} deltagere</span>` : ''}
    </div>`;
  formEl.style.display = 'block';
  // Forudfyld e-mail hvis gemt
  const email = brugerEmail();
  if (email) {
    const emailFelt = document.getElementById('tilm-email');
    if (emailFelt) emailFelt.value = email;
  }
}

async function gennemfoerTilmelding(evt) {
  evt.preventDefault();
  const arrId   = document.getElementById('tilm-arr-select')?.value;
  const navn    = document.getElementById('tilm-navn')?.value?.trim();
  const email   = document.getElementById('tilm-email')?.value?.trim();
  const virk    = document.getElementById('tilm-virk')?.value?.trim();
  const tlf     = document.getElementById('tilm-tlf')?.value?.trim();
  const komm    = document.getElementById('tilm-komm')?.value?.trim();
  const statusEl = document.getElementById('tilm-status');
  const knap    = document.getElementById('tilm-send-knap');

  if (!arrId || !navn || !email || !virk) {
    if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status fejl'; statusEl.textContent='Udfyld alle påkrævede felter.'; }
    return;
  }

  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status info'; statusEl.textContent='Sender tilmelding…'; }
  if (knap) knap.disabled = true;

  try {
    const arr = hentAktiveArr().find(a => a.id === arrId);
    const r = await scriptFetch({ action:'tilmeld', arrId, arrTitel: arr?.titel||'', navn, email, virk, tlf, komm });
    if (!r.ok) throw new Error(r.fejl || 'Tilmelding fejlede');

    // Gem lokalt
    DB.set('ek_bruger', { email, navn, virk });
    const tilm = hentTilmeldinger();
    tilm.push({ arrId, titel: arr?.titel||'', navn, email, status:'aktiv', dato: new Date().toISOString() });
    DB.set('ek_tilm', tilm);

    // Vis bekræftelse
    document.getElementById('tilm-form').style.display = 'none';
    document.getElementById('tilm-arr-info').style.display = 'none';
    const bekr = document.getElementById('tilm-bekr');
    const bekrTekst = document.getElementById('tilm-bekr-tekst');
    if (bekr) bekr.style.display = 'block';
    if (bekrTekst) bekrTekst.textContent = `Du er tilmeldt ${arr?.titel||'arrangementet'}. Bekræftelse er sendt til ${email}.`;

    if (statusEl) statusEl.style.display = 'none';
  } catch(e) {
    if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status fejl'; statusEl.textContent='Fejl: ' + e.message; }
    if (knap) knap.disabled = false;
  }
}

function visMineTilmeldinger() {
  const tilm = hentTilmeldinger().filter(t => t.status !== 'afmeldt');
  if (!tilm.length) return '<p class="muted">Ingen aktive tilmeldinger.</p>';
  return `<div class="mine-tilm-liste">${tilm.map(t=>`
    <div class="mine-tilm-kort">
      <strong>${esc(t.titel||t.arrId)}</strong>
      <span class="tilmeldt-badge">✓ Tilmeldt</span>
      <button class="knap-sek sm" onclick="visAfmeldDialog('${esc(t.arrId)}','${esc(t.titel||'')}')">Afmeld</button>
    </div>`).join('')}</div>`;
}

function opdaterMineTilmeldinger() {
  const el = document.getElementById('mine-tilm-vis');
  if (!el) return;
  hentTilmeldtStatus();
  setTimeout(()=>{ if(el) el.innerHTML = visMineTilmeldinger(); }, 500);
}

function visAfmeldDialog(arrId, titel) {
  const d = document.getElementById('afmeld-dialog-'+arrId);
  if (d) d.style.display = 'block';
}

async function gennemfoerAfmelding(arrId) {
  const statusEl = document.getElementById('afmeld-status-'+arrId);
  const email = brugerEmail();
  if (!email) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Indtast venligst din e-mail.'; }
    return;
  }
  if (statusEl) { statusEl.className='form-status info'; statusEl.textContent='Sender afmelding…'; }
  try {
    const r = await scriptFetch({ action:'afmeld', arrId, email });
    if (!r.ok) throw new Error(r.fejl || 'Afmelding fejlede');
    const tilm = hentTilmeldinger().map(t => t.arrId===arrId&&t.email===email ? {...t,status:'afmeldt'} : t);
    DB.set('ek_tilm', tilm);
    if (statusEl) { statusEl.className='form-status ok'; statusEl.textContent='Afmeldt. Bekræftelse sendt til '+email; }
    setTimeout(()=>navTil('kalender'), 1500);
  } catch(e) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Fejl: '+e.message; }
  }
}

function tilfoejKalender(arrId) {
  const arr = hentAktiveArr().find(a => a.id === arrId);
  if (!arr) return;
  const start = arr.dato.replace(/-/g,'') + (arr.tid ? 'T' + arr.tid.split('–')[0].replace(/\./g,'') + '00' : '');
  const slut  = arr.dato.replace(/-/g,'') + (arr.tid && arr.tid.includes('–') ? 'T' + arr.tid.split('–')[1].replace(/\./g,'') + '00' : '');
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LYG Erhvervsklub//v8.9//DA',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    slut !== start ? `DTEND:${slut}` : '',
    `SUMMARY:${arr.titel}`,
    `DESCRIPTION:${arr.besk}`,
    `LOCATION:${arr.sted}`,
    `UID:${arr.id}@lyg-erhvervsklub`,
    'END:VEVENT','END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = arr.titel.replace(/\s+/g,'-') + '.ics';
  a.click();
}

/* ================================================================
   OM ERHVERVSKLUBBEN (EK)
   ================================================================ */
function pgOm(params = {}) {
  const medlemmer = hentMedlemsvirksomheder();
  return `
<div class="side-om">
  <div class="side-hd">
    <h1>Om Erhvervsklubben</h1>
    <p class="side-sub">Professionelle rammer. Uformelt fællesskab.</p>
  </div>

  <div class="om-sek">
    <p class="om-tekst">Lyngbygaard Erhvervsklub samler virksomheder og beslutningstagere i Aarhus-regionen om relationer, netværk og golf. Med over 100 erhvervsmedlemmer er vi et af regionens stærkeste forretningsnetværk.</p>
    <div class="om-punkter">
      ${CONFIG.golfArrangementer.slice(0,4).map(g=>`
      <div class="om-punkt-kort">
        <strong>${esc(g.titel)}</strong>
        <p>${esc(g.besk)}</p>
      </div>`).join('')}
    </div>
  </div>

  <!-- EK-Golf -->
  <div class="om-sek">
    <h2 class="sek-h">EK-Golf onsdage</h2>
    <p class="om-tekst">Hvert år arrangerer Erhvervsklubben onsdagsgolf for alle niveauer. Uformelt, socialt og åbent for alle. Mød kollegaerne fra nabovirksomheden på fairwayen.</p>
    <div class="ekgolf-info-grid">
      <div class="ekgolf-kort"><span class="ek-ikon">📅</span><strong>Hvornår</strong><span>Onsdage i sæsonen</span></div>
      <div class="ekgolf-kort"><span class="ek-ikon">⛳</span><strong>Niveau</strong><span>Alle niveauer</span></div>
      <div class="ekgolf-kort"><span class="ek-ikon">📍</span><strong>Sted</strong><span>Lyngbygaard Golf</span></div>
      <div class="ekgolf-kort"><span class="ek-ikon">📱</span><strong>Tilmelding</strong><span>Via GolfBox</span></div>
    </div>
    <a href="${CONFIG.golfboxUrl}" target="_blank" rel="noopener" class="knap-p" style="display:inline-block;margin-top:1rem">Åbn GolfBox →</a>
  </div>

  <!-- Bliv medlem -->
  <div class="om-sek bliv-medl-sek">
    <h2 class="sek-h">Bliv erhvervsmedlem</h2>
    <p class="om-tekst">Kontakt os for at høre om mulighederne. Erhvervsmedlemskabet giver adgang til alle EK-arrangementer, EK-Golf og vores aktive netværk af 100+ virksomheder.</p>
    <button class="knap-p" onclick="navTil('kontakt')">Kontakt os →</button>
  </div>

  <!-- Installér PWA -->
  <div class="om-sek pwa-sek">
    <h2 class="sek-h">Installér appen</h2>
    ${visInstallVejledning()}
  </div>

  <!-- Medlemsvirksomheder -->
  <div class="om-sek">
    <h2 class="sek-h">Medlemsvirksomheder</h2>
    <div class="medl-soeg">
      <input type="search" id="medl-soeg-inp" class="input-felt" placeholder="Søg virksomhed…" oninput="filtrerMedlemmer(this.value)">
    </div>
    <div id="medl-liste" class="medl-grid">
      ${renderMedlemmer(medlemmer)}
    </div>
  </div>
</div>`;
}

function hentMedlemsvirksomheder() {
  return DB.get('ek_medl') || [
    'AquaDoc ApS','Arla Foods','Arriva Danmark','Aros Invest','Autogruppen Aarhus',
    'Bankdata','Bestseller','BMW Aarhus','Bravura A/S','BygRåd Aarhus',
    'C.C. Contractor','Carlsberg Danmark','Coop Danmark','Customflow ApS','DBI',
    'DELTA Consulting','Dreyer Consult','Dronninglund Sparekasse','DSB Godstog','EcoSafe A/S',
    'Elgiganten Aarhus','EY Aarhus','F5 Invest','Favrskov Forsyning','Fertin Pharma',
    'First Hotel Aarhus','FLSmidth','Fokus Revision','Forsikring & Pension','G4S Security',
    'GF Forsikring','GlobalConnect','Greentech Capital','Grundfos','HedeDanmark',
    'Himmerland Invest','Horten Advokater','HOFOR','HP Byg','HRW Holding',
    'Hydrema','IDA','Industriens Hus','Intersport','Jyske Bank Erhverv',
    'Jyske Bank Privat','K-EL Teknik','Kamstrup','Klingenberg Invest','KPMG Aarhus',
    'Kromann Reumert','L&F','Laboremus','Lemvigh-Müller','Lind Capital',
    'Lyngbygaard Golf Klub','MFG Advisory','Midtjysk Brand','Molslinjen','Morsø Jernstøberi',
    'Niras','NNF Invest','Nordic Operations','Nordjyske Bank','Norlys',
    'NRGi','Odder Sparekasse','Overgaard & Co.','Parkering Aarhus','PFA Pension',
    'Privat Invest','ProHub360','PWC Aarhus','Rambøll','Randers Regnskov',
    'Randers Sparekasse','Reoler A/S','Revisionsgruppen','Rohde Nielsen','Rold Skov Brewing',
    'Rooftop AV','ScanGas','Scan Global Logistics','Siemens Energy','Silkeborg Data',
    'Skattestyrelsen','Skiold','SØFCO','Sparklar','Stark Group',
    'Stena Recycling','STO Aarhus','Sundhedshuset Aarhus','Sweco','SYD Energi',
    'Sydbank Aarhus','Tekniq','Tempo-Team','TF Marketing','TK Development',
    'Total Energies','Topdanmark Erhverv','TotalEnergies','Travl','Trivselspartner',
    'Unitrack','Vald. Birn','Vestas Wind Systems','VestbirK','Viborg Stiftsamt',
    'Videnbro','Vildmosen Naturpark','Vindmølleindustrien','WSP','Ziegler Group'
  ];
}

function renderMedlemmer(liste) {
  return `<div class="medl-kort-wrap">${liste.map(m=>`<div class="medl-kort">${esc(m)}</div>`).join('')}</div>`;
}

function filtrerMedlemmer(q) {
  const liste = hentMedlemsvirksomheder();
  const filtr = q ? liste.filter(m => m.toLowerCase().includes(q.toLowerCase())) : liste;
  const el = document.getElementById('medl-liste');
  if (el) el.innerHTML = renderMedlemmer(filtr);
}

function visInstallVejledning() {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua) && !/chrome/i.test(ua);
  const isAndroid = /android/i.test(ua);
  if (isIos) return `
    <div class="pwa-guide ios">
      <div class="pwa-trin"><span class="pwa-nr">1</span><p>Tryk på <strong>del-knappen</strong> (⬆) nederst i Safari</p></div>
      <div class="pwa-trin"><span class="pwa-nr">2</span><p>Vælg <strong>"Føj til hjemmeskærm"</strong></p></div>
      <div class="pwa-trin"><span class="pwa-nr">3</span><p>Tryk <strong>"Tilføj"</strong></p></div>
    </div>`;
  if (isAndroid) return `<p class="om-tekst">Tryk på de tre prikker i Chrome og vælg <strong>"Føj til startskærm"</strong>.</p>`;
  return `<p class="om-tekst">Åbn appen i Chrome eller Edge og klik på installér-ikonet i adresselinjen.</p>`;
}

/* ================================================================
   GOLF (Firmaarrangementer)
   ================================================================ */
function pgGolf(params = {}) {
  return `
<div class="side-golf">
  <div class="side-hd">
    <h1>EK-Golf</h1>
    <p class="side-sub">Golf og firmaarrangementer i professionelle rammer</p>
  </div>

  <div class="golf-intro-sek">
    <div class="golf-intro-kort">
      <h2>EK-Golf onsdage</h2>
      <p>Erhvervsklubbens uformelle onsdagsgolf er åben for alle niveauer. Socialt, afslappet og et fremragende sted at møde nye forretningsforbindelser.</p>
      <a href="${CONFIG.golfboxUrl}" target="_blank" rel="noopener" class="knap-p">Book via GolfBox →</a>
    </div>
  </div>

  <div class="golf-arr-sek">
    <h2 class="sek-h">Firmaarrangementer</h2>
    <p class="sek-p">Lyngbygaard Golf tilbyder skræddersyede firmaarrangementer. Priser og program aftales individuelt.</p>
    <div class="golf-arr-grid">
      ${CONFIG.golfArrangementer.map(g => `
      <div class="golf-arr-kort">
        <h3>${esc(g.titel)}</h3>
        <p>${esc(g.besk)}</p>
        <ul class="golf-inkl">${g.inkl.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
        <button class="knap-sek" onclick="navTil('kontakt')">Forespørg →</button>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

/* ================================================================
   SPONSOR
   ================================================================ */
function pgSponsor(params = {}) {
  return `
<div class="side-sponsor">
  <div class="side-hd">
    <h1>Sponsorater</h1>
    <p class="side-sub">Individuelt tilpassede erhvervspartnerskaber</p>
  </div>
  <div class="sponsor-intro">
    <p>Sponsorater tilpasses individuelt. Priser og pakker aftales direkte med Lyngbygaard Erhvervsklub.</p>
  </div>
  <div class="sponsor-fordele-grid">
    ${CONFIG.sponsorFordele.map(s=>`
    <div class="sponsor-fordel-kort">
      <div class="sf-ikon">${s.ikon}</div>
      <strong>${esc(s.titel)}</strong>
      <p>${esc(s.tekst)}</p>
    </div>`).join('')}
  </div>
  <div class="sponsor-cta-sek">
    <h2 class="sek-h">Interesseret?</h2>
    <p>Kontakt os for et uforpligtende møde om mulighederne for et sponsorat.</p>
    <button class="knap-p" onclick="navTil('kontakt')">Kontakt os →</button>
  </div>
  <div class="nuv-sponsorer">
    <h2 class="sek-h">Nuværende sponsorer</h2>
    <div id="sponsor-liste" class="sponsor-liste">
      <div class="sponsor-kort ledig"><span>Hovedsponsor — ledigt</span></div>
      <div class="sponsor-kort ledig"><span>Partner — ledigt</span></div>
    </div>
  </div>
</div>`;
}

/* ================================================================
   NYHEDER
   ================================================================ */
function pgNyheder(params = {}) {
  const nyheder = DB.get('ek_nyheder') || [];
  return `
<div class="side-nyheder">
  <div class="side-hd">
    <h1>Nyheder</h1>
    <p class="side-sub">Seneste nyt fra Lyngbygaard Erhvervsklub</p>
  </div>
  ${nyheder.length ? nyheder.map(n=>`
  <div class="nyhed-kort">
    <div class="nyhed-dato">${datoKort(n.dato||'')}</div>
    <h2 class="nyhed-titel">${esc(n.titel)}</h2>
    <p class="nyhed-tekst">${esc(n.tekst)}</p>
    ${n.link ? `<a href="${esc(n.link)}" target="_blank" rel="noopener" class="knap-sek sm">Læs mere →</a>` : ''}
  </div>`).join('') : `
  <div class="ingen-nyheder">
    <p class="muted">Ingen nyheder endnu. Kom tilbage snart.</p>
  </div>`}
</div>`;
}

/* ================================================================
   KONTAKT
   ================================================================ */
function pgKontakt(params = {}) {
  return `
<div class="side-kontakt">
  <div class="side-hd">
    <h1>Kontakt</h1>
    <p class="side-sub">Vi svarer gerne på spørgsmål om erhvervsklubben</p>
  </div>
  <div class="kontakt-grid">
    <div class="kontakt-info-sek">
      <div class="kontakt-kort">
        <h2>Lyngbygaard Erhvervsklub</h2>
        <div class="kontakt-linje"><span>📍</span><span>${esc(CONFIG.adresse)}</span></div>
        <div class="kontakt-linje"><span>📞</span><a href="tel:${CONFIG.telefon}">${esc(CONFIG.telefon)}</a></div>
        <div class="kontakt-linje"><span>✉️</span><a href="mailto:${CONFIG.email}">${esc(CONFIG.email)}</a></div>
        <div class="kontakt-linje"><span>🌐</span><a href="${CONFIG.website}" target="_blank" rel="noopener">lyg.dk</a></div>
      </div>
      <div class="kontakt-kort">
        <h3>Erhvervsklubben — Bestyrelsen</h3>
        <p class="muted">Kontakt formanden via info@lyg.dk</p>
      </div>
    </div>
    <div class="kontakt-form-sek">
      <h2 class="sek-h">Send en besked</h2>
      <form onsubmit="sendKontaktForm(event)">
        <div class="form-row"><label>Navn *</label><input type="text" id="kf-navn" class="input-felt" required></div>
        <div class="form-row"><label>E-mail *</label><input type="email" id="kf-email" class="input-felt" required></div>
        <div class="form-row"><label>Virksomhed</label><input type="text" id="kf-virk" class="input-felt"></div>
        <div class="form-row"><label>Besked *</label><textarea id="kf-besked" class="input-felt" rows="5" required></textarea></div>
        <button type="submit" class="knap-p">Send besked</button>
        <div id="kf-status" class="form-status mt1" style="display:none"></div>
      </form>
    </div>
  </div>
</div>`;
}

async function sendKontaktForm(evt) {
  evt.preventDefault();
  const statusEl = document.getElementById('kf-status');
  const navn    = document.getElementById('kf-navn')?.value?.trim();
  const email   = document.getElementById('kf-email')?.value?.trim();
  const virk    = document.getElementById('kf-virk')?.value?.trim();
  const besked  = document.getElementById('kf-besked')?.value?.trim();
  if (!navn || !email || !besked) return;
  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status info'; statusEl.textContent='Sender…'; }
  try {
    const r = await scriptFetch({ action:'kontaktHenvendelse', navn, email, virk, besked });
    if (!r.ok) throw new Error(r.fejl || 'Fejl');
    if (statusEl) { statusEl.className='form-status ok'; statusEl.textContent='Tak! Vi svarer hurtigst muligt.'; }
    evt.target.reset();
  } catch(e) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Fejl: '+e.message; }
  }
}

/* ================================================================
   ADMIN
   ================================================================ */
function pgAdmin(params = {}) {
  const loggetInd = !!DB.get('ek_admin_token');
  if (!loggetInd) {
    return `
<div class="side-admin">
  <div class="side-hd">
    <h1>Administration</h1>
  </div>
  <div class="admin-login-boks">
    <p>Admin-adgang kræver Google-login. Åbn <strong>admin.html</strong> for at logge ind.</p>
    <a href="./admin.html" class="knap-p">Gå til admin-login</a>
    <p class="muted" style="margin-top:1rem;font-size:.85rem">Kun autoriserede administratorer har adgang.</p>
  </div>
</div>`;
  }
  return `
<div class="side-admin">
  <div class="admin-hd">
    <h1>Administration</h1>
    <button class="knap-sek sm" onclick="adminLogUd()">Log ud</button>
  </div>
  <div class="admin-tabs">
    <button class="ad-tab active" onclick="skiftAdTab(this,'arr')">Arrangementer</button>
    <button class="ad-tab" onclick="skiftAdTab(this,'komm')">Kommunikation</button>
    <button class="ad-tab" onclick="skiftAdTab(this,'nyheder')">Nyheder</button>
    <button class="ad-tab" onclick="skiftAdTab(this,'inst')">Indstillinger</button>
  </div>
  <div id="ad-arr"    class="ad-panel">${adArr()}</div>
  <div id="ad-komm"   class="ad-panel" style="display:none">${adKomm()}</div>
  <div id="ad-nyheder" class="ad-panel" style="display:none">${adNyheder()}</div>
  <div id="ad-inst"   class="ad-panel" style="display:none">${adInst()}</div>
</div>`;
}

function checkAdminLogin() {
  if (!DB.get('ek_admin_token')) return;
  // Hent arrangement-data fra backend
  adminFetch({ action:'adminHentAlt' }).then(r => {
    if (r.ok) {
      if (r.arr) DB.set('ek_arr_backend', r.arr);
      if (r.nyheder) DB.set('ek_nyheder', r.nyheder);
    }
  }).catch(()=>{});
}

function adminLogUd() {
  DB.del('ek_admin_token');
  navTil('forside');
}

function skiftAdTab(el, panel) {
  document.querySelectorAll('.ad-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ad-panel').forEach(p=>p.style.display='none');
  el.classList.add('active');
  const panelEl = document.getElementById('ad-'+panel);
  if (panelEl) panelEl.style.display = 'block';
}

function adArr() {
  const arr = hentAktiveArr();
  return `
<div class="ad-sek">
  <h3 class="ad-sek-h">Arrangementer 2027</h3>
  <p class="muted mb1">Arrangementer hentes automatisk fra Google Sheets. Redigér direkte i arket via Apps Script.</p>
  <div class="arr-liste-admin">
    ${arr.map(a=>`
    <div class="arr-kort-admin">
      <div class="aka-dato">${datoKort(a.dato)}</div>
      <div class="aka-info">
        <strong>${esc(a.titel)}</strong>
        <span class="muted">${esc(a.type)} · Maks ${a.maks}</span>
      </div>
      <span class="aka-status ${a.status==='aflyst'?'aflyst':''}">${esc(a.status)}</span>
    </div>`).join('')}
  </div>
  <button class="knap-sek sm mt1" onclick="syncArrFraBackend()">Hent fra Google Sheets</button>
  <div id="arr-sync-status" class="form-status mt1" style="display:none"></div>
</div>`;
}

async function syncArrFraBackend() {
  const statusEl = document.getElementById('arr-sync-status');
  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status info'; statusEl.textContent='Henter…'; }
  try {
    const r = await adminFetch({ action:'adminHentArr' });
    if (!r.ok) throw new Error(r.fejl);
    if (r.arr) DB.set('ek_arr_backend', r.arr);
    if (statusEl) { statusEl.className='form-status ok'; statusEl.textContent=`Hentet ${(r.arr||[]).length} arrangementer ✓`; }
    navTil('admin');
  } catch(e) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Fejl: '+e.message; }
  }
}

function adKomm() {
  const cfOk = CONFIG.pushWorkerUrl && !CONFIG.pushWorkerUrl.startsWith('INDSÆT');
  return `
<div class="ad-sek" style="border-left:4px solid ${cfOk?'#22c55e':'#b8973a'}">
  <h3 class="ad-sek-h">🔔 Web Push — Cloudflare Worker</h3>
  <div class="push-info-boks">
    <p><strong>${cfOk?'✅ Cloudflare Worker konfigureret':'⚠️ Cloudflare Worker ikke konfigureret'}</strong></p>
    ${cfOk ? `<p>Push sendes via CF Worker: <code>${esc(CONFIG.pushWorkerUrl)}</code></p>`
           : `<p>Sæt <code>CONFIG.pushWorkerUrl</code> i app.js til din CF Worker URL. Se installationsvejledningen.</p>`}
  </div>
  <div style="margin-top:1rem">
    <h4>Aktive push-abonnementer</h4>
    <div id="push-abonnenter-vis">Henter…</div>
    <button class="knap-sek sm" onclick="hentPushAbonnenter()">Opdater</button>
  </div>
</div>

<div class="ad-sek">
  <h3 class="ad-sek-h">⏰ Automatiske påmindelser</h3>
  <p class="muted mb1">Sendes automatisk via daglig trigger i Apps Script (e-mail + push).</p>
  <div class="paamind-grid">
    <div class="paamind-kort"><strong>7 dage før tilmeldingsfrist</strong><span class="muted">E-mail + push til tilmeldte</span></div>
    <div class="paamind-kort"><strong>3 dage før tilmeldingsfrist</strong><span class="muted">E-mail + push til tilmeldte</span></div>
    <div class="paamind-kort"><strong>1 dag før arrangement</strong><span class="muted">E-mail + push til tilmeldte</span></div>
  </div>
  <h4 style="margin-top:1.5rem">Forventede udsendelser (næste 30 dage)</h4>
  <div id="paamind-preview-vis">Henter…</div>
  <button class="knap-sek sm" onclick="hentPaamindPreview()">Opdater preview</button>
</div>

<div class="ad-sek">
  <h3 class="ad-sek-h">✉️ Send manuel besked</h3>
  <form onsubmit="sendManuelBesked(event)">
    <div class="form-row">
      <label>Målgruppe</label>
      <select id="mb-maalgruppe" class="input-felt">
        <option value="alle_medl">Alle erhvervsmedlemmer</option>
      </select>
    </div>
    <div class="form-row">
      <label>Kanal</label>
      <select id="mb-kanal" class="input-felt">
        <option value="begge">E-mail + push (begge)</option>
        <option value="email">Kun e-mail</option>
        <option value="push">Kun push-notifikation</option>
      </select>
    </div>
    <div class="form-row">
      <label>Emne</label>
      <input type="text" id="mb-emne" class="input-felt" required placeholder="Emne…">
    </div>
    <div class="form-row">
      <label>Indhold</label>
      <textarea id="mb-indhold" class="input-felt" rows="5" required placeholder="Skriv beskeden…"></textarea>
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
      <button type="submit" class="knap-p">Send besked</button>
      <button type="button" class="knap-sek" onclick="sendTestBesked()">Send testbesked</button>
    </div>
    <div id="mb-status" class="form-status mt1" style="display:none"></div>
  </form>
</div>

<div class="ad-sek">
  <h3 class="ad-sek-h">📋 Sendehistorik</h3>
  <div id="email-historik-vis">Henter…</div>
  <button class="knap-sek sm" onclick="hentEmailHistorik()">Opdater</button>
</div>`;
}

function adNyheder() {
  const nyheder = DB.get('ek_nyheder') || [];
  return `
<div class="ad-sek">
  <h3 class="ad-sek-h">Nyheder</h3>
  <form onsubmit="opretNyhed(event)">
    <div class="form-row"><label>Overskrift</label><input type="text" id="ny-titel" class="input-felt" required></div>
    <div class="form-row"><label>Tekst</label><textarea id="ny-tekst" class="input-felt" rows="4" required></textarea></div>
    <div class="form-row"><label>Link (valgfrit)</label><input type="url" id="ny-link" class="input-felt"></div>
    <button type="submit" class="knap-p">Publicér nyhed</button>
    <div id="ny-status" class="form-status mt1" style="display:none"></div>
  </form>
  <div class="nyhed-admin-liste mt1">
    ${nyheder.map((n,i)=>`
    <div class="nyhed-admin-kort">
      <strong>${esc(n.titel)}</strong>
      <span class="muted">${datoKort(n.dato||'')}</span>
      <button class="knap-sek sm" onclick="sletNyhed(${i})">Slet</button>
    </div>`).join('') || '<p class="muted">Ingen nyheder.</p>'}
  </div>
</div>`;
}

async function opretNyhed(evt) {
  evt.preventDefault();
  const titel = document.getElementById('ny-titel')?.value?.trim();
  const tekst = document.getElementById('ny-tekst')?.value?.trim();
  const link  = document.getElementById('ny-link')?.value?.trim();
  const statusEl = document.getElementById('ny-status');
  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status info'; statusEl.textContent='Gemmer…'; }
  try {
    const r = await adminFetch({ action:'adminOpretNyhed', titel, tekst, link });
    if (!r.ok) throw new Error(r.fejl);
    const nyheder = DB.get('ek_nyheder') || [];
    nyheder.unshift({ titel, tekst, link, dato: new Date().toISOString().slice(0,10) });
    DB.set('ek_nyheder', nyheder);
    if (statusEl) { statusEl.className='form-status ok'; statusEl.textContent='Nyhed publiceret ✓'; }
    evt.target.reset();
  } catch(e) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Fejl: '+e.message; }
  }
}

function sletNyhed(idx) {
  if (!confirm('Slet denne nyhed?')) return;
  const nyheder = (DB.get('ek_nyheder')||[]).filter((_,i)=>i!==idx);
  DB.set('ek_nyheder', nyheder);
  adminFetch({ action:'adminSletNyhed', idx }).catch(()=>{});
  navTil('admin');
}

function adInst() {
  return `
<div class="ad-sek">
  <h3 class="ad-sek-h">Indstillinger</h3>
  <div class="inst-info">
    <p><strong>Apps Script URL:</strong> <code>${CONFIG.scriptUrl.startsWith('INDSÆT') ? '⚠️ Ikke konfigureret' : '✅ Konfigureret'}</code></p>
    <p><strong>Push Worker:</strong> <code>${CONFIG.pushWorkerUrl || '⚠️ Ikke konfigureret'}</code></p>
  </div>
  <div class="form-row mt1">
    <label>GolfBox URL</label>
    <input type="url" id="inst-golfbox" class="input-felt" value="${esc(DB.get('ek_golfbox')||CONFIG.golfboxUrl)}">
  </div>
  <button class="knap-p" onclick="gemInstillinger()">Gem indstillinger</button>
  <div id="inst-status" class="form-status mt1" style="display:none"></div>
</div>`;
}

function gemInstillinger() {
  const golfbox = document.getElementById('inst-golfbox')?.value?.trim();
  if (golfbox) DB.set('ek_golfbox', golfbox);
  const statusEl = document.getElementById('inst-status');
  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status ok'; statusEl.textContent='Gemt ✓'; }
}

/* ================================================================
   MERE-OVERLAY
   ================================================================ */
function pgMere() {
  return `<div class="side-mere"><p>Vælg fra menuen herover.</p></div>`;
}

/* ================================================================
   PUSH-NOTIFIKATIONER
   ================================================================ */
async function opdaterPushKnap() {
  const knap = document.getElementById('push-knap');
  const status = document.getElementById('push-status-vis');
  if (!knap || !status) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    status.innerHTML = '<p class="muted">Push-notifikationer understøttes ikke i denne browser.</p>';
    knap.style.display = 'none';
    return;
  }
  const perm = Notification.permission;
  if (perm === 'granted') {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      status.innerHTML = '<p style="color:#22c55e">✓ Push-notifikationer er aktiveret</p>';
      knap.textContent = 'Deaktiver notifikationer';
    } else {
      status.innerHTML = '<p class="muted">Push-notifikationer er ikke aktiveret</p>';
      knap.textContent = 'Aktiver notifikationer';
    }
  } else if (perm === 'denied') {
    status.innerHTML = '<p class="muted">Push-notifikationer er blokeret af browseren. Tillad dem i browserindstillinger.</p>';
    knap.style.display = 'none';
  } else {
    status.innerHTML = '';
    knap.textContent = 'Aktiver notifikationer';
  }
}

async function togglePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await afmeldPush(sub);
  } else {
    await abonnerPush();
  }
}

async function abonnerPush() {
  const email = brugerEmail();
  if (!email) {
    alert('Tilmeld dig et arrangement først for at aktivere push-notifikationer. Din e-mail bruges som ID.');
    return;
  }
  try {
    // Hent VAPID public key fra CF Worker først, derefter Apps Script
    let vapidPublicKey = null;
    if (CONFIG.pushWorkerUrl) {
      try {
        const r = await fetch(CONFIG.pushWorkerUrl + '/public-key');
        const d = await r.json();
        if (d.ok && d.publicKey) vapidPublicKey = d.publicKey;
      } catch(e) { console.warn('[Push] CF Worker ikke tilgængelig'); }
    }
    if (!vapidPublicKey) {
      const r = await scriptGet({ action:'getVapidPublicKey' });
      if (!r.ok) throw new Error(r.fejl || 'Kunne ikke hente push-konfiguration');
      vapidPublicKey = r.vapidPublicKey;
    }
    if (!vapidPublicKey) throw new Error('Ingen VAPID public key tilgængelig');

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    const r = await scriptFetch({ action:'registrerPushSubscription', email, subscription: sub.toJSON() });
    if (!r.ok) throw new Error(r.fejl || 'Kunne ikke gemme abonnement');
    DB.set('ek_push_sub', sub.toJSON());
    opdaterPushKnap();
  } catch(e) {
    console.error('[Push]', e);
    alert('Push-notifikationer kunne ikke aktiveres: ' + e.message);
  }
}

async function afmeldPush(sub) {
  const email = brugerEmail();
  await sub.unsubscribe();
  DB.del('ek_push_sub');
  if (email) {
    scriptFetch({ action:'afmeldPushSubscription', email }).catch(()=>{});
  }
  opdaterPushKnap();
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

/* ================================================================
   ADMIN — KOMMUNIKATION
   ================================================================ */
async function hentPushAbonnenter() {
  const el = document.getElementById('push-abonnenter-vis');
  if (!el) return;
  el.textContent = 'Henter…';
  try {
    const r = await adminFetch({ action:'adminHentPushAbonnenter' });
    if (!r.ok) throw new Error(r.fejl);
    if (!r.abonnenter?.length) { el.innerHTML = '<p class="muted">Ingen aktive push-abonnementer.</p>'; return; }
    el.innerHTML = `<p><strong>${r.abonnenter.length}</strong> aktive abonnementer</p>
    <table class="ad-tbl"><thead><tr><th>E-mail</th><th>Dato</th><th>Status</th></tr></thead>
    <tbody>${r.abonnenter.map(a=>`<tr><td>${esc(a.email)}</td><td>${esc(a.dato)}</td><td>${esc(a.status)}</td></tr>`).join('')}
    </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="muted" style="color:#ef4444">Fejl: ${esc(e.message)}</p>`; }
}

async function hentPaamindPreview() {
  const el = document.getElementById('paamind-preview-vis');
  if (!el) return;
  el.textContent = 'Henter…';
  try {
    const r = await adminFetch({ action:'adminHentPaamindPreview' });
    if (!r.ok) throw new Error(r.fejl);
    if (!r.preview?.length) { el.innerHTML = '<p class="muted">Ingen forventede udsendelser i de næste 30 dage.</p>'; return; }
    el.innerHTML = `<table class="ad-tbl"><thead><tr><th>Dato</th><th>Arrangement</th><th>Type</th></tr></thead>
    <tbody>${r.preview.map(p=>`<tr><td>${esc(p.udsendelsesDato)}</td><td>${esc(p.arrTitel)}</td><td>${esc(p.type)}</td></tr>`).join('')}
    </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="muted" style="color:#ef4444">Fejl: ${esc(e.message)}</p>`; }
}

async function sendManuelBesked(evt) {
  evt.preventDefault();
  const statusEl   = document.getElementById('mb-status');
  const maalgruppe = document.getElementById('mb-maalgruppe')?.value || 'alle_medl';
  const kanal      = document.getElementById('mb-kanal')?.value || 'begge';
  const emne       = document.getElementById('mb-emne')?.value?.trim();
  const indhold    = document.getElementById('mb-indhold')?.value?.trim();
  if (!emne || !indhold) {
    if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status fejl'; statusEl.textContent='Udfyld emne og indhold.'; }
    return;
  }
  const kanalTekst = kanal==='email'?'kun e-mail':kanal==='push'?'kun push':'e-mail + push';
  if (!confirm(`Bekræft: Send besked (${kanalTekst}) til alle erhvervsmedlemmer?\n\nEmne: ${emne}`)) return;
  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status info'; statusEl.textContent='Sender…'; }
  try {
    const r = await adminFetch({ action:'adminSendManuelBesked', maalgruppe, emne, indhold, kanal });
    if (!r.ok) throw new Error(r.fejl);
    if (statusEl) { statusEl.className='form-status ok'; statusEl.textContent=`✓ Sendt til ${r.modtagere||0} modtagere (${r.emailSendt||0} e-mails, ${r.pushSendt||0} push).`; }
  } catch(e) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Fejl: '+e.message; }
  }
}

async function sendTestBesked() {
  const statusEl = document.getElementById('mb-status');
  const kanal = document.getElementById('mb-kanal')?.value || 'begge';
  const emne  = document.getElementById('mb-emne')?.value?.trim() || 'Testbesked v8.9';
  const indhold = document.getElementById('mb-indhold')?.value?.trim() || 'Dette er en testbesked fra LYG Erhvervsklub v8.9';
  if (statusEl) { statusEl.style.display='block'; statusEl.className='form-status info'; statusEl.textContent='Sender testbesked…'; }
  try {
    const r = await adminFetch({ action:'adminSendTestBesked', emne, indhold, kanal, type:'manuel' });
    if (!r.ok) throw new Error(r.fejl || 'Sæt TEST_EMAIL i Script Properties');
    if (statusEl) { statusEl.className='form-status ok'; statusEl.textContent=`✓ Testbesked (${kanal}) sendt til ${esc(r.testEmail)}`; }
  } catch(e) {
    if (statusEl) { statusEl.className='form-status fejl'; statusEl.textContent='Fejl: '+e.message; }
  }
}

async function hentEmailHistorik() {
  const el = document.getElementById('email-historik-vis');
  if (!el) return;
  el.textContent = 'Henter…';
  try {
    const r = await adminFetch({ action:'adminHentEmailHistorik' });
    if (!r.ok) throw new Error(r.fejl);
    if (!r.historik?.length) { el.innerHTML = '<p class="muted">Ingen historik.</p>'; return; }
    el.innerHTML = `<table class="ad-tbl"><thead><tr><th>Dato</th><th>Emne</th><th>Modtagere</th><th>Kanal</th></tr></thead>
    <tbody>${r.historik.map(h=>`<tr><td>${esc(h.dato)}</td><td>${esc(h.emne)}</td><td>${h.modtagere}</td><td>${esc(h.kanal||'email')}</td></tr>`).join('')}
    </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="muted" style="color:#ef4444">Fejl: ${esc(e.message)}</p>`; }
}

/* ================================================================
   APP OPDATERING
   ================================================================ */
let nySW = null;
function opdaterApp() {
  if (nySW) { nySW.postMessage({ type:'SKIP_WAITING' }); }
  window.location.reload();
}

/* ================================================================
   PWA — SERVICE WORKER REGISTRERING
   ================================================================ */
let installPromptEvt = null;

function registrerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js?v=8.9')
    .then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            nySW = newWorker;
            const banner = document.getElementById('update-banner');
            if (banner) banner.style.display = 'flex';
          }
        });
      });
    }).catch(e => console.warn('[SW]', e));

  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPromptEvt = e;
    if (!DB.get('ek_install_afvist')) {
      const banner = document.getElementById('install-banner');
      if (banner) banner.style.display = 'flex';
    }
  });

  // iOS install-guide
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode:standalone)').matches || navigator.standalone;
  if (isIos && !isStandalone && !DB.get('ek_ios_guide_vist')) {
    setTimeout(() => {
      const modal = document.getElementById('ios-install-modal');
      if (modal) modal.style.display = 'flex';
    }, 3000);
  }
}

async function installApp() {
  if (!installPromptEvt) return;
  installPromptEvt.prompt();
  await installPromptEvt.userChoice;
  installPromptEvt = null;
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
}

function afvisInstall() {
  DB.set('ek_install_afvist', true);
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
}

function afvisIosInstall() {
  DB.set('ek_ios_guide_vist', true);
  const modal = document.getElementById('ios-install-modal');
  if (modal) modal.style.display = 'none';
}

/* ================================================================
   INTRO-ANIMATION
   ================================================================ */
function visIntro() {
  if (DB.get('ek_intro_vist_v89')) { springIntroOver(); return; }
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) { springIntroOver(); return; }
  overlay.style.display = 'flex';
  setTimeout(() => { overlay.classList.add('intro-aktiv'); }, 100);
  setTimeout(() => springIntroOver(), 3800);
}

function springIntroOver() {
  DB.set('ek_intro_vist_v89', true);
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .4s';
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
  }
  const splash = document.getElementById('splash');
  if (splash) { splash.style.opacity = '0'; setTimeout(()=>{ splash.style.display='none'; }, 400); }
}

/* ================================================================
   NAVIGATION-SETUP
   ================================================================ */
function setupNav() {
  document.querySelectorAll('#bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const side = btn.dataset.side;
      if (!side) return;
      navTil(side);
    });
  });
}

/* ================================================================
   INIT
   ================================================================ */
function init() {
  // Migration backup
  if (!DB.get('ek_v89_init')) {
    DB.set('ek_tilm', DB.get('ek_tilm') || []);
    DB.set('ek_v89_init', { dato: new Date().toISOString(), fra: 'v8.9' });
    console.log('[v8.9] Initialiseret');
  }

  setupNav();
  registrerSW();

  // Push-service worker message handler
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', evt => {
      if (evt.data?.type === 'PUSH_RECEIVED') {
        console.log('[Push] modtaget:', evt.data);
      }
    });
  }

  // Skjul splash og vis intro
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity .3s';
      setTimeout(() => { splash.style.display = 'none'; visIntro(); }, 300);
    }
  }, 800);

  // Start på forside
  navTil('forside');
  opdaterInfoBjaelke();
}

document.addEventListener('DOMContentLoaded', init);
