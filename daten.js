// HalDo Datenbanken (ausgelagert für unbegrenzte Erweiterbarkeit)
window.KRANKHEITEN_DB = [
  { n: "Diabetes Typ 2", i: "E11", k: "Stoffwechsel", s: "Starker Durst, häufiges Wasserlassen, Müdigkeit, Gewichtsverlust", u: "Insulinresistenz, Übergewicht, Bewegungsmangel, Genetik", b: "Gesunde Ernährung, Sport, Metformin, Insulin" },
  { n: "Hypertonie (Bluthochdruck)", i: "I10", k: "Herz-Kreislauf", s: "Meist keine, Kopfschmerzen, Schwindel, Nasenbluten", u: "Genetik, Salz, Stress, Übergewicht, Rauchen", b: "Salzreduktion, Sport, ACE-Hemmer, Betablocker" },
  { n: "Asthma bronchiale", i: "J45", k: "Atemwege", s: "Atemnot, Pfeifen beim Ausatmen, Husten (nachts/morgens)", u: "Allergien, Genetik, Umweltreize, Infekte", b: "Salbutamol (Notfall), Kortison-Spray, Allergenmeidung" },
  { n: "Gastritis", i: "K29", k: "Magen-Darm", s: "Magenschmerzen, Übelkeit, Völlegefühl, Sodbrennen", u: "Helicobacter pylori, NSAR, Stress, Alkohol", b: "Protonenpumpenhemmer (Omeprazol), Antibiotika" },
  { n: "Migräne", i: "G43", k: "Neurologie", s: "Pulsierender Kopfschmerz (einseitig), Übelkeit, Lichtempfindlichkeit", u: "Genetik, Stress, Hormone, bestimmte Lebensmittel", b: "Triptane, Schmerzmittel, Ruhe in dunklem Raum" },
  { n: "Rückenschmerzen (Lumbago)", i: "M54", k: "Orthopädie", s: "Plötzlicher Schmerz im unteren Rücken, Bewegungseinschränkung", u: "Heben schwerer Lasten, Fehlhaltung, Bandscheibenvorfall", b: "Wärme, leichte Bewegung, NSAR, Physiotherapie" },
  { n: "Erkältung (Grippaler Infekt)", i: "J06", k: "Infektion", s: "Schnupfen, Halsschmerzen, Husten, leichtes Fieber", u: "Viren (Rhinoviren), Tröpfcheninfektion", b: "Ruhe, viel Trinken, Nasenspray, ggf. Ibuprofen" },
  { n: "Grippe (Influenza)", i: "J11", k: "Infektion", s: "Plötzliches hohes Fieber, Gliederschmerzen, trockener Husten", u: "Influenza-Viren, Tröpfcheninfektion", b: "Bettruhe, fiebersenkende Mittel, Neuraminidase-Hemmer" },
  { n: "Herzinsuffizienz", i: "I50", k: "Herz-Kreislauf", s: "Atemnot bei Belastung, geschwollene Beine, Müdigkeit", u: "Koronare Herzkrankheit, Bluthochdruck, Herzinfarkt", b: "ACE-Hemmer, Betablocker, Diuretika, salzarme Ernährung" },
  { n: "Koronare Herzkrankheit (KHK)", i: "I25", k: "Herz-Kreislauf", s: "Brustenge (Angina pectoris), Atemnot, Schmerzen im linken Arm", u: "Arteriosklerose, Rauchen, Cholesterin, Diabetes", b: "Stents, Bypass, Statine, Blutverdünner" },
  { n: "COPD", i: "J44", k: "Atemwege", s: "Husten mit Auswurf, Atemnot, Pfeifen", u: "Rauchen (90%), Staub, Luftverschmutzung", b: "Rauchstopp, Bronchodilatatoren, Kortison-Spray" },
  { n: "Depression", i: "F32", k: "Psychiatrie", s: "Traurigkeit, Interessenverlust, Schlafstörungen, Hoffnungslosigkeit", u: "Genetik, Neurotransmitter, Trauma, Stress", b: "Psychotherapie, Antidepressiva (SSRI)" },
  { n: "Arthrose", i: "M19", k: "Orthopädie", s: "Gelenkschmerzen (Knie, Hüfte), Morgensteifigkeit, Knirschen", u: "Verschleiß, Alter, Übergewicht, Fehlbelastung", b: "Bewegung, Physiotherapie, Schmerzmittel, Gelenkersatz" },
  { n: "Osteoporose", i: "M81", k: "Orthopädie", s: "Knochenbrüche ohne Grund, Rückenschmerzen, Größenverlust", u: "Östrogenmangel, Kalziummangel, Bewegungsmangel", b: "Kalzium, Vitamin D, Bisphosphonate, Krafttraining" },
  { n: "Schilddrüsenunterfunktion", i: "E03", k: "Hormone", s: "Müdigkeit, Gewichtszunahme, Kälteempfindlichkeit", u: "Hashimoto-Thyreoiditis, Jodmangel, OP", b: "L-Thyroxin (Tabletten), Jodzufuhr" },
  { n: "Akne", i: "L70", k: "Haut", s: "Pickel, Mitesser, fettige Haut, Narben", u: "Hormone, Talgüberproduktion, Bakterien", b: "Benzoylperoxid, Retinoide, Antibiotika" },
  { n: "Neurodermitis", i: "L20", k: "Haut", s: "Juckreiz, rote Hautstellen, trockene Haut, Ekzeme", u: "Genetik, Immunsystem, Stress, Allergene", b: "Kortisonsalben, Feuchtigkeitscremes, Antihistaminika" },
  { n: "Gicht", i: "M10", k: "Stoffwechsel", s: "Plötzliche, sehr starke Gelenkschmerzen (oft große Zehe)", u: "Harnsäurekristalle, Purin-reiche Ernährung, Alkohol", b: "Allopurinol, Colchicin, NSAR, Diät" },
  { n: "Nierensteine", i: "N20", k: "Harnwege", s: "Kolikartige Schmerzen (Flanke bis Leiste), Blut im Urin", u: "Kalziumoxalat-Kristalle, zu wenig Trinken, Genetik", b: "Viel Trinken, Schmerzmittel, ggf. OP (Lithotripsie)" },
  { n: "Anämie (Blutarmut)", i: "D50", k: "Blut", s: "Blässe, Müdigkeit, Atemnot, Schwindel", u: "Eisenmangel, Vitamin B12-Mangel, Blutverlust", b: "Eisentabletten, Vitamin B12-Spritzen" }
];

window.MEDIKAMENTE_DB = [
  { n: "Ibuprofen", w: "NSAR", s: "Schmerz, Entzündung, Fieber", d: "200-400mg alle 6-8h", ne: "Magenschmerzen, Nierenschäden" },
  { n: "Paracetamol", w: "Analgetikum", s: "Schmerz, Fieber", d: "500-1000mg alle 6h", ne: "Leberschäden (bei Überdosis)" },
  { n: "Amoxicillin", w: "Antibiotikum", s: "Bakterielle Infektionen", d: "500mg 3x täglich", ne: "Durchfall, Allergie" },
  { n: "Metformin", w: "Antidiabetikum", s: "Diabetes Typ 2", d: "500-1000mg 2x täglich", ne: "Magen-Darm-Beschwerden" },
  { n: "Omeprazol", w: "Protonenpumpenhemmer", s: "Sodbrennen, Gastritis", d: "20mg 1x täglich morgens", ne: "Kopfschmerzen, Durchfall" },
  { n: "Ramipril", w: "ACE-Hemmer", s: "Bluthochdruck, Herzinsuffizienz", d: "2.5-5mg 1x täglich", ne: "Trockener Husten" },
  { n: "Metoprolol", w: "Betablocker", s: "Bluthochdruck, Herzrhythmus", d: "47.5-95mg 1x täglich", ne: "Müdigkeit, kalte Hände" },
  { n: "Salbutamol", w: "Bronchodilatator", s: "Asthma, COPD", d: "Bei Bedarf inhalieren", ne: "Herzrasen, Zittern" },
  { n: "Atorvastatin", w: "Statin", s: "Hohes Cholesterin", d: "10-20mg abends", ne: "Muskelschmerzen" },
  { n: "ASS 100", w: "Thrombozytenaggregationshemmer", s: "Blutverdünnung, Herzinfarkt-Prophylaxe", d: "100mg 1x täglich", ne: "Magenschmerzen, Blutungen" }
];

window.LABOR_DB = [
  { n: "Blutzucker (nüchtern)", w: "70-100 mg/dl", k: "Stoffwechsel" },
  { n: "HbA1c", w: "< 5.7 %", k: "Stoffwechsel" },
  { n: "Cholesterin (gesamt)", w: "< 200 mg/dl", k: "Blutfette" },
  { n: "LDL-Cholesterin", w: "< 130 mg/dl", k: "Blutfette" },
  { n: "HDL-Cholesterin", w: "> 40 mg/dl", k: "Blutfette" },
  { n: "Triglyceride", w: "< 150 mg/dl", k: "Blutfette" },
  { n: "Hämoglobin (Hb)", w: "13-17 g/dl (M)", k: "Blutbild" },
  { n: "Leukozyten", w: "4.000-10.000 /µl", k: "Blutbild" },
  { n: "Thrombozyten", w: "150.000-400.000 /µl", k: "Blutbild" },
  { n: "CRP", w: "< 5 mg/l", k: "Entzündung" },
  { n: "Kreatinin", w: "0.7-1.2 mg/dl", k: "Niere" },
  { n: "eGFR", w: "> 90 ml/min", k: "Niere" },
  { n: "Harnstoff", w: "15-40 mg/dl", k: "Niere" },
  { n: "GOT (AST)", w: "< 50 U/l", k: "Leber" },
  { n: "GPT (ALT)", w: "< 50 U/l", k: "Leber" },
  { n: "Gamma-GT", w: "< 60 U/l", k: "Leber" },
  { n: "TSH", w: "0.4-4.0 mU/l", k: "Schilddrüse" },
  { n: "Kalium", w: "3.5-5.0 mmol/l", k: "Elektrolyte" },
  { n: "Natrium", w: "135-145 mmol/l", k: "Elektrolyte" },
  { n: "Kalzium", w: "2.1-2.6 mmol/l", k: "Elektrolyte" }
];
