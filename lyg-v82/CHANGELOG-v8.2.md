# LYG Erhvervsklub — Changelog v8.2
_Udgivet: 2026-11-25_

## Resumé

v8.2 er en komplet arkitekturændring: Supabase erstattes af Google Apps Script + Google Sheets som backend. Design, animationer og PWA-funktioner er uændrede fra v8.1.

---

## Ny arkitektur

### Fjernet
- **Supabase** — URL, anon-nøgle og JS-klient fjernet fra al browserkode
- `@supabase/supabase-js` CDN-script fjernet fra `index.html`
- `getSupabase()`, `let _supabase` fjernet fra `app.js`

### Tilføjet
- **Google Apps Script** (`apps-script/Code.gs`) — komplet serverbackend
- **Google Sheets** — 12 sheets som central database
- **Google Sign-In OAuth** — admin-login i `admin.html`
- `scriptFetch()` og `scriptGet()` i `app.js` — erstatter Supabase-kald

---

## Sikkerhedsændringer

### Admin-login (admin.html)
**Før (v8.1):** Supabase Auth-reference (ikke implementeret — viste kun advarsel)  
**Nu (v8.2):** Fuldt implementeret Google Sign-In med:
- Google id_token verificeres server-side mod Googles tokeninfo-API
- Whitelist-baseret adgangskontrol (ADMIN_EMAILS i Script Properties)
- HMAC-signeret session-token (8 timers udløb)
- Ingen hardkodet PIN eller fallback

### Booking (app.js)
**Før (v8.1):** Supabase RPC `tilmeld_arrangement`  
**Nu (v8.2):** `fetch()` til Apps Script `doPost` med LockService-beskyttelse

### Venteliste (app.js)
**Før (v8.1):** Kun localStorage  
**Nu (v8.2):** Sendt til Apps Script — bekræftelsesmail via Brevo

### Firmaarrangement (app.js)
**Før (v8.1):** Kun gemt i localStorage  
**Nu (v8.2):** Sendt til Apps Script — bekræftelse til afsender + notifikation til admin

---

## Apps Script backend (Code.gs)

Komplet implementation med:
- `doGet(e)` — 6 offentlige GET-endepunkter
- `doPost(e)` — 9 handlinger (tilmelding, afmelding, venteliste, admin-CRUD)
- LockService — atomisk booking-beskyttelse
- Brevo via UrlFetchApp — 7 e-mailtyper
- Google OAuth admin-verifikation
- HMAC-signerede afmeldingslinks
- Automatisk ventelistehåndtering
- Daglig påmindelsestrigger (`sendDagligePaamindelser`)
- `setupSheets()` — opretter alle 12 sheets

---

## Google Sheets (12 sheets)

| Sheet | Formål |
|-------|--------|
| Arrangementer | Alle arrangementer med kapacitet og status |
| Tilmeldinger | Alle tilmeldinger med afmeldingstoken |
| Afmeldinger | Afmeldingshistorik |
| Ventelister | Venteliste per arrangement |
| Medlemsvirksomheder | Registrerede erhvervsmedlemmer |
| Sponsorer | Sponsorer med niveau og synlighed |
| Nyheder | Nyheder og meddelelser |
| Popup | Popup-indhold (én aktiv ad gangen) |
| Infobjælke | Infobjælke-tekst og link |
| Administratorer | Autoriserede admin-emails |
| E-mailstatus | Log over sendte e-mails |
| Historik | Revisions-log for alle handlinger |

---

## admin.html (ny implementation)

Komplet admin-interface med:
- Google Sign-In knap
- Arrangementer: liste, opret, redigér, markér slettet
- Tilmeldinger: oversigt med arrangement-filter
- Popup: rediger tekst, nøgle, CTA
- Infobjælke: rediger tekst og link
- Nyheder: opret/rediger
- Sponsorer: opret/rediger med niveau
- Påmindelser: send til alle tilmeldte ét arrangement
- Toast-notifikationer
- Responsivt layout

---

## Versionsopdatering

| Fil | v8.1 → v8.2 |
|-----|-------------|
| `service-worker.js` | `lyg-erhverv-v8.1` → `lyg-erhverv-v8.2` |
| `app.js` | Header + footer opdateret |
| `index.html` | `?v=8.1` → `?v=8.2`; Supabase-script fjernet |
| `style.css` | Header opdateret |
| `admin.html` | Komplet omskrivning |

---

## Hvad er IKKE ændret

- Supabase-databasen er uberørt (ALDRIG slettet/genaktiveret uden godkendelse)
- Design, farver, typografi og layout fra v8.1
- Golf-bold intro-animation
- Ken Burns hero
- Sæson 2027 popup og infobjælke
- 2026-arkiv (`STD_ARR_ARKIV_2026`)
- Service Worker cache-filter (`lyg-erhverv-*`)
- localStorage-nøgler (`ek_*` prefix)
- PWA-manifest, ikoner

---

## Leverancer

| Fil | Beskrivelse |
|-----|-------------|
| `lyg-erhvervsklub-v8.2.zip` | Komplet ZIP klar til GitHub Pages |
| `apps-script/Code.gs` | Google Apps Script backend |
| `INSTALLATIONSVEJLEDNING.md` | Trin-for-trin guide |
| `BREVO-OPSAETNING.md` | Brevo-konto og API-nøgle |
| `SIKKERHEDSDOKUMENTATION.md` | Sikkerhedsarkitektur og -krav |
| `CHANGELOG-v8.2.md` | Denne fil |
| `TESTRESULTATER-v8.2.md` | QA-rapport |

