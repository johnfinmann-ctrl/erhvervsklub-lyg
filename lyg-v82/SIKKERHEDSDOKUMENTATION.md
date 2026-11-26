# Sikkerhedsdokumentation — LYG Erhvervsklub v8.2
_Google Apps Script + Google Sheets + Brevo_

---

## Arkitektur-oversigt

```
Bruger (PWA/browser)
  │
  ├── GitHub Pages (statiske filer: index.html, app.js, style.css)
  │     · Ingen server-side kode
  │     · Ingen hemmeligheder
  │
  └── Google Apps Script (Web App)
        · Validerer REQUEST_TOKEN
        · Validerer admin-session-token
        · Skriver til Google Sheets
        · Sender e-mail via Brevo
        · Brevo API-nøgle i Script Properties (serversiden)
        · Google Sheets ikke offentligt tilgængeligt
```

---

## Sikkerhedskrav opfyldt

### ✅ Ingen hardkodede PIN-koder
- `CONFIG.adminKode` og `PIN_KEY` fjernet i v8.1
- `DEF_PIN` og `getPin()` fjernet i admin.html i v8.1
- Ingen PIN-baseret adgang i v8.2

### ✅ Sikker Google-baseret administratoradgang
- Admin-login via Google Sign-In (OAuth 2.0)
- Google id_token verificeres mod Googles tokeninfo-endpunkt server-side i Apps Script
- Kun e-mailadresser i `ADMIN_EMAILS` (Script Properties) godkendes
- Administrators session-token er HMAC-signeret med HMAC_SECRET + udløbstidspunkt (8 timer)
- Session-token gemmes i `sessionStorage` (lukkes ved fanen/vinduet lukkes)

### ✅ Google Sheets ikke offentligt tilgængeligt
- Google Sheet er delt med "Begrænsede — kun personer med adgang"
- Apps Script kører som Sheet-ejeren (serviceaccount-lignende adgang)
- Ingen offentlig Sheets API-URL bruges

### ✅ Brevo API-nøgle på serversiden
- API-nøglen gemmes udelukkende i Apps Script Script Properties
- Nøglen fremgår IKKE af:
  - `app.js`
  - `admin.html`
  - `index.html`
  - Noget GitHub-fil
- Kun Apps Script kan sende e-mail på LYG's vegne

### ✅ LockService til samtidige tilmeldinger
- `LockService.getScriptLock()` omslutter al booking-logik
- Maks. ventetid: 10 sekunder
- Sikrer atomisk kapacitetskontrol: ingen race conditions ved samtidige bookinger

### ✅ Ingen dobbeltregistreringer og overbooking
- Dobbelttjek på e-mail + arrangement-ID i Tilmeldinger-sheet
- Kapacitetscheck: `tilmNu + antal > maks` → afvis med besked
- Alt inden for én `LockService`-blok

### ✅ Personlige, sikre afmeldingslinks
- Hvert tilmeldingslink indeholder:
  - `tilmId` (unik UUID-baseret)
  - `tok` = HMAC-SHA256(`tilmId + email + arrId`) med `HMAC_SECRET`
- Token sammenlignes server-side — ingen enumeration mulig
- Link kan kun bruges én gang: gentagen brug afvises med "allerede afmeldt"

### ✅ GDPR og beskyttelse af deltageroplysninger
- Persondata (navn, email, telefon) gemmes kun i Google Sheets (ikke i browserkode)
- localStorage indeholder kun lokal kopi til UI-brug (ingen yderligere deling)
- Google Sheets er IKKE offentligt tilgængeligt
- Data eksporteres/slettes manuelt af admin via Google Sheets

### ✅ Ingen falske tilmeldingsbekræftelser
- `bookAfslut()` venter på serverbekræftelse (fetch til Apps Script)
- Kun ved `data.ok === true` vises bekræftelse
- Netværksfejl → klar fejlbesked: "IKKE registreret"
- Ingen localStorage-fallback til booking

### ✅ CORS og adgangskontrol
- Apps Script Web App returnerer JSON (Content-Type: application/json)
- REQUEST_TOKEN valideres ved alle offentlige kald (POST body `token`)
- Admin-token valideres ved alle admin-kald (POST body `adminToken`)
- Google Sign-In id_token verificeres mod Googles offentlige tokeninfo-API

### ✅ Det eksisterende Supabase-projekt berøres ikke
- Supabase-URL og anon-nøgle er fjernet fra browserkode i v8.2
- Supabase-databasen er uberørt og kan genaktiveres efter godkendelse
- Ingen migration eller sletning er foretaget

### ✅ Ingen opdigtede 2027-arrangementer
- `STD_ARR = []` (tom liste)
- 2026-arkiv bevaret i `STD_ARR_ARKIV_2026`

### ✅ Brevo API-nøgler aldrig i browserkode eller GitHub
- Verificeret ved grep: ingen API-nøgle i `.html`, `.js`, `.css`, `.json`

---

## Resterende risici og anbefalinger

| Risiko | Niveau | Anbefaling |
|--------|--------|-----------|
| `requestToken` i browserkode (app.js) | Lavt | Token giver kun adgang til offentlige handlinger (tilmelding). Admin-handlinger kræver admin-token. Acceptabelt. |
| Apps Script Web App tilgængelig for "Alle" | Lavt | Nødvendigt for at PWA kan kalde backend. Mitigeres af REQUEST_TOKEN + HMAC-signerede tokens. |
| Session-token i sessionStorage | Lavt | Lukkes ved fanelukning. Alternativ: kortere udløbstid. |
| Google id_token-verifikation via tokeninfo | Middelt | Produktionssystemer bør bruge Google API Client Library. For LYG's skala er tokeninfo acceptabelt. |

---

## Dataflow (tilmelding)

```
1. Bruger udfylder tilmeldingsskema i PWA
2. app.js: scriptFetch({ action:'tilmeld', ... , token: requestToken })
3. Apps Script: doPost(e) modtager kald
4. Validér REQUEST_TOKEN
5. LockService.waitLock(10000)
6. Tjek kapacitet i Tilmeldinger-sheet
7. Tjek dobbeltregistrering (email + arrId)
8. Gem i Tilmeldinger-sheet
9. Send bekræftelsesmail via Brevo (UrlFetchApp)
10. Send admin-notifikation via Brevo
11. LockService.releaseLock()
12. Returner { ok: true, tilmelding_id, ledige_tilbage }
13. PWA viser bekræftelse KUN ved ok:true
```

---

## Testmiljø-krav

- Brug kun testmiljø til tilmeldinger og e-mails
- Send ikke rigtige beskeder til medlemmer under test
- Brug egne e-mailadresser til testflow

