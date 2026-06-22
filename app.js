/* ============================================================
   LYNGBYGAARD ERHVERVSKLUB — APP.JS
   Al konfiguration og data samlet ét sted.
   ============================================================ */

const CONFIG = {
  /* ── Klub ── */
  klubNavn:    'Lyngbygaard Erhvervsklub',
  tagline:     'Erhverv, netværk og golfoplevelser i Lyngbygaard Golf',
  adresse:     'Lyngbygårdsvej 29, 8220 Brabrand',
  telefon:     '87 44 10 70',
  email:       'info@lyg.dk',
  website:     'https://lyg.dk',

  /* ── Farver (justér her, ikke i CSS) ── */
  farver: {
    primaer:   '#0d2b1a',   // mørkegrøn
    accent:    '#b8973a',   // guld
    lys:       '#f5f0e8',   // cremet hvid
    tekst:     '#1a1a1a',
    muted:     '#6b7280',
  },

  /* ── Hero ── */
  heroTekst:    'Erhverv, netværk og golfoplevelser i Lyngbygaard Golf',
  heroUnder:    'Bliv en del af erhvervsklubben og oplev golf, relationer og fællesskab i professionelle rammer.',
  heroBillede:  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=80',

  /* ── Admin ── */
  adminKode: '1234',

  /* ── Kontaktpersoner ── */
  kontaktPersoner: [
    { navn: 'Lyngbygaard Golf', titel: 'Erhvervsklubben', telefon: '87 44 10 70', email: 'info@lyg.dk' }
  ],

  /* ── Golf pakker ── */
  golfPakker: [
    {
      id: 'companyday',
      titel: 'Company Day',
      pris: 'Fra 4.500 kr./hold',
      beskrivelse: 'En hel dag på banen med morgenmad, frokost og 18 huller. Perfekt til teambuilding og kundepleje.',
      inkluderer: ['18 huller golf', 'Morgenmad', 'Frokost', 'Leje af golfvogn', 'Priser og diplomer']
    },
    {
      id: 'kundearrangement',
      titel: 'Kundearrangement',
      pris: 'Fra 2.800 kr./hold',
      beskrivelse: 'Eksklusiv golfoplevelse til jeres vigtigste kunder med VIP-service og middag.',
      inkluderer: ['9 eller 18 huller golf', 'VIP-velkomst', 'Middag på klubhuset', 'Fotoservice']
    },
    {
      id: 'medarbejderdag',
      titel: 'Medarbejderdag',
      pris: 'Fra 1.900 kr./person',
      beskrivelse: 'Giv dine medarbejdere en uforglemmelig dag med golf og samvær.',
      inkluderer: ['9 huller golf', 'Forfriskninger undervejs', 'Afslutningsfest', 'Overraskelser']
    },
    {
      id: 'firmagolf',
      titel: 'FirmaGolf',
      pris: 'Fra 950 kr./person',
      beskrivelse: 'Hurtig og social golfoplevelse – perfekt til firmaets eftermiddag.',
      inkluderer: ['Driving range', '9 huller golf', 'Sandwich & øl', 'Konkurrencer']
    },
    {
      id: 'konference',
      titel: 'Konference + Golf',
      pris: 'Fra 6.500 kr./hold',
      beskrivelse: 'Kombinér jeres næste konference eller strategidag med en runde golf.',
      inkluderer: ['Mødelokale hele dagen', '18 huller golf', 'Forplejning', 'Overnatning v/aftale']
    },
    {
      id: 'vip',
      titel: 'VIP-arrangement',
      pris: 'Tilbud på forespørgsel',
      beskrivelse: 'Skræddersyet VIP-oplevelse til særlige gæster eller eksklusive anledninger.',
      inkluderer: ['Fuld service', 'Personlig caddie', 'Gourmetmiddag', 'Eksklusivt program']
    }
  ],

  /* ── Sponsor fordele ── */
  sponsorFordele: [
    { ikon: '🏌️', titel: 'Synlighed', tekst: 'Logo på bane, hjemmeside, app og arrangementer' },
    { ikon: '🤝', titel: 'Netværk', tekst: 'Adgang til erhvervsarrangementer og eksklusiv sponsor-lounge' },
    { ikon: '⛳', titel: 'Golfoplevelser', tekst: 'Invitationer til greenfee, turneringer og golfrejser' },
    { ikon: '📣', titel: 'Kommunikation', tekst: 'Omtale i nyhedsbrev, sociale medier og presse' }
  ],

  /* ── Om erhvervsklubben ── */
  omEK: {
    tekst: 'Erhvervsklubben samler virksomheder og beslutningstagere omkring relationer, netværk og golf i professionelle, uformelle rammer.',
    punkter: [
      { ikon: '🤝', titel: 'Netværk', tekst: 'Mød beslutningstagere fra Aarhus-regionen i afslappede rammer.' },
      { ikon: '⛳', titel: 'Golf', tekst: 'EK-golf, turneringer og rejser på højt niveau.' },
      { ikon: '🌍', titel: 'Oplevelser', tekst: 'Udenlandsture, eksklusive events og uforglemmelige dage.' },
      { ikon: '📢', titel: 'Sponsorværdi', tekst: 'Synlighed og associering med Lyngbygaard Golf.' },
      { ikon: '🏆', titel: 'EK-golf', tekst: 'Egne turneringer, mesterskaber og konkurrencer for erhvervsmedlemmer.' },
      { ikon: '📅', titel: 'Arrangementer', tekst: 'Mere end 10 arrangementer om året — fra SIM Golf til udlandsrejser.' }
    ]
  }
};

/* ── Standard arrangementer (første opstart) ── */
const STANDARD_ARRANGEMENTER = [
  { id: 'a1',  dato: '2026-02-04', tid: '',          titel: 'Høj Sol over Aarhus',      sted: 'Hermans, Tivoli Friheden',                          type: 'Koncert / netværk',    beskrivelse: 'Årets første store erhvervsarrangement med musik og netværk.', maks: 80,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a2',  dato: '2026-03-04', tid: '16.00-21.00', titel: 'SIM Golf',               sted: 'Golfarena Aarhus',                                   type: 'Golf / netværk',       beskrivelse: 'Netværk og konkurrence på indoor simulator-bane.',              maks: 24,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a3',  dato: '2026-03-18', tid: '16.00-21.00', titel: 'SIM Golf',               sted: 'Golfarena Aarhus',                                   type: 'Golf / netværk',       beskrivelse: 'Netværk og konkurrence på indoor simulator-bane.',              maks: 24,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a4',  dato: '2026-03-24', tid: '',          titel: 'Byudvikling & Bajere',      sted: 'Aarhus',                                             type: 'Netværksarrangement',  beskrivelse: 'Uformel debat og netværk om byudvikling i Aarhus.',            maks: 50,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a5',  dato: '2026-04-22', tid: '',          titel: 'Hjemmekamp mod Himmerland Business Club', sted: 'Lyngbygaard Golf',                   type: 'Golf / netværk',       beskrivelse: 'Venlighedskamp og netværk med Himmerland Business Club.',      maks: 40,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a6',  dato: '2026-05-01', tid: '',          titel: 'Udlandsrejse — Skotland',   sted: 'Skotland',                                           type: 'Golfrejse',            beskrivelse: 'Golfrejse til Skotland 1.–4. maj 2026. Kontakt klubben for tilmelding.', maks: 20, tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a7',  dato: '2026-06-02', tid: '',          titel: 'Tysklandstur',              sted: 'Timmendorfer Strand',                                type: 'Golfrejse',            beskrivelse: 'Golfrejse til Timmendorfer Strand 2.–3. juni 2026.',           maks: 20,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a8',  dato: '2026-08-14', tid: '',          titel: 'Danish Golf Championship',  sted: 'Great Northern',                                     type: 'Golfoplevelse',        beskrivelse: 'Se årets store golfchampionship med erhvervsklubben.',         maks: 30,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a9',  dato: '2026-09-01', tid: '',          titel: 'Jyllandstur',               sted: 'Nordvestjysk Golfklub & Holstebro Golfklub',          type: 'Golfrejse',            beskrivelse: 'Jyllandstur 1.–2. september med golf på to baner.',            maks: 24,  tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a10', dato: '2026-10-09', tid: '',          titel: 'EK-Mesterskaberne',         sted: 'Silkeborg Ry Golfklub',                              type: 'Mesterskab',           beskrivelse: 'Erhvervsklubbens eget mesterskab — hvem bliver årets EK-mester?', maks: 48, tilmeldte: 0, status: 'aaben', tilmeldingAaben: true },
  { id: 'a11', dato: '2026-11-20', tid: '',          titel: 'Julefrokost & Gokart',      sted: 'Racehall Aarhus',                                    type: 'Socialt arrangement',  beskrivelse: 'Julefrokost med gokart — årets hyggeligste erhvervsarrangement.', maks: 60, tilmeldte: 0, status: 'aaben', tilmeldingAaben: true }
];

/* ── Default sponsorer ── */
const STANDARD_SPONSORER = [
  { id: 's1', navn: 'Hovedsponsor A/S', logo: '', link: '#', niveau: 'guld' },
  { id: 's2', navn: 'Partner Gruppen',  logo: '', link: '#', niveau: 'sølv' }
];

/* ============================================================
   STORAGE HELPERS
   ============================================================ */
const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: k => localStorage.removeItem(k)
};

function initData() {
  if (!DB.get('lyg_init')) {
    DB.set('lyg_arrangementer', STANDARD_ARRANGEMENTER);
    DB.set('lyg_sponsorer', STANDARD_SPONSORER);
    DB.set('lyg_tilmeldinger', []);
    DB.set('lyg_admin_kode', CONFIG.adminKode);
    DB.set('lyg_hero', { tekst: CONFIG.heroTekst, under: CONFIG.heroUnder, billede: CONFIG.heroBillede });
    DB.set('lyg_kontakt', CONFIG.kontaktPersoner);
    DB.set('lyg_golf_pakker', CONFIG.golfPakker);
    DB.set('lyg_init', true);
  }
}

function getArrangementer() {
  const arr = DB.get('lyg_arrangementer') || [];
  return arr.sort((a, b) => a.dato.localeCompare(b.dato));
}

function getAdminKode() {
  return DB.get('lyg_admin_kode') || CONFIG.adminKode;
}

/* ============================================================
   DATE HELPERS
   ============================================================ */
function fmtDato(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
}

function dageFor(iso, dage) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() - dage);
  return d;
}

function isFremtidig(iso) {
  return new Date(iso + 'T23:59:59') >= new Date();
}

/* ============================================================
   REMINDER SYSTEM (localStorage-based scheduler)
   ============================================================ */
function gemPåmindelser(arrangementId, datIso, titel) {
  const påm = DB.get('lyg_paamindelser') || {};
  påm[arrangementId] = { datIso, titel, tider: [14, 7, 3] };
  DB.set('lyg_paamindelser', påm);
}

function tjekPåmindelser() {
  if (!('Notification' in window)) return;
  const påm = DB.get('lyg_paamindelser') || {};
  const vist = DB.get('lyg_paam_vist') || {};
  const nu = new Date();

  Object.entries(påm).forEach(([id, p]) => {
    p.tider.forEach(dage => {
      const nøgle = `${id}_${dage}`;
      if (vist[nøgle]) return;
      const påmTid = dageFor(p.datIso, dage);
      if (nu >= påmTid) {
        if (Notification.permission === 'granted') {
          new Notification(`Husk: ${p.titel}`, {
            body: `Arrangementet er om ${dage} dag${dage > 1 ? 'e' : ''}.`,
            icon: '/icons/icon-192.png'
          });
        }
        vist[nøgle] = true;
      }
    });
  });
  DB.set('lyg_paam_vist', vist);
}

async function anmodNotifikationer() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const res = await Notification.requestPermission();
  return res;
}

/* ============================================================
   ROUTER
   ============================================================ */
let aktivSide = 'forside';

function navTil(side, data) {
  aktivSide = side;
  renderApp(data);
  window.scrollTo(0, 0);
}

/* ============================================================
   CSV EXPORT
   ============================================================ */
function exportCSV(arrangementId) {
  const alle = DB.get('lyg_tilmeldinger') || [];
  const data = arrangementId ? alle.filter(t => t.arrangementId === arrangementId) : alle;
  const headers = ['Arrangement', 'Navn', 'Virksomhed', 'Email', 'Telefon', 'Antal', 'Kommentar', 'Dato', 'Mødt'];
  const rows = data.map(t => [
    t.arrangementTitel || '', t.navn, t.virksomhed, t.email, t.telefon,
    t.antal, t.kommentar || '', t.oprettetDato || '', t.mødt ? 'Ja' : 'Nej'
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `tilmeldinger_${arrangementId || 'alle'}_${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

/* ============================================================
   RENDER ENGINE
   ============================================================ */
function renderApp(data) {
  const main = document.getElementById('main-content');
  const nav = document.getElementById('bottom-nav');

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.side === aktivSide);
  });

  switch (aktivSide) {
    case 'forside':       main.innerHTML = renderForside(); break;
    case 'kalender':      main.innerHTML = renderKalender(); break;
    case 'tilmelding':    main.innerHTML = renderTilmelding(data); break;
    case 'golfarr':       main.innerHTML = renderGolfArrangementer(); break;
    case 'sponsor':       main.innerHTML = renderSponsor(); break;
    case 'om':            main.innerHTML = renderOm(); break;
    case 'kontakt':       main.innerHTML = renderKontakt(); break;
    case 'admin':         main.innerHTML = renderAdmin(); break;
    default:              main.innerHTML = renderForside();
  }

  bindEvents();
}

/* ============================================================
   FORSIDE
   ============================================================ */
function renderForside() {
  const hero = DB.get('lyg_hero') || { tekst: CONFIG.heroTekst, under: CONFIG.heroUnder, billede: CONFIG.heroBillede };
  const kommendeArr = getArrangementer().filter(a => isFremtidig(a.dato)).slice(0, 3);

  return `
  <div class="hero" style="background-image: url('${hero.billede}')">
    <div class="hero-overlay">
      <div class="hero-logo">⛳ LYG Erhverv</div>
      <h1 class="hero-titel">${hero.tekst}</h1>
      <p class="hero-under">${hero.under}</p>
    </div>
  </div>

  <section class="sektion">
    <div class="grid-2">
      <button class="stor-knap" onclick="navTil('kalender')">📅 Se kalender</button>
      <button class="stor-knap" onclick="navTil('tilmelding')">✅ Tilmeld arrangement</button>
      <button class="stor-knap guld" onclick="navTil('golfarr')">⛳ Book golfarrangement</button>
      <button class="stor-knap guld" onclick="navTil('sponsor')">🌟 Bliv sponsor</button>
    </div>
  </section>

  <section class="sektion">
    <div class="ikon-grid">
      <div class="ikon-kort">
        <span class="ikon-stor">🤝</span>
        <strong>Netværk & relationer</strong>
        <p>Mød Aarhus-regionens erhvervsliv</p>
      </div>
      <div class="ikon-kort">
        <span class="ikon-stor">⛳</span>
        <strong>Golf & oplevelser</strong>
        <p>Turneringer, rejser og eksklusive events</p>
      </div>
      <div class="ikon-kort">
        <span class="ikon-stor">📢</span>
        <strong>Sponsorer & synlighed</strong>
        <p>Styrk din virksomheds tilstedeværelse</p>
      </div>
      <div class="ikon-kort">
        <span class="ikon-stor">📅</span>
        <strong>Kalender & arrangementer</strong>
        <p>Mere end 10 events om året</p>
      </div>
    </div>
  </section>

  ${kommendeArr.length ? `
  <section class="sektion">
    <h2 class="sektions-titel">Kommende arrangementer</h2>
    <div class="arr-liste">
      ${kommendeArr.map(a => renderArrKort(a, true)).join('')}
    </div>
    <div style="text-align:center;margin-top:1rem">
      <button class="knap-sekundær" onclick="navTil('kalender')">Se alle arrangementer →</button>
    </div>
  </section>` : ''}
  `;
}

/* ============================================================
   ARRANGEMENT KORT
   ============================================================ */
function renderArrKort(a, kompakt = false) {
  const ledig = a.maks - a.tilmeldte;
  const pct   = Math.min(100, Math.round((a.tilmeldte / a.maks) * 100));
  let statusKlasse = 'status-aaben';
  let statusTekst  = 'Åben';
  if (!a.tilmeldingAaben || a.status === 'lukket') { statusKlasse = 'status-lukket'; statusTekst = 'Lukket'; }
  else if (ledig <= 3 && ledig > 0)               { statusKlasse = 'status-faa';    statusTekst = 'Få pladser'; }
  else if (ledig <= 0)                              { statusKlasse = 'status-lukket'; statusTekst = 'Fuldt'; }

  const fremtidig = isFremtidig(a.dato);

  return `
  <div class="arr-kort ${kompakt ? 'kompakt' : ''}">
    <div class="arr-header">
      <div>
        <div class="arr-dato">${fmtDato(a.dato)}${a.tid ? ' · ' + a.tid : ''}</div>
        <h3 class="arr-titel">${a.titel}</h3>
        ${a.sted ? `<div class="arr-sted">📍 ${a.sted}</div>` : ''}
        ${a.type ? `<div class="arr-type">${a.type}</div>` : ''}
      </div>
      <span class="status-badge ${statusKlasse}">${statusTekst}</span>
    </div>
    ${!kompakt ? `<p class="arr-besk">${a.beskrivelse || ''}</p>` : ''}
    ${!kompakt ? `
    <div class="arr-info-grid">
      <div class="arr-info-felt"><span class="arr-info-label">Maks</span><strong>${a.maks}</strong></div>
      <div class="arr-info-felt"><span class="arr-info-label">Tilmeldte</span><strong>${a.tilmeldte}</strong></div>
      <div class="arr-info-felt"><span class="arr-info-label">Ledige</span><strong>${Math.max(0, ledig)}</strong></div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    ` : ''}
    ${fremtidig ? `
    <div class="arr-knapper">
      ${a.tilmeldingAaben && ledig > 0 ? `<button class="knap-primaer" onclick="navTil('tilmelding', {id:'${a.id}'})">Tilmeld</button>` : ''}
      ${a.tilmeldingAaben && ledig <= 0 ? `<button class="knap-sekundær" onclick="venteListe('${a.id}')">Venteliste</button>` : ''}
      <button class="knap-ikon" onclick="tilfoejKalender('${a.id}')" title="Tilføj til kalender">📆</button>
      <button class="knap-ikon" onclick="aktiverPaamindelse('${a.id}')" title="Aktiver påmindelser">🔔</button>
    </div>` : ''}
  </div>`;
}

/* ============================================================
   KALENDER
   ============================================================ */
function renderKalender() {
  const alle = getArrangementer();
  const fremtidige = alle.filter(a => isFremtidig(a.dato));
  const tidligere  = alle.filter(a => !isFremtidig(a.dato));

  return `
  <div class="side-header"><h1>Kalender</h1><p>Alle arrangementer i Erhvervsklubben</p></div>
  <section class="sektion">
    ${fremtidige.length ? fremtidige.map(a => renderArrKort(a)).join('') : '<p class="muted-txt">Ingen kommende arrangementer.</p>'}
  </section>
  ${tidligere.length ? `
  <section class="sektion">
    <h2 class="sektions-titel muted">Tidligere arrangementer</h2>
    ${tidligere.reverse().map(a => renderArrKort(a)).join('')}
  </section>` : ''}
  `;
}

/* ============================================================
   TILMELDING
   ============================================================ */
function renderTilmelding(data) {
  const arrangementer = getArrangementer().filter(a => isFremtidig(a.dato) && a.tilmeldingAaben);
  const valgtId = data?.id || '';

  return `
  <div class="side-header"><h1>Tilmeld dig</h1><p>Tilmeld dig et arrangement nedenfor</p></div>
  <section class="sektion">
    <form id="tilmeld-form" onsubmit="indsendTilmelding(event)">
      <div class="form-gruppe">
        <label>Arrangement *</label>
        <select name="arrangementId" required>
          <option value="">Vælg arrangement…</option>
          ${arrangementer.map(a => `<option value="${a.id}" ${valgtId === a.id ? 'selected' : ''}>${fmtDato(a.dato)} — ${a.titel}</option>`).join('')}
        </select>
      </div>
      <div class="form-gruppe">
        <label>Navn *</label>
        <input type="text" name="navn" required placeholder="Dit fulde navn">
      </div>
      <div class="form-gruppe">
        <label>Virksomhed *</label>
        <input type="text" name="virksomhed" required placeholder="Virksomhedens navn">
      </div>
      <div class="form-gruppe">
        <label>Email *</label>
        <input type="email" name="email" required placeholder="din@email.dk">
      </div>
      <div class="form-gruppe">
        <label>Telefon</label>
        <input type="tel" name="telefon" placeholder="12 34 56 78">
      </div>
      <div class="form-gruppe">
        <label>Antal deltagere *</label>
        <input type="number" name="antal" min="1" max="10" value="1" required>
      </div>
      <div class="form-gruppe">
        <label>Kommentar</label>
        <textarea name="kommentar" rows="3" placeholder="Særlige ønsker, allergier eller spørgsmål…"></textarea>
      </div>
      <button type="submit" class="knap-primaer fuld-bredde">Send tilmelding</button>
    </form>
    <div id="tilmelding-kvittering" style="display:none"></div>
  </section>`;
}

function indsendTilmelding(e) {
  e.preventDefault();
  const f = e.target;
  const arrId = f.arrangementId.value;
  const arr = getArrangementer().find(a => a.id === arrId);
  if (!arr) return alert('Vælg venligst et arrangement.');

  const antal = parseInt(f.antal.value) || 1;
  const ledig = arr.maks - arr.tilmeldte;
  if (antal > ledig) {
    alert(`Der er kun ${ledig} ledig${ledig === 1 ? '' : 'e'} plads${ledig === 1 ? '' : 'er'}.`);
    return;
  }

  const tilmelding = {
    id: 't' + Date.now(),
    arrangementId: arrId,
    arrangementTitel: arr.titel,
    navn: f.navn.value,
    virksomhed: f.virksomhed.value,
    email: f.email.value,
    telefon: f.telefon.value,
    antal, kommentar: f.kommentar.value,
    oprettetDato: new Date().toISOString().split('T')[0],
    mødt: false
  };

  // Gem tilmelding
  const alle = DB.get('lyg_tilmeldinger') || [];
  alle.push(tilmelding);
  DB.set('lyg_tilmeldinger', alle);

  // Opdater arrangement
  const arrs = DB.get('lyg_arrangementer') || [];
  const idx = arrs.findIndex(a => a.id === arrId);
  if (idx > -1) {
    arrs[idx].tilmeldte += antal;
    if (arrs[idx].tilmeldte >= arrs[idx].maks) arrs[idx].status = 'fuldt';
    DB.set('lyg_arrangementer', arrs);
  }

  // Vis kvittering
  f.style.display = 'none';
  document.getElementById('tilmelding-kvittering').style.display = 'block';
  document.getElementById('tilmelding-kvittering').innerHTML = `
    <div class="kvittering">
      <div class="kvittering-ikon">✅</div>
      <h2>Tilmelding modtaget!</h2>
      <p><strong>${tilmelding.navn}</strong> er tilmeldt <strong>${arr.titel}</strong> den ${fmtDato(arr.dato)}.</p>
      <p class="muted-txt">Kontakt os på ${CONFIG.email} ved spørgsmål.</p>
      <button class="knap-primaer" onclick="navTil('kalender')">Se kalender</button>
      <button class="knap-sekundær" onclick="navTil('tilmelding')">Tilmeld endnu en</button>
    </div>`;
}

function venteListe(arrId) {
  const arr = getArrangementer().find(a => a.id === arrId);
  if (!arr) return;
  const navn = prompt('Dit navn (venteliste):');
  if (!navn) return;
  const email = prompt('Din email:');
  if (!email) return;
  const venteliste = DB.get('lyg_venteliste') || [];
  venteliste.push({ arrangementId: arrId, arrangementTitel: arr.titel, navn, email, dato: new Date().toISOString() });
  DB.set('lyg_venteliste', venteliste);
  alert(`Du er sat på venteliste til "${arr.titel}". Vi kontakter dig, hvis der opstår en ledig plads.`);
}

/* ============================================================
   GOLF ARRANGEMENTER
   ============================================================ */
function renderGolfArrangementer() {
  const pakker = DB.get('lyg_golf_pakker') || CONFIG.golfPakker;
  return `
  <div class="side-header">
    <h1>Book golfarrangement</h1>
    <p>Skræddersyede golfoplevelser til din virksomhed</p>
  </div>
  <section class="sektion">
    <div class="pakke-grid">
      ${pakker.map(p => `
        <div class="pakke-kort">
          <h3>${p.titel}</h3>
          <div class="pakke-pris">${p.pris}</div>
          <p>${p.beskrivelse}</p>
          <ul class="pakke-liste">
            ${(p.inkluderer || []).map(i => `<li>✓ ${i}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  </section>

  <section class="sektion" id="book-golf">
    <h2 class="sektions-titel">Book nu</h2>
    <form id="golf-form" onsubmit="indsendGolfBooking(event)">
      <div class="form-gruppe">
        <label>Virksomhed *</label>
        <input type="text" name="virksomhed" required placeholder="Virksomhedens navn">
      </div>
      <div class="form-gruppe">
        <label>Kontaktperson *</label>
        <input type="text" name="kontaktperson" required>
      </div>
      <div class="form-gruppe">
        <label>Email *</label>
        <input type="email" name="email" required>
      </div>
      <div class="form-gruppe">
        <label>Telefon</label>
        <input type="tel" name="telefon">
      </div>
      <div class="form-gruppe">
        <label>Ønsket dato</label>
        <input type="date" name="dato">
      </div>
      <div class="form-gruppe">
        <label>Antal personer</label>
        <input type="number" name="antal" min="1" value="4">
      </div>
      <div class="form-gruppe">
        <label>Pakke / besked</label>
        <textarea name="besked" rows="3" placeholder="Beskriv jeres ønsker…"></textarea>
      </div>
      <button type="submit" class="knap-primaer fuld-bredde">Send forespørgsel</button>
    </form>
    <div id="golf-kvittering" style="display:none" class="kvittering">
      <div class="kvittering-ikon">✅</div>
      <h2>Forespørgsel sendt!</h2>
      <p>Vi kontakter dig hurtigst muligt på den angivne email.</p>
      <button class="knap-sekundær" onclick="navTil('forside')">Tilbage til forsiden</button>
    </div>
  </section>`;
}

function indsendGolfBooking(e) {
  e.preventDefault();
  const bookinger = DB.get('lyg_golf_bookinger') || [];
  const f = e.target;
  bookinger.push({
    id: 'g' + Date.now(),
    virksomhed: f.virksomhed.value, kontaktperson: f.kontaktperson.value,
    email: f.email.value, telefon: f.telefon.value,
    dato: f.dato.value, antal: f.antal.value, besked: f.besked.value,
    oprettet: new Date().toISOString()
  });
  DB.set('lyg_golf_bookinger', bookinger);
  f.style.display = 'none';
  document.getElementById('golf-kvittering').style.display = 'block';
}

/* ============================================================
   SPONSOR
   ============================================================ */
function renderSponsor() {
  const sponsorer = DB.get('lyg_sponsorer') || STANDARD_SPONSORER;
  return `
  <div class="side-header">
    <h1>Bliv sponsor</h1>
    <p>Styrk din virksomhed med synlighed og relationer</p>
  </div>
  <section class="sektion">
    <div class="sponsor-tekst-boks">
      <p>"Som sponsor bliver virksomheden en del af et stærkt fællesskab med synlighed, relationer og oplevelser omkring golfen."</p>
    </div>
    <div class="ikon-grid">
      ${CONFIG.sponsorFordele.map(f => `
        <div class="ikon-kort">
          <span class="ikon-stor">${f.ikon}</span>
          <strong>${f.titel}</strong>
          <p>${f.tekst}</p>
        </div>
      `).join('')}
    </div>
  </section>

  ${sponsorer.length ? `
  <section class="sektion">
    <h2 class="sektions-titel">Vores sponsorer</h2>
    <div class="sponsor-grid">
      ${sponsorer.map(s => `
        <a class="sponsor-kort" href="${s.link || '#'}" target="_blank">
          ${s.logo ? `<img src="${s.logo}" alt="${s.navn}" class="sponsor-logo">` : `<div class="sponsor-navn-stor">${s.navn}</div>`}
          <div class="sponsor-niveau">${s.niveau || ''}</div>
        </a>
      `).join('')}
    </div>
  </section>` : ''}

  <section class="sektion">
    <h2 class="sektions-titel">Kontakt vedr. sponsorat</h2>
    <div style="text-align:center">
      <a class="knap-primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 Ring til os</a>
      <a class="knap-sekundær" href="mailto:${CONFIG.email}?subject=Sponsorat">✉️ Send email</a>
    </div>
  </section>`;
}

/* ============================================================
   OM ERHVERVSKLUBBEN
   ============================================================ */
function renderOm() {
  return `
  <div class="side-header">
    <h1>Erhvervsklubben</h1>
    <p>${CONFIG.omEK.tekst}</p>
  </div>
  <section class="sektion">
    <div class="ikon-grid">
      ${CONFIG.omEK.punkter.map(p => `
        <div class="ikon-kort">
          <span class="ikon-stor">${p.ikon}</span>
          <strong>${p.titel}</strong>
          <p>${p.tekst}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <section class="sektion">
    <div class="sponsor-tekst-boks">
      <p>Interesseret i at blive erhvervsmedlem? Kontakt os og hør mere om mulighederne.</p>
      <div style="text-align:center;margin-top:1rem">
        <a class="knap-primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 ${CONFIG.telefon}</a>
        <a class="knap-sekundær" href="mailto:${CONFIG.email}">✉️ ${CONFIG.email}</a>
      </div>
    </div>
  </section>`;
}

/* ============================================================
   KONTAKT
   ============================================================ */
function renderKontakt() {
  return `
  <div class="side-header">
    <h1>Kontakt</h1>
    <p>Vi er klar til at hjælpe dig</p>
  </div>
  <section class="sektion">
    <div class="kontakt-info-boks">
      <div class="kontakt-linje"><span>📍</span> ${CONFIG.adresse}</div>
      <div class="kontakt-linje"><a href="tel:${CONFIG.telefon.replace(/\s/g,'')}"><span>📞</span> ${CONFIG.telefon}</a></div>
      <div class="kontakt-linje"><a href="mailto:${CONFIG.email}"><span>✉️</span> ${CONFIG.email}</a></div>
    </div>
    <div class="kontakt-knapper">
      <a class="knap-primaer" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 Ring til os</a>
      <a class="knap-sekundær" href="mailto:${CONFIG.email}">✉️ Send email</a>
    </div>
  </section>
  <section class="sektion">
    <h2 class="sektions-titel">Send en besked</h2>
    <form id="kontakt-form" onsubmit="indsendKontakt(event)">
      <div class="form-2kol">
        <div class="form-gruppe">
          <label>Fornavn *</label>
          <input type="text" name="fornavn" required>
        </div>
        <div class="form-gruppe">
          <label>Efternavn *</label>
          <input type="text" name="efternavn" required>
        </div>
      </div>
      <div class="form-gruppe">
        <label>Email *</label>
        <input type="email" name="email" required>
      </div>
      <div class="form-gruppe">
        <label>Telefon</label>
        <input type="tel" name="telefon">
      </div>
      <div class="form-gruppe">
        <label>Besked *</label>
        <textarea name="besked" rows="4" required placeholder="Skriv din besked her…"></textarea>
      </div>
      <button type="submit" class="knap-primaer fuld-bredde">Send besked</button>
    </form>
    <div id="kontakt-kvittering" style="display:none" class="kvittering">
      <div class="kvittering-ikon">✅</div>
      <h2>Besked modtaget!</h2>
      <p>Vi vender tilbage hurtigst muligt.</p>
      <button class="knap-sekundær" onclick="navTil('forside')">Tilbage til forsiden</button>
    </div>
  </section>`;
}

function indsendKontakt(e) {
  e.preventDefault();
  const beskeder = DB.get('lyg_beskeder') || [];
  const f = e.target;
  beskeder.push({
    id: 'b' + Date.now(),
    fornavn: f.fornavn.value, efternavn: f.efternavn.value,
    email: f.email.value, telefon: f.telefon.value,
    besked: f.besked.value, dato: new Date().toISOString()
  });
  DB.set('lyg_beskeder', beskeder);
  f.style.display = 'none';
  document.getElementById('kontakt-kvittering').style.display = 'block';
}

/* ============================================================
   ADMIN — LOGIN + PANEL
   ============================================================ */
let adminLoggetInd = false;

function renderAdmin() {
  if (!adminLoggetInd) return renderAdminLogin();
  return renderAdminPanel();
}

function renderAdminLogin() {
  return `
  <div class="side-header"><h1>Admin</h1></div>
  <section class="sektion">
    <div class="admin-login-boks">
      <p class="muted-txt" style="text-align:center;margin-bottom:1.5rem">Indtast admin-koden for at logge ind</p>
      <div class="form-gruppe">
        <label>Admin-kode</label>
        <input type="password" id="admin-kode-input" placeholder="••••" maxlength="20">
      </div>
      <button class="knap-primaer fuld-bredde" onclick="tjekAdminKode()">Log ind</button>
      <div id="admin-fejl" class="fejl-boks" style="display:none">Forkert kode. Prøv igen.</div>
    </div>
  </section>`;
}

function tjekAdminKode() {
  const input = document.getElementById('admin-kode-input').value;
  if (input === getAdminKode()) {
    adminLoggetInd = true;
    navTil('admin');
  } else {
    document.getElementById('admin-fejl').style.display = 'block';
  }
}

function renderAdminPanel() {
  const fane = window._adminFane || 'arrangementer';
  return `
  <div class="side-header">
    <h1>Admin</h1>
    <button class="knap-lille" onclick="adminLogUd()">Log ud</button>
  </div>
  <div class="admin-faner">
    ${[
      ['arrangementer','Arrangementer'],
      ['tilmeldinger','Tilmeldinger'],
      ['sponsorer','Sponsorer'],
      ['golf','Golf-pakker'],
      ['indstillinger','Indstillinger'],
      ['backup','Backup']
    ].map(([k,l]) => `<button class="admin-fane ${fane===k?'aktiv':''}" onclick="skiftAdminFane('${k}')">${l}</button>`).join('')}
  </div>
  <section class="sektion">
    ${fane === 'arrangementer'   ? renderAdminArr()          : ''}
    ${fane === 'tilmeldinger'    ? renderAdminTilm()         : ''}
    ${fane === 'sponsorer'       ? renderAdminSponsor()      : ''}
    ${fane === 'golf'            ? renderAdminGolf()         : ''}
    ${fane === 'indstillinger'   ? renderAdminIndstillinger(): ''}
    ${fane === 'backup'          ? renderAdminBackup()       : ''}
  </section>`;
}

function skiftAdminFane(fane) {
  window._adminFane = fane;
  navTil('admin');
}

function adminLogUd() {
  adminLoggetInd = false;
  navTil('forside');
}

/* ── Admin: Arrangementer ── */
function renderAdminArr() {
  const arrs = getArrangementer();
  return `
  <div class="admin-handlinger">
    <button class="knap-primaer" onclick="adminOpretArr()">+ Nyt arrangement</button>
    <button class="knap-sekundær" onclick="kopierTilNytAar()">📋 Kopier til nyt år</button>
  </div>
  <div class="admin-arr-liste">
    ${arrs.length ? arrs.map(a => `
      <div class="admin-arr-kort">
        <div class="admin-arr-info">
          <strong>${a.titel}</strong>
          <span class="muted-txt">${fmtDato(a.dato)}${a.tid ? ' · ' + a.tid : ''}</span>
          <span>${a.tilmeldte}/${a.maks} tilmeldte</span>
        </div>
        <div class="admin-arr-knapper">
          <button class="knap-lille" onclick="adminRedigerArr('${a.id}')">✏️</button>
          <button class="knap-lille" onclick="adminKopierArr('${a.id}')">📋</button>
          <button class="knap-lille rød" onclick="adminSletArr('${a.id}')">🗑️</button>
        </div>
      </div>`).join('') : '<p class="muted-txt">Ingen arrangementer endnu.</p>'}
  </div>
  <div id="admin-arr-form-container"></div>`;
}

function adminOpretArr() {
  const c = document.getElementById('admin-arr-form-container');
  c.innerHTML = renderArrForm(null);
}

function adminRedigerArr(id) {
  const arr = (DB.get('lyg_arrangementer') || []).find(a => a.id === id);
  const c = document.getElementById('admin-arr-form-container');
  c.innerHTML = renderArrForm(arr);
  c.scrollIntoView({ behavior: 'smooth' });
}

function renderArrForm(arr) {
  const er = !!arr;
  return `
  <div class="admin-form-boks">
    <h3>${er ? 'Rediger' : 'Nyt'} arrangement</h3>
    <form onsubmit="gemArr(event, '${er ? arr.id : ''}')">
      <div class="form-gruppe"><label>Titel *</label><input name="titel" required value="${er ? arr.titel : ''}"></div>
      <div class="form-2kol">
        <div class="form-gruppe"><label>Dato *</label><input type="date" name="dato" required value="${er ? arr.dato : ''}"></div>
        <div class="form-gruppe"><label>Tid</label><input name="tid" placeholder="16.00-21.00" value="${er ? (arr.tid||'') : ''}"></div>
      </div>
      <div class="form-gruppe"><label>Sted</label><input name="sted" value="${er ? (arr.sted||'') : ''}"></div>
      <div class="form-gruppe"><label>Type</label><input name="type" value="${er ? (arr.type||'') : ''}"></div>
      <div class="form-gruppe"><label>Beskrivelse</label><textarea name="beskrivelse" rows="3">${er ? (arr.beskrivelse||'') : ''}</textarea></div>
      <div class="form-2kol">
        <div class="form-gruppe"><label>Maks pladser</label><input type="number" name="maks" min="1" value="${er ? arr.maks : 40}"></div>
        <div class="form-gruppe"><label>Tilmeldte</label><input type="number" name="tilmeldte" min="0" value="${er ? arr.tilmeldte : 0}"></div>
      </div>
      <div class="form-gruppe">
        <label>Status</label>
        <select name="status">
          <option value="aaben" ${er && arr.status==='aaben' ? 'selected':''}>Åben</option>
          <option value="lukket" ${er && arr.status==='lukket' ? 'selected':''}>Lukket</option>
        </select>
      </div>
      <div class="form-gruppe">
        <label>
          <input type="checkbox" name="tilmeldingAaben" ${!er || arr.tilmeldingAaben ? 'checked' : ''}> Tilmelding åben
        </label>
      </div>
      <div class="form-knapper">
        <button type="submit" class="knap-primaer">${er ? 'Gem ændringer' : 'Opret arrangement'}</button>
        <button type="button" class="knap-sekundær" onclick="this.closest('.admin-form-boks').remove()">Annuller</button>
      </div>
    </form>
  </div>`;
}

function gemArr(e, id) {
  e.preventDefault();
  const f = e.target;
  const arrs = DB.get('lyg_arrangementer') || [];
  const nytArr = {
    id: id || 'a' + Date.now(),
    titel: f.titel.value, dato: f.dato.value, tid: f.tid.value,
    sted: f.sted.value, type: f.type.value, beskrivelse: f.beskrivelse.value,
    maks: parseInt(f.maks.value) || 40,
    tilmeldte: parseInt(f.tilmeldte.value) || 0,
    status: f.status.value,
    tilmeldingAaben: f.tilmeldingAaben.checked
  };

  if (id) {
    const idx = arrs.findIndex(a => a.id === id);
    if (idx > -1) arrs[idx] = nytArr;
  } else {
    arrs.push(nytArr);
  }
  DB.set('lyg_arrangementer', arrs);
  navTil('admin');
}

function adminSletArr(id) {
  if (!confirm('Slet dette arrangement?')) return;
  const arrs = (DB.get('lyg_arrangementer') || []).filter(a => a.id !== id);
  DB.set('lyg_arrangementer', arrs);
  navTil('admin');
}

function adminKopierArr(id) {
  const arr = (DB.get('lyg_arrangementer') || []).find(a => a.id === id);
  if (!arr) return;
  const nyt = { ...arr, id: 'a' + Date.now(), titel: arr.titel + ' (kopi)', tilmeldte: 0 };
  const arrs = DB.get('lyg_arrangementer') || [];
  arrs.push(nyt);
  DB.set('lyg_arrangementer', arrs);
  navTil('admin');
  alert('Arrangement kopieret.');
}

function kopierTilNytAar() {
  const aar = prompt('Kopier alle arrangementer til hvilket år?', new Date().getFullYear() + 1);
  if (!aar || isNaN(parseInt(aar))) return;
  const arrs = DB.get('lyg_arrangementer') || [];
  const nyeArrs = arrs.map(a => {
    const gammeltAar = a.dato.split('-')[0];
    return { ...a, id: 'a' + Date.now() + Math.random().toString(36).substr(2,5), dato: a.dato.replace(gammeltAar, aar), tilmeldte: 0, status: 'aaben', tilmeldingAaben: true };
  });
  arrs.push(...nyeArrs);
  DB.set('lyg_arrangementer', arrs);
  navTil('admin');
  alert(`${nyeArrs.length} arrangementer kopieret til ${aar}.`);
}

/* ── Admin: Tilmeldinger ── */
function renderAdminTilm() {
  const alle = DB.get('lyg_tilmeldinger') || [];
  const søg = window._tilmSøg || '';
  const filtrerede = søg ? alle.filter(t =>
    t.navn.toLowerCase().includes(søg.toLowerCase()) ||
    t.virksomhed.toLowerCase().includes(søg.toLowerCase())
  ) : alle;

  return `
  <div class="admin-handlinger">
    <input type="search" placeholder="Søg navn / virksomhed…" value="${søg}"
      oninput="window._tilmSøg=this.value;skiftAdminFane('tilmeldinger')" style="flex:1;min-width:0">
    <button class="knap-sekundær" onclick="exportCSV('')">📥 Eksportér alle</button>
  </div>
  ${filtrerede.length ? `
  <div class="tilm-tabel-wrapper">
    <table class="tilm-tabel">
      <thead><tr><th>Arrangement</th><th>Navn</th><th>Virksomhed</th><th>Antal</th><th>Mødt</th><th></th></tr></thead>
      <tbody>
        ${filtrerede.map(t => `
          <tr>
            <td>${t.arrangementTitel||'–'}</td>
            <td>${t.navn}</td>
            <td>${t.virksomhed}</td>
            <td>${t.antal}</td>
            <td><input type="checkbox" ${t.mødt?'checked':''} onchange="markerMødt('${t.id}',this.checked)"></td>
            <td><button class="knap-lille rød" onclick="sletTilmelding('${t.id}')">🗑️</button></td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>` : `<p class="muted-txt">Ingen tilmeldinger${søg ? ' matcher søgningen' : ' endnu'}.</p>`}`;
}

function markerMødt(id, mødt) {
  const alle = DB.get('lyg_tilmeldinger') || [];
  const idx = alle.findIndex(t => t.id === id);
  if (idx > -1) { alle[idx].mødt = mødt; DB.set('lyg_tilmeldinger', alle); }
}

function sletTilmelding(id) {
  if (!confirm('Slet denne tilmelding?')) return;
  const alle = (DB.get('lyg_tilmeldinger') || []).filter(t => t.id !== id);
  DB.set('lyg_tilmeldinger', alle);
  skiftAdminFane('tilmeldinger');
}

/* ── Admin: Sponsorer ── */
function renderAdminSponsor() {
  const sponsorer = DB.get('lyg_sponsorer') || [];
  return `
  <div class="admin-handlinger">
    <button class="knap-primaer" onclick="adminTilfoejSponsor()">+ Tilføj sponsor</button>
  </div>
  <div class="admin-arr-liste">
    ${sponsorer.map(s => `
      <div class="admin-arr-kort">
        <div class="admin-arr-info"><strong>${s.navn}</strong><span>${s.niveau||''}</span></div>
        <div class="admin-arr-knapper">
          <button class="knap-lille" onclick="adminRedigerSponsor('${s.id}')">✏️</button>
          <button class="knap-lille rød" onclick="adminSletSponsor('${s.id}')">🗑️</button>
        </div>
      </div>`).join('')}
  </div>
  <div id="admin-sponsor-form"></div>`;
}

function adminTilfoejSponsor() {
  document.getElementById('admin-sponsor-form').innerHTML = renderSponsorForm(null);
}

function adminRedigerSponsor(id) {
  const s = (DB.get('lyg_sponsorer') || []).find(x => x.id === id);
  document.getElementById('admin-sponsor-form').innerHTML = renderSponsorForm(s);
}

function renderSponsorForm(s) {
  const er = !!s;
  return `
  <div class="admin-form-boks">
    <h3>${er ? 'Rediger' : 'Ny'} sponsor</h3>
    <form onsubmit="gemSponsor(event, '${er ? s.id : ''}')">
      <div class="form-gruppe"><label>Navn *</label><input name="navn" required value="${er ? s.navn : ''}"></div>
      <div class="form-gruppe"><label>Logo URL</label><input name="logo" value="${er ? (s.logo||'') : ''}"></div>
      <div class="form-gruppe"><label>Link</label><input name="link" value="${er ? (s.link||'') : ''}"></div>
      <div class="form-gruppe"><label>Niveau</label>
        <select name="niveau">
          ${['guld','sølv','bronze','standard'].map(n => `<option value="${n}" ${er && s.niveau===n?'selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-knapper">
        <button type="submit" class="knap-primaer">Gem</button>
        <button type="button" class="knap-sekundær" onclick="this.closest('.admin-form-boks').remove()">Annuller</button>
      </div>
    </form>
  </div>`;
}

function gemSponsor(e, id) {
  e.preventDefault();
  const f = e.target;
  const sponsorer = DB.get('lyg_sponsorer') || [];
  const nyS = { id: id || 's' + Date.now(), navn: f.navn.value, logo: f.logo.value, link: f.link.value, niveau: f.niveau.value };
  if (id) { const idx = sponsorer.findIndex(s => s.id === id); if (idx > -1) sponsorer[idx] = nyS; }
  else sponsorer.push(nyS);
  DB.set('lyg_sponsorer', sponsorer);
  skiftAdminFane('sponsorer');
}

function adminSletSponsor(id) {
  if (!confirm('Fjern sponsor?')) return;
  DB.set('lyg_sponsorer', (DB.get('lyg_sponsorer') || []).filter(s => s.id !== id));
  skiftAdminFane('sponsorer');
}

/* ── Admin: Golf-pakker ── */
function renderAdminGolf() {
  const pakker = DB.get('lyg_golf_pakker') || CONFIG.golfPakker;
  return `
  <p class="muted-txt">Rediger golf-pakkerne nedenfor. Ændringer vises straks på "Book golfarrangement".</p>
  ${pakker.map((p, i) => `
    <div class="admin-form-boks" style="margin-bottom:1rem">
      <form onsubmit="gemGolfPakke(event, ${i})">
        <div class="form-gruppe"><label>Titel</label><input name="titel" value="${p.titel}"></div>
        <div class="form-gruppe"><label>Pris</label><input name="pris" value="${p.pris}"></div>
        <div class="form-gruppe"><label>Beskrivelse</label><textarea name="beskrivelse" rows="2">${p.beskrivelse}</textarea></div>
        <div class="form-gruppe"><label>Inkluderer (én pr. linje)</label><textarea name="inkluderer" rows="3">${(p.inkluderer||[]).join('\n')}</textarea></div>
        <button type="submit" class="knap-lille">Gem</button>
      </form>
    </div>`).join('')}`;
}

function gemGolfPakke(e, idx) {
  e.preventDefault();
  const f = e.target;
  const pakker = DB.get('lyg_golf_pakker') || CONFIG.golfPakker;
  pakker[idx] = { ...pakker[idx], titel: f.titel.value, pris: f.pris.value, beskrivelse: f.beskrivelse.value, inkluderer: f.inkluderer.value.split('\n').filter(Boolean) };
  DB.set('lyg_golf_pakker', pakker);
  alert('Pakke gemt.');
}

/* ── Admin: Indstillinger ── */
function renderAdminIndstillinger() {
  const hero = DB.get('lyg_hero') || {};
  const kontakt = (DB.get('lyg_kontakt') || [{}])[0] || {};
  return `
  <div class="admin-form-boks">
    <h3>Hero-sektion</h3>
    <form onsubmit="gemHero(event)">
      <div class="form-gruppe"><label>Overskrift</label><input name="tekst" value="${hero.tekst||CONFIG.heroTekst}"></div>
      <div class="form-gruppe"><label>Underoverskrift</label><textarea name="under" rows="2">${hero.under||CONFIG.heroUnder}</textarea></div>
      <div class="form-gruppe"><label>Hero-billede URL</label><input name="billede" value="${hero.billede||CONFIG.heroBillede}"></div>
      <button type="submit" class="knap-primaer">Gem hero</button>
    </form>
  </div>
  <div class="admin-form-boks">
    <h3>Skift admin-kode</h3>
    <form onsubmit="skiftAdminKode(event)">
      <div class="form-gruppe"><label>Nuværende kode</label><input type="password" name="gammel" required></div>
      <div class="form-gruppe"><label>Ny kode</label><input type="password" name="ny" required minlength="4"></div>
      <div class="form-gruppe"><label>Bekræft ny kode</label><input type="password" name="bekraft" required></div>
      <button type="submit" class="knap-primaer">Skift kode</button>
    </form>
  </div>`;
}

function gemHero(e) {
  e.preventDefault();
  const f = e.target;
  DB.set('lyg_hero', { tekst: f.tekst.value, under: f.under.value, billede: f.billede.value });
  alert('Hero gemt.');
}

function skiftAdminKode(e) {
  e.preventDefault();
  const f = e.target;
  if (f.gammel.value !== getAdminKode()) { alert('Nuværende kode er forkert.'); return; }
  if (f.ny.value !== f.bekraft.value) { alert('De nye koder matcher ikke.'); return; }
  DB.set('lyg_admin_kode', f.ny.value);
  alert('Kode ændret.');
  f.reset();
}

/* ── Admin: Backup ── */
function renderAdminBackup() {
  return `
  <div class="admin-form-boks">
    <h3>Eksportér backup</h3>
    <p class="muted-txt">Hent al data som JSON-fil.</p>
    <button class="knap-primaer" onclick="eksporterBackup()">📥 Download backup</button>
  </div>
  <div class="admin-form-boks">
    <h3>Importér backup</h3>
    <p class="muted-txt">Indlæs en tidligere backup-fil.</p>
    <input type="file" id="backup-fil" accept=".json" onchange="importerBackup(this)">
  </div>
  <div class="admin-form-boks">
    <h3>Nulstil testdata</h3>
    <p class="muted-txt">Slet al data og genstart med standarddata.</p>
    <button class="knap-rød" onclick="nulstilData()">🗑️ Nulstil alt data</button>
  </div>`;
}

function eksporterBackup() {
  const data = {
    arrangementer: DB.get('lyg_arrangementer'),
    tilmeldinger: DB.get('lyg_tilmeldinger'),
    sponsorer: DB.get('lyg_sponsorer'),
    golfPakker: DB.get('lyg_golf_pakker'),
    hero: DB.get('lyg_hero'),
    kontakt: DB.get('lyg_kontakt'),
    venteliste: DB.get('lyg_venteliste'),
    beskeder: DB.get('lyg_beskeder'),
    golfBookinger: DB.get('lyg_golf_bookinger'),
    eksportDato: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `lyg-erhverv-backup-${Date.now()}.json`;
  a.click(); URL.revokeObjectURL(url);
}

function importerBackup(input) {
  const fil = input.files[0];
  if (!fil) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!confirm('Dette vil overskrive al nuværende data. Fortsæt?')) return;
      if (data.arrangementer) DB.set('lyg_arrangementer', data.arrangementer);
      if (data.tilmeldinger)  DB.set('lyg_tilmeldinger', data.tilmeldinger);
      if (data.sponsorer)     DB.set('lyg_sponsorer', data.sponsorer);
      if (data.golfPakker)    DB.set('lyg_golf_pakker', data.golfPakker);
      if (data.hero)          DB.set('lyg_hero', data.hero);
      alert('Backup importeret!');
      navTil('forside');
    } catch { alert('Ugyldig backup-fil.'); }
  };
  reader.readAsText(fil);
}

function nulstilData() {
  if (!confirm('Er du sikker? Al data slettes og standarddata genindlæses.')) return;
  DB.del('lyg_init');
  ['lyg_arrangementer','lyg_tilmeldinger','lyg_sponsorer','lyg_golf_pakker','lyg_hero','lyg_kontakt','lyg_venteliste','lyg_beskeder','lyg_golf_bookinger','lyg_paamindelser','lyg_paam_vist','lyg_admin_kode'].forEach(k => DB.del(k));
  initData();
  navTil('forside');
  alert('Data nulstillet til standarddata.');
}

/* ============================================================
   KALENDER + PÅMINDELSER
   ============================================================ */
function tilfoejKalender(id) {
  const arr = getArrangementer().find(a => a.id === id);
  if (!arr) return;
  const start = arr.dato.replace(/-/g, '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(arr.titel)}&dates=${start}/${start}&details=${encodeURIComponent(arr.beskrivelse||'')}${arr.sted ? '&location=' + encodeURIComponent(arr.sted) : ''}`;
  window.open(url, '_blank');
}

async function aktiverPaamindelse(id) {
  const arr = getArrangementer().find(a => a.id === id);
  if (!arr) return;
  const tilladelse = await anmodNotifikationer();
  if (tilladelse === 'granted' || tilladelse === 'default') {
    gemPåmindelser(id, arr.dato, arr.titel);
    alert(`Påmindelser aktiveret for "${arr.titel}".\nDu får besked 14, 7 og 3 dage før.`);
  } else if (tilladelse === 'denied') {
    alert('Notifikationer er blokeret. Tillad dem i dine browserindstillinger for at modtage påmindelser.');
  } else {
    alert('Din browser understøtter ikke notifikationer. Brug "Tilføj til kalender" i stedet.');
  }
}

/* ============================================================
   BIND EVENTS (called after each render)
   ============================================================ */
function bindEvents() {
  // Admin kode enter-tast
  const kodeInput = document.getElementById('admin-kode-input');
  if (kodeInput) {
    kodeInput.addEventListener('keydown', e => { if (e.key === 'Enter') tjekAdminKode(); });
    kodeInput.focus();
  }
}

/* ============================================================
   INSTALL PROMPT
   ============================================================ */
let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
});

function installApp() {
  if (!installPrompt) return;
  installPrompt.prompt();
  installPrompt.userChoice.then(() => {
    installPrompt = null;
    const banner = document.getElementById('install-banner');
    if (banner) banner.style.display = 'none';
  });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initData();
  tjekPåmindelser();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }

  renderApp();

  // Nav klik
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn) navTil(btn.dataset.side);
  });
});
