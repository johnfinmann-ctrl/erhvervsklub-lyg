# LYG Erhvervsklub – Supabase Push Opsætning

## Trin 1: Opret Supabase-projekt

1. Gå til https://supabase.com og log ind
2. Klik **New project**
3. Navn: `lyg-erhvervsklub`
4. Region: **Frankfurt (eu-central-1)** (tættest på DK)
5. Gem **Project URL** og **anon key** — de skal ind i app.js

## Trin 2: Kør SQL-migration

1. Gå til **SQL Editor** i Supabase Dashboard
2. Paste hele indholdet af `migrations/001_push_notifications.sql`
3. Klik **Run**

## Trin 3: Generér VAPID-nøgler

Kør én gang lokalt (kræver Node.js):

```bash
npx web-push generate-vapid-keys
```

Gem output — du får:
```
Public Key:  BNg... (lang base64-streng)
Private Key: abc... (kortere streng)
```

## Trin 4: Tilføj secrets til Edge Function

1. Gå til **Settings → Edge Functions → Secrets**
2. Tilføj disse tre:

| Navn | Værdi |
|---|---|
| `VAPID_PUBLIC_KEY` | Din public key fra trin 3 |
| `VAPID_PRIVATE_KEY` | Din private key fra trin 3 |
| `VAPID_EMAIL` | `mailto:info@lyg.dk` |

## Trin 5: Deploy Edge Function

```bash
# Installer Supabase CLI (hvis ikke installeret)
npm install -g supabase

# Log ind
supabase login

# Link til dit projekt (find ref i Dashboard URL)
supabase link --project-ref DIN_PROJECT_REF

# Deploy
supabase functions deploy send-push-notifications
```

Alternativt: opret funktionen manuelt i **Edge Functions** i dashboardet og paste koden fra `functions/send-push-notifications/index.ts`.

## Trin 6: Opsæt daglig cron

1. Gå til **Database → Cron Jobs** (pg_cron)
2. Klik **Create new cron job**
3. Navn: `send-push-daglig`
4. Cron-udtryk: `0 7 * * *` (kl. 07:00 UTC = 08:00 eller 09:00 dansk tid)
5. Command:

```sql
select net.http_post(
  url := 'https://DIN_PROJECT_REF.supabase.co/functions/v1/send-push-notifications',
  headers := '{"Authorization": "Bearer DIN_ANON_KEY"}'::jsonb
);
```

Erstat `DIN_PROJECT_REF` og `DIN_ANON_KEY` med dine værdier.

## Trin 7: Tilføj Supabase-URL til app.js CONFIG

I toppen af app.js under CONFIG, tilføj:

```javascript
supabaseUrl: 'https://DIN_PROJECT_REF.supabase.co',
supabaseAnon: 'DIN_ANON_KEY',
vapidPublic: 'DIN_VAPID_PUBLIC_KEY',
```

## Test

Manuel test af Edge Function:
1. Gå til **Edge Functions** i dashboardet
2. Find `send-push-notifications`
3. Klik **Invoke** (eller brug curl):

```bash
curl -X POST https://DIN_PROJECT_REF.supabase.co/functions/v1/send-push-notifications \
  -H "Authorization: Bearer DIN_ANON_KEY"
```

Forventet svar: `{"sendt": N, "log": [...]}`
