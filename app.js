/* ================================================================
   LYNGBYGAARD ERHVERVSKLUB — app.js v7.2
   Al konfiguration samlet øverst. Ret her – ingen andre steder.

   CHANGELOG v7.0 (fra v6.2):
   · Klubhusbillede som hero (klubhus-hero.jpg) — ikke golfspiller
   · Golfbold-animation: 3 bolde ruller diskret hen over græs
   · Golfer-scene skjult på desktop (≥900px) — vises kun under animation
   · Informationsbjælke: fast over bundnav (mobil), bund af indhold (desktop)
   · SVG-ikoner i navigation (hus, kalender, person+plus, golf, hjerte, gruppe, boble, gear)
   · Hero-højde begrænset: 340px desktop, 52vw mobil — ingen dominerende lodret visning
   · Service Worker bumped: lyg-erhverv-v7.0
   · Cache-busting: ?v=7.0 på alle assets
   · Alle v6.2-funktioner bevaret uændret:
     — Supabase booking (atomisk RPC), kontaktformular, Auth
     — GolfBox-integration (https://golfbox.golf/)
     — localStorage-nøgler (ek_*) uændrede
     — Push deaktiveret indtil backend klar
   ================================================================ */

const CONFIG = {
  klubNavn:  'Lyngbygaard Erhvervsklub',
  tagline:   'Erhverv, netværk og golfoplevelser i Lyngbygaard Golf',
  adresse:   'Lyngbygårdsvej 29, 8220 Brabrand',
  telefon:   '87 44 10 70',
  email:     'info@lyg.dk',
  website:   'https://lyg.dk',

  /* GolfBox direkte login — redigeres i Admin → Indstillinger */
  golfboxUrl: 'https://golfbox.golf/',

  heroTekst:   'Erhverv, netværk og golfoplevelser',
  heroUnder:   'Lyngbygaard Erhvervsklub samler virksomheder i Aarhus-regionen om golf, relationer og fællesskab.',
  heroBillede: './images/ek-arrangement.jpg',

  /* ⚠️  SIKKERHED: adminKode er KUN en fallback til lokal test.
     I produktion bruges Supabase Auth (se admin-login nedenfor).
     Koden er stadig synlig i JS — brug aldrig produktionskode her. */
  adminKode: '1234',

  /* ── Supabase ────────────────────────────────────────────────
     Fælles database for alle brugere. Projekt: lyg-erhvervsklub
     Region: eu-central-1
     ─────────────────────────────────────────────────────────── */
  supabaseUrl:  'https://csjsauqjfmknqmmjodqp.supabase.co',
  supabaseAnon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzanNhdXFqZm1rbnFtbWpvZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMDM4NDgsImV4cCI6MjEwNzc3OTg0OH0.aOJW-V_AOjB5o91TDOPyrxs0b6xqlFvm_E2v6utnqIs',

  /* Push: DEAKTIVERET indtil backend er etableret og testet.
     Indsæt VAPID-nøgle og aktiver her, når Supabase Edge Function
     til push-scheduler er konfigureret (se MIGRATIONSGUIDE.md). */
  vapidPublic:  'INDSÆT_DIN_VAPID_PUBLIC_KEY',

  golfPakker: [
    { id:'gp1', titel:'Kundearrangement',   pris:'Fra 2.800 kr./hold',     beskrivelse:'Eksklusiv oplevelse til jeres vigtigste kunder. Golf, VIP-service og middag i professionelle rammer.',  inkl:['9 eller 18 huller golf','VIP-velkomst','Middag på klubhuset','Fotoservice'] },
    { id:'gp2', titel:'Medarbejderdag',     pris:'Fra 1.900 kr./person',   beskrivelse:'Giv dine medarbejdere en dag de husker — med golf, samvær og god stemning.',                            inkl:['9 huller golf','Forfriskninger undervejs','Afslutningsfest','Overraskelser'] },
    { id:'gp3', titel:'Netværksdag',        pris:'Fra 1.500 kr./person',   beskrivelse:'Bring dine samarbejdspartnere sammen i uformelle, professionelle rammer med golf som omdrejningspunkt.', inkl:['Golf eller aktivitet','Frokost og netværk','Opfølgningsmuligheder','Fleksibelt program'] },
    { id:'gp4', titel:'Møde + Golf',        pris:'Fra 2.200 kr./hold',     beskrivelse:'Kombinér et kort strategimøde med en runde golf. Ideelt til bestyrelsesdage og ledergrupper.',           inkl:['Mødelokale 2 timer','9 huller golf','Forplejning','Fleksibel dagorden'] },
    { id:'gp5', titel:'Company Day',        pris:'Fra 4.500 kr./hold',     beskrivelse:'En hel dag på banen med morgenmad, frokost og 18 huller. Perfekt til teambuilding og kundepleje.',      inkl:['18 huller golf','Morgenmad & frokost','Golfvogn inkl.','Priser & diplomer'] },
    { id:'gp6', titel:'VIP-arrangement',    pris:'Tilbud på forespørgsel', beskrivelse:'Skræddersyet VIP-oplevelse til særlige gæster, jubilæer eller eksklusive anledninger.',                inkl:['Fuld personlig service','Gourmetmiddag','Eksklusivt program','Caddie inkl.'] }
  ],

  sponsorFordele: [
    { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>', titel:'Synlighed',       tekst:'Logo på bane, hjemmeside, app og ved alle arrangementer.' },
    { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', titel:'Netværk',         tekst:'Adgang til eksklusive erhvervsarrangementer og sponsor-lounge.' },
    { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>', titel:'Golf & events',   tekst:'Greenfee-invitationer, turneringer og firmaarrangementer.' },
    { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>', titel:'PR & omtale',    tekst:'Omtale i nyhedsbrev, sociale medier og lokal presse.' },
    { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', titel:'Direkte adgang', tekst:'Mød beslutningstagere fra 100+ virksomheder i Aarhus-regionen.' },
    { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>', titel:'Prestige',        tekst:'Stærk associering med Lyngbygaard Golf og lokalt erhvervsliv.' }
  ],

  omEK: {
    tagline: 'Professionelle rammer. Uformelt fællesskab.',
    tekst:   'Erhvervsklubben samler virksomheder og beslutningstagere om relationer, netværk og golf.',
    punkter: [
      { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', titel:'Netværk',           tekst:'Mød 100+ virksomheder fra Aarhus-regionen.' },
      { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', titel:'Relationer',         tekst:'Byg stærke forretningsrelationer i afslappede rammer.' },
      { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>', titel:'Golf & oplevelser',  tekst:'Turneringer, EK-mesterskaber og udlandsrejser.' },
      { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>', titel:'Sponsorværdi',       tekst:'Synlighed og associering med Lyngbygaard Golf.' },
      { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>', titel:'EK-mesterskabet',    tekst:'Årets sportslige højdepunkt for erhvervsmedlemmer.' },
      { ikon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>', titel:'10+ events/år',      tekst:'Fra SIM Golf til julefrokost og udlandsrejser.' }
    ]
  },

  /* Billeder: KUN autentiske Lyngbygaard-billeder.
     Ingen stockfotos. Ingen Unsplash. Ingen AI-billeder.
     Manglende billeder → tekst-bi-kort i klubbens farver. */
  billeder: {
    hero:     './images/klubhus-hero.jpg',
    ek:       './images/ek-arrangement.jpg',
    golf1:    '',   // ikke tilgængeligt — tekst-bi-kort vises
    golf2:    '',   // ikke tilgængeligt — tekst-bi-kort vises
    netvaerk: '',   // ikke tilgængeligt — tekst-bi-kort vises
    sponsor:  '',   // ikke tilgængeligt — tekst-bi-kort vises
    kontakt:  ''    // ikke tilgængeligt — tekst-bi-kort vises
  }
};

/* ================================================================
   SUPABASE KLIENT
   Initialiseres fra CONFIG. Hvis URL mangler → null → localStorage bruges.
   ================================================================ */
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnon) return null;
  try {
    const { createClient } = window.supabase || {};
    if (!createClient) return null;
    _supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnon);
    return _supabase;
  } catch (e) {
    console.warn('[Supabase] Klient fejlede:', e);
    return null;
  }
}

/* ── Standard arrangementer ── */
const STD_ARR = [
  { id:'a1',  dato:'2026-02-04', tid:'',            titel:'Høj Sol over Aarhus',          sted:'Hermans, Tivoli Friheden',          type:'Koncert / netværk',   besk:'Årets første erhvervsarrangement med musik og netværk.',  maks:80, tlm:0, status:'aaben', aaben:true },
  { id:'a2',  dato:'2026-03-04', tid:'16.00-21.00', titel:'SIM Golf',                     sted:'Golfarena Aarhus',                   type:'Golf / netværk',      besk:'Netværk og konkurrence på indoor simulator-bane.',        maks:24, tlm:0, status:'aaben', aaben:true },
  { id:'a3',  dato:'2026-03-18', tid:'16.00-21.00', titel:'SIM Golf',                     sted:'Golfarena Aarhus',                   type:'Golf / netværk',      besk:'Netværk og konkurrence på indoor simulator-bane.',        maks:24, tlm:0, status:'aaben', aaben:true },
  { id:'a4',  dato:'2026-03-24', tid:'',            titel:'Byudvikling & Bajere',          sted:'Aarhus',                             type:'Netværksarrangement', besk:'Uformel debat og netværk om byudvikling i Aarhus.',       maks:50, tlm:0, status:'aaben', aaben:true },
  { id:'a5',  dato:'2026-04-22', tid:'',            titel:'Hjemmekamp mod Himmerland BC',  sted:'Lyngbygaard Golf',                   type:'Golf / netværk',      besk:'Venlighedskamp og netværk med Himmerland Business Club.', maks:40, tlm:0, status:'aaben', aaben:true },
  { id:'a6',  dato:'2026-05-01', tid:'',            titel:'Udlandsrejse — Skotland',       sted:'Skotland',                           type:'Golfrejse',           besk:'Golfrejse til Skotland 1.–4. maj 2026.',                  maks:20, tlm:0, status:'aaben', aaben:true },
  { id:'a7',  dato:'2026-06-02', tid:'',            titel:'Tysklandstur',                  sted:'Timmendorfer Strand',                type:'Golfrejse',           besk:'Golfrejse til Timmendorfer Strand 2.–3. juni 2026.',      maks:20, tlm:0, status:'aaben', aaben:true },
  { id:'a8',  dato:'2026-08-14', tid:'',            titel:'Danish Golf Championship',      sted:'Great Northern',                     type:'Golfoplevelse',       besk:'Se årets store golfchampionship med erhvervsklubben.',    maks:30, tlm:0, status:'aaben', aaben:true },
  { id:'a9',  dato:'2026-09-01', tid:'',            titel:'Jyllandstur',                   sted:'Nordvestjysk & Holstebro Golfklub',  type:'Golfrejse',           besk:'Jyllandstur 1.–2. september med golf på to baner.',       maks:24, tlm:0, status:'aaben', aaben:true },
  { id:'a10', dato:'2026-10-09', tid:'',            titel:'EK-Mesterskaberne',              sted:'Silkeborg Ry Golfklub',              type:'Mesterskab',          besk:'Erhvervsklubbens eget mesterskab — hvem vinder?',         maks:48, tlm:0, status:'aaben', aaben:true },
  { id:'a11', dato:'2026-11-20', tid:'',            titel:'Julefrokost & Gokart',           sted:'Racehall Aarhus',                    type:'Socialt arrangement', besk:'Julefrokost med gokart — årets hyggeligste event.',        maks:60, tlm:0, status:'aaben', aaben:true }
];

const STD_SPONSORER = [
  { id:'s1', navn:'Hovedsponsor — ledigt', logo:'', link:'#', niveau:'guld' },
  { id:'s2', navn:'Partner — ledigt',      logo:'', link:'#', niveau:'sølv' }
];

/* ================================================================
   STORAGE
   ================================================================ */
const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn('[DB]', e); } },
  del: k => localStorage.removeItem(k)
};

/* ── Sikker migrationsbackup: gemmer snapshot af eksisterende data ──
   Køres én gang ved skift til ny version. Overskriv ALDRIG eksisterende data. */
function migrationBackup() {
  const MIGRATION_KEY = 'ek_migration_v62';
  if (DB.get(MIGRATION_KEY)) return; // allerede kørt
  const nøgler = ['ek_arr','ek_tilm','ek_kode','ek_sponsorer','ek_pakker',
                   'ek_golfbox','ek_hero','ek_beskeder'];
  const snapshot = {};
  nøgler.forEach(k => { const v = DB.get(k); if (v !== null) snapshot[k] = v; });
  if (Object.keys(snapshot).length > 0) {
    snapshot._dato = new Date().toISOString();
    DB.set(MIGRATION_KEY, snapshot);
    console.log('[v6.2] Migrationsbackup gemt ✓');
  }
  DB.set(MIGRATION_KEY, snapshot._dato ? snapshot : { _dato: new Date().toISOString(), _tom: true });
}

function init() {
  if (!DB.get('ek_init')) {
    DB.set('ek_arr',       STD_ARR);
    DB.set('ek_sponsorer', STD_SPONSORER);
    DB.set('ek_tilm',      []);
    DB.set('ek_kode',      CONFIG.adminKode);
    DB.set('ek_hero',      { tekst:CONFIG.heroTekst, under:CONFIG.heroUnder, billede:CONFIG.heroBillede });
    DB.set('ek_pakker',    CONFIG.golfPakker);
    DB.set('ek_golfbox',   CONFIG.golfboxUrl);
    DB.set('ek_init',      true);
  }
}

/* ================================================================
   HELPERS
   ================================================================ */
function getArr()       { return (DB.get('ek_arr')||[]).sort((a,b)=>a.dato.localeCompare(b.dato)); }
function getKode()      { return DB.get('ek_kode')||CONFIG.adminKode; }
function getGolfboxUrl(){ return DB.get('ek_golfbox')||CONFIG.golfboxUrl; }

function fmtDato(iso) {
  if (!iso) return '';
  return new Date(iso+'T12:00:00').toLocaleDateString('da-DK',{day:'numeric',month:'long',year:'numeric'});
}

/*
  erFremtidig: sammenligner ISO-datostrenge direkte (YYYY-MM-DD >= YYYY-MM-DD).
  Dette er timezone-uafhængigt og fungerer korrekt overalt.
  En dato er fremtidig hvis den er >= dags dato (inkl. idag).
*/
function idag() {
  return new Date().toISOString().split('T')[0]; // "2026-06-22"
}
function erFremtidig(dato) {
  return dato >= idag();
}

function ledigePladser(a) { return Math.max(0, a.maks - a.tlm); }

function esc(str) {
  return String(str||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ================================================================
   MERE-OVERLAY (mobil navigation)
   ================================================================ */
function aabMere() {
  const overlay = document.getElementById('mere-overlay');
  const baggrund = document.getElementById('mere-baggrund');
  if (overlay) { overlay.classList.add('vis'); overlay.setAttribute('aria-hidden','false'); }
  if (baggrund) baggrund.classList.add('vis');
}
function lukkMere() {
  const overlay = document.getElementById('mere-overlay');
  const baggrund = document.getElementById('mere-baggrund');
  if (overlay) { overlay.classList.remove('vis'); overlay.setAttribute('aria-hidden','true'); }
  if (baggrund) baggrund.classList.remove('vis');
}
/* Luk overlay ved Escape */
document.addEventListener('keydown', e => { if (e.key === 'Escape') lukkMere(); });

/* ================================================================
   ROUTER
   ================================================================ */
let side = 'forside';

function navTil(s, data) {
  side = s;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active', el.dataset.side===s));
  const main = document.getElementById('main-content');
  switch(s) {
    case 'forside':    main.innerHTML = pgForside();  break;
    case 'kalender':   main.innerHTML = pgKalender(); break;
    case 'arr':        main.innerHTML = pgArr(data);   break;
    case 'tilmelding': main.innerHTML = pgTilm(data); break;
    case 'golfarr':    main.innerHTML = pgGolf();     break;
    case 'sponsor':    main.innerHTML = pgSponsor();  break;
    case 'om':         main.innerHTML = pgOm();       break;
    case 'kontakt':    main.innerHTML = pgKontakt();  break;
    case 'admin':      main.innerHTML = pgAdmin();    break;
  }
  bindAll();
  window.scrollTo(0,0);
  if (s === 'forside') setTimeout(startHeroAnimation, 50);
  opdaterInfoBjaelke();
}

/* ================================================================
   INFORMATIONSBJÆLKE — næste arrangement
   Vises på alle sider. Opdateres ved hvert sidesskift.
   ================================================================ */
function opdaterInfoBjaelke() {
  const el = document.getElementById('info-bjaelke');
  if (!el) return;

  /* Find næste arrangement — prioritér åbne med ledige pladser, ellers første fremtidige */
  const alleArr  = getArr().filter(a => erFremtidig(a.dato));
  const næsteArr = alleArr.find(a => a.aaben && ledigePladser(a) > 0) || alleArr[0];
  if (!næsteArr) { el.style.display = 'none'; return; }

  const dato     = fmtDato(næsteArr.dato);
  const ledig    = næsteArr.maks ? ledigePladser(næsteArr) : null;
  const fristTxt = næsteArr.frist ? ` · Frist ${fmtDato(næsteArr.frist)}` : '';
  const ledigTxt = (ledig !== null && næsteArr.aaben) ? ` · ${ledig} pladser` : '';
  const metaTxt  = `${dato}${fristTxt}${ledigTxt}`;

  /* Kombineret tekst til marquee (dublet = seamless loop) */
  const marqueeTekst = `${esc(næsteArr.titel)} · ${metaTxt}`;

  el.innerHTML = `
    <button class="ib-indre" onclick="navTil('tilmelding',{id:'${næsteArr.id}'})" aria-label="Gå til ${esc(næsteArr.titel)}">
      <span class="ib-prik"></span>
      <span class="ib-label">NÆSTE</span>
      <!-- Desktop: statisk titel + meta -->
      <span class="ib-titel">${esc(næsteArr.titel)}</span>
      <span class="ib-meta">${metaTxt}</span>
      <!-- Mobil (< 640px): marquee KUN aktiveret via JS hvis teksten overflow -->
      <span class="ib-marquee-wrap" aria-hidden="true" style="flex:1;min-width:0;overflow:hidden;display:flex;">
        <span class="ib-marquee-track">
          <span class="ib-marquee-txt">${marqueeTekst}</span>
          <span class="ib-marquee-txt" aria-hidden="true">${marqueeTekst}</span>
        </span>
      </span>
      <svg class="ib-pil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>`;
  el.style.display = '';

  /* Overflow-detektion: kun marquee hvis teksten ikke passer */
  const wrap  = el.querySelector('.ib-marquee-wrap');
  const track = el.querySelector('.ib-marquee-track');
  const txt   = el.querySelector('.ib-marquee-txt');

  if (wrap && track && txt) {
    /* Mål EFTER render (requestAnimationFrame sikrer at layout er beregnet) */
    requestAnimationFrame(() => {
      /* På mobil (< 640px) vises marquee-wrap, på desktop er den skjult via CSS */
      const isMobil = window.innerWidth < 640;
      if (!isMobil) return; /* desktop: statisk titel bruges — ingen marquee */

      /* Sammenlign enkelt-tekstens bredde med containerens bredde */
      const overflow = txt.scrollWidth > wrap.clientWidth;
      if (overflow) {
        track.classList.add('ib-marquee-active');
        /* Juster hastighed proportionalt med tekstlængde: ~60px/s */
        const duration = Math.max(10, Math.round(txt.scrollWidth / 60));
        track.style.animationDuration = duration + 's';
      }
      /* Hvis teksten passer: ingen klasse → ingen animation (statisk) */
    });

    /* Stop marquee ved touch — brugeren kan læse i ro */
    el.addEventListener('touchstart', () => track.classList.add('paused'),    { passive: true });
    el.addEventListener('touchend',   () => track.classList.remove('paused'), { passive: true });
  }
}

/* ================================================================
   GOLFBOX
   ================================================================ */
function åbnGolfBox() {
  window.open(getGolfboxUrl(), '_blank', 'noopener');
}

/* ================================================================
   FORSIDE
   ================================================================ */
function pgForside() {
  const hero     = DB.get('ek_hero')||{};
  const animKørt = sessionStorage.getItem('lygHeroAnimationPlayed') === 'true';

  /* Data */
  const alleArr    = getArr().filter(a => erFremtidig(a.dato));
  const næsteArr   = alleArr.find(a => a.aaben && ledigePladser(a) > 0) || alleArr[0];
  const kommende   = alleArr.slice(0, 8);
  const nyheder    = DB.get('ek_nyheder') || [];
  const partnere   = DB.get('ek_partnere') || [];
  const mvirk      = DB.get('ek_mvirksomheder') || [];

  /* ── EK-kort til carousel ── */
  const ekKort = [
    { titel:'Netværk',          tekst:'Mød virksomhedsejere og beslutningstagere fra Aarhus-regionen.',  cta:'Læs mere →',    side:'om' },
    { titel:'Relationer',       tekst:'Stærke forretningsrelationer i professionelle, uformelle rammer.', cta:'Læs mere →',    side:'om' },
    { titel:'Golf & oplevelser',tekst:'Turneringer, rejser og særlige golfoplevelser.',                   cta:'Se oplevelser →',side:'golfarr' },
    { titel:'EK-mesterskabet',  tekst:'Erhvervsklubbens sportslige højdepunkt for alle erhvervsmedlemmer.',cta:'Se EK →',      side:'om' },
    { titel:'Bliv sponsor',     tekst:'Synlighed, netværk og eksklusive oplevelser for din virksomhed.',  cta:'Se fordele →',  side:'sponsor' },
  ];

  return `
<div class="hero hero-anim hero-v7" style="background-image:url('${esc(hero.billede||CONFIG.billeder.hero)}')">
  <div class="hero-lag">
    <div class="hero-topbar">
      <div class="hero-logo-wrap">
        <img src="./images/lyg-logo-transparent.png" alt="Lyngbygaard Golf" class="hero-lyg-logo" loading="eager">
        <div class="hero-wordmark-blok">
          <span class="hero-wordmark-top">LYG ERHVERVSKLUB</span>
          <span class="hero-wordmark-sub">Lyngbygaard Golf</span>
        </div>
      </div>
      <button class="hero-profil-btn" onclick="navTil('admin')" aria-label="Admin">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
    </div>
    <div class="hero-tekst-blok">
      <h1 class="hero-h1-v7">LYG ERHVERVSKLUB</h1>
      <p class="hero-tagline-v7">Golf · Relationer · Forretning</p>
      <p class="hero-p-kort">Professionelt netværk for virksomhedsejere, direktører og beslutningstagere.</p>
    </div>
  </div>

  <!-- Golfspiller-animation (eksisterende) -->
  <div class="golfer-scene${animKørt?' anim-done':''}">
    <img class="golfer-frame gf-1" src="./images/golfer-1-address.png"   alt="" aria-hidden="true" loading="eager">
    <img class="golfer-frame gf-2" src="./images/golfer-2-backswing.png" alt="" aria-hidden="true" loading="eager">
    <img class="golfer-frame gf-3" src="./images/golfer-3-impact.png"    alt="" aria-hidden="true" loading="eager">
    <div class="ball-trail"></div>
    <img class="golfer-frame gf-4" src="./images/golfer-4-finish.png"    alt="" aria-hidden="true" loading="eager">
  </div>

  <!-- Golfbolde der ruller hen over græsset (v7.1) -->
  <div class="golf-bolde-scene${animKørt?' bolde-done':''}" aria-hidden="true">
    <div class="gb gb-1">
      <div class="gb-bold">
        <div class="gb-indre">
          <img src="./images/lyg-logo-transparent.png" alt="" class="gb-logo-png" loading="eager" decoding="async">
        </div>
      </div>
      <div class="gb-skygge"></div>
    </div>
    <div class="gb gb-2">
      <div class="gb-bold">
        <div class="gb-indre">
          <img src="./images/lyg-logo-transparent.png" alt="" class="gb-logo-png" loading="eager" decoding="async">
        </div>
      </div>
      <div class="gb-skygge"></div>
    </div>
    <div class="gb gb-3">
      <div class="gb-bold">
        <div class="gb-indre">
          <img src="./images/lyg-logo-transparent.png" alt="" class="gb-logo-png" loading="eager" decoding="async">
        </div>
      </div>
      <div class="gb-skygge"></div>
    </div>
  </div>
</div>

${næsteArr ? `
<section class="cx-sek cx-naeste-sek">
  <div class="cx-naeste-kort2">
    <div class="cx-naeste-topp">
      <span class="cx-naeste-label">NÆSTE ARRANGEMENT</span>
      <h2 class="cx-naeste-titel2">${esc(næsteArr.titel)}</h2>
      <div class="cx-naeste-meta2">
        <span class="cx-naeste-dato-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          ${fmtDato(næsteArr.dato)}
        </span>
        ${næsteArr.sted ? `<span class="cx-naeste-sep">·</span>
        <span class="cx-naeste-sted-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${esc(næsteArr.sted)}
        </span>` : ''}
      </div>
      ${næsteArr.maks ? `<span class="cx-naeste-pladser2">${ledigePladser(næsteArr)} ledige pladser</span>` : ''}
    </div>
    <button class="cx-naeste-cta-knap" onclick="navTil('tilmelding',{id:'${næsteArr.id}'})">
      SE OG TILMELD →
    </button>
  </div>
</section>` : ''}

${kommende.length > 1 ? `
<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-sek-titel">KOMMENDE ARRANGEMENTER</h2>
    <button class="cx-se-alle" onclick="navTil('kalender')">Se alle →</button>
  </div>
  <div class="cx-scroll" id="cx-arr" role="list">
    ${kommende.map((a,i) => {
      const d = new Date(a.dato+'T12:00:00');
      const dag = d.toLocaleDateString('da-DK',{day:'numeric'});
      const mnd = d.toLocaleDateString('da-DK',{month:'short'}).toUpperCase().replace('.','');
      const ledig = ledigePladser(a);
      return `
    <button class="cx-kort cx-arr-txt" role="listitem" onclick="navTil('tilmelding',{id:'${a.id}'})">
      <div class="cx-arr-txt-dato"><span class="cx-att-dag">${dag}.</span><span class="cx-att-mnd">${mnd}</span></div>
      <div class="cx-arr-txt-indhold">
        <span class="cx-arr-navn">${esc(a.titel)}</span>
        ${a.sted ? `<span class="cx-arr-sted">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${esc(a.sted)}</span>` : ''}
        ${a.type ? `<span class="cx-arr-type">${esc(a.type)}</span>` : ''}
        ${ledig > 0 && a.aaben ? `<span class="cx-arr-ledig">${ledig} ledige pladser</span>` : ''}
      </div>
      <span class="cx-arr-cta">Se arrangement →</span>
    </button>`}).join('')}
  </div>
  <div class="cx-prikker" id="cx-arr-prikker">${kommende.map((_,i)=>`<span class="cx-prik${i===0?' aktiv':''}"></span>`).join('')}</div>
</section>` : ''}

<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-sek-titel">ERHVERVSKLUBBEN</h2>
    <button class="cx-se-alle" onclick="navTil('om')">Læs mere →</button>
  </div>
  <div class="cx-scroll" id="cx-ek" role="list">
    ${[
      { titel:'Netværk',          tekst:'Mød virksomhedsejere og beslutningstagere fra Aarhus-regionen.', side:'om',
        svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`},
      { titel:'Relationer',       tekst:'Stærke forretningsrelationer i uformelle rammer.', side:'om',
        svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`},
      { titel:'Golf & oplevelser',tekst:'Turneringer, rejser og særlige golfoplevelser året rundt.', side:'golfarr',
        svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="2"/><path d="M12 2v14M7 7l5-5 5 5"/><path d="M20 18H4"/></svg>`},
      { titel:'EK-mesterskabet',  tekst:'Erhvervsklubbens sportslige højdepunkt.', side:'om',
        svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`},
      { titel:'Bliv sponsor',     tekst:'Synlighed, netværk og eksklusive oplevelser for din virksomhed.', side:'sponsor',
        svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`},
    ].map(k => `
    <button class="cx-kort cx-ek-kort2" role="listitem" onclick="navTil('${k.side}')">
      <div class="cx-ek-ikon">${k.svg}</div>
      <span class="cx-ek-titel">${esc(k.titel)}</span>
      <span class="cx-k-tekst">${esc(k.tekst)}</span>
      <span class="cx-ek-cta">Læs mere →</span>
    </button>`).join('')}
  </div>
</section>

${partnere.length ? `
<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-titel">Partnerfordele</h2>
  </div>
  <div class="cx-scroll" id="cx-partner" role="list">
    ${partnere.map(p => `
    <div class="cx-kort cx-partner-kort">
      ${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.navn)}" class="cx-partner-logo" loading="lazy">` : `<div class="cx-partner-navn">${esc(p.navn)}</div>`}
      <span class="cx-k-titel">${esc(p.fordel||p.navn)}</span>
      <span class="cx-k-tekst">${esc(p.tekst||'Fordel for LYG Erhvervsklub-medlemmer.')}</span>
      ${p.link ? `<a class="cx-k-cta" href="${esc(p.link)}" target="_blank" rel="noopener">Se fordel →</a>` : ''}
    </div>`).join('')}
  </div>
</section>` : ''}

${mvirk.length ? `
<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-titel">Medlemsvirksomheder</h2>
  </div>
  <div class="cx-scroll" id="cx-mvirk" role="list">
    ${mvirk.map(v => `
    <div class="cx-kort cx-mvirk-kort">
      ${v.logo ? `<img src="${esc(v.logo)}" alt="${esc(v.navn)}" class="cx-mvirk-logo" loading="lazy">` : `<div class="cx-mvirk-initial">${esc(v.navn[0]||'V')}</div>`}
      <span class="cx-k-titel">${esc(v.navn)}</span>
      ${v.branche ? `<span class="cx-k-tekst">${esc(v.branche)}</span>` : ''}
    </div>`).join('')}
  </div>
</section>` : ''}

${nyheder.length ? `
<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-titel">Seneste nyt</h2>
  </div>
  <div class="cx-scroll" id="cx-nyt" role="list">
    ${nyheder.slice(0,4).map(n => `
    <div class="cx-kort cx-nyhed-kort">
      ${n.billede ? `<div class="cx-nyhed-billede" style="background-image:url('${esc(n.billede)}')" loading="lazy"></div>` : ''}
      <span class="cx-k-dato">${n.dato ? fmtDato(n.dato) : ''}</span>
      <span class="cx-k-titel">${esc(n.titel)}</span>
      <span class="cx-k-tekst">${esc(n.tekst||'')}</span>
    </div>`).join('')}
  </div>
</section>` : ''}

<footer class="app-footer">
  <p>Lyngbygaard Golf · Lyngbygårdsvej 29, 8220 Brabrand</p>
  <p class="kont-tlf-linje"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg> <a href="tel:87441070">87 44 10 70</a></p>
  <p class="foot-credit">Bygget af Nordic Operations · nordicoperations.dk</p>
  <p class="foot-version">LYG Erhvervsklub v7.2</p>
</footer>`;
}

/* Startes fra navTil() — afspiller animation og gemmer session-flag */
function startHeroAnimation() {
  if (side !== 'forside') return;
  if (sessionStorage.getItem('lygHeroAnimationPlayed') === 'true') return;
  const scene  = document.querySelector('.golfer-scene');
  const bolde  = document.querySelector('.golf-bolde-scene');
  if (!scene && !bolde) return;
  // Sæt flag med det samme så gennavigation ikke spiller igen
  sessionStorage.setItem('lygHeroAnimationPlayed', 'true');
  // Start golfspiller-animation — KUN på tablet/desktop (≥640px)
  // På mobil: golfspiller skjult helt — kun golfbolde animerer diskret
  if (scene && window.innerWidth >= 640) {
    scene.classList.add('anim-running');
    setTimeout(() => {
      scene.classList.remove('anim-running');
      scene.classList.add('anim-done');
    }, 4200);
  }
  // Start golfbolde-animation (100ms forsinkelse for naturlig start)
  if (bolde) {
    setTimeout(() => {
      bolde.classList.add('bolde-running');
      setTimeout(() => {
        bolde.classList.remove('bolde-running');
        bolde.classList.add('bolde-done');
      }, 5000);
    }, 100);
  }
}

/* ================================================================
   ARRANGEMENT KORT
   Timezone-safe: sammenligner ISO-datostrenge direkte.
   Tidligere arrangementer: ingen aktive funktioner.
   ================================================================ */
/* SVG-ikoner til eventkort */
const _SVG = {
  arr:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  pin:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  pil:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  golf: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="2"/><path d="M12 2v14M7 7l5-5 5 5"/><path d="M20 18H4"/></svg>`,
  net:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  din:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  back: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>`,
  kal:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  bell: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
};

function _arrIkon(a) {
  const t = (a.type||a.titel||'').toLowerCase();
  if (t.includes('netv') || t.includes('relat')) return _SVG.net;
  if (t.includes('middag') || t.includes('frokost') || t.includes('gokart') || t.includes('jul')) return _SVG.din;
  return _SVG.golf;
}

function _arrStatus(a) {
  const frem  = erFremtidig(a.dato);
  const ledig = ledigePladser(a);
  if (!frem)                           return { kls:'ev-st-afholdt', txt:'Afholdt' };
  if (!a.aaben || a.status==='lukket') return { kls:'ev-st-lukket',  txt:'Lukket' };
  if (ledig <= 0)                      return { kls:'ev-st-fuldt',   txt:'Udsolgt' };
  if (ledig <= 3)                      return { kls:'ev-st-faa',     txt:`Kun ${ledig} pladser` };
  return { kls:'ev-st-aaben', txt:`${ledig} ledige` };
}

function arrKort(a, kompakt=false) {
  const frem   = erFremtidig(a.dato);
  const st     = _arrStatus(a);
  const d      = new Date(a.dato+'T12:00:00');
  const datoStr= d.toLocaleDateString('da-DK',{day:'2-digit',month:'2-digit',year:'2-digit'}).replace(/\//g,'.');
  return `
<button class="ev-kort${frem?'':' ev-past'}" onclick="navTil('arr',{id:'${a.id}'})" role="listitem" aria-label="${esc(a.titel)}">
  <div class="ev-ikon-wrap">${_arrIkon(a)}</div>
  <div class="ev-content">
    <div class="ev-meta">
      <span class="ev-dato">${datoStr}</span>
      ${a.sted?`<span class="ev-sep">·</span><span class="ev-sted">${esc(a.sted)}</span>`:''}
    </div>
    <div class="ev-titel">${esc(a.titel)}</div>
    ${a.besk?`<div class="ev-besk">${esc(a.besk.length>72?a.besk.substring(0,70)+'…':a.besk)}</div>`:''}
    <span class="ev-status ${st.kls}">${st.txt}</span>
  </div>
  <div class="ev-pil">${_SVG.pil}</div>
</button>`;
}

function pgKalender() {
  const alle = getArr();
  const frem = alle.filter(a =>  erFremtidig(a.dato));
  const tidl = alle.filter(a => !erFremtidig(a.dato)).reverse();
  return `
<div class="ph bg-mork">
  <p class="ev-ph-over">LYG ERHVERVSKLUB</p>
  <h1 class="ev-ph-h1">Arrangementer</h1>
  <p class="ev-ph-sub">Golf, relationer og erhvervsoplevelser</p>
</div>
<section class="ev-liste-sek">
  ${frem.length
    ? `<div class="ev-liste" role="list">${frem.map(a=>arrKort(a)).join('')}</div>`
    : `<div class="tom-kal"><p>Ingen kommende arrangementer.</p><button class="knap-sek" onclick="navTil('kontakt')">Kontakt os</button></div>`}
</section>
${tidl.length?`
<section class="ev-liste-sek ev-tidl-sek">
  <details class="ev-tidl-details">
    <summary class="ev-tidl-sum">Tidligere arrangementer (${tidl.length})</summary>
    <div class="ev-liste mt1" role="list">${tidl.map(a=>arrKort(a)).join('')}</div>
  </details>
</section>`:''}`;
}

function pgArr(data) {
  const a = getArr().find(x => x.id === (data?.id||''));
  if (!a) return `<div class="ph bg-mork"><h1>Arrangement ikke fundet</h1></div>
<section class="sek"><button class="knap-sek" onclick="navTil('kalender')">← Tilbage</button></section>`;
  const frem  = erFremtidig(a.dato);
  const ledig = ledigePladser(a);
  const st    = _arrStatus(a);
  const d     = new Date(a.dato+'T12:00:00');
  const datoLang = d.toLocaleDateString('da-DK',{day:'numeric',month:'long',year:'numeric'});
  const kanTilm  = frem && a.aaben && ledig > 0;
  const kanVente = frem && a.aaben && ledig <= 0 && a.status !== 'lukket';
  const svgShield = `<svg width="48" height="56" viewBox="0 0 24 28" fill="none"><path d="M12 0L0 5v8c0 7.18 5.14 13.9 12 15.5C18.86 26.9 24 20.18 24 13V5L12 0z" fill="#b8973a" opacity=".2"/><path d="M12 1.8L1.5 6.2V13c0 6.4 4.6 12.4 10.5 13.85C17.9 25.4 22.5 19.4 22.5 13V6.2L12 1.8z" stroke="#b8973a" stroke-width="1.2" fill="none"/><path d="M8 14l2.5 2.5L16 10" stroke="#b8973a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `
<div class="ev-detail-header">
  <button class="bk-back" onclick="navTil('kalender')" aria-label="Tilbage">${_SVG.back}</button>
  <span class="ev-detail-breadcrumb">Kalender</span>
</div>
<div class="ev-detail-hero">
  ${a.image
    ? `<img src="${esc(a.image)}" alt="${esc(a.titel)}" class="ev-detail-img">`
    : `<div class="ev-detail-fallback"><div class="ev-detail-fb-inner">${svgShield}<span>LYG ERHVERVSKLUB</span></div></div>`}
</div>
<section class="sek ev-detail-sek">
  <div class="ev-detail-topp">
    <div class="ev-detail-dato">${_SVG.kal} ${datoLang}${a.tid?' · '+esc(a.tid):''}</div>
    <span class="ev-status-badge ${st.kls}">${st.txt}</span>
  </div>
  <h1 class="ev-detail-h1">${esc(a.titel)}</h1>
  ${a.sted?`<div class="ev-detail-sted">${_SVG.pin} ${esc(a.sted)}</div>`:''}
  ${a.type?`<div class="ev-detail-type">${esc(a.type)}</div>`:''}
  ${a.besk?`<p class="ev-detail-besk">${esc(a.besk)}</p>`:''}
  <div class="ev-detail-praktisk">
    ${a.maks?`<div class="ev-dp-rad"><span>Pladser</span><strong>${a.maks}</strong></div>`:''}
    ${a.maks?`<div class="ev-dp-rad"><span>Tilmeldte</span><strong>${a.tlm||0}</strong></div>`:''}
    ${frem&&a.maks?`<div class="ev-dp-rad"><span>Ledige</span><strong class="${ledig<=3&&ledig>0?'ev-faa':''}">${ledig}</strong></div>`:''}
    ${a.pris?`<div class="ev-dp-rad"><span>Pris</span><strong>${esc(a.pris)}</strong></div>`:''}
  </div>
  ${frem?`<div class="ev-detail-cta">
    ${kanTilm
      ?`<button class="knap-p ev-tilmeld-btn" onclick="navTil('tilmelding',{id:'${a.id}'})">Tilmeld dig →</button>`
      :kanVente
        ?`<button class="knap-sek ev-tilmeld-btn" onclick="venteListe('${a.id}')">Venteliste</button>`
        :`<button class="knap-p ev-tilmeld-btn" disabled>Tilmelding ikke mulig</button>`}
    <div class="ev-detail-sek-cta">
      <button class="ev-icon-knap" onclick="tilfoejKal('${a.id}')">${_SVG.kal} Tilføj til kalender</button>
      <button class="ev-icon-knap" onclick="aktPaam('${a.id}')">${_SVG.bell} Påmindelser</button>
    </div>
  </div>`:''}
  <button class="ev-tilbage-link" onclick="navTil('kalender')">← Tilbage til kalender</button>
</section>`;
}


/* ================================================================
   TILMELDING
   ================================================================ */
/* ================================================================
   TILMELDING — 3-trins booking-wizard
   State gemmes i sessionStorage så reload ikke mister data.
   ================================================================ */
let _bookState = { trin: 1, arrId: '', navn: '', virk: '', email: '', tlf: '', antal: 1, kom: '' };

function pgTilm(data) {
  // Nyt flow: hvis arrangement er pre-valgt, start på trin 2
  if (data?.id && _bookState.trin === 1) {
    _bookState.arrId = data.id;
    _bookState.trin  = 2;
  }
  // Reset hvis kvittering er vist og brugeren navigerer hertil igen
  if (_bookState.trin === 4 && !data?.id) {
    bookReset();
  }
  const åbne = getArr().filter(a => erFremtidig(a.dato) && a.aaben);
  if (!åbne.length) return `
<div class="ph bg-mork bk-ph">
  <h1 class="bk-ph-h1">Tilmelding</h1>
</div>
<section class="sek">
  <div class="tom-kal">
    <p>Ingen åbne arrangementer i øjeblikket.</p>
    <button class="knap-sek" onclick="navTil('kalender')">Se kalender →</button>
  </div>
</section>`;

  const arr = getArr().find(a => a.id === _bookState.arrId);

  return `
<div class="ph bg-mork bk-ph">
  <div class="bk-ph-topbar">
    ${_bookState.trin > 1 ? `<button class="bk-back" onclick="bookTilbage()" aria-label="Tilbage">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
    </button>` : `<div style="width:32px"></div>`}
    <h1 class="bk-ph-h1">Tilmelding</h1>
    <div style="width:32px"></div>
  </div>
  <!-- Trin-indikator -->
  <div class="bk-trin-wrap">
    ${[1,2,3].map(n => `<div class="bk-trin${_bookState.trin===n?' aktiv':_bookState.trin>n?' done':''}">
      <span class="bk-trin-nr">${_bookState.trin>n?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`:n}</span>
      <span class="bk-trin-lbl">${n===1?'Arrangement':n===2?'Oplysninger':'Bekræft'}</span>
    </div>${n<3?'<div class="bk-trin-linje"></div>':''}`).join('')}
  </div>
</div>

${_bookState.trin === 1 ? `
<!-- TRIN 1: Vælg arrangement -->
<section class="sek">
  <div class="bk-arr-liste">
    ${åbne.map(a => {
      const ledig = ledigePladser(a);
      const fuldt = ledig <= 0;
      return `
    <button class="bk-arr-kort ${fuldt?'fuldt':''}" onclick="${fuldt?'':' bookVælgArr(\''+a.id+'\')'}" ${fuldt?'disabled':''}>
      <div class="bk-arr-dato">
        <span class="bk-att-dag">${new Date(a.dato+'T12:00:00').toLocaleDateString('da-DK',{day:'numeric'})}.</span>
        <span class="bk-att-mnd">${new Date(a.dato+'T12:00:00').toLocaleDateString('da-DK',{month:'short'}).toUpperCase().replace('.','')}</span>
      </div>
      <div class="bk-arr-info">
        <span class="bk-arr-titel">${esc(a.titel)}</span>
        ${a.sted?`<span class="bk-arr-sted">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${esc(a.sted)}</span>`:''}
        <span class="bk-arr-ledig ${ledig<=3&&!fuldt?'faa':''}">${fuldt?'Fuldt booket':ledig<=3?ledig+' ledige pladser':ledig+' pladser tilbage'}</span>
      </div>
      <svg class="bk-arr-pil" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>`}).join('')}
  </div>
</section>` : ''}

${_bookState.trin === 2 && arr ? `
<!-- TRIN 2: Deltageroplysninger -->
<section class="sek">
  <div class="bk-valgt-arr">
    <span class="bk-valgt-label">Valgt arrangement</span>
    <span class="bk-valgt-titel">${esc(arr.titel)}</span>
    <span class="bk-valgt-dato">${fmtDato(arr.dato)}${arr.sted?' · '+esc(arr.sted):''}</span>
  </div>
  <form id="bk-form2" onsubmit="bookTrin2(event)" novalidate>
    <div class="fg"><label>Navn *</label><input name="navn" required placeholder="Dit fulde navn" value="${esc(_bookState.navn)}" autocomplete="name"></div>
    <div class="fg"><label>Virksomhed *</label><input name="virk" required placeholder="Virksomhedens navn" value="${esc(_bookState.virk)}" autocomplete="organization"></div>
    <div class="fg"><label>Email *</label><input type="email" name="email" required placeholder="din@email.dk" value="${esc(_bookState.email)}" autocomplete="email"></div>
    <div class="fg"><label>Telefon</label><input type="tel" name="tlf" placeholder="12 34 56 78" value="${esc(_bookState.tlf)}" autocomplete="tel"></div>
    <div class="fg bk-antal-fg">
      <label>Antal deltagere</label>
      <div class="bk-antal-ctrl">
        <button type="button" class="bk-antal-btn" onclick="bookAntalJuster(-1)">−</button>
        <span class="bk-antal-vis" id="bk-antal-vis">${_bookState.antal}</span>
        <button type="button" class="bk-antal-btn" onclick="bookAntalJuster(1)">+</button>
      </div>
      <span class="bk-antal-ledig">${ledigePladser(arr)} tilgængelige</span>
    </div>
    <div class="fg"><label>Kommentar</label><textarea name="kom" rows="2" placeholder="Særlige ønsker eller allergier…">${esc(_bookState.kom)}</textarea></div>
    <button type="submit" class="knap-p fb bk-submit">Næste: Bekræft booking</button>
  </form>
</section>` : ''}

${_bookState.trin === 3 && arr ? `
<!-- TRIN 3: Bekræft -->
<section class="sek">
  <div class="bk-opsummering">
    <h2 class="bk-ops-titel">Bekræft din tilmelding</h2>
    <div class="bk-ops-liste">
      <div class="bk-ops-felt"><span>Arrangement</span><strong>${esc(arr.titel)}</strong></div>
      <div class="bk-ops-felt"><span>Dato</span><strong>${fmtDato(arr.dato)}</strong></div>
      ${arr.sted?`<div class="bk-ops-felt"><span>Lokation</span><strong>${esc(arr.sted)}</strong></div>`:''}
      <div class="bk-ops-felt"><span>Navn</span><strong>${esc(_bookState.navn)}</strong></div>
      <div class="bk-ops-felt"><span>Virksomhed</span><strong>${esc(_bookState.virk)}</strong></div>
      <div class="bk-ops-felt"><span>Email</span><strong>${esc(_bookState.email)}</strong></div>
      ${_bookState.tlf?`<div class="bk-ops-felt"><span>Telefon</span><strong>${esc(_bookState.tlf)}</strong></div>`:''}
      <div class="bk-ops-felt"><span>Antal</span><strong>${_bookState.antal} person${_bookState.antal>1?'er':''}</strong></div>
    </div>
  </div>
  <button class="knap-p fb bk-submit" onclick="bookAfslut()">Bekræft tilmelding</button>
  <button class="bk-rediger" onclick="bookTilTrin(2)">Ret oplysninger</button>
</section>` : ''}

${_bookState.trin === 4 ? `
<!-- TRIN 4: Kvittering -->
<section class="sek">
  <div class="bk-kv">
    <div class="bk-kv-ikon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    </div>
    <h2 class="bk-kv-h2">Tilmelding bekræftet</h2>
    <p class="bk-kv-navn">${esc(_bookState.navn)}</p>
    <p class="bk-kv-info">Vi har registreret din tilmelding til <strong>${esc(_bookState._arrTitel||'')}</strong>.<br>Bekræftelse sendes til <strong>${esc(_bookState.email)}</strong>.</p>
    <div class="bk-kv-knapper">
      <button class="knap-p" onclick="bookReset();navTil('kalender')">Se kalender</button>
      <button class="knap-sek" onclick="bookReset();navTil('tilmelding')">Ny tilmelding</button>
    </div>
  </div>
</section>` : ''}`;
}

/* ── Booking-wizard helpers ── */
function bookVælgArr(id) {
  _bookState.arrId = id;
  _bookState.trin  = 2;
  navTil('tilmelding');
}

function bookTilbage() {
  _bookState.trin = Math.max(1, _bookState.trin - 1);
  navTil('tilmelding');
}

function bookTilTrin(n) {
  _bookState.trin = n;
  navTil('tilmelding');
}

function bookAntalJuster(delta) {
  const arr = getArr().find(a => a.id === _bookState.arrId);
  const maks = arr ? ledigePladser(arr) : 10;
  _bookState.antal = Math.max(1, Math.min(maks, _bookState.antal + delta));
  const el = document.getElementById('bk-antal-vis');
  if (el) el.textContent = _bookState.antal;
}

function bookTrin2(e) {
  e.preventDefault();
  const f = e.target;
  if (!f.navn.value.trim() || !f.virk.value.trim() || !f.email.value.trim()) {
    f.reportValidity(); return;
  }
  _bookState.navn  = f.navn.value.trim();
  _bookState.virk  = f.virk.value.trim();
  _bookState.email = f.email.value.trim();
  _bookState.tlf   = f.tlf.value.trim();
  _bookState.kom   = f.kom.value.trim();
  _bookState.trin  = 3;
  navTil('tilmelding');
}

/* bookAfslut: forsøger Supabase RPC (atomisk kapacitetskontrol).
   Succes vises KUN efter serverbekræftelse.
   Fallback til localStorage hvis Supabase ikke er tilgængeligt. */
async function bookAfslut() {
  const arr = getArr().find(a => a.id === _bookState.arrId);
  if (!arr) { alert('Arrangement ikke fundet.'); return; }

  /* Deaktiver bekræft-knappen og vis "behandler…" */
  const btn = document.querySelector('.bk-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Behandler…'; }

  const sb = getSupabase();

  if (sb) {
    /* ── Supabase: atomisk booking via server-side RPC ── */
    try {
      const { data, error } = await sb.rpc('tilmeld_arrangement', {
        p_arrangement_id: arr.id,
        p_navn:           _bookState.navn,
        p_virksomhed:     _bookState.virk,
        p_email:          _bookState.email,
        p_telefon:        _bookState.tlf,
        p_antal:          _bookState.antal,
        p_kommentar:      _bookState.kom
      });

      if (error) throw error;

      if (!data || !data.ok) {
        /* Serveren afviste — fx fuldt booket */
        const fejl = data?.fejl || 'Tilmelding ikke mulig.';
        const ledig = data?.ledige ?? '?';
        if (btn) { btn.disabled = false; btn.textContent = 'Bekræft tilmelding'; }
        alert(`${fejl}\nLedige pladser: ${ledig}`);
        bookTilTrin(2);
        return;
      }

      /* ✅ Server bekræftede — gem lokal kopi og gem arrTitel til kvittering */
      const t = {
        id: data.tilmelding_id || 't'+Date.now(),
        arrId: arr.id, arrTitel: arr.titel,
        navn: _bookState.navn, virk: _bookState.virk,
        email: _bookState.email, tlf: _bookState.tlf,
        antal: _bookState.antal, kom: _bookState.kom,
        dato: idag(), mødt: false, kilde: 'supabase'
      };
      const alle = DB.get('ek_tilm')||[]; alle.push(t); DB.set('ek_tilm', alle);

      /* Opdatér lokal tælling fra server-svar */
      const arrs = DB.get('ek_arr')||[];
      const idx  = arrs.findIndex(a => a.id === arr.id);
      if (idx > -1) {
        const ledige = data.ledige_tilbage ?? (arrs[idx].maks - arrs[idx].tlm - _bookState.antal);
        arrs[idx].tlm = arrs[idx].maks - Math.max(0, ledige);
        if (arrs[idx].tlm >= arrs[idx].maks) arrs[idx].status = 'fuldt';
        DB.set('ek_arr', arrs);
      }

      _bookState._arrTitel = arr.titel;
      _bookState.trin = 4;
      navTil('tilmelding');

    } catch (err) {
      console.warn('[Booking] Supabase RPC fejlede, prøver localStorage:', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Bekræft tilmelding'; }
      /* Fallback til localStorage ved netværksfejl */
      _bookAfslutLokal(arr, btn);
    }

  } else {
    /* ── Fallback: localStorage ── */
    _bookAfslutLokal(arr, btn);
  }
}

/* Lokal fallback — bruges kun hvis Supabase ikke er tilgængeligt */
function _bookAfslutLokal(arr, btn) {
  const ledig = ledigePladser(arr);
  if (_bookState.antal > ledig) {
    if (btn) { btn.disabled = false; btn.textContent = 'Bekræft tilmelding'; }
    alert(`Kun ${ledig} ledige pladser.`);
    bookTilTrin(2);
    return;
  }

  const t = {
    id: 't'+Date.now(), arrId: arr.id, arrTitel: arr.titel,
    navn: _bookState.navn, virk: _bookState.virk,
    email: _bookState.email, tlf: _bookState.tlf,
    antal: _bookState.antal, kom: _bookState.kom,
    dato: idag(), mødt: false, kilde: 'lokal'
  };
  const alle = DB.get('ek_tilm')||[]; alle.push(t); DB.set('ek_tilm', alle);

  const arrs = DB.get('ek_arr')||[];
  const idx  = arrs.findIndex(a => a.id === arr.id);
  if (idx > -1) {
    arrs[idx].tlm += _bookState.antal;
    if (arrs[idx].tlm >= arrs[idx].maks) arrs[idx].status = 'fuldt';
    DB.set('ek_arr', arrs);
  }

  _bookState._arrTitel = arr.titel;
  _bookState.trin = 4;
  navTil('tilmelding');
}

function bookReset() {
  _bookState = { trin:1, arrId:'', navn:'', virk:'', email:'', tlf:'', antal:1, kom:'' };
}

function submitTilm(e) { e.preventDefault(); } // legacy — erstattet af wizard

function venteListe(arrId) {
  const arr=getArr().find(a=>a.id===arrId); if(!arr) return;
  const navn=prompt('Dit navn (venteliste):'); if(!navn) return;
  const email=prompt('Din email:');           if(!email) return;
  const vl=DB.get('ek_venteliste')||[];
  vl.push({arrId,arrTitel:arr.titel,navn,email,dato:new Date().toISOString()});
  DB.set('ek_venteliste',vl);
  alert(`Du er sat på venteliste til "${arr.titel}". Vi kontakter dig ved ledige pladser.`);
}

/* ================================================================
   FIRMAARRANGEMENT (tidligere "Golf")
   ================================================================ */
let _golfState = { trin:1, pakke:'', virk:'', kp:'', email:'', tlf:'', dato:'', antal:4, besk:'' };

function pgGolf() {
  const pakker = DB.get('ek_pakker')||CONFIG.golfPakker;
  const svgArrow = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const svgGlobe = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  const valgtPakke = pakker.find(p => p.titel === _golfState.pakke);

  return `
<div class="ph bg-mork bk-ph">
  <div class="bk-ph-topbar">
    ${_golfState.trin > 1 ? `<button class="bk-back" onclick="golfTilbage()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>` : `<div style="width:32px"></div>`}
    <h1 class="bk-ph-h1">Firmaarrangement</h1>
    <div style="width:32px"></div>
  </div>
  <div class="bk-trin-wrap">
    ${[{n:1,l:'Vælg pakke'},{n:2,l:'Oplysninger'},{n:3,l:'Bekræft'}].map(({n,l}) => `
    <div class="bk-trin${_golfState.trin===n?' aktiv':_golfState.trin>n?' done':''}">`+`
      <span class="bk-trin-nr">${_golfState.trin>n?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`:n}</span>
      <span class="bk-trin-lbl">${l}</span>
    </div>${n<3?'<div class="bk-trin-linje"></div>':''}`).join('')}
  </div>
</div>

${_golfState.trin === 1 ? `
<div class="golf-gb-wrap">
  <button class="golf-gb-kort" onclick="åbnGolfBox()">
    <div class="golf-gb-venstre">
      <span class="golf-gb-ikon">${svgGlobe}</span>
      <div><div class="golf-gb-titel">GolfBox</div><div class="golf-gb-sub">Book tid eller log ind direkte</div></div>
    </div>
    <span class="golf-gb-pil">${svgArrow}</span>
  </button>
</div>
<section class="cx-sek">
  <div class="cx-hdr"><p class="golf-arr-eyebrow">VÆLG ARRANGEMENT</p></div>
  <div class="cx-scroll" id="cx-pakker" role="list">
    ${pakker.map(p => `
    <button class="golf-pk-txt" role="listitem" data-pakketitel="${esc(p.titel)}"
            onclick="golfVælgPakke(this.dataset.pakketitel)">
      <span class="golf-pk-pris-txt">${esc(p.pris)}</span>
      <span class="golf-pk-titel-txt">${esc(p.titel)}</span>
      <span class="golf-pk-besk-txt">${esc(p.beskrivelse.split('.')[0]+'.')}</span>
      <ul class="golf-pk-inkl">${(p.inkl||[]).slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      <span class="golf-pk-cta-txt">Vælg ${svgArrow}</span>
    </button>`).join('')}
  </div>
  <div class="cx-prikker" id="cx-pk-prikker">${pakker.map((_,i)=>`<span class="cx-prik${i===0?' aktiv':''}">`+'</span>').join('')}</div>
</section>` : ''}

${_golfState.trin === 2 ? `
<section class="sek">
  ${valgtPakke ? `<div class="bk-valgt-arr">
    <span class="bk-valgt-label">Valgt pakke</span>
    <span class="bk-valgt-titel">${esc(valgtPakke.titel)}</span>
    <span class="bk-valgt-dato">${esc(valgtPakke.pris)}</span>
  </div>` : ''}
  <form id="golf-form2" onsubmit="golfTrin2(event)" novalidate>
    <div class="fg"><label>Virksomhed *</label><input name="virk" required value="${esc(_golfState.virk)}" placeholder="Virksomhedens navn" autocomplete="organization"></div>
    <div class="g2f">
      <div class="fg"><label>Kontaktperson *</label><input name="kp" required value="${esc(_golfState.kp)}" autocomplete="name"></div>
      <div class="fg"><label>Email *</label><input type="email" name="email" required value="${esc(_golfState.email)}" autocomplete="email"></div>
    </div>
    <div class="g2f">
      <div class="fg"><label>Telefon</label><input type="tel" name="tlf" value="${esc(_golfState.tlf)}" autocomplete="tel"></div>
      <div class="fg"><label>Ønsket dato</label><input type="date" name="dato" value="${esc(_golfState.dato)}"></div>
    </div>
    <div class="fg bk-antal-fg">
      <label>Antal personer</label>
      <div class="bk-antal-ctrl">
        <button type="button" class="bk-antal-btn" onclick="golfAntalJuster(-1)">−</button>
        <span class="bk-antal-vis" id="golf-antal-vis">${_golfState.antal}</span>
        <button type="button" class="bk-antal-btn" onclick="golfAntalJuster(1)">+</button>
      </div>
    </div>
    <div class="fg"><label>Særlige ønsker</label><textarea name="besk" rows="2" placeholder="Beskriv jeres ønsker…">${esc(_golfState.besk)}</textarea></div>
    <button type="submit" class="knap-p fb bk-submit">Næste: Bekræft</button>
  </form>
</section>` : ''}

${_golfState.trin === 3 ? `
<section class="sek">
  <div class="bk-opsummering">
    <h2 class="bk-ops-titel">Bekræft forespørgsel</h2>
    <div class="bk-ops-liste">
      <div class="bk-ops-felt"><span>Pakke</span><strong>${esc(_golfState.pakke)}</strong></div>
      <div class="bk-ops-felt"><span>Virksomhed</span><strong>${esc(_golfState.virk)}</strong></div>
      <div class="bk-ops-felt"><span>Kontakt</span><strong>${esc(_golfState.kp)}</strong></div>
      <div class="bk-ops-felt"><span>Email</span><strong>${esc(_golfState.email)}</strong></div>
      ${_golfState.tlf?`<div class="bk-ops-felt"><span>Telefon</span><strong>${esc(_golfState.tlf)}</strong></div>`:''}
      ${_golfState.dato?`<div class="bk-ops-felt"><span>Dato</span><strong>${fmtDato(_golfState.dato)}</strong></div>`:''}
      <div class="bk-ops-felt"><span>Antal</span><strong>${_golfState.antal} personer</strong></div>
    </div>
  </div>
  <button class="knap-p fb bk-submit" onclick="golfAfslut()">Send forespørgsel</button>
  <button class="bk-rediger" onclick="golfTilTrin(2)">Ret oplysninger</button>
</section>` : ''}

${_golfState.trin === 4 ? `
<section class="sek">
  <div class="bk-kv">
    <div class="bk-kv-ikon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
    <h2 class="bk-kv-h2">Forespørgsel sendt</h2>
    <p class="bk-kv-info">Vi kontakter <strong>${esc(_golfState.kp)}</strong> hurtigst muligt.</p>
    <div class="bk-kv-knapper">
      <button class="knap-p" onclick="golfReset();navTil('forside')">Tilbage til forsiden</button>
    </div>
  </div>
</section>` : ''}`;
}

function golfVælgPakke(titel) { _golfState.pakke=titel; _golfState.trin=2; navTil('golfarr'); }
function golfTilbage()        { _golfState.trin=Math.max(1,_golfState.trin-1); navTil('golfarr'); }
function golfTilTrin(n)       { _golfState.trin=n; navTil('golfarr'); }
function golfAntalJuster(d)   { _golfState.antal=Math.max(1,Math.min(100,_golfState.antal+d)); const el=document.getElementById('golf-antal-vis'); if(el)el.textContent=_golfState.antal; }

function golfTrin2(e) {
  e.preventDefault(); const f=e.target;
  if (!f.virk.value.trim()||!f.kp.value.trim()||!f.email.value.trim()) { f.reportValidity(); return; }
  _golfState.virk=f.virk.value.trim(); _golfState.kp=f.kp.value.trim();
  _golfState.email=f.email.value.trim(); _golfState.tlf=f.tlf.value.trim();
  _golfState.dato=f.dato.value; _golfState.besk=f.besk.value.trim();
  _golfState.trin=3; navTil('golfarr');
}

function golfAfslut() {
  const bg=DB.get('ek_golf_booking')||[];
  bg.push({id:'g'+Date.now(),..._golfState,oprettet:new Date().toISOString()});
  DB.set('ek_golf_booking',bg);
  _golfState.trin=4; navTil('golfarr');
}

function golfReset() { _golfState={trin:1,pakke:'',virk:'',kp:'',email:'',tlf:'',dato:'',antal:4,besk:''}; }
function submitGolf(e) { e.preventDefault(); }
function vælgPakke(t)  { golfVælgPakke(t); }


/* ================================================================
   SPONSOR
   ================================================================ */
function pgSponsor() {
  const sponsorer = DB.get('ek_sponsorer')||[];
  const rigtige   = sponsorer.filter(s=>s.navn&&!s.navn.includes('ledigt'));
  return `
<div class="ph bg-mork">
  <h1>Bliv sponsor</h1>
  <p>Synlighed, netværk og relationer i Aarhus-regionens erhvervsliv</p>
</div>

<section class="sek">
  <div class="tekst-bi-kort">
    <div class="tekst-bi-citat"><p>"Som sponsor bliver din virksomhed en del af et stærkt fællesskab med golf som rammen og netværk som resultatet."</p></div>
  </div>
</section>

<section class="sek">
  <h2 class="stitl">Hvad får din virksomhed?</h2>
  <div class="ikg">
    ${CONFIG.sponsorFordele.map(f=>`
    <div class="ikb static"><span class="iks">${f.ikon}</span><strong>${esc(f.titel)}</strong><p>${esc(f.tekst)}</p></div>`).join('')}
  </div>
</section>

<section class="sek">
  <div class="sp-facts">
    <div class="sp-fact"><strong>100+</strong><span>erhvervsmedlemmer</span></div>
    <div class="sp-fact"><strong>10+</strong><span>events om året</span></div>
    <div class="sp-fact"><strong>Aarhus</strong><span>regionens netværk</span></div>
    <div class="sp-fact"><strong>Golf</strong><span>eksklusiv ramme</span></div>
  </div>
</section>

<section class="sek">
  <h2 class="stitl">Sponsorniveauer</h2>
  <div class="sp-niv">
    <div class="sp-n guld-n"><div class="sp-n-titel"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> Guld</div><p>Primær placering på bane, hjemmeside og alle arrangementer. VIP-invitationer, greenfee og eksklusive events.</p></div>
    <div class="sp-n"><div class="sp-n-titel"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Sølv</div><p>Logo ved bane og digitalt. Adgang til erhvervsarrangementer og invitationer til udvalgte events.</p></div>
    <div class="sp-n"><div class="sp-n-titel"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg> Bronze</div><p>Digital synlighed, omtale i nyhedsbrev og invitationer til åbne arrangementer.</p></div>
  </div>
  <p class="muted tc mt1">Priser aftales individuelt. Kontakt os for et uforpligtende tilbud.</p>
</section>

${rigtige.length?`
<section class="sek">
  <h2 class="stitl">Vores sponsorer</h2>
  <div class="sp-g">
    ${rigtige.map(s=>`
    <a class="sp-k" href="${esc(s.link||'#')}" target="_blank" rel="noopener">
      ${s.logo?`<img src="${esc(s.logo)}" alt="${esc(s.navn)}" class="sp-logo">`:
               `<div class="sp-nv">${esc(s.navn)}</div>`}
      <div class="sp-niv-txt">${esc(s.niveau||'')}</div>
    </a>`).join('')}
  </div>
</section>`:''}

<section class="sek">
  <h2 class="stitl">Kontakt os om sponsorat</h2>
  <form id="spf" onsubmit="submitSponsor(event)">
    <div class="g2f">
      <div class="fg"><label>Navn *</label><input name="navn" required></div>
      <div class="fg"><label>Virksomhed *</label><input name="virk" required></div>
    </div>
    <div class="g2f">
      <div class="fg"><label>Email *</label><input type="email" name="email" required></div>
      <div class="fg"><label>Telefon</label><input type="tel" name="tlf"></div>
    </div>
    <div class="fg"><label>Besked</label><textarea name="besk" rows="3" placeholder="Fortæl os om din virksomhed og ønsker…"></textarea></div>
    <button type="submit" class="knap-p fb">Send forespørgsel</button>
  </form>
  <div id="sp-kv" style="display:none" class="kv">
    <div class="kv-i"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h2>Tak for din interesse!</h2>
    <p>Vi vender tilbage hurtigst muligt.</p>
    <button class="knap-sek" onclick="navTil('forside')">Tilbage</button>
  </div>
  <div class="tc mt1 kontakt-dir">
    <a class="knap-dir" href="tel:${CONFIG.telefon.replace(/\s/g,'')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg> ${CONFIG.telefon}</a>
  </div>
</section>`;
}

function submitSponsor(e) {
  e.preventDefault();
  const f=e.target;
  const alle=DB.get('ek_sponsor_henvendelser')||[];
  alle.push({id:'sp'+Date.now(),navn:f.navn.value,virk:f.virk.value,email:f.email.value,tlf:f.tlf.value,besk:f.besk.value,dato:new Date().toISOString()});
  DB.set('ek_sponsor_henvendelser',alle);
  f.style.display='none'; document.getElementById('sp-kv').style.display='block';
}

/* ================================================================
   OM ERHVERVSKLUBBEN
   ================================================================ */
function pgOm() {
  /* SVG line-icons — Lucide-stil, stroke-width 1.4, mørkegrønne */
  const ekSVG = [
    { titel:'Netværk',          tekst:'Mød virksomhedsejere og beslutningstagere fra Aarhus-regionen.', cta:'Læs mere →', side:'om',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
    { titel:'Relationer',       tekst:'Stærke forretningsrelationer i professionelle, uformelle rammer.', cta:'Læs mere →', side:'om',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>` },
    { titel:'Golf & oplevelser',tekst:'Turneringer, rejser og særlige golfoplevelser året rundt.', cta:'Se oplevelser →', side:'golfarr',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="2"/><path d="M12 2v14M7 7l5-5 5 5"/><path d="M20 18H4"/></svg>` },
    { titel:'Sponsorværdi',     tekst:'Synlighed og associering med Lyngbygaard Golf og erhvervsklubben.', cta:'Læs mere →', side:'sponsor',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
    { titel:'EK-mesterskabet',  tekst:'Erhvervsklubbens sportslige højdepunkt for alle erhvervsmedlemmer.', cta:'Læs mere →', side:'om',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>` },
    { titel:'10+ events/år',    tekst:'Fra SIM Golf til julefrokost og udlandsrejser — altid noget i kalenderen.', cta:'Se events →', side:'kalender',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>` },
  ];

  /* SVG til CTA-knapper */
  const svgPhone = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg>`;
  const svgMail  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

  return `
<!-- ── EK PAGE HEADER ── -->
<div class="ph bg-mork ek-ph">
  <p class="ek-ph-over">LYG ERHVERVSKLUB</p>
  <h1 class="ek-ph-h1">Erhvervsklubben</h1>
  <p class="ek-ph-sub">${esc(CONFIG.omEK.tagline)}</p>
</div>

<!-- ── AUTENTISK ARRANGEMENTSFOTO ── -->
<div class="ek-foto-wrap">
  <div class="ek-foto" style="background-image:url('./images/ek-arrangement.jpg')" role="img" aria-label="Arrangement i Lyngbygaard Erhvervsklub">
    <div class="ek-foto-lag">
      <p class="ek-foto-citat">${esc(CONFIG.omEK.tekst)}</p>
    </div>
  </div>
</div>

<!-- ── EK-PUNKTER CAROUSEL ── -->
<section class="ek-cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-sek-titel">HVAD FÅR DU</h2>
    <button class="cx-se-alle" onclick="navTil('sponsor')">Bliv sponsor →</button>
  </div>
  <div class="cx-scroll ek-cx-scroll" id="cx-ek-pg" role="list">
    ${ekSVG.map(k => `
    <button class="ek-kort" role="listitem" onclick="navTil('${k.side}')">
      <div class="ek-k-ikon">${k.svg}</div>
      <strong class="ek-k-titel">${esc(k.titel)}</strong>
      <p class="ek-k-tekst">${esc(k.tekst)}</p>
      <span class="ek-k-cta">${esc(k.cta)}</span>
    </button>`).join('')}
  </div>
  <div class="cx-prikker" id="ek-pg-prikker">
    ${ekSVG.map((_,i)=>`<span class="cx-prik${i===0?' aktiv':''}"></span>`).join('')}
  </div>
</section>

<!-- ── CTA ── -->
<section class="sek">
  <div class="ek-cta-boks">
    <h3 class="ek-cta-h3">Interesseret i erhvervsmedlemskab?</h3>
    <p class="ek-cta-p">Kontakt os og hør om mulighederne.</p>
    <div class="ek-cta-knapper">
      <a class="ek-cta-knap primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">
        ${svgPhone} Ring til os
      </a>
      <button class="ek-cta-knap sekundaer" onclick="navTil('kontakt')">
        ${svgMail} Send besked
      </button>
    </div>
  </div>
</section>`;}


/* ================================================================
   KONTAKT
   Ingen mailto-knapper — kun formularer og telefon.
   Admin kan se alle henvendelser under Tilmeldinger → Kontakt.
   ================================================================ */
function pgKontakt() {
  return `
<div class="ph bg-mork">
  <h1>Kontakt</h1>
  <p>Vi er klar til at hjælpe dig</p>
</div>

<section class="sek">
  <div class="kontakt-boks">
    <a class="kl" href="tel:${CONFIG.telefon.replace(/\s/g,'')}"><span class="kl-svg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg></span><span>${CONFIG.telefon}</span><span class="kl-hint">Ring til os</span></a>
    <div class="kl"><span class="kl-svg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span><span>${esc(CONFIG.adresse)}</span></div>
    <a class="kl" href="${CONFIG.website}" target="_blank" rel="noopener"><span class="kl-svg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span><span>${CONFIG.website}</span></a>
  </div>
  <div class="tc mt1">
    <a class="knap-p" href="tel:${CONFIG.telefon.replace(/\s/g,'')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg> Ring til os</a>
  </div>
</section>

<section class="sek">
  <h2 class="stitl">Send en besked</h2>
  <p class="muted mb1">Vi vender tilbage inden for 1-2 hverdage.</p>
  <form id="kf" onsubmit="submitKontakt(event)">
    <div class="fg"><label>Virksomhed *</label><input name="virk" required placeholder="Virksomhedens navn"></div>
    <div class="g2f">
      <div class="fg"><label>Kontaktperson *</label><input name="kp" required placeholder="Dit navn"></div>
      <div class="fg"><label>Telefon</label><input type="tel" name="tlf" placeholder="12 34 56 78"></div>
    </div>
    <div class="fg"><label>Email *</label><input type="email" name="email" required placeholder="din@email.dk"></div>
    <div class="fg"><label>Besked *</label><textarea name="besk" rows="4" required placeholder="Skriv din besked her…"></textarea></div>
    <button type="submit" class="knap-p fb">Send besked</button>
  </form>
  <div id="kont-kv" style="display:none" class="kv">
    <div class="kv-i"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h2>Besked modtaget!</h2>
    <p>Vi vender tilbage hurtigst muligt.</p>
    <button class="knap-sek" onclick="navTil('forside')">Tilbage til forsiden</button>
  </div>
</section>`;
}

async function submitKontakt(e) {
  e.preventDefault();
  const f = e.target;
  const sb = getSupabase();

  const post = {
    virksomhed:    f.virk.value.trim(),
    kontaktperson: f.kp.value.trim(),
    telefon:       f.tlf.value.trim(),
    email:         f.email.value.trim(),
    besked:        f.besk.value.trim()
  };

  /* Gem lokalt uanset hvad */
  const alle = DB.get('ek_beskeder')||[];
  alle.push({ id:'k'+Date.now(), virk:post.virksomhed, kp:post.kontaktperson,
    tlf:post.telefon, email:post.email, besk:post.besked,
    dato:new Date().toISOString(), læst:false });
  DB.set('ek_beskeder', alle);

  /* Forsøg Supabase — fejl her stopper ikke bekræftelse */
  if (sb) {
    try {
      await sb.from('kontakt').insert(post);
    } catch (err) {
      console.warn('[Kontakt] Supabase gem fejlede (gemt lokalt):', err);
    }
  }

  f.style.display = 'none';
  document.getElementById('kont-kv').style.display = 'block';
}

/* ================================================================
   ADMIN

   ⚠️  SIKKERHEDSADVARSEL — PRODUKTIONSOPGAVE:
   Admin-koden (CONFIG.adminKode = '1234') er gemt i offentligt
   JavaScript og er IKKE reel adgangskontrol. Enhver kan se koden
   ved at inspicere app.js i browseren.

   For sikker administration i produktion kræves:
   · Supabase Auth (e-mail/password login)
   · Row Level Security (RLS) på alle Supabase-tabeller
   · Admin-funktioner bag server-side kontrol (Edge Functions)

   Denne løsning er acceptabel til intern testbrug, men må IKKE
   bruges til at beskytte følsomme data i produktion.
   Se supabase/OPSAETNING.md for implementeringsguide.
   ================================================================ */
let adminIN = false;
let _adFane = 'arr';

function pgAdmin() {
  if (!adminIN) return `
<div class="ph bg-mork"><h1>Administration</h1></div>
<section class="sek">
  <div class="admin-login">
    <p class="muted tc mb1">Log ind med Supabase Auth:<br>
      <code style="font-size:.8rem">email@eksempel.dk:adgangskode</code></p>
    <p class="muted tc mb1" style="font-size:.8rem">
      Eller kun kode (lokal test: <code>1234</code>)</p>
    <div class="fg"><label>Login</label><input type="password" id="ak-inp" maxlength="120"
      placeholder="email@eksempel.dk:kode" autocomplete="current-password"></div>
    <button class="knap-p fb" onclick="tjekKode()">Log ind</button>
    <div id="ak-fejl" class="fejl-b" style="display:none">Forkert kode — prøv igen.</div>
  </div>
</section>`;

  const faner=[['arr','Arrangementer'],['tilm','Tilmeldinger'],['kont','Kontakthenvendelser'],['sp','Sponsorer'],['golf','Firmapakker'],['indh','Indhold'],['inst','Indstillinger'],['bk','Backup']];
  return `
<div class="ph bg-mork" style="display:flex;justify-content:space-between;align-items:center">
  <div><h1>Administration</h1></div>
  <button class="knap-sek sm" onclick="adminLogUd()">Log ud</button>
</div>
<div class="af-nav">
  ${faner.map(([k,l])=>`<button class="af ${_adFane===k?'aktiv':''}" onclick="skiftFane('${k}')">${l}</button>`).join('')}
</div>
<section class="sek">
  ${_adFane==='arr'  ? adArr()  : ''}
  ${_adFane==='tilm' ? adTilm() : ''}
  ${_adFane==='kont' ? adKont() : ''}
  ${_adFane==='sp'   ? adSp()   : ''}
  ${_adFane==='golf' ? adGolf() : ''}
  ${_adFane==='indh' ? adIndhold() : ''}
  ${_adFane==='inst' ? adInst() : ''}
  ${_adFane==='bk'   ? adBk()   : ''}
</section>`;
}

/* Admin-login: forsøger Supabase Auth, falder tilbage til lokal kode.
   ⚠️ PRODUKTIONSOPGAVE: Opret admin-bruger i Supabase Dashboard →
   Authentication → Users → Invite user. Tilføj user.id til
   admin_brugere-tabellen. Se MIGRATIONSGUIDE.md. */
async function tjekKode() {
  const v = document.getElementById('ak-inp')?.value || '';
  const fejlEl = document.getElementById('ak-fejl');
  const sb = getSupabase();

  if (sb) {
    /* Forsøg Supabase Auth email/password — input-felt bruges som email:kode */
    /* Format understøttet: "email@dk.dk:kode" ELLER kun kode (fallback) */
    const delim = v.indexOf(':');
    if (delim > 0) {
      const email    = v.substring(0, delim).trim();
      const password = v.substring(delim + 1).trim();
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (!error && data?.session) {
          adminIN = true;
          navTil('admin');
          return;
        }
        /* Auth fejl — vis besked og fortsæt IKKE til fallback */
        if (fejlEl) {
          fejlEl.textContent = 'Supabase-login fejlede — tjek email og kode.';
          fejlEl.style.display = 'block';
        }
        return;
      } catch (err) {
        console.warn('[Admin] Auth fejl:', err);
      }
    }
  }

  /* Fallback: lokal kode (kun til test — IKKE til produktion) */
  if (v === getKode()) {
    adminIN = true;
    navTil('admin');
  } else {
    if (fejlEl) {
      fejlEl.textContent = 'Forkert kode — prøv igen.';
      fejlEl.style.display = 'block';
    }
  }
}

async function adminLogUd() {
  const sb = getSupabase();
  if (sb) { try { await sb.auth.signOut(); } catch {} }
  adminIN = false;
  navTil('forside');
}
function skiftFane(f) { _adFane=f; navTil('admin'); }

/* ── Admin: Arrangementer ── */
function adArr() {
  const arrs=getArr();
  return `
<div class="ad-hd">
  <button class="knap-p" onclick="visArrForm(null)">+ Nyt arrangement</button>
  <button class="knap-sek" onclick="kopierNytAar()">Kopier til nyt år</button>
</div>
<div class="ad-l">
  ${arrs.map(a=>`
  <div class="ad-rad${!erFremtidig(a.dato)?' ad-past':''}">
    <div class="ad-ri">
      <strong>${esc(a.titel)}</strong>
      <span>${fmtDato(a.dato)}${a.tid?' · '+esc(a.tid):''}</span>
      <span class="ad-st">${erFremtidig(a.dato)?(a.aaben?'Åben':'Lukket'):'• Afholdt'}</span>
    </div>
    <div class="ad-rk">
      <button class="knap-i" onclick="visArrForm('${a.id}')">Rediger</button>
      <button class="knap-i" onclick="kopierArr('${a.id}')">Kopi</button>
      <button class="knap-i red" onclick="sletArr('${a.id}')">Slet</button>
    </div>
  </div>`).join('')||'<p class="muted">Ingen arrangementer.</p>'}
</div>
<div id="arr-form-wrap"></div>`;
}

function visArrForm(id) {
  const a=id?(DB.get('ek_arr')||[]).find(x=>x.id===id):null;
  document.getElementById('arr-form-wrap').innerHTML=`
<div class="ad-form">
  <h3>${a?'Rediger':'Nyt'} arrangement</h3>
  <form onsubmit="gemArr(event,'${a?a.id:''}')">
    <div class="fg"><label>Titel *</label><input name="titel" required value="${a?esc(a.titel):''}"></div>
    <div class="g2f">
      <div class="fg"><label>Dato *</label><input type="date" name="dato" required value="${a?a.dato:''}"></div>
      <div class="fg"><label>Tid</label><input name="tid" placeholder="16.00-21.00" value="${a?esc(a.tid||''):''}"></div>
    </div>
    <div class="fg"><label>Sted</label><input name="sted" value="${a?esc(a.sted||''):''}"></div>
    <div class="fg"><label>Type / kategori</label><input name="type" value="${a?esc(a.type||''):''}"></div>
    <div class="fg"><label>Beskrivelse</label><textarea name="besk" rows="3">${a?esc(a.besk||''):''}</textarea></div>
    <div class="g2f">
      <div class="fg"><label>Maks pladser</label><input type="number" name="maks" min="1" value="${a?a.maks:40}"></div>
      <div class="fg"><label>Tilmeldte</label><input type="number" name="tlm" min="0" value="${a?a.tlm:0}"></div>
    </div>
    <div class="fg">
      <label>Status</label>
      <select name="status">
        <option value="aaben" ${!a||a.status==='aaben'?'selected':''}>Åben</option>
        <option value="lukket" ${a&&a.status==='lukket'?'selected':''}>Lukket</option>
      </select>
    </div>
    <div class="fg"><label class="cb-lbl"><input type="checkbox" name="aaben" ${!a||a.aaben?'checked':''}> Tilmelding åben</label></div>
    <div class="btn-row">
      <button type="submit" class="knap-p">${a?'Gem ændringer':'Opret arrangement'}</button>
      <button type="button" class="knap-sek" onclick="this.closest('.ad-form').remove()">Annuller</button>
    </div>
  </form>
</div>`;
  document.getElementById('arr-form-wrap').scrollIntoView({behavior:'smooth'});
}

function gemArr(e,id) {
  e.preventDefault(); const f=e.target;
  const arrs=DB.get('ek_arr')||[];
  const n={id:id||'a'+Date.now(),titel:f.titel.value,dato:f.dato.value,tid:f.tid.value,sted:f.sted.value,type:f.type.value,besk:f.besk.value,maks:parseInt(f.maks.value)||40,tlm:parseInt(f.tlm.value)||0,status:f.status.value,aaben:f.aaben.checked};
  if(id){const i=arrs.findIndex(a=>a.id===id);if(i>-1)arrs[i]=n;}else arrs.push(n);
  DB.set('ek_arr',arrs); skiftFane('arr');
}

function sletArr(id) {
  if(!confirm('Slet arrangement?')) return;
  DB.set('ek_arr',(DB.get('ek_arr')||[]).filter(a=>a.id!==id)); skiftFane('arr');
}

function kopierArr(id) {
  const a=(DB.get('ek_arr')||[]).find(x=>x.id===id); if(!a) return;
  const arrs=DB.get('ek_arr')||[];
  arrs.push({...a,id:'a'+Date.now(),titel:a.titel+' (kopi)',tlm:0});
  DB.set('ek_arr',arrs); skiftFane('arr'); alert('Kopieret ✓');
}

function kopierNytAar() {
  const y=prompt('Kopier alle arrangementer til år:',new Date().getFullYear()+1);
  if(!y||isNaN(+y)) return;
  const arrs=DB.get('ek_arr')||[];
  const nye=arrs.map(a=>({...a,id:'a'+Date.now()+Math.random().toString(36).substr(2,4),dato:a.dato.replace(/^\d{4}/,y),tlm:0,status:'aaben',aaben:true}));
  DB.set('ek_arr',[...arrs,...nye]); skiftFane('arr'); alert(`${nye.length} arrangementer kopieret til ${y} ✓`);
}

/* ── Admin: Tilmeldinger ── */
function adTilm() {
  const alle=DB.get('ek_tilm')||[];
  const q=window._tilmQ||'';
  const vis=q?alle.filter(t=>t.navn?.toLowerCase().includes(q.toLowerCase())||t.virk?.toLowerCase().includes(q.toLowerCase())):alle;
  return `
<div class="ad-hd">
  <input type="search" placeholder="Søg navn/virksomhed…" value="${esc(q)}" oninput="window._tilmQ=this.value;skiftFane('tilm')" style="flex:1;min-width:0">
  <button class="knap-sek" onclick="exportCSV()">Eksporter CSV</button>
</div>
${vis.length?`
<div style="overflow-x:auto">
<table class="tlm-tbl">
  <thead><tr><th>Arrangement</th><th>Navn</th><th>Virksomhed</th><th>Antal</th><th>Mødt</th><th></th></tr></thead>
  <tbody>
  ${vis.map(t=>`<tr>
    <td>${esc(t.arrTitel||'–')}</td><td>${esc(t.navn)}</td><td>${esc(t.virk)}</td>
    <td>${t.antal}</td>
    <td><input type="checkbox" ${t.mødt?'checked':''} onchange="markerMødt('${t.id}',this.checked)"></td>
    <td><button class="knap-i red" onclick="sletTilm('${t.id}')">Slet</button></td>
  </tr>`).join('')}
  </tbody>
</table>
</div>`:`<p class="muted">Ingen tilmeldinger${q?' matcher søgningen':' endnu'}.</p>`}`;
}

function markerMødt(id,v){const a=DB.get('ek_tilm')||[];const i=a.findIndex(t=>t.id===id);if(i>-1){a[i].mødt=v;DB.set('ek_tilm',a);}}
function sletTilm(id){if(!confirm('Slet tilmelding?'))return;DB.set('ek_tilm',(DB.get('ek_tilm')||[]).filter(t=>t.id!==id));skiftFane('tilm');}

function exportCSV() {
  const alle=DB.get('ek_tilm')||[];
  const hdr=['Arrangement','Navn','Virksomhed','Email','Telefon','Antal','Kommentar','Dato','Mødt'];
  const rws=alle.map(t=>[t.arrTitel||'',t.navn,t.virk,t.email,t.tlf,t.antal,t.kom||'',t.dato,t.mødt?'Ja':'Nej']);
  const csv=[hdr,...rws].map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download=`tilmeldinger_${idag()}.csv`;a.click();URL.revokeObjectURL(url);
}

/* ── Admin: Kontakthenvendelser ── */
function adKont() {
  const alle=DB.get('ek_beskeder')||[];
  return `
<p class="muted mb1">${alle.length} henvendelse${alle.length===1?'':'r'} i alt.</p>
${alle.length?`
<div class="ad-l">
  ${alle.slice().reverse().map(b=>`
  <div class="ad-form" style="margin-bottom:.6rem;padding:.85rem">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem">
      <div>
        <strong>${esc(b.kp||b.fn+' '+b.en||'–')}</strong> · ${esc(b.virk||'–')}
        <span class="muted" style="display:block;font-size:.75rem;margin-top:.15rem">${b.dato?new Date(b.dato).toLocaleDateString('da-DK'):''} · ${esc(b.email||'')} · ${esc(b.tlf||'')}</span>
      </div>
      <button class="knap-i red" onclick="sletBesked('${b.id}')">Slet</button>
    </div>
    <p style="margin-top:.5rem;font-size:.875rem">${esc(b.besk)}</p>
  </div>`).join('')}
</div>`:'<p class="muted">Ingen henvendelser endnu.</p>'}`;
}

function sletBesked(id){if(!confirm('Slet henvendelse?'))return;DB.set('ek_beskeder',(DB.get('ek_beskeder')||[]).filter(b=>b.id!==id));skiftFane('kont');}

/* ── Admin: Sponsorer ── */
function adSp() {
  const sps=DB.get('ek_sponsorer')||[];
  return `
<div class="ad-hd"><button class="knap-p" onclick="visSponsorForm(null)">+ Tilføj sponsor</button></div>
<div class="ad-l">
  ${sps.map(s=>`
  <div class="ad-rad">
    <div class="ad-ri"><strong>${esc(s.navn)}</strong><span>${esc(s.niveau||'')}</span></div>
    <div class="ad-rk">
      <button class="knap-i" onclick="visSponsorForm('${s.id}')">Rediger</button>
      <button class="knap-i red" onclick="sletSponsor('${s.id}')">Slet</button>
    </div>
  </div>`).join('')||'<p class="muted">Ingen sponsorer.</p>'}
</div>
<div id="sp-form-wrap"></div>`;
}

function visSponsorForm(id) {
  const s=id?(DB.get('ek_sponsorer')||[]).find(x=>x.id===id):null;
  document.getElementById('sp-form-wrap').innerHTML=`
<div class="ad-form">
  <h3>${s?'Rediger':'Ny'} sponsor</h3>
  <form onsubmit="gemSponsor(event,'${s?s.id:''}')">
    <div class="fg"><label>Navn *</label><input name="navn" required value="${s?esc(s.navn):''}"></div>
    <div class="fg"><label>Logo URL</label><input name="logo" placeholder="https://…" value="${s?esc(s.logo||''):''}"></div>
    <div class="fg"><label>Link URL</label><input name="link" placeholder="https://…" value="${s?esc(s.link||''):''}"></div>
    <div class="fg"><label>Niveau</label>
      <select name="niveau">${['guld','sølv','bronze','standard'].map(n=>`<option value="${n}" ${s&&s.niveau===n?'selected':''}>${n}</option>`).join('')}</select>
    </div>
    <div class="btn-row">
      <button type="submit" class="knap-p">Gem sponsor</button>
      <button type="button" class="knap-sek" onclick="this.closest('.ad-form').remove()">Annuller</button>
    </div>
  </form>
</div>`;
}

function gemSponsor(e,id) {
  e.preventDefault(); const f=e.target;
  const sps=DB.get('ek_sponsorer')||[];
  const n={id:id||'s'+Date.now(),navn:f.navn.value,logo:f.logo.value,link:f.link.value,niveau:f.niveau.value};
  if(id){const i=sps.findIndex(s=>s.id===id);if(i>-1)sps[i]=n;}else sps.push(n);
  DB.set('ek_sponsorer',sps); skiftFane('sp');
}

function sletSponsor(id){if(!confirm('Fjern sponsor?'))return;DB.set('ek_sponsorer',(DB.get('ek_sponsorer')||[]).filter(s=>s.id!==id));skiftFane('sp');}

/* ── Admin: Firmapakker ── */
function adGolf() {
  const pk=DB.get('ek_pakker')||CONFIG.golfPakker;
  return `
<p class="muted mb1">Ændringer vises straks på "Book firmaarrangement"-siden.</p>
${pk.map((p,i)=>`
<div class="ad-form" style="margin-bottom:.75rem">
  <form onsubmit="gemPakke(event,${i})">
    <div class="g2f">
      <div class="fg"><label>Titel</label><input name="titel" value="${esc(p.titel)}"></div>
      <div class="fg"><label>Pris</label><input name="pris" value="${esc(p.pris)}"></div>
    </div>
    <div class="fg"><label>Beskrivelse</label><textarea name="besk" rows="2">${esc(p.beskrivelse)}</textarea></div>
    <div class="fg"><label>Inkluderer (én pr. linje)</label><textarea name="inkl" rows="3">${(p.inkl||[]).join('\n')}</textarea></div>
    <button type="submit" class="knap-i">Gem</button>
  </form>
</div>`).join('')}`;
}

function gemPakke(e,i){
  e.preventDefault(); const f=e.target;
  const pk=DB.get('ek_pakker')||CONFIG.golfPakker;
  pk[i]={...pk[i],titel:f.titel.value,pris:f.pris.value,beskrivelse:f.besk.value,inkl:f.inkl.value.split('\n').filter(Boolean)};
  DB.set('ek_pakker',pk); alert('Pakke gemt ✓');
}

/* ── Admin: Indhold (Nyheder · Partnere · Medlemsvirksomheder) ── */
function adIndhold() {
  const nyheder = DB.get('ek_nyheder')||[];
  const partnere = DB.get('ek_partnere')||[];
  const mvirk   = DB.get('ek_mvirksomheder')||[];

  return `
<div class="ad-form mb1">
  <h3>Nyheder <span class="muted">(${nyheder.length})</span></h3>
  <p class="muted mb1">Vises i "Seneste nyt"-carousel på forsiden.</p>
  <form onsubmit="tilfoejNyhed(event)">
    <div class="fg"><label>Overskrift *</label><input name="titel" required placeholder="Nyhedsoverskrift"></div>
    <div class="fg"><label>Tekst</label><input name="tekst" placeholder="Kort teaser"></div>
    <div class="g2f">
      <div class="fg"><label>Dato</label><input type="date" name="dato"></div>
      <div class="fg"><label>Billede URL</label><input name="billede" placeholder="https://…"></div>
    </div>
    <button type="submit" class="knap-p">+ Tilføj nyhed</button>
  </form>
  ${nyheder.length ? `<div class="ad-l mt1">${nyheder.map((n,i)=>`
  <div class="ad-rad"><div class="ad-ri"><strong>${esc(n.titel)}</strong><span>${n.dato||''}</span></div>
  <div class="ad-rk"><button class="knap-i red" onclick="sletNyhed(${i})">Slet</button></div>
  </div>`).join('')}</div>` : ''}
</div>

<div class="ad-form mb1">
  <h3>Partnerfordele <span class="muted">(${partnere.length})</span></h3>
  <p class="muted mb1">Vises i "Partnerfordele"-carousel på forsiden.</p>
  <form onsubmit="tilfoejPartner(event)">
    <div class="fg"><label>Virksomhed *</label><input name="navn" required></div>
    <div class="fg"><label>Fordel</label><input name="fordel" placeholder="20 % rabat til medlemmer"></div>
    <div class="fg"><label>Tekst</label><input name="tekst" placeholder="Kort beskrivelse"></div>
    <div class="g2f">
      <div class="fg"><label>Logo URL</label><input name="logo" placeholder="https://…"></div>
      <div class="fg"><label>Link URL</label><input name="link" placeholder="https://…"></div>
    </div>
    <button type="submit" class="knap-p">+ Tilføj partner</button>
  </form>
  ${partnere.length ? `<div class="ad-l mt1">${partnere.map((p,i)=>`
  <div class="ad-rad"><div class="ad-ri"><strong>${esc(p.navn)}</strong><span>${esc(p.fordel||'')}</span></div>
  <div class="ad-rk"><button class="knap-i red" onclick="sletPartner(${i})">Slet</button></div>
  </div>`).join('')}</div>` : ''}
</div>

<div class="ad-form">
  <h3>Medlemsvirksomheder <span class="muted">(${mvirk.length})</span></h3>
  <p class="muted mb1">Vises i "Medlemsvirksomheder"-carousel på forsiden.</p>
  <form onsubmit="tilfoejMVirk(event)">
    <div class="fg"><label>Virksomhed *</label><input name="navn" required></div>
    <div class="fg"><label>Branche</label><input name="branche"></div>
    <div class="fg"><label>Logo URL</label><input name="logo" placeholder="https://…"></div>
    <button type="submit" class="knap-p">+ Tilføj virksomhed</button>
  </form>
  ${mvirk.length ? `<div class="ad-l mt1">${mvirk.map((v,i)=>`
  <div class="ad-rad"><div class="ad-ri"><strong>${esc(v.navn)}</strong><span>${esc(v.branche||'')}</span></div>
  <div class="ad-rk"><button class="knap-i red" onclick="sletMVirk(${i})">Slet</button></div>
  </div>`).join('')}</div>` : ''}
</div>`;
}

function tilfoejNyhed(e){e.preventDefault();const f=e.target;const a=DB.get('ek_nyheder')||[];a.unshift({titel:f.titel.value,tekst:f.tekst.value,dato:f.dato.value,billede:f.billede.value});DB.set('ek_nyheder',a);skiftFane('indh');}
function sletNyhed(i){if(!confirm('Slet nyhed?'))return;const a=DB.get('ek_nyheder')||[];a.splice(i,1);DB.set('ek_nyheder',a);skiftFane('indh');}
function tilfoejPartner(e){e.preventDefault();const f=e.target;const a=DB.get('ek_partnere')||[];a.push({navn:f.navn.value,fordel:f.fordel.value,tekst:f.tekst.value,logo:f.logo.value,link:f.link.value});DB.set('ek_partnere',a);skiftFane('indh');}
function sletPartner(i){if(!confirm('Fjern partner?'))return;const a=DB.get('ek_partnere')||[];a.splice(i,1);DB.set('ek_partnere',a);skiftFane('indh');}
function tilfoejMVirk(e){e.preventDefault();const f=e.target;const a=DB.get('ek_mvirksomheder')||[];a.push({navn:f.navn.value,branche:f.branche.value,logo:f.logo.value});DB.set('ek_mvirksomheder',a);skiftFane('indh');}
function sletMVirk(i){if(!confirm('Fjern virksomhed?'))return;const a=DB.get('ek_mvirksomheder')||[];a.splice(i,1);DB.set('ek_mvirksomheder',a);skiftFane('indh');}

/* ── Admin: Indstillinger ── */
function adInst() {
  const hero=DB.get('ek_hero')||{};
  const gb=getGolfboxUrl();
  return `
<div class="ad-form mb1">
  <h3>Forside — hero</h3>
  <form onsubmit="gemHero(event)">
    <div class="fg"><label>Overskrift</label><input name="tekst" value="${esc(hero.tekst||CONFIG.heroTekst)}"></div>
    <div class="fg"><label>Undertekst</label><textarea name="under" rows="2">${esc(hero.under||CONFIG.heroUnder)}</textarea></div>
    <div class="fg"><label>Hero-billede URL</label><input name="billede" value="${esc(hero.billede||CONFIG.billeder.hero)}"></div>
    <button type="submit" class="knap-p">Gem</button>
  </form>
</div>
<div class="ad-form mb1">
  <h3>GolfBox login-link</h3>
  <p class="muted mb1">Link til direkte GolfBox-login. Alle GolfBox-knapper i appen bruger dette link.</p>
  <form onsubmit="gemGolfbox(event)">
    <div class="fg"><label>URL</label><input name="url" value="${esc(gb)}" placeholder="https://golfbox.golf/"></div>
    <button type="submit" class="knap-p">Gem GolfBox-link</button>
  </form>
</div>
<div class="ad-form">
  <h3>Skift admin-kode</h3>
  <form onsubmit="skiftKode(event)">
    <div class="fg"><label>Nuværende kode</label><input type="password" name="gammel" required autocomplete="current-password"></div>
    <div class="fg"><label>Ny kode</label><input type="password" name="ny" required minlength="4" autocomplete="new-password"></div>
    <div class="fg"><label>Bekræft ny kode</label><input type="password" name="bk" required autocomplete="new-password"></div>
    <button type="submit" class="knap-p">Skift kode</button>
  </form>
</div>`;
}

function gemHero(e){
  e.preventDefault(); const f=e.target;
  DB.set('ek_hero',{tekst:f.tekst.value,under:f.under.value,billede:f.billede.value});
  alert('Hero gemt ✓');
}

function gemGolfbox(e){
  e.preventDefault();
  const url=e.target.url.value.trim();
  if(!url.startsWith('http')){alert('URL skal starte med https://');return;}
  DB.set('ek_golfbox',url);
  alert('GolfBox-link gemt ✓');
}

function skiftKode(e){
  e.preventDefault(); const f=e.target;
  if(f.gammel.value!==getKode()){alert('Nuværende kode forkert.');return;}
  if(f.ny.value!==f.bk.value){alert('Nye koder matcher ikke.');return;}
  DB.set('ek_kode',f.ny.value); alert('Kode ændret ✓'); f.reset();
}

/* ── Admin: Backup ── */
function adBk() {
  return `
<div class="ad-form mb1">
  <h3>Eksportér backup</h3>
  <p class="muted mb1">Hent al data som JSON-fil til lokal sikkerhedskopiering.</p>
  <button class="knap-p" onclick="eksporter()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download backup</button>
</div>
<div class="ad-form mb1">
  <h3>Importér backup</h3>
  <p class="muted mb1">Genindlæs fra en tidligere backup-fil.</p>
  <input type="file" id="bk-fil" accept=".json" onchange="importer(this)">
</div>
<div class="ad-form">
  <h3>Nulstil til standarddata</h3>
  <p class="muted mb1">Sletter alt og genindlæser standard-arrangementer og -data.</p>
  <button class="knap-rød" onclick="nulstil()">Nulstil alt</button>
</div>`;
}

function eksporter(){
  const d={arr:DB.get('ek_arr'),tilm:DB.get('ek_tilm'),sp:DB.get('ek_sponsorer'),pk:DB.get('ek_pakker'),hero:DB.get('ek_hero'),golfbox:DB.get('ek_golfbox'),beskeder:DB.get('ek_beskeder'),dato:new Date().toISOString()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`lyg-ek-backup-${idag()}.json`;a.click();URL.revokeObjectURL(url);
}

function importer(inp){
  const fil=inp.files[0]; if(!fil) return;
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const d=JSON.parse(ev.target.result);
      if(!confirm('Overskriver al nuværende data. Fortsæt?')) return;
      if(d.arr)      DB.set('ek_arr',d.arr);
      if(d.tilm)     DB.set('ek_tilm',d.tilm);
      if(d.sp)       DB.set('ek_sponsorer',d.sp);
      if(d.pk)       DB.set('ek_pakker',d.pk);
      if(d.hero)     DB.set('ek_hero',d.hero);
      if(d.golfbox)  DB.set('ek_golfbox',d.golfbox);
      if(d.beskeder) DB.set('ek_beskeder',d.beskeder);
      alert('Backup importeret ✓'); navTil('forside');
    }catch{alert('Ugyldig backup-fil.');}
  };
  r.readAsText(fil);
}

function nulstil(){
  if(!confirm('Slet al data og genindlæs standarddata?')) return;
  ['ek_arr','ek_tilm','ek_sponsorer','ek_pakker','ek_hero','ek_kode','ek_golfbox',
   'ek_venteliste','ek_beskeder','ek_golf_booking','ek_sponsor_henvendelser',
   'ek_paam','ek_paam_vist','ek_init'].forEach(k=>DB.del(k));
  init(); navTil('forside'); alert('Data nulstillet ✓');
}

/* ================================================================
   KALENDER / PÅMINDELSER
   ================================================================ */
function tilfoejKal(id){
  const a=getArr().find(x=>x.id===id); if(!a) return;
  const d=a.dato.replace(/-/g,'');
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(a.titel)}&dates=${d}/${d}${a.sted?'&location='+encodeURIComponent(a.sted):''}${a.besk?'&details='+encodeURIComponent(a.besk):''}`, '_blank','noopener');
}

/* ================================================================
   PUSH NOTIFIKATIONER — Web Push + lokal fallback
   ================================================================ */

/* Registrér Web Push subscription hos Supabase */
async function registrerPushSubscription(swReg) {
  const vapidKey = CONFIG.vapidPublic;
  if (!vapidKey || vapidKey === 'INDSÆT_DIN_VAPID_PUBLIC_KEY') return null;

  try {
    const sub = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });

    const subJson = sub.toJSON();

    /* Gem subscription i Supabase */
    if (CONFIG.supabaseUrl && CONFIG.supabaseUrl !== 'INDSÆT_DIN_SUPABASE_URL') {
      await fetch(`${CONFIG.supabaseUrl}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.supabaseAnon,
          'Authorization': `Bearer ${CONFIG.supabaseAnon}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          p256dh:   subJson.keys.p256dh,
          auth:     subJson.keys.auth,
          device_label: navigator.userAgent.substring(0, 80)
        })
      });
    }

    /* Synkronisér arrangementer til Supabase */
    await synkroniserArrangementer();

    DB.set('ek_push_subscription', subJson.endpoint);
    return sub;
  } catch (err) {
    console.warn('[Push] Subscription fejlede:', err);
    return null;
  }
}

/* Synkronisér arrangementdata til Supabase (til push-scheduler) */
async function synkroniserArrangementer() {
  if (!CONFIG.supabaseUrl || CONFIG.supabaseUrl === 'INDSÆT_DIN_SUPABASE_URL') return;
  const arrs = getArr().filter(a => erFremtidig(a.dato) && a.aaben);
  for (const a of arrs) {
    await fetch(`${CONFIG.supabaseUrl}/rest/v1/arrangements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.supabaseAnon,
        'Authorization': `Bearer ${CONFIG.supabaseAnon}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id:    a.id,
        titel: a.titel,
        dato:  a.dato,
        sted:  a.sted || '',
        aaben: a.aaben
      })
    }).catch(() => {});
  }
}

/* Helper: konvertér VAPID public key fra base64 til Uint8Array */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

/* Vis push-dialog (første gang, brugerinitieret) */
function visPushDialog() {
  if (DB.get('ek_push_spurgt')) return;
  /* Kræver Notification API */
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'default') { DB.set('ek_push_spurgt', true); return; }
  setTimeout(() => {
    const modal = document.getElementById('push-modal');
    if (modal) modal.style.display = 'flex';
  }, 4500);
}

async function accepterPush() {
  const modal = document.getElementById('push-modal');
  if (modal) modal.style.display = 'none';
  DB.set('ek_push_spurgt', true);

  /* Anmod tilladelse */
  const perm = await Notification.requestPermission().catch(() => 'denied');

  if (perm === 'granted') {
    /* Forsøg rigtig Web Push-subscription */
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      const sub = await registrerPushSubscription(reg);
      if (sub) {
        console.log('[Push] Web Push aktiveret ✅');
        return;
      }
    }
    /* Fallback: lokal påmindelseslogik */
    console.log('[Push] Lokal fallback aktiveret (ingen Supabase konfigureret)');
  } else {
    console.log('[Push] Tilladelse afvist');
  }
}

function afvisPush() {
  const modal = document.getElementById('push-modal');
  if (modal) modal.style.display = 'none';
  DB.set('ek_push_spurgt', true);
}

/* Aktiver påmindelser for enkelt arrangement (🔔-knap) */
async function aktPaam(id) {
  const a = getArr().find(x => x.id === id);
  if (!a) return;

  if (!('Notification' in window)) {
    if (confirm(`Din browser understøtter ikke push-notifikationer.\nVil du tilføje "${a.titel}" til din kalender?`))
      tilfoejKal(id);
    return;
  }
  if (Notification.permission === 'denied') {
    if (confirm(`Notifikationer er blokeret i dine indstillinger.\nVil du tilføje "${a.titel}" til din kalender?`))
      tilfoejKal(id);
    return;
  }

  let perm = Notification.permission;
  if (perm === 'default') {
    try { perm = await Notification.requestPermission(); } catch { perm = 'denied'; }
  }

  if (perm === 'granted') {
    /* Gem lokal påmindelse (fallback) */
    const pm = DB.get('ek_paam') || {};
    pm[id] = { dato: a.dato, titel: a.titel, tider: [14, 7, 3] };
    DB.set('ek_paam', pm);

    /* Forsøg Web Push subscription */
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) await registrerPushSubscription(reg);

    alert(`✅ Påmindelser aktiveret for "${a.titel}".\nDu får besked 14, 7 og 3 dage før.`);
  } else {
    if (confirm(`Notifikationer ikke tilladt.\nVil du tilføje "${a.titel}" til din kalender?`))
      tilfoejKal(id);
  }
}

/* Lokal påmindelses-tjek (kører ved app-åbning — fallback uden server) */
function tjekPaam() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const pm   = DB.get('ek_paam') || {};
  const vist = DB.get('ek_paam_vist') || {};
  const nu   = new Date();
  Object.entries(pm).forEach(([id, p]) => {
    (p.tider || []).forEach(dage => {
      const k = `${id}_${dage}`;
      if (vist[k]) return;
      const gr = new Date(p.dato + 'T00:00:00');
      gr.setDate(gr.getDate() - dage);
      if (nu >= gr) {
        try { new Notification(`Husk: ${p.titel}`, { body: `Om ${dage} dag${dage > 1 ? 'e' : ''}`, icon: './icons/icon-192.png' }); } catch {}
        vist[k] = true;
      }
    });
  });
  DB.set('ek_paam_vist', vist);
}

/* ================================================================
   EVENTS
   ================================================================ */
function bindAll(){
  const ak=document.getElementById('ak-inp');
  if(ak){ak.addEventListener('keydown',e=>{if(e.key==='Enter')tjekKode();});ak.focus();}
  bindCarouselPrikker('cx-arr',    'cx-arr-prikker');
  bindCarouselPrikker('cx-pakker', 'cx-pk-prikker');
  bindCarouselPrikker('cx-ek-pg',  'ek-pg-prikker');
  /* Sikr golf-pakke click virker på touch (swipe vs. tap) */
  _bindTapCarousel('cx-pakker', '.golf-pk-txt', btn => {
    const titel = btn.dataset.pakketitel;
    if (titel) golfVælgPakke(titel);
  });
}

/* Skelner tap fra swipe i carousel — bruges til golf-pakker */
function _bindTapCarousel(scrollId, btnSel, handler) {
  const scroll = document.getElementById(scrollId);
  if (!scroll) return;
  let startX = 0, startY = 0, moved = false;
  scroll.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    moved  = false;
  }, { passive: true });
  scroll.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > 8 || dy > 8) moved = true;
  }, { passive: true });
  scroll.addEventListener('touchend', e => {
    if (moved) return;
    const btn = e.target.closest(btnSel);
    if (btn) { e.preventDefault(); handler(btn); }
  });
}

function bindCarouselPrikker(scrollId, prikId) {
  const scroll = document.getElementById(scrollId);
  const prikker = document.getElementById(prikId);
  if (!scroll || !prikker) return;
  const kort = scroll.querySelectorAll('.cx-kort');
  if (!kort.length) return;
  scroll.addEventListener('scroll', () => {
    const w = scroll.offsetWidth;
    const idx = Math.round(scroll.scrollLeft / w);
    prikker.querySelectorAll('.cx-prik').forEach((p,i) => p.classList.toggle('aktiv', i === idx));
  }, { passive: true });
}

/* ================================================================
   INSTALL PROMPT — Android/Chrome (beforeinstallprompt)
   ================================================================ */
const INSTALL_KEY = 'ek_install_afvist';
let installEvt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvt = e;
  /* Vis kun hvis brugeren ikke har afvist */
  if (!DB.get(INSTALL_KEY)) {
    const b = document.getElementById('install-banner');
    if (b) b.style.display = 'flex';
  }
});

function installApp() {
  if (!installEvt) return;
  installEvt.prompt();
  installEvt.userChoice.then(choice => {
    installEvt = null;
    const b = document.getElementById('install-banner');
    if (b) b.style.display = 'none';
    if (choice.outcome === 'dismissed') DB.set(INSTALL_KEY, true);
  });
}

function afvisInstall() {
  DB.set(INSTALL_KEY, true);
  const b = document.getElementById('install-banner');
  if (b) b.style.display = 'none';
}

/* iOS install guide — vises én gang i Safari på iPhone/iPad */
function visIosInstallGuide() {
  const erIos    = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const erSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);
  const erInstalleret = window.navigator.standalone === true;
  const harSetGuide   = DB.get('ek_ios_guide_vist');
  if (erIos && erSafari && !erInstalleret && !harSetGuide) {
    setTimeout(() => {
      const m = document.getElementById('ios-install-modal');
      if (m) m.style.display = 'flex';
    }, 3000); /* vent 3 sek efter load */
  }
}

function afvisIosInstall() {
  DB.set('ek_ios_guide_vist', true);
  const m = document.getElementById('ios-install-modal');
  if (m) m.style.display = 'none';
}

/* ================================================================
   APP-OPDATERING — kun ved reel ny SW-version (bug-fixed v4.4)
   ================================================================ */
let nySwVenter = null;
let reloadPgangSkete = false;

function visOpdaterBanner() {
  const b = document.getElementById('update-banner');
  if (b) b.style.display = 'flex';
}

function opdaterApp() {
  const b = document.getElementById('update-banner');
  if (b) b.style.display = 'none';
  /* Send SKIP_WAITING til den ventende SW */
  if (nySwVenter) {
    nySwVenter.postMessage({ type: 'SKIP_WAITING' });
    /* controllerchange vil herefter trigge reload */
  } else {
    /* Fallback: ryd caches og reload */
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => location.reload(true));
    } else {
      location.reload(true);
    }
  }
}

/* ================================================================
   PUSH-DIALOG — spørg bruger om påmindelser (første gang)
   ================================================================ */
function visPushDialog() {
  if (DB.get('ek_push_spurgt')) return;           // kun én gang
  if (!('Notification' in window)) return;        // ikke understøttet
  if (Notification.permission !== 'default') return; // allerede svaret

  setTimeout(() => {
    const modal = document.getElementById('push-modal');
    if (modal) modal.style.display = 'flex';
  }, 4500); // vent til animation er færdig
}

function accepterPush() {
  const modal = document.getElementById('push-modal');
  if (modal) modal.style.display = 'none';
  DB.set('ek_push_spurgt', true);
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      console.log('[Push] Tilladelse givet ✅');
    }
  });
}

function afvisPush() {
  const modal = document.getElementById('push-modal');
  if (modal) modal.style.display = 'none';
  DB.set('ek_push_spurgt', true);
}

/* ================================================================
   GOLFBOX — migrér gammelt forkert link i localStorage
   ================================================================ */
function migrérGolfbox() {
  const gammelt = DB.get('ek_golfbox');
  const dårlige = [
    'https://www.golfbox.dk/site/login/loginform.asp',
    'https://golf.dk',
    'https://www.golf.dk',
  ];
  if (gammelt && dårlige.some(d => gammelt.startsWith(d))) {
    DB.set('ek_golfbox', CONFIG.golfboxUrl);
    console.log('[GB] Migreret:', CONFIG.golfboxUrl);
  }
}

/* ================================================================
   BOOT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  migrationBackup(); // snapshot af eksisterende data inden init
  init();
  migrérGolfbox();
  tjekPaam();

  /* Service Worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        console.log('[SW] Scope:', reg.scope);

        /* Tjek for opdatering ved åbning */
        reg.update().catch(() => {});

        /* updatefound = ny SW-version er fundet og installeres */
        reg.addEventListener('updatefound', () => {
          const nyWorker = reg.installing;
          if (!nyWorker) return;
          nyWorker.addEventListener('statechange', () => {
            /* 'installed' + eksisterende controller = ny version klar til aktivering */
            if (nyWorker.state === 'installed' && navigator.serviceWorker.controller) {
              nySwVenter = nyWorker;
              visOpdaterBanner();
            }
          });
        });

        /* Hvis der allerede venter en SW ved åbning (fra forrige besøg) */
        if (reg.waiting && navigator.serviceWorker.controller) {
          nySwVenter = reg.waiting;
          visOpdaterBanner();
        }
      })
      .catch(e => console.warn('[SW] Fejl:', e));

    /* SW_UPDATED fra service-worker — kun brugt som backup-signal,
       IKKE til at vise banner alene (undgår false positives) */
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'SW_UPDATED') {
        /* Ignoreret i v4.4 — updatefound håndterer dette korrekt */
      }
    });

    /* controllerchange: ny SW har overtaget — reload siden én gang */
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloadPgangSkete) {
        reloadPgangSkete = true;
        location.reload();
      }
    });
  }

  navTil('forside');

  /* ── NAVIGATION: mobil "Mere"-overlay + desktop vis alle knapper ── */
  const isMobilNav = () => window.innerWidth < 640;

  /* Skift Mere-knap til "Mere" på mobil / "Admin" på desktop */
  function opdaterNavLayout() {
    const mobil = isMobilNav();
    const mereLbl = document.getElementById('nav-mere-lbl');
    const mereBtn = document.getElementById('nav-mere-btn');
    const sponsorBtn = document.getElementById('nav-sponsor-desk');
    const kontaktBtn = document.getElementById('nav-kontakt-desk');
    if (!mereBtn) return;
    if (mobil) {
      if (mereLbl) mereLbl.textContent = 'Mere';
      mereBtn.dataset.side = ''; /* ikke direkte nav på mobil */
      if (sponsorBtn) sponsorBtn.style.display = 'none';
      if (kontaktBtn) kontaktBtn.style.display = 'none';
    } else {
      if (mereLbl) mereLbl.textContent = 'Admin';
      mereBtn.dataset.side = 'admin';
      if (sponsorBtn) sponsorBtn.style.display = '';
      if (kontaktBtn) kontaktBtn.style.display = '';
    }
  }
  opdaterNavLayout();
  window.addEventListener('resize', opdaterNavLayout);

  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;
    if (btn.id === 'nav-mere-btn' && isMobilNav()) {
      /* Åbn Mere-overlay */
      aabMere();
      return;
    }
    if (btn.dataset.side) navTil(btn.dataset.side);
  });

  /* Splash */
  const sp = document.getElementById('splash');
  if (sp) { setTimeout(() => { sp.style.opacity = '0'; setTimeout(() => sp.remove(), 400); }, 600); }

  /* iOS installér-guide */
  visIosInstallGuide();

  /* Push-notifikation dialog */
  visPushDialog();
});
