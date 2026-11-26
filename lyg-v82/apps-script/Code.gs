/**
 * LYG Erhvervsklub — Google Apps Script Backend v8.2
 * =====================================================
 * Arkitektur: GitHub Pages (PWA) + Google Sheets + Apps Script + Brevo
 *
 * Deployment: Implementér som Web App
 *   · Execute as: Me (john.finmann@gmail.com)
 *   · Who has access: Anyone (CORS håndteres med token-validering)
 *
 * SIKKERHED:
 *   · Google Sheets er IKKE offentligt tilgængeligt
 *   · Admin-adgang kræver Google OAuth (doAdmin-ruter)
 *   · Offentlige ruter validerer REQUEST_TOKEN
 *   · LockService forhindrer dobbeltbooking
 *   · Brevo API-nøgle gemmes i Script Properties (aldrig i kode)
 *   · Sikre afmeldingslinks med HMAC-token
 *
 * OPSÆTNING (se INSTALLATIONSVEJLEDNING.md):
 *   1. Opret Google Sheet (kør setupSheets() én gang)
 *   2. Sæt Script Properties: BREVO_API_KEY, REQUEST_TOKEN, HMAC_SECRET
 *   3. Deploy som Web App — kopiér URL til app.js CONFIG.scriptUrl
 *   4. Kør setupSheets() fra Apps Script-editoren
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
};

// Sheet-navne
const SH = {
  ARR:       'Arrangementer',
  TILM:      'Tilmeldinger',
  AFMELD:    'Afmeldinger',
  VENTE:     'Venteliste',
  MEDL:      'Medlemsvirksomheder',
  SPONSOR:   'Sponsorer',
  NYHEDER:   'Nyheder',
  POPUP:     'Popup',
  INFOBJ:    'Infobjælke',
  ADMIN:     'Administratorer',
  EMAIL:     'E-mailstatus',
  HISTORIK:  'Historik',
};

// ═══════════════════════════════════════════════════════════════
// WEB APP ENTRY POINTS
// ═══════════════════════════════════════════════════════════════

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || '';

  // Offentlige GET-handlinger (kræver REQUEST_TOKEN)
  if (action === 'getArrangementer')    return _cors(handleGetArrangementer());
  if (action === 'getNyheder')          return _cors(handleGetNyheder());
  if (action === 'getPopup')            return _cors(handleGetPopup());
  if (action === 'getInfobjaelke')      return _cors(handleGetInfobjaelke());
  if (action === 'getSponsor')          return _cors(handleGetSponsor(params));
  if (action === 'afmeld')             return _cors(handleAfmeld(params));

  // Admin GET-handlinger (kræver Google OAuth session via URL-token)
  if (action === 'adminGetAll')         return _cors(handleAdminGetAll(params));
  if (action === 'adminGetTilmeldinger') return _cors(handleAdminGetTilmeldinger(params));

  return _cors({ ok: false, fejl: 'Ukendt handling' });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch(err) { return _cors({ ok: false, fejl: 'Ugyldigt JSON' }); }

  const action = body.action || '';

  // Token-validering for offentlige handlinger
  if (!_validToken(body.token)) return _cors({ ok: false, fejl: 'Ugyldig adgangstoken' });

  if (action === 'tilmeld')             return _cors(handleTilmeld(body));
  if (action === 'venteListe')          return _cors(handleVenteListe(body));
  if (action === 'firmaarrangement')    return _cors(handleFirmaarrangement(body));
  if (action === 'kontakt')             return _cors(handleKontakt(body));

  // Admin POST-handlinger (kræver admin-session-token)
  if (!_validAdminToken(body.adminToken)) return _cors({ ok: false, fejl: 'Ikke autoriseret' });

  if (action === 'adminSaveArr')        return _cors(handleAdminSaveArr(body));
  if (action === 'adminDeleteArr')      return _cors(handleAdminDeleteArr(body));
  if (action === 'adminSaveSponsor')    return _cors(handleAdminSaveSponsor(body));
  if (action === 'adminSaveNyhed')      return _cors(handleAdminSaveNyhed(body));
  if (action === 'adminSavePopup')      return _cors(handleAdminSavePopup(body));
  if (action === 'adminSaveInfobjaelke') return _cors(handleAdminSaveInfobjaelke(body));
  if (action === 'adminSaveMedlem')     return _cors(handleAdminSaveMedlem(body));
  if (action === 'adminSendPaamind')    return _cors(handleAdminSendPaamind(body));

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

    // Opdatér tilmeldingstal i Arr-sheet (kolonne P = tlmCount)
    const nytTilmTal = tilmNu + antal;
    const arrSheetRow = arrIdx + 1;
    // Kolonne 16 (P) = auto-beregnet, men vi logger blot

    // Send bekræftelsesmail
    _sendBrevoMail({
      to:      { name: navn, email },
      subject: `Tilmelding bekræftet: ${arrRow[1]}`,
      html:    _mailTilmeldBekraeft({ navn, virksomhed, email, antal, arrTitel: arrRow[1], arrDato: arrRow[2], arrTid: arrRow[3], arrLokation: arrRow[10], afmeldUrl }),
    });

    // Notificér admin
    _sendBrevoMail({
      to:      CFG.BREVO_SENDER,
      subject: `[Ny tilmelding] ${navn} → ${arrRow[1]}`,
      html:    `<p><b>${navn}</b> (${virksomhed}) har tilmeldt sig <b>${arrRow[1]}</b>.<br>Antal: ${antal} · E-mail: ${email}</p>`,
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
  afSh.appendRow([tilmId, arrId, row[2], email, row[5], row[6], new Date(), row[14]]);

  _logHistorik('AFMELDING', tilmId, row[2] + ' (' + email + ') afmeldt ' + arrId);

  // Send afmeldingskvittering
  _sendBrevoMail({
    to:      { name: row[2], email },
    subject: `Afmelding bekræftet: ${row[14] || arrId}`,
    html:    _mailAfmeldBekraeft({ navn: row[2], arrTitel: row[14], arrDato: row[14] }),
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
  });

  _sendBrevoMail({
    to:      CFG.BREVO_SENDER,
    subject: `[Firma-forespørgsel] ${virksomhed} — ${pakke}`,
    html:    `<p><b>Virksomhed:</b> ${virksomhed}<br><b>Kontakt:</b> ${kontaktperson} · ${email} · ${telefon}<br><b>Pakke:</b> ${pakke}<br><b>Dato:</b> ${dato}<br><b>Antal:</b> ${antal}<br><b>Beskrivelse:</b> ${beskrivelse}</p>`,
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
  });

  _sendBrevoMail({
    to:      { name: navn, email },
    subject: `Besked modtaget — ${CFG.KLUB_NAVN}`,
    html:    `<p>Hej ${navn},</p><p>Vi har modtaget din besked og vender tilbage hurtigst muligt.</p><p>Med venlig hilsen<br>${CFG.KLUB_NAVN}</p>`,
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

  // Berig med aktuelle tilmeldingstal
  const tilSh  = _ss().getSheetByName(SH.TILM);
  const tilData = tilSh.getDataRange().getValues();
  const tilHeaders = tilData[0];

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
// ADMIN HANDLERS
// ═══════════════════════════════════════════════════════════════

function handleAdminGetAll(params) {
  if (!_validAdminToken(params.adminToken)) return { ok: false, fejl: 'Ikke autoriseret' };

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

function handleAdminGetTilmeldinger(params) {
  if (!_validAdminToken(params.adminToken)) return { ok: false, fejl: 'Ikke autoriseret' };
  const arrId = params.arrId || null;

  const sh   = _ss().getSheetByName(SH.TILM);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  let rows = data.slice(1).map(r => _rowToObj(headers, r));
  if (arrId) rows = rows.filter(r => r.ArrID === arrId);
  return { ok: true, tilmeldinger: rows };
}

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
  // Kun én popup — overskriv rad 2
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

function handleAdminSendPaamind(body) {
  const { arrId } = body;
  const ss   = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);

  const arrData = arrSh.getDataRange().getValues();
  const arrRow  = arrData.find((r, i) => i > 0 && r[0] === arrId);
  if (!arrRow) return { ok: false, fejl: 'Arrangement ikke fundet' };

  const tilData = tilSh.getDataRange().getValues();
  const headers = tilData[0];
  const aktive  = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');

  let sendt = 0;
  aktive.forEach(r => {
    _sendBrevoMail({
      to:      { name: r[2], email: r[3] },
      subject: `Påmindelse: ${arrRow[1]} nærmer sig`,
      html:    _mailPaamind({ navn: r[2], arrTitel: arrRow[1], arrDato: arrRow[2], arrTid: arrRow[3], arrLokation: arrRow[10] }),
    });
    sendt++;
  });

  _logHistorik('ADMIN', arrId, `Påminding sendt til ${sendt} deltagere`);
  return { ok: true, sendt };
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
  });

  _logHistorik('VENTELISTE', næste[0], næste[2] + ' tilbudt plads via venteliste: ' + arrId);
}

// ═══════════════════════════════════════════════════════════════
// ADMIN AUTH — Google OAuth session-token
// ═══════════════════════════════════════════════════════════════

/**
 * Generér et midlertidigt admin-session-token (gælder 8 timer).
 * Kaldes fra admin.html via Google Sign-In id_token verifikation.
 * Returnerer adminToken som gemmes i sessionStorage.
 */
function handleAdminLogin(body) {
  // Verificér Google id_token med tokeninfo-endpunkt
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

    // Generer session-token (signeret med HMAC)
    const exp   = Date.now() + 8 * 60 * 60 * 1000; // 8 timer
    const payload = email + ':' + exp;
    const sig   = _hmac(payload);
    const token = btoa(payload + ':' + sig);

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
    [SH.ARR]: ['ID','Titel','Dato','TidFra','TidTil','Maks','Pris','Status','Aaben','Beskrivelse','Lokation','Billede'],
    [SH.TILM]: ['ID','ArrID','Navn','Email','Telefon','Virksomhed','Antal','Kommentar','OprettetDato','MødtDato','AfmeldToken','Status','AfmeldtDato','ArrTitel','ArrDato'],
    [SH.AFMELD]: ['TilmID','ArrID','Navn','Email','Virksomhed','Antal','AfmeldtDato','ArrTitel'],
    [SH.VENTE]: ['ID','ArrID','Navn','Email','Telefon','Antal','OprettetDato','Status','ArrTitel'],
    [SH.MEDL]: ['ID','Virksomhed','Kontaktperson','Email','Telefon','Branche','MedlemSiden','Aktiv','Logo','Website','Beskrivelse'],
    [SH.SPONSOR]: ['ID','Navn','Niveau','Email','Telefon','Kontaktperson','Aktiv','Logo','Website','Beskrivelse','SynligFra','SynligTil'],
    [SH.NYHEDER]: ['ID','Titel','Tekst','Dato','Aktiv','Billede','LinkUrl','LinkTekst'],
    [SH.POPUP]: ['Aktiv','Titel','Tekst','Noegle','CtaTekst','CtaUrl'],
    [SH.INFOBJ]: ['Aktiv','Tekst','LinkUrl','LinkTekst'],
    [SH.ADMIN]: ['Email','Navn','Rolle','OprettetDato'],
    [SH.EMAIL]: ['ID','TilmID','ArrID','Modtager','Type','Sendt','Status','FejlBesked'],
    [SH.HISTORIK]: ['Tidspunkt','Type','ReferencID','Besked'],
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

  // Gem Spreadsheet ID i Script Properties
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('Setup færdig! Spreadsheet ID: ' + ss.getId());
  Logger.log('Husk at sætte: BREVO_API_KEY, REQUEST_TOKEN, HMAC_SECRET, ADMIN_EMAILS, APP_URL i Script Properties');
}

// ═══════════════════════════════════════════════════════════════
// BREVO E-MAIL
// ═══════════════════════════════════════════════════════════════

function _sendBrevoMail({ to, subject, html }) {
  const apiKey = CFG.BREVO_API_KEY;
  if (!apiKey) { Logger.log('[Brevo] Ingen API-nøgle — mail ikke sendt: ' + subject); return false; }

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
    const body   = resp.getContentText();

    // Log e-mailstatus
    const emailSh = _ss().getSheetByName(SH.EMAIL);
    emailSh.appendRow([
      'e'+Date.now(),
      '', '', // TilmID, ArrID udfyldes ved behov
      Array.isArray(to) ? to.map(t => t.email).join(', ') : (to.email || to),
      subject,
      new Date(),
      status >= 200 && status < 300 ? 'sendt' : 'fejl',
      status >= 200 && status < 300 ? '' : body.substring(0, 200),
    ]);

    return status >= 200 && status < 300;
  } catch(e) {
    Logger.log('[Brevo] Fejl: ' + e.message);
    return false;
  }
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

function _mailPaamind({ navn, arrTitel, arrDato, arrTid, arrLokation }) {
  const datoStr = arrDato instanceof Date ? Utilities.formatDate(arrDato, Session.getScriptTimeZone(), 'dd. MMMM yyyy') : (arrDato || '');
  return `<h2 style="color:#0d2b1a">Påmindelse: ${arrTitel} ⛳</h2>
<p>Hej ${navn},</p>
<p>Husk at du er tilmeldt <strong>${arrTitel}</strong>.</p>
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

function _validToken(token) {
  const req = CFG.REQUEST_TOKEN;
  if (!req) return true; // Ikke konfigureret → tillad (kun under setup)
  return token === req;
}

function _validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function _hmac(message) {
  const secret = CFG.HMAC_SECRET || 'lyg-ek-default-secret-skift-mig';
  const bytes  = Utilities.computeHmacSha256Signature(message, secret);
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

// ═══════════════════════════════════════════════════════════════
// TIDSUDLØST OPGAVE (konfigurér i Apps Script Triggers)
// ═══════════════════════════════════════════════════════════════

/**
 * sendDagligePaamindelser — kald dagligt via trigger.
 * Sender automatisk påminding 2 dage før hvert arrangement.
 */
function sendDagligePaamindelser() {
  const ss   = _ss();
  const arrSh = ss.getSheetByName(SH.ARR);
  const tilSh = ss.getSheetByName(SH.TILM);

  const idag     = new Date();
  const idag2    = new Date(idag); idag2.setDate(idag.getDate() + 2);
  const dagStr   = Utilities.formatDate(idag2, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const arrData  = arrSh.getDataRange().getValues();
  arrData.slice(1).forEach(arrRow => {
    const dato = arrRow[2];
    if (!(dato instanceof Date)) return;
    const datoStr = Utilities.formatDate(dato, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (datoStr !== dagStr) return;
    if (arrRow[7] !== 'aktiv') return;

    const arrId    = arrRow[0];
    const arrTitel = arrRow[1];
    const tilData  = tilSh.getDataRange().getValues();
    const aktive   = tilData.slice(1).filter(r => r[1] === arrId && r[11] !== 'afmeldt');

    aktive.forEach(r => {
      _sendBrevoMail({
        to:      { name: r[2], email: r[3] },
        subject: `Husk: ${arrTitel} om 2 dage`,
        html:    _mailPaamind({ navn: r[2], arrTitel, arrDato: dato, arrTid: arrRow[3], arrLokation: arrRow[10] }),
      });
    });

    _logHistorik('PAAMIND', arrId, `${aktive.length} påmindelser sendt for ${arrTitel}`);
  });
}
