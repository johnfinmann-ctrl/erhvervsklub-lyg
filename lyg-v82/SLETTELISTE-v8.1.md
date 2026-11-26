# Sletteliste — LYG Erhvervsklub v8.1
_Verificér afhængigheder, inden mapperne slettes fra GitHub._

## Mapper der kan slettes (forslag)

Følgende mapper er identificeret som formodentlig forældede work-mapper.
**Slet dem IKKE uden at verificere at ingen filer refereres fra aktive filer.**

| Mappe | Vurdering | Verifikation nødvendig |
|-------|-----------|----------------------|
| `work52/` | Gammel work-mappe | Tjek om filer refereres fra index.html/app.js |
| `work70/` | Gammel work-mappe | Tjek om filer refereres fra index.html/app.js |
| `ek47/` | Formodentlig gammel version | Tjek om assets bruges |
| `ek48/` | Formodentlig gammel version | Tjek om assets bruges |
| `ek50/` | Formodentlig gammel version | Tjek om assets bruges |
| `lyg-ek43/` | Formodentlig gammel version | Tjek om assets bruges |
| `pwa/` | Verificér indhold | Evt. duplikat af service-worker/manifest |
| `seo/` | Verificér indhold | Evt. gammel SEO-konfiguration |
| `supabase/` | Verificér indhold | Kan indeholde migrations der stadig bruges |

## Filer der er verificerede i brug

Følgende filer/mapper MÅ IKKE slettes:

- `index.html` — Hoved-app
- `app.js` — Hoved-logik
- `style.css` — Hoved-stylesheet
- `service-worker.js` — PWA cache
- `manifest.json` — PWA manifest
- `admin.html` — Admin-panel
- `icons/` — App-ikoner (nyregenererede i v8.1)
- `images/` — Alle billeder brugt i appen
- `assets/` — Verificér indhold (kan indeholde logo m.m.)
- `config/` — Verificér indhold
- `css/` — Admin-stylesheet (refereres fra admin.html)
- `js/` — Verificér indhold

## Procedure

1. For hver mappe i slettelisten: kør `grep -r "work52\|ek47\|..." index.html app.js style.css`
2. Hvis ingen referencer: flyt til `_arkiv/` midlertidigt frem for direkte sletning
3. Test appen i 1 uge
4. Slet `_arkiv/` hvis ingen fejl opstår

## Bemærk

- Sletning fra GitHub fjerner filerne fra **alle** installerede apps ved næste service worker-opdatering.
- Verificér at service worker's `PRECACHE_URLS` ikke inkluderer mapper/filer der slettes.
- Slet aldrig `ek_arr_arkiv`-data fra Supabase eller localStorage.
