/* ================================================================
   LYNGBYGAARD ERHVERVSKLUB — app.js v4.1
   Al konfiguration samlet øverst. Ret her – ingen andre steder.
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
  heroBillede: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=80',

  adminKode: '1234',

  /* ── Supabase (Web Push) ──────────────────────────────────────
     Udfyld disse efter Supabase-opsætning (se supabase/OPSAETNING.md).
     Behold tomme strenge indtil Supabase er konfigureret.
     App fungerer fuldt uden Supabase — push-fallback bruges.
     ─────────────────────────────────────────────────────────── */
  supabaseUrl:  'INDSÆT_DIN_SUPABASE_URL',   // fx https://abc.supabase.co
  supabaseAnon: 'INDSÆT_DIN_ANON_KEY',
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
    { ikon:'📢', titel:'Synlighed',       tekst:'Logo på bane, hjemmeside, app og ved alle arrangementer.' },
    { ikon:'🤝', titel:'Netværk',         tekst:'Adgang til eksklusive erhvervsarrangementer og sponsor-lounge.' },
    { ikon:'⛳', titel:'Golf & events',   tekst:'Greenfee-invitationer, turneringer og firmaarrangementer.' },
    { ikon:'📣', titel:'PR & omtale',    tekst:'Omtale i nyhedsbrev, sociale medier og lokal presse.' },
    { ikon:'🎯', titel:'Direkte adgang', tekst:'Mød beslutningstagere fra 100+ virksomheder i Aarhus-regionen.' },
    { ikon:'🏆', titel:'Prestige',        tekst:'Stærk associering med Lyngbygaard Golf og lokalt erhvervsliv.' }
  ],

  omEK: {
    tagline: 'Professionelle rammer. Uformelt fællesskab.',
    tekst:   'Erhvervsklubben samler virksomheder og beslutningstagere om relationer, netværk og golf.',
    punkter: [
      { ikon:'🤝', titel:'Netværk',           tekst:'Mød 100+ virksomheder fra Aarhus-regionen.' },
      { ikon:'💼', titel:'Relationer',         tekst:'Byg stærke forretningsrelationer i afslappede rammer.' },
      { ikon:'⛳', titel:'Golf & oplevelser',  tekst:'Turneringer, EK-mesterskaber og udlandsrejser.' },
      { ikon:'📢', titel:'Sponsorværdi',       tekst:'Synlighed og associering med Lyngbygaard Golf.' },
      { ikon:'🏆', titel:'EK-mesterskabet',    tekst:'Årets sportslige højdepunkt for erhvervsmedlemmer.' },
      { ikon:'📅', titel:'10+ events/år',      tekst:'Fra SIM Golf til julefrokost og udlandsrejser.' }
    ]
  },

  billeder: {
    hero:     'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=80',
    golf1:    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=75',
    golf2:    'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=75',
    netvaerk: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=75',
    sponsor:  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=75',
    kontakt:  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75'
  }
};

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
<div class="hero hero-anim hero-kompakt" style="background-image:url('${esc(hero.billede||CONFIG.billeder.hero)}')">
  <div class="hero-lag">
    <div class="hero-logo">⛳ LYG Erhvervsklub</div>
    <h1 class="hero-h1">Golf · Relationer · Forretning</h1>
    <p class="hero-p-kort">Professionelt netværk for virksomhedsejere, direktører og beslutningstagere.</p>
  </div>
  <div class="golfer-scene${animKørt?' anim-done':''}">
    <img class="golfer-frame gf-1" src="./images/golfer-1-address.png"   alt="" aria-hidden="true" loading="eager">
    <img class="golfer-frame gf-2" src="./images/golfer-2-backswing.png" alt="" aria-hidden="true" loading="eager">
    <img class="golfer-frame gf-3" src="./images/golfer-3-impact.png"    alt="" aria-hidden="true" loading="eager">
    <div class="ball-trail"></div>
    <img class="golfer-frame gf-4" src="./images/golfer-4-finish.png"    alt="" aria-hidden="true" loading="eager">
  </div>
</div>

${næsteArr ? `
<section class="cx-sek cx-naeste-sek">
  <button class="cx-naeste-kort" onclick="navTil('tilmelding',{id:'${næsteArr.id}'})">
    <div class="cx-naeste-indhold">
      <span class="cx-naeste-label">Næste arrangement</span>
      <span class="cx-naeste-titel">${esc(næsteArr.titel)}</span>
      <span class="cx-naeste-meta">${fmtDato(næsteArr.dato)}${næsteArr.sted?' · '+esc(næsteArr.sted):''}</span>
      ${næsteArr.maks ? `<span class="cx-naeste-pladser">${ledigePladser(næsteArr)} ledige pladser</span>` : ''}
    </div>
    <span class="cx-naeste-cta">Se og tilmeld →</span>
  </button>
</section>` : ''}

${kommende.length > 1 ? `
<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-titel">Kommende arrangementer</h2>
    <button class="cx-se-alle" onclick="navTil('kalender')">Se alle →</button>
  </div>
  <div class="cx-scroll" id="cx-arr" role="list">
    ${kommende.map((a,i) => `
    <button class="cx-kort cx-arr-kort" role="listitem" onclick="navTil('tilmelding',{id:'${a.id}'})">
      <span class="cx-k-dato">${fmtDato(a.dato)}</span>
      <span class="cx-k-titel">${esc(a.titel)}</span>
      ${a.sted ? `<span class="cx-k-sted">📍 ${esc(a.sted)}</span>` : ''}
      <span class="cx-k-cta">Se arrangement →</span>
    </button>`).join('')}
  </div>
  <div class="cx-prikker" id="cx-arr-prikker">${kommende.map((_,i)=>`<span class="cx-prik${i===0?' aktiv':''}"></span>`).join('')}</div>
</section>` : ''}

<section class="cx-sek">
  <div class="cx-hdr">
    <h2 class="cx-titel">Erhvervsklubben</h2>
    <button class="cx-se-alle" onclick="navTil('om')">Læs mere →</button>
  </div>
  <div class="cx-scroll" id="cx-ek" role="list">
    ${ekKort.map(k => `
    <button class="cx-kort cx-ek-kort" role="listitem" onclick="navTil('${k.side}')">
      <span class="cx-k-titel">${esc(k.titel)}</span>
      <span class="cx-k-tekst">${esc(k.tekst)}</span>
      <span class="cx-k-cta">${esc(k.cta)}</span>
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
  <p>📞 <a href="tel:87441070">87 44 10 70</a></p>
  <p class="foot-credit">Bygget af Nordic Operations · nordicoperations.dk</p>
  <p class="foot-version">LYG Erhvervsklub v4.6</p>
</footer>`;
}

/* Startes fra navTil() — afspiller animation og gemmer session-flag */
function startHeroAnimation() {
  if (side !== 'forside') return;
  if (sessionStorage.getItem('lygHeroAnimationPlayed') === 'true') return;
  const scene = document.querySelector('.golfer-scene');
  if (!scene) return;
  // Sæt flag med det samme så gennavigation ikke spiller igen
  sessionStorage.setItem('lygHeroAnimationPlayed', 'true');
  scene.classList.add('anim-running');
  // Ryd anim-klasse efter 4s og lad slutframe stå
  setTimeout(() => {
    scene.classList.remove('anim-running');
    scene.classList.add('anim-done');
  }, 4200);
}

/* ================================================================
   ARRANGEMENT KORT
   Timezone-safe: sammenligner ISO-datostrenge direkte.
   Tidligere arrangementer: ingen aktive funktioner.
   ================================================================ */
function arrKort(a, kompakt=false) {
  const frem  = erFremtidig(a.dato);
  const ledig = ledigePladser(a);
  const pct   = Math.min(100, Math.round((a.tlm/a.maks)*100));

  let sbKls, sbTxt;
  if (!frem) {
    sbKls='sb-afholdt'; sbTxt='Afholdt';
  } else if (!a.aaben||a.status==='lukket') {
    sbKls='sb-lukket';  sbTxt='Lukket';
  } else if (ledig<=0) {
    sbKls='sb-lukket';  sbTxt='Fuldt';
  } else if (ledig<=3) {
    sbKls='sb-faa';     sbTxt='Få pladser';
  } else {
    sbKls='sb-aaben';   sbTxt='Åben';
  }

  return `
<div class="akort${kompakt?' akort-k':''}${!frem?' akort-past':''}">
  <div class="ak-top">
    <div>
      <div class="ak-dato">${fmtDato(a.dato)}${a.tid?' · '+esc(a.tid):''}</div>
      <h3 class="ak-titel">${esc(a.titel)}</h3>
      ${a.sted?`<div class="ak-sted">📍 ${esc(a.sted)}</div>`:''}
      ${a.type&&!kompakt?`<div class="ak-type">${esc(a.type)}</div>`:''}
    </div>
    <span class="sb ${sbKls}">${sbTxt}</span>
  </div>
  ${!kompakt&&a.besk?`<p class="ak-besk">${esc(a.besk)}</p>`:''}
  ${!kompakt&&frem?`
  <div class="ak-tal">
    <div class="ak-tf"><span>Maks</span><strong>${a.maks}</strong></div>
    <div class="ak-tf"><span>Tilmeldte</span><strong>${a.tlm}</strong></div>
    <div class="ak-tf"><span>Ledige</span><strong>${ledig}</strong></div>
  </div>
  <div class="pbw"><div class="pbf" style="width:${pct}%"></div></div>`:''}
  ${frem?`
  <div class="ak-kn">
    ${a.aaben&&ledig>0?`<button class="knap-p" onclick="navTil('tilmelding',{id:'${a.id}'})">Tilmeld</button>`:''}
    ${a.aaben&&ledig<=0&&a.status!=='lukket'?`<button class="knap-sek" onclick="venteListe('${a.id}')">Venteliste</button>`:''}
    <button class="knap-i" onclick="tilfoejKal('${a.id}')" title="Tilføj til kalender">📆</button>
    <button class="knap-i" onclick="aktPaam('${a.id}')" title="Påmindelser">🔔</button>
  </div>`:''}
</div>`;
}

/* ================================================================
   KALENDER
   ================================================================ */
function pgKalender() {
  const alle  = getArr();
  const frem  = alle.filter(a=> erFremtidig(a.dato));
  const tidl  = alle.filter(a=>!erFremtidig(a.dato)).reverse();
  return `
<div class="ph bg-mork">
  <h1>Kalender 📅</h1>
  <p>Alle arrangementer i Erhvervsklubben</p>
</div>
<section class="sek">
  ${frem.length
    ?`<div class="arr-l">${frem.map(a=>arrKort(a)).join('')}</div>`
    :`<div class="tom-kal"><p>Ingen kommende arrangementer.</p><button class="knap-sek" onclick="navTil('kontakt')">Kontakt os →</button></div>`}
</section>
${tidl.length?`
<section class="sek pt0">
  <details class="tidl-details">
    <summary>Tidligere arrangementer (${tidl.length})</summary>
    <div class="arr-l mt1">${tidl.map(a=>arrKort(a)).join('')}</div>
  </details>
</section>`:'' }`;
}

/* ================================================================
   TILMELDING
   ================================================================ */
function pgTilm(data) {
  const valgtId = data?.id||'';
  const åbne = getArr().filter(a=>erFremtidig(a.dato)&&a.aaben);
  return `
<div class="ph bg-mork">
  <h1>Tilmeld dig ✅</h1>
  <p>Udfyld formularen — vi bekræfter via email</p>
</div>
<section class="sek">
  ${!åbne.length?`<div class="tom-kal"><p>Ingen åbne arrangementer i øjeblikket.</p><button class="knap-sek" onclick="navTil('kalender')">Se kalender →</button></div>`:`
  <form id="tf" onsubmit="submitTilm(event)">
    <div class="fg">
      <label>Arrangement *</label>
      <select name="arrId" required>
        <option value="">Vælg arrangement…</option>
        ${åbne.map(a=>`<option value="${a.id}" ${valgtId===a.id?'selected':''}>${fmtDato(a.dato)} — ${esc(a.titel)}</option>`).join('')}
      </select>
    </div>
    <div class="fg"><label>Navn *</label><input name="navn" required placeholder="Dit fulde navn"></div>
    <div class="fg"><label>Virksomhed *</label><input name="virk" required placeholder="Virksomhedens navn"></div>
    <div class="g2f">
      <div class="fg"><label>Email *</label><input type="email" name="email" required placeholder="din@email.dk"></div>
      <div class="fg"><label>Telefon</label><input type="tel" name="tlf" placeholder="12 34 56 78"></div>
    </div>
    <div class="fg"><label>Antal deltagere *</label><input type="number" name="antal" min="1" max="10" value="1" required></div>
    <div class="fg"><label>Kommentar</label><textarea name="kom" rows="3" placeholder="Særlige ønsker, allergier…"></textarea></div>
    <button type="submit" class="knap-p fb">Send tilmelding</button>
  </form>`}
  <div id="tilm-kv" style="display:none"></div>
</section>`;
}

function submitTilm(e) {
  e.preventDefault();
  const f = e.target;
  const arr = getArr().find(a=>a.id===f.arrId.value);
  if (!arr) { alert('Vælg et arrangement.'); return; }
  const antal = parseInt(f.antal.value)||1;
  const ledig = ledigePladser(arr);
  if (antal>ledig) { alert(`Kun ${ledig} ledig${ledig===1?'':'e'} plads${ledig===1?'':'er'}.`); return; }

  const t={id:'t'+Date.now(),arrId:arr.id,arrTitel:arr.titel,navn:f.navn.value,virk:f.virk.value,email:f.email.value,tlf:f.tlf.value,antal,kom:f.kom.value,dato:idag(),mødt:false};
  const alle=DB.get('ek_tilm')||[]; alle.push(t); DB.set('ek_tilm',alle);

  const arrs=DB.get('ek_arr')||[];
  const idx=arrs.findIndex(a=>a.id===arr.id);
  if(idx>-1){arrs[idx].tlm+=antal; if(arrs[idx].tlm>=arrs[idx].maks)arrs[idx].status='fuldt'; DB.set('ek_arr',arrs);}

  f.style.display='none';
  const kv=document.getElementById('tilm-kv'); kv.style.display='block';
  kv.innerHTML=`
<div class="kv">
  <div class="kv-i">✅</div>
  <h2>Tilmelding modtaget!</h2>
  <p><strong>${esc(t.navn)}</strong> er tilmeldt <strong>${esc(arr.titel)}</strong><br>${fmtDato(arr.dato)}.</p>
  <p class="muted">Vi bekræfter din plads hurtigst muligt.</p>
  <button class="knap-p" onclick="navTil('kalender')">Se kalender</button>
  <button class="knap-sek" onclick="navTil('tilmelding')">Tilmeld endnu en</button>
</div>`;
}

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
function pgGolf() {
  const pakker = DB.get('ek_pakker')||CONFIG.golfPakker;
  return `
<div class="ph bg-mork">
  <h1>Book firmaarrangement 💼</h1>
  <p>Skræddersyede oplevelser til kunder, medarbejdere og netværk</p>
</div>

<section class="sek">
  <div class="bi-kort" style="background-image:url('${CONFIG.billeder.golf1}')">
    <div class="bi-lag"><p>Golf er det perfekte scenarie for stærke relationer, kundepleje og teambuilding.</p></div>
  </div>
</section>

<section class="sek pb0">
  <button class="gb-banner-knap" onclick="åbnGolfBox()">
    <span class="gb-ikon">🏌️</span>
    <div><strong>GolfBox login</strong><small>Book tid eller log ind direkte i GolfBox</small></div>
    <span class="gb-pil">→</span>
  </button>
</section>

<section class="sek">
  <h2 class="stitl">Vælg arrangement</h2>
  <div class="pk-g">
    ${pakker.map(p=>`
    <div class="pk">
      <h3>${esc(p.titel)}</h3>
      <div class="pk-pris">${esc(p.pris)}</div>
      <p>${esc(p.beskrivelse)}</p>
      <ul class="pk-ul">${(p.inkl||[]).map(i=>`<li>✓ ${esc(i)}</li>`).join('')}</ul>
      <button class="knap-sek sm-knap" onclick="document.getElementById('golf-form').scrollIntoView({behavior:'smooth'})">Vælg →</button>
    </div>`).join('')}
  </div>
</section>

<section class="sek" id="golf-form">
  <h2 class="stitl">Send forespørgsel</h2>
  <form id="gf" onsubmit="submitGolf(event)">
    <div class="fg"><label>Virksomhed *</label><input name="virk" required placeholder="Virksomhedens navn"></div>
    <div class="g2f">
      <div class="fg"><label>Kontaktperson *</label><input name="kp" required></div>
      <div class="fg"><label>Email *</label><input type="email" name="email" required></div>
    </div>
    <div class="g2f">
      <div class="fg"><label>Telefon</label><input type="tel" name="tlf"></div>
      <div class="fg"><label>Ønsket dato</label><input type="date" name="dato"></div>
    </div>
    <div class="g2f">
      <div class="fg"><label>Antal personer</label><input type="number" name="antal" min="1" value="4"></div>
      <div class="fg"><label>Arrangement</label>
        <select name="pakke">
          <option value="">Vælg type…</option>
          ${pakker.map(p=>`<option value="${esc(p.titel)}">${esc(p.titel)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="fg"><label>Besked / ønsker</label><textarea name="besk" rows="3" placeholder="Beskriv jeres ønsker og forventninger…"></textarea></div>
    <button type="submit" class="knap-p fb">Send forespørgsel</button>
  </form>
  <div id="golf-kv" style="display:none" class="kv">
    <div class="kv-i">✅</div>
    <h2>Forespørgsel sendt!</h2>
    <p>Vi kontakter dig hurtigst muligt for at lægge programmet.</p>
    <button class="knap-sek" onclick="navTil('forside')">Tilbage til forsiden</button>
  </div>
</section>`;
}

function submitGolf(e) {
  e.preventDefault();
  const f=e.target;
  const bg=DB.get('ek_golf_booking')||[];
  bg.push({id:'g'+Date.now(),virk:f.virk.value,kp:f.kp.value,email:f.email.value,tlf:f.tlf.value,dato:f.dato.value,antal:f.antal.value,pakke:f.pakke.value,besk:f.besk.value,oprettet:new Date().toISOString()});
  DB.set('ek_golf_booking',bg);
  f.style.display='none'; document.getElementById('golf-kv').style.display='block';
}

/* ================================================================
   SPONSOR
   ================================================================ */
function pgSponsor() {
  const sponsorer = DB.get('ek_sponsorer')||[];
  const rigtige   = sponsorer.filter(s=>s.navn&&!s.navn.includes('ledigt'));
  return `
<div class="ph bg-mork">
  <h1>Bliv sponsor 🌟</h1>
  <p>Synlighed, netværk og relationer i Aarhus-regionens erhvervsliv</p>
</div>

<section class="sek">
  <div class="bi-kort" style="background-image:url('${CONFIG.billeder.sponsor}')">
    <div class="bi-lag bi-lag-citat"><p>"Som sponsor bliver din virksomhed en del af et stærkt fællesskab med golf som rammen og netværk som resultatet."</p></div>
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
    <div class="sp-n guld-n"><div class="sp-n-titel">🥇 Guld</div><p>Primær placering på bane, hjemmeside og alle arrangementer. VIP-invitationer, greenfee og eksklusive events.</p></div>
    <div class="sp-n"><div class="sp-n-titel">🥈 Sølv</div><p>Logo ved bane og digitalt. Adgang til erhvervsarrangementer og invitationer til udvalgte events.</p></div>
    <div class="sp-n"><div class="sp-n-titel">🥉 Bronze</div><p>Digital synlighed, omtale i nyhedsbrev og invitationer til åbne arrangementer.</p></div>
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
    <div class="kv-i">✅</div><h2>Tak for din interesse!</h2>
    <p>Vi vender tilbage hurtigst muligt.</p>
    <button class="knap-sek" onclick="navTil('forside')">Tilbage</button>
  </div>
  <div class="tc mt1 kontakt-dir">
    <a class="knap-dir" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 ${CONFIG.telefon}</a>
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
  return `
<div class="ph bg-mork">
  <h1>Erhvervsklubben 🤝</h1>
  <p>${esc(CONFIG.omEK.tagline)}</p>
</div>

<section class="sek">
  <div class="bi-kort" style="background-image:url('${CONFIG.billeder.netvaerk}')">
    <div class="bi-lag"><p>${esc(CONFIG.omEK.tekst)}</p></div>
  </div>
</section>

<section class="sek">
  <div class="ikg">
    ${CONFIG.omEK.punkter.map(p=>`
    <div class="ikb static"><span class="iks">${p.ikon}</span><strong>${esc(p.titel)}</strong><p>${esc(p.tekst)}</p></div>`).join('')}
  </div>
</section>

<section class="sek">
  <div class="om-cta">
    <h3>Interesseret i erhvervsmedlemskab?</h3>
    <p>Kontakt os og hør om mulighederne.</p>
    <div class="btn-row jc">
      <a class="knap-p" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 Ring til os</a>
      <button class="knap-sek" onclick="navTil('kontakt')">✉️ Send besked</button>
    </div>
  </div>
</section>`;
}

/* ================================================================
   KONTAKT
   Ingen mailto-knapper — kun formularer og telefon.
   Admin kan se alle henvendelser under Tilmeldinger → Kontakt.
   ================================================================ */
function pgKontakt() {
  return `
<div class="ph bg-mork">
  <h1>Kontakt ✉️</h1>
  <p>Vi er klar til at hjælpe dig</p>
</div>

<section class="sek">
  <div class="kontakt-boks">
    <a class="kl" href="tel:${CONFIG.telefon.replace(/\s/g,'')}"><span>📞</span><span>${CONFIG.telefon}</span><span class="kl-hint">Ring til os</span></a>
    <div class="kl"><span>📍</span><span>${esc(CONFIG.adresse)}</span></div>
    <a class="kl" href="${CONFIG.website}" target="_blank" rel="noopener"><span>🌐</span><span>${CONFIG.website}</span></a>
  </div>
  <div class="tc mt1">
    <a class="knap-p" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 Ring til os</a>
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
    <div class="kv-i">✅</div>
    <h2>Besked modtaget!</h2>
    <p>Vi vender tilbage hurtigst muligt.</p>
    <button class="knap-sek" onclick="navTil('forside')">Tilbage til forsiden</button>
  </div>
</section>`;
}

function submitKontakt(e) {
  e.preventDefault();
  const f=e.target;
  const alle=DB.get('ek_beskeder')||[];
  alle.push({id:'k'+Date.now(),virk:f.virk.value,kp:f.kp.value,tlf:f.tlf.value,email:f.email.value,besk:f.besk.value,dato:new Date().toISOString(),læst:false});
  DB.set('ek_beskeder',alle);
  f.style.display='none'; document.getElementById('kont-kv').style.display='block';
}

/* ================================================================
   ADMIN
   ================================================================ */
let adminIN = false;
let _adFane = 'arr';

function pgAdmin() {
  if (!adminIN) return `
<div class="ph bg-mork"><h1>Admin ⚙️</h1></div>
<section class="sek">
  <div class="admin-login">
    <p class="muted tc mb1">Indtast admin-koden for at fortsætte</p>
    <div class="fg"><label>Kode</label><input type="password" id="ak-inp" maxlength="30" placeholder="••••" autocomplete="current-password"></div>
    <button class="knap-p fb" onclick="tjekKode()">Log ind</button>
    <div id="ak-fejl" class="fejl-b" style="display:none">Forkert kode — prøv igen.</div>
  </div>
</section>`;

  const faner=[['arr','Arrangementer'],['tilm','Tilmeldinger'],['kont','Kontakthenvendelser'],['sp','Sponsorer'],['golf','Firmapakker'],['indh','Indhold'],['inst','Indstillinger'],['bk','Backup']];
  return `
<div class="ph bg-mork" style="display:flex;justify-content:space-between;align-items:center">
  <div><h1>Admin ⚙️</h1></div>
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

function tjekKode() {
  const v=document.getElementById('ak-inp').value;
  if(v===getKode()){adminIN=true;navTil('admin');}
  else{document.getElementById('ak-fejl').style.display='block';}
}
function adminLogUd() { adminIN=false; navTil('forside'); }
function skiftFane(f) { _adFane=f; navTil('admin'); }

/* ── Admin: Arrangementer ── */
function adArr() {
  const arrs=getArr();
  return `
<div class="ad-hd">
  <button class="knap-p" onclick="visArrForm(null)">+ Nyt arrangement</button>
  <button class="knap-sek" onclick="kopierNytAar()">📋 Kopier til nyt år</button>
</div>
<div class="ad-l">
  ${arrs.map(a=>`
  <div class="ad-rad${!erFremtidig(a.dato)?' ad-past':''}">
    <div class="ad-ri">
      <strong>${esc(a.titel)}</strong>
      <span>${fmtDato(a.dato)}${a.tid?' · '+esc(a.tid):''}</span>
      <span class="ad-st">${erFremtidig(a.dato)?(a.aaben?'✓ Åben':'✗ Lukket'):'• Afholdt'}</span>
    </div>
    <div class="ad-rk">
      <button class="knap-i" onclick="visArrForm('${a.id}')">✏️</button>
      <button class="knap-i" onclick="kopierArr('${a.id}')">📋</button>
      <button class="knap-i red" onclick="sletArr('${a.id}')">🗑️</button>
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
  <button class="knap-sek" onclick="exportCSV()">📥 CSV</button>
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
    <td><button class="knap-i red" onclick="sletTilm('${t.id}')">🗑️</button></td>
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
      <button class="knap-i red" onclick="sletBesked('${b.id}')">🗑️</button>
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
      <button class="knap-i" onclick="visSponsorForm('${s.id}')">✏️</button>
      <button class="knap-i red" onclick="sletSponsor('${s.id}')">🗑️</button>
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
    <button type="submit" class="knap-i">💾 Gem</button>
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
  <div class="ad-rk"><button class="knap-i red" onclick="sletNyhed(${i})">🗑️</button></div>
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
  <div class="ad-rk"><button class="knap-i red" onclick="sletPartner(${i})">🗑️</button></div>
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
  <div class="ad-rk"><button class="knap-i red" onclick="sletMVirk(${i})">🗑️</button></div>
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
  <button class="knap-p" onclick="eksporter()">📥 Download backup</button>
</div>
<div class="ad-form mb1">
  <h3>Importér backup</h3>
  <p class="muted mb1">Genindlæs fra en tidligere backup-fil.</p>
  <input type="file" id="bk-fil" accept=".json" onchange="importer(this)">
</div>
<div class="ad-form">
  <h3>Nulstil til standarddata</h3>
  <p class="muted mb1">Sletter alt og genindlæser standard-arrangementer og -data.</p>
  <button class="knap-rød" onclick="nulstil()">🗑️ Nulstil alt</button>
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
  /* Carousel prik-indikatorer */
  bindCarouselPrikker('cx-arr', 'cx-arr-prikker');
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

  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (btn && btn.dataset.side) navTil(btn.dataset.side);
  });

  /* Splash */
  const sp = document.getElementById('splash');
  if (sp) { setTimeout(() => { sp.style.opacity = '0'; setTimeout(() => sp.remove(), 400); }, 600); }

  /* iOS installér-guide */
  visIosInstallGuide();

  /* Push-notifikation dialog */
  visPushDialog();
});
