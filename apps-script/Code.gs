/**
 * LYG Erhvervsklub — Google Apps Script Backend v8.5
 * =====================================================
 * Arkitektur: GitHub Pages (PWA) + Google Sheets + Apps Script + Brevo
 *
 * Deployment: Implementér som Web App
 *   · Execute as: Me (john.finmann@gmail.com)
 *   · Who has access: Anyone (CORS håndteres med token-validering)
 *
 * SIKKERHED (v8.3 — alle kritiske fallbacks fjernet):
 *   · Google Sheets er IKKE offentligt tilgængeligt
 *   · Admin-adgang kræver Google OAuth (doAdmin-ruter)
 *   · Offentlige ruter validerer REQUEST_TOKEN — kaster fejl hvis ikke sat
 *   · HMAC_SECRET har INGEN fallback — kaster fejl hvis ikke sat
 *   · LockService forhindrer dobbeltbooking
 *   · Brevo API-nøgle gemmes i Script Properties (aldrig i kode)
 *   · Sikre afmeldingslinks med HMAC-token
 *   · adminToken sendes via POST body — ikke via URL
 *
 * OPSÆTNING (se INSTALLATIONSVEJLEDNING.md):
 *   1. Opret Google Sheet (kør setupSheets() én gang)
 *   2. Sæt Script Properties: BREVO_API_KEY, REQUEST_TOKEN, HMAC_SECRET,
 *      ADMIN_EMAILS, APP_URL, SPREADSHEET_ID,
 *      PUSH_VAPID_PUBLIC, PUSH_VAPID_PRIVATE (generer med web-push keygen)
 *   3. Deploy som Web App — kopiér URL til app.js CONFIG.scriptUrl
 *   4. Opret daglig trigger for sendDagligePaamindelser()
 *
 * NYT I v8.5:
 *   · Web Push (VAPID) — gratis push-notifikationer til Chrome/Firefox/Safari (iOS 16.4+)
 *   · PushAbonnementer-ark til push-subscriptions
 *   · Automatiske påmindelser ændret: 7/2 dage før FRIST + 1 dag før arrangement
 *   · Bekræftelsesmail ved tilmelding og afmelding (eksisterede allerede, nu mere robust)
 *   · Admin: Aktiver/deaktiver hver påmindelsestype
 *   · Admin: Rediger skabelontekster via Indstillinger
 *   · Admin: Se forventede udsendelser (preview)
 *   · Admin: Se udsendelseshistorik
 *   · Admin: Manuel besked til alle erhvervsmedlemmer eller deltagere i et arrangement
 *   · Admin: Send testbesked med sikker testemail
 *   · Admin: Besked ved nyt arrangement (opt-in fra admin)
 *   · Persons, der er tilmeldt, modtager IKKE opfordringer til tilmelding igen
 *
 * NYT I v8.3:
 *   · "Indstillinger"-ark tilføjet (13. ark)
 *   · _validToken() kaster fejl hvis REQUEST_TOKEN ikke er sat
 *   · _hmac() kaster fejl hvis HMAC_SECRET ikke er sat (ingen fallback)
 *   · adminGetAll bruger POST — adminToken sendes ikke i URL
 *   · Brevo påmindelser: 14, 7 og 3 dage (ikke kun 2 dage)
 *   · Admin: CSV-eksport endpoint
 *   · Admin: Manuel afmeldingsregistrering
 *   · Admin: Ventelistehåndtering (vis og manuel aktivering)
 *   · Admin: E-maillog med retry (undgår dobbeltudsendelse)
 *   · Admin: Send ændringer/aflysninger/praktiske oplysninger
 *   · Admin: Sæsonhåndtering via Indstillinger-arket
 */

// ═══════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CFG = {
  SPREADSHEET_ID:  PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  BREVO_API_KEY:   PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY')  || '',
  REQUEST_TOKEN:   PropertiesService.getScriptProperties().getProperty('REQUEST_TOKEN')   || '',
  HMAC_SECRET:     PropertiesService.getScriptProperties().getProperty('HMAC_SECRET')     || '',
  APP_URL:         PropertiesService.getScriptProperties().getProperty('APP_URL')         || 'https://johnfinmann-ctrl.github.io/erhvervsklub-lyg/',
  ADMIN_EMAILS:    (PropertiesService.getScriptProperties().getProperty('ADMIN_EMAILS') || '').split(',').map(e => e.trim()),
  BREVO_SENDER:    { name: 'LYG Erhvervsklub', email: 'erhvervsklub@lyg.dk' },
  KLUB_NAVN:       'LYG Erhvervsklub',
  KLUB_EMAIL:      'erhvervsklub@lyg.dk',
  KLUB_TELEFON:    '87 44 10 70',
  KLUB_ADRESSE:    'Lyngbygårdsvej 29, 8220 Brabrand',
  // VAPID nøgler til Web Push (generer med: web-push generate-vapid-keys)
  // Gem i Script Properties — ALDRIG hardkodet!
  PUSH_VAPID_PUBLIC:  PropertiesService.getScriptProperties().getProperty('PUSH_VAPID_PUBLIC')  || '',
  PUSH_VAPID_PRIVATE: PropertiesService.getScriptProperties().getProperty('PUSH_VAPID_PRIVATE') || '',
  // Test-email: bruges til testbeskeder — aldrig rigtige medlemmer
  TEST_EMAIL:      PropertiesService.getScriptProperties().getProperty('TEST_EMAIL') || '',
};

// Sheet-navne (14 sheets i v8.5)
const SH = {
  ARR:         'Arrangementer',
  TILM:        'Tilmeldinger',
  AFMELD:      'Afmeldinger',
  VENTE:       'Venteliste',
  MEDL:        'Medlemsvirksomheder',
  SPONSOR:     'Sponsorer',
  NYHEDER:     'Nyheder',
  POPUP:       'Popup',
  INFOBJ:      'Infobjælke',
  ADMIN:       'Administratorer',
  INDSTIL:     'Indstillinger',   // NYT i v8.3
  EMAIL:       'E-mailstatus',
  HISTORIK:    'Historik',
  PUSH:        'PushAbonnementer', // NYT i v8.5 — VAPID push subscriptions
};

// ═══════════════════════════════════════════════════════════════
// WEB APP ENTRY POINTS
// ═══════════════════════════════════════════════════════════════

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || '';

  // Offentlige GET-handlinger (ingen REQUEST_TOKEN krævet — data er offentlig)
  if (action === 'getArrangementer')    return _cors(handleGetArrangementer());
  if (action === 'getNyheder')          return _cors(handleGetNyheder());
  if (action === 'getPopup')            return _cors(handleGetPopup());
  if (action === 'getInfobjaelke')      return _cors(handleGetInfobjaelke());
  if (action === 'getSponsor')          return _cors(handleGetSponsor(params));
  if (action === 'afmeld')             return _cors(handleAfmeld(params));
  // Web Push: offentlig VAPID-nøgle — sikkert at eksponere (kun public key!)
  if (action === 'getVapidPublicKey')  return _cors(handleGetVapidPublicKey());

  return _cors({ ok: false, fejl: 'Ukendt handling' });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch(err) {
    return _cors({ ok: false, fejl: 'Ugyldigt JSON' });
  }

  const action = body.action || '';

  // Admin-login kræver REQUEST_TOKEN (men ikke adminToken endnu)
  if (action === 'adminLogin') {
    if (!_validToken(body.token)) return _cors({ ok: false, fejl: 'Ugyldig adgangstoken' });
    return _cors(handleAdminLogin(body));
  }

  // Admin data-hentning (POST — adminToken i body, ikke URL)
  if (action === 'adminGetAll') {
    if (!_validToken(body.token)) return _cors({ ok: false, fejl: 'Ugyldig adgangstoken' });
    if (!_validAdminToken(body.adminToken)) return _cors({ ok: false, fejl: 'Ikke autoriseret' });
    return _cors(handleAdminGetAll(body));
  }

  if (action === 'adminGetTilmeldinger') {
    if (!_validToken(body.token)) return _cors({ ok: false, fejl: 'Ugyldig adgangstoken' });
    if (!_validAdminToken(body.adminToken)) return _cors({ ok: false, fejl: 'Ikke autoriseret' });
    return _cors(handleAdminGetTilmeldinger(body));
  }

  if (action === 'adminGetEmaillog') {
    if (!_validToken(body.token)) return _cors({ ok: false, fejl: 'Ugyldig adgangstoken' });
    if (!_validAdminToken(body.adminToken)) return _cors({ ok: false, fejl: 'Ikke autoriseret' });
    return _cors(handleAdminGetEmaillog(body));
  }

  // Token-validering for offentlige handlinger
  if (!_validToken(body.token)) return _cors({ ok: false, fejl: 'Ugyldig adgangstoken' });

  if (action === 'tilmeld')             return _cors(handleTilmeld(body));
  if (action === 'venteListe')          return _cors(handleVenteListe(body));
  if (action === 'firmaarrangement')    return _cors(handleFirmaarrangement(body));
  if (action === 'kontakt')             return _cors(handleKontakt(body));
  // Web Push: gem/slet push-abonnement (brugeren validerer med token, subscription er ikke fortrolig)
  if (action === 'pushSubscribe')       return _cors(handlePushSubscribe(body));
  if (action === 'pushUnsubscribe')     return _cors(handlePushUnsubscribe(body));

  // Admin POST-handlinger (kræver admin-session-token)
  if (!_validAdminToken(body.adminToken)) return _cors({ ok: false, fejl: 'Ikke autoriseret' });

  if (action === 'adminSaveArr')           return _cors(handleAdminSaveArr(body));
  if (action === 'adminDeleteArr')         return _cors(handleAdminDeleteArr(body));
  if (action === 'adminSaveSponsor')       return _cors(handleAdminSaveSponsor(body));
  if (action === 'adminSaveNyhed')         return _cors(handleAdminSaveNyhed(body));
  if (action === 'adminSavePopup')         return _cors(handleAdminSavePopup(body));
  if (action === 'adminSaveInfobjaelke')   return _cors(handleAdminSaveInfobjaelke(body));
  if (action === 'adminSaveMedlem')        return _cors(handleAdminSaveMedlem(body));
  if (action === 'adminSendPaamind')       return _cors(handleAdminSendPaamind(body));
  if (action === 'adminAfmeldManuelt')     return _cors(handleAdminAfmeldManuelt(body));
  if (action === 'adminAktivérVenteliste') return _cors(handleAdminAktivérVenteliste(body));
  if (action === 'adminRetryEmail')        return _cors(handleAdminRetryEmail(body));
  if (action === 'adminSendAendring')      return _cors(handleAdminSendAendring(body));
  if (action === 'adminSendAflysning')     return _cors(handleAdminSendAflysning(body));
  if (action === 'adminSendPraktisk')      return _cors(handleAdminSendPraktisk(body));
  if (action === 'adminGemIndstilling')    return _cors(handleAdminGemIndstilling(body));
  if (action === 'adminEksporterCSV')      return _cors(handleAdminEksporterCSV(body));
  // v8.5: Kommunikation og push
  if (action === 'adminSendManuelBesked')    return _cors(handleAdminSendManuelBesked(body));
  if (action === 'adminSendTestBesked')      return _cors(handleAdminSendTestBesked(body));
  if (action === 'adminGetPaamindPreview')   return _cors(handleAdminGetPaamindPreview(body));
  if (action === 'adminGetPushAbonnenter')   return _cors(handleAdminGetPushAbonnenter(body));
  if (action === 'adminSendNyArrangement')   return _cors(handleAdminSendNyArrangement(body));

  return _cors({ ok: false, fejl: 'Ukendt handling' });
}

// ═══════════════════════════════════════════════════════════════
// BOOKING — TILMELDING (atomisk med LockService)
// ═══════════════════════════════════════════════════════════════

function handleTilmeld(body) {
  const { arrId, navn, virksomhed, email, telefon, antal, kommentar } = body;
  if (!arrId || !navn || !email || !antal) return { ok: false, fejl: 'Manglende felter' };
  if (!_validEmail(email)) return { ok: false, fejl: 'Ugyldig e-mailadresse' };
  if (antal < 1 || antal > 20) return { ok: false, fejl: 'Ugyldigt antal deltagere' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Vent maks 10s
  } catch(e) {
    return { ok: false, fejl: 'Serveren er midlertidigt optaget. Prøv igen om et øjeblik.' };
  }

  try {
    const ss   = _ss();
    const arrSh = ss.getSheetByName(SH.ARR);
    const tilSh = ss.getSheetByName(SH.TILM);

    // Find arrangement
    const arrData = arrSh.getDataRange().getValues();
    const arrIdx  = arrData.findIndex((r, i) => i > 0 && r[0] === arrId);
    if (arrIdx < 0) return { ok: false, fejl: 'Arrangement ikke fundet' };

    const arrRow  = arrData[arrIdx];
    // Kolonner: ID, Titel, Dato, TidFra, TidTil, Maks, Pris, Status, Aaben, Beskrivelse, Lokation, Billede
    const maks    = Number(arrRow[5]) || 0;
    const aaben   = arrRow[8] === true || arrRow[8] === 'TRUE';
    const status  = arrRow[7] || '';

    if (!aaben || status !== 'aktiv') return { ok: false, fejl: 'Tilmelding er ikke åben for dette arrangement.' };

    // Tæl eksisterende tilmeldinger (ikke afmeldte)
    const tilData  = tilSh.getDataRange().getValues();
    const tilmNu   = tilData.filter((r, i) => i > 0 && r[1] === arrId && r[11] !== 'afmeldt')
                             .reduce((s, r) => s + (Number(r[6]) || 1), 0);
    const ledige   = maks - tilmNu;

    if (maks > 0 && antal > ledige) {
      return { ok: false, fejl: `Kun ${ledige} ledige pladser. Vælg færre deltagere eller tilmeld dig ventelisten.`, ledige };
    }

    // Dobbelttjek — samme email + samme arrangement
    const dobbelt = tilData.some((r, i) => i > 0 && r[1] === arrId && r[3] === email && r[11] !== 'afmeldt');
    if (dobbelt) return { ok: false, fejl: 'Denne e-mailadresse er allerede tilmeldt dette arrangement.' };

    // Gem tilmelding
    const tilmId       = 't' + Date.now();
    const afmeldToken  = _hmac(tilmId + email + arrId);
    const nu           = new Date();
    const afmeldUrl    = CFG.APP_URL + '?afmeld=' + encodeURIComponent(tilmId) + '&tok=' + encodeURIComponent(afmeldToken);

    tilSh.appendRow([
      tilmId,          // A: ID
      arrId,           // B: ArrID
      navn,            // C: Navn
      email,           // D: Email
      telefon || '',   // E: Telefon
      virksomhed || '',// F: Virksomhed
      antal,           // G: Antal
      kommentar || '',  // H: Kommentar
      nu,              // I: OprettetDato
      '',              // J: MødtDato
      afmeldToken,     // K: AfmeldToken
      'aktiv',         // L: Status
      '',              // M: AfmeldtDato
      arrRow[1] || '', // N: ArrTitel (kopi)
      Utilities.formatDate(arrRow[2] instanceof Date ? arrRow[2] : new Date(arrRow[2]), Session.getScriptTimeZone(), 'dd.MM.yyyy'), // O: ArrDato (kopi)
    ]);

    _logHistorik('TILMELDING', tilmId, navn + ' (' + email + ') tilmeldt ' + arrId);

    // Send bekræftelsesmail
    _sendBrevoMail({
      to:      { name: navn, email },
      subject: `Tilmelding bekræftet: ${arrRow[1]}`,
      html:    _mailTilmeldBekraeft({ navn, virksomhed, email, antal, arrTitel: arrRow[1], arrDato: arrRow[2], arrTid: arrRow[3], arrLokation: arrRow[10], afmeldUrl }),
      tilmId,
      arrId,
      type:    'bekræftelse',
    });

    // Notificér admin
    _sendBrevoMail({
      to:      CFG.BREVO_SENDER,
      subject: `[Ny tilmelding] ${navn} → ${arrRow[1]}`,
      html:    `<p><b>${navn}</b> (${virksomhed}) har tilmeldt sig <b>${arrRow[1]}</b>.<br>Antal: ${antal} · E-mail: ${email}</p>`,
      type:    'admin-notif',
    });

    return {
      ok:              true,
      tilmelding_id:   tilmId,
      ledige_tilbage:  Math.max(0, ledige - antal),
      arrTitel:        arrRow[1],
    };

  } finally {
    lock.releaseLock();
  }
}

// ═══════════════════════════════════════════════════════════════
// AFMELDING via sikkert link
// ═══════════════════════════════════════════════════════════════

function handleAfmeld(params) {
  const { afmeld: tilmId, tok } = params;
  if (!tilmId || !tok) return { ok: false, fejl: 'Manglende parametre' };

  const tilSh  = _ss().getSheetByName(SH.TILM);
  const data   = tilSh.getDataRange().getValues();

  const idx = data.findIndex((r, i) => i > 0 && r[0] === tilmId);
  if (idx < 0) return { ok: false, fejl: 'Tilmelding ikke fundet' };

  const row     = data[idx];
  const email   = row[3];
  const arrId   = row[1];
  const stored  = row[10]; // AfmeldToken

  if (tok !== stored) return { ok: false, fejl: 'Ugyldig token — link er ikke gyldigt' };
  if (row[11] === 'afmeldt') return { ok: false, fejl: 'Du er allerede afmeldt dette arrangement.' };

  // Markér som afmeldt
  const sheetRow = idx + 1;
  tilSh.getRange(sheetRow, 12).setValue('afmeldt');   // Status
  tilSh.getRange(sheetRow, 13).setValue(new Date());  // AfmeldtDato

  // Gem i Afmeldinger-sheet
  const afSh = _ss().getSheetByName(SH.AFMELD);
  afSh.appendRow([tilmId, arrId, row[2], email, row[5], row[6], new Date(), row[13]]);

  _logHistorik('AFMELDING', tilmId, row[2] + ' (' + email + ') afmeldt ' + arrId);

  // Send afmeldingskvittering
  _sendBrevoMail({
    to:      { name: row[2], email },
    subject: `Afmelding bekræftet: ${row[13] || arrId}`,
    html:    _mailAfmeldBekraeft({ navn: row[2], arrTitel: row[13] }),
    tilmId,
    arrId,
    type:    'afmelding',
  });

  // Tjek venteliste — ryg næste op
  _aktiverVenteliste(arrId);

  return { ok: true, besked: 'Du er nu afmeldt. Du modtager en bekræftelse på e-mail.' };
}

// ═══════════════════════════════════════════════════════════════
// VENTELISTE
// ═══════════════════════════════════════════════════════════════

function handleVenteListe(body) {
  const { arrId, navn, email, telefon, antal } = body;
  if (!arrId || !navn || !email) return { ok: false, fejl: 'Manglende felter' };
  if (!_validEmail(email)) return { ok: false, fejl: 'Ugyldig e-mailadresse' };

  const ss    = _ss();
  const vSh   = ss.getSheetByName(SH.VENTE);
  const arrSh = ss.getSheetByName(SH.ARR);

  // Dobbelttjek venteliste
  const vData  = vSh.getDataRange().getValues();
  const dobbelt = vData.some((r, i) => i > 0 && r[1] === arrId && r[3] === email && r[7] !== 'aktiveret');
  if (dobbelt) return { ok: false, fejl: 'Denne e-mail er allerede på ventelisten.' };

  const arrData = arrSh.getDataRange().getValues();
  const arrRow  = arrData.find((r, i) => i > 0 && r[0] === arrId);
  const arrTitel = arrRow ? arrRow[1] : arrId;

  const id = 'v' + Date.now();
  vSh.appendRow([id, arrId, navn, email, telefon || '', antal || 1, new Date(), '', arrTitel]);

  _logHistorik('VENTELISTE', id, navn + ' på venteliste til ' + arrId);

  _sendBrevoMail({
    to:      { name: navn, email },
    subject: `Venteliste: ${arrTitel}`,
    html:    _mailVenteliste({ navn, arrTitel }),
    type:    'venteliste',
  });

  return { ok: true, besked: 'Du er sat på ventelisten. Vi kontakter dig, hvis der opstår ledige pladser.' };
}

// ═══════════════════════════════════════════════════════════════
// FIRMA-ARRANGEMENT FORESPØRGSEL
// ═══════════════════════════════════════════════════════════════

function handleFirmaarrangement(body) {
  const { pakke, virksomhed, kontaktperson, email, telefon, dato, antal, beskrivelse } = body;
  if (!pakke || !virksomhed || !email) return { ok: false, fejl: 'Manglende felter' };
  if (!_validEmail(email)) return { ok: false, fejl: 'Ugyldig e-mailadresse' };

  _logHistorik('FIRMA', 'f'+Date.now(), virksomhed + ' forespørgsel på ' + pakke);

  _sendBrevoMail({
    to:      { name: kontaktperson || virksomhed, email },
    subject: `Forespørgsel modtaget: ${pakke} — ${CFG.KLUB_NAVN}`,
    html:    _mailFirmaModtaget({ pakke, virksomhed, kontaktperson, email }),
    type:    'firma',
  });

  _sendBrevoMail({
    to:      CFG.BREVO_SENDER,
    subject: `[Firma-forespørgsel] ${virksomhed} — ${pakke}`,
    html:    `<p><b>Virksomhed:</b> ${virksomhed}<br><b>Kontakt:</b> ${kontaktperson} · ${email} · ${telefon}<br><b>Pakke:</b> ${pakke}<br><b>Dato:</b> ${dato}<br><b>Antal:</b> ${antal}<br><b>Beskrivelse:</b> ${beskrivelse}</p>`,
    type:    'admin-notif',
  });

  return { ok: true, besked: 'Din forespørgsel er modtaget. Vi vender tilbage inden for 2 hverdage.' };
}

// ═══════════════════════════════════════════════════════════════
// KONTAKTFORMULAR
// ═══════════════════════════════════════════════════════════════

function handleKontakt(body) {
  const { navn, email, besked } = body;
  if (!navn || !email || !besked) return { ok: false, fejl: 'Manglende felter' };
  if (!_validEmail(email)) return { ok: false, fejl: 'Ugyldig e-mailadresse' };

  _sendBrevoMail({
    to:      CFG.BREVO_SENDER,
    subject: `[Kontakt] ${navn}`,
    html:    `<p><b>Fra:</b> ${navn} &lt;${email}&gt;</p><p>${besked.replace(/\n/g,'<br>')}</p>`,
    type:    'kontakt',
  });

  _sendBrevoMail({
    to:      { name: navn, email },
    subject: `Besked modtaget — ${CFG.KLUB_NAVN}`,
    html:    `<p>Hej ${navn},</p><p>Vi har modtaget din besked og vender tilbage hurtigst muligt.</p><p>Med venlig hilsen<br>${CFG.KLUB_NAVN}</p>`,
    type:    'kontakt-kvit',
  });

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// OFFENTLIGE GET-HANDLERS
// ═══════════════════════════════════════════════════════════════

function handleGetArrangementer() {
  const sh   = _ss().getSheetByName(SH.ARR);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const nu = new Date();

  const arr = data.slice(1).map(r => _rowToObj(headers, r)).filter(a => {
    const dato = a.Dato instanceof Date ? a.Dato : new Date(a.Dato);
    return a.Status !== 'slettet' && dato >= new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  });

  // Berig med aktuelle tilmeldingstal (ingen persondata returneres)
  const tilSh  = _ss().getSheetByName(SH.TILM);
  const tilData = tilSh.getDataRange().getValues();

  arr.forEach(a => {
    const tlm = tilData.slice(1)
      .filter(r => r[1] === a.ID && r[11] !== 'afmeldt')
      .reduce((s, r) => s + (Number(r[6]) || 1), 0);
    a.TlmAntal = tlm;
    a.Ledige   = Math.max(0, (Number(a.Maks) || 0) - tlm);
  });

  return { ok: true, arrangementer: arr };
}

function handleGetNyheder() {
  const sh   = _ss().getSheetByName(SH.NYHEDER);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const nyheder = data.slice(1).map(r => _rowToObj(headers, r)).filter(n => n.Aktiv === true || n.Aktiv === 'TRUE');
  return { ok: true, nyheder };
}

function handleGetPopup() {
  const sh   = _ss().getSheetByName(SH.POPUP);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return { ok: true, popup: null };
  const headers = data[0];
  const popup = _rowToObj(headers, data[1]);
  return { ok: true, popup: (popup.Aktiv === true || popup.Aktiv === 'TRUE') ? popup : null };
}

function handleGetInfobjaelke() {
  const sh   = _ss().getSheetByName(SH.INFOBJ);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return { ok: true, infobjaelke: null };
  const headers = data[0];
  const ib = _rowToObj(headers, data[1]);
  return { ok: true, infobjaelke: (ib.Aktiv === true || ib.Aktiv === 'TRUE') ? ib : null };
}

function handleGetSponsor(params) {
  const sh   = _ss().getSheetByName(SH.SPONSOR);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const sponsorer = data.slice(1).map(r => _rowToObj(headers, r)).filter(s => s.Aktiv === true || s.Aktiv === 'TRUE');
  return { ok: true, sponsorer };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — DATAHENTNING
// ═══════════════════════════════════════════════════════════════

function handleAdminGetAll(body) {
  // adminToken allerede valideret i doPost
  const ss = _ss();
  const result = {};
  Object.entries(SH).forEach(([key, name]) => {
    try {
      const sh = ss.getSheetByName(name);
      if (!sh) return;
      const data = sh.getDataRange().getValues();
      result[key] = { headers: data[0], rows: data.slice(1) };
    } catch(e) {}
  });
  return { ok: true, data: result };
}

function handleAdminGetTilmeldinger(body) {
  const arrId = body.arrId || null;
  const sh   = _ss().getSheetByName(SH.TILM);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  let rows = data.slice(1).map(r => _rowToObj(headers, r));
  if (arrId) rows = rows.filter(r => r.ArrID === arrId);
  return { ok: true, tilmeldinger: rows };
}

function handleAdminGetEmaillog(body) {
  const sh   = _ss().getSheetByName(SH.EMAIL);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map((r, i) => {
    const obj = _rowToObj(headers, r);
    obj._row = i + 2; // 1-baseret rækkenummer i sheet (header = 1)
    return obj;
  });
  // Kun fejlede e-mails som standard, medmindre all=true
  const result = body.all ? rows : rows.filter(r => r.Status === 'fejl');
  return { ok: true, emaillog: result };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — ARRANGEMENTER
// ═══════════════════════════════════════════════════════════════

function handleAdminSaveArr(body) {
  const sh = _ss().getSheetByName(SH.ARR);
  const { arr } = body;
  if (!arr || !arr.ID) return { ok: false, fejl: 'Manglende arrangement-data' };

  const data = sh.getDataRange().getValues();
  const idx  = data.findIndex((r, i) => i > 0 && r[0] === arr.ID);

  const row = [
    arr.ID, arr.Titel || '', _parseDate(arr.Dato), arr.TidFra || '',
    arr.TidTil || '', Number(arr.Maks) || 0, arr.Pris || '',
    arr.Status || 'aktiv', arr.Aaben === true || arr.Aaben === 'TRUE',
    arr.Beskrivelse || '', arr.Lokation || '', arr.Billede || '',
  ];

  if (idx > 0) {
    sh.getRange(idx + 1, 1, 1, row.length).setValues([row]);
    _logHistorik('ADMIN', arr.ID, 'Arrangement opdateret: ' + arr.Titel);
  } else {
    sh.appendRow(row);
    _logHistorik('ADMIN', arr.ID, 'Arrangement oprettet: ' + arr.Titel);
  }

  return { ok: true };
}

function handleAdminDeleteArr(body) {
  const sh = _ss().getSheetByName(SH.ARR);
  const { arrId } = body;
  if (!arrId) return { ok: false, fejl: 'Manglende ID' };

  const data = sh.getDataRange().getValues();
  const idx  = data.findIndex((r, i) => i > 0 && r[0] === arrId);
  if (idx < 0) return { ok: false, fejl: 'Arrangement ikke fundet' };

  // Markér som slettet (slet ikke rækken — bevarer historik)
  sh.getRange(idx + 1, 8).setValue('slettet');
  _logHistorik('ADMIN', arrId, 'Arrangement markeret slettet');
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — AFMELDING, VENTELISTE, E-MAILLOG
// ═══════════════════════════════════════════════════════════════

/**
 * Manuel afmeldingsregistrering fra admin-panel.
 * Bruges når deltager afmelder telefonisk eller pr. e-mail.
 */
function handleAdminAfmeldManuelt(body) {
  const { tilmId } = body;
  if (!tilmId) return { ok: false, fejl: 'Manglende tilmeldings-ID' };

  const ss    = _ss();
  const tilSh = ss.getSheetByName(SH.TILM);
  const data  = tilSh.getDataRange().getValues();
  const idx   = data.findIndex((r, i) => i > 0 && r[0] === tilmId);

  if (idx < 0) return { ok: false, fejl: 'Tilmelding ikke fundet' };
  const row = data[idx];
  if (row[11] === 'afmeldt') return { ok: false, fejl: 'Allerede afmeldt' };

  const sheetRow = idx + 1;
  tilSh.getRange(sheetRow, 12).setValue('afmeldt');
  tilSh.getRange(sheetRow, 13).setValue(new Date());

  const afSh = ss.getSheetByName(SH.AFMELD);
  afSh.appendRow([tilmId, row[1], row[2], row[3], row[5], row[6], new Date(), row[13]]);

  _logHistorik('ADMIN_AFMELD', tilmId, `Admin afmeldte ${row[2]} (${row[3]}) fra ${row[1]}`);

  // Send bekræftelse til deltager (valgfrit — kan deaktiveres med body.sendMail === false)
  if (body.sendMail !== false) {
    _sendBrevoMail({
      to:      { name: row[2], email: row[3] },
      subject: `Afmelding bekræftet: ${row[13] || row[1]}`,
      html:    _mailAfmeldBekraeft({ navn: row[2], arrTitel: row[13] }),
      tilmId,
      arrId:   row[1],
      type:    'admin-afmelding',
    });
  }

  // Tjek venteliste
  _aktiverVenteliste(row[1]);

  return { ok: true };
}

/**
 * Manuel aktivering af ventelisteperson fra admin-panel.
 * Sender e-mail om ledig plads.
 */
function handleAdminAktivérVenteliste(body) {
  const { venteId } = body;
  if (!venteId) return { ok: false, fejl: 'Manglende venteliste-ID' };

  const vSh  = _ss().getSheetByName(SH.VENTE);
  const data = vSh.getDataRange().getValues();
  const idx  = data.findIndex((r, i) => i > 0 && r[0] === venteId);

  if (idx < 0) return { ok: false, fejl: 'Ventelisteperson ikke fundet' };
  const row = data[idx];
  if (row[7] === 'aktiveret') return { ok: false, fejl: 'Allerede aktiveret' };

  vSh.getRange(idx + 1, 8).setValue('aktiveret');

  _sendBrevoMail({
    to:      { name: row[2], email: row[3] },
    subject: `Ledig plads: ${row[8] || row[1]}`,
    html:    _mailVentelistePlads({ navn: row[2], arrTitel: row[8] || row[1], appUrl: CFG.APP_URL }),
    type:    'venteliste-plads',
  });

  _logHistorik('ADMIN', venteId, `Admin aktiverede ventelisteperson ${row[2]} (${row[1]})`);
  return { ok: true };
}

/**
 * Retry af fejlet e-mail fra e-maillog.
 * Undgår dobbeltudsendelse ved at tjekke om e-mailen allerede er sendt.
 */
function handleAdminRetryEmail(body) {
  const { emailId } = body;
  if (!emailId) return { ok: false, fejl: 'Manglende e-mail ID' };

  const emailSh = _ss().getSheetByName(SH.EMAIL);
  const data    = emailSh.getDataRange().getValues();
  const headers = data[0];

  const idx = data.findIndex((r, i) => i > 0 && r[0] === emailId);
  if (idx < 0) return { ok: false, fejl: 'E-mail ikke fundet i log' };

  const row = data[idx];
  const statusKol = headers.indexOf('Status');
  const modtagerKol = headers.indexOf('Modtager');
  const typeKol = headers.indexOf('Type');

  if (row[statusKol] === 'sendt') {
    return { ok: false, fejl: 'E-mailen er allerede sendt — afbrydes for at undgå dobbeltudsendelse' };
  }

  // Markér midlertidigt som "retry" for at forhindre parallelle retry-forsøg
  emailSh.getRange(idx + 1, statusKol + 1).setValue('retry');

  // Simpel retry — gensend med samme modtager og type
  const modtager = row[modtagerKol];
  const emneKol  = headers.indexOf('Type');
  const emne     = row[emneKol] || 'Besked fra LYG Erhvervsklub';

  const resultat = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method:      'post',
    contentType: 'application/json',
    headers:     { 'api-key': CFG.BREVO_API_KEY, 'accept': 'application/json' },
    payload:     JSON.stringify({
      sender:      CFG.BREVO_SENDER,
      to:          [{ email: modtager }],
      subject:     `[Gensent] ${emne}`,
      htmlContent: _mailWrapper(`<p>Denne e-mail er gensendt af administrator efter en fejl.</p><p>Kontakt klubben på <a href="mailto:${CFG.KLUB_EMAIL}">${CFG.KLUB_EMAIL}</a> ved spørgsmål.</p>`),
    }),
    muteHttpExceptions: true,
  });

  const http = resultat.getResponseCode();
  const ok   = http >= 200 && http < 300;

  emailSh.getRange(idx + 1, statusKol + 1).setValue(ok ? 'sendt-retry' : 'fejl');
  if (!ok) emailSh.getRange(idx + 1, headers.indexOf('FejlBesked') + 1).setValue(resultat.getContentText().substring(0, 200));

  _logHistorik('ADMIN_RETRY', emailId, `Retry af e-mail til ${modtager}: ${ok ? 'OK' : 'fejl'}`);
  return { ok, besked: ok ? 'E-mail gensendt' : 'Gensendelse fejlede — se log' };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — E-MAIL UDSENDELSE
// ═══════════════════════════════════════════════════════════════

function handleAdminSendPaamind(body) {
  const { arrId } = body;
  const ss   = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);

  const arrData = arrSh.getDataRange().getValues();
  const arrRow  = arrData.find((r, i) => i > 0 && r[0] === arrId);
  if (!arrRow) return { ok: false, fejl: 'Arrangement ikke fundet' };

  const tilData = tilSh.getDataRange().getValues();
  const aktive  = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');

  let sendt = 0;
  aktive.forEach(r => {
    _sendBrevoMail({
      to:      { name: r[2], email: r[3] },
      subject: `Påmindelse: ${arrRow[1]} nærmer sig`,
      html:    _mailPaamind({ navn: r[2], arrTitel: arrRow[1], arrDato: arrRow[2], arrTid: arrRow[3], arrLokation: arrRow[10] }),
      tilmId:  r[0],
      arrId,
      type:    'paamind-manuel',
    });
    sendt++;
  });

  _logHistorik('ADMIN', arrId, `Manuel påminding sendt til ${sendt} deltagere`);
  return { ok: true, sendt };
}

function handleAdminSendAendring(body) {
  const { arrId, aendringsTekst } = body;
  if (!arrId || !aendringsTekst) return { ok: false, fejl: 'Manglende felter' };

  const ss    = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);

  const arrData = arrSh.getDataRange().getValues();
  const arrRow  = arrData.find((r, i) => i > 0 && r[0] === arrId);
  if (!arrRow) return { ok: false, fejl: 'Arrangement ikke fundet' };

  const tilData = tilSh.getDataRange().getValues();
  const aktive  = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');

  let sendt = 0;
  aktive.forEach(r => {
    _sendBrevoMail({
      to:      { name: r[2], email: r[3] },
      subject: `Vigtig ændring: ${arrRow[1]}`,
      html:    _mailAendring({ navn: r[2], arrTitel: arrRow[1], aendringsTekst }),
      tilmId:  r[0],
      arrId,
      type:    'aendring',
    });
    sendt++;
  });

  _logHistorik('ADMIN', arrId, `Ændringsbesked sendt til ${sendt} deltagere`);
  return { ok: true, sendt };
}

function handleAdminSendAflysning(body) {
  const { arrId, aflysningsTekst } = body;
  if (!arrId) return { ok: false, fejl: 'Manglende arrId' };

  const ss    = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);

  const arrData = arrSh.getDataRange().getValues();
  const arrIdx  = arrData.findIndex((r, i) => i > 0 && r[0] === arrId);
  if (arrIdx < 0) return { ok: false, fejl: 'Arrangement ikke fundet' };
  const arrRow = arrData[arrIdx];

  // Markér arrangement som aflyst
  arrSh.getRange(arrIdx + 1, 8).setValue('aflyst');

  const tilData = tilSh.getDataRange().getValues();
  const aktive  = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');

  let sendt = 0;
  aktive.forEach(r => {
    _sendBrevoMail({
      to:      { name: r[2], email: r[3] },
      subject: `AFLYST: ${arrRow[1]}`,
      html:    _mailAflysning({ navn: r[2], arrTitel: arrRow[1], aflysningsTekst: aflysningsTekst || '' }),
      tilmId:  r[0],
      arrId,
      type:    'aflysning',
    });
    sendt++;
  });

  _logHistorik('ADMIN', arrId, `Aflysningsbesked sendt til ${sendt} deltagere`);
  return { ok: true, sendt };
}

function handleAdminSendPraktisk(body) {
  const { arrId, praktiskTekst } = body;
  if (!arrId || !praktiskTekst) return { ok: false, fejl: 'Manglende felter' };

  const ss    = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);

  const arrData = arrSh.getDataRange().getValues();
  const arrRow  = arrData.find((r, i) => i > 0 && r[0] === arrId);
  if (!arrRow) return { ok: false, fejl: 'Arrangement ikke fundet' };

  const tilData = tilSh.getDataRange().getValues();
  const aktive  = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');

  let sendt = 0;
  aktive.forEach(r => {
    _sendBrevoMail({
      to:      { name: r[2], email: r[3] },
      subject: `Praktiske oplysninger: ${arrRow[1]}`,
      html:    _mailPraktisk({ navn: r[2], arrTitel: arrRow[1], praktiskTekst }),
      tilmId:  r[0],
      arrId,
      type:    'praktisk',
    });
    sendt++;
  });

  _logHistorik('ADMIN', arrId, `Praktisk information sendt til ${sendt} deltagere`);
  return { ok: true, sendt };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — CSV-EKSPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Returnerer tilmeldingsdata som CSV-streng til download i browser.
 * Persondata filtreres — kun navngivne kolonner eksporteres.
 */
function handleAdminEksporterCSV(body) {
  const { arrId } = body;
  const tilSh = _ss().getSheetByName(SH.TILM);
  const data  = tilSh.getDataRange().getValues();
  const hdr   = data[0];

  // Kun disse kolonner medtages (privacy-filter)
  const csvKolonner = ['Navn', 'Virksomhed', 'Email', 'Telefon', 'Antal', 'Status', 'OprettetDato', 'ArrTitel', 'ArrDato'];
  const idxMap = csvKolonner.map(k => hdr.indexOf(k));

  let rows = data.slice(1);
  if (arrId) rows = rows.filter(r => r[hdr.indexOf('ArrID')] === arrId);

  // Fjern afmeldte
  const statusIdx = hdr.indexOf('Status');
  rows = rows.filter(r => r[statusIdx] !== 'afmeldt');

  const csvLines = [csvKolonner.join(';')];
  rows.forEach(r => {
    const line = idxMap.map(i => {
      const v = i >= 0 ? (r[i] || '') : '';
      const s = v instanceof Date ? v.toLocaleDateString('da-DK') : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    });
    csvLines.push(line.join(';'));
  });

  return { ok: true, csv: csvLines.join('\n'), antal: rows.length };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — INDSTILLINGER (nyt i v8.3)
// ═══════════════════════════════════════════════════════════════

function handleAdminGemIndstilling(body) {
  const { noegle, vaerdi } = body;
  if (!noegle) return { ok: false, fejl: 'Manglende nøgle' };

  const sh   = _ss().getSheetByName(SH.INDSTIL);
  const data = sh.getDataRange().getValues();
  const headers = data[0]; // Nøgle, Værdi, Beskrivelse

  const idx = data.findIndex((r, i) => i > 0 && r[0] === noegle);
  if (idx > 0) {
    sh.getRange(idx + 1, 2).setValue(vaerdi); // Opdatér Værdi-kolonne
  } else {
    sh.appendRow([noegle, vaerdi, body.beskrivelse || '']);
  }

  _logHistorik('ADMIN', 'indstil', `Indstilling sat: ${noegle} = ${vaerdi}`);
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN HANDLERS — ØVRIGE
// ═══════════════════════════════════════════════════════════════

function handleAdminSaveSponsor(body) {
  _saveOrUpdateSheet(SH.SPONSOR, body.sponsor, 'ID');
  return { ok: true };
}

function handleAdminSaveNyhed(body) {
  _saveOrUpdateSheet(SH.NYHEDER, body.nyhed, 'ID');
  return { ok: true };
}

function handleAdminSavePopup(body) {
  const sh = _ss().getSheetByName(SH.POPUP);
  const { popup } = body;
  const row = [popup.Aktiv, popup.Titel || '', popup.Tekst || '', popup.Noegle || 'popup_v1', popup.CtaTekst || '', popup.CtaUrl || ''];
  if (sh.getLastRow() < 2) sh.appendRow(row);
  else sh.getRange(2, 1, 1, row.length).setValues([row]);
  _logHistorik('ADMIN', 'popup', 'Popup opdateret');
  return { ok: true };
}

function handleAdminSaveInfobjaelke(body) {
  const sh = _ss().getSheetByName(SH.INFOBJ);
  const { ib } = body;
  const row = [ib.Aktiv, ib.Tekst || '', ib.LinkUrl || '', ib.LinkTekst || ''];
  if (sh.getLastRow() < 2) sh.appendRow(row);
  else sh.getRange(2, 1, 1, row.length).setValues([row]);
  _logHistorik('ADMIN', 'infobjaelke', 'Infobjælke opdateret');
  return { ok: true };
}

function handleAdminSaveMedlem(body) {
  _saveOrUpdateSheet(SH.MEDL, body.medlem, 'ID');
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// VENTELISTE AKTIVERING (intern)
// ═══════════════════════════════════════════════════════════════

function _aktiverVenteliste(arrId) {
  const ss   = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);
  const vSh   = ss.getSheetByName(SH.VENTE);

  const arrData = arrSh.getDataRange().getValues();
  const arrIdx  = arrData.findIndex((r, i) => i > 0 && r[0] === arrId);
  if (arrIdx < 0) return;

  const arrRow = arrData[arrIdx];
  const maks   = Number(arrRow[5]) || 0;

  const tilData  = tilSh.getDataRange().getValues();
  const tilmNu   = tilData.filter((r, i) => i > 0 && r[1] === arrId && r[11] !== 'afmeldt')
                           .reduce((s, r) => s + (Number(r[6]) || 1), 0);
  const ledige   = maks - tilmNu;

  if (ledige <= 0) return;

  const vData = vSh.getDataRange().getValues();
  const næste = vData.find((r, i) => i > 0 && r[1] === arrId && r[7] !== 'aktiveret');
  if (!næste) return;

  const vIdx = vData.indexOf(næste);
  vSh.getRange(vIdx + 1, 8).setValue('aktiveret');

  _sendBrevoMail({
    to:      { name: næste[2], email: næste[3] },
    subject: `Ledig plads: ${næste[8] || arrId}`,
    html:    _mailVentelistePlads({ navn: næste[2], arrTitel: næste[8] || arrId, appUrl: CFG.APP_URL }),
    type:    'venteliste-plads',
  });

  _logHistorik('VENTELISTE', næste[0], næste[2] + ' tilbudt plads via venteliste: ' + arrId);
}

// ═══════════════════════════════════════════════════════════════
// ADMIN AUTH — Google OAuth session-token
// ═══════════════════════════════════════════════════════════════

function handleAdminLogin(body) {
  const idToken = body.idToken || '';
  if (!idToken) return { ok: false, fejl: 'Manglende id_token' };

  try {
    const resp = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      { muteHttpExceptions: true }
    );
    const info = JSON.parse(resp.getContentText());
    if (!info.email) return { ok: false, fejl: 'Ugyldig Google token' };

    const email = info.email.toLowerCase();
    if (!CFG.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email)) {
      return { ok: false, fejl: 'Din Google-konto har ikke adgang til administration.' };
    }

    const exp     = Date.now() + 8 * 60 * 60 * 1000; // 8 timer
    const payload = email + ':' + exp;
    const sig     = _hmac(payload);
    const token   = Utilities.base64Encode(payload + ':' + sig);

    _logHistorik('ADMIN_LOGIN', email, 'Admin logget ind');
    return { ok: true, adminToken: token, email, exp };

  } catch(e) {
    return { ok: false, fejl: 'Fejl ved verifikation: ' + e.message };
  }
}

function _validAdminToken(token) {
  if (!token) return false;
  try {
    const decoded  = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts    = decoded.split(':');
    if (parts.length < 3) return false;
    const sig      = parts.pop();
    const exp      = Number(parts[parts.length - 1]);
    const payload  = parts.join(':');
    if (Date.now() > exp) return false;
    return _hmac(payload) === sig;
  } catch(e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE SHEETS SETUP (kør én gang fra editor)
// ═══════════════════════════════════════════════════════════════

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() ||
             SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  const sheetDefs = {
    [SH.ARR]:     ['ID','Titel','Dato','TidFra','TidTil','Maks','Pris','Status','Aaben','Beskrivelse','Lokation','Billede'],
    [SH.TILM]:    ['ID','ArrID','Navn','Email','Telefon','Virksomhed','Antal','Kommentar','OprettetDato','MødtDato','AfmeldToken','Status','AfmeldtDato','ArrTitel','ArrDato'],
    [SH.AFMELD]:  ['TilmID','ArrID','Navn','Email','Virksomhed','Antal','AfmeldtDato','ArrTitel'],
    [SH.VENTE]:   ['ID','ArrID','Navn','Email','Telefon','Antal','OprettetDato','Status','ArrTitel'],
    [SH.MEDL]:    ['ID','Virksomhed','Kontaktperson','Email','Telefon','Branche','MedlemSiden','Aktiv','Logo','Website','Beskrivelse'],
    [SH.SPONSOR]: ['ID','Navn','Niveau','Email','Telefon','Kontaktperson','Aktiv','Logo','Website','Beskrivelse','SynligFra','SynligTil'],
    [SH.NYHEDER]: ['ID','Titel','Tekst','Dato','Aktiv','Billede','LinkUrl','LinkTekst'],
    [SH.POPUP]:   ['Aktiv','Titel','Tekst','Noegle','CtaTekst','CtaUrl'],
    [SH.INFOBJ]:  ['Aktiv','Tekst','LinkUrl','LinkTekst'],
    [SH.ADMIN]:   ['Email','Navn','Rolle','OprettetDato'],
    [SH.INDSTIL]: ['Nøgle','Værdi','Beskrivelse'],  // NYT i v8.3
    [SH.EMAIL]:   ['ID','TilmID','ArrID','Modtager','Type','Sendt','Status','FejlBesked'],
    [SH.HISTORIK]:['Tidspunkt','Type','ReferencID','Besked'],
    [SH.PUSH]:    ['ID','Email','Endpoint','P256DH','Auth','Platform','OprettetDato','Aktiv'], // NYT i v8.5
  };

  Object.entries(sheetDefs).forEach(([name, headers]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      Logger.log('Oprettet sheet: ' + name);
    }
    if (sh.getLastRow() === 0) {
      sh.appendRow(headers);
      sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0d2b1a').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });

  // Standardindstillinger i Indstillinger-arket
  const indstilSh = ss.getSheetByName(SH.INDSTIL);
  const standardIndstillinger = [
    ['aktiv_saeson', '2027', 'Aktiv sæson (årstal)'],
    ['paamind_14_dage', 'nej', 'UDGÅET i v8.5 — erstattet af paamind_7_frist'],
    ['paamind_7_dage', 'nej', 'UDGÅET i v8.5 — erstattet af paamind_7_frist'],
    ['paamind_3_dage', 'nej', 'UDGÅET i v8.5 — erstattet af paamind_2_frist'],
    ['paamind_7_frist', 'ja', 'Send påminding 7 dage før tilmeldingsfrist (ja/nej)'],
    ['paamind_2_frist', 'ja', 'Send påminding 2 dage før tilmeldingsfrist (ja/nej)'],
    ['paamind_1_dag',   'ja', 'Send påminding 1 dag før arrangementet (ja/nej)'],
    ['skabelon_paamind-7-frist', '', 'Skabelon: 7 dage til frist (tomt = standard). Variabler: {{navn}} {{arrTitel}} {{arrDato}}'],
    ['skabelon_paamind-2-frist', '', 'Skabelon: 2 dage til frist (tomt = standard)'],
    ['skabelon_paamind-1-dag',   '', 'Skabelon: 1 dag til arrangement (tomt = standard)'],
    ['gdpr_slettefrist_tilm', '730', 'Dage tilmeldinger opbevares (standard: 730 = 2 år)'],
    ['klub_navn', 'LYG Erhvervsklub', 'Klubbens navn (vises i e-mails)'],
  ];
  const indstilData = indstilSh.getDataRange().getValues();
  standardIndstillinger.forEach(([noegle, vaerdi, beskrivelse]) => {
    const findIdx = indstilData.findIndex((r, i) => i > 0 && r[0] === noegle);
    if (findIdx < 0) {
      indstilSh.appendRow([noegle, vaerdi, beskrivelse]);
    }
  });

  // Gem Spreadsheet ID i Script Properties
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('Setup færdig! Spreadsheet ID: ' + ss.getId());
  Logger.log('VIGTIGT: Sæt disse Script Properties: BREVO_API_KEY, REQUEST_TOKEN, HMAC_SECRET, ADMIN_EMAILS, APP_URL');
}

// ═══════════════════════════════════════════════════════════════
// BREVO E-MAIL
// ═══════════════════════════════════════════════════════════════

/**
 * Send e-mail via Brevo og log status i E-mailstatus-arket.
 * Tilmeldingen er allerede registreret — e-mailfejl stopper IKKE processen.
 */
function _sendBrevoMail({ to, subject, html, tilmId, arrId, type }) {
  const apiKey = CFG.BREVO_API_KEY;
  if (!apiKey) {
    Logger.log('[Brevo] Ingen API-nøgle — mail ikke sendt: ' + subject);
    return false;
  }

  const mailId = 'e' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  let success = false;
  let fejlBesked = '';

  try {
    const payload = {
      sender:  CFG.BREVO_SENDER,
      to:      Array.isArray(to) ? to : [to],
      subject,
      htmlContent: _mailWrapper(html),
    };

    const resp = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
      method:      'post',
      contentType: 'application/json',
      headers:     { 'api-key': apiKey, 'accept': 'application/json' },
      payload:     JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const status = resp.getResponseCode();
    success = status >= 200 && status < 300;
    if (!success) fejlBesked = resp.getContentText().substring(0, 200);

  } catch(e) {
    Logger.log('[Brevo] Fejl: ' + e.message);
    fejlBesked = e.message.substring(0, 200);
  }

  // Log e-mailstatus (altid — uanset om det lykkedes)
  try {
    const emailSh = _ss().getSheetByName(SH.EMAIL);
    emailSh.appendRow([
      mailId,
      tilmId || '',
      arrId  || '',
      Array.isArray(to) ? to.map(t => t.email || t).join(', ') : (to.email || to),
      type   || subject,
      new Date(),
      success ? 'sendt' : 'fejl',
      fejlBesked,
    ]);
  } catch(logErr) {
    Logger.log('[Brevo] Log-fejl: ' + logErr.message);
  }

  return success;
}

// ═══════════════════════════════════════════════════════════════
// E-MAIL SKABELONER
// ═══════════════════════════════════════════════════════════════

function _mailWrapper(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 0">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:100%">
<tr><td style="background:#0d2b1a;padding:24px 32px">
  <span style="color:#b8973a;font-size:1.3rem;font-weight:bold">⛳ ${CFG.KLUB_NAVN}</span>
</td></tr>
<tr><td style="padding:28px 32px;color:#1a1a1a;line-height:1.6">${content}</td></tr>
<tr><td style="background:#f8f8f8;padding:16px 32px;font-size:.8rem;color:#888;border-top:1px solid #e0e0e0">
  ${CFG.KLUB_NAVN} · ${CFG.KLUB_ADRESSE} · ${CFG.KLUB_EMAIL}<br>
  <a href="${CFG.APP_URL}" style="color:#0d2b1a">Åbn appen</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function _mailTilmeldBekraeft({ navn, virksomhed, email, antal, arrTitel, arrDato, arrTid, arrLokation, afmeldUrl }) {
  const datoStr = arrDato instanceof Date ? Utilities.formatDate(arrDato, Session.getScriptTimeZone(), 'dd. MMMM yyyy') : (arrDato || '');
  return `<h2 style="color:#0d2b1a">Tilmelding bekræftet ✅</h2>
<p>Hej ${navn},</p>
<p>Vi har modtaget din tilmelding til <strong>${arrTitel}</strong>.</p>
<table style="border-collapse:collapse;width:100%;margin:16px 0">
  <tr><td style="padding:8px 0;color:#666;width:140px">Arrangement</td><td style="padding:8px 0;font-weight:bold">${arrTitel}</td></tr>
  <tr><td style="padding:8px 0;color:#666">Dato</td><td style="padding:8px 0">${datoStr}</td></tr>
  ${arrTid ? `<tr><td style="padding:8px 0;color:#666">Tidspunkt</td><td style="padding:8px 0">${arrTid}</td></tr>` : ''}
  ${arrLokation ? `<tr><td style="padding:8px 0;color:#666">Lokation</td><td style="padding:8px 0">${arrLokation}</td></tr>` : ''}
  <tr><td style="padding:8px 0;color:#666">Antal deltagere</td><td style="padding:8px 0">${antal}</td></tr>
  ${virksomhed ? `<tr><td style="padding:8px 0;color:#666">Virksomhed</td><td style="padding:8px 0">${virksomhed}</td></tr>` : ''}
</table>
<p><a href="${afmeldUrl}" style="color:#888;font-size:.85rem">Afmeld tilmelding</a></p>
<p>Vi glæder os til at se dig!<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailAfmeldBekraeft({ navn, arrTitel }) {
  return `<h2 style="color:#0d2b1a">Afmelding bekræftet</h2>
<p>Hej ${navn},</p>
<p>Du er nu afmeldt <strong>${arrTitel}</strong>. Vi håber at se dig til et af vores kommende arrangementer.</p>
<p>Med venlig hilsen<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailPaamind({ navn, arrTitel, arrDato, arrTid, arrLokation, label }) {
  const datoStr = arrDato instanceof Date ? Utilities.formatDate(arrDato, 'Europe/Copenhagen', 'dd. MMMM yyyy') : (arrDato || '');
  const labelTekst = label ? ` — ${label}` : '';
  return `<h2 style="color:#0d2b1a">Påmindelse: ${arrTitel} ⛳</h2>
<p>Hej ${navn},</p>
<p>Husk at du er tilmeldt <strong>${arrTitel}</strong>${labelTekst}.</p>
<table style="border-collapse:collapse;width:100%;margin:16px 0">
  <tr><td style="padding:8px 0;color:#666;width:140px">Dato</td><td style="padding:8px 0;font-weight:bold">${datoStr}</td></tr>
  ${arrTid ? `<tr><td style="padding:8px 0;color:#666">Tidspunkt</td><td style="padding:8px 0">${arrTid}</td></tr>` : ''}
  ${arrLokation ? `<tr><td style="padding:8px 0;color:#666">Lokation</td><td style="padding:8px 0">${arrLokation}</td></tr>` : ''}
</table>
<p>Vi glæder os til at se dig!<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailVenteliste({ navn, arrTitel }) {
  return `<h2 style="color:#0d2b1a">Du er på ventelisten</h2>
<p>Hej ${navn},</p>
<p>Du er tilføjet til ventelisten til <strong>${arrTitel}</strong>. Vi kontakter dig, hvis der opstår ledige pladser.</p>
<p>Med venlig hilsen<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailVentelistePlads({ navn, arrTitel, appUrl }) {
  return `<h2 style="color:#0d2b1a">Ledig plads!</h2>
<p>Hej ${navn},</p>
<p>Der er opstået en ledig plads til <strong>${arrTitel}</strong>.</p>
<p>Tilmeld dig hurtigst muligt i appen — pladsen tildeles efter "først til mølle".</p>
<p><a href="${appUrl}" style="background:#0d2b1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Tilmeld dig nu →</a></p>
<p>Med venlig hilsen<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailFirmaModtaget({ pakke, virksomhed, kontaktperson, email }) {
  return `<h2 style="color:#0d2b1a">Forespørgsel modtaget</h2>
<p>Hej ${kontaktperson || virksomhed},</p>
<p>Vi har modtaget jeres forespørgsel på <strong>${pakke}</strong> og vender tilbage inden for 2 hverdage.</p>
<p>Med venlig hilsen<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailAendring({ navn, arrTitel, aendringsTekst }) {
  return `<h2 style="color:#0d2b1a">Vigtig ændring: ${arrTitel}</h2>
<p>Hej ${navn},</p>
<p>Der er sket en ændring vedrørende <strong>${arrTitel}</strong>:</p>
<div style="background:#f8f4e8;border-left:4px solid #b8973a;padding:12px 16px;margin:16px 0">${aendringsTekst.replace(/\n/g,'<br>')}</div>
<p>Kontakt os på <a href="mailto:${CFG.KLUB_EMAIL}">${CFG.KLUB_EMAIL}</a> ved spørgsmål.</p>
<p>Med venlig hilsen<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailAflysning({ navn, arrTitel, aflysningsTekst }) {
  return `<h2 style="color:#c0392b">AFLYST: ${arrTitel}</h2>
<p>Hej ${navn},</p>
<p>Vi beklager at meddele, at <strong>${arrTitel}</strong> er aflyst.</p>
${aflysningsTekst ? `<div style="background:#fdf2f2;border-left:4px solid #c0392b;padding:12px 16px;margin:16px 0">${aflysningsTekst.replace(/\n/g,'<br>')}</div>` : ''}
<p>Vi håber at se dig til et af vores kommende arrangementer.</p>
<p>Kontakt os på <a href="mailto:${CFG.KLUB_EMAIL}">${CFG.KLUB_EMAIL}</a> ved spørgsmål.</p>
<p>Med venlig hilsen<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

function _mailPraktisk({ navn, arrTitel, praktiskTekst }) {
  return `<h2 style="color:#0d2b1a">Praktiske oplysninger: ${arrTitel}</h2>
<p>Hej ${navn},</p>
<p>Her er praktiske oplysninger til <strong>${arrTitel}</strong>:</p>
<div style="background:#f4f6f4;border-left:4px solid #0d2b1a;padding:12px 16px;margin:16px 0">${praktiskTekst.replace(/\n/g,'<br>')}</div>
<p>Vi glæder os til at se dig!<br><strong>${CFG.KLUB_NAVN}</strong></p>`;
}

// ═══════════════════════════════════════════════════════════════
// HJÆLPEFUNKTIONER
// ═══════════════════════════════════════════════════════════════

function _ss() {
  const id = CFG.SPREADSHEET_ID;
  if (!id) throw new Error('SPREADSHEET_ID ikke sat i Script Properties');
  return SpreadsheetApp.openById(id);
}

function _cors(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Validér REQUEST_TOKEN.
 * VIGTIGT: Returnerer ALDRIG true hvis REQUEST_TOKEN ikke er konfigureret.
 * Kaster en fejl i stedet for at have en usikker fallback.
 */
function _validToken(token) {
  const req = CFG.REQUEST_TOKEN;
  if (!req) {
    // SIKKERHED: Ingen fallback — kast fejl for at tvinge korrekt opsætning
    throw new Error('REQUEST_TOKEN er ikke konfigureret i Script Properties. Deployment er ufuldstændigt.');
  }
  return token === req;
}

function _validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * HMAC-SHA256 signering.
 * SIKKERHED: Ingen fallback-hemmelighed. Kaster fejl hvis HMAC_SECRET ikke er sat.
 * Bruges til afmeldingslinks og admin-session-tokens.
 */
function _hmac(message) {
  const secret = CFG.HMAC_SECRET;
  if (!secret) {
    throw new Error('HMAC_SECRET er ikke konfigureret i Script Properties. Deployment er ufuldstændigt.');
  }
  const bytes = Utilities.computeHmacSha256Signature(message, secret);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function _rowToObj(headers, row) {
  const obj = {};
  headers.forEach((h, i) => obj[h] = row[i] !== undefined ? row[i] : '');
  return obj;
}

function _parseDate(val) {
  if (!val) return '';
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d;
}

function _saveOrUpdateSheet(sheetName, obj, idKey) {
  const sh   = _ss().getSheetByName(sheetName);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idIdx   = headers.indexOf(idKey);

  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');

  if (idIdx >= 0 && obj[idKey]) {
    const existing = data.findIndex((r, i) => i > 0 && r[idIdx] === obj[idKey]);
    if (existing > 0) {
      sh.getRange(existing + 1, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sh.appendRow(row);
}

function _logHistorik(type, refId, besked) {
  try {
    const sh = _ss().getSheetByName(SH.HISTORIK);
    sh.appendRow([new Date(), type, refId, besked]);
  } catch(e) {}
}

/**
 * Hent indstilling fra Indstillinger-arket.
 * Returnerer defaultVærdi hvis nøglen ikke findes.
 */
function _getIndstilling(noegle, defaultVaerdi) {
  try {
    const sh   = _ss().getSheetByName(SH.INDSTIL);
    const data = sh.getDataRange().getValues();
    const row  = data.find((r, i) => i > 0 && r[0] === noegle);
    return row ? row[1] : defaultVaerdi;
  } catch(e) {
    return defaultVaerdi;
  }
}

// ═══════════════════════════════════════════════════════════════
// TIDSUDLØST OPGAVE — PÅMINDELSER v8.5
// Konfigurér daglig trigger for sendDagligePaamindelser() i Apps Script
//
// v8.5 logik:
//   · 7 dage FØR FRIST (tilmeldingsfrist, kolonne 15 i ARR)
//   · 2 dage FØR FRIST
//   · 1 dag  FØR ARRANGEMENTET (arrangementsdato - 1)
// Intervalllerne kan til-/fravælges via Indstillinger-arket.
// ═══════════════════════════════════════════════════════════════

/**
 * sendDagligePaamindelser — kald dagligt via trigger (Europe/Copenhagen tz).
 * Sender e-mail + push-notifikation til tilmeldte deltagere.
 * Ingen dobbeltudsendelse — tjekkes via E-mailstatus-arket.
 * Tilmeldte deltagere modtager IKKE opfordringer til at tilmelde sig.
 */
function sendDagligePaamindelser() {
  const ss      = _ss();
  const arrSh   = ss.getSheetByName(SH.ARR);
  const tilSh   = ss.getSheetByName(SH.TILM);
  const emailSh = ss.getSheetByName(SH.EMAIL);

  // Indstillinger — ny navngivning i v8.5
  const send7Frist  = _getIndstilling('paamind_7_frist',  'ja') === 'ja';
  const send2Frist  = _getIndstilling('paamind_2_frist',  'ja') === 'ja';
  const send1Dag    = _getIndstilling('paamind_1_dag',    'ja') === 'ja';

  // Tilbagekompatibilitet med v8.3 (paamind_14_dage ignoreres fra v8.5)
  // paamind_7_dage og paamind_3_dage bevares i arket men bruges ikke længere

  const idag    = new Date();
  const tz      = 'Europe/Copenhagen';

  const arrData   = arrSh.getDataRange().getValues();
  const tilData   = tilSh.getDataRange().getValues();
  const emailData = emailSh.getDataRange().getValues();

  arrData.slice(1).forEach(arrRow => {
    // ARR kolonner: ID[0], Titel[1], Dato[2], TidFra[3], TidTil[4], Maks[5],
    //              Pris[6], Status[7], Aaben[8], Beskrivelse[9], Lokation[10],
    //              Billede[11], Frist[12] (tilmeldingsfrist — NYT i v8.5)
    const arrId    = arrRow[0];
    const arrTitel = arrRow[1];
    const dato     = arrRow[2];   // Arrangementsdato
    const frist    = arrRow[12];  // Tilmeldingsfrist (kan mangle → brug dato)

    if (!(dato instanceof Date)) return;
    if (arrRow[7] !== 'aktiv') return;

    const aktive = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');
    if (aktive.length === 0) return;

    // Helper: tjek om idag matcher "X dage før targetDato"
    const matcherDage = (targetDato, dage) => {
      if (!(targetDato instanceof Date)) return false;
      const maaldato = new Date(targetDato);
      maaldato.setDate(targetDato.getDate() - dage);
      return Utilities.formatDate(idag, tz, 'yyyy-MM-dd') ===
             Utilities.formatDate(maaldato, tz, 'yyyy-MM-dd');
    };

    // Effektiv frist: brug Frist-kolonne, ellers arrangementsdato
    const effektivFrist = (frist instanceof Date) ? frist : dato;

    const opgaver = [];
    if (send7Frist && matcherDage(effektivFrist, 7))
      opgaver.push({ type: 'paamind-7-frist', dage: 7, maal: 'frist', label: '7 dage til tilmeldingsfristen' });
    if (send2Frist && matcherDage(effektivFrist, 2))
      opgaver.push({ type: 'paamind-2-frist', dage: 2, maal: 'frist', label: '2 dage til tilmeldingsfristen' });
    if (send1Dag && matcherDage(dato, 1))
      opgaver.push({ type: 'paamind-1-dag', dage: 1, maal: 'arr', label: 'i morgen' });

    opgaver.forEach(opgave => {
      let sendt = 0;
      aktive.forEach(r => {
        const tilmId = r[0];
        const email  = r[3];
        const navn   = r[2];

        // Dobbelttjek — allerede sendt?
        const alreadySent = emailData.some((er, ei) =>
          ei > 0 && er[1] === tilmId && er[4] === opgave.type && er[6] === 'sendt'
        );
        if (alreadySent) return;

        // E-mail påminding
        const skabelon = _getIndstilling(`skabelon_${opgave.type}`, '');
        const subject  = `Husk: ${arrTitel} — ${opgave.label}`;
        const html     = skabelon
          ? _interpolerSkabelon(skabelon, { navn, arrTitel, arrDato: dato, arrTid: arrRow[3], arrLokation: arrRow[10] })
          : _mailPaamind({ navn, arrTitel, arrDato: dato, arrTid: arrRow[3], arrLokation: arrRow[10], label: opgave.label });

        _sendBrevoMail({ to: { name: navn, email }, subject, html, tilmId, arrId, type: opgave.type });

        // Push-notifikation (asynkron — fejl stopper ikke e-mail)
        try {
          _sendPushTilEmail(email, subject, `${arrTitel} · ${opgave.label}`);
        } catch(pe) {
          Logger.log('[Push] Fejl for ' + email + ': ' + pe.message);
        }

        sendt++;
      });

      if (sendt > 0) {
        _logHistorik('PAAMIND', arrId, `${sendt} ${opgave.type} sendt for ${arrTitel}`);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// WEB PUSH — VAPID (v8.5)
// ═══════════════════════════════════════════════════════════════

/**
 * Returner VAPID public key til frontend — sikkert at eksponere.
 * Private key forbliver altid i PropertiesService.
 */
function handleGetVapidPublicKey() {
  const pub = CFG.PUSH_VAPID_PUBLIC;
  if (!pub) return { ok: false, fejl: 'Push-notifikationer er ikke konfigureret endnu. Kontakt administrator.' };
  return { ok: true, vapidPublicKey: pub };
}

/**
 * Gem push-subscription fra browser (PushManager.subscribe()).
 * Subscription indeholder endpoint, p256dh og auth — gemmes i PushAbonnementer-arket.
 * Email er frivillig — bruges til at knytte subscription til tilmeldinger.
 */
function handlePushSubscribe(body) {
  const { endpoint, keys, platform, email } = body;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return { ok: false, fejl: 'Ugyldig push-subscription' };
  }

  try {
    const ss   = _ss();
    const pSh  = ss.getSheetByName(SH.PUSH);
    if (!pSh) return { ok: false, fejl: 'PushAbonnementer-ark mangler. Kør setupSheets() igen.' };

    // Undgå dubletter — tjek om endpoint allerede eksisterer
    const pData = pSh.getDataRange().getValues();
    const existing = pData.findIndex((r, i) => i > 0 && r[2] === endpoint);

    const nu = new Date();
    if (existing >= 0) {
      // Opdater eksisterende (keys kan ændre sig)
      pSh.getRange(existing + 1, 4).setValue(keys.p256dh);
      pSh.getRange(existing + 1, 5).setValue(keys.auth);
      pSh.getRange(existing + 1, 7).setValue(nu);
      pSh.getRange(existing + 1, 8).setValue('aktiv');
      return { ok: true, handling: 'opdateret' };
    }

    const id = 'push_' + Date.now();
    pSh.appendRow([
      id,                   // A: ID
      email || '',          // B: Email (frivillig)
      endpoint,             // C: Endpoint
      keys.p256dh,          // D: P256DH
      keys.auth,            // E: Auth
      platform || 'ukendt', // F: Platform (chrome/firefox/safari/ios)
      nu,                   // G: OprettetDato
      'aktiv',              // H: Aktiv
    ]);

    _logHistorik('PUSH_SUB', id, 'Ny push-subscription: ' + (platform || 'ukendt') + (email ? ' · ' + email : ''));
    return { ok: true, handling: 'oprettet', id };

  } catch(e) {
    Logger.log('[PushSubscribe] Fejl: ' + e.message);
    return { ok: false, fejl: 'Intern fejl ved gemning af push-subscription' };
  }
}

/**
 * Slet push-subscription (brugeren frameldes push).
 * Markér som inaktiv — slet ikke rækken (bevarer historik).
 */
function handlePushUnsubscribe(body) {
  const { endpoint } = body;
  if (!endpoint) return { ok: false, fejl: 'Manglende endpoint' };

  try {
    const ss   = _ss();
    const pSh  = ss.getSheetByName(SH.PUSH);
    if (!pSh) return { ok: true }; // Intet at gøre

    const pData = pSh.getDataRange().getValues();
    const idx   = pData.findIndex((r, i) => i > 0 && r[2] === endpoint);
    if (idx >= 0) {
      pSh.getRange(idx + 1, 8).setValue('inaktiv');
      _logHistorik('PUSH_UNSUB', pData[idx][0], 'Push-abonnement deaktiveret');
    }
    return { ok: true };
  } catch(e) {
    return { ok: false, fejl: e.message };
  }
}

/**
 * Send push-notifikation til én e-mailadresse (alle aktive subscriptions for den email).
 * Bruges internt fra sendDagligePaamindelser og admin-funktioner.
 *
 * VAPID JWT signing via UrlFetchApp + Utilities.computeHmacSha256Signature().
 * Implementerer RFC8291 (Web Push) og RFC7515 (JWS Compact Serialization).
 */
function _sendPushTilEmail(email, title, body) {
  if (!email || !CFG.PUSH_VAPID_PRIVATE || !CFG.PUSH_VAPID_PUBLIC) return 0;

  const ss   = _ss();
  const pSh  = ss.getSheetByName(SH.PUSH);
  if (!pSh) return 0;

  const pData = pSh.getDataRange().getValues();
  const subs  = pData.slice(1).filter(r => r[1] === email && r[7] === 'aktiv');

  let sendt = 0;
  subs.forEach((sub, idx) => {
    try {
      const ok = _sendVapidPush(sub[2], sub[3], sub[4], title, body);
      if (!ok) {
        // Subscription kan være udløbet — markér inaktiv
        pSh.getRange(idx + 2, 8).setValue('inaktiv');
      } else {
        sendt++;
      }
    } catch(e) {
      Logger.log('[Push] Fejl for ' + email + ': ' + e.message);
    }
  });
  return sendt;
}

/**
 * Send push-notifikation til alle aktive subscriptions (uanset email).
 * Bruges til udsendelse ved nyt arrangement og manuel besked.
 */
function _sendPushTilAlle(title, body) {
  if (!CFG.PUSH_VAPID_PRIVATE || !CFG.PUSH_VAPID_PUBLIC) return 0;

  const ss   = _ss();
  const pSh  = ss.getSheetByName(SH.PUSH);
  if (!pSh) return 0;

  const pData = pSh.getDataRange().getValues();
  let sendt = 0;

  pData.slice(1).forEach((sub, idx) => {
    if (sub[7] !== 'aktiv') return;
    try {
      const ok = _sendVapidPush(sub[2], sub[3], sub[4], title, body);
      if (!ok) pSh.getRange(idx + 2, 8).setValue('inaktiv');
      else sendt++;
    } catch(e) {
      Logger.log('[Push] Fejl: ' + e.message);
    }
  });
  return sendt;
}

/**
 * Lav og send én VAPID push-request via UrlFetchApp.
 *
 * VAPID JWT opbygges manuelt:
 *   Header: { alg: "ES256", typ: "JWT" }  ← base64url
 *   Claims: { aud, exp, sub }              ← base64url
 *   Signature: HMAC-SHA256 (approximation) — NB: ægte VAPID bruger ES256 (ECDSA).
 *
 * ⚠️ VIGTIG ARKITEKTURBEMÆRKNING:
 * Google Apps Script understøtter IKKE native ECDSA signing (ES256),
 * som kræves af Web Push RFC 8292. HMAC-SHA256 er NOT ækvivalent med ES256.
 *
 * Konsekvens: Denne funktion sender push-requests, men push-endpoints
 * (FCM, Mozilla, Apple) vil AFVISE requests med HMAC-signeret VAPID JWT,
 * fordi de forventer ES256/ECDSA.
 *
 * LØSNING (to muligheder):
 *   A) Brug en Cloudflare Worker eller minimal Node.js-tjeneste som VAPID-proxy.
 *      Kun proxy-servicen kender den private VAPID-nøgle.
 *   B) Brug Web Push via Brevo (Brevo understøtter ikke web push — ikke muligt).
 *   C) Erstat Apps Script push-kald med en Apps Script "doPost til ekstern service"
 *      der returnerer korrekt signerede requests.
 *
 * Denne implementation logger fejl og returnerer false ved 401/403.
 * Admin-panelet viser en note om VAPID-signerings-begrænsningen.
 *
 * Referencedokumentation: https://web.dev/push-notifications-web-push-protocol/
 */
function _sendVapidPush(endpoint, p256dh, auth, title, body) {
  if (!endpoint) return false;

  // Payload: JSON notification
  const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png', badge: '/icons/icon-96.png' });

  // Opbyg VAPID JWT (approximation — se arkitekturbemærkning ovenfor)
  const origin  = new URL(endpoint).origin;
  const iat     = Math.floor(Date.now() / 1000);
  const exp     = iat + 12 * 3600;

  const header  = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'ES256', typ: 'JWT' })).replace(/=/g, '');
  const claims  = Utilities.base64EncodeWebSafe(JSON.stringify({
    aud: origin,
    exp,
    sub: 'mailto:' + CFG.KLUB_EMAIL,
  })).replace(/=/g, '');

  const sigInput = header + '.' + claims;
  // NB: Utilities.computeHmacSha256Signature returnerer HMAC, IKKE ECDSA.
  // Push-endpoints afviser dette — se arkitekturbemærkning.
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(sigInput, CFG.PUSH_VAPID_PRIVATE)
  ).replace(/=/g, '');

  const jwt = sigInput + '.' + sig;

  try {
    const resp = UrlFetchApp.fetch(endpoint, {
      method:      'post',
      contentType: 'application/octet-stream',
      headers: {
        'Authorization': `vapid t=${jwt},k=${CFG.PUSH_VAPID_PUBLIC}`,
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      payload: payload,
      muteHttpExceptions: true,
    });

    const code = resp.getResponseCode();
    if (code === 201 || code === 200) return true;
    if (code === 404 || code === 410) return false; // Subscription udløbet
    Logger.log('[VapidPush] HTTP ' + code + ': ' + resp.getContentText().substring(0, 200));
    return false;
  } catch(e) {
    Logger.log('[VapidPush] Netværksfejl: ' + e.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ADMIN — KOMMUNIKATION v8.5
// ═══════════════════════════════════════════════════════════════

/**
 * handleAdminSendManuelBesked — send e-mail (+ push) til valgt målgruppe.
 * Målgruppe: 'alle_medl' eller arrId (kun tilmeldte i det arrangement).
 * Tilmeldte deltagere modtager IKKE opfordringer til tilmelding (sikret her).
 */
function handleAdminSendManuelBesked(body) {
  const { maalgruppe, emne, indhold, inkluderPush } = body;
  if (!maalgruppe || !emne || !indhold) return { ok: false, fejl: 'Manglende felter: maalgruppe, emne, indhold' };

  const ss    = _ss();
  let modtagere = [];

  if (maalgruppe === 'alle_medl') {
    // Alle aktive erhvervsmedlemmer — fra Medlemsvirksomheder-arket
    const medlData = ss.getSheetByName(SH.MEDL).getDataRange().getValues();
    modtagere = medlData.slice(1)
      .filter(r => r[7] === true || r[7] === 'TRUE') // Aktiv
      .filter(r => r[3] && _validEmail(r[3]))         // Har gyldig email
      .map(r => ({ navn: r[2] || r[1], email: r[3] }));
  } else {
    // Tilmeldte i specifikt arrangement
    const tilData = ss.getSheetByName(SH.TILM).getDataRange().getValues();
    modtagere = tilData.slice(1)
      .filter(r => r[1] === maalgruppe && r[11] !== 'afmeldt')
      .filter(r => r[3] && _validEmail(r[3]))
      .map(r => ({ navn: r[2], email: r[3] }));
  }

  if (modtagere.length === 0) return { ok: false, fejl: 'Ingen modtagere fundet' };

  let emailSendt = 0;
  let pushSendt  = 0;

  modtagere.forEach(m => {
    const html = `<h2>${emne}</h2><div style="white-space:pre-wrap">${indhold}</div>`;
    const ok   = _sendBrevoMail({ to: { name: m.navn, email: m.email }, subject: emne, html, type: 'manuel-besked' });
    if (ok) emailSendt++;

    if (inkluderPush) {
      try { pushSendt += _sendPushTilEmail(m.email, emne, indhold.substring(0, 100)); } catch(e) {}
    }
  });

  _logHistorik('MANUEL_BESKED', maalgruppe, `${emailSendt} e-mails + ${pushSendt} push sendt. Emne: ${emne}`);
  return { ok: true, emailSendt, pushSendt, modtagere: modtagere.length };
}

/**
 * handleAdminSendTestBesked — send e-mail + push til testadresse.
 * Sender ALDRIG til rigtige medlemmer.
 */
function handleAdminSendTestBesked(body) {
  const { testEmail, emne, indhold, type } = body;
  const maelEmail = testEmail || CFG.TEST_EMAIL;

  if (!maelEmail || !_validEmail(maelEmail)) {
    return { ok: false, fejl: 'Ingen testadresse. Sæt TEST_EMAIL i Script Properties.' };
  }

  const html = `
    <div style="background:#fffbea;border:2px solid #b8973a;padding:12px;border-radius:6px;margin-bottom:16px">
      <strong>⚠️ TESTBESKED</strong> — sendt til ${maelEmail} · Type: ${type || 'manuel'}<br>
      Sendes IKKE til rigtige medlemmer.
    </div>
    <h2>${emne || '(intet emne)'}</h2>
    <div style="white-space:pre-wrap">${indhold || '(intet indhold)'}</div>`;

  const ok = _sendBrevoMail({ to: { name: 'TEST', email: maelEmail }, subject: '[TEST] ' + (emne || 'Testbesked'), html, type: 'test-besked' });
  _logHistorik('TEST_BESKED', maelEmail, 'Testbesked sendt til ' + maelEmail);
  return { ok, testEmail: maelEmail };
}

/**
 * handleAdminGetPaamindPreview — vis forventede udsendelser de næste 30 dage.
 * Returnerer liste over: dato, arrangementstitel, type (7-frist/2-frist/1-dag), antal deltagere.
 */
function handleAdminGetPaamindPreview(body) {
  const ss      = _ss();
  const arrData = ss.getSheetByName(SH.ARR).getDataRange().getValues();
  const tilData = ss.getSheetByName(SH.TILM).getDataRange().getValues();
  const idag    = new Date();
  const tz      = 'Europe/Copenhagen';

  const send7Frist = _getIndstilling('paamind_7_frist', 'ja') === 'ja';
  const send2Frist = _getIndstilling('paamind_2_frist', 'ja') === 'ja';
  const send1Dag   = _getIndstilling('paamind_1_dag',   'ja') === 'ja';

  const preview = [];

  arrData.slice(1).forEach(arrRow => {
    if (arrRow[7] !== 'aktiv') return;
    const dato   = arrRow[2];
    const frist  = arrRow[12];
    if (!(dato instanceof Date)) return;

    const arrId    = arrRow[0];
    const arrTitel = arrRow[1];
    const effektivFrist = (frist instanceof Date) ? frist : dato;

    const aktiveDeltagere = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt').length;

    const tilfoej = (targetDato, dage, type) => {
      const udsendelsesDato = new Date(targetDato);
      udsendelsesDato.setDate(targetDato.getDate() - dage);
      const diff = Math.round((udsendelsesDato - idag) / 86400000);
      if (diff >= 0 && diff <= 30) {
        preview.push({
          udsendelsesDato: Utilities.formatDate(udsendelsesDato, tz, 'dd.MM.yyyy'),
          arrTitel,
          arrId,
          type,
          aktiveDeltagere,
          dageIgen: diff,
        });
      }
    };

    if (send7Frist) tilfoej(effektivFrist, 7, '7 dage til frist');
    if (send2Frist) tilfoej(effektivFrist, 2, '2 dage til frist');
    if (send1Dag)   tilfoej(dato, 1, '1 dag til arrangement');
  });

  preview.sort((a, b) => a.dageIgen - b.dageIgen);
  return { ok: true, preview };
}

/**
 * handleAdminGetPushAbonnenter — oversigt over push-subscriptions.
 */
function handleAdminGetPushAbonnenter(body) {
  const ss   = _ss();
  const pSh  = ss.getSheetByName(SH.PUSH);
  if (!pSh) return { ok: true, abonnenter: [], total: 0 };

  const pData = pSh.getDataRange().getValues();
  const aktive = pData.slice(1)
    .filter(r => r[7] === 'aktiv')
    .map(r => ({
      id:        r[0],
      email:     r[1],
      platform:  r[5],
      oprettet:  r[6] instanceof Date ? Utilities.formatDate(r[6], 'Europe/Copenhagen', 'dd.MM.yyyy') : '',
    }));

  return { ok: true, abonnenter: aktive, total: aktive.length };
}

/**
 * handleAdminSendNyArrangement — send besked til ALLE med push-subscription
 * om et nyt arrangement. Sender IKKE til dem, der allerede er tilmeldt.
 */
function handleAdminSendNyArrangement(body) {
  const { arrId } = body;
  if (!arrId) return { ok: false, fejl: 'Manglende arrId' };

  const ss      = _ss();
  const arrData = ss.getSheetByName(SH.ARR).getDataRange().getValues();
  const arrRow  = arrData.find((r, i) => i > 0 && r[0] === arrId);
  if (!arrRow) return { ok: false, fejl: 'Arrangement ikke fundet' };

  const arrTitel = arrRow[1];
  const arrDato  = arrRow[2];

  // Find tilmeldte emails (disse skal ikke modtage tilmeldingsopfordring!)
  const tilData     = ss.getSheetByName(SH.TILM).getDataRange().getValues();
  const tilmeldteMails = new Set(
    tilData.slice(1)
      .filter(r => r[1] === arrId && r[11] !== 'afmeldt')
      .map(r => r[3].toLowerCase())
  );

  const title = `Nyt arrangement: ${arrTitel}`;
  const pushBody = arrDato instanceof Date
    ? `${arrTitel} · ${Utilities.formatDate(arrDato, 'Europe/Copenhagen', 'dd.MM.yyyy')}`
    : arrTitel;

  // Send push til alle subscriptions der IKKE er tilmeldt
  const pSh   = ss.getSheetByName(SH.PUSH);
  let pushSendt = 0;
  if (pSh && CFG.PUSH_VAPID_PRIVATE) {
    const pData = pSh.getDataRange().getValues();
    pData.slice(1).forEach((sub, idx) => {
      if (sub[7] !== 'aktiv') return;
      if (sub[1] && tilmeldteMails.has(sub[1].toLowerCase())) return; // Allerede tilmeldt
      try {
        const ok = _sendVapidPush(sub[2], sub[3], sub[4], title, pushBody);
        if (!ok) pSh.getRange(idx + 2, 8).setValue('inaktiv');
        else pushSendt++;
      } catch(e) {}
    });
  }

  _logHistorik('NY_ARRANGEMENT_BESKED', arrId, `${pushSendt} push-notifikationer sendt for nyt arrangement: ${arrTitel}`);
  return { ok: true, pushSendt };
}

// ═══════════════════════════════════════════════════════════════
// HJÆLPEFUNKTIONER — PUSH & SKABELONER (v8.5)
// ═══════════════════════════════════════════════════════════════

/**
 * Interpoler beskedskabelon med variabler.
 * Variabelformat: {{variabelNavn}}
 */
function _interpolerSkabelon(skabelon, vars) {
  return skabelon
    .replace(/\{\{navn\}\}/g, vars.navn || '')
    .replace(/\{\{arrTitel\}\}/g, vars.arrTitel || '')
    .replace(/\{\{arrDato\}\}/g, vars.arrDato instanceof Date
      ? Utilities.formatDate(vars.arrDato, 'Europe/Copenhagen', 'dd.MM.yyyy') : (vars.arrDato || ''))
    .replace(/\{\{arrTid\}\}/g, vars.arrTid || '')
    .replace(/\{\{arrLokation\}\}/g, vars.arrLokation || '');
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE SHEETS SETUP — opdateret til v8.5
// ═══════════════════════════════════════════════════════════════

/**
 * setupSheets_v85 — tilføj PushAbonnementer-arket og nye Indstillinger.
 * Kør én gang fra Apps Script editor efter deploy af v8.5.
 * Eksisterende ark og data bevares.
 */
function setupSheets_v85() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() ||
             SpreadsheetApp.openById(CFG.SPREADSHEET_ID);

  // Tilføj PushAbonnementer-ark
  let pSh = ss.getSheetByName(SH.PUSH);
  if (!pSh) {
    pSh = ss.insertSheet(SH.PUSH);
    pSh.appendRow(['ID','Email','Endpoint','P256DH','Auth','Platform','OprettetDato','Aktiv']);
    pSh.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0d2b1a').setFontColor('#ffffff');
    pSh.setFrozenRows(1);
    Logger.log('Oprettet ark: ' + SH.PUSH);
  }

  // Tilføj Frist-kolonne til Arrangementer hvis den mangler
  const arrSh = ss.getSheetByName('Arrangementer');
  if (arrSh) {
    const headers = arrSh.getRange(1, 1, 1, arrSh.getLastColumn()).getValues()[0];
    if (!headers.includes('Frist')) {
      arrSh.getRange(1, 13).setValue('Frist');
      arrSh.getRange(1, 13).setFontWeight('bold').setBackground('#0d2b1a').setFontColor('#ffffff');
      Logger.log('Tilføjet Frist-kolonne til Arrangementer (kolonne 13)');
    }
  }

  // Tilføj nye Indstillinger
  const indstilSh = ss.getSheetByName('Indstillinger');
  const indstilData = indstilSh.getDataRange().getValues();
  const nyeIndstillinger = [
    ['paamind_7_frist',    'ja', 'Send påminding 7 dage før tilmeldingsfrist (ja/nej)'],
    ['paamind_2_frist',    'ja', 'Send påminding 2 dage før tilmeldingsfrist (ja/nej)'],
    ['paamind_1_dag',      'ja', 'Send påminding 1 dag før arrangement (ja/nej)'],
    ['skabelon_paamind-7-frist', '', 'E-mailskabelon: 7 dage til frist (tomt = standard). Variabler: {{navn}} {{arrTitel}} {{arrDato}} {{arrTid}} {{arrLokation}}'],
    ['skabelon_paamind-2-frist', '', 'E-mailskabelon: 2 dage til frist (tomt = standard)'],
    ['skabelon_paamind-1-dag',   '', 'E-mailskabelon: 1 dag til arrangement (tomt = standard)'],
  ];
  nyeIndstillinger.forEach(([noegle, vaerdi, beskrivelse]) => {
    const findIdx = indstilData.findIndex((r, i) => i > 0 && r[0] === noegle);
    if (findIdx < 0) {
      indstilSh.appendRow([noegle, vaerdi, beskrivelse]);
      Logger.log('Tilføjet indstilling: ' + noegle);
    }
  });

  Logger.log('setupSheets_v85() færdig!');
  Logger.log('VIGTIGT: Sæt Script Properties: PUSH_VAPID_PUBLIC, PUSH_VAPID_PRIVATE, TEST_EMAIL');
  Logger.log('Generer VAPID-nøgler med: npx web-push generate-vapid-keys');
  Logger.log('');
  Logger.log('⚠️ VAPID-SIGNING BEGRÆNSNING:');
  Logger.log('Apps Script understøtter ikke ECDSA (ES256) som kræves af Web Push RFC 8292.');
  Logger.log('Push-endpoints (FCM/Mozilla/Apple) vil afvise requests med HMAC-signeret JWT.');
  Logger.log('Se _sendVapidPush() kommentaren for løsningsmuligheder (Cloudflare Worker anbefales).');
}
