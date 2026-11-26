# LYG Erhvervsklub — Changelog v8.1
_Udgivet: 2026-11-24_

## Oversigt
Version 8.1 er en vedligeholdelses- og sikkerhedsversion. Ingen nye
arrangementer tilføjes — sæson 2027 præsenteres som "offentliggøres snart".

---

## Sikkerhedsrettelser (kritiske)

### 1. Hardkodet PIN fjernet fra app.js
- `CONFIG.adminKode: '1234'` er fjernet fra konfigurationsobjektet.
- `getKode()` returnerer nu `''` i stedet for at falde tilbage til PIN.
- `DB.set('ek_kode', CONFIG.adminKode)` i `init()` er erstattet med kommentar.
- **Virkning:** Ingen hardkodet adgangskode eksisterer i browserkoden.

### 2. admin.html — PIN-auth erstattet med Supabase Auth-reference
- Titel rettet: "Admin — Finnes Entreprise" → "LYG Erhvervsklub Admin"
- Login-screen viser nu tydelig besked om Supabase Auth-krav.
- `PIN_KEY`, `DEF_PIN`, `getPin()`, `changePIN()` fjernet fra koden.
- PIN-skift-sektion i admin-panelet erstattet med sikkerhedsoplysning.
- **TODO (v9):** Implementér Supabase Auth login-flow med RLS-politikker.

### 3. Falsk tilmeldingsbekræftelse fjernet
- `_bookAfslutLokal()` (localStorage-fallback ved Supabase-fejl) er slettet.
- Fejl-catch i `bookAfslut()` viser nu eksplicit: *"Din tilmelding er IKKE registreret."*
- **Virkning:** Brugeren modtager aldrig en falsk bekræftelse.

### 4. Service worker — kun egne caches slettes
- Cache-filter ændret fra `k !== CACHE_VERSION`
  til `k.startsWith('lyg-erhverv-') && k !== CACHE_VERSION`.
- **Virkning:** Andre apps på samme GitHub Pages-domæne påvirkes ikke.

---

## Nye funktioner og forbedringer

### 5. Golf-bold intro-animation
- Golfbold med LYG-logo ruller ind fra venstre i intro-overlay efter 1,5s.
- CSS-animation: `boldRuller` + `boldRotation` (spin under rulning).
- Respekterer `prefers-reduced-motion` (skjult hvis aktiveret).

### 6. Ken Burns hero-billede
- `#intro-overlay` bruger nu `klubhus-hero.jpg` med Ken Burns-zoom.
- Billedet dækker hele overlay med `object-fit: cover`.

### 7. Sæson 2027 — popup og infobjælke
- Når der ikke er kommende arrangementer, vises automatisk:
  - **Popup:** "Vi glæder os til sæson 2027 — Programmet offentliggøres snart."
    (vises én gang pr. installation, nøgle: `popup_saeson2027_v1`)
  - **Infobjælke:** "Vi glæder os til sæson 2027 · Programmet offentliggøres snart"
    (marquee, 18s animation)
- Ingen opdigtede arrangementer for 2027.

### 8. Push-dialog fjernet
- `visPushDialog()`, `accepterPush()`, `afvisPush()` fjernet fra `app.js`.
- `#push-modal` HTML og CSS fjernet.
- Push-notifikationer genindføres først, når backend er etableret og testet.
- Brevo er primær kommunikationskanal.

### 9. 2026-arrangementer arkiveret
- 11 standardarrangementer fra 2026 er markeret `status:'afholdt', aaben:false`.
- `STD_ARR_ARKIV_2026` migrerer data til `ek_arr_arkiv` ved første start (v8.1-migration).
- Migrationen kører én gang og markeres med `ek_v81_arkiv: true`.
- Aktive arrangementer fra 2026 ryddes af `ek_arr` (men bevares i arkiv).
- **Ingen data slettes.**

### 10. App-ikoner genereret
- `icons/icon-192.png` og `icons/icon-512.png` genereret fra `lyg-logo.png`.
- Grøn baggrund (`#0d2b1a`), logo centreret med 12% padding.

---

## Tekniske rettelser

### 11. CSS-deduplikation (delvis)
- Push-modal CSS fjernet (47 linjer).
- Golf-bold animation CSS tilføjet (~40 linjer).
- Duplikerede `.hero-anim` og `.hero-topbar` er identificeret men ikke fjernet
  (lavt risikoniveau — tilføjes i v8.2 efter visuel test).

### 12. Versionsopdatering
- `CACHE_VERSION`: `lyg-erhverv-v8.0` → `lyg-erhverv-v8.1`
- Precache-URLs: `?v=8.0` → `?v=8.1`
- Version-kommentarer i alle filer opdateret.

---

## Hvad er IKKE ændret

- Supabase-konfiguration og produktionsdatabase er ikke rørt.
- Ingen e-mails sendt til medlemmer.
- GitHub er ikke opdateret (leveringen er en ZIP-pakke).
- Brevo API-nøgler er ikke i browserkoden.

---

## Fase 3 — Forslag til næste version

1. **Supabase Auth** — Implementér rigtigt login i admin.html med RLS-politikker.
2. **Push-notifikationer** — Genindtfør via Brevo eller Web Push API, kun med serverbackend.
3. **2027-program** — Tilføj reelle arrangementer, når de er fastlagt.
4. **CSS-deduplikation** — Fjern duplikerede `.hero-anim`, `.hero-topbar` m.fl.
5. **Oprydning af work-mapper** — Se `SLETTELISTE-v8.1.md`.
6. **Performance** — Overvej lazy loading af golfer-frames og hero-billede.

---

## Mappestruktur til sletning (efter verifikation)

Se `SLETTELISTE-v8.1.md`.
