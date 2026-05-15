import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { KIT_CONTENT } from '../lib/kitContent';

const router = Router();
router.use(auth);

// ── Kit catalog (static – content is pre-defined, no DB needed) ───────────────

export interface Kit {
  id: string;
  name: string;
  subject: string;
  subjectCategory: string;
  grade: string;
  duration: number; // minutes
  difficulty: 'Basis' | 'Standard' | 'Erweitert';
  tags: string[];
  includes: string[];
  description: string;
  isPro: boolean;
  isPopular?: boolean;
  emoji: string;
}

const KITS: Kit[] = [
  // ── MATHEMATIK ───────────────────────────────────────────────────────────────
  { id:'MATH_05_GRUNDRECHENARTEN', name:'Rechenmeister Grundschule',           subject:'Mathematik', subjectCategory:'math', grade:'5',    duration:30, difficulty:'Basis',     tags:['Addition','Subtraktion','Multiplikation','Division'],          includes:['Study Guide','Quiz (20 Fragen)','Flashcards (25)','Übungsblatt'],   description:'Grundrechenarten sicher beherrschen – mit Alltagsbeispielen und Tricks.',      isPro:false, emoji:'🔢' },
  { id:'MATH_07_BRUECHE',          name:'Bruchrechnung ohne Angst',             subject:'Mathematik', subjectCategory:'math', grade:'7',    duration:45, difficulty:'Standard',  tags:['Brüche','Kürzen','Erweitern','Addieren'],                      includes:['Study Guide','Quiz (25 Fragen)','Flashcards (30)','Klassenarbeit'], description:'Schritt-für-Schritt durch die Bruchrechnung – kein Chaos mehr.',           isPro:false, emoji:'½'  },
  { id:'MATH_08_PROZENTE',         name:'Prozent, Zins, Rabatt – Alltagsmathe', subject:'Mathematik', subjectCategory:'math', grade:'8',    duration:40, difficulty:'Standard',  tags:['Prozent','Zinsrechnung','Rabatt','Dreisatz'],                  includes:['Study Guide','Quiz (20 Fragen)','Flashcards (20)','Lernplan'],      description:'Prozentrechnung im Alltag: Rabatte, Zinsen, Steuern.',                    isPro:false, emoji:'%'  },
  { id:'MATH_09_QUADRATIC_001',    name:'Quadratische Funktionen – Komplett-Kit',subject:'Mathematik', subjectCategory:'math', grade:'9',   duration:60, difficulty:'Standard',  tags:['Parabel','Scheitelpunkt','Nullstellen','pq-Formel'],           includes:['Study Guide','Quiz (30 Fragen)','Flashcards (35)','Klassenarbeit','Lernplan'], description:'Alles zu quadratischen Funktionen – von der Parabel bis zur Lösung.', isPro:true, isPopular:true, emoji:'📈' },
  { id:'MATH_10_TRIGONOMETRIE',    name:'Sinus, Kosinus & Co. – Visual Learning',subject:'Mathematik', subjectCategory:'math', grade:'10',  duration:50, difficulty:'Standard',  tags:['Sinus','Kosinus','Tangens','Einheitskreis'],                   includes:['Study Guide','Quiz (25 Fragen)','Flashcards (30)','Übungsblatt'],   description:'Trigonometrie visuell verstehen – mit Einheitskreis und Merkhilfen.',     isPro:true, emoji:'📐' },
  { id:'MATH_11_ANALYSIS',         name:'Ableiten & Integrieren – Schritt für Schritt',subject:'Mathematik',subjectCategory:'math',grade:'11',duration:70,difficulty:'Erweitert', tags:['Ableitung','Integral','Kurvendiskussion','Kettenregel'],       includes:['Study Guide','Quiz (35 Fragen)','Flashcards (40)','Klassenarbeit'], description:'Analysis komplett: Ableitungsregeln, Integral, Kurvendiskussion.',       isPro:true, emoji:'∫'  },
  { id:'MATH_12_STOCHASTIK',       name:'Wahrscheinlichkeit & Statistik – Praxisnah',subject:'Mathematik',subjectCategory:'math',grade:'12', duration:55,difficulty:'Erweitert', tags:['Wahrscheinlichkeit','Statistik','Binomialverteilung','Normalverteilung'], includes:['Study Guide','Quiz (30 Fragen)','Flashcards (35)','Klassenarbeit'], description:'Stochastik ohne Angst – von Laplace bis Normalverteilung.',             isPro:true, emoji:'🎲' },
  { id:'MATH_ABITUR_FORMELN',      name:'Formelsammlung Abitur + Anwendungs-Quiz',subject:'Mathematik',subjectCategory:'math',grade:'12-13', duration:60,difficulty:'Erweitert', tags:['Abitur','Formeln','Analysis','Stochastik','Geometrie'],        includes:['Formelsammlung','Quiz (40 Fragen)','Spickzettel-PDF','Lernplan'],   description:'Alle Abiprüfungs-Formeln kompakt + Anwendungsaufgaben.',                 isPro:true, emoji:'🎓' },
  { id:'MATH_BUNDESWETTBEWERB',    name:'Mathe-Olympiade Vorbereitung',          subject:'Mathematik', subjectCategory:'math', grade:'9-13', duration:90, difficulty:'Erweitert', tags:['Wettbewerb','Kombinatorik','Zahlentheorie','Logik'],           includes:['Study Guide','Aufgabenpool','Lösungsstrategien','Trainingsplan'],  description:'Vorbereitung auf Mathe-Olympiade und Bundeswettbewerb.',                 isPro:true, emoji:'🏆' },
  { id:'MATH_REALWORLD',           name:'Mathe im Alltag: Budget, Kochen, DIY',  subject:'Mathematik', subjectCategory:'math', grade:'7-10', duration:30, difficulty:'Basis',     tags:['Alltagsmathe','Budget','Prozent','Maßeinheiten'],              includes:['Study Guide','Quiz (15 Fragen)','Aufgaben','Checkliste'],           description:'Praktische Mathematik für den Alltag – praxisnah und motivierend.',     isPro:false, emoji:'🛒' },

  // ── BIOLOGIE ─────────────────────────────────────────────────────────────────
  { id:'BIO_07_ZELLE',    name:'Zellbiologie – Vom Bauplan des Lebens',   subject:'Biologie', subjectCategory:'science', grade:'7',   duration:45, difficulty:'Standard', tags:['Zelle','Zellorganellen','Mitochondrien','Zellwand'],        includes:['Study Guide','Quiz (25 Fragen)','Flashcards (30)','Klassenarbeit'], description:'Zellaufbau, Organellen, Tier- vs. Pflanzenzelle – alles kompakt.', isPro:false, emoji:'🔬' },
  { id:'BIO_09_EVOLUTION', name:'Evolution verstehen – Beweise & Kontroversen', subject:'Biologie',subjectCategory:'science',grade:'9', duration:50,difficulty:'Standard', tags:['Evolution','Darwin','Selektion','Mutation','Anpassung'],    includes:['Study Guide','Quiz (25 Fragen)','Flashcards (25)','Lernplan'],      description:'Evolutionstheorie mit Belegen, Kontroversen und ethischer Reflexion.', isPro:true, emoji:'🦎' },
  { id:'BIO_11_GENETIK',   name:'DNA, Vererbung, Gentechnik – Ethik inkl.',    subject:'Biologie',subjectCategory:'science',grade:'11',duration:65,difficulty:'Erweitert', tags:['DNA','Mendel','Gentechnik','CRISPR','Ethik'],                includes:['Study Guide','Quiz (35 Fragen)','Flashcards (40)','Debatte-Kit'],  description:'Genetik von Mendel bis CRISPR – inklusive ethischer Diskussion.',    isPro:true, emoji:'🧬' },

  // ── CHEMIE ────────────────────────────────────────────────────────────────────
  { id:'CHEM_08_PERIODENSYSTEM', name:'PSE meistern – Trends & Ausnahmen',  subject:'Chemie', subjectCategory:'science', grade:'8',  duration:45, difficulty:'Standard',  tags:['PSE','Elektronenkonfiguration','Periodensystem','Trends'],  includes:['Study Guide','Quiz (25 Fragen)','Flashcards (35)','Poster-PDF'],    description:'Das Periodensystem verstehen, nicht auswendig lernen.',              isPro:false, emoji:'⚗️' },
  { id:'CHEM_10_REAKTIONEN',     name:'Chemische Reaktionen – Visualisiert',  subject:'Chemie', subjectCategory:'science', grade:'10', duration:50, difficulty:'Standard',  tags:['Reaktionstypen','Redox','Säure-Base','Fällungsreaktion'],    includes:['Study Guide','Quiz (30 Fragen)','Flashcards (30)','Übungsblatt'],   description:'Chemische Reaktionen mit Diagrammen und Eselsbrücken.',              isPro:true, emoji:'🧪' },
  { id:'CHEM_12_ORGANIK',        name:'Organische Chemie – Struktur & Funktion',subject:'Chemie',subjectCategory:'science', grade:'12', duration:70, difficulty:'Erweitert', tags:['Organik','Kohlenwasserstoffe','Isomerie','Reaktionsmechanismus'], includes:['Study Guide','Quiz (35 Fragen)','Flashcards (45)','Klassenarbeit'], description:'Organische Chemie von Methan bis Aromaten.',                         isPro:true, emoji:'🔗' },

  // ── PHYSIK ────────────────────────────────────────────────────────────────────
  { id:'PHYS_07_MECHANIK',  name:'Kräfte, Bewegung, Energie – Experimente', subject:'Physik', subjectCategory:'science', grade:'7',  duration:50, difficulty:'Standard',  tags:['Kraft','Energie','Arbeit','Hebel','Newton'],                 includes:['Study Guide','Quiz (25 Fragen)','Flashcards (25)','Experiment-Anleitungen'], description:'Mechanik mit Experimenten und Alltagsbeispielen.',          isPro:false, emoji:'⚡' },
  { id:'PHYS_09_ELEKTRO',   name:'Stromkreis, Ohm, Leistung – Sicher lernen',subject:'Physik', subjectCategory:'science', grade:'9',  duration:55, difficulty:'Standard',  tags:['Stromkreis','Ohmsches Gesetz','Leistung','Magnetfeld'],      includes:['Study Guide','Quiz (30 Fragen)','Flashcards (30)','Klassenarbeit'], description:'Elektrizitätslehre kompakt – von der Batterie bis zum Wechselstrom.', isPro:true, emoji:'🔌' },
  { id:'PHYS_11_QUANTEN',   name:'Quantenphysik für Einsteiger – Analogien', subject:'Physik', subjectCategory:'science', grade:'11', duration:60, difficulty:'Erweitert',  tags:['Quanten','Wellenmodell','Photoeffekt','Unschärfe'],          includes:['Study Guide','Quiz (25 Fragen)','Flashcards (30)','Vertiefung'],    description:'Quantenphysik mit Analogien und Denkexperimenten.',                  isPro:true, emoji:'⚛️' },
  { id:'SCI_EXPERIMENT_SAFETY', name:'Sicheres Experimentieren – Checklisten',subject:'Naturwissenschaften',subjectCategory:'science',grade:'5-10',duration:20,difficulty:'Basis', tags:['Sicherheit','Labor','Schutzkleidung','Gefahrstoffe'],        includes:['Checklisten','Quiz (15 Fragen)','Poster-PDF'],                      description:'Laborsicherheit für alle Fächer – Pflicht vor dem ersten Experiment.', isPro:false, emoji:'🦺' },

  // ── GESCHICHTE ────────────────────────────────────────────────────────────────
  { id:'HIST_08_WELTKRIEGE',   name:'Weltkriege – Ursachen, Verlauf, Folgen', subject:'Geschichte', subjectCategory:'humanities', grade:'8-9',  duration:60, difficulty:'Standard',  tags:['WW1','WW2','Weimarer Republik','Nationalsozialismus'],       includes:['Study Guide','Quiz (30 Fragen)','Flashcards (35)','Quellenarbeit'],  description:'Beide Weltkriege strukturiert: Ursachen, Verlauf, Folgen, Quellen.', isPro:false, emoji:'🌍' },
  { id:'HIST_11_KALTER_KRIEG', name:'Kalter Krieg – Perspektivenvergleich',   subject:'Geschichte', subjectCategory:'humanities', grade:'11',    duration:55, difficulty:'Erweitert',  tags:['Kalter Krieg','USA','UdSSR','Kubakrise','Mauerbau'],        includes:['Study Guide','Quiz (25 Fragen)','Flashcards (30)','Debatte-Kit'],   description:'Kalter Krieg aus West- und Ostperspektive.',                         isPro:true, emoji:'🏚️' },

  // ── GEOGRAPHIE ────────────────────────────────────────────────────────────────
  { id:'GEO_09_KLIMA',          name:'Klimawandel – Wissenschaft & Politik',  subject:'Geographie', subjectCategory:'humanities', grade:'9',    duration:55, difficulty:'Standard',  tags:['Klimawandel','Treibhauseffekt','Klimamodelle','Politik'],   includes:['Study Guide','Quiz (25 Fragen)','Flashcards (25)','Debatte-Kit'],   description:'Klimawandel: Fakten, Folgen, Maßnahmen – politisch neutral.',        isPro:false, emoji:'🌡️' },
  { id:'GEO_12_STADTENTWICKLUNG',name:'Urbanisierung – Fallstudien global',   subject:'Geographie', subjectCategory:'humanities', grade:'12',   duration:50, difficulty:'Erweitert',  tags:['Urbanisierung','Megacities','Gentrifizierung','Slums'],     includes:['Study Guide','Quiz (20 Fragen)','Flashcards (25)','Projektaufgabe'], description:'Stadtentwicklung mit Fallstudien aus Lagos, Mumbai, Berlin.',        isPro:true, emoji:'🏙️' },

  // ── POLITIK ───────────────────────────────────────────────────────────────────
  { id:'POL_10_DEMOKRATIE',  name:'Demokratie verstehen – Systeme im Vergleich', subject:'Politik', subjectCategory:'humanities', grade:'10', duration:50, difficulty:'Standard', tags:['Demokratie','Parlamentarismus','Gewaltenteilung','Wahlen'],  includes:['Study Guide','Quiz (25 Fragen)','Flashcards (25)','Debatte'],        description:'Demokratiemodelle: Deutschland, USA, Frankreich im Vergleich.',       isPro:false, emoji:'🗳️' },
  { id:'POL_12_WIRTSCHAFT',  name:'Wirtschaftspolitik – Modelle & Debatten',    subject:'Politik', subjectCategory:'humanities', grade:'12', duration:55, difficulty:'Erweitert', tags:['Wirtschaftspolitik','Konjunktur','Inflation','Soziale Marktwirtschaft'], includes:['Study Guide','Quiz (25 Fragen)','Flashcards (30)','Erörterung'],    description:'Wirtschaftspolitische Modelle und aktuelle Debatten.',               isPro:true, emoji:'📊' },

  // ── PHILOSOPHIE & RELIGION ────────────────────────────────────────────────────
  { id:'PHIL_11_ETHIK',         name:'Ethische Dilemmata – Argumentationstraining', subject:'Philosophie', subjectCategory:'humanities', grade:'11', duration:45, difficulty:'Erweitert', tags:['Ethik','Kant','Utilitarismus','Trolley-Problem'],   includes:['Study Guide','Quiz (20 Fragen)','Dilemma-Karten','Debatte-Kit'],    description:'Ethische Grundpositionen und Argumentationsstrategien.',             isPro:true, emoji:'🤔' },
  { id:'REL_09_WELTRELIGIONEN', name:'Religionen im Dialog – Respektvoll',         subject:'Religion',    subjectCategory:'humanities', grade:'9',  duration:45, difficulty:'Standard',  tags:['Christentum','Islam','Judentum','Buddhismus','Hinduismus'],includes:['Study Guide','Quiz (20 Fragen)','Flashcards (30)','Vergleichstabelle'], description:'Weltreligionen respektvoll und sachlich im Vergleich.',             isPro:false, emoji:'☮️' },
  { id:'DEBATE_PREP_KIT',       name:'Debattieren lernen – Struktur & Rhetorik',   subject:'Deutsch',     subjectCategory:'languages',  grade:'8-12',duration:40, difficulty:'Standard',  tags:['Debatte','Rhetorik','Argumentation','Sprechertraining'],    includes:['Leitfaden','Übungsszenarien','Bewertungsrubrik','Checkliste'],       description:'Strukturiert und überzeugend debattieren.',                          isPro:true, emoji:'🎙️' },
  { id:'SOURCE_ANALYSIS_KIT',   name:'Quellenarbeit – Historische Methode',        subject:'Geschichte',  subjectCategory:'humanities', grade:'9-13',duration:40, difficulty:'Erweitert', tags:['Quellenanalyse','Methode','Hermeneutik','Kritik'],           includes:['Methoden-Guide','Übungsquellen','Bewertungsrubrik','Beispiele'],     description:'Historische Quellen methodisch analysieren und interpretieren.',    isPro:true, emoji:'📜' },

  // ── DEUTSCH ───────────────────────────────────────────────────────────────────
  { id:'DE_07_RECHTSCHREIBUNG', name:'Rechtschreibung – Regeln & Tricks',           subject:'Deutsch', subjectCategory:'languages', grade:'7',    duration:35, difficulty:'Basis',     tags:['Rechtschreibung','Kommaregeln','Groß-Kleinschreibung','Doppelkonsonanten'], includes:['Study Guide','Quiz (30 Fragen)','Flashcards (30)','Übungsblatt'], description:'Die wichtigsten Rechtschreibregeln mit Merktricks.',  isPro:false, emoji:'✍️' },
  { id:'DE_09_TEXTANALYSE',     name:'Texte analysieren – Methode + Beispiele',     subject:'Deutsch', subjectCategory:'languages', grade:'9',    duration:50, difficulty:'Standard',  tags:['Textanalyse','Stilmittel','Erzählperspektive','Inhaltsangabe'],          includes:['Study Guide','Quiz (20 Fragen)','Analyseraster','Musterlösungen'],  description:'Literarische und Sachtexte sicher analysieren.',     isPro:true, emoji:'📖' },
  { id:'DE_11_ERÖTERUNG',       name:'Erörterung schreiben – Aufbau & Formulierung',subject:'Deutsch', subjectCategory:'languages', grade:'11',   duration:55, difficulty:'Erweitert',  tags:['Erörterung','Argumentation','Einleitung','Schluss'],                    includes:['Study Guide','Beispielaufsätze','Formulierungshilfen','Checkliste'],description:'Dialektische und lineare Erörterung mit Bewertungsrubrik.',  isPro:true, emoji:'📝' },

  // ── ENGLISCH ─────────────────────────────────────────────────────────────────
  { id:'EN_A2_VOCAB_BUILDER', name:'Englisch A2 – 500 Essential Words',         subject:'Englisch', subjectCategory:'languages', grade:'6-7',  duration:40, difficulty:'Basis',     tags:['Vokabeln','A2','Alltagsenglisch','Topics'],               includes:['Flashcards (500)','Quiz (40 Fragen)','Themensets','Lernplan'],      description:'500 wichtigste A2-Vokabeln in Themenpaketen.',                  isPro:false, emoji:'🇬🇧' },
  { id:'EN_B1_GRAMMAR_FIX',   name:'Englisch B1 – Typische Fehler & Fixes',     subject:'Englisch', subjectCategory:'languages', grade:'8-9',  duration:45, difficulty:'Standard',  tags:['Grammatik','B1','Present Perfect','Conditional','Tenses'],includes:['Study Guide','Quiz (35 Fragen)','Flashcards (30)','Übungsblatt'],   description:'Die häufigsten B1-Grammatikfehler mit klaren Erklärungen.',    isPro:false, emoji:'📚' },
  { id:'EN_C1_ACADEMIC',      name:'Academic English – Essay Writing Kit',      subject:'Englisch', subjectCategory:'languages', grade:'11-13',duration:65, difficulty:'Erweitert',  tags:['Essay','C1','Academic Writing','Argumentation'],          includes:['Writing Guide','Beispiel-Essays','Phrasen-Bank','Checkliste'],     description:'C1-Niveau: Akademische Aufsätze auf Englisch schreiben.',      isPro:true, emoji:'🎓' },

  // ── WEITERE SPRACHEN ──────────────────────────────────────────────────────────
  { id:'FR_A1_STARTER',        name:'Französisch A1 – Erste Schritte',          subject:'Französisch', subjectCategory:'languages', grade:'6-7', duration:35, difficulty:'Basis',    tags:['A1','Vokabeln','Aussprache','Basisdialoge'],              includes:['Study Guide','Flashcards (200)','Quiz (25 Fragen)','Audioskripte'],  description:'Französisch-Einstieg mit Aussprache-Hinweisen.',               isPro:false, emoji:'🇫🇷' },
  { id:'ES_B1_CONVERSATION',   name:'Spanisch B1 – Konversationstraining',      subject:'Spanisch',    subjectCategory:'languages', grade:'9-11',duration:40, difficulty:'Standard', tags:['B1','Konversation','Subjuntivo','Alltag'],                includes:['Dialogkarten','Quiz (20 Fragen)','Phrasen-Bank','Rollenspielen'],   description:'Spanisch sprechen üben – typische B1-Situationen.',            isPro:true, emoji:'🇪🇸' },
  { id:'LATIN_VOCAB_CORE',     name:'Latein – 300 Kernvokabeln mit Eselsbrücken',subject:'Latein',     subjectCategory:'languages', grade:'7-10',duration:50, difficulty:'Standard', tags:['Latein','Vokabeln','Etymologie','Memoria'],               includes:['Flashcards (300)','Quiz (30 Fragen)','Eselsbrücken-Liste'],        description:'300 Latein-Kernvokabeln mit Gedächtnistricks.',                isPro:true, emoji:'🏛️' },
  { id:'PRONUNCIATION_KIT',    name:'Aussprache-Training – Phonetics + Practice',subject:'Englisch',   subjectCategory:'languages', grade:'7-12',duration:30, difficulty:'Standard', tags:['Aussprache','Phonetics','IPA','British','American'],      includes:['Lautschrift-Guide','Übungssets','Minimal-Pairs'],                  description:'Englische Aussprache systematisch verbessern.',                isPro:true, emoji:'🗣️' },

  // ── INFORMATIK ────────────────────────────────────────────────────────────────
  { id:'CODE_PYTHON_BASICS',   name:'Python für Anfänger – Interaktive Übungen', subject:'Informatik', subjectCategory:'digital', grade:'8-12', duration:60, difficulty:'Basis',    tags:['Python','Variablen','Schleifen','Funktionen','Debugging'],includes:['Study Guide','Coding-Aufgaben (20)','Quiz (25 Fragen)','Projekt'], description:'Python von Null: Variablen, Schleifen, Funktionen.',            isPro:false, emoji:'🐍' },
  { id:'CODE_WEB_HTMLCSS',     name:'Web Development – HTML/CSS Projekt',        subject:'Informatik', subjectCategory:'digital', grade:'8-12', duration:70, difficulty:'Standard', tags:['HTML','CSS','Responsive Design','Flexbox','Portfolio'],   includes:['Tutorial','Projekt-Template','Quiz (20 Fragen)','Checkliste'],     description:'Eine eigene Webseite bauen – von HTML bis responsivem Design.', isPro:true, emoji:'🌐' },
  { id:'DATA_PRIVACY_KIT',     name:'Datenschutz – Praktische Tipps für Teens',  subject:'Informatik', subjectCategory:'digital', grade:'7-10', duration:30, difficulty:'Basis',    tags:['DSGVO','Datenschutz','Social Media','Privatsphäre'],      includes:['Guide','Quiz (20 Fragen)','Checkliste','Poster'],                  description:'DSGVO und Datenschutz alltagsnah erklärt.',                    isPro:false, emoji:'🔐' },
  { id:'ALGORITHM_THINKING',   name:'Algorithmisches Denken – Puzzles & Lösungen',subject:'Informatik',subjectCategory:'digital', grade:'8-11', duration:45, difficulty:'Standard', tags:['Algorithmus','Sortieren','Suchen','Pseudocode','Logik'],   includes:['Study Guide','Puzzle-Set (15)','Quiz (20 Fragen)','Flowcharts'],   description:'Problemlösen wie ein Informatiker: Algorithmen und Logik.',     isPro:true, emoji:'🧩' },
  { id:'AI_LITERACY_INTRO',    name:'KI verstehen – Chancen & Risiken neutral',  subject:'Informatik', subjectCategory:'digital', grade:'9-12', duration:40, difficulty:'Standard', tags:['KI','Machine Learning','Ethik','ChatGPT','Bias'],          includes:['Study Guide','Quiz (25 Fragen)','Diskussionskarten'],              description:'KI sachlich verstehen: Was kann sie, was nicht, welche Risiken?', isPro:false, emoji:'🤖' },
  { id:'CYBERSECURITY_TEENS',  name:'Sicher online – Passwort, Phishing, Social Media',subject:'Informatik',subjectCategory:'digital',grade:'7-10',duration:25,difficulty:'Basis',  tags:['Cybersecurity','Passwort','Phishing','Social Media'],     includes:['Guide','Quiz (20 Fragen)','Checkliste','Rollenspiele'],            description:'Online-Sicherheit praktisch: Passwörter, Betrug erkennen.',    isPro:false, emoji:'🛡️' },
  { id:'ROBOTICS_CONCEPTS',    name:'Robotik Grundlagen – Logik + Steuerung',    subject:'Informatik', subjectCategory:'digital', grade:'7-10', duration:45, difficulty:'Standard', tags:['Robotik','Sensoren','Aktuatoren','Programmierung','Logik'],includes:['Study Guide','Quiz (20 Fragen)','Projekt-Ideen'],                  description:'Robotik verstehen: Aufbau, Steuerung und Programmlogik.',       isPro:true, emoji:'🤖' },
  { id:'APP_IDEATION_KIT',     name:'App entwickeln – Von der Idee zum Prototyp',subject:'Informatik', subjectCategory:'digital', grade:'9-13', duration:60, difficulty:'Erweitert', tags:['App Design','UX','Wireframe','Prototyp','Agile'],          includes:['Design-Guide','Worksheet','Bewertungsrubrik','Ressourcenliste'],   description:'Von der App-Idee zum klickbaren Prototyp.',                    isPro:true, emoji:'📱' },
  { id:'DIGITAL_WELLBEING',    name:'Digitale Balance – Fokus & Pausen planen',  subject:'Gesundheit', subjectCategory:'specialty', grade:'7-12', duration:20, difficulty:'Basis',   tags:['Digitalbalance','Screentime','Pomodoro','Fokus'],          includes:['Guide','Checkliste','Wochenplan-Template'],                        description:'Gesund mit Bildschirmen umgehen und Fokus trainieren.',        isPro:false, emoji:'🧘' },
  { id:'PRESENTATION_TECH',    name:'Präsentieren – Slides, Rhetorik, Nervosität',subject:'Alle',      subjectCategory:'specialty', grade:'8-13', duration:40, difficulty:'Standard', tags:['Präsentation','PowerPoint','Rhetorik','Lampenfieber'],    includes:['Guide','Foliencheckliste','Bewertungsrubrik','Übungen'],           description:'Überzeugende Präsentationen halten – trotz Nervosität.',       isPro:false, emoji:'🎤' },

  // ── SPECIALTY KITS ────────────────────────────────────────────────────────────
  { id:'EXAM_ANXIETY_KIT',       name:'Prüfungsangst – Strategien & Mindset',      subject:'Alle',       subjectCategory:'specialty', grade:'7-13', duration:25, difficulty:'Basis',    tags:['Prüfungsangst','Mindset','Atemübungen','Stressbewältigung'],includes:['Guide','Übungen','Wochenplan','Selbsttest'],                       description:'Prüfungsangst überwinden mit bewährten Strategien.',           isPro:false, emoji:'😤' },
  { id:'TIME_MANAGEMENT_TEEN',   name:'Zeitmanagement – Pomodoro + Prioritäten',   subject:'Alle',       subjectCategory:'specialty', grade:'7-13', duration:25, difficulty:'Basis',    tags:['Zeitmanagement','Pomodoro','Eisenhower','To-Do'],           includes:['Guide','Wochenplaner','Checkliste','Tipps'],                       description:'Lernzeit clever einteilen – nie wieder auf den letzten Drücker.', isPro:false, emoji:'⏱️' },
  { id:'NOTE_TAKING_MASTER',     name:'Mitschreiben – Cornell, Mindmap, Digital',  subject:'Alle',       subjectCategory:'specialty', grade:'7-13', duration:30, difficulty:'Basis',    tags:['Mitschreiben','Cornell','Mindmap','Sketchnotes'],           includes:['Methoden-Guide','Vorlagen','Quiz (15 Fragen)'],                    description:'3 Notiz-Methoden im Vergleich – finde deine Lieblingsmethode.', isPro:false, emoji:'📓' },
  { id:'GROUP_STUDY_KIT',        name:'Lerngruppe organisieren – Rollen & Methoden',subject:'Alle',      subjectCategory:'specialty', grade:'8-13', duration:30, difficulty:'Standard', tags:['Lerngruppe','Peer-Learning','Rollen','Kollaboration'],      includes:['Leitfaden','Rollenverteilung','Methodenkarten','Evaluationsbogen'],description:'Eine produktive Lerngruppe aufbauen und führen.',              isPro:false, emoji:'👥' },
  { id:'TEACHER_RESOURCE_KIT',   name:'Lehrer: Material erstellen in 10 Min',      subject:'Alle',       subjectCategory:'specialty', grade:'alle', duration:10, difficulty:'Standard', tags:['Lehrer','Materialerstellung','Zeitsparen','Differenzierung'],includes:['Quick-Guide','Vorlagen','Checkliste','Tipps'],                     description:'Lehrern schnell hochwertiges Unterrichtsmaterial erstellen.',  isPro:true, emoji:'👩‍🏫' },
  { id:'PARENT_GUIDE_KIT',       name:'Eltern: Kinder unterstützen ohne Druck',    subject:'Alle',       subjectCategory:'specialty', grade:'alle', duration:20, difficulty:'Basis',    tags:['Eltern','Motivation','Lernumgebung','Gespräche'],           includes:['Guide','Gesprächsleitfaden','Checkliste'],                         description:'Wie Eltern Lernmotivation fördern – ohne Stress.',             isPro:false, emoji:'👨‍👩‍👧' },
  { id:'DYSLEXIA_FRIENDLY_KIT',  name:'Lernen bei Lese-Rechtschreib-Schwäche',    subject:'Alle',       subjectCategory:'specialty', grade:'5-10', duration:30, difficulty:'Basis',    tags:['LRS','Legasthenie','Strategien','Barrierefreiheit'],        includes:['Guide','Strategien','Ressourcenliste','Übungen'],                  description:'LRS-freundliches Lernen mit bewährten Kompensationsstrategien.', isPro:false, emoji:'📗' },
  { id:'ADHD_FOCUS_KIT',         name:'Fokus halten – Struktur & Belohnung',       subject:'Alle',       subjectCategory:'specialty', grade:'6-12', duration:25, difficulty:'Basis',    tags:['ADHS','Fokus','Belohnung','Struktur','Pausen'],             includes:['Guide','Tagesplan','Belohnungssystem','Checkliste'],               description:'Lernen mit ADHS: Struktur, Pausen und Belohnungen nutzen.',   isPro:false, emoji:'🎯' },
  { id:'BILINGUAL_LEARN_KIT',    name:'Zweisprachig lernen – Transfer nutzen',     subject:'Alle',       subjectCategory:'specialty', grade:'6-10', duration:30, difficulty:'Standard', tags:['Bilingual','Sprachentransfer','Mehrsprachigkeit'],          includes:['Guide','Strategien','Übungen'],                                    description:'Mehrsprachigkeit als Lernvorteil nutzen.',                    isPro:true, emoji:'🌐' },
  { id:'CAREER_ORIENTATION_KIT', name:'Berufswahl – Stärken, Interessen, Wege',   subject:'Alle',       subjectCategory:'specialty', grade:'9-12', duration:45, difficulty:'Standard', tags:['Berufswahl','Stärken','Berufstest','Praktikum'],            includes:['Self-Assessment','Berufsfelder-Überblick','Aktionsplan'],          description:'Systematisch den richtigen Berufsweg finden.',                isPro:false, emoji:'🗺️' },
];

// Free kit IDs (accessible without PRO)
const FREE_KIT_IDS = new Set(KITS.filter(k => !k.isPro).map(k => k.id));

// GET /api/kits — list all kits (with pro status)
router.get('/', async (req: AuthRequest, res) => {
  const { subject, search, difficulty, free } = req.query as Record<string, string>;
  const user = await (require('../lib/prisma').default as any).user.findUnique({
    where: { id: req.userId! },
    select: { subscriptionTier: true },
  }).catch(() => null);

  const isPro = user && ['premium', 'school'].includes(user.subscriptionTier);

  let kits = KITS.map(k => ({
    ...k,
    locked: k.isPro && !isPro,
  }));

  if (subject && subject !== 'all') kits = kits.filter(k => k.subjectCategory === subject);
  if (difficulty && difficulty !== 'all') kits = kits.filter(k => k.difficulty === difficulty);
  if (free === 'true') kits = kits.filter(k => !k.isPro);
  if (search) {
    const q = search.toLowerCase();
    kits = kits.filter(k =>
      k.name.toLowerCase().includes(q) ||
      k.subject.toLowerCase().includes(q) ||
      k.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({ kits, total: kits.length, isPro });
});

// GET /api/kits/:id — single kit detail
router.get('/:id', async (req: AuthRequest, res) => {
  const kit = KITS.find(k => k.id === req.params.id);
  if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }

  const user = await (require('../lib/prisma').default as any).user.findUnique({
    where: { id: req.userId! },
    select: { subscriptionTier: true },
  }).catch(() => null);
  const isPro = user && ['premium', 'school'].includes(user.subscriptionTier);

  if (kit.isPro && !isPro) {
    res.status(402).json({ error: 'PRO required', message: 'Upgrade auf LearnPro für Zugriff auf alle 100+ Kits.' });
    return;
  }

  res.json({ kit });
});

// GET /api/kits/:id/content — full study content (flashcards, quiz, study guide)
router.get('/:id/content', async (req: AuthRequest, res) => {
  const kit = KITS.find(k => k.id === req.params.id);
  if (!kit) { res.status(404).json({ error: 'Kit not found' }); return; }

  const user = await (require('../lib/prisma').default as any).user.findUnique({
    where: { id: req.userId! },
    select: { subscriptionTier: true },
  }).catch(() => null);
  const isPro = user && ['premium', 'school'].includes(user.subscriptionTier);

  if (kit.isPro && !isPro) {
    res.status(402).json({ error: 'PRO required' }); return;
  }

  const content = KIT_CONTENT[kit.id];
  if (!content) {
    res.status(404).json({ error: 'Kein Inhalt verfügbar' }); return;
  }

  res.json(content);
});

export default router;
