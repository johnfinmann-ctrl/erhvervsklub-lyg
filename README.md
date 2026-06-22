# Lyngbygaard Erhvervsklub — PWA App

Mobil PWA-app til Lyngbygaard Golfs Erhvervsklub.

## Indhold

- `index.html` — Hoved-HTML-fil
- `style.css` — Al styling
- `app.js` — Al logik + konfiguration
- `manifest.json` — PWA-manifest
- `service-worker.js` — Offline-understøttelse
- `icons/` — App-ikoner

## Deploy til GitHub Pages

1. Opret nyt repository på GitHub (fx `lyg-erhvervsklub`)
2. Upload alle filer til repository
3. Gå til **Settings → Pages**
4. Under *Source*: vælg **main branch / root**
5. App er live på: `https://[dit-brugernavn].github.io/lyg-erhvervsklub/`

## Tilknyt eget domæne

1. Tilføj en fil `CNAME` med domænet (fx `erhverv.lyg.dk`)
2. Peg DNS CNAME-record mod `[dit-brugernavn].github.io`

## Konfiguration

Åbn `app.js` — øverst finder du blokken `const CONFIG = {...}` med:

- Klubnavn, tagline, adresse, telefon, email
- Admin-kode (standard: `1234`)
- Farver, hero-tekst og -billede
- Kontaktpersoner, golf-pakker, sponsorfordele

## Admin-panel

Admin-knap: altid synlig i bundnavigationen (⚙️)  
Standard adgangskode: **1234**  
Koden kan ændres i Admin → Indstillinger.

## Data

Al data gemmes i browserens `localStorage`.  
Ingen backend, ingen server, ingen abonnement.

---
Bygget af Nordic Operations · nordicoperations.dk
