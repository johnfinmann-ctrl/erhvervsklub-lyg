-- ================================================================
-- LYG Erhvervsklub – Push Notifications
-- Kør denne i Supabase Dashboard → SQL Editor
-- ================================================================

-- Tabel: push-subscriptions (én pr. enhed)
create table if not exists push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  endpoint      text not null unique,
  p256dh        text not null,
  auth          text not null,
  device_label  text,               -- valgfri: "Johns iPhone"
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Tabel: notifikationslog — forhindrer dubletter
create table if not exists push_notification_log (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid references push_subscriptions(id) on delete cascade,
  arrangement_id   text not null,   -- matcher ek_arr id i localStorage
  days_before      int  not null,   -- 14, 7 eller 3
  sent_at          timestamptz default now(),
  unique (subscription_id, arrangement_id, days_before)
);

-- Tabel: arrangementer (spejl af app-data — synkroniseres via admin)
create table if not exists arrangements (
  id          text primary key,      -- samme id som i app.js localStorage
  titel       text not null,
  dato        date not null,
  sted        text,
  beskrivelse text,
  aaben       boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Index for hurtig dato-søgning
create index if not exists idx_arrangements_dato on arrangements(dato);
create index if not exists idx_push_log_arr on push_notification_log(arrangement_id, days_before);

-- Row Level Security — kun service_role må skrive
alter table push_subscriptions      enable row level security;
alter table push_notification_log   enable row level security;
alter table arrangements            enable row level security;

-- Alle må læse (Edge Functions bruger service_role som omgår RLS)
-- Anon-brugere må indsætte subscriptions og arrangements
create policy "anon_insert_subscriptions" on push_subscriptions
  for insert to anon with check (true);

create policy "anon_insert_arrangements" on arrangements
  for insert to anon with check (true);

create policy "anon_upsert_arrangements" on arrangements
  for update to anon using (true);

-- Service role (Edge Functions) har fuld adgang via bypass RLS
