// ================================================================
// LYG Erhvervsklub — Supabase Edge Function
// Navn: send-push-notifications
//
// Kørsel: daglig cron via Supabase Dashboard → Database → Cron
// Cron-udtryk: 0 7 * * *  (kl. 07:00 UTC hver dag)
//
// Kræver secrets i Supabase Dashboard → Settings → Edge Functions:
//   VAPID_PUBLIC_KEY   — genereres med web-push npm-pakke
//   VAPID_PRIVATE_KEY  — genereres med web-push npm-pakke
//   VAPID_EMAIL        — fx mailto:info@lyg.dk
// ================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

webpush.setVapidDetails(
  Deno.env.get('VAPID_EMAIL')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

const DAGE_FØR = [14, 7, 3]

Deno.serve(async (_req) => {
  try {
    const i_dag   = new Date()
    const resultater: string[] = []

    /* Hent alle åbne fremtidige arrangementer */
    const { data: arrangementer, error: arrErr } = await supabase
      .from('arrangements')
      .select('id, titel, dato, sted')
      .eq('aaben', true)
      .gte('dato', i_dag.toISOString().split('T')[0])

    if (arrErr) throw arrErr

    /* Hent alle aktive push-subscriptions */
    const { data: subscriptions, error: subErr } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')

    if (subErr) throw subErr
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ besked: 'Ingen subscriptions' }), { status: 200 })
    }

    for (const arr of arrangementer ?? []) {
      const arrDato   = new Date(arr.dato + 'T12:00:00')
      const diffDage  = Math.round((arrDato.getTime() - i_dag.getTime()) / (1000 * 60 * 60 * 24))

      if (!DAGE_FØR.includes(diffDage)) continue

      const payload = JSON.stringify({
        title: 'LYG Erhvervsklub',
        body:  `${arr.titel} er om ${diffDage} dag${diffDage > 1 ? 'e' : ''}.${arr.sted ? ' · ' + arr.sted : ''}`,
        data:  { arrangementId: arr.id, url: './' },
        icon:  './icons/icon-192.png',
        badge: './icons/icon-192.png'
      })

      for (const sub of subscriptions) {
        /* Tjek om denne notifikation allerede er sendt */
        const { data: logEntry } = await supabase
          .from('push_notification_log')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('arrangement_id', arr.id)
          .eq('days_before', diffDage)
          .maybeSingle()

        if (logEntry) continue   /* Allerede sendt — skip */

        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )

          /* Log vellykket afsendelse */
          await supabase.from('push_notification_log').insert({
            subscription_id: sub.id,
            arrangement_id:  arr.id,
            days_before:     diffDage
          })

          resultater.push(`✅ ${arr.titel} → ${diffDage}d → ${sub.endpoint.slice(-20)}`)
        } catch (pushErr: any) {
          /* 410 Gone = subscription ugyldig — slet den */
          if (pushErr?.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
            resultater.push(`🗑 Slettet ugyldig subscription: ${sub.endpoint.slice(-20)}`)
          } else {
            resultater.push(`❌ Fejl: ${pushErr?.message}`)
          }
        }
      }
    }

    return new Response(JSON.stringify({ sendt: resultater.length, log: resultater }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ fejl: err.message }), { status: 500 })
  }
})
