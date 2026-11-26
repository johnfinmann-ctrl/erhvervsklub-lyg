# LYG Erhvervsklub v8.2 — Installationsvejledning
_Apps Script + Google Sheets + GitHub Pages + Brevo_

---

## Oversigt over trin

1. [Opret Google Sheet](#1-opret-google-sheet)
2. [Opret Google Apps Script projekt](#2-opret-google-apps-script-projekt)
3. [Konfigurér Script Properties (hemmeligheder)](#3-konfigurér-script-properties)
4. [Kør setupSheets()](#4-kør-setupsheets)
5. [Deploy som Web App](#5-deploy-som-web-app)
6. [Opret Google OAuth Client ID](#6-opret-google-oauth-client-id)
7. [Opdatér app.js og admin.html med URL'er](#7-opdatér-appjs-og-adminhtml)
8. [Upload til GitHub Pages](#8-upload-til-github-pages)
9. [Test](#9-test)

---

## 1. Opret Google Sheet

1. Gå til [sheets.google.com](https://sheets.google.com)
2. Klik **+ Nyt regneark**
3. Navngiv det: `LYG Erhvervsklub Data`
4. Kopiér arket-URL'en — du skal bruge spreadsheet-ID'et  
   (URL ser således ud: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`)

> **Vigtigt:** Del IKKE arket offentligt. Kun "begrænsede — kun personer med adgang".

---

## 2. Opret Google Apps Script projekt

1. Gå til [script.google.com](https://script.google.com)
2. Klik **Nyt projekt**
3. Navngiv det: `LYG Erhvervsklub Backend`
4. Åbn filen `Code.gs` — slet alt eksisterende indhold
5. Kopiér hele indholdet fra `apps-script/Code.gs` og indsæt
6. Klik 💾 (gem)

---

## 3. Konfigurér Script Properties

Script Properties er serversidens hemmeligheder — ALDRIG i offentlige filer.

1. I Apps Script-editoren: klik **Projekt → Indstillinger**
2. Scroll ned til **Script Properties**
3. Tilføj følgende nøgler:

| Nøgle | Værdi |
|-------|-------|
| `SPREADSHEET_ID` | ID fra trin 1 (den lange streng i URL) |
| `BREVO_API_KEY` | Din Brevo API-nøgle (se Brevo-opsætning) |
| `REQUEST_TOKEN` | Generer en lang tilfældig streng, fx: `lyg-ek-token-` + 32 tilfældige tegn |
| `HMAC_SECRET` | En anden lang tilfældig streng til signaturer |
| `ADMIN_EMAILS` | Kommasepareret liste: `john@lyg.dk,admin2@lyg.dk` |
| `APP_URL` | Din GitHub Pages URL: `https://DIT-BRUGERNAVN.github.io/REPO-NAVN/` |

> **Tip til at generere tokens:** Brug [randomkeygen.com](https://randomkeygen.com/) — vælg "Fort Knox Passwords".

---

## 4. Kør setupSheets()

Opretter alle 12 sheets med korrekte kolonneoverskrifter og farver.

1. I Apps Script-editoren: i dropdown øverst vælg **setupSheets**
2. Klik ▶ (kør)
3. Godkend adgange første gang (pop-up: "Google har brug for tilladelse")
4. Tjek i dit Google Sheet: der bør nu være 12 faner

---

## 5. Deploy som Web App

1. I Apps Script-editoren: klik **Deploy → Administrér deployments**
2. Klik **Ny deployment**
3. Vælg type: **Webapplikation**
4. Udfyld:
   - Beskrivelse: `LYG EK v8.2`
   - Udfør som: **Mig (din Google-konto)**
   - Hvem har adgang: **Alle**
5. Klik **Deploy**
6. **Kopiér Web App URL** — bruges i næste trin

> Vigtigt: Husk URL'en — den ser ud som:  
> `https://script.google.com/macros/s/LANG_STRENG/exec`

---

## 6. Opret Google OAuth Client ID

Bruges til admin-login via Google Sign-In.

1. Gå til [console.cloud.google.com](https://console.cloud.google.com)
2. Vælg (eller opret) et projekt
3. Gå til **APIs & Services → Credentials**
4. Klik **+ Opret legitimationsoplysninger → OAuth 2.0 klient-ID**
5. Programtype: **Webapplikation**
6. Autoriserede JavaScript-origins:
   - `https://DIT-BRUGERNAVN.github.io`
   - `http://localhost` (til lokal test)
7. Klik **Opret** — kopiér **Klient-ID**

---

## 7. Opdatér app.js og admin.html

### I `app.js` (linje ~40):

```javascript
scriptUrl:    'https://script.google.com/macros/s/LANG_STRENG/exec',
requestToken: 'DIT_REQUEST_TOKEN',  // Samme som i Script Properties
```

### I `admin.html` (toppen af `<script>`):

```javascript
const ADM_CFG = {
  scriptUrl:      'https://script.google.com/macros/s/LANG_STRENG/exec',
  requestToken:   'DIT_REQUEST_TOKEN',
  googleClientId: '123456789-abc.apps.googleusercontent.com',
};
```

> **Sikkerhed:** `requestToken` er i browserkoden, men Apps Script validerer den. `BREVO_API_KEY` og `HMAC_SECRET` er KUN i Script Properties — aldrig i browserkode.

---

## 8. Upload til GitHub Pages

1. Gå til dit GitHub-repository
2. Upload alle filer fra `lyg-v82/`-mappen:
   - `index.html`
   - `app.js`
   - `style.css`
   - `service-worker.js`
   - `manifest.json`
   - `admin.html`
   - `icons/` (mappen)
   - `images/` (mappen)
3. Aktivér GitHub Pages:
   - Repository Settings → Pages
   - Source: Deploy from a branch → `main` → `/ (root)`
4. Vent 2-3 minutter — appen er live på:  
   `https://DIT-BRUGERNAVN.github.io/REPO-NAVN/`

---

## 9. Test

### Offentlig app:
- [ ] Åbn GitHub Pages URL
- [ ] Appen indlæser uden fejl
- [ ] Arrangementer vises (hentes fra Google Sheets)
- [ ] Tilmelding virker — bekræftelsesmail modtages
- [ ] Venteliste virker

### Admin:
- [ ] Åbn `admin.html`
- [ ] Log ind med autoriseret Google-konto
- [ ] Opret et testanordning
- [ ] Send testpåminding

### PWA:
- [ ] Åbn på mobiltelefon i Chrome/Safari
- [ ] "Tilføj til startskærm" virker
- [ ] Offline: cached sider virker

---

## Fejlfinding

| Problem | Løsning |
|---------|---------|
| "Apps Script URL ikke konfigureret" | Indsæt Web App URL i `app.js` og `admin.html` |
| Tilmelding fejler med 403 | Tjek at Web App er deployed med "Hvem har adgang: Alle" |
| Admin-login virker ikke | Tjek Google OAuth Client ID og autoriserede origins |
| E-mails sendes ikke | Verificér `BREVO_API_KEY` i Script Properties |
| Tomme sheets | Kør `setupSheets()` igen fra Apps Script-editoren |

