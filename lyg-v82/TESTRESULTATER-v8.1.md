# Testresultater — LYG Erhvervsklub v8.1
_Dato: 2026-11-24_

## Statisk kodegennemgang (automatisk)

### ✅ Sikkerhed

| Test | Resultat |
|------|----------|
| Hardkodet PIN `1234` i app.js | ✅ Fjernet — `CONFIG.adminKode` eksisterer ikke |
| Hardkodet PIN i admin.html | ✅ Fjernet — `DEF_PIN`, `PIN_KEY`, `getPin()` fjernet |
| `_bookAfslutLokal()` fallback | ✅ Fjernet — catch viser ærlig fejlmeddelelse |
| Brevo API-nøgle i browserkode | ✅ Ikke fundet i nogen frontend-fil |
| `adminKode` i CONFIG | ✅ Ikke til stede |
| `getKode()` returnerer fallback-PIN | ✅ Returnerer nu `''` |

### ✅ Service Worker

| Test | Resultat |
|------|----------|
| Cache-filter sikkert | ✅ `k.startsWith('lyg-erhverv-')` — rammer kun egne caches |
| `CACHE_VERSION` opdateret | ✅ `lyg-erhverv-v8.1` |
| Precache-URLs opdateret | ✅ Alle `?v=8.1` |

### ✅ Push-dialog

| Test | Resultat |
|------|----------|
| `#push-modal` i HTML | ✅ Fjernet |
| Push-modal CSS | ✅ Fjernet |
| `visPushDialog()` i app.js | ✅ Fjernet (begge forekomster) |
| `visPushDialog()` kaldt i boot | ✅ Fjernet |

### ✅ Arrangementer

| Test | Resultat |
|------|----------|
| `STD_ARR` er tom | ✅ `const STD_ARR = []` |
| 2026-arrangementer i arkiv | ✅ 11 arrangementer i `STD_ARR_ARKIV_2026` |
| Arkiv-migration i `init()` | ✅ Kører én gang, markeres med `ek_v81_arkiv` |
| Opdigtede 2027-arrangementer | ✅ Ingen — popup og infobjælke bruger tekst |

### ✅ Versionsstyring

| Fil | Version |
|-----|---------|
| service-worker.js | v8.1 (header + CACHE_VERSION) |
| app.js | v8.1 (header + footer) |
| index.html | v8.1 (kommentar + asset-queries) |
| style.css | v8.1 (header) |
| admin.html | v8.1 (titel + script-kommentar) |

### ✅ Ikoner

| Test | Resultat |
|------|----------|
| `icon-192.png` genereret | ✅ Fra lyg-logo.png, 192×192, grøn baggrund |
| `icon-512.png` genereret | ✅ Fra lyg-logo.png, 512×512, grøn baggrund |

---

## Manuel test anbefalet

Følgende kræver visuel/funktionel test i browser:

| Test | Status | Note |
|------|--------|------|
| Golf-bold animation | ⏳ Afventer | Trigger: 1,5s efter intro-start |
| Ken Burns hero | ⏳ Afventer | Visuel test i Safari/Chrome |
| Sæson 2027-popup | ⏳ Afventer | Skal vises når `ek_arr` er tom |
| Infobjælke 2027 | ⏳ Afventer | Marquee-animation 18s |
| Arkiv-migration | ⏳ Afventer | Ryd localStorage, indlæs appen |
| Booking fejlhåndtering | ⏳ Afventer | Test offline-scenarie |
| Admin.html-login | ⏳ Afventer | Skal vise "kræver Supabase Auth" |
| Service worker cache | ⏳ Afventer | Verificér at kun lyg-erhverv-* caches slettes |

---

## Testmiljø-krav

- Brug kun testmiljø til Supabase-tilmeldinger.
- Send ikke rigtige e-mails til medlemmer.
- Test på iOS Safari (PWA), Android Chrome, og desktop Chrome.
