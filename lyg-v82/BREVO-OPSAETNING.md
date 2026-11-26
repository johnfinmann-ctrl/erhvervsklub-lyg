# Brevo-opsætning — LYG Erhvervsklub
_Transaktionsmails via LYG's egen Brevo-konto_

---

## 1. Opret Brevo-konto

1. Gå til [brevo.com](https://brevo.com)
2. Registrér med **LYG Erhvervsklubbens e-mailadresse** (fx `erhvervsklub@lyg.dk`)
3. Vælg **gratis plan** (300 e-mails/dag — tilstrækkeligt til erhvervsklubben)
4. Bekræft e-mailadressen

---

## 2. Verificér afsender-domæne

For at e-mails ikke havner i spam skal LYG's domæne verificeres.

1. I Brevo-dashboardet: gå til **Afsendere og domæner → Domæner**
2. Klik **Tilføj domæne** → skriv `lyg.dk`
3. Brevo viser DNS-poster (DKIM, SPF, DMARC)
4. Tilføj disse poster i LYG's DNS hos jeres domæneudbyder
5. Klik **Verificér** (kan tage op til 24 timer)

> **Vigtigt:** Brug `lyg.dk`-domænet, som I allerede ejer — ikke et nyt domæne.

---

## 3. Generér API-nøgle

1. I Brevo: klik på profilbilledet øverst til højre → **SMTP & API**
2. Klik på **API-nøgler**
3. Klik **Generér en ny API-nøgle**
4. Navngiv: `LYG Erhvervsklub Apps Script`
5. **Kopiér nøglen** — den vises kun én gang

---

## 4. Gem API-nøgle i Apps Script

**Aldrig i kode eller GitHub — kun i Script Properties.**

1. Åbn Apps Script-projektet
2. Klik **Projekt → Indstillinger → Script Properties**
3. Tilføj: `BREVO_API_KEY` = din nøgle

---

## 5. Test e-mail-afsendelse

Kald denne funktion direkte fra Apps Script-editoren:

```javascript
function testBrevoMail() {
  const result = _sendBrevoMail({
    to:      { name: 'Test Admin', email: 'DIN_EMAIL@eksempel.dk' },
    subject: 'Test fra LYG Erhvervsklub Apps Script',
    html:    '<p>Testmail virker! 🎉</p>',
  });
  Logger.log('Resultat:', result);
}
```

Kør `testBrevoMail` — tjek loggen og din indbakke.

---

## 6. E-mail-typer der sendes automatisk

| Type | Trigger | Modtager |
|------|---------|----------|
| Tilmeldingsbekræftelse | Vellykket booking | Deltager + BCC admin |
| Afmeldingskvittering | Afmelding via link | Deltager |
| Venteliste-bekræftelse | Sat på venteliste | Deltager |
| Ledig plads fra venteliste | Nogen afmelder sig | Første på ventelisten |
| Påminding | Manuel (admin) eller auto 2 dage før | Alle tilmeldte |
| Admin-notifikation | Ny tilmelding | Admin-adresse |

---

## 7. Automatisk daglig påminding

Opsæt en trigger i Apps Script til `sendDagligePaamindelser()`:

1. I Apps Script: klik **Ur-ikon** (Triggers)
2. Klik **+ Tilføj trigger**
3. Vælg funktion: `sendDagligePaamindelser`
4. Hændelseskilde: **Tidsbaseret**
5. Tidsbaseret type: **Daglig timer**
6. Tidspunkt: **Kl. 08.00–09.00**
7. Klik **Gem**

Funktionen sender automatisk påmindelser 2 dage før hvert arrangement.

---

## 8. Grænser på gratis Brevo-plan

- 300 e-mails/dag
- Ubegrænsede kontakter
- Brevo-logo i e-mailbunden (kan fjernes på betalingsplan)

For LYG Erhvervsklub med typisk 10-50 arrangementer/år er gratis-planen tilstrækkelig.

---

## Bemærk om testmiljø

Under opsætning og test: **send KUN til dine egne e-mailadresser**.  
Brug ikke rigtige medlemsadresser til test.  
Produktionsbrug starter, når alt er testet og verificeret.

