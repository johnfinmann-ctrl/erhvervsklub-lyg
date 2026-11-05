# LYG Erhvervsklub — Migrationsguide v6.2
*Nordic Operations · Oktober 2026*

---

## Oversigt

v6.2 introducerer Supabase som fælles database for alle brugere. Eksisterende lokale data bevares. Denne guide beskriver, hvad du selv skal gøre, i hvilken rækkefølge.

---

## 1. Hvad er automatisk (kræver ingen handling)

| Hvad | Status |
|------|--------|
| Migrationsbackup af eksisterende localStorage | ✅ Automatisk ved første åbning (gemt som `ek_migration_v62`) |
| Supabase-klient indlæses | ✅ Via CDN i index.html |
| Booking forsøger Supabase RPC automatisk | ✅ Fallback til localStorage ved fejl |
| Kontaktformular gemmer lokalt + Supabase | ✅ Supabase er bonus — lokal kopi altid gemt |
| Alle Unsplash-billeder fjernet | ✅ Tekstkort vises i stedet |

---

## 2. Supabase-opsætning (gøres én gang af dig)

### 2a. Bekræft at databasen er oprettet

Supabase-projekt: **lyg-erhvervsklub**  
URL: `https://csjsauqjfmknqmmjodqp.supabase.co`  
Region: `eu-central-1`

Tabeller, RLS-politikker og `tilmeld_arrangement()`-funktionen er allerede oprettet af Claude.

**Tjek:** Log ind på [supabase.com/dashboard](https://supabase.com/dashboard) → dit projekt → Table Editor. Du skal se: `arrangementer`, `tilmeldinger`, `venteliste`, `golf_booking`, `kontakt`, `sponsorer`, `golf_pakker`, `admin_brugere`.

---

### 2b. Opret admin-bruger (PÅKRÆVET for sikker admin-adgang)

1. Gå til Supabase Dashboard → **Authentication** → **Users**
2. Klik **Invite user** (eller **Add user**)
3. Indtast din email og vælg en stærk adgangskode
4. Kopiér det nye bruger-ID (UUID)
5. Gå til **Table Editor** → `admin_brugere`
6. Klik **Insert row** → indsæt:
   ```
   user_id: <dit UUID>
   rolle: admin
   ```

**Derefter logger du ind i appen som:**  
`din@email.dk:dinAdgangskode`  
(i det ene admin-login-felt, adskilt med `:`)

> ⚠️ Før dette er gjort, fungerer admin-login kun med lokal kode `1234`.  
> Den lokale kode er **ikke sikker til produktion**.

---

### 2c. Verificér atomic booking

Åbn appen i to faner simultant. Tilmeld det samme arrangement med begge faner samtidigt til et arrangement med fx 1 ledig plads.

Forventet resultat:
- Én fane viser kvittering ✅  
- Anden fane viser fejlbesked: "Ingen ledige pladser" ❌  

Hvis begge viser kvittering, er `tilmeld_arrangement()`-funktionen ikke aktiv — check at migrationen `initial_schema` er kørt i Supabase.

---

## 3. Datamigration: localStorage → Supabase

Eksisterende data i localStorage (arrangementer, tilmeldinger, etc.) skal **manuelt** flyttes til Supabase, hvis du ønsker fuld synkronisering.

### Metode A: Admin backup-eksport

1. Log ind i app → Admin → Backup → **Download backup**
2. Du får en JSON-fil med alle lokale data

### Metode B: Manuel import via Supabase SQL

```sql
-- Indsæt tilmelding manuelt (eksempel)
INSERT INTO tilmeldinger (arrangement_id, navn, virksomhed, email, telefon, antal)
VALUES ('a1', 'Lars Larsen', 'Larsen A/S', 'lars@larsen.dk', '12345678', 2);
```

### Dublethåndtering

`tilmeld_arrangement()` bruger `FOR UPDATE`-lås og tjekker kapacitet atomisk. Dubletter kan opstå ved manuel import — tjek `tilmeldinger`-tabellen for identiske email+arrangement_id kombinationer.

```sql
-- Find potentielle dubletter
SELECT arrangement_id, email, COUNT(*) 
FROM tilmeldinger 
GROUP BY arrangement_id, email 
HAVING COUNT(*) > 1;
```

### Rollback-procedure

Hvis noget går galt:

```sql
-- Supabase: slet alle tilmeldinger og start forfra
TRUNCATE tilmeldinger CASCADE;
```

Lokale data er **altid bevaret** i localStorage (nøglen `ek_tilm`). Appen kan til enhver tid køre fuldt offline med lokal data som fallback.

---

## 4. Push-notifikationer (IKKE klar til produktion)

Push er deaktiveret i v6.2. For at aktivere:

1. **Generer VAPID-nøgler:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Indsæt i app.js CONFIG:**
   ```js
   vapidPublic: 'din_public_vapid_nøgle'
   ```

3. **Opret Supabase Edge Function** til at sende push 14/7/3 dage før arrangementer. Se Supabase Docs → Edge Functions.

4. **Test** på enkelt bruger inden aktivering for alle.

---

## 5. Blokerer offentlig lancering

| Bloker | Hvad mangler |
|--------|-------------|
| 🔴 Admin-sikkerhed | Supabase Auth + admin_brugere oprettet (trin 2b) |
| 🔴 Atomic booking test | Manuel test med to samtidige bookinger |
| 🟡 Push-notifikationer | VAPID-nøgler + Edge Function (kan vente) |
| 🟡 Billeder | Autentiske Lyngbygaard-fotos til golf1/golf2/netvaerk/sponsor/kontakt |

---

*Nordic Operations · Fortroligt internt dokument · LYG Erhvervsklub v6.2*
