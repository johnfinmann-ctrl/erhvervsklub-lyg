# Testresultater — LYG Erhvervsklub v8.2
_Uafhængig QA-gennemgang udført: 2026-11-25_  
_Gennemgåede filer: `app.js`, `admin.html`, `apps-script/Code.gs`, `index.html`, `service-worker.js`_

---

## Automatisk kodegennemgang — 15 sikkerhedskrav

| # | Krav | Status | Bevis |
|---|------|--------|-------|
| 1 | Supabase-URL (`csjsauqjfmknqmmjodqp`) fjernet fra browserkode | ✅ | Kun i `MIGRATIONSGUIDE-v6.2.md` (historisk dok.) og `work70/app.js` (gammel kopi) — ikke i `app.js`, `index.html` eller `admin.html` |
| 2 | Supabase anon-nøgle fjernet fra browserkode | ✅ | Kun i `work70/app.js` (gammel kopi) — ikke i aktive filer |
| 3 | `getSupabase()` / `let _supabase` fjernet fra `app.js` | ⚠️ | `function getSupabase` og `let _supabase` er IKKE defineret — men `getSupabase()` **kaldes stadig** linje 1433, 1516, 1557 i `submitKontakt()`, `tjekKode()` og `adminLogUd()`. Disse funktioner vil kaste `ReferenceError` ved kald. |
| 4 | Supabase CDN-script fjernet fra `index.html` | ✅ | Kun kommentaren `<!-- Ingen Supabase i v8.2 -->` — ingen `<script src="…supabase…">` |
| 5 | Hardkodet PIN `1234` ikke til stede | ✅ | Ingen forekomst af `1234` som PIN. `getKode()` læser fra `DB.get('ek_kode')` — ingen hardkodet standard. |
| 6 | Brevo API-nøgle ikke i nogen fil | ✅ | Ingen API-nøgle i `app.js`, `admin.html`, `index.html` — kun `PropertiesService.getScriptProperties()` i `Code.gs` |
| 7 | `scriptFetch()` bruges til booking | ✅ | `bookAfslut()` kalder `scriptFetch({ action:'tilmeld', … })` linje 953 |
| 8 | `bookAfslut()` viser KUN bekræftelse ved `data.ok === true` | ✅ | Linje 964: `if (!data \|\| !data.ok)` → returnerer med fejlbesked. Bekræftelse vises kun nedstrøms ved positivt svar. |
| 9 | Ingen localStorage-fallback til booking | ✅ | `bookAfslut()` skriver til localStorage KUN efter serverbekræftelse (linje 989: `kilde: 'apps-script'`). Netværksfejl → catch-blok viser fejl. |
| 10 | Admin-login i `admin.html` bruger Google Sign-In | ✅ | `handleGoogleCallback()` verificerer Google id_token. Ingen PIN-felt i `admin.html`. |
| 11 | `LockService` bruges i `Code.gs` booking-flow | ✅ | Linje 121: `const lock = LockService.getScriptLock()` omslutter al booking-logik |
| 12 | `HMAC_SECRET` / `REQUEST_TOKEN` kun i Script Properties | ✅ | `app.js` indeholder kun pladsholder `'INDSÆT_REQUEST_TOKEN'` — ingen faktisk hemmelig nøgle. `HMAC_SECRET` er kun i `Code.gs` via `PropertiesService`. |
| 13 | `CACHE_VERSION` er `lyg-erhverv-v8.2` | ✅ | `service-worker.js` linje 14: `const CACHE_VERSION = 'lyg-erhverv-v8.2'` |
| 14 | SW cache-filter starter med `lyg-erhverv-` | ✅ | Linje 52: `.filter(k => k.startsWith('lyg-erhverv-') && k !== CACHE_VERSION)` |
| 15 | Supabase CDN ikke i `index.html` | ✅ | Bekræftet — ingen Supabase-script-tag |

---

## Fundne problemer

### 🔴 Problem 1: `getSupabase()` kaldes men er ikke defineret (app.js)

**Alvorlighed:** Høj (runtime-fejl)  
**Fundne linjer:**
- Linje 1433: `submitKontakt()` — `const sb = getSupabase();`
- Linje 1516: `tjekKode()` — `const sb = getSupabase();`
- Linje 1557: `adminLogUd()` — `const sb = getSupabase();`

**Konsekvens:**
- `submitKontakt()` (kontaktformular) kaster `ReferenceError` og afbrydes — kontaktbeskeder mistes.
- `tjekKode()` (gammel admin-login i `app.js`) kaster fejl — blokerer gammel admin-sektion.
- `adminLogUd()` kaster fejl.

**Bemærk:** `admin.html` er uafhængig og korrekt — dens Google Sign-In-flow er upåvirket. Den gamle `app.js`-baserede admin-sektion er under alle omstændigheder ikke beregnet til produktion i v8.2.

**Anbefaling:** Slet eller neutralisér `submitKontakt()`, `tjekKode()` og `adminLogUd()` i `app.js`, eller erstat `getSupabase()` med `null`-definitioner:
```javascript
function getSupabase() { return null; } // v8.2: Supabase fjernet
```

---

### ⚠️ Problem 2: `getKode()` og lokal admin-fallback stadig i app.js

**Alvorlighed:** Lav (ingen hardkodet PIN, men kode-system er forældet)  
**Fundne linjer:**
- Linje 208: `function getKode() { return DB.get('ek_kode') || ''; }`
- Linje 1545: `if (v === getKode()) { adminIN = true; … }`
- Linje 1904: `if(f.gammel.value!==getKode()){…}`

**Konsekvens:** Ingen hardkodet PIN 1234 — men `getKode()` returnerer en tom streng som standard, hvilket betyder at en tom inputværdi ville give admin-adgang i den gamle app.js-admin-sektion (ikke `admin.html`). Da `tjekKode()` allerede kaster `ReferenceError` på linje 1516 (problem 1), nås dette aldrig i praksis.

**Anbefaling:** Slet gammel admin-sektion fra `app.js` i næste oprydningsrunde.

---

### ⚠️ Problem 3: Kontaktformular sender ikke til Apps Script

**Alvorlighed:** Funktionel mangel (ikke sikkerhedsproblem)  
Kontaktformularen (`submitKontakt`) gemmer kun lokalt i localStorage (pga. problem 1). Ingen serverside-handling er implementeret for kontaktbeskeder.

---

## Samlet vurdering

| Kategori | Vurdering |
|----------|-----------|
| Sikkerhed — kritisk (Supabase-nøgler) | ✅ Godkendt |
| Sikkerhed — admin-adgang | ✅ Godkendt (admin.html korrekt) |
| Sikkerhed — booking | ✅ Godkendt |
| Sikkerhed — Brevo | ✅ Godkendt |
| Sikkerhed — LockService | ✅ Godkendt |
| Runtime-stabilitet | 🔴 Kræver rettelse (problem 1) |
| GDPR / data | ✅ Godkendt |

**Konklusion:** Alle kritiske sikkerhedskrav er opfyldt. Supabase-nøgler og API-nøgler er ikke i browserkode. Booking, bekræftelse og admin-login er korrekt implementeret. Et runtime-problem (`getSupabase()` ikke defineret) påvirker kontaktformularen og den forældede app.js-admin-sektion — dette skal rettes inden produktionssætning. `admin.html` og booking-flowet er upåvirkede og korrekte.

---

## Manuel testliste (kræver browser/server)

Følgende kan ikke verificeres ved statisk kodegennemgang:

### Apps Script / Google Sheets
- [ ] `setupSheets()` opretter alle 12 sheets korrekt
- [ ] `REQUEST_TOKEN` valideres og afviser ugyldige tokens
- [ ] LockService forhindrer dobbeltbooking ved samtidige tilmeldinger
- [ ] HMAC-signeret afmeldingslink fungerer og kan ikke genbruges
- [ ] Venteliste aktiveres korrekt ved afmelding

### Brevo-integration
- [ ] Tilmeldingsbekræftelse modtages på deltagers e-mail
- [ ] Admin-notifikation modtages ved ny tilmelding
- [ ] Afmeldingskvittering sendes korrekt
- [ ] Ledig-plads-mail sendes til første på venteliste

### Admin (admin.html)
- [ ] Google Sign-In fungerer med autoriseret konto
- [ ] Uautoriseret Google-konto afvises
- [ ] Sessiontoken udløber efter 8 timer
- [ ] CRUD-operationer på arrangementer afspejles i Google Sheets

### PWA
- [ ] Service Worker installeres og cacher korrekt
- [ ] Offline-tilstand viser cachede sider
- [ ] "Tilføj til startskærm" fungerer på iOS og Android
- [ ] `?v=8.2` cache-busting sikrer friske assets ved opdatering

### CORS og netværk
- [ ] `doPost` og `doGet` returnerer korrekte CORS-headers
- [ ] Ugyldig `token` i POST afvises med fejl (ikke 200 OK)
- [ ] Admin-token fra anden session afvises

---

_QA udført af: Separat underagent — ikke den agent der producerede koden_
