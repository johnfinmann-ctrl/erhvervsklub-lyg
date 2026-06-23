# Lyngbygaard Erhvervsklub — PWA v2

## Deploy til GitHub Pages (trin-for-trin)

### 1. Opret repository
- Gå til github.com og log ind som `johnfinmann-ctrl`
- Klik **New repository**
- Navn: `erhvervsklub-lyg`
- Synlighed: **Public**
- Klik **Create repository**

### 2. Upload filer
Upload ALLE filer i denne mappe — inklusive `icons/` mappen:
```
index.html
style.css
app.js
manifest.json
service-worker.js
icons/icon-192.png
icons/icon-512.png
README.md
```

### 3. Aktiver GitHub Pages
- Gå til **Settings → Pages**
- Under *Source*: vælg **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**
- Klik **Save**

### 4. Din app er live på:
```
https://johnfinmann-ctrl.github.io/erhvervsklub-lyg/
```

### 5. Tilknyt eget domæne (valgfrit)
- Opret en fil `CNAME` med indhold: `erhverv.lyg.dk`
- Peg DNS CNAME-record til: `johnfinmann-ctrl.github.io`

---

## Konfiguration

Åbn `app.js` — øverst finder du `const CONFIG = {...}` med:
- Klubnavn, adresse, telefon, email
- GolfBox URL
- Hero-tekst og -billede
- Admin-kode (standard: `1234`)
- Golf-pakker, sponsor-fordele, om-tekst

**Ret kun her — ikke andre steder i filen.**

## Admin-panel

Admin-knap vises altid i bundmenuen (⚙️)  
Standard kode: **1234**  
Kan ændres i Admin → Indstillinger

## Al data gemmes i localStorage

- Ingen backend, ingen server, ingen abonnement
- Data lever i brugerens browser
- Brug Admin → Backup til at eksportere/importere data regelmæssigt

---
Bygget af Nordic Operations · nordicoperations.dk
