/* ================================================================
   LYNGBYGAARD ERHVERVSKLUB — app.js v8.6
   Al konfiguration samlet øverst. Ret her – ingen andre steder.

   CHANGELOG v8.6 (fra v8.5):
   · Web Push via Cloudflare Worker — rigtig ES256/ECDSA signering og AES-128-GCM kryptering
   · VAPID public key hentes fra CF Worker /public-key (ikke direkte fra Apps Script)
   · Admin Kommunikation: kanal-valg (email / push / begge)
   · Fjernet VAPID-limiterings-advarsel (løst med CF Worker)
   · CF Worker status-banner i admin-panelet
   · Version bump: v8.5 → v8.6

   CHANGELOG v8.5 (fra v8.4):
   · Web Push (VAPID): abonner/framelding, iOS-vejledning
   · Admin: Ny fane "Kommunikation" — påmindelsesindstillinger, historik, preview
   · Admin: Manuel besked til alle erhvervsmedlemmer eller deltagere i et arrangement
   · Admin: Testbesked til sikker testemail
   · Admin: Nyt arrangement-push til alle med push-abonnement
   · Admin: Oversigt over push-abonnenter
   · Automatiske påmindelser: 7/2 dage før FRIST + 1 dag før arrangement
   · Service Worker: pushsubscriptionchange-handler
   · Version bump: v8.4 → v8.5
   · Migration: v8.5-markør


   CHANGELOG v8.4 (fra v8.3.1):
   · Forside: overskrift "MERE END GOLF", undertekst "Relationer. Netværk. Forretning."
   · Forside: stats-bjælke — knap 100 virksomheder, 8-9 arrangementer/år, EK-Golf onsdage
   · Firmaarrangement: opdigtede priser fjernet — erstattet med kontakt-til-tilbud
   · Ny funktion pgMøder(): møder og konferencer (Pejsestuen, 50 pers., Brasseriet)
   · Ny funktion pgNyheder(): nyheder med admin-godkendelse og kilde-angivelse
   · pgOm(): opdateret med verificeret EK-indhold (netværk, virksomhedsbesøg, rejser, EK-Golf)
   · pgOm(): professionelt medlemskatalog med 97 verificerede virksomheder og søgning
   · pgSponsor(): opdateret uden priser — individuelt tilpassede partnerskaber
   · pgGolf(): opdateret som professionelt firmaarrangement-afsnit uden opdigtede pakker/priser
   · Router: 'moeder' og 'nyheder' tilføjet
   · Navigation: Oversigt-menu inkluderer Møder og Nyheder
   · Footer: v8.4

   CHANGELOG v8.3 (fra v8.2):
   · Supabase-push-kode fjernet (registrerPushSubscription, synkroniserArrangementer, urlBase64ToUint8Array)
   · PWA-installationsvejledning tilføjet under pgOm() — enhedsdetekteret
   · Påmindelser: 14, 7 og 3 dage (via Apps Script sendDagligePaamindelser)
   · adInst(): "Skift admin-kode"-formular fjernet (erstattet af Google OAuth)
   · GDPR-samtykke-afkrydsning tilføjet ved tilmelding
   · Program 2027: sæsonbesked i informationsbjælke og kalender
   · v8.3 migrationsmarkør i init()
   · Footer opdateret til v8.3

   CHANGELOG v8.2 (fra v8.1):
   · Supabase fjernet — erstattet med Google Apps Script backend
   · Booking via fetch() til Apps Script Web App URL (atomisk + LockService)
   · Venteliste sendt til Apps Script (email via Brevo)
   · Firmaarrangement-forespørgsel til Apps Script
   · Admin login via Google OAuth (admin.html)
   · Ingen Supabase-URL, anon-nøgle eller klient i browserkode
   · GolfBox-integration bevaret (https://golfbox.golf/)
   · localStorage-nøgler (ek_*) uændrede
   · Design, animation og PWA-funktioner uændrede fra v8.1
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
  heroBillede: './images/ek-klubhus.jpg',

  /* ── Google Apps Script backend ────────────────────────────
     Erstattet Supabase. Deploy som Web App i Apps Script.
     Indsæt den genererede Web App URL nedenfor efter deployment.
     ─────────────────────────────────────────────────────────── */
  scriptUrl: 'INDSÆT_APPS_SCRIPT_WEB_APP_URL',

  /* v8.6: Cloudflare Worker URL til Web Push.
     Sæt til URL for din deployede push-worker, f.eks.:
     'https://lyg-push-worker.din-subdomain.workers.dev'
     Lad stå tom hvis CF Worker ikke er deployeret endnu. */
  pushWorkerUrl: '',

  /* REQUEST_TOKEN: Samme værdi som i Apps Script Properties.
     Bruges som enkel identifikation af kald fra appen — ikke som
     hemmelig adgangskontrol, da frontend-koden er offentlig.
     Egentlig adgangskontrol til admin sker via Google OAuth server-side.
     Erstat pladsholder med din REQUEST_TOKEN-værdi. */
  requestToken: 'INDSÆT_REQUEST_TOKEN',

  /* v8.4: Ingen opdigtede priser — alle forespørgsler håndteres individuelt */
  golfArrangementer: [
    { id:'ga1', titel:'Company Day',         beskrivelse:'En hel dag for din virksomhed — golf, forplejning og fællesskab i professionelle rammer.',         inkl:['Golf på Lyngbygaard-banen','Forplejning tilpasset jeres ønsker','Fleksibelt program','Professionel tilrettelæggelse'] },
    { id:'ga2', titel:'VIP-arrangement',     beskrivelse:'Skræddersyet oplevelse for jeres vigtigste gæster — eksklusivt, professionelt og uforglemmelig.', inkl:['Personlig service','Eksklusiv oplevelse','Tilpasset program','Præmier og diplomer'] },
    { id:'ga3', titel:'Kundearrangement',    beskrivelse:'Styrk relationen til jeres kunder med golf og netværk i naturskønne omgivelser.',                  inkl:['Golf for alle niveauer','Frokost og netværk','Professionel afholdelse','Fleksibel dato'] },
    { id:'ga4', titel:'Medarbejderarrangement', beskrivelse:'Giv jeres team en dag at huske — med golf, samvær og god stemning på banen.',                   inkl:['Golf for alle niveauer','Teambuilding-elementer','Forplejning','Sociale aktiviteter'] },
    { id:'ga5', titel:'Møde + Golf',         beskrivelse:'Kombinér et produktivt møde med golf. Ideelt til bestyrelsesdage, ledergrupper og partnermøder.', inkl:['Mødelokale med AV-udstyr','Golf på banen','Forplejning fra Brasseriet','Fleksibel dagorden'] },
    { id:'ga6', titel:'Golfoplevelse',       beskrivelse:'Bliv introduceret til golf i trygge rammer — skræddersyet til begyndere og garvede spillere.',    inkl:['Introduktion til golf','Professionel vejledning','Udstyr til rådighed','Hyggelig stemning'] }
  ],

  /* Legacy alias — bruges stadig af admin-fanerne (ek_pakker i localStorage) */
  golfPakker: [],

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
    ek:       './images/ek-klubhus.jpg',
    golf1:    '',   // ikke tilgængeligt — tekst-bi-kort vises
    golf2:    '',   // ikke tilgængeligt — tekst-bi-kort vises
    netvaerk: '',   // ikke tilgængeligt — tekst-bi-kort vises
    sponsor:  '',   // ikke tilgængeligt — tekst-bi-kort vises
    kontakt:  ''    // ikke tilgængeligt — tekst-bi-kort vises
  }
};

/* ================================================================
   APPS SCRIPT API-KALD
   Alle server-kald går via scriptFetch(). Ingen Supabase.
   Nøgler gemmes i Script Properties — aldrig i browserkode.
   ================================================================ */

async function scriptFetch(body) {
  const url = CONFIG.scriptUrl;
  if (!url || url.startsWith('INDSÆT')) {
    throw new Error('Apps Script URL ikke konfigureret i CONFIG.scriptUrl');
  }
  const resp = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ...body, token: CONFIG.requestToken }),
  });
  if (!resp.ok) throw new Error('Serverfejl: ' + resp.status);
  return resp.json();
}

async function scriptGet(params) {
  const url = CONFIG.scriptUrl;
  if (!url || url.startsWith('INDSÆT')) {
    throw new Error('Apps Script URL ikke konfigureret i CONFIG.scriptUrl');
  }
  const qs = new URLSearchParams({ ...params, token: CONFIG.requestToken });
  const resp = await fetch(url + '?' + qs);
  if (!resp.ok) throw new Error('Serverfejl: ' + resp.status);
  return resp.json();
}

/* ── Arkiv: sæson 2026 (alle afholdte arrangementer) ── */
const STD_ARR_ARKIV_2026 = [
  { id:'a1',  dato:'2026-02-04', tid:'',            titel:'Høj Sol over Aarhus',          sted:'Hermans, Tivoli Friheden',          type:'Koncert / netværk',   besk:'Årets første erhvervsarrangement med musik og netværk.',  maks:80, tlm:0, status:'afholdt', aaben:false },
  { id:'a2',  dato:'2026-03-04', tid:'16.00-21.00', titel:'SIM Golf',                     sted:'Golfarena Aarhus',                   type:'Golf / netværk',      besk:'Netværk og konkurrence på indoor simulator-bane.',        maks:24, tlm:0, status:'afholdt', aaben:false },
  { id:'a3',  dato:'2026-03-18', tid:'16.00-21.00', titel:'SIM Golf',                     sted:'Golfarena Aarhus',                   type:'Golf / netværk',      besk:'Netværk og konkurrence på indoor simulator-bane.',        maks:24, tlm:0, status:'afholdt', aaben:false },
  { id:'a4',  dato:'2026-03-24', tid:'',            titel:'Byudvikling & Bajere',          sted:'Aarhus',                             type:'Netværksarrangement', besk:'Uformel debat og netværk om byudvikling i Aarhus.',       maks:50, tlm:0, status:'afholdt', aaben:false },
  { id:'a5',  dato:'2026-04-22', tid:'',            titel:'Hjemmekamp mod Himmerland BC',  sted:'Lyngbygaard Golf',                   type:'Golf / netværk',      besk:'Venlighedskamp og netværk med Himmerland Business Club.', maks:40, tlm:0, status:'afholdt', aaben:false },
  { id:'a6',  dato:'2026-05-01', tid:'',            titel:'Udlandsrejse — Skotland',       sted:'Skotland',                           type:'Golfrejse',           besk:'Golfrejse til Skotland 1.–4. maj 2026.',                  maks:20, tlm:0, status:'afholdt', aaben:false },
  { id:'a7',  dato:'2026-06-02', tid:'',            titel:'Tysklandstur',                  sted:'Timmendorfer Strand',                type:'Golfrejse',           besk:'Golfrejse til Timmendorfer Strand 2.–3. juni 2026.',      maks:20, tlm:0, status:'afholdt', aaben:false },
  { id:'a8',  dato:'2026-08-14', tid:'',            titel:'Danish Golf Championship',      sted:'Great Northern',                     type:'Golfoplevelse',       besk:'Se årets store golfchampionship med erhvervsklubben.',    maks:30, tlm:0, status:'afholdt', aaben:false },
  { id:'a9',  dato:'2026-09-01', tid:'',            titel:'Jyllandstur',                   sted:'Nordvestjysk & Holstebro Golfklub',  type:'Golfrejse',           besk:'Jyllandstur 1.–2. september med golf på to baner.',       maks:24, tlm:0, status:'afholdt', aaben:false },
  { id:'a10', dato:'2026-10-09', tid:'',            titel:'EK-Mesterskaberne',              sted:'Silkeborg Ry Golfklub',              type:'Mesterskab',          besk:'Erhvervsklubbens eget mesterskab — hvem vinder?',         maks:48, tlm:0, status:'afholdt', aaben:false },
  { id:'a11', dato:'2026-11-20', tid:'',            titel:'Julefrokost & Gokart',           sted:'Racehall Aarhus',                    type:'Socialt arrangement', besk:'Julefrokost med gokart — årets hyggeligste event.',        maks:60, tlm:0, status:'afholdt', aaben:false }
];

/* ── Standard arrangementer 2027 — tomt indtil officielt program foreligger ──
   INGEN opdigtede arrangementer. Administrator opretter via admin.html (Google Apps Script). */
const STD_ARR = [];

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
    DB.set('ek_arr',       STD_ARR);         // tom i v8.1 — 2027-program ikke fastlagt
    DB.set('ek_sponsorer', STD_SPONSORER);
    DB.set('ek_tilm',      []);
    /* Admin-adgang kræver Supabase Auth — se admin.html */
    DB.set('ek_hero',      { tekst:CONFIG.heroTekst, under:CONFIG.heroUnder, billede:CONFIG.heroBillede });
    DB.set('ek_pakker',    CONFIG.golfPakker);
    DB.set('ek_golfbox',   CONFIG.golfboxUrl);
    DB.set('ek_init',      true);
  }

  /* ── v8.3: Markér migration ── */
  if (!DB.get('ek_v83_upgrade')) {
    DB.set('ek_v83_upgrade', { dato: new Date().toISOString(), fra: 'v8.2' });
    console.log('[v8.3] Migrationsmarkør sat ✓');
  }

  /* ── v8.4: Markér migration — fjern golfPakker med priser ── */
  if (!DB.get('ek_v84_upgrade')) {
    /* Ryd evt. gamle golf-pakker med priser (erstattet af golfArrangementer uden priser) */
    DB.set('ek_pakker', []);
    DB.set('ek_v84_upgrade', { dato: new Date().toISOString(), fra: 'v8.3.1' });
    console.log('[v8.4] Migrationsmarkør sat — golfpakker med priser ryddet ✓');
  }

  /* ── v8.5: Markér migration — web push + kommunikationssystem ── */
  if (!DB.get('ek_v85_upgrade')) {
    DB.set('ek_v85_upgrade', { dato: new Date().toISOString(), fra: 'v8.4' });
    console.log('[v8.5] Migrationsmarkør sat — web push og kommunikationssystem ✓');
  }

  /* ── v8.6: Cloudflare Worker til Web Push ── */
  if (!DB.get('ek_v86_upgrade')) {
    DB.set('ek_v86_upgrade', { dato: new Date().toISOString(), fra: 'v8.5' });
    console.log('[v8.6] Migrationsmarkør sat — Cloudflare Worker Web Push ✓');
  }

  /* ── v8.1: Arkivér 2026-arrangementer ──
     Flyt afholdte 2026-arr til ek_arr_arkiv (bevares).
     Fjern dem fra aktiv liste ek_arr.
     Kører kun hvis ek_v81_arkiv ikke allerede er sat. */
  if (!DB.get('ek_v81_arkiv')) {
    /* Gem arkiv (2026) */
    const gammeltArkiv = DB.get('ek_arr_arkiv') || [];
    const nytArkiv = [...gammeltArkiv];
    for (const a of STD_ARR_ARKIV_2026) {
      if (!nytArkiv.find(x => x.id === a.id)) nytArkiv.push(a);
    }
    DB.set('ek_arr_arkiv', nytArkiv);

    /* Ryd aktiv liste for 2026-arr (men bevar eventuelle fremtidige arr admin har oprettet) */
    const aktive = DB.get('ek_arr') || [];
    const ryddet = aktive.filter(a => !STD_ARR_ARKIV_2026.find(x => x.id === a.id));
    DB.set('ek_arr', ryddet);

    DB.set('ek_v81_arkiv', true);
    console.log('[v8.1] 2026-arrangementer arkiveret ✓');
  }
}

/* ================================================================
   HELPERS
   ================================================================ */
function getArr()       { return (DB.get('ek_arr')||[]).sort((a,b)=>a.dato.localeCompare(b.dato)); }
function getKode()      { return DB.get('ek_kode') || ''; }
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
    case 'moeder':     main.innerHTML = pgMøder();    break;
    case 'nyheder':    main.innerHTML = pgNyheder();  break;
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

  if (!næsteArr) {
    /* Ingen kommende arrangementer — vis sæson 2027-besked */
    const saeson2027 = 'Vi glæder os til sæson 2027 · Programmet offentliggøres snart';
    el.innerHTML = `
      <button class="ib-indre" onclick="navTil('erhvervsklub')" aria-label="Gå til Erhvervsklubben">
        <span class="ib-prik" style="background:#b8973a"></span>
        <span class="ib-label">SÆSON</span>
        <span class="ib-titel">2027</span>
        <span class="ib-marquee-wrap" aria-hidden="true" style="flex:1;min-width:0;overflow:hidden;display:flex;">
          <span class="ib-marquee-track ib-marquee-active" style="animation-duration:18s">
            <span class="ib-marquee-txt">${saeson2027} &nbsp;&nbsp;&nbsp;</span>
            <span class="ib-marquee-txt" aria-hidden="true">${saeson2027} &nbsp;&nbsp;&nbsp;</span>
          </span>
        </span>
        <span class="ib-meta" style="display:none">${saeson2027}</span>
        <svg class="ib-pil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>`;
    el.style.display = '';
    return;
  }

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
      <h1 class="hero-h1-v7">MERE END GOLF</h1>
      <p class="hero-tagline-v7">Relationer. Netværk. Forretning.</p>
      <p class="hero-p-kort">Professionelt erhvervsnetværk for virksomhedsejere, direktører og beslutningstagere i Aarhus-regionen.</p>
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

<section class="cx-sek cx-stats-sek">
  <div class="cx-stats-grid">
    <div class="cx-stat">
      <strong class="cx-stat-tal">~100</strong>
      <span class="cx-stat-lbl">medlemsvirksomheder</span>
    </div>
    <div class="cx-stat-div"></div>
    <div class="cx-stat">
      <strong class="cx-stat-tal">8–9</strong>
      <span class="cx-stat-lbl">arrangementer om året</span>
    </div>
    <div class="cx-stat-div"></div>
    <div class="cx-stat">
      <strong class="cx-stat-tal">EK-Golf</strong>
      <span class="cx-stat-lbl">onsdage i sæsonen</span>
    </div>
  </div>
</section>

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
  <p class="foot-version">LYG Erhvervsklub v8.6</p>
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
  <label class="pwa-samtykke-row">
    <input type="checkbox" id="gdpr-samtykke" required>
    <span>Jeg accepterer, at LYG Erhvervsklub behandler mine oplysninger (navn, virksomhed, e-mail, telefon) med det formål at håndtere min tilmelding. Oplysningerne slettes efter sæsonafslutning. <button class="link-knap" onclick="navTil('kontakt')" type="button">Privatlivspolitik</button>.</span>
  </label>
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

/* bookAfslut: Atomisk booking via Google Apps Script (LockService).
   Succes vises KUN efter serverbekræftelse.
   Ingen localStorage-fallback — brugeren må ALDRIG få falsk bekræftelse. */
async function bookAfslut() {
  const arr = getArr().find(a => a.id === _bookState.arrId);
  if (!arr) { alert('Arrangement ikke fundet.'); return; }

  /* GDPR-samtykke — obligatorisk */
  const samtykke = document.getElementById('gdpr-samtykke');
  if (samtykke && !samtykke.checked) {
    samtykke.closest('label').style.outline = '2px solid #c0392b';
    samtykke.focus();
    return;
  }

  /* Deaktiver bekræft-knappen og vis "behandler…" */
  const btn = document.querySelector('.bk-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Behandler…'; }

  try {
    /* ── Apps Script: atomisk booking med LockService ── */
    const data = await scriptFetch({
      action:      'tilmeld',
      arrId:       arr.id,
      navn:        _bookState.navn,
      virksomhed:  _bookState.virk,
      email:       _bookState.email,
      telefon:     _bookState.tlf,
      antal:       _bookState.antal,
      kommentar:   _bookState.kom,
    });

    if (!data || !data.ok) {
      /* Serveren afviste — fx fuldt booket eller dobbelttilmelding */
      const fejl  = data?.fejl   || 'Tilmelding ikke mulig.';
      const ledig = data?.ledige != null ? data.ledige : '?';
      if (btn) { btn.disabled = false; btn.textContent = 'Bekræft tilmelding'; }
      alert(fejl + (ledig !== '?' ? `\nLedige pladser: ${ledig}` : ''));
      bookTilTrin(2);
      return;
    }

    /* ✅ Server bekræftede — gem lokal kopi til opslagsformål */
    const t = {
      id:       data.tilmelding_id || 't' + Date.now(),
      arrId:    arr.id,
      arrTitel: arr.titel,
      navn:     _bookState.navn,
      virk:     _bookState.virk,
      email:    _bookState.email,
      tlf:      _bookState.tlf,
      antal:    _bookState.antal,
      kom:      _bookState.kom,
      dato:     idag(),
      mødt:     false,
      kilde:    'apps-script',
    };
    const alle = DB.get('ek_tilm') || []; alle.push(t); DB.set('ek_tilm', alle);

    /* Opdatér lokal tælling fra server-svar */
    const arrs = DB.get('ek_arr') || [];
    const idx  = arrs.findIndex(a => a.id === arr.id);
    if (idx > -1 && data.ledige_tilbage != null) {
      arrs[idx].tlm = arrs[idx].maks - Math.max(0, data.ledige_tilbage);
      if (arrs[idx].tlm >= arrs[idx].maks) arrs[idx].status = 'fuldt';
      DB.set('ek_arr', arrs);
    }

    _bookState._arrTitel = arr.titel;
    _bookState.trin = 4;
    navTil('tilmelding');

  } catch (err) {
    /* Netværksfejl eller serverfejl — vis fejl, INGEN falsk bekræftelse */
    console.error('[Booking] Apps Script fejlede:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Bekræft tilmelding'; }
    alert('Tilmelding mislykkedes. Kontrollér din internetforbindelse og prøv igen.\nDin tilmelding er IKKE registreret.');
  }
}

function bookReset() {
  _bookState = { trin:1, arrId:'', navn:'', virk:'', email:'', tlf:'', antal:1, kom:'' };
}

function submitTilm(e) { e.preventDefault(); } // legacy — erstattet af wizard

async function venteListe(arrId) {
  const arr = getArr().find(a => a.id === arrId); if (!arr) return;
  const navn  = prompt('Dit navn (venteliste):'); if (!navn) return;
  const email = prompt('Din e-mailadresse:');     if (!email) return;
  const antal = Number(prompt('Antal deltagere (inkl. dig selv):') || '1') || 1;

  try {
    const data = await scriptFetch({
      action:   'venteListe',
      arrId,
      navn:     navn.trim(),
      email:    email.trim(),
      antal,
    });
    if (data && data.ok) {
      /* Gem lokal kopi */
      const vl = DB.get('ek_venteliste') || [];
      vl.push({ arrId, arrTitel: arr.titel, navn, email, dato: new Date().toISOString() });
      DB.set('ek_venteliste', vl);
      alert(`Du er sat på ventelisten til "${arr.titel}".\nVi sender dig en e-mail, hvis der opstår ledige pladser.`);
    } else {
      alert(data?.fejl || 'Venteliste mislykkedes — prøv igen.');
    }
  } catch (err) {
    console.error('[Venteliste] Fejl:', err);
    alert('Venteliste mislykkedes. Kontrollér din internetforbindelse.\nDu er IKKE sat på ventelisten.');
  }
}

/* ================================================================
   FIRMAARRANGEMENT (tidligere "Golf")
   ================================================================ */
let _golfState = { trin:1, pakke:'', virk:'', kp:'', email:'', tlf:'', dato:'', antal:4, besk:'' };

function pgGolf() {
  /* v8.4: Professionelt firmaarrangement-afsnit — ingen opdigtede priser */
  const arrangementer = CONFIG.golfArrangementer;
  const svgArrow = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const svgGlobe = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  const svgPhone = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg>`;

  /* Forespørgselsskema — 2-trins flow: oplysninger → kvittering */
  if (_golfState.trin >= 2) {
    return `
<div class="ph bg-mork bk-ph">
  <div class="bk-ph-topbar">
    ${_golfState.trin === 2 ? `<button class="bk-back" onclick="golfReset();navTil('golfarr')" aria-label="Tilbage"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>` : `<div style="width:32px"></div>`}
    <h1 class="bk-ph-h1">Firmaarrangement</h1>
    <div style="width:32px"></div>
  </div>
</div>

${_golfState.trin === 2 ? `
<section class="sek">
  <h2 class="stitl">Forespørgsel — ${esc(_golfState.pakke)}</h2>
  <p class="muted mb1">Vi vender tilbage med et skræddersyet tilbud til jeres arrangement.</p>
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
    <div class="fg"><label>Særlige ønsker eller spørgsmål</label><textarea name="besk" rows="3" placeholder="Beskriv jeres ønsker, antal golfers, ønsket dato mv…">${esc(_golfState.besk)}</textarea></div>
    <button type="submit" class="knap-p fb bk-submit">Send forespørgsel</button>
  </form>
</section>` : ''}

${_golfState.trin === 4 ? `
<section class="sek">
  <div class="bk-kv">
    <div class="bk-kv-ikon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
    <h2 class="bk-kv-h2">Forespørgsel sendt</h2>
    <p class="bk-kv-info">Vi kontakter <strong>${esc(_golfState.kp)}</strong> hurtigst muligt med et skræddersyet tilbud.</p>
    <div class="bk-kv-knapper">
      <button class="knap-p" onclick="golfReset();navTil('forside')">Tilbage til forsiden</button>
      <button class="knap-sek" onclick="golfReset();navTil('golfarr')">Nyt arrangement</button>
    </div>
  </div>
</section>` : ''}`;
  }

  /* Trin 1: Oversigt over arrangementstyper */
  return `
<div class="ph bg-mork">
  <p class="ek-ph-over">LYG ERHVERVSKLUB</p>
  <h1 class="ek-ph-h1">Firmaarrangementer</h1>
  <p class="ek-ph-sub">Skræddersyede golf- og netværksoplevelser for virksomheder</p>
</div>

<section class="sek">
  <div class="tekst-bi-kort">
    <div class="tekst-bi-citat"><p>"Lyngbygaard Golf tilbyder professionelle rammer for alle typer virksomhedsarrangementer — fra eksklusiv Company Day til uformelle kundeoplevelser."</p></div>
  </div>
</section>

<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-sek-titel">ARRANGEMENTSTYPER</h2>
  </div>
  <div class="cx-scroll" id="cx-golfarr" role="list">
    ${arrangementer.map(a => `
    <button class="golf-pk-txt" role="listitem" onclick="golfVælgPakke('${esc(a.titel)}')">
      <span class="golf-pk-titel-txt">${esc(a.titel)}</span>
      <span class="golf-pk-besk-txt">${esc(a.beskrivelse)}</span>
      <ul class="golf-pk-inkl">${(a.inkl||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      <span class="golf-pk-cta-txt">Forespørg ${svgArrow}</span>
    </button>`).join('')}
  </div>
  <div class="cx-prikker" id="cx-golfarr-prikker">${arrangementer.map((_,i)=>`<span class="cx-prik${i===0?' aktiv':''}"></span>`).join('')}</div>
</section>

<section class="sek">
  <div class="golf-cta-boks">
    <h3 class="ek-cta-h3">Ønsker I et tilbud?</h3>
    <p class="ek-cta-p">Kontakt os direkte — vi tilrettelægger et arrangement der passer præcis til jeres ønsker og budget.</p>
    <div class="ek-cta-knapper">
      <a class="ek-cta-knap primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">
        ${svgPhone} Ring til os
      </a>
      <button class="ek-cta-knap sekundaer" onclick="navTil('kontakt')">
        Send en forespørgsel
      </button>
    </div>
  </div>
</section>

<section class="sek">
  <div class="golf-gb-wrap">
    <button class="golf-gb-kort" onclick="åbnGolfBox()">
      <div class="golf-gb-venstre">
        <span class="golf-gb-ikon">${svgGlobe}</span>
        <div><div class="golf-gb-titel">GolfBox</div><div class="golf-gb-sub">Book tid eller log ind direkte</div></div>
      </div>
      <span class="golf-gb-pil">${svgArrow}</span>
    </button>
  </div>
</section>`;
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
  /* v8.4: send direkte uden separat bekræftelsestrin */
  golfAfslut();
}

async function golfAfslut() {
  const btn = document.querySelector('.bk-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Sender…'; }

  try {
    const data = await scriptFetch({
      action:        'firmaarrangement',
      pakke:         _golfState.pakke,
      virksomhed:    _golfState.virk,
      kontaktperson: _golfState.kp,
      email:         _golfState.email,
      telefon:       _golfState.tlf,
      dato:          _golfState.dato,
      antal:         _golfState.antal,
      beskrivelse:   _golfState.besk,
    });

    if (data && data.ok) {
      /* Gem lokal kopi */
      const bg = DB.get('ek_golf_booking') || [];
      bg.push({ id: 'g' + Date.now(), ..._golfState, oprettet: new Date().toISOString() });
      DB.set('ek_golf_booking', bg);
      _golfState.trin = 4;
      navTil('golfarr');
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'Send forespørgsel'; }
      alert(data?.fejl || 'Forespørgsel mislykkedes — prøv igen.');
    }
  } catch (err) {
    console.error('[Firma] Apps Script fejlede:', err);
    if (btn) { btn.disabled = false; btn.textContent = 'Send forespørgsel'; }
    alert('Forespørgsel mislykkedes. Kontrollér din internetforbindelse og prøv igen.');
  }
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
  <h2 class="stitl">Individuelt tilpassede partnerskaber</h2>
  <p class="muted mb1">Vi tilbyder ikke faste sponsorpakker med fastsatte priser. Hvert samarbejde tilrettelægges individuelt, så det matcher jeres virksomheds mål, budget og ønsker.</p>
  <div class="sp-niv">
    <div class="sp-n guld-n">
      <div class="sp-n-titel">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Netværk og relationer
      </div>
      <p>Adgang til eksklusive erhvervsarrangementer. Mød beslutningstagere fra hele Aarhus-regionen og byg stærke forretningsrelationer.</p>
    </div>
    <div class="sp-n">
      <div class="sp-n-titel">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        Synlighed og profilering
      </div>
      <p>Logo og omtale på bane, hjemmeside, app og ved arrangementer. Stærk associering med Lyngbygaard Golf og det lokale erhvervsliv.</p>
    </div>
    <div class="sp-n">
      <div class="sp-n-titel">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        Kunde- og medarbejderoplevelser
      </div>
      <p>Greenfee-invitationer, firmaarrangementer og adgang til eksklusive oplevelser for jeres vigtigste kunder og medarbejdere.</p>
    </div>
  </div>
  <p class="muted tc mt1">Kontakt os for et uforpligtende og individuelt tilpasset tilbud.</p>
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
   OM ERHVERVSKLUBBEN (v8.4)
   ================================================================ */
function pgOm() {
  const svgPhone = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg>`;
  const svgMail  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

  /* EK-fordele — verificeret indhold */
  const ekFordele = [
    { titel:'Netværk på tværs af brancher',
      tekst:'Erhvervsklubben samler virksomheder fra alle brancher i Aarhus-regionen. Her mødes beslutningstagere på tværs og skaber forbindelser, der rækker ud over golfbanen.',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
    { titel:'Relationer mellem beslutningstagere',
      tekst:'Erhvervsklubben er et rum for stærke og langvarige forretningsrelationer. Mød direktører, ejere og ledere i uformelle men professionelle rammer.',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` },
    { titel:'Virksomhedsbesøg og faglige arrangementer',
      tekst:'Vi arrangerer virksomhedsbesøg hos medlemsvirksomheder og faglige arrangementer, der kombinerer ny viden, indsigt og netværk i autentiske rammer.',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>` },
    { titel:'Golfrejser og sociale oplevelser',
      tekst:'Erhvervsklubben arrangerer golfrejser til destinationer som Skotland og Timmendorfer Strand. Sociale oplevelser der styrker fællesskab og skaber minder.',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
    { titel:'EK-Golf — onsdage i sæsonen',
      tekst:'Hver onsdag i golfgæsonen, undtagen juli, afholdes EK-Golf for erhvervsmedlemmer. Et fast ugentligt socialt og sportsligt tilbud på Lyngbygaard Golf.',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="19" r="2"/><path d="M14 4v14M14 4l6 3-6 3M2 21h10"/></svg>` },
    { titel:'Nye samarbejder og forretningsforbindelser',
      tekst:'Mange af vores medlemmer har indledt nye forretningssamarbejder gennem Erhvervsklubben. Et naturligt netværk giver naturlige muligheder.',
      svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>` },
  ];

  /* Verificerede medlemsvirksomheder (lyg.dk/members/) */
  const MEDLEMMER = [
    {navn:'4Service A/S',branche:'Facility management',web:'https://4service.dk'},
    {navn:'Advokatfirmaet Energi & Miljø',branche:'Jura',web:'https://energiogmiljo.dk'},
    {navn:'Aiding',branche:'IT & digital',web:'https://aiding.dk'},
    {navn:'AK Byggeservice',branche:'Byggeri',web:''},
    {navn:'Alm. Brand',branche:'Forsikring & finans',web:'https://almbrand.dk'},
    {navn:'Alssund Gruppen',branche:'Erhvervsejendomme',web:''},
    {navn:'Amplex',branche:'Telekommunikation',web:'https://amplex.dk'},
    {navn:'Ankjær-Jensen Advokater',branche:'Jura',web:'https://ankjaer-jensen.dk'},
    {navn:'AP Pension',branche:'Pension & forsikring',web:'https://appension.dk'},
    {navn:'Aros Erhverv',branche:'Erhvervsservice',web:''},
    {navn:'Aros Forsikring',branche:'Forsikring',web:'https://arosforsikring.dk'},
    {navn:'Arriva',branche:'Transport',web:'https://arriva.dk'},
    {navn:'Artha Kapitalforvaltning',branche:'Finans',web:'https://artha.dk'},
    {navn:'Atkins (SNC-Lavalin)',branche:'Ingeniør & rådgivning',web:''},
    {navn:'Audi Aarhus',branche:'Bilforhandler',web:'https://audi-aarhus.dk'},
    {navn:'Autoriseret El-installatør',branche:'El-installation',web:''},
    {navn:'Balder',branche:'Ejendomme',web:'https://balder.com'},
    {navn:'Bankdata',branche:'IT & finans',web:'https://bankdata.dk'},
    {navn:'BDO',branche:'Revision & rådgivning',web:'https://bdo.dk'},
    {navn:'Bella Hospitality',branche:'Hotel & konference',web:''},
    {navn:'Bravida',branche:'Teknisk service',web:'https://bravida.dk'},
    {navn:'Brdr. A & O Johansen',branche:'Byggeri & VVS',web:'https://ao.dk'},
    {navn:'ByBI',branche:'Erhvervsudvikling',web:''},
    {navn:'C.W. Obel Ejendomme',branche:'Ejendomme',web:''},
    {navn:'Carpe Diem Kommunikation',branche:'Kommunikation',web:''},
    {navn:'CGI',branche:'IT-konsulenter',web:'https://cgi.com'},
    {navn:'Dahl Advokatfirma',branche:'Jura',web:'https://dahllaw.dk'},
    {navn:'Dansk Byggeri',branche:'Brancheorganisation',web:'https://danskbyggeri.dk'},
    {navn:'Deloitte',branche:'Revision & konsulenter',web:'https://deloitte.dk'},
    {navn:'Den Blå Planet (Naturama)',branche:'Oplevelse',web:''},
    {navn:'DS Norden',branche:'Shipping',web:'https://ds-norden.com'},
    {navn:'DXC Technology',branche:'IT-konsulenter',web:'https://dxc.com'},
    {navn:'EG',branche:'IT & software',web:'https://eg.dk'},
    {navn:'Egon Zehner',branche:'Executive search',web:'https://egonzehnder.com'},
    {navn:'Eldan Recycling',branche:'Industri & miljø',web:'https://eldan-recycling.com'},
    {navn:'Euromaster',branche:'Bilservice',web:'https://euromaster.dk'},
    {navn:'FH Byg',branche:'Byggeri',web:''},
    {navn:'Finanshuset i Aarhus',branche:'Finans',web:''},
    {navn:'Formuepleje',branche:'Kapitalforvaltning',web:'https://formuepleje.dk'},
    {navn:'GPV Group',branche:'Industri',web:'https://gpv.com'},
    {navn:'Grant Thornton',branche:'Revision & rådgivning',web:'https://grantthornton.dk'},
    {navn:'GreenMobility',branche:'Mobilitet',web:'https://greenmobility.com'},
    {navn:'Grundfos',branche:'Pumper & vandteknologi',web:'https://grundfos.com'},
    {navn:'Hans Just',branche:'Medier',web:''},
    {navn:'Heidricks & Struggles',branche:'Executive search',web:'https://heidrick.com'},
    {navn:'Himmerland Business Club',branche:'Erhvervsklub',web:''},
    {navn:'Homesolution',branche:'Ejendomsmægler',web:'https://homesolution.dk'},
    {navn:'Horsens Erhvervsråd',branche:'Erhvervsudvikling',web:''},
    {navn:'HP',branche:'IT & teknologi',web:'https://hp.com'},
    {navn:'HOFOR',branche:'Forsyning',web:'https://hofor.dk'},
    {navn:'IBM',branche:'IT & teknologi',web:'https://ibm.com'},
    {navn:'IDA (Ingeniørforeningen)',branche:'Brancheorganisation',web:'https://ida.dk'},
    {navn:'Ikano Bank',branche:'Finans & bank',web:'https://ikanobank.dk'},
    {navn:'IKEA',branche:'Retail',web:'https://ikea.com/dk'},
    {navn:'Inventio.IT',branche:'IT-konsulenter',web:'https://inventio.it'},
    {navn:'JF Fabricius',branche:'Byggeri',web:''},
    {navn:'Jyske Bank',branche:'Bank & finans',web:'https://jyskebank.dk'},
    {navn:'Jørgensen Enterprice',branche:'Byggeri & anlæg',web:''},
    {navn:'KPMG',branche:'Revision & konsulenter',web:'https://kpmg.com/dk'},
    {navn:'Kuehne+Nagel',branche:'Logistik',web:'https://kuehne-nagel.com'},
    {navn:'Lantmännen Unibake',branche:'Fødevarer',web:'https://lantmannenunibake.com'},
    {navn:'LB Forsikring',branche:'Forsikring',web:'https://lb.dk'},
    {navn:'Leftovers',branche:'Madvarer & bæredygtighed',web:''},
    {navn:'Lessor',branche:'HR & løn software',web:'https://lessor.dk'},
    {navn:'Lidl Danmark',branche:'Retail',web:'https://lidl.dk'},
    {navn:'Linde Gas',branche:'Industrigas',web:'https://linde.com'},
    {navn:'Lloyds Register',branche:'Certificering & inspektion',web:'https://lr.org'},
    {navn:'Lotus IT Group',branche:'IT-løsninger',web:''},
    {navn:'Lundgaard & Tranberg Arkitekter',branche:'Arkitektur',web:''},
    {navn:'Lyngbygaard Golf',branche:'Golf & erhverv',web:'https://lyg.dk'},
    {navn:'Mærsk',branche:'Shipping & logistik',web:'https://maersk.com'},
    {navn:'Martin Professional',branche:'Lys & scene',web:'https://martin.com'},
    {navn:'Mellbye',branche:'Advokater',web:''},
    {navn:'Microsoft',branche:'IT & software',web:'https://microsoft.com/da-dk'},
    {navn:'Midtjyske Medier',branche:'Medier',web:''},
    {navn:'Molslinjen',branche:'Transport & færge',web:'https://molslinjen.dk'},
    {navn:'Møller & Grønborg',branche:'Arkitektur & ingeniør',web:'https://mg.dk'},
    {navn:'NCC Danmark',branche:'Byggeri & anlæg',web:'https://ncc.dk'},
    {navn:'Niras',branche:'Rådgivende ingeniører',web:'https://niras.dk'},
    {navn:'Nordea',branche:'Bank & finans',web:'https://nordea.dk'},
    {navn:'Novo Nordisk',branche:'Farmaceutisk industri',web:'https://novonordisk.com'},
    {navn:'Orbicon | WSP',branche:'Rådgivende ingeniører',web:''},
    {navn:'Pandrup Murer & Tømrerfirma',branche:'Byggeri',web:''},
    {navn:'PensionDanmark',branche:'Pension',web:'https://pensionDanmark.dk'},
    {navn:'PFA',branche:'Pension & forsikring',web:'https://pfa.dk'},
    {navn:'Praxis',branche:'IT & konsulenter',web:''},
    {navn:'PwC',branche:'Revision & konsulenter',web:'https://pwc.dk'},
    {navn:'Rambøll',branche:'Rådgivende ingeniører',web:'https://ramboll.com'},
    {navn:'Randers FC',branche:'Sport',web:'https://randersfc.dk'},
    {navn:'Rejseplanen',branche:'Transport & IT',web:'https://rejseplanen.dk'},
    {navn:'Revisorgruppen Danmark',branche:'Revision',web:''},
    {navn:'Santander Consumer Bank',branche:'Bank & finans',web:'https://santanderconsumer.dk'},
    {navn:'Scan-Global Logistics',branche:'Logistik',web:'https://scan-globallogistics.com'},
    {navn:'Signal',branche:'Kommunikation',web:''},
    {navn:'Siemens',branche:'Teknologi & industri',web:'https://siemens.com/dk'},
    {navn:'Solar',branche:'Distribution & teknik',web:'https://solar.dk'},
    {navn:'Sparekassen Kronjylland',branche:'Bank',web:'https://sparekassenkronjylland.dk'},
    {navn:'Stena Recycling',branche:'Genbrug & miljø',web:'https://stenarecycling.dk'},
    {navn:'Sydbank',branche:'Bank & finans',web:'https://sydbank.dk'},
    {navn:'TDC Erhverv',branche:'Telekommunikation',web:''},
    {navn:'Telmore',branche:'Telekommunikation',web:'https://telmore.dk'},
    {navn:'Thorsen Partners',branche:'Rekruttering',web:''},
    {navn:'TotalEnergies',branche:'Energi',web:'https://totalenergies.dk'},
    {navn:'Toyota Material Handling',branche:'Truckudstyr',web:''},
    {navn:'Trafikkonsortiet',branche:'Transport',web:''},
    {navn:'Tryg Forsikring',branche:'Forsikring',web:'https://tryg.dk'},
    {navn:'Unicon',branche:'Beton & byggeri',web:''},
    {navn:'Vestas',branche:'Vindenergi',web:'https://vestas.com'},
    {navn:'Viborg HK',branche:'Sport',web:'https://viborghk.dk'},
    {navn:'Visible',branche:'Marketing & kommunikation',web:''},
    {navn:'Waygu',branche:'Fødevarer',web:''},
    {navn:'YouSee',branche:'Telekommunikation',web:'https://yousee.dk'},
  ];

  const katalogHtml = `
<section class="sek" id="om-katalog-sek">
  <h2 class="stitl">Medlemsvirksomheder</h2>
  <p class="muted mb1">Knap 100 virksomheder fra Aarhus-regionen er tilknyttet Lyngbygaard Erhvervsklub.</p>
  <div class="mk-soeg-wrap">
    <input class="mk-soeg" id="mk-soeg" type="search" placeholder="Søg virksomhed eller branche…" oninput="filterMK(this.value)" aria-label="Søg i medlemskatalog">
  </div>
  <div class="mk-liste" id="mk-liste">
    ${MEDLEMMER.map(m=>`
    <div class="mk-rad" data-soeg="${esc((m.navn+' '+m.branche).toLowerCase())}">
      <div class="mk-info">
        <strong class="mk-navn">${esc(m.navn)}</strong>
        <span class="mk-branche">${esc(m.branche)}</span>
      </div>
      ${m.web ? `<a class="mk-link" href="${esc(m.web)}" target="_blank" rel="noopener" aria-label="Besøg ${esc(m.navn)}">↗</a>` : '<span class="mk-link-ph"></span>'}
    </div>`).join('')}
  </div>
  <p class="muted tc mt1" style="font-size:.8rem" id="mk-ingen" style="display:none"></p>
</section>`;

  return `
<div class="ph bg-mork ek-ph">
  <p class="ek-ph-over">LYG ERHVERVSKLUB</p>
  <h1 class="ek-ph-h1">Erhvervsklubben</h1>
  <p class="ek-ph-sub">Netværk, relationer og golf for virksomheder i Aarhus-regionen</p>
</div>

<div class="ek-foto-wrap">
  <div class="ek-foto" style="background-image:url('./images/ek-klubhus.jpg')" role="img" aria-label="Lyngbygaard Erhvervsklub - klubhuset">
    <div class="ek-foto-lag">
      <p class="ek-foto-citat">"Erhvervsklubben er et levende fællesskab af virksomheder, der mødes om golf, netværk og nye muligheder."</p>
    </div>
  </div>
</div>

<section class="sek">
  <h2 class="stitl">Hvad tilbyder erhvervsklubben?</h2>
  <div class="ikg">
    ${ekFordele.map(f=>`
    <div class="ikb static">
      <span class="iks">${f.svg}</span>
      <strong>${esc(f.titel)}</strong>
      <p>${esc(f.tekst)}</p>
    </div>`).join('')}
  </div>
</section>

${katalogHtml}

<section class="sek">
  <div class="ek-cta-boks">
    <h3 class="ek-cta-h3">Interesseret i erhvervsmedlemskab?</h3>
    <p class="ek-cta-p">Kontakt os og hør om mulighederne for jeres virksomhed.</p>
    <div class="ek-cta-knapper">
      <a class="ek-cta-knap primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">
        ${svgPhone} Ring til os
      </a>
      <button class="ek-cta-knap sekundaer" onclick="navTil('kontakt')">
        ${svgMail} Send besked
      </button>
    </div>
  </div>
</section>

<section class="sek pwa-sek" id="pwa-install-sek">
  ${_pwaInstallHtml()}
</section>`;
}

function filterMK(q) {
  const v = (q||'').toLowerCase().trim();
  const rader = document.querySelectorAll('#mk-liste .mk-rad');
  let n = 0;
  rader.forEach(r => {
    const vis = !v || r.dataset.soeg.includes(v);
    r.style.display = vis ? '' : 'none';
    if (vis) n++;
  });
  const ingen = document.getElementById('mk-ingen');
  if (ingen) ingen.textContent = n === 0 ? 'Ingen virksomheder matcher søgningen.' : '';
}



/* ================================================================
   PWA INSTALLATION — enhedsdetekteret vejledning (v8.3)
   Platform: iOS Safari, iOS Chrome/andre, Android Chrome,
             Android andre, Windows/Mac Chrome/Edge, Windows/Mac Safari/andre
   ================================================================ */
function _pwaInstallHtml() {
  const ua        = navigator.userAgent;
  const erIOS     = /iphone|ipad|ipod/i.test(ua);
  const erAndroid = /android/i.test(ua);
  const erSafari  = /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua);
  const erChrome  = /chrome/i.test(ua) && !/edg/i.test(ua);
  const erEdge    = /edg\//i.test(ua);
  const erMac     = /macintosh/i.test(ua);
  const erWin     = /windows/i.test(ua);

  /* Er allerede installeret som PWA? */
  const erInstalleret = window.navigator.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;

  /* iOS Safari — kan installeres via Deling → Føj til hjemmeskærm */
  const erIOSSafari  = erIOS && erSafari;
  /* iOS andre browsere — kan ikke installeres som PWA */
  const erIOSAndre   = erIOS && !erSafari;
  /* Android Chrome/Edge — native beforeinstallprompt */
  const harNativePrompt = installEvt !== null;

  const svgApp = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
  const svgCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const svgShare = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`;
  const svgDots  = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;

  if (erInstalleret) {
    return `
<div class="pwa-boks pwa-installeret">
  <div class="pwa-ikon">${svgApp}</div>
  <div>
    <strong class="pwa-titel">Appen er installeret</strong>
    <p class="pwa-tekst muted">Du bruger allerede LYG Erhvervsklub som app — tak!</p>
  </div>
</div>`;
  }

  let vejledning = '';

  if (harNativePrompt) {
    /* Android Chrome / Windows/Mac Chrome+Edge — native install */
    vejledning = `
<p class="pwa-tekst">Din browser understøtter direkte installation. Klik på knappen nedenfor.</p>
<button class="knap-p pwa-install-btn" onclick="installApp()">
  ${svgApp} Installér som app
</button>
<p class="pwa-hint muted">Appen placeres på din hjemmeskærm og åbner uden browserramme.</p>`;

  } else if (erIOSSafari) {
    /* iPhone / iPad — Safari Deling-menu */
    vejledning = `
<p class="pwa-tekst">Følg disse trin i Safari:</p>
<ol class="pwa-trin">
  <li>${svgShare} Tryk på <strong>Deling</strong>-knappen i bunden af skærmen</li>
  <li>Rul ned og vælg <strong>Føj til hjemmeskærm</strong></li>
  <li>Tryk <strong>Tilføj</strong> øverst til højre</li>
</ol>
<p class="pwa-hint muted">Appen optræder herefter på din hjemmeskærm som en selvstændig app.</p>`;

  } else if (erIOSAndre) {
    /* iPhone / iPad — ikke Safari */
    vejledning = `
<p class="pwa-tekst">Installation kræver Safari på iPhone og iPad.</p>
<ol class="pwa-trin">
  <li>Åbn denne side i <strong>Safari</strong></li>
  <li>Tryk på ${svgShare} <strong>Deling</strong>-knappen</li>
  <li>Vælg <strong>Føj til hjemmeskærm</strong></li>
</ol>
<p class="pwa-hint muted">Kopiér adressen fra din browser og indsæt den i Safari.</p>`;

  } else if (erAndroid) {
    /* Android — Chrome ikke installeret / Firefox / Samsung */
    vejledning = `
<p class="pwa-tekst">Åbn siden i <strong>Chrome</strong> for at installere som app:</p>
<ol class="pwa-trin">
  <li>Tryk på ${svgDots} menuen øverst til højre</li>
  <li>Vælg <strong>Føj til hjemmeskærm</strong> eller <strong>Installér app</strong></li>
  <li>Bekræft installation</li>
</ol>`;

  } else if (erChrome || erEdge) {
    /* Windows / Mac — Chrome eller Edge — ingen prompt endnu */
    vejledning = `
<p class="pwa-tekst">Installér via adresselinjen i din browser:</p>
<ol class="pwa-trin">
  <li>Klik på ${svgApp}-ikonet helt til højre i adresselinjen</li>
  <li>Vælg <strong>Installér</strong></li>
  <li>Appen åbner i sit eget vindue uden browserramme</li>
</ol>
<p class="pwa-hint muted">Ses ikonet ikke? Prøv at genindlæse siden eller brug menuen (${svgDots}) → Kast som app / Installér side som app.</p>`;

  } else if (erSafari && erMac) {
    /* Mac Safari */
    vejledning = `
<p class="pwa-tekst">Installér fra Safari-menuen:</p>
<ol class="pwa-trin">
  <li>Åbn menuen <strong>Filer</strong> i menulinjen</li>
  <li>Vælg <strong>Føj til Dock</strong></li>
  <li>Klik <strong>Tilføj</strong></li>
</ol>
<p class="pwa-hint muted">Appen placeres i Dock og åbner som selvstændig app.</p>`;

  } else {
    /* Generisk fallback */
    vejledning = `
<p class="pwa-tekst">Åbn siden i <strong>Chrome</strong> eller <strong>Edge</strong> og vælg "Installér app" fra browsermenuen.</p>
<ul class="pwa-trin">
  <li><strong>iPhone/iPad:</strong> Safari → Del → Føj til hjemmeskærm</li>
  <li><strong>Android:</strong> Chrome → Menu → Installér app</li>
  <li><strong>Windows/Mac:</strong> Chrome/Edge → adresselinjeikon → Installér</li>
</ul>`;
  }

  return `
<div class="pwa-boks">
  <div class="pwa-hdr">
    <div class="pwa-ikon">${svgApp}</div>
    <div>
      <strong class="pwa-titel">Installér Erhvervsklubben som app</strong>
      <p class="pwa-under muted">Hurtig adgang fra din hjemmeskærm — ingen app store krævet</p>
    </div>
  </div>
  <div class="pwa-fordele">
    <span>${svgCheck} Virker offline</span>
    <span>${svgCheck} Opdateres automatisk</span>
    <span>${svgCheck} Ingen reklamer</span>
  </div>
  <div class="pwa-vejl">
    ${vejledning}
  </div>
</div>`;
}


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

  const post = {
    action:        'kontakt',
    virksomhed:    f.virk.value.trim(),
    kontaktperson: f.kp.value.trim(),
    telefon:       f.tlf.value.trim(),
    email:         f.email.value.trim(),
    besked:        f.besk.value.trim()
  };

  /* Gem lokalt */
  const alle = DB.get('ek_beskeder')||[];
  alle.push({ id:'k'+Date.now(), virk:post.virksomhed, kp:post.kontaktperson,
    tlf:post.telefon, email:post.email, besk:post.besked,
    dato:new Date().toISOString(), læst:false });
  DB.set('ek_beskeder', alle);

  /* Send til Apps Script (v8.3) */
  try {
    await scriptFetch(post);
  } catch (err) {
    console.warn('[Kontakt] Apps Script fejlede (gemt lokalt):', err);
  }

  f.style.display = 'none';
  document.getElementById('kont-kv').style.display = 'block';
}

/* ================================================================
   MØDER OG KONFERENCER (v8.4)
   ================================================================ */
function pgMøder() {
  const svgPhone = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.9 16.92z"/></svg>`;
  const svgCheck = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const faciliteter = [
    { titel:'Op til 50 personer', tekst:'Pejsestuen rummer komfortabelt 50 deltagere i fleksibel opstilling.', svg:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
    { titel:'Professionelt AV-udstyr', tekst:'Projektor, skærm, trådløs mikrofon og whiteboard inkluderet.', svg:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>` },
    { titel:'Fleksibel indretning', tekst:'Opstilles efter jeres behov — klasseromsform, U-form, teateropstilling eller konferencebord.', svg:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>` },
    { titel:'Naturskøn udsigt', tekst:'Mødelokalet har udsigt over Lyngbygaard Golfs smukke bane — inspirerende rammer for kreative processer.', svg:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { titel:'Forplejning fra Brasseriet', tekst:'Kaffe, frokost og forplejning tilrettelægges af Brasseriets erfarne køkken efter jeres ønsker.', svg:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>` },
    { titel:'Gratis parkering', tekst:'Stor parkeringsplads direkte ved klubhuset — bekvem ankomst for alle deltagere.', svg:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>` },
  ];

  return `
<div class="ph bg-mork">
  <p class="ek-ph-over">LYNGBYGAARD GOLF</p>
  <h1 class="ek-ph-h1">Møder og konferencer</h1>
  <p class="ek-ph-sub">Professionelle rammer med naturskøn udsigt og fuld forplejning</p>
</div>

<div class="ek-foto-wrap">
  <div class="ek-foto" style="background-image:url('./images/ek-klubhus.jpg')" role="img" aria-label="Pejsestuen — mødelokale hos Lyngbygaard Golf">
    <div class="ek-foto-lag">
      <p class="ek-foto-citat">"Professionelle møderammer med udsigt over banen — og forplejning fra Brasseriets erfarne køkken."</p>
    </div>
  </div>
</div>

<section class="sek">
  <h2 class="stitl">Pejsestuen</h2>
  <p class="muted mb1">Vores mødelokale Pejsestuen tilbyder inspirerende rammer til alle typer møder — fra bestyrelsesmøder og kurser til workshops og konferencer.</p>
  <div class="ikg">
    ${faciliteter.map(f=>`
    <div class="ikb static">
      <span class="iks">${f.svg}</span>
      <strong>${esc(f.titel)}</strong>
      <p>${esc(f.tekst)}</p>
    </div>`).join('')}
  </div>
</section>

<section class="sek">
  <div class="golf-cta-boks">
    <h3 class="ek-cta-h3">Ønsker I et tilbud?</h3>
    <p class="ek-cta-p">Vi tilrettelægger mødet fra A til Z — lokale, forplejning og eventuelle golfelementer. Kontakt os for et uforpligtende tilbud.</p>
    <div class="ek-cta-knapper">
      <a class="ek-cta-knap primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">
        ${svgPhone} Ring til os
      </a>
      <button class="ek-cta-knap sekundaer" onclick="navTil('kontakt')">
        Send forespørgsel
      </button>
    </div>
  </div>
</section>`;
}

/* ================================================================
   NYHEDER (v8.4)
   Kompakt nyhedsfunktion. Nyheder godkendes af admin før offentliggørelse.
   Kilde og dato vises altid.
   ================================================================ */
function pgNyheder() {
  const nyheder = (DB.get('ek_nyheder') || [])
    .filter(n => n.godkendt !== false)   // kun admin-godkendte
    .sort((a,b) => (b.dato||'').localeCompare(a.dato||''))
    .slice(0, 20);

  return `
<div class="ph bg-mork">
  <p class="ek-ph-over">LYG ERHVERVSKLUB</p>
  <h1 class="ek-ph-h1">Nyheder</h1>
  <p class="ek-ph-sub">Seneste nyt fra Lyngbygaard Golf og Erhvervsklubben</p>
</div>

<section class="sek">
  ${nyheder.length === 0 ? `
  <div class="tom-kal">
    <p>Ingen nyheder i øjeblikket.</p>
    <p class="muted" style="font-size:.85rem">Nyheder offentliggøres løbende fra Lyngbygaard Golf og Erhvervsklubben.</p>
    <button class="knap-sek mt1" onclick="navTil('kalender')">Se kalender →</button>
  </div>` : `
  <div class="ny-liste">
    ${nyheder.map(n => `
    <article class="ny-kort">
      <div class="ny-meta">
        <span class="ny-dato">${n.dato ? fmtDato(n.dato) : ''}</span>
        ${n.kilde ? `<span class="ny-kilde">${esc(n.kilde)}</span>` : ''}
      </div>
      <h3 class="ny-titel">${esc(n.titel)}</h3>
      ${n.tekst ? `<p class="ny-tekst">${esc(n.tekst)}</p>` : ''}
      ${n.link ? `<a class="ny-link" href="${esc(n.link)}" target="_blank" rel="noopener">Læs mere →</a>` : ''}
    </article>`).join('')}
  </div>`}
</section>`;
}

/* ================================================================
   ADMIN

   ⚠️  SIKKERHEDSADVARSEL — PRODUKTIONSOPGAVE:
   Admin-koden (CONFIG.adminKode = '1234') er gemt i offentligt
   Administration i v8.3 kræver Google OAuth via admin.html.
   Åbn admin.html separat — ikke via in-app navigation.
   Ingen hardkodet PIN eller fallback-adgang.
   ================================================================ */
let adminIN = false;
let _adFane = 'arr';

function pgAdmin() {
  if (!adminIN) return `
<div class="ph bg-mork"><h1>Administration</h1></div>
<section class="sek">
  <div class="admin-login">
    <p class="muted tc mb1">Administration kræver Google-login.</p>
    <p class="muted tc mb1" style="font-size:.85rem">
      Åbn <strong>admin.html</strong> for at logge ind med din Google-konto.<br>
      Kun autoriserede administratorer har adgang.</p>
    <a href="./admin.html" class="knap-p fb" style="display:block;text-align:center;text-decoration:none">Åbn adminpanel →</a>
  </div>
</section>`;

  const faner=[['arr','Arrangementer'],['tilm','Tilmeldinger'],['kont','Kontakthenvendelser'],['sp','Sponsorer'],['golf','Firmapakker'],['indh','Indhold'],['inst','Indstillinger'],['komm','Kommunikation'],['bk','Backup']];
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
  ${_adFane==='komm' ? adKomm() : ''}
  ${_adFane==='bk'   ? adBk()   : ''}
</section>`;
}

/* Admin-login: forsøger Supabase Auth, falder tilbage til lokal kode.
   ⚠️ PRODUKTIONSOPGAVE: Opret admin-bruger i Supabase Dashboard →
   Authentication → Users → Invite user. Tilføj user.id til
   admin_brugere-tabellen. Se MIGRATIONSGUIDE.md. */
async function tjekKode() {
  /* v8.3: Administration foregår udelukkende via admin.html med Google Sign-In.
     Denne funktion er ikke aktiv i produktion. */
  const fejlEl = document.getElementById('ak-fejl');
  if (fejlEl) {
    fejlEl.textContent = 'Brug admin.html til at logge ind med Google.';
    fejlEl.style.display = 'block';
  }
}

async function adminLogUd() {
  /* v8.3: Log ud fra in-app admin-visning (admin.html håndterer separat) */
  adminIN = false;
  navTil('forside');
}
function skiftFane(f) {
  _adFane=f;
  navTil('admin');
  if (f === 'komm') setTimeout(_initKommFane, 150);
}

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

/* ── Admin: Firmaarrangementer (v8.4 — ingen priser) ── */
function adGolf() {
  const arr = CONFIG.golfArrangementer;
  return `
<p class="muted mb1">Firmaarrangementer vises på Golf-siden. Priser angives ikke — kontakt bruges til individuelle tilbud.</p>
<div class="ad-form" style="background:var(--p);color:var(--hvid);padding:.75rem 1rem;border-radius:8px;margin-bottom:1rem">
  <strong>Firmaarrangement-typer (v8.4)</strong><br>
  <span style="font-size:.85rem;opacity:.8">Disse typer er konfigureret i CONFIG.golfArrangementer og vises på Golf-siden. Rediger app.js for at ændre dem.</span>
</div>
${arr.map(a=>`
<div class="ad-form" style="margin-bottom:.5rem;padding:.6rem .75rem">
  <strong>${esc(a.titel)}</strong>
  <p class="muted" style="font-size:.85rem;margin:.25rem 0 0">${esc(a.beskrivelse)}</p>
  <p class="muted" style="font-size:.8rem;margin:.2rem 0 0">Inkl.: ${(a.inkl||[]).join(' · ')}</p>
</div>`).join('')}`;
}

/* ── Admin: Indhold (Nyheder · Partnere · Medlemsvirksomheder) ── */
function adIndhold() {
  const nyheder = DB.get('ek_nyheder')||[];
  const partnere = DB.get('ek_partnere')||[];
  const mvirk   = DB.get('ek_mvirksomheder')||[];

  const afventende = nyheder.filter(n=>n.godkendt===false);
  const godkendte  = nyheder.filter(n=>n.godkendt!==false);
  return `
<div class="ad-form mb1">
  <h3>Nyheder <span class="muted">(${nyheder.length})</span></h3>
  <p class="muted mb1">Nyheder skal godkendes af administrator, før de vises på Nyheder-siden. Kilde og dato vises altid.</p>
  <form onsubmit="tilfoejNyhed(event)">
    <div class="fg"><label>Overskrift *</label><input name="titel" required placeholder="Nyhedsoverskrift"></div>
    <div class="fg"><label>Tekst</label><input name="tekst" placeholder="Kort teaser"></div>
    <div class="g2f">
      <div class="fg"><label>Dato *</label><input type="date" name="dato" required value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="fg"><label>Kilde</label><input name="kilde" placeholder="lyg.dk, LinkedIn…"></div>
    </div>
    <div class="fg"><label>Link (URL)</label><input name="link" placeholder="https://…" type="url"></div>
    <div class="fg" style="display:flex;align-items:center;gap:.5rem">
      <input type="checkbox" name="godkendt" id="ny-godk" checked style="width:auto">
      <label for="ny-godk" style="margin:0;font-weight:normal">Godkend og publicér straks</label>
    </div>
    <button type="submit" class="knap-p">+ Tilføj nyhed</button>
  </form>
  ${afventende.length ? `
  <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:.6rem .75rem;margin-top:.75rem">
    <strong style="font-size:.85rem">⏳ Afventer godkendelse (${afventende.length})</strong>
    <div class="ad-l mt1">${afventende.map((n,i)=>`
    <div class="ad-rad"><div class="ad-ri"><strong>${esc(n.titel)}</strong><span>${n.dato||''} · ${esc(n.kilde||'')}</span></div>
    <div class="ad-rk">
      <button class="knap-i" onclick="godkendNyhed('${esc(n.id||i)}')">Godkend</button>
      <button class="knap-i red" onclick="sletNyhedId('${esc(n.id||i)}')">Slet</button>
    </div></div>`).join('')}
    </div>
  </div>` : ''}
  ${godkendte.length ? `<div class="ad-l mt1"><strong style="font-size:.82rem;color:var(--mut)">Publicerede (${godkendte.length})</strong>${godkendte.map((n,i)=>`
  <div class="ad-rad"><div class="ad-ri"><strong>${esc(n.titel)}</strong><span>${n.dato||''} · ${esc(n.kilde||'')}</span></div>
  <div class="ad-rk"><button class="knap-i red" onclick="sletNyhedId('${esc(n.id||i)}')">Slet</button></div>
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

function tilfoejNyhed(e){
  e.preventDefault();const f=e.target;
  const a=DB.get('ek_nyheder')||[];
  const godkendt = f.godkendt ? f.godkendt.checked : true;
  a.unshift({id:'ny'+Date.now(),titel:f.titel.value,tekst:f.tekst.value,dato:f.dato.value,kilde:f.kilde.value,link:f.link.value,godkendt});
  DB.set('ek_nyheder',a);skiftFane('indh');
}
function godkendNyhed(id){
  const a=DB.get('ek_nyheder')||[];
  const idx=a.findIndex(n=>String(n.id)===String(id));
  if(idx>-1){a[idx].godkendt=true;DB.set('ek_nyheder',a);}
  skiftFane('indh');
}
function sletNyhedId(id){
  if(!confirm('Slet nyhed?'))return;
  const a=DB.get('ek_nyheder')||[];
  DB.set('ek_nyheder',a.filter(n=>String(n.id)!==String(id)));
  skiftFane('indh');
}
function sletNyhed(i){if(!confirm('Slet nyhed?'))return;const a=DB.get('ek_nyheder')||[];a.splice(i,1);DB.set('ek_nyheder',a);skiftFane('indh');}  // legacy
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
  <h3>Administratoradgang</h3>
  <p class="muted mb1">Administratoradgang styres via Google-login. Tilføj eller fjern administratorer i Google Sheets → fanen "Administratorer".<br><br>Log ud sker automatisk ved lukning af fanen. For at tilføje en ny administrator: indsæt e-mailadressen i Administratorer-arket og klik "Gem indstillinger" i backend.</p>
  <p class="muted">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    Ingen hardkodede PIN-koder eller lokale fallback-koder.
  </p>
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
   PÅMINDELSER OG KALENDER
   Push-notifikationer via Web Push er fjernet i v8.3 (ingen Supabase).
   Brevo via Apps Script er primær kommunikationskanal.
   Daglige påmindelser: 14, 7 og 3 dage (konfigureres i Indstillinger-arket).
   ================================================================ */

/* aktPaam / tjekPaam — push-push deaktiveret.
   Kalenderintegration (tilfoejKal) er bevaret. */
function aktPaam(id) {
  /* Midlertidig: tilbyd kun kalenderintegration */
  if (confirm('Vil du tilføje arrangementet til din kalender?'))
    tilfoejKal(id);
}
function tjekPaam() { /* deaktiveret — se kommentar ovenfor */ }

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

/* visPushDialog / accepterPush / afvisPush — FJERNET i v8.1 (se også linje ~1969) */

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

  /* Skift Oversigt-knap til "Oversigt" på mobil / "Admin" på desktop */
  function opdaterNavLayout() {
    const mobil = isMobilNav();
    const mereLbl = document.getElementById('nav-mere-lbl');
    const mereBtn = document.getElementById('nav-mere-btn');
    const sponsorBtn = document.getElementById('nav-sponsor-desk');
    const kontaktBtn = document.getElementById('nav-kontakt-desk');
    const golfBtn   = document.getElementById('nav-golf-desk');
    if (!mereBtn) return;
    if (mobil) {
      if (mereLbl) mereLbl.textContent = 'Oversigt';
      mereBtn.dataset.side = ''; /* åbner overlay — ikke direkte nav */
      if (sponsorBtn) sponsorBtn.style.display = 'none';
      if (kontaktBtn) kontaktBtn.style.display = 'none';
      /* v8.0: Golf er synlig på mobil som 5. nav-punkt */
      if (golfBtn)   golfBtn.style.display = '';
    } else {
      if (mereLbl) mereLbl.textContent = 'Admin';
      mereBtn.dataset.side = 'admin';
      if (sponsorBtn) sponsorBtn.style.display = '';
      if (kontaktBtn) kontaktBtn.style.display = '';
      if (golfBtn)   golfBtn.style.display = '';
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

  /* v8.1: Intro-animation (Ken Burns) — kun ved første besøg */
  startIntroAnimation();
});

/* ================================================================
   INTRO-ANIMATION v8.1 (Ken Burns + golf-bold)
   - Første besøg i sessionen (sessionStorage-flag)
   - Varer 6 sekunder i alt; kan springes over
   - Respekterer prefers-reduced-motion
   ================================================================ */
function startIntroAnimation() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  /* Allerede set denne session */
  if (sessionStorage.getItem('lygIntroSpillet') === '1') return;

  /* Reduceret bevægelse: spring direkte over og vis popup */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sessionStorage.setItem('lygIntroSpillet', '1');
    setTimeout(() => visArrPopup(), 500);
    return;
  }

  sessionStorage.setItem('lygIntroSpillet', '1');

  /* Vis overlay */
  overlay.style.display = 'flex';
  overlay.classList.add('intro-aktiv');

  /* Golf-bold: start rulning efter 1.5s */
  setTimeout(() => {
    const bold = overlay.querySelector('.intro-golf-bold');
    if (bold) bold.classList.add('intro-bold-ruller');
  }, 1500);

  /* Fade tekst ind efter 3s */
  setTimeout(() => {
    const tw = overlay.querySelector('.intro-tekst-wrap');
    if (tw) tw.classList.add('intro-tekst-synlig');
  }, 3000);

  /* Afslut intro efter 6.2s */
  setTimeout(() => lukIntro(), 6200);
}

function springIntroOver() {
  lukIntro();
}

function lukIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay || overlay.style.display === 'none') {
    visArrPopup();
    return;
  }
  overlay.classList.add('intro-ud');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('intro-aktiv', 'intro-ud');
    visArrPopup();
  }, 500);
}

/* ================================================================
   ARRANGEMENT-POPUP v8.0
   - Vises efter intro (eller direkte ved genbesøg hvis nyt arr)
   - Automatisk: næste arrangement med åben tilmelding
   - Admin kan sætte manuel popup via Supabase (ek_popup_config)
   - Vises maks. én gang pr. arrangement pr. bruger (localStorage)
   ================================================================ */
function visArrPopup() {
  const overlay = document.getElementById('arr-popup');
  if (!overlay) return;

  /* Hent evt. admin-konfigureret popup (Supabase) */
  _hentPopupConfig().then(cfg => {
    if (cfg && cfg.aktiv) {
      /* Manuel popup fra admin */
      _visPopupMedData({
        titel:  cfg.titel  || 'Besked fra Erhvervsklubben',
        meta:   cfg.tekst  || '',
        arrId:  cfg.arr_id || null,
        noegle: 'popup_manuel_' + (cfg.id || '1'),
      });
      return;
    }

    /* Automatisk: næste arrangement med åben tilmelding */
    const næste = getArr()
      .filter(a => erFremtidig(a.dato) && a.aaben && a.status !== 'lukket')
      .sort((a,b) => a.dato.localeCompare(b.dato))[0];

    if (!næste) {
      /* Ingen kommende arrangementer — vis sæson 2027-besked */
      _visPopupMedData({
        titel:  'Vi glæder os til sæson 2027',
        meta:   'Vi ser frem til endnu en spændende sæson med golf, netværk, relationer og gode erhvervsoplevelser. Programmet offentliggøres snart.',
        arrId:  null,
        noegle: 'popup_saeson2027_v1',
        ctaTekst: 'SE ERHVERVSKLUBBEN',
        ctaAction: () => navTil('erhvervsklub'),
      });
      return;
    }

    const noegle = 'popup_arr_' + næste.id;
    _visPopupMedData({
      titel: næste.titel,
      meta:  _popupMetaTekst(næste),
      arrId: næste.id,
      noegle,
    });
  });
}

function _popupMetaTekst(a) {
  const dele = [];
  if (a.dato) {
    const d = new Date(a.dato + 'T12:00:00');
    dele.push(d.toLocaleDateString('da-DK', { weekday:'long', day:'numeric', month:'long' }));
  }
  if (a.tid)   dele.push('Kl. ' + a.tid);
  if (a.sted)  dele.push(a.sted);
  if (a.frist) dele.push('Tilmelding senest: ' + fmtDato(a.frist));
  const ledig = ledigePladser(a);
  if (a.maks && ledig >= 0) dele.push(ledig + ' ledige pladser');
  return dele.join(' · ');
}

function _visPopupMedData({ titel, meta, arrId, noegle, ctaTekst, ctaAction }) {
  /* Allerede set? */
  if (localStorage.getItem(noegle) === '1') return;

  const overlay = document.getElementById('arr-popup');
  if (!overlay) return;

  document.getElementById('arr-popup-titel').textContent = titel;
  document.getElementById('arr-popup-meta').textContent  = meta;

  const cta = document.getElementById('arr-popup-cta');
  if (arrId) {
    cta.textContent = ctaTekst || 'TILMELD MIG';
    cta.onclick = () => { lukkArrPopup(); navTil('tilmelding', { id: arrId }); };
    cta.style.display = '';
  } else if (ctaAction) {
    cta.textContent = ctaTekst || 'LÆS MERE';
    cta.onclick = () => { lukkArrPopup(); ctaAction(); };
    cta.style.display = '';
  } else {
    cta.style.display = 'none';
  }

  overlay.style.display = 'flex';
  setTimeout(() => overlay.classList.add('arr-popup-synlig'), 20);

  /* Gem nøgle når popup lukkes */
  overlay._popupNoegle = noegle;
}

function lukkArrPopup() {
  const overlay = document.getElementById('arr-popup');
  if (!overlay) return;
  overlay.classList.remove('arr-popup-synlig');
  setTimeout(() => { overlay.style.display = 'none'; }, 350);
  /* Gem at bruger har set popup */
  if (overlay._popupNoegle) {
    localStorage.setItem(overlay._popupNoegle, '1');
  } else {
    const næste = getArr()
      .filter(a => erFremtidig(a.dato) && a.aaben)
      .sort((a,b) => a.dato.localeCompare(b.dato))[0];
    if (næste) localStorage.setItem('popup_arr_' + næste.id, '1');
  }
}

async function _hentPopupConfig() {
  /* v8.3: Ingen Supabase — popup styres via Apps Script/admin.html */
  return null;
}

/* ================================================================
   WEB PUSH — VAPID via Cloudflare Worker (v8.6)
   Frivillige push-notifikationer. iOS kræver PWA installeret på hjemmeskærm.
   Email-fallback sker automatisk via Apps Script.
   ================================================================ */

/**
 * Hent VAPID public key fra Apps Script og abonner på push.
 * Kaldes fra bruger-initieret handling (knap-klik), da push kræver brugergestus.
 *
 * iOS-flow: Detektér iOS → vis installationsvejledning → bed om push-tilladelse.
 * Android/Desktop: Direkte push-abonnement.
 */
async function abonnerPush() {
  const statusEl = document.getElementById('push-status');
  const knap     = document.getElementById('push-knap');

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (statusEl) statusEl.textContent = 'Din browser understøtter ikke push-notifikationer.';
    return;
  }

  // iOS-detektion: kræver PWA installeret på hjemmeskærm (iOS 16.4+)
  const erIOS     = /iP(hone|ad|od)/.test(navigator.userAgent);
  const erInstall = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true;

  if (erIOS && !erInstall) {
    visIOSPushVejledning();
    return;
  }

  if (erIOS) {
    const iosVer = parseFloat((navigator.userAgent.match(/OS (\d+)_/) || [])[1] || 0);
    if (iosVer < 16) {
      if (statusEl) statusEl.innerHTML = '<span style="color:#b8973a">⚠️ Push-notifikationer kræver iOS 16.4 eller nyere.</span>';
      return;
    }
  }

  if (statusEl) statusEl.textContent = 'Henter konfiguration…';
  if (knap) knap.disabled = true;

  try {
    // Hent VAPID public key — fra CF Worker (foretrukket) eller Apps Script
    let vapidPublicKey = null;
    if (CONFIG.pushWorkerUrl) {
      try {
        const cfResp = await fetch(CONFIG.pushWorkerUrl + '/public-key');
        const cfData = await cfResp.json();
        if (cfData.ok && cfData.publicKey) vapidPublicKey = cfData.publicKey;
      } catch(e) { console.warn('[Push] CF Worker ikke tilgængelig, prøver Apps Script'); }
    }
    if (!vapidPublicKey) {
      const r = await scriptGet({ action: 'getVapidPublicKey' });
      if (!r.ok) throw new Error(r.fejl || 'Kunne ikke hente push-konfiguration');
      vapidPublicKey = r.vapidPublicKey;
    }
    const appServerKey   = _urlBase64ToUint8Array(vapidPublicKey);

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: appServerKey,
    });

    // Gem subscription i Apps Script backend
    const subJson = sub.toJSON();
    const platform = _detekterPlatform();

    await scriptFetch({
      action:   'pushSubscribe',
      endpoint: subJson.endpoint,
      keys:     subJson.keys,
      platform,
    });

    // Gem lokalt at push er aktiveret
    DB.set('ek_push_aktiv', { endpoint: subJson.endpoint, platform, dato: new Date().toISOString() });

    if (statusEl) statusEl.innerHTML = '<span style="color:#22c55e">✓ Push-notifikationer er aktiveret!</span>';
    if (knap) { knap.textContent = 'Deaktivér push'; knap.onclick = afmeldPush; knap.disabled = false; }

    // Lyt på subscription-changes fra service worker
    navigator.serviceWorker.addEventListener('message', _haandterPushMessage);

  } catch(e) {
    console.warn('[Push] Fejl ved abonnement:', e);
    let fejlTekst = 'Push-abonnement fejlede.';
    if (e.name === 'NotAllowedError') {
      fejlTekst = 'Du har blokeret push-notifikationer. Tillad dem i browserindstillingerne.';
    }
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444">${fejlTekst}</span>`;
    if (knap) knap.disabled = false;
  }
}

/**
 * Afmeld push-notifikationer.
 */
async function afmeldPush() {
  const statusEl = document.getElementById('push-status');
  const knap     = document.getElementById('push-knap');
  if (knap) knap.disabled = true;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await scriptFetch({ action: 'pushUnsubscribe', endpoint: sub.toJSON().endpoint });
      await sub.unsubscribe();
    }
    DB.del('ek_push_aktiv');
    if (statusEl) statusEl.innerHTML = '<span style="color:#6b7280">Push-notifikationer er deaktiveret.</span>';
    if (knap) { knap.textContent = 'Aktiver push-notifikationer'; knap.onclick = abonnerPush; knap.disabled = false; }
  } catch(e) {
    if (statusEl) statusEl.textContent = 'Fejl ved afmelding. Prøv igen.';
    if (knap) knap.disabled = false;
  }
}

/**
 * Tjek om push allerede er aktiveret og opdater UI derefter.
 */
async function tjekPushStatus(statusEl, knap) {
  if (!statusEl || !knap) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    statusEl.textContent = 'Din browser understøtter ikke push-notifikationer.';
    knap.style.display = 'none';
    return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      statusEl.innerHTML = '<span style="color:#22c55e">✓ Push-notifikationer er aktiveret</span>';
      knap.textContent = 'Deaktivér push';
      knap.onclick = afmeldPush;
    } else {
      statusEl.innerHTML = '<span style="color:#6b7280">Push-notifikationer er ikke aktiveret</span>';
      knap.textContent = 'Aktiver push-notifikationer';
      knap.onclick = abonnerPush;
    }
  } catch(e) {
    statusEl.textContent = 'Push-status ukendt.';
  }
}

/**
 * Vis iOS-installationsvejledning (PWA påkrævet før push på iOS).
 */
function visIOSPushVejledning() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:flex-end;padding:0';
  modal.innerHTML = `
<div style="background:#fff;border-radius:16px 16px 0 0;padding:28px 24px 40px;width:100%;max-width:480px;margin:0 auto">
  <div style="text-align:center;margin-bottom:16px">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0d2b1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="2" width="18" height="20" rx="2" ry="2"/><line x1="12" y1="6" x2="12" y2="10"/><line x1="12" y1="14" x2="12.01" y2="14"/>
    </svg>
  </div>
  <h3 style="text-align:center;margin:0 0 12px;font-size:1.1rem;color:#0d2b1a">Aktiver push på iPhone/iPad</h3>
  <p style="font-size:.9rem;color:#374151;margin:0 0 16px">Push-notifikationer på iOS kræver, at appen er installeret på din hjemmeskærm:</p>
  <ol style="font-size:.9rem;color:#374151;padding-left:1.2rem;line-height:1.8;margin:0 0 20px">
    <li>Tryk på <strong>Del</strong>-knappen <span style="font-size:1rem">⬆️</span> i Safari-browserens bundlinje</li>
    <li>Vælg <strong>"Føj til hjemmeskærm"</strong></li>
    <li>Tryk <strong>Tilføj</strong> øverst til højre</li>
    <li>Åbn appen fra hjemmeskærmen og prøv igen</li>
  </ol>
  <p style="font-size:.8rem;color:#6b7280;margin:0 0 16px">Kræver iOS 16.4 eller nyere · Safari 16.4+</p>
  <button onclick="this.closest('div[style*=\"position:fixed\"]').remove()"
          style="width:100%;padding:12px;background:#0d2b1a;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer">
    Forstået
  </button>
</div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/**
 * Konverter base64url-kodet VAPID public key til Uint8Array.
 * Nødvendigt for PushManager.subscribe({ applicationServerKey }).
 */
function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return new Uint8Array([...raw].map(char => char.charCodeAt(0)));
}

/**
 * Detektér platform til brug i push-subscription metadata.
 */
function _detekterPlatform() {
  const ua = navigator.userAgent;
  if (/iP(hone|ad|od)/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'mac';
  return 'ukendt';
}

/**
 * Håndter besked fra Service Worker (subscription changed).
 */
function _haandterPushMessage(evt) {
  if (evt.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
    const sub = evt.data.subscription;
    if (sub) {
      scriptFetch({ action: 'pushSubscribe', endpoint: sub.endpoint, keys: sub.keys, platform: _detekterPlatform() })
        .catch(e => console.warn('[Push] Fejl ved auto-fornyelse:', e));
    }
  }
}

/* ================================================================
   ADMIN — KOMMUNIKATION (v8.5)
   Fane: Kommunikation — påmindelser, historik, push, manuel besked
   ================================================================ */

function adKomm() {
  const cfWorkerOk = CONFIG.pushWorkerUrl && !CONFIG.pushWorkerUrl.startsWith('INDSÆT');
  return `
<div class="ad-hd">
  <h2>📢 Kommunikation og push-notifikationer</h2>
  <p class="muted mb1">Automatiske og manuelle beskeder til deltagere og erhvervsmedlemmer.</p>
</div>

<!-- CF Worker status -->
<div class="ad-sek" style="border-left:4px solid ${cfWorkerOk ? '#22c55e' : '#b8973a'}">
  <h3 class="ad-sek-h">🔔 Web Push — Cloudflare Worker (v8.6)</h3>
  <div class="push-info-boks">
    <p><strong>${cfWorkerOk ? '✅ Cloudflare Worker er konfigureret' : '⚠️ Cloudflare Worker er ikke konfigureret endnu'}</strong></p>
    ${cfWorkerOk
      ? `<p>Push-notifikationer sendes via CF Worker med rigtig ECDSA ES256-signering og AES-128-GCM kryptering. URL: <code>${CONFIG.pushWorkerUrl}</code></p>`
      : `<p>Sæt <code>CONFIG.pushWorkerUrl</code> i app.js til din CF Worker URL. Se installationsvejledningen.</p><p>E-mail via Brevo bruges som fallback indtil CF Worker er deployeret.</p>`
    }
    <ul class="push-support-liste" style="margin-top:.75rem">
      <li>✅ Chrome (Android, Windows, Mac, Linux)</li>
      <li>✅ Firefox (Android, Windows, Mac)</li>
      <li>✅ Safari (macOS 13+, iOS 16.4+ — kræver hjemmeskærm-installation)</li>
      <li>✅ Edge (Windows, Mac)</li>
      <li>📧 <em>E-mail bruges automatisk som fallback</em></li>
    </ul>
  </div>
  <div style="margin-top:1rem">
    <h4>Aktive push-abonnementer</h4>
    <div id="push-abonnenter-vis">Henter…</div>
    <button class="knap-sek sm" onclick="hentPushAbonnenter()">Opdater liste</button>
  </div>
</div>

<!-- Automatiske påmindelser -->
<div class="ad-sek">
  <h3 class="ad-sek-h">⏰ Automatiske påmindelser</h3>
  <p class="muted mb1">Påmindelserne sendes automatisk via en daglig trigger i Apps Script (e-mail + push).</p>
  <div class="paamind-grid">
    <div class="paamind-kort">
      <strong>7 dage før tilmeldingsfristen</strong><br>
      <span class="muted" style="font-size:.85rem">E-mail + push til alle tilmeldte</span>
    </div>
    <div class="paamind-kort">
      <strong>2 dage før tilmeldingsfristen</strong><br>
      <span class="muted" style="font-size:.85rem">E-mail + push til alle tilmeldte</span>
    </div>
    <div class="paamind-kort">
      <strong>1 dag før arrangementet</strong><br>
      <span class="muted" style="font-size:.85rem">E-mail + push til alle tilmeldte</span>
    </div>
  </div>
  <h4 style="margin-top:1.5rem">Forventede udsendelser (næste 30 dage)</h4>
  <div id="paamind-preview-vis">Henter…</div>
  <button class="knap-sek sm" onclick="hentPaamindPreview()">Opdater preview</button>
</div>

<!-- Manuel besked -->
<div class="ad-sek">
  <h3 class="ad-sek-h">✉️ Send manuel besked</h3>
  <p class="muted mb1">Vælg målgruppe, kanal og skriv besked. Tilmeldte deltagere modtager ikke opfordringer til tilmelding.</p>
  <form onsubmit="sendManuelBesked(event)">
    <div class="form-row">
      <label>Målgruppe</label>
      <select id="mb-maalgruppe" class="input-felt">
        <option value="alle_medl">Alle erhvervsmedlemmer</option>
        <option value="">— Eller vælg specifikt arrangement —</option>
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
      <input type="text" id="mb-emne" class="input-felt" placeholder="Emne for beskeden" required>
    </div>
    <div class="form-row">
      <label>Indhold</label>
      <textarea id="mb-indhold" class="input-felt" rows="6" placeholder="Skriv beskeden her…" required></textarea>
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
      <button type="submit" class="knap-p">Send besked</button>
      <button type="button" class="knap-sek" onclick="sendTestBesked()">Send testbesked</button>
    </div>
    <div id="mb-status" class="form-status" style="margin-top:.75rem"></div>
  </form>
</div>

<!-- Testbesked kanal-valg -->
<div class="ad-sek">
  <h3 class="ad-sek-h">🧪 Testbesked</h3>
  <p class="muted mb1">Sendes kun til testadresse (TEST_EMAIL i Script Properties). Aldrig til rigtige medlemmer.</p>
  <div class="form-row">
    <label>Kanal til test</label>
    <select id="test-kanal" class="input-felt">
      <option value="begge">E-mail + push (begge)</option>
      <option value="email">Kun e-mail</option>
      <option value="push">Kun push</option>
    </select>
  </div>
  <button class="knap-sek" onclick="sendTestBesked()" style="margin-top:.5rem">Send testbesked nu</button>
  <div id="test-status" class="form-status" style="margin-top:.5rem"></div>
</div>

<!-- Nyt arrangement push -->
<div class="ad-sek">
  <h3 class="ad-sek-h">🆕 Besked om nyt arrangement</h3>
  <p class="muted mb1">Send push + e-mail til alle abonnenter om et nyt arrangement. Allerede tilmeldte modtager ikke denne besked.</p>
  <div class="form-row">
    <label>Arrangement</label>
    <select id="ny-arr-sel" class="input-felt">
      <option value="">Vælg arrangement…</option>
    </select>
  </div>
  <button class="knap-p" onclick="sendNyArrBesked()" style="margin-top:.75rem">Send besked</button>
  <div id="ny-arr-status" class="form-status" style="margin-top:.75rem"></div>
</div>

<!-- Sendehistorik -->
<div class="ad-sek">
  <h3 class="ad-sek-h">📋 Sendehistorik</h3>
  <div id="email-historik-vis">Henter…</div>
  <button class="knap-sek sm" onclick="hentEmailHistorik()">Opdater historik</button>
</div>`;
}

/* ── Admin kommunikation: datahentning og handlinger ── */

async function hentPushAbonnenter() {
  const el = document.getElementById('push-abonnenter-vis');
  if (!el) return;
  el.textContent = 'Henter…';
  try {
    const r = await adminFetch({ action: 'adminGetPushAbonnenter' });
    if (!r.ok) throw new Error(r.fejl);
    if (!r.abonnenter?.length) {
      el.innerHTML = '<p class="muted">Ingen aktive push-abonnementer endnu.</p>';
      return;
    }
    el.innerHTML = `
<p><strong>${r.total}</strong> aktive abonnementer</p>
<table class="ad-tbl" style="margin-top:.5rem">
  <thead><tr><th>Platform</th><th>E-mail</th><th>Oprettet</th></tr></thead>
  <tbody>${r.abonnenter.map(a=>`
    <tr><td>${esc(a.platform)}</td><td>${esc(a.email)||'–'}</td><td>${esc(a.oprettet)}</td></tr>`).join('')}
  </tbody>
</table>`;
  } catch(e) {
    el.innerHTML = `<p class="muted" style="color:#ef4444">Fejl: ${esc(e.message)}</p>`;
  }
}

async function hentPaamindPreview() {
  const el = document.getElementById('paamind-preview-vis');
  if (!el) return;
  el.textContent = 'Henter…';
  try {
    const r = await adminFetch({ action: 'adminGetPaamindPreview' });
    if (!r.ok) throw new Error(r.fejl);
    if (!r.preview?.length) {
      el.innerHTML = '<p class="muted">Ingen forventede udsendelser i de næste 30 dage.</p>';
      return;
    }
    el.innerHTML = `<table class="ad-tbl">
      <thead><tr><th>Dato</th><th>Arrangement</th><th>Type</th><th>Deltagere</th></tr></thead>
      <tbody>${r.preview.map(p=>`
        <tr>
          <td>${esc(p.udsendelsesDato)}</td>
          <td>${esc(p.arrTitel)}</td>
          <td>${esc(p.type)}</td>
          <td>${p.aktiveDeltagere}</td>
        </tr>`).join('')}
      </tbody></table>`;
  } catch(e) {
    el.innerHTML = `<p class="muted" style="color:#ef4444">Fejl: ${esc(e.message)}</p>`;
  }
}

async function sendManuelBesked(evt) {
  evt.preventDefault();
  const statusEl   = document.getElementById('mb-status');
  const maalgruppe = document.getElementById('mb-maalgruppe')?.value || 'alle_medl';
  const kanal      = document.getElementById('mb-kanal')?.value || 'begge';
  const emne       = document.getElementById('mb-emne')?.value?.trim() || '';
  const indhold    = document.getElementById('mb-indhold')?.value?.trim() || '';

  if (!emne || !indhold) {
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444">Udfyld emne og indhold.</span>';
    return;
  }

  const kanalTekst = kanal === 'email' ? 'kun e-mail' : kanal === 'push' ? 'kun push' : 'e-mail + push';
  if (!confirm(`Bekræft: Send besked (${kanalTekst}) til "${maalgruppe === 'alle_medl' ? 'alle erhvervsmedlemmer' : 'valgte deltagere'}"?\n\nEmne: ${emne}`))
    return;

  if (statusEl) statusEl.textContent = 'Sender…';
  try {
    const r = await adminFetch({ action: 'adminSendManuelBesked', maalgruppe, emne, indhold, kanal });
    if (!r.ok) throw new Error(r.fejl);
    if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e">✓ Sendt til ${r.modtagere} modtagere (${r.emailSendt} e-mails, ${r.pushSendt} push).</span>`;
  } catch(e) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444">Fejl: ${esc(e.message)}</span>`;
  }
}

async function sendTestBesked() {
  const statusEl = document.getElementById('test-status') || document.getElementById('mb-status');
  const kanal    = document.getElementById('test-kanal')?.value || 'begge';
  const emne     = document.getElementById('mb-emne')?.value?.trim() || 'Testbesked v8.6';
  const indhold  = document.getElementById('mb-indhold')?.value?.trim() || 'Dette er en testbesked fra LYG Erhvervsklub v8.6';

  if (statusEl) statusEl.textContent = 'Sender testbesked…';
  try {
    const r = await adminFetch({ action: 'adminSendTestBesked', emne, indhold, kanal, type: 'manuel' });
    if (!r.ok) throw new Error(r.fejl || 'Sæt TEST_EMAIL i Script Properties');
    if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e">✓ Testbesked (${kanal}) sendt til ${esc(r.testEmail)}</span>`;
  } catch(e) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444">Fejl: ${esc(e.message)}</span>`;
  }
}

async function sendNyArrBesked() {
  const sel     = document.getElementById('ny-arr-sel');
  const statusEl= document.getElementById('ny-arr-status');
  const arrId   = sel?.value;
  if (!arrId) {
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444">Vælg et arrangement.</span>';
    return;
  }
  if (!confirm('Send push-notifikation om nyt arrangement til alle abonnenter (der ikke allerede er tilmeldt)?')) return;
  if (statusEl) statusEl.textContent = 'Sender…';
  try {
    const r = await adminFetch({ action: 'adminSendNyArrangement', arrId });
    if (!r.ok) throw new Error(r.fejl);
    if (statusEl) statusEl.innerHTML = `<span style="color:#22c55e">✓ ${r.pushSendt} push-notifikationer sendt.</span>`;
  } catch(e) {
    if (statusEl) statusEl.innerHTML = `<span style="color:#ef4444">Fejl: ${esc(e.message)}</span>`;
  }
}

async function hentEmailHistorik() {
  const el = document.getElementById('email-historik-vis');
  if (!el) return;
  el.textContent = 'Henter…';
  try {
    const r = await adminFetch({ action: 'adminGetEmaillog', limit: 50 });
    if (!r.ok) throw new Error(r.fejl);
    const rows = r.log || [];
    if (!rows.length) {
      el.innerHTML = '<p class="muted">Ingen e-mailhistorik endnu.</p>';
      return;
    }
    el.innerHTML = `<table class="ad-tbl">
      <thead><tr><th>Dato</th><th>Modtager</th><th>Type</th><th>Status</th></tr></thead>
      <tbody>${rows.map(r=>`
        <tr>
          <td style="font-size:.8rem">${esc(r.sendt||r[5]||'')}</td>
          <td style="font-size:.8rem">${esc(r.modtager||r[3]||'')}</td>
          <td style="font-size:.8rem">${esc(r.type||r[4]||'')}</td>
          <td style="font-size:.8rem;color:${(r.status||r[6])==='sendt'?'#22c55e':'#ef4444'}">${esc(r.status||r[6]||'')}</td>
        </tr>`).join('')}
      </tbody></table>`;
  } catch(e) {
    el.innerHTML = `<p class="muted" style="color:#ef4444">Fejl: ${esc(e.message)}</p>`;
  }
}

/* ── Hjælpefunktion til admin-kald (POST med adminToken) ── */
async function adminFetch(body) {
  const adminToken = DB.get('ek_admin_token');
  if (!adminToken) throw new Error('Ikke logget ind som admin');
  return scriptFetch({ ...body, adminToken });
}

/* ── Kommunikation-fane auto-load ── */
function _initKommFane() {
  setTimeout(() => {
    hentPushAbonnenter();
    hentPaamindPreview();
    hentEmailHistorik();
    // Udfyld arrangement-dropdown
    const sel = document.getElementById('ny-arr-sel');
    if (sel) {
      (window._serverArr || []).forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = a.titel + (a.dato ? ` (${fmtDato(a.dato)})` : '');
        sel.appendChild(opt);
      });
    }
  }, 100);
}
