/* ================================================================
   LYNGBYGAARD ERHVERVSKLUB — app.js v4
   Al konfiguration samlet øverst. Ret her – ingen andre steder.
   ================================================================ */

const CONFIG = {
  /* Klub */
  klubNavn:  'Lyngbygaard Erhvervsklub',
  tagline:   'Erhverv, netværk og golfoplevelser i Lyngbygaard Golf',
  adresse:   'Lyngbygårdsvej 29, 8220 Brabrand',
  telefon:   '87 44 10 70',
  email:     'info@lyg.dk',
  website:   'https://lyg.dk',

  /* GolfBox — direkte login-link */
  golfboxUrl: 'https://www.golfbox.dk/site/login/loginform.asp',

  /* Hero */
  heroTekst:   'Erhverv, netværk og golfoplevelser',
  heroUnder:   'Lyngbygaard Erhvervsklub samler virksomheder i Aarhus-regionen om golf, relationer og fællesskab.',
  heroBillede: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=80',

  /* Admin */
  adminKode: '1234',

  /* Firmaarrangement-pakker */
  golfPakker: [
    { id:'gp1', titel:'Kundearrangement',     pris:'Fra 2.800 kr./hold',     beskrivelse:'Eksklusiv oplevelse til jeres vigtigste kunder. Golf, VIP-service og middag i professionelle rammer.',   inkl:['9 eller 18 huller golf','VIP-velkomst','Middag på klubhuset','Fotoservice'] },
    { id:'gp2', titel:'Medarbejderdag',        pris:'Fra 1.900 kr./person',   beskrivelse:'Giv dine medarbejdere en dag de husker — med golf, samvær og god stemning.',                             inkl:['9 huller golf','Forfriskninger undervejs','Afslutningsfest','Overraskelser'] },
    { id:'gp3', titel:'Netværksdag',           pris:'Fra 1.500 kr./person',   beskrivelse:'Bring dine samarbejdspartnere sammen i uformelle, professionelle rammer.',                                inkl:['Golf eller aktivitet','Frokost/middag','Netværksøvelser','Opfølgningsmuligheder'] },
    { id:'gp4', titel:'Møde + Golf',           pris:'Fra 2.200 kr./hold',     beskrivelse:'Kombinér et kort strategimøde med en runde golf. Ideelt til bestyrelsesdage og ledergrupper.',            inkl:['Mødelokale 2 timer','9 huller golf','Forplejning','Fleksibel dagorden'] },
    { id:'gp5', titel:'Company Day',           pris:'Fra 4.500 kr./hold',     beskrivelse:'En hel dag på banen med morgenmad, frokost og 18 huller. Perfekt til teambuilding og kundepleje.',       inkl:['18 huller golf','Morgenmad & frokost','Golfvogn inkl.','Priser & diplomer'] },
    { id:'gp6', titel:'VIP-arrangement',       pris:'Tilbud på forespørgsel', beskrivelse:'Skræddersyet VIP-oplevelse til særlige gæster, jubilæer eller eksklusive anledninger.',                 inkl:['Fuld personlig service','Gourmetmiddag','Eksklusivt program','Caddie inkl.'] }
  ],

  /* Sponsor */
  sponsorFordele: [
    { ikon:'📢', titel:'Synlighed',       tekst:'Logo på bane, hjemmeside, app og ved alle arrangementer.' },
    { ikon:'🤝', titel:'Netværk',         tekst:'Adgang til eksklusive erhvervsarrangementer og sponsor-lounge.' },
    { ikon:'⛳', titel:'Golf & events',   tekst:'Greenfee-invitationer, turneringer og firmaarrangementer.' },
    { ikon:'📣', titel:'PR & omtale',    tekst:'Omtale i nyhedsbrev, sociale medier og lokal presse.' },
    { ikon:'🎯', titel:'Direkte adgang', tekst:'Mød beslutningstagere fra 100+ virksomheder i Aarhus-regionen.' },
    { ikon:'🏆', titel:'Prestige',        tekst:'Stærk associering med Lyngbygaard Golf og lokalt erhvervsliv.' }
  ],

  /* Om EK */
  omEK: {
    tagline: 'Professionelle rammer. Uformelt fællesskab.',
    tekst: 'Erhvervsklubben samler virksomheder og beslutningstagere om relationer, netværk og golf.',
    punkter: [
      { ikon:'🤝', titel:'Netværk',           tekst:'Mød 100+ virksomheder fra Aarhus-regionen.' },
      { ikon:'💼', titel:'Relationer',         tekst:'Byg stærke forretningsrelationer i afslappede rammer.' },
      { ikon:'⛳', titel:'Golf & oplevelser',  tekst:'Turneringer, EK-mesterskaber og udlandsrejser.' },
      { ikon:'📢', titel:'Sponsorværdi',       tekst:'Synlighed og associering med Lyngbygaard Golf.' },
      { ikon:'🏆', titel:'EK-mesterskabet',    tekst:'Årets sportslige højdepunkt for erhvervsmedlemmer.' },
      { ikon:'📅', titel:'10+ events/år',      tekst:'Fra SIM Golf til julefrokost og udlandsrejser.' }
    ]
  },

  /* Billeder — skift URL her for at opdatere billeder på tværs af appen */
  billeder: {
    hero:     'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&q=80',
    golf1:    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=75',
    golf2:    'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=75',
    netvaerk: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=75',
    sponsor:  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=75',
    kontakt:  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=75'
  }
};

/* ── Standard arrangementer ── */
const STD_ARR = [
  { id:'a1',  dato:'2026-02-04', tid:'',           titel:'Høj Sol over Aarhus',         sted:'Hermans, Tivoli Friheden',          type:'Koncert / netværk',   besk:'Årets første erhvervsarrangement med musik og netværk.', maks:80,  tlm:0, status:'aaben', aaben:true },
  { id:'a2',  dato:'2026-03-04', tid:'16.00-21.00', titel:'SIM Golf',                   sted:'Golfarena Aarhus',                   type:'Golf / netværk',      besk:'Netværk og konkurrence på indoor simulator-bane.',       maks:24,  tlm:0, status:'aaben', aaben:true },
  { id:'a3',  dato:'2026-03-18', tid:'16.00-21.00', titel:'SIM Golf',                   sted:'Golfarena Aarhus',                   type:'Golf / netværk',      besk:'Netværk og konkurrence på indoor simulator-bane.',       maks:24,  tlm:0, status:'aaben', aaben:true },
  { id:'a4',  dato:'2026-03-24', tid:'',           titel:'Byudvikling & Bajere',         sted:'Aarhus',                             type:'Netværksarrangement', besk:'Uformel debat og netværk om byudvikling i Aarhus.',      maks:50,  tlm:0, status:'aaben', aaben:true },
  { id:'a5',  dato:'2026-04-22', tid:'',           titel:'Hjemmekamp mod Himmerland BC', sted:'Lyngbygaard Golf',                   type:'Golf / netværk',      besk:'Venlighedskamp og netværk med Himmerland Business Club.', maks:40,  tlm:0, status:'aaben', aaben:true },
  { id:'a6',  dato:'2026-05-01', tid:'',           titel:'Udlandsrejse — Skotland',      sted:'Skotland',                           type:'Golfrejse',           besk:'Golfrejse til Skotland 1.–4. maj 2026.',                 maks:20,  tlm:0, status:'aaben', aaben:true },
  { id:'a7',  dato:'2026-06-02', tid:'',           titel:'Tysklandstur',                 sted:'Timmendorfer Strand',                type:'Golfrejse',           besk:'Golfrejse til Timmendorfer Strand 2.–3. juni 2026.',     maks:20,  tlm:0, status:'aaben', aaben:true },
  { id:'a8',  dato:'2026-08-14', tid:'',           titel:'Danish Golf Championship',     sted:'Great Northern',                     type:'Golfoplevelse',       besk:'Se årets store golfchampionship med erhvervsklubben.',   maks:30,  tlm:0, status:'aaben', aaben:true },
  { id:'a9',  dato:'2026-09-01', tid:'',           titel:'Jyllandstur',                  sted:'Nordvestjysk & Holstebro Golfklub',  type:'Golfrejse',           besk:'Jyllandstur 1.–2. september med golf på to baner.',      maks:24,  tlm:0, status:'aaben', aaben:true },
  { id:'a10', dato:'2026-10-09', tid:'',           titel:'EK-Mesterskaberne',             sted:'Silkeborg Ry Golfklub',              type:'Mesterskab',          besk:'Erhvervsklubbens eget mesterskab — hvem vinder?',        maks:48,  tlm:0, status:'aaben', aaben:true },
  { id:'a11', dato:'2026-11-20', tid:'',           titel:'Julefrokost & Gokart',          sted:'Racehall Aarhus',                    type:'Socialt arrangement', besk:'Julefrokost med gokart — årets hyggeligste event.',       maks:60,  tlm:0, status:'aaben', aaben:true }
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
  set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.warn('localStorage fejl', e); } },
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
function getArr()  { return (DB.get('ek_arr')||[]).sort((a,b)=>a.dato.localeCompare(b.dato)); }
function getKode() { return DB.get('ek_kode')||CONFIG.adminKode; }
function getGolfboxUrl() { return DB.get('ek_golfbox')||CONFIG.golfboxUrl; }

function fmtDato(iso) {
  if (!iso) return '';
  return new Date(iso+'T12:00:00').toLocaleDateString('da-DK',{day:'numeric',month:'long',year:'numeric'});
}

/* Et arrangement er fremtidigt hvis slutdatoen er i fremtiden */
function erFremtidig(iso) { return new Date(iso+'T23:59:59') >= new Date(); }
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
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.side === s));
  const main = document.getElementById('main-content');
  switch(s) {
    case 'forside':   main.innerHTML = pgForside();  break;
    case 'kalender':  main.innerHTML = pgKalender(); break;
    case 'tilmelding':main.innerHTML = pgTilm(data); break;
    case 'golfarr':   main.innerHTML = pgGolf();     break;
    case 'sponsor':   main.innerHTML = pgSponsor();  break;
    case 'om':        main.innerHTML = pgOm();       break;
    case 'kontakt':   main.innerHTML = pgKontakt();  break;
    case 'admin':     main.innerHTML = pgAdmin();    break;
  }
  bindAll();
  window.scrollTo(0,0);
}

/* ================================================================
   FORSIDE
   ================================================================ */
function pgForside() {
  const hero = DB.get('ek_hero') || {};
  const næste = getArr().filter(a => erFremtidig(a.dato)).slice(0,3);
  const bil = CONFIG.billeder;

  return `
<div class="hero" style="background-image:url('${esc(hero.billede||bil.hero)}')">
  <div class="hero-lag">
    <div class="hero-logo">⛳ LYG Erhvervsklub</div>
    <h1 class="hero-h1">${esc(hero.tekst||CONFIG.heroTekst)}</h1>
    <p class="hero-p">${esc(hero.under||CONFIG.heroUnder)}</p>
  </div>
</div>

<section class="sek">
  <div class="g2">
    <button class="sknap" onclick="navTil('kalender')">📅<span>Se kalender</span></button>
    <button class="sknap" onclick="navTil('tilmelding')">✅<span>Tilmeld dig</span></button>
    <button class="sknap gold" onclick="navTil('golfarr')">💼<span>Book firmaarrangement</span></button>
    <button class="sknap gold" onclick="åbnGolfBox()">🔗<span>GolfBox login</span></button>
  </div>
</section>

<section class="sek">
  <div class="ikg">
    <button class="ikb" onclick="navTil('om')"><span class="iks">🤝</span><strong>Netværk</strong><p>Relationer & fællesskab</p></button>
    <button class="ikb" onclick="navTil('golfarr')"><span class="iks">⛳</span><strong>Firmaevent</strong><p>Golf & oplevelser</p></button>
    <button class="ikb" onclick="navTil('sponsor')"><span class="iks">📢</span><strong>Sponsor</strong><p>Synlighed & brand</p></button>
    <button class="ikb" onclick="navTil('kalender')"><span class="iks">📅</span><strong>Kalender</strong><p>10+ events/år</p></button>
  </div>
</section>

${næste.length ? `
<section class="sek">
  <h2 class="stitl">Kommende arrangementer</h2>
  <div class="arr-l">${næste.map(a => arrKort(a, true)).join('')}</div>
  <div class="tc mt1"><button class="knap-sek" onclick="navTil('kalender')">Se alle arrangementer →</button></div>
</section>` : ''}

<section class="sek bi-sek" onclick="åbnGolfBox()">
  <div class="gb-banner">
    <span class="gb-ikon">🏌️</span>
    <div><strong>GolfBox login</strong><small>Book tid eller log ind i GolfBox</small></div>
    <span class="gb-pil">→</span>
  </div>
</section>

<footer class="app-footer">
  <p>Lyngbygaard Golf · Lyngbygårdsvej 29, 8220 Brabrand</p>
  <p><a href="tel:87441070">📞 87 44 10 70</a> · <a href="mailto:info@lyg.dk">✉️ info@lyg.dk</a></p>
  <p class="foot-credit">Bygget af Nordic Operations · nordicoperations.dk</p>
</footer>`;
}

function åbnGolfBox() {
  window.open(getGolfboxUrl(), '_blank', 'noopener');
}

/* ================================================================
   ARRANGEMENT KORT
   - Tidligere arrangementer: status altid "Afholdt", ingen handlingsknapper
   ================================================================ */
function arrKort(a, kompakt=false) {
  const frem   = erFremtidig(a.dato);
  const ledig  = ledigePladser(a);
  const pct    = Math.min(100, Math.round((a.tlm / a.maks) * 100));

  /* Badge: tidligere arrangementer vises altid som "Afholdt" */
  let sbKls, sbTxt;
  if (!frem) {
    sbKls = 'sb-afholdt'; sbTxt = 'Afholdt';
  } else if (!a.aaben || a.status === 'lukket') {
    sbKls = 'sb-lukket'; sbTxt = 'Lukket';
  } else if (ledig <= 0) {
    sbKls = 'sb-lukket'; sbTxt = 'Fuldt';
  } else if (ledig <= 3) {
    sbKls = 'sb-faa'; sbTxt = 'Få pladser';
  } else {
    sbKls = 'sb-aaben'; sbTxt = 'Åben';
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
  <div class="pbw"><div class="pbf" style="width:${pct}%"></div></div>`:'' }
  ${frem?`
  <div class="ak-kn">
    ${a.aaben&&ledig>0?`<button class="knap-p" onclick="navTil('tilmelding',{id:'${a.id}'})">Tilmeld</button>`:''}
    ${a.aaben&&ledig<=0&&a.status!=='lukket'?`<button class="knap-sek" onclick="venteListe('${a.id}')">Venteliste</button>`:''}
    <button class="knap-i" onclick="tilfoejKal('${a.id}')" title="Tilføj til kalender">📆</button>
    <button class="knap-i" onclick="aktPaam('${a.id}')" title="Aktivér påmindelser">🔔</button>
  </div>`:'' }
</div>`;
}

/* ================================================================
   KALENDER
   ================================================================ */
function pgKalender() {
  const alle = getArr();
  const frem = alle.filter(a =>  erFremtidig(a.dato));
  const tidl = alle.filter(a => !erFremtidig(a.dato)).reverse();
  return `
<div class="ph bg-mork">
  <h1>Kalender 📅</h1>
  <p>Alle arrangementer i Erhvervsklubben</p>
</div>
<section class="sek">
  ${frem.length
    ? `<div class="arr-l">${frem.map(a=>arrKort(a)).join('')}</div>`
    : `<div class="tom-kal"><p>Ingen kommende arrangementer.</p><button class="knap-sek" onclick="navTil('kontakt')">Kontakt os →</button></div>`}
</section>
${tidl.length?`
<section class="sek">
  <details class="tidl-details">
    <summary>Tidligere arrangementer (${tidl.length})</summary>
    <div class="arr-l mt1">${tidl.map(a=>arrKort(a)).join('')}</div>
  </details>
</section>`:''}`;
}

/* ================================================================
   TILMELDING
   ================================================================ */
function pgTilm(data) {
  const valgtId = data?.id||'';
  const åbne = getArr().filter(a => erFremtidig(a.dato) && a.aaben);
  return `
<div class="ph bg-mork">
  <h1>Tilmeld dig ✅</h1>
  <p>Udfyld formularen — vi bekræfter via email</p>
</div>
<section class="sek">
  ${åbne.length===0?`<div class="tom-kal"><p>Ingen åbne arrangementer i øjeblikket.</p><button class="knap-sek" onclick="navTil('kalender')">Se kalender →</button></div>`:`
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
  const arr = getArr().find(a => a.id === f.arrId.value);
  if (!arr) { alert('Vælg et arrangement.'); return; }
  const antal = parseInt(f.antal.value)||1;
  const ledig = ledigePladser(arr);
  if (antal > ledig) { alert(`Kun ${ledig} ledig${ledig===1?'':'e'} plads${ledig===1?'':'er'}.`); return; }

  const t = { id:'t'+Date.now(), arrId:arr.id, arrTitel:arr.titel,
    navn:f.navn.value, virk:f.virk.value, email:f.email.value,
    tlf:f.tlf.value, antal, kom:f.kom.value,
    dato:new Date().toISOString().split('T')[0], mødt:false };

  const alle = DB.get('ek_tilm')||[]; alle.push(t); DB.set('ek_tilm', alle);

  const arrs = DB.get('ek_arr')||[];
  const idx = arrs.findIndex(a=>a.id===arr.id);
  if (idx>-1) { arrs[idx].tlm += antal; if (arrs[idx].tlm>=arrs[idx].maks) arrs[idx].status='fuldt'; DB.set('ek_arr', arrs); }

  f.style.display='none';
  const kv=document.getElementById('tilm-kv'); kv.style.display='block';
  kv.innerHTML=`
<div class="kv">
  <div class="kv-i">✅</div>
  <h2>Tilmelding modtaget!</h2>
  <p><strong>${esc(t.navn)}</strong> er tilmeldt <strong>${esc(arr.titel)}</strong> den ${fmtDato(arr.dato)}.</p>
  <p class="muted">Kontakt os på ${CONFIG.email} ved spørgsmål.</p>
  <button class="knap-p" onclick="navTil('kalender')">Se kalender</button>
  <button class="knap-sek" onclick="navTil('tilmelding')">Tilmeld endnu en</button>
</div>`;
}

function venteListe(arrId) {
  const arr = getArr().find(a=>a.id===arrId); if (!arr) return;
  const navn = prompt('Dit navn (venteliste):'); if (!navn) return;
  const email= prompt('Din email:');            if (!email) return;
  const vl = DB.get('ek_venteliste')||[];
  vl.push({arrId, arrTitel:arr.titel, navn, email, dato:new Date().toISOString()});
  DB.set('ek_venteliste', vl);
  alert(`Du er sat på venteliste til "${arr.titel}". Vi kontakter dig ved ledige pladser.`);
}

/* ================================================================
   GOLF / FIRMAARRANGEMENT
   ================================================================ */
function pgGolf() {
  const pakker = DB.get('ek_pakker')||CONFIG.golfPakker;
  const bil = CONFIG.billeder;
  return `
<div class="ph bg-mork">
  <h1>Book firmaarrangement 💼</h1>
  <p>Skræddersyede oplevelser til kunder, medarbejdere og netværk</p>
</div>

<section class="sek">
  <div class="bi-kort hover-kort" style="background-image:url('${bil.golf1}')">
    <div class="bi-tekst-lag">
      <p>Golf er det perfekte scenarie for stærke relationer, kundepleje og teambuilding.</p>
    </div>
  </div>
</section>

<section class="sek">
  <button class="gb-banner-knap" onclick="åbnGolfBox()">
    <span class="gb-ikon">🏌️</span>
    <div><strong>GolfBox login</strong><small>Book tid eller log ind i GolfBox</small></div>
    <span class="gb-pil">→</span>
  </button>
</section>

<section class="sek">
  <h2 class="stitl">Vælg arrangement</h2>
  <div class="pk-g">
    ${pakker.map(p=>`
    <div class="pk hover-kort">
      <h3>${esc(p.titel)}</h3>
      <div class="pk-pris">${esc(p.pris)}</div>
      <p>${esc(p.beskrivelse)}</p>
      <ul class="pk-ul">${(p.inkl||[]).map(i=>`<li>✓ ${esc(i)}</li>`).join('')}</ul>
      <button class="knap-sek mt1 fb" onclick="document.getElementById('book-golf').scrollIntoView({behavior:'smooth'})">Send forespørgsel</button>
    </div>`).join('')}
  </div>
</section>

<section class="sek" id="book-golf">
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
      <div class="fg"><label>Pakke / type</label>
        <select name="pakke">
          <option value="">Vælg arrangement…</option>
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
  const bg = DB.get('ek_golf_booking')||[];
  bg.push({id:'g'+Date.now(),virk:f.virk.value,kp:f.kp.value,email:f.email.value,tlf:f.tlf.value,dato:f.dato.value,antal:f.antal.value,pakke:f.pakke.value,besk:f.besk.value,oprettet:new Date().toISOString()});
  DB.set('ek_golf_booking', bg);
  f.style.display='none'; document.getElementById('golf-kv').style.display='block';
}

/* ================================================================
   SPONSOR
   ================================================================ */
function pgSponsor() {
  const sponsorer = DB.get('ek_sponsorer')||[];
  const bil = CONFIG.billeder;
  return `
<div class="ph bg-mork">
  <h1>Bliv sponsor 🌟</h1>
  <p>Synlighed, netværk og relationer i Aarhus-regionens erhvervsliv</p>
</div>

<section class="sek">
  <div class="bi-kort hover-kort" style="background-image:url('${bil.sponsor}')">
    <div class="bi-tekst-lag">
      <p>"Som sponsor bliver din virksomhed en del af et stærkt fællesskab med golf som rammen og netværk som resultatet."</p>
    </div>
  </div>
</section>

<section class="sek">
  <h2 class="stitl">Hvad får din virksomhed?</h2>
  <div class="ikg">
    ${CONFIG.sponsorFordele.map(f=>`
    <div class="ikb static">
      <span class="iks">${f.ikon}</span>
      <strong>${esc(f.titel)}</strong>
      <p>${esc(f.tekst)}</p>
    </div>`).join('')}
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

${sponsorer.filter(s=>s.navn&&!s.navn.includes('ledigt')).length?`
<section class="sek">
  <h2 class="stitl">Vores sponsorer</h2>
  <div class="sp-g">
    ${sponsorer.map(s=>`
    <a class="sp-k hover-kort" href="${esc(s.link||'#')}" target="_blank" rel="noopener">
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
  <div class="tc mt1">
    <a class="knap-sek" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 ${CONFIG.telefon}</a>
    <a class="knap-sek" href="mailto:${CONFIG.email}?subject=Sponsorat LYG Erhvervsklub">✉️ ${CONFIG.email}</a>
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
  const bil = CONFIG.billeder;
  return `
<div class="ph bg-mork">
  <h1>Erhvervsklubben 🤝</h1>
  <p>${esc(CONFIG.omEK.tagline)}</p>
</div>

<section class="sek">
  <div class="bi-kort hover-kort" style="background-image:url('${bil.netvaerk}')">
    <div class="bi-tekst-lag">
      <p>${esc(CONFIG.omEK.tekst)}</p>
    </div>
  </div>
</section>

<section class="sek">
  <div class="ikg">
    ${CONFIG.omEK.punkter.map(p=>`
    <div class="ikb static">
      <span class="iks">${p.ikon}</span>
      <strong>${esc(p.titel)}</strong>
      <p>${esc(p.tekst)}</p>
    </div>`).join('')}
  </div>
</section>

<section class="sek">
  <div class="om-cta">
    <h3>Interesseret i erhvervsmedlemskab?</h3>
    <p>Kontakt os og hør om mulighederne.</p>
    <div class="btn-row jc">
      <a class="knap-p" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 Ring til os</a>
      <a class="knap-sek" href="mailto:${CONFIG.email}">✉️ Skriv til os</a>
    </div>
  </div>
</section>`;
}

/* ================================================================
   KONTAKT
   ================================================================ */
function pgKontakt() {
  const bil = CONFIG.billeder;
  return `
<div class="ph bg-mork">
  <h1>Kontakt ✉️</h1>
  <p>Vi er klar til at hjælpe dig</p>
</div>

<section class="sek">
  <div class="kontakt-boks">
    <a class="kl" href="tel:${CONFIG.telefon.replace(/\s/g,'')}"><span>📞</span><span>${CONFIG.telefon}</span></a>
    <a class="kl" href="mailto:${CONFIG.email}"><span>✉️</span><span>${CONFIG.email}</span></a>
    <div class="kl"><span>📍</span><span>${esc(CONFIG.adresse)}</span></div>
    <a class="kl" href="${CONFIG.website}" target="_blank" rel="noopener"><span>🌐</span><span>${CONFIG.website}</span></a>
  </div>
  <div class="kontakt-ctas">
    <a class="knap-p" href="tel:${CONFIG.telefon.replace(/\s/g,'')}">📞 Ring til os</a>
    <a class="knap-sek" href="mailto:${CONFIG.email}">✉️ Send email</a>
  </div>
</section>

<section class="sek">
  <h2 class="stitl">Send en besked</h2>
  <form id="kf" onsubmit="submitKontakt(event)">
    <div class="g2f">
      <div class="fg"><label>Fornavn *</label><input name="fn" required></div>
      <div class="fg"><label>Efternavn *</label><input name="en" required></div>
    </div>
    <div class="fg"><label>Email *</label><input type="email" name="email" required></div>
    <div class="fg"><label>Telefon</label><input type="tel" name="tlf"></div>
    <div class="fg"><label>Besked *</label><textarea name="besk" rows="4" required placeholder="Skriv din besked her…"></textarea></div>
    <button type="submit" class="knap-p fb">Send besked</button>
  </form>
  <div id="kont-kv" style="display:none" class="kv">
    <div class="kv-i">✅</div><h2>Besked modtaget!</h2>
    <p>Vi vender tilbage hurtigst muligt.</p>
    <button class="knap-sek" onclick="navTil('forside')">Tilbage til forsiden</button>
  </div>
</section>`;
}

function submitKontakt(e) {
  e.preventDefault();
  const f=e.target;
  const alle=DB.get('ek_beskeder')||[];
  alle.push({id:'k'+Date.now(),fn:f.fn.value,en:f.en.value,email:f.email.value,tlf:f.tlf.value,besk:f.besk.value,dato:new Date().toISOString()});
  DB.set('ek_beskeder',alle);
  f.style.display='none'; document.getElementById('kont-kv').style.display='block';
}

/* ================================================================
   ADMIN
   ================================================================ */
let adminIN  = false;
let _adFane  = 'arr';

function pgAdmin() {
  if (!adminIN) return `
<div class="ph bg-mork"><h1>Admin ⚙️</h1></div>
<section class="sek">
  <div class="admin-login">
    <p class="muted tc mb1">Indtast admin-koden</p>
    <div class="fg"><label>Kode</label><input type="password" id="ak-inp" maxlength="30" placeholder="••••"></div>
    <button class="knap-p fb" onclick="tjekKode()">Log ind</button>
    <div id="ak-fejl" class="fejl-b" style="display:none">Forkert kode.</div>
  </div>
</section>`;

  const faner=[['arr','Arrangementer'],['tilm','Tilmeldinger'],['sp','Sponsorer'],['golf','Firmapakker'],['inst','Indstillinger'],['bk','Backup']];
  return `
<div class="ph bg-mork" style="display:flex;justify-content:space-between;align-items:center">
  <div><h1>Admin ⚙️</h1></div>
  <button class="knap-sek sm" onclick="adminLogUd()">Log ud</button>
</div>
<div class="af-nav">
  ${faner.map(([k,l])=>`<button class="af ${_adFane===k?'aktiv':''}" onclick="skiftFane('${k}')">${l}</button>`).join('')}
</div>
<section class="sek">
  ${_adFane==='arr'  ? adArr()   : ''}
  ${_adFane==='tilm' ? adTilm()  : ''}
  ${_adFane==='sp'   ? adSp()    : ''}
  ${_adFane==='golf' ? adGolf()  : ''}
  ${_adFane==='inst' ? adInst()  : ''}
  ${_adFane==='bk'   ? adBk()    : ''}
</section>`;
}

function tjekKode() {
  const v=document.getElementById('ak-inp').value;
  if (v===getKode()) { adminIN=true; navTil('admin'); }
  else { document.getElementById('ak-fejl').style.display='block'; }
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
      <span>${a.tlm}/${a.maks} · ${erFremtidig(a.dato)?(a.aaben?'Åben':'Lukket'):'Afholdt'}</span>
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
  const a = id ? (DB.get('ek_arr')||[]).find(x=>x.id===id) : null;
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
    <div class="fg"><label>Type</label><input name="type" value="${a?esc(a.type||''):''}"></div>
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

function gemArr(e, id) {
  e.preventDefault(); const f=e.target;
  const arrs=DB.get('ek_arr')||[];
  const n={id:id||'a'+Date.now(), titel:f.titel.value, dato:f.dato.value, tid:f.tid.value, sted:f.sted.value, type:f.type.value, besk:f.besk.value, maks:parseInt(f.maks.value)||40, tlm:parseInt(f.tlm.value)||0, status:f.status.value, aaben:f.aaben.checked};
  if (id) { const i=arrs.findIndex(a=>a.id===id); if(i>-1) arrs[i]=n; } else arrs.push(n);
  DB.set('ek_arr',arrs); skiftFane('arr');
}

function sletArr(id) {
  if (!confirm('Slet arrangement?')) return;
  DB.set('ek_arr',(DB.get('ek_arr')||[]).filter(a=>a.id!==id)); skiftFane('arr');
}

function kopierArr(id) {
  const a=(DB.get('ek_arr')||[]).find(x=>x.id===id); if(!a) return;
  const arrs=DB.get('ek_arr')||[];
  arrs.push({...a, id:'a'+Date.now(), titel:a.titel+' (kopi)', tlm:0});
  DB.set('ek_arr',arrs); skiftFane('arr'); alert('Kopieret ✓');
}

function kopierNytAar() {
  const y=prompt('Kopier alle arrangementer til år:',new Date().getFullYear()+1); if(!y||isNaN(+y)) return;
  const arrs=DB.get('ek_arr')||[];
  const nye=arrs.map(a=>({...a, id:'a'+Date.now()+Math.random().toString(36).substr(2,4), dato:a.dato.replace(/^\d{4}/,y), tlm:0, status:'aaben', aaben:true}));
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
    <td>${esc(t.arrTitel||'–')}</td>
    <td>${esc(t.navn)}</td>
    <td>${esc(t.virk)}</td>
    <td>${t.antal}</td>
    <td><input type="checkbox" ${t.mødt?'checked':''} onchange="markerMødt('${t.id}',this.checked)"></td>
    <td><button class="knap-i red" onclick="sletTilm('${t.id}')">🗑️</button></td>
  </tr>`).join('')}
  </tbody>
</table>
</div>`:`<p class="muted">Ingen tilmeldinger${q?' matcher søgningen':' endnu'}.</p>`}`;
}

function markerMødt(id,v) { const a=DB.get('ek_tilm')||[]; const i=a.findIndex(t=>t.id===id); if(i>-1){a[i].mødt=v;DB.set('ek_tilm',a);} }
function sletTilm(id) { if(!confirm('Slet tilmelding?')) return; DB.set('ek_tilm',(DB.get('ek_tilm')||[]).filter(t=>t.id!==id)); skiftFane('tilm'); }

function exportCSV() {
  const alle=DB.get('ek_tilm')||[];
  const hdr=['Arrangement','Navn','Virksomhed','Email','Telefon','Antal','Kommentar','Dato','Mødt'];
  const rws=alle.map(t=>[t.arrTitel||'',t.navn,t.virk,t.email,t.tlf,t.antal,t.kom||'',t.dato,t.mødt?'Ja':'Nej']);
  const csv=[hdr,...rws].map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a'); a.href=url; a.download=`tilmeldinger_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
}

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
    <div class="fg"><label>Logo URL</label><input name="logo" placeholder="https://..." value="${s?esc(s.logo||''):''}"></div>
    <div class="fg"><label>Link URL</label><input name="link" placeholder="https://..." value="${s?esc(s.link||''):''}"></div>
    <div class="fg"><label>Niveau</label>
      <select name="niveau">${['guld','sølv','bronze','standard'].map(n=>`<option value="${n}" ${s&&s.niveau===n?'selected':''}>${n}</option>`).join('')}</select>
    </div>
    <div class="btn-row">
      <button type="submit" class="knap-p">Gem</button>
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

function sletSponsor(id) {
  if(!confirm('Fjern sponsor?')) return;
  DB.set('ek_sponsorer',(DB.get('ek_sponsorer')||[]).filter(s=>s.id!==id)); skiftFane('sp');
}

/* ── Admin: Firmapakker ── */
function adGolf() {
  const pk=DB.get('ek_pakker')||CONFIG.golfPakker;
  return `
<p class="muted mb1">Rediger firmapakkerne. Ændringer slår straks igennem på firmaarrangement-siden.</p>
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

function gemPakke(e,i) {
  e.preventDefault(); const f=e.target;
  const pk=DB.get('ek_pakker')||CONFIG.golfPakker;
  pk[i]={...pk[i],titel:f.titel.value,pris:f.pris.value,beskrivelse:f.besk.value,inkl:f.inkl.value.split('\n').filter(Boolean)};
  DB.set('ek_pakker',pk); alert('Pakke gemt ✓');
}

/* ── Admin: Indstillinger ── */
function adInst() {
  const hero=DB.get('ek_hero')||{};
  const gb=getGolfboxUrl();
  return `
<div class="ad-form mb1">
  <h3>Hero-sektion (forside)</h3>
  <form onsubmit="gemHero(event)">
    <div class="fg"><label>Overskrift</label><input name="tekst" value="${esc(hero.tekst||CONFIG.heroTekst)}"></div>
    <div class="fg"><label>Undertekst</label><textarea name="under" rows="2">${esc(hero.under||CONFIG.heroUnder)}</textarea></div>
    <div class="fg"><label>Hero-billede URL</label><input name="billede" value="${esc(hero.billede||CONFIG.heroBillede)}"></div>
    <button type="submit" class="knap-p">Gem hero</button>
  </form>
</div>
<div class="ad-form mb1">
  <h3>GolfBox-link</h3>
  <form onsubmit="gemGolfbox(event)">
    <div class="fg">
      <label>GolfBox login URL</label>
      <input name="url" value="${esc(gb)}" placeholder="https://www.golfbox.dk/...">
    </div>
    <button type="submit" class="knap-p">Gem link</button>
  </form>
</div>
<div class="ad-form">
  <h3>Skift admin-kode</h3>
  <form onsubmit="skiftKode(event)">
    <div class="fg"><label>Nuværende kode</label><input type="password" name="gammel" required></div>
    <div class="fg"><label>Ny kode</label><input type="password" name="ny" required minlength="4"></div>
    <div class="fg"><label>Bekræft ny kode</label><input type="password" name="bk" required></div>
    <button type="submit" class="knap-p">Skift kode</button>
  </form>
</div>`;
}

function gemHero(e) {
  e.preventDefault(); const f=e.target;
  DB.set('ek_hero',{tekst:f.tekst.value,under:f.under.value,billede:f.billede.value});
  alert('Hero gemt ✓');
}

function gemGolfbox(e) {
  e.preventDefault();
  DB.set('ek_golfbox', e.target.url.value);
  alert('GolfBox-link gemt ✓');
}

function skiftKode(e) {
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
  <p class="muted mb1">Sletter alt og genindlæser standardarrangementerne.</p>
  <button class="knap-rød" onclick="nulstil()">🗑️ Nulstil alt</button>
</div>`;
}

function eksporter() {
  const d={arr:DB.get('ek_arr'),tilm:DB.get('ek_tilm'),sp:DB.get('ek_sponsorer'),pk:DB.get('ek_pakker'),hero:DB.get('ek_hero'),golfbox:DB.get('ek_golfbox'),dato:new Date().toISOString()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url; a.download=`lyg-ek-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
}

function importer(inp) {
  const fil=inp.files[0]; if(!fil) return;
  const r=new FileReader();
  r.onload=ev=>{
    try {
      const d=JSON.parse(ev.target.result);
      if(!confirm('Overskriver al nuværende data. Fortsæt?')) return;
      if(d.arr)     DB.set('ek_arr',d.arr);
      if(d.tilm)    DB.set('ek_tilm',d.tilm);
      if(d.sp)      DB.set('ek_sponsorer',d.sp);
      if(d.pk)      DB.set('ek_pakker',d.pk);
      if(d.hero)    DB.set('ek_hero',d.hero);
      if(d.golfbox) DB.set('ek_golfbox',d.golfbox);
      alert('Backup importeret ✓'); navTil('forside');
    } catch { alert('Ugyldig backup-fil.'); }
  };
  r.readAsText(fil);
}

function nulstil() {
  if(!confirm('Slet al data og genindlæs standarddata?')) return;
  ['ek_arr','ek_tilm','ek_sponsorer','ek_pakker','ek_hero','ek_kode','ek_golfbox','ek_venteliste','ek_beskeder','ek_golf_booking','ek_sponsor_henvendelser','ek_paam','ek_paam_vist','ek_init'].forEach(k=>DB.del(k));
  init(); navTil('forside'); alert('Data nulstillet ✓');
}

/* ================================================================
   KALENDER / PÅMINDELSER
   ================================================================ */
function tilfoejKal(id) {
  const a=getArr().find(x=>x.id===id); if(!a) return;
  const d=a.dato.replace(/-/g,'');
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(a.titel)}&dates=${d}/${d}${a.sted?'&location='+encodeURIComponent(a.sted):''}${a.besk?'&details='+encodeURIComponent(a.besk):''}`, '_blank','noopener');
}

async function aktPaam(id) {
  const a=getArr().find(x=>x.id===id); if(!a) return;

  if (!('Notification' in window)) {
    const ok=confirm(`Din browser understøtter ikke push-notifikationer.\n\nVil du tilføje "${a.titel}" til din kalender som påmindelse?`);
    if (ok) tilfoejKal(id);
    return;
  }
  if (Notification.permission === 'denied') {
    const ok=confirm(`Notifikationer er blokeret.\n\nVil du tilføje "${a.titel}" til din kalender i stedet?`);
    if (ok) tilfoejKal(id);
    return;
  }

  let perm=Notification.permission;
  if (perm==='default') {
    try { perm=await Notification.requestPermission(); } catch { perm='denied'; }
  }

  if (perm==='granted') {
    const pm=DB.get('ek_paam')||{};
    pm[id]={dato:a.dato,titel:a.titel,tider:[14,7,3]};
    DB.set('ek_paam',pm);
    alert(`✅ Påmindelser aktiveret for "${a.titel}".\nDu får besked 14, 7 og 3 dage før.`);
  } else {
    const ok=confirm(`Notifikationer ikke tilladt.\n\nVil du tilføje "${a.titel}" til din kalender?`);
    if (ok) tilfoejKal(id);
  }
}

function tjekPaam() {
  if (!('Notification' in window)||Notification.permission!=='granted') return;
  const pm=DB.get('ek_paam')||{};
  const vist=DB.get('ek_paam_vist')||{};
  const nu=new Date();
  Object.entries(pm).forEach(([id,p])=>{
    (p.tider||[]).forEach(dage=>{
      const nøgle=`${id}_${dage}`;
      if(vist[nøgle]) return;
      const gr=new Date(p.dato+'T00:00:00'); gr.setDate(gr.getDate()-dage);
      if(nu>=gr){ try { new Notification(`Husk: ${p.titel}`,{body:`Om ${dage} dag${dage>1?'e':''}`,icon:'./icons/icon-192.png'}); } catch{} vist[nøgle]=true; }
    });
  });
  DB.set('ek_paam_vist',vist);
}

/* ================================================================
   BIND / BOOT
   ================================================================ */
function bindAll() {
  const ak=document.getElementById('ak-inp');
  if(ak){ ak.addEventListener('keydown',e=>{ if(e.key==='Enter') tjekKode(); }); ak.focus(); }
}

let installEvt=null;
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); installEvt=e; const b=document.getElementById('install-banner'); if(b) b.style.display='flex'; });

function installApp() {
  if(!installEvt) return;
  installEvt.prompt();
  installEvt.userChoice.then(()=>{ installEvt=null; const b=document.getElementById('install-banner'); if(b) b.style.display='none'; });
}

document.addEventListener('DOMContentLoaded',()=>{
  init();
  tjekPaam();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js',{scope:'./'})
      .then(r=>console.log('[SW] scope:',r.scope))
      .catch(e=>console.warn('[SW] fejl:',e));
  }

  navTil('forside');

  document.getElementById('bottom-nav').addEventListener('click',e=>{
    const btn=e.target.closest('.nav-item');
    if(btn&&btn.dataset.side) navTil(btn.dataset.side);
  });

  const sp=document.getElementById('splash');
  if(sp){ setTimeout(()=>{ sp.style.opacity='0'; setTimeout(()=>sp.remove(),400); },600); }
});
