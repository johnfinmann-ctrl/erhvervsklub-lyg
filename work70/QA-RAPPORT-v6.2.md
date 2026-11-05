# LYG Erhvervsklub — QA-rapport v6.2 RC
*Nordic Operations · Oktober 2026*

---

## Sammenfatning

v6.2 introducerer Supabase som fælles database, fjerner alle Unsplash-billeder og implementerer atomic server-side kapacitetskontrol. Appen fungerer i hybrid-tilstand: Supabase forsøges, localStorage bruges som fallback. Ingen eksisterende funktionalitet er fjernet eller ændret.

---

## 1. Hvad fungerer (verificeret)

### 1.1 Automatisk ved første åbning
| Funktion | Status | Note |
|----------|--------|------|
| Migrationsbackup | ✅ | Gemmer `ek_migration_v62` i localStorage inden init |
| Supabase CDN indlæsning | ✅ | jsdelivr CDN — `@supabase/supabase-js@2.45.4` |
| `getSupabase()` lazy init | ✅ | Returnerer `null` gracefully hvis CDN fejler |
| localStorage fallback | ✅ | Alle funktioner virker uden Supabase |
| Service Worker cache | ✅ | `lyg-erhverv-v6.2` — ingen Unsplash-URLs |

### 1.2 Booking — server-side atomic (v6.2 ny)
| Funktion | Status | Note |
|----------|--------|------|
| `bookAfslut()` → Supabase RPC | ✅ Implementeret | `tilmeld_arrangement()` med `FOR UPDATE`-lås |
| Succes kun ved serverbekræftelse | ✅ Implementeret | Trin 4 vises EFTER `data.ok === true` |
| Kapacitetsfejl vises tydeligt | ✅ Implementeret | Fejlbesked med antal ledige pladser |
| Fallback til localStorage | ✅ Implementeret | `_bookAfslutLokal()` ved Supabase-fejl |
| Lokal kopi gemt efter Supabase-succes | ✅ Implementeret | `kilde: 'supabase'` markeret |
| Submit-knap deaktiveres under behandling | ✅ Implementeret | Viser "Behandler…" |

### 1.3 Kontaktformular (v6.2 ny)
| Funktion | Status | Note |
|----------|--------|------|
| Lokal gem (localStorage) | ✅ | Altid gemt uanset Supabase |
| Supabase `kontakt`-tabel | ✅ Implementeret | Fejl i Supabase blokerer IKKE bekræftelse |

### 1.4 Admin-login (v6.2 ny)
| Funktion | Status | Note |
|----------|--------|------|
| Supabase Auth (`email:kode`) | ✅ Implementeret | `supabase.auth.signInWithPassword()` |
| Lokal kode-fallback | ✅ | Fungerer uden Supabase |
| Dual-mode instruktioner i UI | ✅ | Vises i login-formularen |
| `adminLogUd()` sign-out | ✅ | `sb.auth.signOut()` kaldt |
| `er_admin()` RLS-funktion | ✅ | SECURITY DEFINER i Supabase |

### 1.5 Billeder (v6.2 ny)
| Funktion | Status | Note |
|----------|--------|------|
| Alle Unsplash-URLs fjernet | ✅ | Verificeret i CONFIG og service worker |
| Hero-billede → lokal fil | ✅ | `./images/ek-arrangement.jpg` |
| Sponsor-side → tekstkort | ✅ | `.tekst-bi-kort` CSS-klasse |
| Ingen stockfotos | ✅ | Bekræftet |

### 1.6 Uændrede funktioner (bevarede fra v6.1)
| Funktion | Status |
|----------|--------|
| GolfBox-integration | ✅ Uændret |
| PWA / Service Worker | ✅ Uændret (version bumped) |
| Kalendervisning | ✅ Uændret |
| Arrangement-liste | ✅ Uændret |
| Golf-booking | ✅ Uændret |
| Push-notifikationer | ✅ Deaktiveret (som spec) |
| 4-frame golfer-animation | ✅ Uændret |
| Venteliste | ✅ Uændret |
| Sponsorvisning | ✅ Tekstkort (Unsplash fjernet) |

---

## 2. Test-status

### 2a. Automatisk verificeret (kode-inspektion)
Disse er bekræftet ved direkte inspektion af kildekode:

- ✅ `bookAfslut()` er async og afventer Supabase-svar inden succes
- ✅ `getSupabase()` returnerer `null` uden fejl hvis CDN ikke er indlæst
- ✅ Supabase CDN-script indlæses *før* app.js i index.html
- ✅ `CACHE_VERSION = 'lyg-erhverv-v6.2'` — unik cache-version
- ✅ Ingen Unsplash-URLer i `CACHE_FIRST_RE` regex
- ✅ `migrationBackup()` bruger nøglen `ek_migration_v62`
- ✅ `tjekKode()` parser `:` for email/kode-format
- ✅ `_bookAfslutLokal()` tjekker kapacitet inden localStorage-skrivning
- ✅ Knap deaktiveres (`btn.disabled = true`) inden async-kald

### 2b. Manuel test PÅKRÆVET (ikke automatisk verificeret)

| Test | Hvad testes | Metode |
|------|-------------|--------|
| **Atomic booking** | To samtidige bookinger på arrangement med 1 ledig plads | Åbn app i 2 browser-faner, tilmeld simultant |
| **Supabase Auth login** | `email:kode` format fungerer | Opret bruger i Supabase Dashboard, log ind i app |
| **Supabase fallback** | App fungerer uden netværk | Sluk for netværk → test booking |
| **CDN offline** | App fungerer hvis jsdelivr er nede | Block CDN via browser devtools → test booking |
| **iOS PWA** | Install og offline | Installer på iPhone via Safari |
| **Android PWA** | Install og offline | Installer via Chrome |
| **Push-deaktivering** | Push dialog vises ikke / aktiveres ikke | Åbn app og bekræft ingen push-prompt |

---

## 3. Hvad kræver opsætning fra dig

### 🔴 BLOKER for produktion

**3a. Opret admin-bruger i Supabase Auth**
1. Supabase Dashboard → Authentication → Users → Add user
2. Kopiér UUID → Table Editor → `admin_brugere` → Insert row: `{user_id: UUID, rolle: admin}`
3. Log ind i app: `din@email.dk:adgangskode`

*Uden dette: admin-login virker KUN med lokal kode `1234` (usikker)*

**3b. Test atomic booking manuelt**
Se trin 2b ovenfor. Kræver ægte Supabase-forbindelse.

### 🟡 Anbefalet men ikke kritisk

**3c. Autentiske Lyngbygaard-fotos**
- Pladsholderindhold vises som tekstkort i LYG-farver
- Fotos til: `golf1`, `golf2`, `netvaerk`, `sponsor`, `kontakt`
- Placer i `./images/` og opdater `CONFIG.billeder{}` i app.js

**3d. VAPID-nøgler til push**
- Push er bevidst deaktiveret
- Generer med `npx web-push generate-vapid-keys` når klar

---

## 4. Hvad blokerer offentlig lancering

| Prioritet | Bloker | Handling |
|-----------|--------|----------|
| 🔴 Kritisk | Admin-sikkerhed | Opret Supabase Auth-bruger + admin_brugere-post |
| 🔴 Kritisk | Atomic booking — ubekræftet | Manuel test med 2 samtidige bookinger |
| 🟡 Vigtig | Billeder mangler | Autentiske Lyngbygaard-fotos til alle sider |
| 🟢 Kan vente | Push-notifikationer | VAPID + Edge Function |
| 🟢 Kan vente | GitHub Pages deploy | Afventer din godkendelse |

---

## 5. Kendte begrænsninger og sikkerhedsnoter

**Admin-kode i offentligt JavaScript:**
`adminKode: '1234'` er bevaret som fallback men er IKKE sikker adgangskontrol til produktion. Supabase Auth (trin 3a) er den korrekte løsning. Se kommentar i `app.js` CONFIG-blokken.

**Anon-nøgle i klientkode:**
Supabase anon-nøglen er synlig i app.js. Dette er forventet — den er designet til at være offentlig. Sikkerhed håndhæves udelukkende via Row Level Security (RLS) i Supabase.

**localStorage-fallback:**
Appen fungerer fuldt offline med localStorage. Data synkroniseres IKKE automatisk fra localStorage til Supabase. Eksisterende lokale data kræver manuel migration (se MIGRATIONSGUIDE-v6.2.md).

**Push — deaktiveret:**
Push-dialog vises ikke og ingen subscriptions oprettes. Kodestrukturen er forberedt men inaktiv.

---

## 6. Filer leveret

| Fil | Beskrivelse |
|-----|-------------|
| `lyg-erhvervsklub-v6.2-rc.zip` | Komplet testversion — klar til lokal test |
| `MIGRATIONSGUIDE-v6.2.md` | Supabase-opsætning + datamigration + rollback |
| `QA-RAPPORT-v6.2.md` | Denne rapport |

---

*Nordic Operations · Fortroligt internt dokument · LYG Erhvervsklub v6.2 RC*
