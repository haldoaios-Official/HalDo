/* ================================================================
   HALDO AI OS PRO MAX — v173 Care & Coordination Apps
   HalDo Pflegeprotokoll Pro + HalDo Arzttermine & Überweisungen Pro
   Uses the shared v167 AES-GCM/PBKDF2 vault; local only, no network.
   Documentation/organisation only — no diagnosis or treatment advice.
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo;
  var BUILD = '173.0.0';
  if (!H || !H.MedicalVault || typeof H.MedicalVault.registerConfig !== 'function' || H.__haldoV173CareApps) {
    if (H && !H.__haldoV173CareApps) console.error('[HalDo v173] Der verschlüsselte Medical-Vault-Dienst ist nicht verfügbar.');
    return;
  }
  H.__haldoV173CareApps = true;

  var apps = [
    {
      id: 'pflegeprotokoll-pro',
      title: 'HalDo Pflegeprotokoll Pro',
      icon: '🩺',
      version: BUILD,
      category: 'D',
      key: 'haldo_v173_care_documentation_vault',
      titleField: 'name',
      noteField: 'note',
      description: 'Pflegehandlungen, Beobachtungen und Übergaben geordnet dokumentieren. Diese App ersetzt keine fachliche Pflegebeurteilung oder ärztliche Anordnung.',
      requiredFields: ['name', 'date', 'category', 'activity'],
      fields: [
        ['name', 'Personenkürzel / lokale Bezeichnung', 'text', true],
        ['date', 'Dokumentationsdatum', 'date', true],
        ['time', 'Uhrzeit', 'time', false],
        ['category', 'Dokumentationsbereich', 'select', true, [
          'Grundpflege', 'Mobilität', 'Ernährung und Trinken', 'Ausscheidung',
          'Schlaf und Ruhe', 'Kommunikation', 'Begleitung', 'Beobachtung', 'Sonstiges'
        ]],
        ['activity', 'Durchgeführte Maßnahme / Beobachtung', 'text', true],
        ['result', 'Ergebnis / Reaktion / Rückmeldung', 'textarea', false],
        ['performedBy', 'Dokumentiert durch', 'text', false],
        ['handover', 'Weitergabe / offener Punkt', 'textarea', false],
        ['note', 'Zusätzliche Notiz', 'textarea', false]
      ],
      summary: function (record) {
        return [record.date, record.time, record.category, record.activity, record.performedBy ? 'Dokumentiert: ' + record.performedBy : '']
          .filter(Boolean).join(' · ');
      }
    },
    {
      id: 'arzttermine-pro',
      title: 'HalDo Arzttermine & Überweisungen Pro',
      icon: '📅',
      version: BUILD,
      category: 'D',
      key: 'haldo_v173_appointments_referrals_vault',
      titleField: 'name',
      noteField: 'note',
      description: 'Arzttermine, Überweisungen und deren Bearbeitungsstand übersichtlich verwalten. Angaben bitte mit Praxis und Originalunterlagen abgleichen.',
      requiredFields: ['name', 'date', 'provider', 'purpose'],
      fields: [
        ['name', 'Personenkürzel / lokale Bezeichnung', 'text', true],
        ['type', 'Vorgangsart', 'select', true, [
          'Arzttermin', 'Überweisung', 'Kontrolltermin', 'Untersuchung', 'Sonstiges'
        ]],
        ['date', 'Termin- / Ausstellungsdatum', 'date', true],
        ['time', 'Uhrzeit', 'time', false],
        ['provider', 'Praxis / Einrichtung', 'text', true],
        ['specialty', 'Fachrichtung', 'text', false],
        ['purpose', 'Anliegen laut eigener Unterlage', 'text', true],
        ['status', 'Terminstatus', 'select', true, [
          'Geplant', 'Bestätigt', 'Erledigt', 'Verschoben', 'Abgesagt'
        ]],
        ['referralStatus', 'Status der Überweisung', 'select', false, [
          'Nicht erforderlich', 'Angefragt', 'Ausgestellt', 'Eingelöst', 'Abgelaufen'
        ]],
        ['contact', 'Kontakt / Rückrufnummer', 'tel', false],
        ['note', 'Notiz / mitzubringende Unterlagen', 'textarea', false]
      ],
      summary: function (record) {
        return [record.date, record.time, record.type, record.provider, record.specialty, record.status, record.referralStatus]
          .filter(Boolean).join(' · ');
      }
    }
  ];

  var registered = [];
  var errors = [];
  apps.forEach(function (app) {
    try {
      H.MedicalVault.registerConfig(app);
      registered.push({ id:app.id, title:app.title });
      if (H.AppVoice && typeof H.AppVoice.command === 'function') {
        var appId = app.id;
        H.AppVoice.command(
          'haldo-open-' + appId,
          appId === 'pflegeprotokoll-pro'
            ? ['öffne pflegeprotokoll', 'starte haldo pflegeprotokoll']
            : ['öffne arzttermine', 'öffne überweisungen', 'starte haldo arzttermine'],
          function () {
            H[appId].open();
            return appId === 'pflegeprotokoll-pro'
              ? 'HalDo Pflegeprotokoll Pro wird geöffnet.'
              : 'HalDo Arzttermine und Überweisungen Pro wird geöffnet.';
          }
        );
      }
    } catch (error) {
      errors.push({ id:app.id, message:error && error.message ? error.message : String(error) });
      console.error('[HalDo v173] App konnte nicht registriert werden:', app.id, error);
    }
  });

  H.AppsV173 = {
    version: BUILD,
    apps: registered.slice(),
    errors: errors.slice(),
    status: function () {
      return apps.map(function (app) {
        return {
          id:app.id,
          ready:!!(H[app.id] && typeof H[app.id].open === 'function'),
          registered:registered.some(function (item) { return item.id === app.id; })
        };
      });
    }
  };
  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.namedCoreApps = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured.length : 0;

  console.info('[HalDo v173] Pflegeprotokoll Pro und Arzttermine & Überweisungen Pro registriert.', H.AppsV173);
})();
