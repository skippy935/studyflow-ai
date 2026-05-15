export interface Flashcard { front: string; back: string; }
export interface QuizQuestion { q: string; opts: string[]; correct: number; exp: string; }
export interface KitContentEntry {
  studyGuide: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export const KIT_CONTENT: Record<string, KitContentEntry> = {

  MATH_05_GRUNDRECHENARTEN: {
    studyGuide: `# Grundrechenarten – Dein Lernguide

## Die vier Grundrechenarten

### Addition (+)
Beim Addieren werden Zahlen zusammengezählt. Die Reihenfolge spielt keine Rolle (Kommutativgesetz): **3 + 5 = 5 + 3 = 8**

**Trick:** Runde zuerst auf runde Zahlen, dann korrigiere.
Beispiel: 47 + 38 → 47 + 40 − 2 = 85

### Subtraktion (−)
Beim Subtrahieren wird eine Zahl von einer anderen abgezogen.
Beispiel: 83 − 47 → 83 − 50 + 3 = 36

**Trick:** Ergänzungsmethode – wie viel fehlt bis zur nächsten runden Zahl?
57 − 29: von 29 bis 30 = 1, von 30 bis 57 = 27 → Ergebnis: 28

### Multiplikation (×)
Mehrfaches Addieren. Das kleine 1×1 auswendig lernen ist Pflicht!
**Tricks für das 9er-Reihe:** 9 × 7 → Finger-Trick: hebe den 7. Finger, links 6, rechts 3 → 63

### Division (÷)
Teilen ist die Umkehrung der Multiplikation.
Beispiel: 72 ÷ 8 = ? → Frage: 8 × ? = 72 → Antwort: 9

## Reihenfolge (Punkt vor Strich)
**Multiplikation und Division** werden vor **Addition und Subtraktion** berechnet.
Beispiel: 3 + 4 × 2 = 3 + 8 = **11** (nicht 14!)

Klammern haben immer Vorrang: (3 + 4) × 2 = 7 × 2 = **14**

## Rechengesetze
| Gesetz | Beispiel |
|--------|---------|
| Kommutativgesetz | a + b = b + a |
| Assoziativgesetz | (a + b) + c = a + (b + c) |
| Distributivgesetz | a × (b + c) = a×b + a×c |

## Alltagsbeispiele
- Einkaufen: 3 Äpfel à €0,80 = 3 × 0,80 = **€2,40**
- Zeit: 2 h 45 min + 1 h 30 min = **4 h 15 min**
- Rezept verdoppeln: 250 g × 2 = **500 g**`,

    flashcards: [
      { front: "Was ist das Kommutativgesetz der Addition?", back: "Die Reihenfolge der Summanden spielt keine Rolle: a + b = b + a\nBeispiel: 4 + 7 = 7 + 4 = 11" },
      { front: "Was bedeutet 'Punkt vor Strich'?", back: "Multiplikation (×) und Division (÷) werden vor Addition (+) und Subtraktion (−) berechnet.\nBeispiel: 2 + 3 × 4 = 2 + 12 = 14" },
      { front: "Was ist das Distributivgesetz?", back: "a × (b + c) = a×b + a×c\nBeispiel: 5 × (3 + 4) = 5×3 + 5×4 = 15 + 20 = 35" },
      { front: "Wie rechnet man 9 × 7 mit dem Finger-Trick?", back: "Hebe den 7. Finger hoch: links davon 6 Finger, rechts 3 Finger → 63" },
      { front: "Was ist die Ergänzungsmethode bei der Subtraktion?", back: "Statt zu subtrahieren, zählt man auf: Wie viel fehlt von der kleinen zur großen Zahl?\n53 − 27: von 27→30 = 3, von 30→53 = 23 → Ergebnis: 26" },
      { front: "Wie teilt man 84 ÷ 6?", back: "Frage: 6 × ? = 84\nKleinere bekannte Fakten: 6×10=60, 6×14=84 → Antwort: 14" },
      { front: "Was ist das Assoziativgesetz?", back: "Die Klammerung bei Addition/Multiplikation ist egal: (a+b)+c = a+(b+c)\nBeispiel: (2+3)+4 = 2+(3+4) = 9" },
      { front: "Wie rundet man 47 + 38 clever?", back: "47 + 40 = 87, dann −2 (weil 40 statt 38) → 85" },
      { front: "Was ist Dividend, Divisor, Quotient?", back: "Dividend ÷ Divisor = Quotient\nBeispiel: 56 ÷ 8 = 7\nDividend = 56, Divisor = 8, Quotient = 7" },
      { front: "Was ist Minuend, Subtrahend, Differenz?", back: "Minuend − Subtrahend = Differenz\nBeispiel: 15 − 6 = 9\nMinuend = 15, Subtrahend = 6, Differenz = 9" },
      { front: "Wie berechnet man 12 × 15?", back: "Trick: 12 × 15 = 12 × 10 + 12 × 5 = 120 + 60 = 180\n(Distributivgesetz nutzen)" },
      { front: "Was ist der Rest bei Division?", back: "Wenn die Zahl nicht aufgeht, bleibt ein Rest.\nBeispiel: 17 ÷ 5 = 3 Rest 2 (weil 5×3=15, 17−15=2)" },
      { front: "Wie lautet das Ergebnis von 0 × beliebige Zahl?", back: "Immer 0. Null mal alles ist null.\nBeispiel: 0 × 999 = 0" },
      { front: "Was passiert beim Multiplizieren mit 1?", back: "Die Zahl bleibt unverändert (neutrales Element).\nBeispiel: 1 × 47 = 47" },
      { front: "Wie hilft Klammern bei Rechenoperationen?", back: "Klammern haben immer Vorrang – alles in Klammern zuerst rechnen.\nBeispiel: (5 + 3) × 2 = 8 × 2 = 16 (nicht 5 + 6 = 11)" },
    ],

    quiz: [
      { q: "Was ergibt 3 + 4 × 2?", opts: ["14", "11", "10", "9"], correct: 1, exp: "Punkt vor Strich: erst 4×2=8, dann 3+8=11" },
      { q: "Welche Rechenregel besagt: a + b = b + a?", opts: ["Distributivgesetz", "Assoziativgesetz", "Kommutativgesetz", "Rechengesetz"], correct: 2, exp: "Das Kommutativgesetz gilt für Addition und Multiplikation." },
      { q: "Was ergibt 72 ÷ 9?", opts: ["7", "8", "9", "6"], correct: 1, exp: "9 × 8 = 72, also 72 ÷ 9 = 8" },
      { q: "Wie löst man 5 × (6 + 4) am schnellsten?", opts: ["5×6=30", "5×10=50", "5×6+4=34", "6+4+5=15"], correct: 1, exp: "Klammern zuerst: 6+4=10, dann 5×10=50" },
      { q: "Was ergibt 125 − 47?", opts: ["72", "78", "68", "82"], correct: 1, exp: "125−50=75, dann +3 (weil 50 statt 47) = 78" },
      { q: "Welche Aussage ist falsch?", opts: ["0 × 5 = 0", "1 × 7 = 7", "5 + 3 = 3 + 5", "6 ÷ 0 = 0"], correct: 3, exp: "Division durch 0 ist nicht definiert!" },
      { q: "Was ergibt 13 × 8?", opts: ["94", "96", "100", "104"], correct: 3, exp: "13×8 = 10×8 + 3×8 = 80+24 = 104" },
      { q: "Wie viel ist 15 % von 200?", opts: ["15", "20", "30", "25"], correct: 2, exp: "10% von 200 = 20, 5% = 10, zusammen 30" },
    ],
  },

  MATH_07_BRUECHE: {
    studyGuide: `# Bruchrechnung – Dein Lernguide

## Was ist ein Bruch?
Ein Bruch beschreibt einen Teil eines Ganzen: **Zähler/Nenner**
- **Zähler** (oben): wie viele Teile wir haben
- **Nenner** (unten): in wie viele gleiche Teile das Ganze geteilt ist
Beispiel: ³⁄₄ bedeutet: 3 von 4 gleichen Teilen

## Brüche kürzen
Zähler und Nenner durch die gleiche Zahl teilen:
**¹²⁄₁₆** → beide durch 4 → **³⁄₄**
Größter gemeinsamer Teiler (ggT) finden und kürzen.

## Brüche erweitern
Zähler und Nenner mit der gleichen Zahl multiplizieren:
**³⁄₄** × ²⁄₂ = **⁶⁄₈** (gleicher Wert, anderer Nenner)

## Gleichnamige Brüche addieren/subtrahieren
Gleicher Nenner → Zähler addieren/subtrahieren, Nenner bleibt:
**²⁄₅ + ¹⁄₅ = ³⁄₅**

## Ungleichnamige Brüche addieren/subtrahieren
1. Gemeinsamen Nenner (kgV) finden
2. Brüche erweitern
3. Zähler addieren/subtrahieren

Beispiel: ¹⁄₃ + ¹⁄₄
kgV(3,4) = 12 → ⁴⁄₁₂ + ³⁄₁₂ = **⁷⁄₁₂**

## Brüche multiplizieren
Zähler × Zähler, Nenner × Nenner:
**²⁄₃ × ³⁄₅ = ⁶⁄₁₅ = ²⁄₅**

## Brüche dividieren
Zweiten Bruch umkehren und multiplizieren (Kehrwert):
**²⁄₃ ÷ ⁴⁄₅ = ²⁄₃ × ⁵⁄₄ = ¹⁰⁄₁₂ = ⁵⁄₆**

## Gemischte Zahlen
**2³⁄₄** = 2 ganze + ¾ = **¹¹⁄₄** (2×4+3 = 11)
Umrechnen: Ganzzahl × Nenner + Zähler`,

    flashcards: [
      { front: "Was bedeutet der Zähler und der Nenner eines Bruchs?", back: "Zähler (oben) = wie viele Teile ich habe\nNenner (unten) = in wie viele gleiche Teile das Ganze geteilt ist\n³⁄₄: 3 von 4 Teilen" },
      { front: "Wie kürzt man den Bruch ¹²⁄₁₈?", back: "ggT(12,18) = 6\n12÷6 = 2, 18÷6 = 3\nErgebnis: ²⁄₃" },
      { front: "Wie addiert man ¹⁄₃ + ¹⁄₄?", back: "kgV(3,4) = 12\n¹⁄₃ = ⁴⁄₁₂, ¹⁄₄ = ³⁄₁₂\n⁴⁄₁₂ + ³⁄₁₂ = ⁷⁄₁₂" },
      { front: "Wie multipliziert man ²⁄₃ × ³⁄₄?", back: "Zähler × Zähler: 2×3 = 6\nNenner × Nenner: 3×4 = 12\n⁶⁄₁₂ = ½ (gekürzt)" },
      { front: "Wie dividiert man ³⁄₄ ÷ ³⁄₈?", back: "Kehrwert des zweiten Bruchs nehmen und multiplizieren:\n³⁄₄ × ⁸⁄₃ = ²⁴⁄₁₂ = 2" },
      { front: "Was ist der Kehrwert von ²⁄₅?", back: "⁵⁄₂ (Zähler und Nenner tauschen)\n²⁄₅ × ⁵⁄₂ = 1" },
      { front: "Wie rechnet man 2¾ in einen unechten Bruch um?", back: "2×4 + 3 = 11\nErgebnis: ¹¹⁄₄" },
      { front: "Wann heißt ein Bruch 'unecht'?", back: "Wenn der Zähler größer oder gleich dem Nenner ist: z.B. ⁷⁄₄\nKann als gemischte Zahl geschrieben werden: 1¾" },
      { front: "Wie findet man den kgV von 6 und 8?", back: "Vielfache von 6: 6, 12, 18, 24...\nVielfache von 8: 8, 16, 24...\nkgV = 24" },
      { front: "Wie vergleicht man ²⁄₃ und ³⁄₄?", back: "Gemeinsamer Nenner: kgV(3,4) = 12\n²⁄₃ = ⁸⁄₁₂, ³⁄₄ = ⁹⁄₁₂\n³⁄₄ ist größer" },
    ],

    quiz: [
      { q: "Was ergibt ²⁄₅ + ¹⁄₃?", opts: ["³⁄₈", "¹¹⁄₁₅", "³⁄₁₅", "⁷⁄₁₅"], correct: 1, exp: "kgV(5,3)=15: ⁶⁄₁₅ + ⁵⁄₁₅ = ¹¹⁄₁₅" },
      { q: "Was ist ¾ von 40?", opts: ["20", "25", "30", "35"], correct: 2, exp: "¾ × 40 = 30 (40÷4×3 = 30)" },
      { q: "Wie kürzt man ¹⁵⁄₂₅?", opts: ["²⁄₃", "³⁄₅", "⁴⁄₅", "½"], correct: 1, exp: "ggT(15,25)=5: 15÷5=3, 25÷5=5 → ³⁄₅" },
      { q: "Was ergibt ²⁄₃ ÷ ⁴⁄₉?", opts: ["⁸⁄₂₇", "³⁄₂", "²⁄₃", "⁶⁄₄"], correct: 1, exp: "²⁄₃ × ⁹⁄₄ = ¹⁸⁄₁₂ = ³⁄₂ = 1½" },
      { q: "Welcher Bruch ist am größten?", opts: ["²⁄₃", "³⁄₅", "⁵⁄₈", "⁷⁄₁₂"], correct: 0, exp: "Gemeinsamer Nenner 120: ⁸⁰⁄₁₂₀ > ⁷²⁄₁₂₀ > ⁷⁵⁄₁₂₀ > ⁷⁰⁄₁₂₀ → ²⁄₃ am größten" },
      { q: "Was ergibt 1½ + 2¼?", opts: ["3½", "3¾", "4", "3¼"], correct: 1, exp: "1½=⁶⁄₄, 2¼=⁹⁄₄ → ¹⁵⁄₄ = 3¾" },
    ],
  },

  MATH_08_PROZENTE: {
    studyGuide: `# Prozentrechnung – Dein Lernguide

## Grundbegriffe
- **Prozentwert (W)**: der gesuchte Teil
- **Grundwert (G)**: das Ganze (100%)
- **Prozentsatz (p%)**: der Anteil in Prozent

## Die drei Grundformeln
| Gesucht | Formel |
|---------|--------|
| Prozentwert W | W = G × p ÷ 100 |
| Grundwert G | G = W × 100 ÷ p |
| Prozentsatz p | p = W × 100 ÷ G |

## Alltagsbeispiele
**Rabatt:** Jacke kostet €80, 25% Rabatt
→ Rabatt = 80 × 25 ÷ 100 = **€20**, Endpreis: €60

**Mehrwertsteuer (19%):** Nettopreis €100
→ MwSt = 100 × 19 ÷ 100 = **€19**, Bruttopreis: €119

**Zinsen:** €500 bei 3% Zinsen pro Jahr
→ Zinsen = 500 × 3 ÷ 100 = **€15**

## Prozentsatz berechnen
Klasse hat 30 Schüler, 12 sind krank. Wie viel %?
p = 12 × 100 ÷ 30 = **40%**

## Grundwert berechnen
Nach 20% Rabatt kostet etwas €160. Was war der Originalpreis?
G = 160 × 100 ÷ 80 = **€200** (80% des Originals = €160)

## Prozentualer Anstieg/Rückgang
Preis steigt von €50 auf €65: Steigerung = (65−50) × 100 ÷ 50 = **30%**`,

    flashcards: [
      { front: "Wie berechnet man den Prozentwert?", back: "W = G × p ÷ 100\nBeispiel: 20% von 150 = 150 × 20 ÷ 100 = 30" },
      { front: "Ein Artikel kostet €200, du bekommst 15% Rabatt. Wie viel zahlst du?", back: "Rabatt: 200 × 15 ÷ 100 = 30€\nEndpreis: 200 − 30 = 170€\nOder direkt: 200 × 0,85 = 170€" },
      { front: "Was ist der Unterschied zwischen Bruttopreis und Nettopreis?", back: "Nettopreis = Preis ohne Mehrwertsteuer\nBruttopreis = Preis mit MwSt (in DE meist 19%)\nBrutto = Netto × 1,19" },
      { front: "Wie rechnet man Prozent in Dezimalzahl um?", back: "Durch 100 teilen:\n25% = 0,25\n7,5% = 0,075\n150% = 1,5" },
      { front: "Nach 30% Rabatt kostet etwas €140. Was war der Originalpreis?", back: "70% des Originals = €140\nG = 140 × 100 ÷ 70 = €200" },
      { front: "Was ist die Formel für Zinsen (einfache Zinsrechnung)?", back: "Zinsen = Kapital × Zinssatz × Zeit ÷ 100\nK=500€, p=4%, t=1 Jahr → Zinsen = 500×4÷100 = 20€" },
      { front: "Ein Preis steigt von €40 auf €52. Um wie viel Prozent?", back: "Steigerung: 52−40 = 12\np = 12 × 100 ÷ 40 = 30%" },
      { front: "Was bedeutet 'prozentualer Anteil'?", back: "Wie groß ist ein Teil im Verhältnis zum Ganzen.\np = Teilmenge × 100 ÷ Gesamtmenge\n12 von 30: 12×100÷30 = 40%" },
    ],

    quiz: [
      { q: "15% von 80 sind…", opts: ["10", "12", "15", "8"], correct: 1, exp: "80 × 15 ÷ 100 = 12" },
      { q: "Ein Fahrrad kostet €350, 20% Rabatt. Was zahlst du?", opts: ["€280", "€290", "€300", "€270"], correct: 0, exp: "350 × 0,80 = 280€" },
      { q: "Nach 40% Rabatt kostet etwas €90. Originalpreis?", opts: ["€125", "€150", "€180", "€130"], correct: 1, exp: "60% = €90 → 100% = 90×100÷60 = €150" },
      { q: "Was ist 110% von 200?", opts: ["210", "220", "200", "180"], correct: 1, exp: "200 × 1,10 = 220" },
      { q: "Von 25 Schülern fehlen 5. Wie viel Prozent fehlen?", opts: ["15%", "20%", "25%", "10%"], correct: 1, exp: "5 × 100 ÷ 25 = 20%" },
      { q: "€600 für 2 Jahre bei 5% Zinsen. Wie viel Zinsen gesamt?", opts: ["€30", "€60", "€90", "€120"], correct: 1, exp: "Zinsen/Jahr = 600×5÷100 = 30€, ×2 Jahre = 60€" },
    ],
  },

  BIO_07_ZELLE: {
    studyGuide: `# Zellbiologie – Die Grundeinheit des Lebens

## Die Zelltheorie
1. Alle Lebewesen bestehen aus Zellen
2. Die Zelle ist die kleinste Einheit des Lebens
3. Jede Zelle stammt von einer anderen Zelle ab

## Zellorganellen – Übersicht

### Zellmembran (alle Zellen)
Dünne Hülle aus Lipiden und Proteinen. Reguliert Ein- und Ausfuhr von Stoffen (semipermeable Membran).

### Zellkern (Nukleus)
Enthält die DNA – die genetische Information der Zelle. Steuert alle Zellfunktionen. Umgeben von der Kernhülle.

### Ribosomen
Kleine Partikel, die Proteine herstellen (Proteinbiosynthese). Liegen frei im Zytoplasma oder am Endoplasmatischen Retikulum.

### Mitochondrien
"Kraftwerke der Zelle" – produzieren ATP (Energie) durch Zellatmung. Haben eine eigene DNA.

### Chloroplasten (nur Pflanzenzellen)
Enthalten Chlorophyll, ermöglichen Fotosynthese (Umwandlung von Licht in Zucker).

### Zellwand (nur Pflanzenzellen)
Stabile Hülle aus Zellulose, außerhalb der Zellmembran. Gibt der Zelle Form und Stabilität.

### Vakuole
Bei Pflanzenzellen: große zentrale Vakuole für Wasserspeicherung und Zellturgor.
Bei Tierzellen: kleiner, temporär.

### Endoplasmatisches Retikulum (ER)
Raues ER: Proteinsynthese und -transport
Glattes ER: Fettsynthese und Entgiftung

### Golgi-Apparat
"Verpackungsstation" – verarbeitet und verteilt Proteine aus dem ER.

## Tier- vs. Pflanzenzelle
| Merkmal | Tierzelle | Pflanzenzelle |
|---------|-----------|---------------|
| Zellwand | ✗ | ✓ (Zellulose) |
| Chloroplasten | ✗ | ✓ |
| Vakuole | klein | groß (zentral) |
| Zellmembran | ✓ | ✓ |
| Mitochondrien | ✓ | ✓ |
| Zellkern | ✓ | ✓ |

## Prokaryoten vs. Eukaryoten
- **Prokaryoten** (z.B. Bakterien): kein echtes Zellkern, keine Membranorganellen
- **Eukaryoten** (Pflanzen, Tiere, Pilze): echter Zellkern, Organellen vorhanden`,

    flashcards: [
      { front: "Was ist die Funktion der Mitochondrien?", back: "Sie sind die 'Kraftwerke der Zelle'.\nSie produzieren durch Zellatmung ATP (Adenosintriphosphat) – die Energiewährung der Zelle.\nGleichung: Glucose + Sauerstoff → CO₂ + Wasser + ATP" },
      { front: "Welche Organellen haben nur Pflanzenzellen?", back: "1. Chloroplasten (Fotosynthese, enthalten Chlorophyll)\n2. Zellwand aus Zellulose\n3. Große zentrale Vakuole" },
      { front: "Was ist die Aufgabe der Zellmembran?", back: "Sie reguliert den Transport von Stoffen in die Zelle hinein und heraus (semipermeabel).\nBesteht aus einer Doppellipidschicht mit eingebetteten Proteinen." },
      { front: "Was ist der Unterschied zwischen Prokaryoten und Eukaryoten?", back: "Prokaryoten: KEIN echter Zellkern, keine Membranorganellen (z.B. Bakterien)\nEukaryoten: Echter Zellkern mit Kernhülle, Organellen (Tiere, Pflanzen, Pilze)" },
      { front: "Was ist die Funktion des Zellkerns?", back: "Enthält die DNA (genetische Information).\nSteuert und kontrolliert alle Zellfunktionen.\nOrt der Transkription (DNA → mRNA)" },
      { front: "Wozu dient der Golgi-Apparat?", back: "Er ist die 'Verpackungsstation' der Zelle.\nEr verarbeitet, modifiziert und verteilt Proteine aus dem ER.\nVerpackt sie in Vesikel für Transport oder Export." },
      { front: "Was ist die Zellwand und woraus besteht sie?", back: "Eine stabile, starre Hülle außerhalb der Zellmembran (nur Pflanzenzellen).\nBesteht aus Zellulose-Fasern.\nGibt der Zelle Form und schützt sie vor Platzen." },
      { front: "Was ist Fotosynthese und wo findet sie statt?", back: "Umwandlung von Lichtenergie in chemische Energie (Zucker).\nGleichung: 6CO₂ + 6H₂O + Licht → C₆H₁₂O₆ + 6O₂\nFindet in den Chloroplasten der Pflanzenzellen statt." },
      { front: "Was ist Zellturgor?", back: "Der Druck, den die Vakuole gegen die Zellwand ausübt.\nGibt Pflanzenzellen ihre Steifheit (wie ein aufgeblasener Ballon).\nBei Wassermangel: Zelle wird schlaff (Welken)" },
      { front: "Was produzieren Ribosomen?", back: "Proteine – nach der Vorlage der mRNA.\nSind überall in der Zelle vorhanden: frei im Cytoplasma oder am rauen ER.\nSehr kleine Organellen (kein Membransystem)" },
    ],

    quiz: [
      { q: "Welche Organelle wird als 'Kraftwerk der Zelle' bezeichnet?", opts: ["Ribosom", "Mitochondrium", "Chloroplast", "Vakuole"], correct: 1, exp: "Mitochondrien produzieren ATP durch Zellatmung." },
      { q: "Was haben Pflanzenzellen, aber keine Tierzellen?", opts: ["Mitochondrien und Ribosomen", "Zellmembran und Zellkern", "Chloroplasten und Zellwand", "ER und Golgi-Apparat"], correct: 2, exp: "Chloroplasten (Fotosynthese) und Zellwand (Zellulose) sind pflanzentypisch." },
      { q: "Was ist das Merkmal von Prokaryoten?", opts: ["Großer Zellkern", "Chloroplasten", "Kein echter Zellkern", "Zellulosewand"], correct: 2, exp: "Prokaryoten (wie Bakterien) haben kein echtes Kerngehäuse." },
      { q: "Wozu dient die Vakuole in Pflanzenzellen hauptsächlich?", opts: ["Fotosynthese", "Energieproduktion", "Proteinsynthese", "Wasserspeicherung und Turgor"], correct: 3, exp: "Die große zentrale Vakuole speichert Wasser und erzeugt Zellturgor." },
      { q: "Welche Gleichung beschreibt die Fotosynthese?", opts: ["C₆H₁₂O₆ + O₂ → CO₂ + H₂O", "CO₂ + H₂O + Licht → C₆H₁₂O₆ + O₂", "ATP → ADP + Energie", "DNA → mRNA → Protein"], correct: 1, exp: "Fotosynthese: CO₂ + H₂O + Lichtenergie → Glucose + Sauerstoff" },
      { q: "Was ist die Aufgabe des Golgi-Apparats?", opts: ["DNA-Replikation", "Energiegewinnung", "Proteine verpacken und verteilen", "Fotosynthese"], correct: 2, exp: "Golgi ist die Verpackungsstation: modifiziert und verteilt Proteine aus dem ER." },
    ],
  },

  HIST_08_WELTKRIEGE: {
    studyGuide: `# Weltkriege – Ursachen, Verlauf, Folgen

## Erster Weltkrieg (1914–1918)

### Ursachen (MAIN)
- **M**ilitarismus: Wettrüsten der europäischen Großmächte
- **A**llianzen: Zweibund (D, Österreich-Ungarn) vs. Triple Entente (F, GB, Russland)
- **I**mperialismus: Konkurrenzkampf um Kolonien
- **N**ationalismus: Unabhängigkeitsbewegungen (bes. Balkan)

**Auslöser:** Attentat auf Franz Ferdinand in Sarajevo (28. Juni 1914)

### Verlauf
- Schlieffen-Plan Deutschlands scheiterte → Stellungskrieg im Westen
- Verdun 1916: ca. 300.000 Tote auf beiden Seiten
- USA tritt 1917 ein, dreht Kriegsverlauf
- Novemberrevolution 1918 → Kaiser Wilhelm II. flieht

### Folgen
- ca. 17 Millionen Tote
- **Versailler Vertrag (1919):** Deutschland trägt Alleinschuld, muss Reparationen zahlen, verliert Gebiete
- Weimarer Republik entsteht (erste deutsche Demokratie)

---

## Zweiter Weltkrieg (1939–1945)

### Ursachen
- Weltwirtschaftskrise ab 1929: Massenarbeitslosigkeit in Deutschland
- Versailler Vertrag: Demütigung, Revancheismus
- Aufstieg der NSDAP: Hitler wird 1933 Reichskanzler
- Appeasement-Politik der Westmächte

### Verlauf
- 1. September 1939: Überfall auf Polen → Beginn des Krieges
- **Holocaust:** Systematische Vernichtung der europäischen Juden (6 Millionen Tote)
- Wende: Niederlage in Stalingrad 1942/43
- D-Day: Alliierte landen 6. Juni 1944 in der Normandie
- 8. Mai 1945: Deutsches Reich kapituliert – **Kriegsende in Europa**

### Folgen
- ca. 60–80 Millionen Tote (inkl. Zivilisten)
- Deutschland in 4 Besatzungszonen geteilt
- Nürnberger Prozesse: NS-Kriegsverbrecher vor Gericht
- **UNO** gegründet 1945
- Beginn des Kalten Krieges (USA vs. UdSSR)`,

    flashcards: [
      { front: "Was waren die vier Hauptursachen des Ersten Weltkriegs (MAIN)?", back: "M – Militarismus (Wettrüsten)\nA – Allianzen (Bündnissysteme)\nI – Imperialismus (Kolonialkampf)\nN – Nationalismus (Unabhängigkeitsbewegungen)" },
      { front: "Was war der Auslöser des Ersten Weltkriegs?", back: "Das Attentat auf den österreichisch-ungarischen Thronfolger Franz Ferdinand in Sarajevo am 28. Juni 1914, verübt von dem bosnisch-serbischen Nationalisten Gavrilo Princip." },
      { front: "Was regelte der Versailler Vertrag (1919)?", back: "- Deutschland trägt die Alleinschuld am Krieg\n- Zahlung von Kriegsreparationen (132 Mrd. Goldmark)\n- Verlust von ca. 13% des Staatsgebiets\n- Abrüstung auf 100.000 Mann\n- Rheinland wird demilitarisiert" },
      { front: "Wann begann der Zweite Weltkrieg und womit?", back: "1. September 1939: Deutschland überfällt Polen (Operation Weiß).\nEngland und Frankreich erklären daraufhin Deutschland den Krieg." },
      { front: "Was war der Holocaust?", back: "Die systematische, staatlich organisierte Vernichtung der europäischen Juden durch das NS-Regime.\nCa. 6 Millionen Juden wurden ermordet, hauptsächlich in Vernichtungslagern (Auschwitz, Treblinka, Sobibor...)." },
      { front: "Was war die Wende im Zweiten Weltkrieg?", back: "Die Niederlage der Wehrmacht in Stalingrad (Herbst 1942 – Februar 1943).\n300.000 deutsche Soldaten eingekesselt, 91.000 ergaben sich.\nDanach offensive Rückzugskämpfe bis Kriegsende." },
      { front: "Was ist der D-Day?", back: "6. Juni 1944: Die Alliierten landen in der Normandie (Nordfrankreich) – größte Seelandungsoperation der Geschichte.\nÖffnete eine zweite Front im Westen, beschleunigte das Kriegsende." },
      { front: "Welche Folgen hatte der Zweite Weltkrieg für Deutschland?", back: "- Kapitulation 8. Mai 1945\n- Aufteilung in 4 Besatzungszonen (USA, UK, F, UdSSR)\n- Nürnberger Prozesse (1945/46)\n- Gründung der BRD (1949) und DDR (1949)\n- ca. 8 Millionen deutsche Kriegstote" },
    ],

    quiz: [
      { q: "Wann wurde der Erste Weltkrieg durch das Attentat in Sarajevo ausgelöst?", opts: ["1912", "1913", "1914", "1915"], correct: 2, exp: "28. Juni 1914: Attentat auf Franz Ferdinand" },
      { q: "Was bedeutet MAIN als Eselsbrücke für WW1-Ursachen?", opts: ["Militär, Armee, Imperialismus, Nationen", "Militarismus, Allianzen, Imperialismus, Nationalismus", "Mächte, Armeen, Industrie, Neid", "Marine, Allianz, Industrie, Niedergang"], correct: 1, exp: "MAIN: Militarismus, Allianzen, Imperialismus, Nationalismus" },
      { q: "Wann begann der Zweite Weltkrieg?", opts: ["1. Sept. 1939", "3. Sept. 1939", "1. Jan. 1940", "1. Sept. 1938"], correct: 0, exp: "1. September 1939: Überfall auf Polen" },
      { q: "Wie viele Juden wurden im Holocaust ermordet?", opts: ["Ca. 1 Million", "Ca. 3 Millionen", "Ca. 6 Millionen", "Ca. 10 Millionen"], correct: 2, exp: "Etwa 6 Millionen Juden wurden vom NS-Regime systematisch ermordet." },
      { q: "Was gründete man 1945, um weitere Weltkriege zu verhindern?", opts: ["NATO", "EU", "UNO", "Völkerbund"], correct: 2, exp: "Die Vereinten Nationen (UNO) wurden am 26. Juni 1945 gegründet." },
      { q: "Was war der Versailler Vertrag?", opts: ["Friedensvertrag 1918", "Friedensvertrag 1919 nach WW1", "WW2-Kapitulation", "NATO-Gründungsvertrag"], correct: 1, exp: "Der Versailler Vertrag von 1919 beendete formal den Ersten Weltkrieg." },
    ],
  },

  GEO_09_KLIMA: {
    studyGuide: `# Klimawandel – Wissenschaft & Politik

## Was ist der Treibhauseffekt?

### Natürlicher Treibhauseffekt
Ohne ihn wäre die Erde −18°C kalt. Treibhausgase (CO₂, Wasserdampf, CH₄) halten Wärme der Erde zurück. **Lebenswichtig und natürlich.**

### Verstärkter (anthropogener) Treibhauseffekt
Durch menschliche Aktivitäten steigt die Konzentration von Treibhausgasen:
- **CO₂**: Verbrennung fossiler Brennstoffe, Entwaldung
- **CH₄ (Methan)**: Viehzucht, Reisfelder, Mülldeponien
- **N₂O**: Düngemittel
- **FCKW**: Kältemittel (stark klimawirksam)

## Folgen des Klimawandels
- Anstieg der Durchschnittstemperatur (ca. +1,1°C seit 1850)
- Schmelzen von Gletschern und Polkappen
- Anstieg des Meeresspiegels (ca. 3,6 mm/Jahr)
- Häufigere Extremwetterereignisse (Dürren, Starkregen, Orkane)
- Bedrohung von Küstenregionen und Inselstaaten
- Artensterben durch Habitatverlust

## CO₂-Konzentration
- Vorindustriell: ~280 ppm
- 2023: ~421 ppm (Rekord)
- Paris-Ziel: max. +1,5°C Erwärmung gegenüber vorindustriellem Niveau

## Klimapolitik
**Pariser Abkommen (2015):** 195 Länder verpflichten sich zur Begrenzung der Erwärmung auf 1,5–2°C

**Pro & Contra Klimaschutzmaßnahmen:**
| Maßnahme | Vorteil | Nachteil |
|---------|---------|---------|
| CO₂-Steuer | Marktbasiert, effektiv | Sozial ungerecht, teuer |
| Erneuerbare Energien | Sauber, günstig | Speicherprobleme |
| Emissionshandel | Mengen begrenzt | Kompliziert |
| Atomkraft | CO₂-arm | Atommüll, Risiken |`,

    flashcards: [
      { front: "Was ist der natürliche Treibhauseffekt?", back: "Treibhausgase (CO₂, Wasserdampf, CH₄) halten Wärme in der Erdatmosphäre zurück.\nOhne ihn wäre die Erde −18°C kalt statt +15°C.\nEr ist lebensnotwendig und völlig natürlich." },
      { front: "Was sind die wichtigsten Treibhausgase?", back: "1. CO₂ (Kohlendioxid) – Verbrennung fossiler Brennstoffe\n2. CH₄ (Methan) – Viehzucht, Mülldeponien\n3. N₂O (Lachgas) – Düngemittel\n4. FCKW – Kältemittel (sehr klimawirksam)" },
      { front: "Was ist das Pariser Abkommen?", back: "Internationales Klimaabkommen von 2015.\n195 Länder verpflichten sich, die Erderwärmung auf max. 1,5–2°C gegenüber dem vorindustriellen Niveau zu begrenzen." },
      { front: "Um wie viel ist die Erde seit 1850 erwärmt?", back: "Ca. +1,1°C globale Durchschnittstemperatur.\nDie CO₂-Konzentration stieg von ~280 ppm (vorindustriell) auf über 421 ppm (2023)." },
      { front: "Was sind Folgen des Klimawandels?", back: "- Anstieg des Meeresspiegels\n- Häufigere Extremwetterereignisse\n- Gletscherschmelze\n- Artensterben\n- Bedrohung von Küsten und Inselstaaten\n- Verschiebung von Klimazonen" },
      { front: "Was ist der CO₂-Fußabdruck?", back: "Die Gesamtmenge an CO₂-Äquivalenten, die durch eine Person, Organisation oder ein Produkt verursacht wird.\nDurchschnittsdeutscher: ca. 11 t CO₂/Jahr\nZiel für 1,5°C: ca. 1-2 t CO₂/Person/Jahr" },
    ],

    quiz: [
      { q: "Ohne den natürlichen Treibhauseffekt wäre die Erde…", opts: ["−18°C", "+5°C", "0°C", "+30°C"], correct: 0, exp: "Der natürliche Treibhauseffekt erwärmt die Erde von −18°C auf durchschnittlich +15°C." },
      { q: "Welches Gas ist der wichtigste vom Menschen verursachte Treibhausgas?", opts: ["Sauerstoff", "Stickstoff", "Kohlendioxid (CO₂)", "Wasserstoff"], correct: 2, exp: "CO₂ aus der Verbrennung fossiler Brennstoffe ist das wichtigste anthropogene Treibhausgas." },
      { q: "Was regelt das Pariser Abkommen von 2015?", opts: ["Ozonschutz", "Begrenzung der Erwärmung auf 1,5–2°C", "CO₂-Steuer", "Atomausstieg"], correct: 1, exp: "Das Pariser Abkommen zielt auf max. 1,5–2°C Erwärmung gegenüber vorindustriellem Niveau." },
      { q: "Wie hoch ist die CO₂-Konzentration aktuell (2023)?", opts: ["280 ppm", "350 ppm", "421 ppm", "500 ppm"], correct: 2, exp: "2023 wurde ein Rekordwert von über 421 ppm CO₂ gemessen (vorindustriell: 280 ppm)." },
      { q: "Welche Aussage zum Klimawandel ist korrekt?", opts: ["Die Erde hat sich seit 1850 um +1,1°C erwärmt", "CO₂ gibt es nur durch menschliche Aktivitäten", "Klimawandel betrifft nur Entwicklungsländer", "Methan ist harmlos"], correct: 0, exp: "Die globale Durchschnittstemperatur ist seit 1850 um ca. 1,1°C gestiegen." },
    ],
  },

  POL_10_DEMOKRATIE: {
    studyGuide: `# Demokratie verstehen – Systeme im Vergleich

## Grundprinzipien der Demokratie
1. **Volkssouveränität**: Alle Staatsgewalt geht vom Volk aus
2. **Gewaltenteilung**: Trennung von Legislative, Exekutive, Judikative
3. **Rechtsstaatlichkeit**: Gesetze gelten für alle gleich
4. **Grundrechte**: Unveräußerliche Menschenrechte
5. **Mehrheitsprinzip** mit **Minderheitenschutz**

## Die drei Staatsgewalten (Deutschland)

| Gewalt | Organ | Aufgabe |
|--------|-------|---------|
| **Legislative** | Bundestag, Bundesrat | Gesetze beschließen |
| **Exekutive** | Bundesregierung, Verwaltung | Gesetze ausführen |
| **Judikative** | Gerichte, Bundesverfassungsgericht | Gesetze anwenden/kontrollieren |

## Direktdemokratie vs. Repräsentativdemokratie
- **Direkt**: Bürger stimmen selbst ab (Volksabstimmung – in CH häufig)
- **Repräsentativ**: Bürger wählen Vertreter (DE, UK, USA)

## Vergleich: Deutschland, USA, Frankreich

| | Deutschland | USA | Frankreich |
|--|-------------|-----|------------|
| System | Parlamentarisch | Präsidentiell | Semi-präsidentiell |
| Staatsoberhaupt | Bundespräsident | Präsident | Präsident |
| Regierungschef | Bundeskanzler | Präsident | Premierminister |
| Parlament | Zweikammern (BT+BR) | Zweikammern (Kongress) | Zweikammern |
| Wahlrecht | Verhältniswahl | Mehrheitswahl | Zweig |

## Gefahren für die Demokratie
- Populismus und Desinformation
- Niedrige Wahlbeteiligung
- Einschränkung der Pressefreiheit
- Korruption`,

    flashcards: [
      { front: "Was sind die fünf Grundprinzipien der Demokratie?", back: "1. Volkssouveränität\n2. Gewaltenteilung\n3. Rechtsstaatlichkeit\n4. Grundrechte / Menschenrechte\n5. Mehrheitsprinzip + Minderheitenschutz" },
      { front: "Was ist der Unterschied zwischen Legislative, Exekutive und Judikative?", back: "Legislative = Gesetzgebung (Bundestag, Bundesrat)\nExekutive = Gesetzausführung (Bundesregierung)\nJudikative = Rechtsprechung (Gerichte)\n→ Gewaltenteilung verhindert Machtmissbrauch" },
      { front: "Was ist der Unterschied zwischen direkter und repräsentativer Demokratie?", back: "Direkte Demokratie: Bürger stimmen selbst über Sachfragen ab (z.B. Volksabstimmungen in der Schweiz)\nRepräsentative D.: Bürger wählen Vertreter, die für sie entscheiden (Deutschland, USA)" },
      { front: "Was ist Volkssouveränität?", back: "Alle Staatsgewalt geht vom Volk aus (Artikel 20 GG).\nDas Volk ist der eigentliche Inhaber der Staatsgewalt und übt sie durch Wahlen aus." },
      { front: "Was unterscheidet ein parlamentarisches von einem präsidentiellen System?", back: "Parlamentarisch (DE): Regierung vom Parlament abhängig, Kanzler kann abgewählt werden\nPräsidentiell (USA): Präsident ist unabhängig vom Kongress, direkt gewählt, starke Exekutive" },
      { front: "Was ist das Bundesverfassungsgericht?", back: "Oberstes deutsches Gericht mit Sitz in Karlsruhe.\nWacht über die Einhaltung des Grundgesetzes.\nKann Gesetze für verfassungswidrig erklären.\nEntscheidet bei Streit zwischen Staatsorganen." },
    ],

    quiz: [
      { q: "Wer beschließt in Deutschland Gesetze? (Legislative)", opts: ["Bundesregierung", "Bundestag und Bundesrat", "Bundesverfassungsgericht", "Bundespräsident"], correct: 1, exp: "Die Legislative besteht aus Bundestag (direkt gewählt) und Bundesrat (Ländervertretung)." },
      { q: "Was bedeutet Gewaltenteilung?", opts: ["Militärische Macht verteilen", "Trennung von Gesetzgebung, Ausführung, Rechtsprechung", "Föderalismus", "Mehrparteiensystem"], correct: 1, exp: "Gewaltenteilung trennt Legislative, Exekutive und Judikative um Machtmissbrauch zu verhindern." },
      { q: "In welchem Land gibt es häufig direkte Volksabstimmungen?", opts: ["Deutschland", "USA", "Schweiz", "Frankreich"], correct: 2, exp: "Die Schweiz ist weltweit bekannt für ihr ausgeprägtes direktdemokratisches System." },
      { q: "Was ist der Unterschied zwischen USA und Deutschland beim Regierungssystem?", opts: ["USA ist eine Monarchie", "USA ist präsidentiell, DE parlamentarisch", "DE hat keinen Präsidenten", "USA hat ein Verhältniswahlrecht"], correct: 1, exp: "USA: Präsidentielles System (Präsident regiert unabhängig). Deutschland: Parlamentarisch (Kanzler abhängig vom Bundestag)." },
      { q: "Wann gilt Minderheitenschutz als wichtig in der Demokratie?", opts: ["Nur bei Wahlen", "Immer, damit Mehrheiten nicht alle Rechte der Minderheit einschränken", "Nur bei Religionsfreiheit", "Nur im Strafrecht"], correct: 1, exp: "Demokratie bedeutet nicht nur Mehrheitsprinzip – Minderheiten müssen vor der Tyrannei der Mehrheit geschützt werden." },
    ],
  },

  DE_07_RECHTSCHREIBUNG: {
    studyGuide: `# Rechtschreibung – Regeln & Tricks

## Groß- und Kleinschreibung
**Großschreibung gilt für:**
- Substantive (Nomen): der **Hund**, die **Schule**, das **Leben**
- Substantivierte Wörter: das **Laufen**, das **Beste**, das **Gute**
- Adjektive nach manchen Ausdrücken: im **Großen** und **Ganzen**
- Satzanfang, Eigennamen, Anreden in Briefen (Sie, Ihr)

**Trick:** Kannst du einen Artikel davor setzen? → Großschreibung!
"das Laufen macht Spaß" → Substantivierung → groß

## ss oder ß?
- **ss**: nach kurzem Vokal → **Fluss**, **muss**, **dass**
- **ß**: nach langem Vokal oder Diphthong → **Straße**, **Fuß**, **heiß**

**Test:** Verlängerung → Flüsse (kurzes u) → ss; Füße (langes ü) → ß

## dass oder das?
- **dass** (Konjunktion): einleitend, ersetzbar durch "weil/ob"
  "Ich glaube, **dass** er kommt."
- **das** (Artikel/Pronomen): ersetzbar durch "dieses/welches"
  "**Das** Buch gefällt mir."

**Trick:** Ersetze durch "dieses" → Artikel → "das"; nicht möglich → "dass"

## Kommaregeln
1. **Hauptsätze** durch: und, oder, aber, denn, sondern — **kein Komma** bei und/oder
   "Ich esse und er trinkt." (kein Komma)
2. **Nebensätze** immer mit Komma abtrennen
   "Ich esse**,** weil ich hungrig bin."
3. **Einschübe/Appositionen** in Kommas einschließen
   "Maria**,** meine beste Freundin**,** kommt heute."

## Doppelkonsonanten
Nach **kurzem betontem Vokal** → Doppelkonsonant:
**Mutter** (kurzes u), **Bett** (kurzes e), **offen** (kurzes o)

Nach **langem Vokal oder Diphthong** → einfacher Konsonant:
**Vater** (langes a), **lösen** (langes ö)`,

    flashcards: [
      { front: "Wann schreibt man ss, wann ß?", back: "ss: nach kurzem betontem Vokal → Fluss, muss, dass\nß: nach langem Vokal oder Diphthong → Straße, Fuß, heiß\nTest: Wort verlängern – werden aus ss Doppelkonsonanten? → ss (Flüsse)" },
      { front: "Wie unterscheide ich 'das' von 'dass'?", back: "Trick: 'dieses' einsetzen:\n→ funktioniert? → 'das' (Artikel/Pronomen)\n→ funktioniert nicht? → 'dass' (Konjunktion)\nBeispiel: 'Das Buch' → 'dieses Buch' ✓ → 'das'\n'Ich hoffe, dass...' → 'dieses' ✗ → 'dass'" },
      { front: "Wann schreibt man Substantive groß?", back: "Immer, wenn ein Artikel (der/die/das) davor passt:\n- der Hund, die Schule, das Leben\n- Substantivierungen: das Laufen, das Beste\n- Eigennamen: Berlin, Maria" },
      { front: "Wann setzt man ein Komma vor einem Nebensatz?", back: "Immer! Nebensätze werden durch Komma vom Hauptsatz getrennt.\nEinleitewörter: weil, dass, wenn, obwohl, als, damit...\n'Ich lerne, weil die Prüfung morgen ist.'" },
      { front: "Wann gilt Großschreibung bei Adjektiven?", back: "Bei Substantivierungen: das Beste, das Gute, das Schöne\nNach 'alles, nichts, etwas, viel': alles Gute, nichts Neues\nIn festen Ausdrücken: im Großen und Ganzen" },
      { front: "Wann schreibt man Doppelkonsonanten?", back: "Nach kurzem betontem Vokal:\nMutter, Bett, offen, kommen, brennen\nNach langem Vokal: einfacher Konsonant:\nVater, lösen, bieten" },
    ],

    quiz: [
      { q: "Welche Schreibweise ist korrekt?", opts: ["die Strase", "die Straße", "die Straße", "die Strasse"], correct: 1, exp: "Nach langem 'a' und Diphthong wird 'ß' geschrieben: Straße" },
      { q: "Welcher Satz ist korrekt?", opts: ["Ich glaube das er kommt.", "Ich glaube, das er kommt.", "Ich glaube, dass er kommt.", "Ich glaube dass er kommt."], correct: 2, exp: "Nebensatz mit Komma + 'dass' (Konjunktion, nicht ersetzbar durch 'dieses')" },
      { q: "Was ist ein Substantiv?", opts: ["Ein Tunwort", "Ein Namenwort (Nomen)", "Ein Wiewort", "Ein Verhältniswort"], correct: 1, exp: "Substantive sind Namenwörter (Nomen) und werden immer großgeschrieben." },
      { q: "Welches Wort wird falsch geschrieben?", opts: ["Fluss", "muss", "Straße", "heiss"], correct: 3, exp: "Nach Diphthong 'ei' schreibt man ß: heiß (nicht heiss)" },
      { q: "Wann kein Komma vor 'und'?", opts: ["Immer", "Bei gleichrangigen Hauptsätzen ohne Einschub", "Nie", "Nur nach Verben"], correct: 1, exp: "Vor 'und' zwischen zwei Hauptsätzen steht in der Regel kein Komma: 'Er liest und sie schreibt.'" },
    ],
  },

  CODE_PYTHON_BASICS: {
    studyGuide: `# Python für Anfänger

## Warum Python?
- Einfache, lesbare Syntax (fast wie Englisch)
- Vielseitig: Web, KI, Datenanalyse, Automatisierung
- Riesige Community, viele Bibliotheken
- Perfekte erste Programmiersprache

## Variablen und Datentypen
\`\`\`python
name = "Anna"        # String (Text)
alter = 16           # Integer (Ganzzahl)
groesse = 1.68       # Float (Dezimalzahl)
istSchueler = True   # Boolean (Wahr/Falsch)
\`\`\`

## Ausgabe und Eingabe
\`\`\`python
print("Hallo Welt!")           # Ausgabe
name = input("Wie heißt du? ") # Eingabe
print("Hallo", name)
\`\`\`

## Bedingte Anweisungen (if/elif/else)
\`\`\`python
note = 2
if note == 1:
    print("Sehr gut!")
elif note <= 3:
    print("Gut gemacht!")
else:
    print("Weiter üben!")
\`\`\`

## Schleifen
\`\`\`python
# for-Schleife
for i in range(5):       # 0, 1, 2, 3, 4
    print(i)

# while-Schleife
zahl = 0
while zahl < 5:
    print(zahl)
    zahl += 1            # zahl = zahl + 1
\`\`\`

## Listen
\`\`\`python
faecher = ["Mathe", "Deutsch", "Englisch"]
faecher.append("Physik")   # hinzufügen
print(faecher[0])          # "Mathe" (Index beginnt bei 0)
print(len(faecher))        # 4 (Länge)
\`\`\`

## Funktionen
\`\`\`python
def begruessung(name):
    return f"Hallo, {name}!"

ergebnis = begruessung("Max")
print(ergebnis)   # "Hallo, Max!"
\`\`\`

## Häufige Fehler
- **Einrückung** (Indentation): Python braucht genaue 4 Leerzeichen oder Tab
- **Doppelpunkt** nach if, for, while, def vergessen
- String mit falschen Anführungszeichen ("" vs. '')`,

    flashcards: [
      { front: "Was ist eine Variable in Python?", back: "Ein benannter Speicherplatz für einen Wert.\nBeispiel: alter = 16\nPython erkennt den Typ automatisch (dynamisch typisiert).\nKeine Typdeklaration nötig!" },
      { front: "Was sind die vier Grunddatentypen in Python?", back: "str: Text-Strings → 'Hallo'\nint: Ganzzahlen → 42\nfloat: Dezimalzahlen → 3.14\nbool: Wahrheitswerte → True / False" },
      { front: "Was macht range(5) in einer for-Schleife?", back: "Erzeugt die Zahlen 0, 1, 2, 3, 4 (nicht 5!)\nfor i in range(5): → 5 Durchläufe\nrange(1, 6): 1, 2, 3, 4, 5\nrange(0, 10, 2): 0, 2, 4, 6, 8 (Schrittweite 2)" },
      { front: "Wie gibt man in Python etwas aus?", back: "print('Hallo Welt!')\nprint('Name:', name)\nprint(f'Hallo {name}!')  ← f-String (empfohlen)" },
      { front: "Wie fragt man nach Benutzereingabe?", back: "name = input('Wie heißt du? ')\nWichtig: input() gibt immer einen String zurück!\nFür Zahlen: zahl = int(input('Zahl: '))" },
      { front: "Was ist der Unterschied zwischen for- und while-Schleife?", back: "for: Wenn die Anzahl der Durchläufe bekannt ist\nfor i in range(10):\nwhile: Wenn eine Bedingung entscheidet, wann gestoppt wird\nwhile zahl > 0:" },
      { front: "Wie definiert man eine Funktion in Python?", back: "def funktionsname(parameter):\n    # Einrückung!\n    return ergebnis\n\ndef addiere(a, b):\n    return a + b\n\naddiere(3, 4)  # → 7" },
      { front: "Wie greift man auf Listenelemente zu?", back: "liste = ['a', 'b', 'c']\nliste[0]  → 'a'  (erster Index = 0)\nliste[-1] → 'c'  (letztes Element)\nlen(liste) → 3" },
    ],

    quiz: [
      { q: "Was gibt print(2 + 3 * 4) aus?", opts: ["20", "14", "24", "10"], correct: 1, exp: "Punkt vor Strich: 3*4=12, dann 2+12=14" },
      { q: "Welche Ausgabe erzeugt for i in range(3): print(i)?", opts: ["1 2 3", "0 1 2 3", "0 1 2", "1 2"], correct: 2, exp: "range(3) erzeugt 0, 1, 2 (nicht 3!)" },
      { q: "Was ist falsch an: if x = 5: ?", opts: ["Kein Doppelpunkt", "= ist Zuweisung, == ist Vergleich", "Einrückungsfehler", "x nicht definiert"], correct: 1, exp: "In Python: = ist Zuweisung, == ist Vergleich. Korrekt: if x == 5:" },
      { q: "Was gibt type(3.14) zurück?", opts: ["int", "str", "float", "number"], correct: 2, exp: "3.14 ist eine Dezimalzahl → float" },
      { q: "Wie fügt man 'Physik' zur Liste faecher hinzu?", opts: ["faecher.add('Physik')", "faecher.push('Physik')", "faecher.append('Physik')", "faecher + 'Physik'"], correct: 2, exp: "Listen in Python: .append() fügt am Ende ein, .insert() an Position" },
      { q: "Was macht def?", opts: ["Eine Variable definieren", "Eine Funktion definieren", "Daten eingeben", "Drucken"], correct: 1, exp: "def leitet eine Funktionsdefinition ein. def name(params): → Funktion" },
    ],
  },

  AI_LITERACY_INTRO: {
    studyGuide: `# KI verstehen – Chancen & Risiken

## Was ist Künstliche Intelligenz?
KI ist Software, die Aufgaben übernimmt, die früher nur Menschen lösen konnten: Bilder erkennen, Texte schreiben, Schach spielen, übersetzen.

**Schwache KI** (heute üblich): Spezialisiert auf eine Aufgabe (ChatGPT schreibt Texte, AlphaFold faltet Proteine)
**Starke KI** (hypothetisch): Allgemeine menschliche Intelligenz – existiert noch nicht

## Wie lernt KI? – Machine Learning

### Supervised Learning (Überwachtes Lernen)
KI lernt an gelabelten Beispielen:
Bilder von Hunden/Katzen → KI lernt zu unterscheiden

### Unsupervised Learning
KI findet selbst Muster in Daten:
→ Kundengruppen clustern, Anomalien entdecken

### Reinforcement Learning
KI lernt durch Belohnung/Strafe:
→ AlphaGo lernte Go spielen durch Millionen von Spielen gegen sich selbst

## Große Sprachmodelle (LLMs) – ChatGPT & Co.
- Trainiert auf riesigen Textmengen
- Vorhersage: Welches Wort kommt als nächstes?
- Können schreiben, übersetzen, Code generieren, erklären
- **Halluzinieren**: Geben falsche Infos selbstbewusst aus

## Chancen der KI
- Medizin: Krebs früher erkennen, Medikamente entwickeln
- Klimaschutz: Energienetze optimieren
- Bildung: Personalisiertes Lernen
- Barrierefreiheit: Echtzeitübersetzung, Bildbeschreibungen

## Risiken der KI
- **Bias**: KI übernimmt menschliche Vorurteile aus Trainingsdaten
- **Deepfakes**: Gefälschte Bilder/Videos schwer erkennbar
- **Jobverlust**: Automatisierung bestimmter Berufe
- **Datenschutz**: KI braucht riesige Datenmengen
- **Intransparenz**: "Black Box" – Entscheidungen nicht erklärbar

## KI und Ethik
Wer haftet, wenn eine KI einen Fehler macht? Wie verhindern wir Diskriminierung durch KI? Wer darf KI einsetzen?`,

    flashcards: [
      { front: "Was ist der Unterschied zwischen schwacher und starker KI?", back: "Schwache KI (heute): Spezialisiert auf eine Aufgabe (Bild erkennen, Text schreiben)\nStarke KI (hypothetisch): Allgemeine menschliche Intelligenz, die jede Aufgabe lösen kann → existiert noch nicht" },
      { front: "Was sind LLMs (Large Language Models)?", back: "Große Sprachmodelle wie ChatGPT/Gemini.\nTrainiert auf riesigen Textmengen.\nFunktion: Vorhersagen, welches Wort als nächstes kommt.\nKönnen: schreiben, übersetzen, erklären, Code generieren, aber auch 'halluzinieren'." },
      { front: "Was bedeutet 'Halluzinieren' bei KI?", back: "KI gibt falsche oder erfundene Informationen mit hoher Selbstsicherheit aus.\nBeispiel: ChatGPT erfindet Quellen, die nicht existieren.\nDeshalb: KI-Outputs immer überprüfen!" },
      { front: "Was ist Bias in KI-Systemen?", back: "KI übernimmt Vorurteile aus ihren Trainingsdaten.\nBeispiel: Wenn Trainingsdaten mainly westliche Gesichter enthalten, erkennt die KI andere Hautfarben schlechter.\nFolge: Diskriminierung durch KI-Entscheidungen" },
      { front: "Was ist Reinforcement Learning?", back: "KI lernt durch Versuch und Irrtum mit Belohnungssystem.\nWenn die Aktion gut war → Belohnung (positive Verstärkung)\nWenn schlecht → Strafe\nBeispiel: AlphaGo lernte Go durch Millionen Spiele gegen sich selbst" },
      { front: "Was sind 3 konkrete Chancen und 3 Risiken von KI?", back: "Chancen: Krebsfrüherkennung, personalisiertes Lernen, Klimaoptimierung\nRisiken: Deepfakes/Desinformation, Diskriminierung durch Bias, Datenschutzverletzungen" },
    ],

    quiz: [
      { q: "Was macht ChatGPT im Kern?", opts: ["Sucht im Internet", "Vorhersagt das nächste wahrscheinliche Wort", "Versteht wie ein Mensch", "Ruft eine Datenbank ab"], correct: 1, exp: "LLMs wie ChatGPT berechnen statistische Wahrscheinlichkeiten, welches Wort als nächstes kommt." },
      { q: "Was bedeutet 'Halluzinieren' bei KI?", opts: ["KI träumt", "KI erstellt Bilder", "KI gibt falsche Infos selbstsicher aus", "KI macht Fehler bei Mathe"], correct: 2, exp: "Halluzination = KI erfindet Fakten, Quellen oder Namen mit hoher Überzeugung." },
      { q: "Welches ist ein Beispiel für KI-Bias?", opts: ["KI ist zu langsam", "Gesichtserkennung funktioniert bei dunkler Hautfarbe schlechter", "KI macht Tippfehler", "KI versteht Ironie nicht"], correct: 1, exp: "Wenn Trainingsdaten unausgewogen sind, diskriminiert die KI bestimmte Gruppen." },
      { q: "Was ist Supervised Learning?", opts: ["KI lernt ohne Daten", "KI lernt an beschrifteten Beispielen", "KI lernt durch Belohnung", "KI lernt von anderen KIs"], correct: 1, exp: "Supervised Learning: KI bekommt Beispiele MIT richtigen Antworten (Labels) zum Trainieren." },
      { q: "Was ist starke KI?", opts: ["Sehr schnelle Computer", "KI die besser als Menschen Go spielt", "Hypothetische allgemeine Intelligenz wie Menschen", "KI mit viel Strom"], correct: 2, exp: "Starke KI (AGI) würde alle menschlichen Aufgaben lösen können – existiert noch nicht." },
    ],
  },

  EXAM_ANXIETY_KIT: {
    studyGuide: `# Prüfungsangst überwinden – Strategien & Mindset

## Was ist Prüfungsangst?
Eine natürliche Stressreaktion, die zu viel Cortisol und Adrenalin ausschüttet.\nSymptoome: Herzrasen, Blackout, Zittern, Schwindel, Schlafprobleme\n**Wichtig:** Etwas Aufregung ist normal und kann sogar die Leistung verbessern!

## Ursachen
- Angst vor Versagen und sozialer Bewertung
- Perfektionismus
- Mangelnde Vorbereitung
- Negative Erfahrungen (Misserfolg-Spirale)
- Zu hohe externe Erwartungen

## Strategien – VOR der Prüfung

### Gute Vorbereitung
- Prüfungsstoff früh genug beginnen (kein Last-Minute-Lernen)
- Probeprüfungen unter echten Bedingungen schreiben
- Vergangene Prüfungsfragen üben

### Entspannungstechniken
- **4-7-8 Atemübung**: 4 sec einatmen, 7 sec halten, 8 sec ausatmen
- **Progressive Muskelentspannung**: Muskeln anspannen und loslassen
- Regelmäßiger Sport reduziert Grundanspannung

### Mentale Strategien
- **Kognitives Umstrukturieren**: "Ich werde versagen" → "Ich bin vorbereitet, ich tue mein Bestes"
- Worst-Case denken und realistisch einschätzen: Was ist die echte Konsequenz?
- Erfolge visualisieren – aber auch schwierige Fragen mental durchspielen

## Strategien – WÄHREND der Prüfung
- Tief durchatmen vor dem Start
- Zuerst alle Fragen überfliegen
- Leichte Fragen zuerst beantworten (Erfolgserlebnisse!)
- Bei Blackout: Stift ablegen, 3x tief atmen, andere Frage zuerst
- Kein Vergleich mit anderen Mitschülern

## Langfristig
- Perfektionismus hinterfragen: "Gut genug" ist oft gut genug
- Misserfolge als Lernchance sehen, nicht als Katastrophe
- Schlaf ist die wichtigste Prüfungsvorbereitung`,

    flashcards: [
      { front: "Was ist die 4-7-8 Atemübung und wann hilft sie?", back: "4 Sekunden einatmen\n7 Sekunden Luft anhalten\n8 Sekunden ausatmen\nHilft bei: akutem Stress, vor der Prüfung, bei Blackout\nAktiviert das parasympathische Nervensystem (Entspannung)" },
      { front: "Was bedeutet 'kognitives Umstrukturieren'?", back: "Negative Gedanken bewusst in realistischere umwandeln:\n'Ich werde komplett versagen' → 'Ich habe gelernt und tue mein Bestes'\n'Alle sind besser als ich' → 'Jeder kämpft mit eigenen Herausforderungen'" },
      { front: "Was solltest du bei einem Blackout in der Prüfung tun?", back: "1. Stift hinlegen – Schreiben stoppen\n2. 3x tief durchatmen\n3. Zur nächsten Frage gehen\n4. Am Ende zurückkehren\nNicht: Panik, Grübeln, Vergleich mit anderen" },
      { front: "Warum ist Schlaf die wichtigste Prüfungsvorbereitung?", back: "Im Schlaf werden Gedächtnisinhalte konsolidiert (von Kurzzeit- in Langzeitgedächtnis)\nSchlafentzug verschlechtert: Konzentration, Abrufleistung, Stressresistenz\n7-9 Stunden in der Prüfungsnacht → besser als noch 2 Stunden lernen" },
      { front: "Was ist die 'Worst-Case-Analyse' gegen Prüfungsangst?", back: "1. Was ist das Schlimmste, was passieren kann?\n2. Wie wahrscheinlich ist das wirklich?\n3. Wäre es wirklich so schlimm wie ich denke?\nMeist merkt man: Der worst case ist unwahrscheinlich und überwindbar." },
    ],

    quiz: [
      { q: "Was ist eine sinnvolle Strategie direkt vor einer Prüfung?", opts: ["Noch schnell den ganzen Stoff wiederholen", "4-7-8 Atemübung machen", "Mit anderen Schülern über Noten diskutieren", "Koffein trinken"], correct: 1, exp: "Tiefes Atmen aktiviert den Parasympathikus und reduziert akuten Stress." },
      { q: "Welche Aussage zu Prüfungsangst ist korrekt?", opts: ["Prüfungsangst ist immer krankhaft", "Leichte Aufregung kann Leistung verbessern", "Angst entsteht nur bei schlechter Vorbereitung", "Sport hilft nicht gegen Angst"], correct: 1, exp: "Ein moderates Stressniveau (Yerkes-Dodson-Gesetz) kann die Leistung sogar verbessern." },
      { q: "Was solltest du bei einem Blackout in der Prüfung zuerst tun?", opts: ["Die Aufsicht rufen", "Schummeln", "Stift hinlegen und tief atmen", "Sofort aufgeben"], correct: 2, exp: "Stopp, atmen, andere Frage angehen – Blackouts gehen meistens von selbst weg." },
      { q: "Was ist 'kognitives Umstrukturieren'?", opts: ["Lernstoff umorganisieren", "Negative Gedanken in realistische umwandeln", "Lernmethoden wechseln", "Schlafen vor der Prüfung"], correct: 1, exp: "Kognitive Umstrukturierung = Negativen Gedanken bewusst korrigieren durch realistische Selbstgespräche." },
    ],
  },

  TIME_MANAGEMENT_TEEN: {
    studyGuide: `# Zeitmanagement – Pomodoro & Prioritäten

## Warum Zeitmanagement lernen?
- Mehr Zeit für Freizeit bei gleicher Leistung
- Weniger Stress, kein letzter Drücker
- Bessere Noten durch strukturiertes Lernen

## Die Pomodoro-Technik
1. Lernaufgabe definieren
2. **25 Minuten** konzentriert arbeiten (kein Handy!)
3. **5 Minuten** Pause
4. Nach 4 Pomodoros → **30 Minuten** lange Pause

**Warum es funktioniert:** Das Gehirn braucht Pausen. Kurze Sprints verhindern Prokrastination.

## Die Eisenhower-Matrix
Aufgaben nach Wichtigkeit und Dringlichkeit einteilen:

| | Dringend | Nicht dringend |
|--|---------|----------------|
| **Wichtig** | Sofort erledigen | Einplanen |
| **Nicht wichtig** | Delegieren | Eliminieren |

Schulprüfung morgen = wichtig + dringend → sofort!
Sport = wichtig, nicht dringend → einplanen
Social Media = nicht wichtig, dringend (Notification) → eliminieren/delegieren

## ABC-Methode
**A-Aufgaben:** Muss heute erledigt werden (Hausaufgaben, Prüfungsvorbereitung)
**B-Aufgaben:** Sollte bald gemacht werden (Referat nächste Woche)
**C-Aufgaben:** Wäre schön (Zimmer aufräumen)

## Wochenplan erstellen
1. Feste Zeiten eintragen (Schule, Sport, Mahlzeiten)
2. Lernzeiten festlegen (für Hauptfächer)
3. Pufferzeit einplanen (immer mehr dauert als geplant)
4. Belohnungen einbauen

## Anti-Prokrastination-Tipps
- **2-Minuten-Regel**: Was weniger als 2 Min dauert → sofort erledigen
- Handy in anderen Raum oder App-Blocker nutzen
- Mit der schwersten Aufgabe starten ("Eat the frog")`,

    flashcards: [
      { front: "Wie funktioniert die Pomodoro-Technik?", back: "25 min konzentriert arbeiten → 5 min Pause\nNach 4 Pomodoros → 30 min lange Pause\nHilft gegen Prokrastination durch kurze, überschaubare Sprints." },
      { front: "Was ist die Eisenhower-Matrix?", back: "2×2-Matrix nach Wichtigkeit und Dringlichkeit:\nWichtig + Dringend → Sofort!\nWichtig + Nicht dringend → Einplanen\nNicht wichtig + Dringend → Delegieren\nNicht wichtig + Nicht dringend → Eliminieren" },
      { front: "Was ist die 2-Minuten-Regel?", back: "Wenn eine Aufgabe weniger als 2 Minuten dauert, erledige sie sofort.\nBegründung: Die mentale Last, sich daran zu erinnern, ist größer als die Aufgabe selbst." },
      { front: "Was bedeutet 'Eat the frog'?", back: "Starte mit der schwierigsten, unangenehmsten Aufgabe.\nNachher ist alles leichter und du bist produktiver.\n(Mark Twain: 'Wenn du morgens einen Frosch isst, kann dir der Rest des Tages nichts Schlimmeres passieren.')" },
      { front: "Wie sieht ein guter Wochenplan aus?", back: "1. Feste Zeiten eintragen (Schule, Sport)\n2. Lernblöcke festlegen (Pomodoro-Einheiten)\n3. Pufferzeit einplanen (20-30%)\n4. Belohnungen einbauen\n5. Realistisch bleiben!" },
    ],

    quiz: [
      { q: "Wie lange dauert ein Pomodoro?", opts: ["15 min", "25 min", "30 min", "45 min"], correct: 1, exp: "Ein Pomodoro = 25 Minuten Fokusarbeit, danach 5 Minuten Pause." },
      { q: "Was ist eine A-Aufgabe in der ABC-Methode?", opts: ["Angenehme Aufgaben", "Aufgaben die heute erledigt sein müssen", "Aufgaben für die Zukunft", "Alle Aufgaben"], correct: 1, exp: "A = höchste Priorität, muss heute erledigt werden." },
      { q: "Was macht man mit 'nicht wichtig + nicht dringend' Aufgaben?", opts: ["Sofort erledigen", "Delegieren", "Einplanen", "Eliminieren"], correct: 3, exp: "Nicht wichtig + nicht dringend → eliminieren (weglassen!)" },
      { q: "Was ist die 2-Minuten-Regel?", opts: ["Pause alle 2 Minuten", "Was < 2 Min dauert, sofort erledigen", "2 Stunden Lernblock", "2 Aufgaben gleichzeitig"], correct: 1, exp: "Kleine Aufgaben (<2 Min) sofort erledigen verhindert, dass sie auf der Liste landen." },
    ],
  },

  NOTE_TAKING_MASTER: {
    studyGuide: `# Mitschreiben – Cornell, Mindmap, Digital

## Warum Mitschreiben wichtig ist
Aktives Mitschreiben: bis zu 6x bessere Behaltensrate als reines Lesen/Hören!
Handschriftliches Notieren > Tippen (fördert tieferes Verarbeiten)

## 1. Cornell-Methode
Seite in drei Bereiche teilen:

\`\`\`
+----------------------------------+
| Datum/Thema (oben)              |
+-------------+--------------------+
|  Cues/      |   Hauptbereich:   |
|  Fragen     |   Notizen         |
|  (links,    |   (rechts, 7 cm)  |
|  3 cm)      |                   |
+-------------+--------------------+
| Zusammenfassung (unten, 5 cm)  |
+----------------------------------+
\`\`\`

**Nach dem Unterricht:**
1. Fragen links neben die Notizen schreiben
2. Zusammenfassung unten schreiben
3. Zum Lernen: linke Spalte abdecken, Fragen beantworten

## 2. Mindmap
- Hauptthema in der Mitte
- Äste = Hauptpunkte (max 7)
- Unteräste = Details
- Farben und Bilder nutzen!

**Gut für:** Überblick gewinnen, Zusammenhänge erkennen, Brainstorming

## 3. Sketchnotes
Kombination aus Text und einfachen Zeichnungen.
**Gut für:** visuelle Lerntypen, kreative Zusammenfassungen

## 4. Digitale Notizen
Apps: OneNote, Notion, Obsidian, GoodNotes (iPad)
**Vorteil:** Durchsuchbar, überall verfügbar, keine unleserliche Schrift
**Nachteil:** Ablenkung, schlechtere Behaltensrate als Handschrift

## Was macht gute Notizen aus?
- Eigene Worte (nicht wortwörtlich abschreiben)
- Abkürzungen entwickeln (→, =, z.B., s.o.)
- Hauptpunkte und Beispiele trennen
- Lücken lassen für spätere Ergänzungen`,

    flashcards: [
      { front: "Wie ist die Cornell-Methode aufgebaut?", back: "Seite in 3 Bereiche:\n1. Cue-Spalte (links, schmal): Fragen und Schlüsselwörter\n2. Hauptbereich (rechts): Notizen\n3. Zusammenfassung (unten)\nNach dem Unterricht: Fragen ergänzen, zusammenfassen, dann mit Cues lernen." },
      { front: "Was ist der Vorteil der Mindmap-Methode?", back: "Zeigt Zusammenhänge zwischen Ideen visuell\nHauptthema zentral, Äste für Unterthemen\nFördert kreatives und vernetztes Denken\nGut für: Überblick, Brainstorming, visuelle Lerntypen" },
      { front: "Warum ist handschriftliches Notieren besser als Tippen?", back: "Beim Schreiben von Hand muss man Inhalte verarbeiten und zusammenfassen (kein blindes Abtippen).\nStudien zeigen: bis zu 6x bessere Behaltensrate beim Handschreiben.\nDas Gehirn verarbeitet tiefer." },
      { front: "Was sind gute Abkürzungen beim Mitschreiben?", back: "→ für 'führt zu / deshalb'\n= für 'ist gleich / bedeutet'\n≠ für 'ist nicht gleich'\nz.B. für 'zum Beispiel'\ns.o. für 'siehe oben'\nd.h. für 'das heißt'\n∴ für 'also / deshalb'" },
    ],

    quiz: [
      { q: "Was ist die Cornell-Methode?", opts: ["Eine App", "Seitenaufteilung in Cue/Notizen/Zusammenfassung", "Mindmap-Technik", "Digitales Notieren"], correct: 1, exp: "Cornell teilt die Seite in: links Fragen/Cues, rechts Notizen, unten Zusammenfassung." },
      { q: "Was ist die beste Lernstrategie mit Cornell-Notizen?", opts: ["Notizen nochmal lesen", "Linke Spalte abdecken und Fragen beantworten", "Alles abschreiben", "Notizen fotografieren"], correct: 1, exp: "Linke Cue-Spalte abdecken → aktives Abrufen aus dem Gedächtnis = effektivste Lernmethode." },
      { q: "Für was sind Mindmaps besonders gut geeignet?", opts: ["Lineare Informationen", "Wortschatz lernen", "Zusammenhänge und Überblick", "Formeln merken"], correct: 2, exp: "Mindmaps zeigen Beziehungen zwischen Konzepten und helfen beim Überblick." },
      { q: "Warum sollte man Notizen in eigenen Worten formulieren?", opts: ["Spart Zeit", "Fördert tieferes Verständnis und bessere Behaltensrate", "Macht Notizen kürzer", "Damit der Lehrer es nicht erkennt"], correct: 1, exp: "Eigene Worte erfordern aktives Verarbeiten – das ist effektiver als wortwörtliches Abschreiben." },
    ],
  },

  CYBERSECURITY_TEENS: {
    studyGuide: `# Sicher online – Passwort, Phishing, Social Media

## Sichere Passwörter
**Schwache Passwörter** (häufigste 2024): 123456, password, qwerty, iloveyou

**Starkes Passwort:**
- Mind. 12 Zeichen
- Groß- und Kleinbuchstaben
- Zahlen und Sonderzeichen
- Kein Wort aus dem Wörterbuch

**Merktrick – Passsatz-Methode:**
"Ich fahre jeden Sommer mit 3 Freunden ans Meer!" → **IfjSm3FaM!**

**Passwort-Manager:** 1Password, Bitwarden (sicher, bequem)
**Niemals:** Gleiches Passwort auf mehreren Sites!

## Zwei-Faktor-Authentifizierung (2FA)
Zusätzlich zum Passwort: zweiter Faktor nötig
- SMS-Code (weniger sicher)
- Authenticator-App (besser: Google/Authy)
- Hardware-Key (am sichersten)

## Phishing erkennen
Phishing = Betrug durch gefälschte E-Mails/Webseiten

**Warnsignale:**
- Absender-Adresse nicht stimmt (bank@sicherheit-de.ru)
- Dringende Sprache: "Sofort reagieren oder Account gesperrt!"
- Links auf komische Domains
- Schlechte Grammatik und Rechtschreibung
- Anhänge von Unbekannten

**Teste immer:** Fahre mit Maus über Link → URL prüfen, bevor klicken!

## Social Media – Datenschutz
- Profil auf **privat** stellen
- Standortdaten **deaktivieren** (Handy-Fotos verraten Standort!)
- Vorsicht mit: echtem Namen, Schule, Adresse, Geburtsdatum
- **Screenshots sind für immer** – auch wenn du Beitrag löschst
- DSGVO: Du hast Recht auf Löschung deiner Daten (Recht auf Vergessenwerden)

## Cybermobbing
- Beweise sichern (Screenshots)
- Block-Funktion nutzen
- Eltern/Vertrauensperson einschalten
- Melden: jugendschutz.net, nummergegenkummer.de`,

    flashcards: [
      { front: "Was macht ein Passwort sicher?", back: "Mind. 12 Zeichen\nGroß- + Kleinbuchstaben\nZahlen + Sonderzeichen\nKein Wörterbuch-Wort\nNicht für mehrere Dienste verwenden\nTipp: Passsatz-Methode oder Passwort-Manager" },
      { front: "Was ist 2-Faktor-Authentifizierung (2FA)?", back: "Sicherheitsverfahren mit 2 Faktoren:\n1. Was du weißt: Passwort\n2. Was du hast: Handy/App/Hardware-Key\nBedeutet: Selbst mit dem Passwort kann jemand nicht einloggen ohne deinen 2. Faktor." },
      { front: "Wie erkenne ich eine Phishing-E-Mail?", back: "Warnsignale:\n- Komische/falsche Absenderadresse\n- Dringende/drohende Sprache\n- Links auf unbekannte Domains\n- Schlechte Rechtschreibung\n- Anhänge von Unbekannten\nRegel: Im Zweifel → nicht klicken, direkt Website aufrufen!" },
      { front: "Welche persönlichen Daten solltest du online nie teilen?", back: "- Vollständige Adresse\n- Telefonnummer\n- Geburtsdatum (für Identitätsdiebstahl)\n- Schule und genaue Routine\n- Passwörter (NIEMAND braucht die!)\n- Bankdaten" },
      { front: "Was ist DSGVO und was bedeutet 'Recht auf Vergessenwerden'?", back: "DSGVO = Datenschutz-Grundverordnung (EU)\nRecht auf Vergessenwerden: Du kannst verlangen, dass Unternehmen deine persönlichen Daten löschen.\nGilt für: Social Media, Online-Shops, Apps" },
    ],

    quiz: [
      { q: "Welches ist ein sicheres Passwort?", opts: ["password123", "Max2004", "Tr!7kL#mQ9$w", "123456789"], correct: 2, exp: "Starkes Passwort: 12+ Zeichen, Groß/Klein, Zahlen, Sonderzeichen, kein Wort aus dem Wörterbuch." },
      { q: "Was ist Phishing?", opts: ["Online-Angeln", "Betrug durch gefälschte E-Mails/Seiten zur Datenstehlung", "Virenprogramm", "Spam-Filter"], correct: 1, exp: "Phishing = Cyberkriminelle geben sich als vertrauenswürdige Quelle aus um Zugangsdaten zu stehlen." },
      { q: "Was ist 2FA?", opts: ["Zwei Passwörter", "Anmeldung mit zwei Faktoren (Passwort + Code)", "Zwei-Wege-Verschlüsselung", "Zweifache Sicherung"], correct: 1, exp: "2FA = Passwort + zweiter Faktor (Code per App/SMS/Key) für deutlich mehr Sicherheit." },
      { q: "Was solltest du NICHT auf Social Media teilen?", opts: ["Hobbies", "Lieblingsfilme", "Genaue Heimatadresse", "Urlaubs-Fotos ohne Standort"], correct: 2, exp: "Genaue Adresse ermöglicht Stalking, Einbruchplanung und Identitätsdiebstahl." },
    ],
  },

  REL_09_WELTRELIGIONEN: {
    studyGuide: `# Religionen im Dialog – Respektvoll & Sachlich

## Die fünf Weltreligionen im Vergleich

### Christentum
- **Entstehung:** 1. Jh. n.Chr., Palästina
- **Gläubige:** ca. 2,4 Mrd. (größte Religion weltweit)
- **Heilige Schrift:** Bibel (Altes + Neues Testament)
- **Gotteskonzept:** Dreieiniger Gott (Vater, Sohn, Heiliger Geist)
- **Zentrale Lehre:** Jesus Christus ist Gottes Sohn, Erlösung durch Glauben
- **Hauptrichtungen:** Katholisch, Evangelisch, Orthodox

### Islam
- **Entstehung:** 7. Jh. n.Chr., Arabische Halbinsel (Mohammed)
- **Gläubige:** ca. 1,8 Mrd.
- **Heilige Schrift:** Koran (direkt von Allah geoffenbart)
- **Gotteskonzept:** Allah – einziger Gott, strenger Monotheismus
- **5 Säulen:** Glaubensbekenntnis, Gebet (5×tägl.), Fasten (Ramadan), Almosen (Zakat), Pilgerfahrt (Hadsch)
- **Hauptrichtungen:** Sunna, Schia

### Judentum
- **Entstehung:** ca. 1800 v.Chr. (Abraham)
- **Gläubige:** ca. 15 Mio.
- **Heilige Schrift:** Tanach (Torah, Nevi'im, Ketuvim); Talmud
- **Gotteskonzept:** Jahwe – einziger Gott (strenger Monotheismus)
- **Zentrale Lehre:** Bund zwischen Gott und dem Volk Israel; Gebote (Mizwot)

### Buddhismus
- **Entstehung:** ca. 5. Jh. v.Chr. (Siddhartha Gautama, Nordindien)
- **Gläubige:** ca. 500 Mio.
- **Heilige Schrift:** Tripitaka (Pali-Kanon)
- **Gotteskonzept:** Kein persönlicher Schöpfergott; Dharma (Weltgesetz)
- **Zentrale Lehre:** 4 Edle Wahrheiten, 8-facher Pfad, Nirvana

### Hinduismus
- **Entstehung:** ca. 1500 v.Chr. (älteste lebende Religion)
- **Gläubige:** ca. 1,2 Mrd.
- **Heilige Schrift:** Veden, Upanishaden, Bhagavad Gita
- **Gotteskonzept:** Viele Götter (Brahma, Vishnu, Shiva), aber ein Grundprinzip (Brahman)
- **Zentrale Lehre:** Karma, Reinkarnation, Dharma, Befreiung (Moksha)

## Gemeinsamkeiten
- Alle haben ethische Grundsätze (Goldene Regel: Was du nicht willst...)
- Alle sprechen von Mitgefühl, Nächstenliebe, Gerechtigkeit
- Alle haben Gebete/Meditation als Praxis`,

    flashcards: [
      { front: "Was sind die fünf Weltreligionen und ihre Gründer/Entstehung?", back: "Christentum: Jesus Christus, 1. Jh. n.Chr.\nIslam: Mohammed, 7. Jh. n.Chr.\nJudentum: Abraham, ca. 1800 v.Chr.\nBuddhismus: Siddhartha Gautama, 5. Jh. v.Chr.\nHinduismus: ca. 1500 v.Chr. (kein Einzelgründer)" },
      { front: "Was sind die 5 Säulen des Islam?", back: "1. Schahada: Glaubensbekenntnis ('Es gibt keinen Gott außer Allah, Mohammed ist sein Prophet')\n2. Salat: 5× täglich beten\n3. Saum: Fasten im Ramadan\n4. Zakat: Almosen/Armensteuer\n5. Hadsch: Pilgerfahrt nach Mekka (einmal im Leben)" },
      { front: "Was sind die 4 Edlen Wahrheiten im Buddhismus?", back: "1. Das Leben enthält Leid (Dukkha)\n2. Leid entsteht durch Begehren/Gier\n3. Leid kann überwunden werden\n4. Der 8-fache Pfad führt zur Überwindung des Leidens" },
      { front: "Was ist der Unterschied zwischen Monotheismus und Polytheismus?", back: "Monotheismus: Glaube an einen einzigen Gott\n→ Judentum, Islam, Christentum\nPolytheismus: Glaube an mehrere Götter\n→ Hinduismus (viele Götter als Aspekte des Brahman)\nBuddhismus: Kein persönlicher Schöpfergott" },
      { front: "Was sind Karma und Reinkarnation im Hinduismus?", back: "Karma: Jede Handlung hat Konsequenzen, die das nächste Leben beeinflussen.\nReinkarnation (Samsara): Die Seele wird nach dem Tod wiedergeboren, bis Moksha (Befreiung) erreicht wird.\nZiel: Moksha = Vereinigung mit Brahman" },
    ],

    quiz: [
      { q: "Welche Religion hat die meisten Gläubigen?", opts: ["Islam", "Hinduismus", "Christentum", "Buddhismus"], correct: 2, exp: "Christentum: ca. 2,4 Mrd. Gläubige (größte Religion weltweit)" },
      { q: "Was ist der Koran?", opts: ["Die Heilige Schrift des Christentums", "Die Heilige Schrift des Islam", "Das Gesetzbuch des Judentums", "Buddhas Lehren"], correct: 1, exp: "Der Koran ist die heilige Schrift des Islam, die Allah dem Propheten Mohammed geoffenbart hat." },
      { q: "Was ist 'Karma'?", opts: ["Buddhistisches Paradies", "Schicksal durch eigene Handlungen in vorigen Leben", "Hinduistische Gottheit", "Islamische Pilgerfahrt"], correct: 1, exp: "Karma = Prinzip im Hinduismus/Buddhismus: jede Handlung hat Konsequenzen, die das nächste Leben beeinflussen." },
      { q: "Welche Religion glaubt an Reinkarnation?", opts: ["Nur Buddhismus", "Nur Hinduismus", "Hinduismus und Buddhismus", "Alle Religionen"], correct: 2, exp: "Sowohl Hinduismus (Atman wandert weiter) als auch Buddhismus (kein dauerhaftes Selbst, aber Wiedergeburt) kennen Reinkarnation." },
      { q: "Was haben alle Weltreligionen gemeinsam?", opts: ["Denselben Gott", "Dieselben Feste", "Ethische Grundsätze und Mitgefühl", "Dasselbe Paradies"], correct: 2, exp: "Alle großen Religionen teilen ethische Werte: Mitgefühl, Nächstenliebe, Gerechtigkeit, die Goldene Regel." },
    ],
  },


  MATH_REALWORLD: {
    studyGuide: `# Mathe im Alltag\n\n## Prozentsätze beim Einkaufen\n- Rabatt: Originalpreis × (1 − Rabatt%)\n- MwSt: Nettopreis × 1,19 (19%) oder × 1,07 (7%)\n\n## Einheitenumrechnungen\n- 1 km = 1000 m = 100.000 cm\n- 1 kg = 1000 g = 1.000.000 mg\n- 1 Liter = 1000 ml = 1 dm³\n\n## Geschwindigkeit, Zeit, Weg\n- v = s ÷ t, s = v × t, t = s ÷ v\n- Beispiel: 120 km in 1,5 h → v = 80 km/h\n\n## Haushalt & Finanzen\n- Grundpreis = Preis ÷ Menge (Vergleich beim Einkauf)\n- Monatliches Budget: Einnahmen − Ausgaben = Ersparnis`,
    flashcards: [
      { front: "Formel für Geschwindigkeit, Weg, Zeit?", back: "v = s ÷ t\ns = v × t\nt = s ÷ v\n(v=Geschwindigkeit, s=Weg, t=Zeit)" },
      { front: "Wie berechnet man den Grundpreis?", back: "Grundpreis = Gesamtpreis ÷ Menge\nBeispiel: 1,5L Saft für €2,40 → €2,40 ÷ 1,5 = €1,60 pro Liter" },
      { front: "Was kostet eine Jacke (€80) nach 30% Rabatt?", back: "€80 × 0,70 = €56\nOder: €80 − (€80 × 0,30) = €56" },
      { front: "Wie rechnet man km/h in m/s um?", back: "km/h ÷ 3,6 = m/s\nBeispiel: 72 km/h ÷ 3,6 = 20 m/s" },
    ],
    quiz: [
      { q: "Ein Auto fährt 180 km in 2 h. Wie schnell?", opts: ["80 km/h", "90 km/h", "100 km/h", "120 km/h"], correct: 1, exp: "v = 180 ÷ 2 = 90 km/h" },
      { q: "Welches ist günstiger: 750ml für €1,80 oder 1L für €2,20?", opts: ["750ml", "1 Liter", "Gleich teuer", "Nicht vergleichbar"], correct: 1, exp: "750ml: €2,40/L; 1L: €2,20/L → 1L ist günstiger" },
      { q: "19% MwSt auf €50 Nettopreis ergibt Bruttopreis von...?", opts: ["€55,50", "€59,50", "€60,50", "€69,00"], correct: 1, exp: "€50 × 1,19 = €59,50" },
    ],
  },

  MATH_09_QUADRATIC_001: {
    studyGuide: `# Quadratische Gleichungen\n\n## Normalform\nax² + bx + c = 0\n\n## Lösungsformeln\n\n### Mitternachtsformel (abc-Formel)\nx = (−b ± √(b²−4ac)) / (2a)\n\n### PQ-Formel (wenn a=1)\nx = −p/2 ± √((p/2)² − q)\n\n## Diskriminante D = b²−4ac\n- D > 0: zwei reelle Lösungen\n- D = 0: eine Lösung (Doppellösung)\n- D < 0: keine reelle Lösung\n\n## Satz von Vieta\nWenn x₁, x₂ Lösungen: x₁+x₂ = −p, x₁×x₂ = q\n\n## Beispiel\nx² − 5x + 6 = 0\nP=-5, q=6 → x = 5/2 ± √(6,25−6) = 5/2 ± 0,5\nx₁=3, x₂=2`,
    flashcards: [
      { front: "Was ist die Mitternachtsformel?", back: "x = (−b ± √(b²−4ac)) / (2a)\nFür ax² + bx + c = 0\nBeispiel: x²−5x+6=0 → a=1,b=−5,c=6" },
      { front: "Was sagt die Diskriminante aus?", back: "D = b²−4ac\nD>0: 2 Lösungen\nD=0: 1 Lösung (Doppelwurzel)\nD<0: keine reelle Lösung" },
      { front: "Was ist der Satz von Vieta?", back: "Bei x²+px+q=0 mit Lösungen x₁,x₂:\nx₁+x₂ = −p (Summe)\nx₁×x₂ = q (Produkt)" },
      { front: "Wie lautet die PQ-Formel?", back: "Für x²+px+q=0:\nx = −p/2 ± √((p/2)²−q)" },
    ],
    quiz: [
      { q: "Lösungen von x²−5x+6=0?", opts: ["x=2, x=3", "x=1, x=6", "x=−2, x=−3", "x=5, x=1"], correct: 0, exp: "Vieta: Summe=5, Produkt=6 → x=2 und x=3" },
      { q: "Diskriminante von 2x²+3x+5=0?", opts: ["D=49", "D=−31", "D=31", "D=0"], correct: 1, exp: "D=9−40=−31 → keine reelle Lösung" },
      { q: "D=0 bedeutet...?", opts: ["Keine Lösung", "Zwei Lösungen", "Eine Doppellösung", "Unendlich viele Lösungen"], correct: 2, exp: "D=0 → genau eine Lösung (Doppelwurzel)" },
    ],
  },

  MATH_10_TRIGONOMETRIE: {
    studyGuide: `# Trigonometrie\n\n## Am rechtwinkligen Dreieck\n- sin α = Gegenkathete / Hypotenuse\n- cos α = Ankathete / Hypotenuse\n- tan α = Gegenkathete / Ankathete\n\n**Merksatz:** SOH-CAH-TOA\n\n## Wichtige Winkel\n| Winkel | sin | cos | tan |\n|--------|-----|-----|-----|\n| 0° | 0 | 1 | 0 |\n| 30° | ½ | √3/2 | 1/√3 |\n| 45° | √2/2 | √2/2 | 1 |\n| 60° | √3/2 | ½ | √3 |\n| 90° | 1 | 0 | — |\n\n## Einheitskreis\nAm Einheitskreis: P(cos α | sin α)\n\n## Sinussatz (allg. Dreieck)\na/sin α = b/sin β = c/sin γ\n\n## Kosinussatz\na² = b² + c² − 2bc·cos α`,
    flashcards: [
      { front: "Was bedeutet SOH-CAH-TOA?", back: "Sin = Opposite/Hypotenuse (Gegenkathete/Hypotenuse)\nCos = Adjacent/Hypotenuse (Ankathete/Hypotenuse)\nTan = Opposite/Adjacent (Gegenkathete/Ankathete)" },
      { front: "Was sind sin 30°, cos 60°, tan 45°?", back: "sin 30° = 0,5\ncos 60° = 0,5\ntan 45° = 1" },
      { front: "Was ist der Sinussatz?", back: "a/sin α = b/sin β = c/sin γ\nAnwendung: Wenn Seite + gegenüberliegender Winkel bekannt" },
      { front: "Was ist der Kosinussatz?", back: "a² = b² + c² − 2bc·cos α\nVerallgemeinerung des Pythagoras auf beliebige Dreiecke" },
    ],
    quiz: [
      { q: "In einem rechtwinkligen Dreieck: Hypotenuse=10, Winkel=30°. Gegenkathete?", opts: ["5", "8,66", "5,77", "10"], correct: 0, exp: "sin 30° = 0,5; Gegenkathete = 10 × 0,5 = 5" },
      { q: "Was gilt am Einheitskreis für Punkt P(x|y) zum Winkel α?", opts: ["x=tan α, y=sin α", "x=cos α, y=sin α", "x=sin α, y=cos α", "x=α, y=α"], correct: 1, exp: "Am Einheitskreis: x-Koordinate = cos α, y-Koordinate = sin α" },
      { q: "Wann verwendet man den Kosinussatz?", opts: ["Nur bei rechtwinkligen Dreiecken", "Wenn zwei Seiten und der eingeschlossene Winkel bekannt", "Immer statt Pythagoras", "Nur bei gleichseitigen Dreiecken"], correct: 1, exp: "Kosinussatz: SWS-Situation (zwei Seiten + eingeschlossener Winkel)" },
    ],
  },

  MATH_11_ANALYSIS: {
    studyGuide: `# Analysis – Differentialrechnung\n\n## Grenzwerte & Stetigkeit\nlim(x→a) f(x) = L bedeutet: f(x) nähert sich L wenn x→a\n\n## Ableitungsregeln\n| Funktion | Ableitung |\n|----------|-----------|\n| xⁿ | n·xⁿ⁻¹ |\n| eˣ | eˣ |\n| ln x | 1/x |\n| sin x | cos x |\n| cos x | −sin x |\n\n### Kettenregel\n(f(g(x)))' = f'(g(x)) · g'(x)\n\n### Produktregel\n(f·g)' = f'·g + f·g'\n\n### Quotientenregel\n(f/g)' = (f'·g − f·g') / g²\n\n## Kurvendiskussion\n1. f'(x)=0 → Extrempunkte\n2. f''(x)>0 → Minimum; f''(x)<0 → Maximum\n3. f''(x)=0 und Vorzeichenwechsel → Wendepunkt\n\n## Integralrechnung\n∫xⁿ dx = xⁿ⁺¹/(n+1) + C\nFlächeninhalt: ∫[a,b] f(x) dx`,
    flashcards: [
      { front: "Was ist die Kettenregel?", back: "(f(g(x)))' = f'(g(x)) · g'(x)\nBeispiel: (sin(x²))' = cos(x²) · 2x" },
      { front: "Wie findet man Extrempunkte?", back: "1. f'(x)=0 setzen und lösen (Kandidaten)\n2. f''(x) berechnen:\n   f''(x)>0 → Minimum\n   f''(x)<0 → Maximum\n   f''(x)=0 → weiteres Kriterium nötig" },
      { front: "Was ist ein Wendepunkt?", back: "Punkt, wo die Krümmung der Kurve das Vorzeichen wechselt.\nBedingung: f''(x)=0 UND Vorzeichenwechsel von f''\nDort wechselt Linkskrümmung zu Rechtskrümmung oder umgekehrt." },
      { front: "Was ist das bestimmte Integral?", back: "∫[a,b] f(x) dx = F(b) − F(a)\nF ist die Stammfunktion von f.\nGeometrisch: Fläche zwischen Kurve und x-Achse" },
    ],
    quiz: [
      { q: "Ableitung von f(x)=x⁴?", opts: ["4x³", "x³", "4x⁵", "4x"], correct: 0, exp: "Potenzregel: (xⁿ)' = n·xⁿ⁻¹ → (x⁴)' = 4x³" },
      { q: "f'(x)=0 und f''(x)<0 bedeutet...?", opts: ["Wendepunkt", "Tiefpunkt", "Hochpunkt", "Sattelpunkt"], correct: 2, exp: "f'=0 (Extremstelle) und f''<0 (Konkav nach unten) → lokales Maximum (Hochpunkt)" },
      { q: "Stammfunktion von f(x)=3x²?", opts: ["6x", "x³", "3x³", "x³+C"], correct: 3, exp: "∫3x² dx = 3·x³/3 + C = x³ + C" },
    ],
  },


  MATH_12_STOCHASTIK: {
    studyGuide: `# Stochastik – Wahrscheinlichkeit & Statistik\n\n## Wahrscheinlichkeit\nP(A) = günstige Ergebnisse / alle möglichen Ergebnisse\nP(A) liegt immer zwischen 0 und 1.\n\n## Rechenregeln\n- Gegenwahrscheinlichkeit: P(Ā) = 1 − P(A)\n- Additionssatz: P(A∪B) = P(A) + P(B) − P(A∩B)\n- Multiplikation (unabhängig): P(A∩B) = P(A) × P(B)\n\n## Bedingte Wahrscheinlichkeit\nP(A|B) = P(A∩B) / P(B)\n\n## Binomialverteilung\nX ~ B(n,p): P(X=k) = C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ\nErwartungswert: μ = n×p\nStandardabweichung: σ = √(n×p×(1−p))\n\n## Normalverteilung\nGlockenförmige Kurve, μ±σ enthält ~68%, μ±2σ ~95%`,
    flashcards: [
      { front: "Wie berechnet man klassische Wahrscheinlichkeit?", back: "P(A) = (Anzahl günstiger Ergebnisse) / (Anzahl aller Ergebnisse)\nBeispiel Würfel: P(gerade Zahl) = 3/6 = 0,5" },
      { front: "Was ist die Gegenwahrscheinlichkeit?", back: "P(Ā) = 1 − P(A)\nBeispiel: P(mindestens eine 6 in 4 Würfen) = 1 − P(keine 6)\n= 1 − (5/6)⁴ ≈ 0,52" },
      { front: "Was ist die Binomialverteilung?", back: "B(n,p): n unabhängige Versuche, Treffer-Wahrscheinlichkeit p\nP(X=k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ\nBeispiel: 10 Würfe, P(genau 3 Sechsen)" },
      { front: "Was sagt die Normalverteilung?", back: "Glockenform um Mittelwert μ\nμ±1σ: ~68% der Daten\nμ±2σ: ~95% der Daten\nμ±3σ: ~99,7% der Daten (68-95-99,7-Regel)" },
    ],
    quiz: [
      { q: "Eine Münze wird 3× geworfen. P(genau 2× Kopf)?", opts: ["1/4", "3/8", "1/2", "1/8"], correct: 1, exp: "C(3,2)×(0,5)²×0,5 = 3×0,25×0,5 = 3/8" },
      { q: "Erwartungswert der Binomialverteilung B(20, 0,3)?", opts: ["3", "6", "10", "0,3"], correct: 1, exp: "μ = n×p = 20×0,3 = 6" },
      { q: "P(A)=0,4, P(B)=0,5, A und B unabhängig. P(A∩B)?", opts: ["0,9", "0,2", "0,1", "0,45"], correct: 1, exp: "Unabhängig: P(A∩B) = P(A)×P(B) = 0,4×0,5 = 0,2" },
    ],
  },

  BIO_09_EVOLUTION: {
    studyGuide: `# Evolution – Theorie & Belege\n\n## Darwins Evolutionstheorie (1859)\n1. Variation: Individuen einer Art unterscheiden sich\n2. Vererbung: Merkmale werden weitergegeben\n3. Selektion: Besser angepasste überleben und pflanzen sich fort\n4. Artenbildung durch Akkumulation von Veränderungen\n\n## Natürliche Selektion\n- Überschussproduktion: mehr Nachkommen als überleben können\n- Kampf ums Überleben → Selektion\n- Survival of the fittest = Überleben der am besten Angepassten\n\n## Belege für Evolution\n- **Fossilien**: Zeitliche Abfolge von Lebewesen\n- **Homologe Organe**: gleicher Bauplan, verschiedene Funktion (Arm/Fledermausflügel)\n- **Analoge Organe**: gleiche Funktion, verschiedener Bauplan (Vogelflügel/Insektenflügel)\n- **Vestigiale Organe**: zurückgebildete Organe (Blinddarm, Steißbein)\n- **DNA-Vergleiche**: enger Verwandtschaftsgrad = ähnliche DNA\n\n## Speciation (Artbildung)\n- Allopatrisch: geographische Trennung → getrennte Evolution\n- Sympatrisch: ohne Trennung durch ökologische Nischen`,
    flashcards: [
      { front: "Was sind die vier Prinzipien von Darwins Evolutionstheorie?", back: "1. Variation: Individuen einer Art unterscheiden sich\n2. Vererbung: Merkmale werden vererbt\n3. Überschussreproduktion: mehr Nachkommen als überleben\n4. Selektion: besser Angepasste überleben und reproduzieren" },
      { front: "Was ist der Unterschied zwischen homologen und analogen Organen?", back: "Homolog: gleicher Ursprung/Bauplan, verschiedene Funktion\n→ Menschenarm & Walflösse & Vogelflügel (alle aus Tetrapoden-Gliedmaße)\nAnalog: gleiche Funktion, verschiedener Ursprung\n→ Vogelflügel & Insektenflügel" },
      { front: "Was sind vestigiale Organe?", back: "Rudimentäre, zurückgebildete Organe ohne aktuelle Funktion.\nBeweise für Evolution aus Vorfahren, bei denen sie nützlich waren.\nBeispiele: Blinddarm, Steißbein, Weisheitszähne beim Menschen" },
      { front: "Was bedeutet 'Survival of the Fittest'?", back: "Nicht 'Stärksten' sondern 'am besten Angepassten' überleben.\nIn jeweiliger Umwelt am besten angepasste Individuen haben größeren Reproduktionserfolg.\n(fittest = best fit = bestangepasst, nicht stärkst)" },
    ],
    quiz: [
      { q: "Was ist natürliche Selektion?", opts: ["Züchtung durch Menschen", "Überleben der besser Angepassten und Weitergabe ihrer Gene", "Zufällige Mutation", "Geografische Trennung"], correct: 1, exp: "Natürliche Selektion: Umwelt 'wählt' - besser Angepasste haben mehr Nachkommen." },
      { q: "Was sind homologe Organe?", opts: ["Gleiche Funktion, verschiedener Bauplan", "Gleicher Bauplan, verschiedene Funktion", "Zurückgebildete Organe", "Organe bei Insekten"], correct: 1, exp: "Homolog = gleicher evolutionärer Ursprung, verschiedene Funktion (Arm/Flügel/Flosse)" },
      { q: "Was zeigen Fossilfunde?", opts: ["Nur ausgestorbene Tiere", "Zeitliche Abfolge der Entwicklung von Lebewesen", "Nur Meereslebewesen", "Dass Evolution falsch ist"], correct: 1, exp: "Fossilien zeigen die zeitliche Abfolge und Veränderung von Lebewesen über Millionen Jahre." },
    ],
  },

  BIO_11_GENETIK: {
    studyGuide: `# Genetik – DNA, Mendel, Genexpression\n\n## DNA-Struktur\n- Doppelhelix aus zwei komplementären Strängen\n- Basenpaare: A-T, G-C\n- Gen = Abschnitt der DNA, der für ein Protein kodiert\n- Chromosom = stark aufgespulte DNA + Histone\n\n## Mendelsche Gesetze\n1. **Uniformitätsgesetz**: F1 alle gleich bei Reinzuchteltern\n2. **Spaltungsgesetz**: F2 im Verhältnis 3:1 (dominant:rezessiv)\n3. **Unabhängigkeitssatz**: Gene auf verschiedenen Chromosomen vererben unabhängig\n\n## Genexpression\nDNA → (Transkription) → mRNA → (Translation) → Protein\n- Transkription: im Zellkern, DNA → mRNA\n- Translation: am Ribosom, mRNA → Aminosäurekette\n\n## Mutationen\n- Punktmutation: einzelne Base verändert\n- Insertion/Deletion: Base eingefügt/entfernt (Leserasterverschiebung!)\n- Chromosomenmutation: Stücke fehlen oder verdoppelt`,
    flashcards: [
      { front: "Was sind die komplementären Basenpaare der DNA?", back: "Adenin (A) — Thymin (T)\nGuanin (G) — Cytosin (C)\nIn RNA: Thymin wird durch Uracil (U) ersetzt\nA paart mit U in RNA" },
      { front: "Was besagt das Spaltungsgesetz (2. Mendelsches Gesetz)?", back: "Bei Kreuzung zweier Mischlinge (Aa × Aa):\nVerhältnis in F2: 3 dominant : 1 rezessiv\nGenotypen: AA : Aa : aa = 1:2:1\nPhänotypen: 3 dominant : 1 rezessiv" },
      { front: "Was ist der Unterschied zwischen Genotyp und Phänotyp?", back: "Genotyp: die tatsächliche genetische Zusammensetzung (AA, Aa, aa)\nPhänotyp: das sichtbare Merkmal (z.B. Blütenfarbe)\nBei Dominanz: Aa zeigt denselben Phänotyp wie AA" },
      { front: "Wie läuft die Genexpression ab?", back: "DNA → Transkription (Zellkern) → mRNA\nmRNA → Translation (Ribosom) → Protein\nEin Codon (3 Basen) = eine Aminosäure" },
    ],
    quiz: [
      { q: "Welche Basen paaren sich in DNA?", opts: ["A-G und C-T", "A-T und G-C", "A-C und G-T", "A-U und G-C"], correct: 1, exp: "DNA: Adenin-Thymin und Guanin-Cytosin (komplementäre Basenpaare)" },
      { q: "F2-Generation bei Aa×Aa: Verhältnis dominant:rezessiv?", opts: ["1:1", "2:1", "3:1", "4:0"], correct: 2, exp: "Spaltungsgesetz: 3 dominant (AA, Aa, Aa) : 1 rezessiv (aa)" },
      { q: "Wo findet die Translation statt?", opts: ["Zellkern", "Mitochondrium", "Ribosom", "Golgi-Apparat"], correct: 2, exp: "Translation (mRNA → Protein) findet an Ribosomen statt." },
    ],
  },

  CHEM_08_PERIODENSYSTEM: {
    studyGuide: `# Periodensystem der Elemente (PSE)\n\n## Aufbau des PSE\n- **Perioden** (horizontal): gleiche Anzahl Elektronenschalen\n- **Gruppen** (vertikal): gleiche Anzahl Außenelektronen → ähnliche Eigenschaften\n\n## Wichtige Gruppen\n| Gruppe | Name | Beispiele |\n|--------|------|-----------|\n| 1 | Alkalimetalle | Li, Na, K |\n| 2 | Erdalkalimetalle | Mg, Ca |\n| 17 | Halogene | F, Cl, Br, I |\n| 18 | Edelgase | He, Ne, Ar |\n\n## Trends im PSE\n- **Atomradius**: nimmt in Perioden ab (→), in Gruppen zu (↓)\n- **Elektronegativität**: nimmt in Perioden zu (→), in Gruppen ab (↓)\n- **Ionisierungsenergie**: nimmt in Perioden zu, in Gruppen ab\n\n## Metalle vs. Nichtmetalle\n- Metalle: links/unten im PSE, Elektronen abgeben\n- Nichtmetalle: rechts/oben, Elektronen aufnehmen\n- Halbmetalle: Grenzbereich (Si, Ge)`,
    flashcards: [
      { front: "Was geben Gruppen und Perioden im PSE an?", back: "Periode (Zeile): Anzahl der Elektronenschalen\nGruppe (Spalte): Anzahl der Außenelektronen (Valenzelektronen)\nGleiche Gruppe → ähnliche chemische Eigenschaften" },
      { front: "Welche Elemente sind Halogene?", back: "Gruppe 17: F (Fluor), Cl (Chlor), Br (Brom), I (Iod), At (Astat)\nSehr reaktiv, wollen 1 Elektron aufnehmen (8-Elektronen-Regel)\nBilden HF, HCl, HBr, HI (Halogenwasserstoffe)" },
      { front: "Warum sind Edelgase so reaktionsträge?", back: "Gruppe 18: Vollständige Außenschale (8 Elektronen, He: 2)\nKeine Tendenz, Elektronen abzugeben oder aufzunehmen\nNahezu keine chemischen Verbindungen möglich" },
      { front: "Wie verändert sich Elektronegativität im PSE?", back: "In Perioden (→): nimmt zu (mehr Kernladung, gleiche Abschirmung)\nIn Gruppen (↓): nimmt ab (mehr Schalen, Elektronen weiter entfernt)\nFlüor = höchste EN im PSE (3,98)" },
    ],
    quiz: [
      { q: "Was gibt die Periodennummer an?", opts: ["Anzahl Protonen", "Anzahl Elektronen", "Anzahl Elektronenschalen", "Atommasse"], correct: 2, exp: "Die Periode entspricht der Anzahl der besetzten Elektronenschalen." },
      { q: "Welche Eigenschaft teilen alle Alkalimetalle (Gruppe 1)?", opts: ["1 Außenelektron", "8 Außenelektronen", "Sehr hohe Dichte", "Gasförmig bei Raumtemperatur"], correct: 0, exp: "Alkalimetalle (Li, Na, K...) haben alle 1 Valenzelektron → sehr reaktiv, geben es leicht ab." },
      { q: "Wo im PSE findet man Nichtmetalle hauptsächlich?", opts: ["Links unten", "Rechts oben", "In der Mitte", "Überall gleich verteilt"], correct: 1, exp: "Nichtmetalle befinden sich rechts oben im PSE (hohe Elektronegativität, nehmen Elektronen auf)." },
    ],
  },

  CHEM_10_REAKTIONEN: {
    studyGuide: `# Chemische Reaktionen & Reaktionstypen\n\n## Was ist eine chemische Reaktion?\nAtome/Ionen ordnen sich neu → neue Stoffe entstehen\nEnergie wird aufgenommen (endotherm) oder abgegeben (exotherm)\n\n## Reaktionstypen\n- **Synthese**: A + B → AB (Verbindungsreaktion)\n- **Analyse**: AB → A + B (Zersetzung)\n- **Substitution**: AB + C → AC + B\n- **Redoxreaktion**: Elektronenübertragung\n\n## Redoxreaktionen\n- **Oxidation**: Elektronenabgabe (Oxidationszahl steigt)\n- **Reduktion**: Elektronenaufnahme (Oxidationszahl sinkt)\n- **Reduktionsmittel**: gibt Elektronen ab (wird oxidiert)\n- **Oxidationsmittel**: nimmt Elektronen auf (wird reduziert)\n\n## Reaktionsgeschwindigkeit\nEinflüsse: Temperatur, Konzentration, Oberfläche, Katalysator\n\n## Katalysatoren\nSenken Aktivierungsenergie, werden nicht verbraucht\nBeispiel: Platin in Katalysatoren von Autos`,
    flashcards: [
      { front: "Was ist Oxidation, was ist Reduktion?", back: "Oxidation = Elektronenabgabe (Oxidationszahl ↑)\nReduktion = Elektronenaufnahme (Oxidationszahl ↓)\nMerksatz: OIL RIG (Oxidation Is Loss, Reduction Is Gain)" },
      { front: "Was ist ein Katalysator?", back: "Stoff der die Aktivierungsenergie senkt → Reaktion läuft schneller.\nWird selbst nicht verbraucht.\nBeispiel: Platin in Autokatalysatoren, Enzyme in Lebewesen" },
      { front: "Was beeinflusst die Reaktionsgeschwindigkeit?", back: "Temperatur ↑ → schneller (10°C mehr ≈ 2× schneller, RGT-Regel)\nKonzentration ↑ → schneller (mehr Kollisionen)\nOberfläche ↑ → schneller\nKatalysator → schneller ohne mehr Energie" },
      { front: "Was ist der Unterschied zwischen exotherm und endotherm?", back: "Exotherm: Energie wird abgegeben (Wärme entsteht)\nBeispiele: Verbrennung, Knallgasreaktion\nEndotherm: Energie wird aufgenommen\nBeispiele: Fotosynthese, Backen von Brot" },
    ],
    quiz: [
      { q: "Was passiert bei einer Redoxreaktion?", opts: ["Atome zerfallen", "Elektronen werden übertragen", "Kerne verschmelzen", "Ionen entstehen immer"], correct: 1, exp: "Redoxreaktion = Elektronenübertragung (Oxidation + Reduktion gleichzeitig)" },
      { q: "Was ist ein Reduktionsmittel?", opts: ["Nimmt Elektronen auf", "Gibt Elektronen ab", "Bremst Reaktion", "Zerfällt in der Reaktion"], correct: 1, exp: "Reduktionsmittel gibt Elektronen ab (wird dabei selbst oxidiert)." },
      { q: "Warum ist ein Katalysator nützlich?", opts: ["Erhöht die Aktivierungsenergie", "Senkt Aktivierungsenergie, wird nicht verbraucht", "Liefert Reaktionsenergie", "Erhöht die Temperatur"], correct: 1, exp: "Katalysator senkt die Aktivierungsenergie → Reaktion läuft schneller, ohne den Kat. zu verbrauchen." },
    ],
  },

  PHYS_07_MECHANIK: {
    studyGuide: `# Mechanik – Kräfte & Bewegung\n\n## Newtons Gesetze\n1. **Trägheitsgesetz**: Körper bleibt in Ruhe oder Bewegung, bis Kraft wirkt\n2. **Aktionsprinzip**: F = m × a\n3. **Reaktionsprinzip**: Actio = Reactio (Kraft = Gegenkraft)\n\n## Wichtige Kräfte\n- **Gewichtskraft**: Fg = m × g (g = 9,81 m/s²)\n- **Normalkraft**: senkrecht zur Oberfläche\n- **Reibungskraft**: Fr = μ × FN\n- **Federkraft**: F = D × x (Hookesches Gesetz)\n\n## Gleichförmige Bewegung\n- Konstante Geschwindigkeit: v = s/t\n- s-t-Diagramm: Gerade\n\n## Gleichmäßig beschleunigte Bewegung\n- a = Δv/Δt = konstant\n- s = ½ × a × t²\n- v = a × t\n- v-t-Diagramm: Gerade, s-t-Diagramm: Parabel\n\n## Energie & Arbeit\n- W = F × s (Arbeit)\n- Ekin = ½mv² (kinetische Energie)\n- Epot = mgh (potenzielle Energie)\n- Leistung: P = W/t (in Watt)`,
    flashcards: [
      { front: "Was besagt Newtons 2. Gesetz?", back: "F = m × a\nKraft = Masse × Beschleunigung\nEinheit: 1 Newton = 1 kg·m/s²\nBeispiel: 2 kg, a=3 m/s² → F=6N" },
      { front: "Was ist das Hooksche Gesetz?", back: "F = D × x\nFederkraft proportional zur Auslenkung x\nD = Federkonstante (N/m)\nGilt nur im elastischen Bereich (Proportionalitätsbereich)" },
      { front: "Formeln für gleichmäßig beschleunigte Bewegung?", back: "a = Δv/Δt (Beschleunigung)\nv = a × t (Geschwindigkeit)\ns = ½ × a × t² (Weg)\nv² = 2 × a × s (ohne Zeit)" },
      { front: "Was ist der Unterschied zwischen Masse und Gewichtskraft?", back: "Masse: Maß für Trägheit, in kg, überall gleich\nGewichtskraft: Fg = m × g, in Newton, ortsabhängig\nAuf dem Mond: g = 1,62 m/s² → Fg 6× kleiner" },
    ],
    quiz: [
      { q: "Ein 5 kg schwerer Block wird mit 20 N beschleunigt. a=?", opts: ["4 m/s²", "2 m/s²", "25 m/s²", "100 m/s²"], correct: 0, exp: "a = F/m = 20/5 = 4 m/s²" },
      { q: "Was ist die Gewichtskraft eines 70-kg-Menschen (g=10)?", opts: ["7 N", "70 N", "700 N", "7000 N"], correct: 2, exp: "Fg = m × g = 70 × 10 = 700 N" },
      { q: "Was beschreibt Actio = Reactio?", opts: ["Trägheit", "Kraft = Gegenkraft in entgegengesetzter Richtung", "Beschleunigung durch Kraft", "Reibung"], correct: 1, exp: "3. Newtonsches Gesetz: Jede Kraft hat eine gleichgroße, entgegengesetzte Gegenkraft." },
    ],
  },

  SCI_EXPERIMENT_SAFETY: {
    studyGuide: `# Sicherheit im Labor\n\n## Grundregeln\n1. Niemals allein im Labor arbeiten\n2. Schutzbrille immer tragen (auch wenn Chemikalien nicht direkt verwendet werden)\n3. Keine Lebensmittel/Getränke im Labor\n4. Haare und Schmuck sichern\n5. Handschuhe bei ätzenden Stoffen\n6. Kittel tragen\n\n## Gefahrensymbole (GHS)\n| Symbol | Bedeutung |\n|--------|-----------|\n| Flamme 🔥 | Entzündlich/Entzündbar |\n| Totenkopf ☠ | Giftig |\n| Ausrufezeichen ⚠ | Reizend/Gesundheitsschädlich |\n| Ätzung 🧪 | Ätzend |\n| Umwelt 🌍 | Umweltgefährlich |\n\n## Bei Unfällen\n- Chemikalien in Auge: sofort 15 Min. mit Wasser ausspülen\n- Verätzung auf Haut: viel Wasser, Lehrer informieren\n- Brand: Feuerdecke oder CO₂-Löscher, niemals Wasser auf Fettbrand\n- Glasbruch: nicht mit bloßen Händen aufheben\n\n## Entsorgung\n- Lösungsmittel: Behälter für organische Abfälle\n- Säuren/Laugen: neutralisieren, dann in Ausguss\n- Schwermetalle: Sonderabfall`,
    flashcards: [
      { front: "Was sind die 3 wichtigsten Laborregeln?", back: "1. Schutzbrille IMMER tragen\n2. Niemals allein arbeiten\n3. Keine Lebensmittel/Getränke im Labor\nDazu: Kittel, Haare sichern, Handschuhe bei Bedarf" },
      { front: "Was bedeutet das GHS-Symbol Totenkopf?", back: "Giftig (akut toxisch)\nKann bei Verschlucken, Einatmen oder Hautkontakt schädlich oder tödlich sein.\nBeispiele: Methanol, bestimmte Schwermetallverbindungen" },
      { front: "Was tun bei Chemikalien im Auge?", back: "Sofort und gründlich mit viel Wasser spülen (mind. 15 Minuten).\nAugenlider offen halten.\nDanach sofort Arzt aufsuchen.\nNotfalldusche/Augenspülflasche nutzen." },
      { front: "Warum darf man keinen Wasser auf einen Fettbrand schütten?", back: "Wasser verdampft explosionsartig im heißen Fett → Fettexplosion!\nRichtig: Feuerdecke drauflegen (erstickt die Flamme)\nOder: CO₂-Löscher\nFettbrände sind Class F-Brände." },
    ],
    quiz: [
      { q: "Was ist bei einem Chemieunfall im Auge zu tun?", opts: ["Auge reiben", "15 Min. mit Wasser spülen", "Augentropfen nehmen", "Auge verbinden"], correct: 1, exp: "Mind. 15 Min. mit Wasser spülen unter fließendem Wasser, dann Arzt." },
      { q: "Was bedeutet das GHS-Flammen-Symbol?", opts: ["Explosiv", "Entzündlich", "Ätzend", "Giftig"], correct: 1, exp: "Die Flamme steht für entzündliche/entzündbare Stoffe." },
      { q: "Welche Schutzausrüstung ist IMMER im Labor Pflicht?", opts: ["Handschuhe", "Gasmaske", "Schutzbrille", "Sicherheitsschuhe"], correct: 2, exp: "Schutzbrille ist Pflicht, auch wenn man selbst keine Chemikalien verwendet (Spritzschutz!)" },
    ],
  },


  PHYS_09_ELEKTRO: {
    studyGuide: `# Elektrizität – Grundlagen\n\n## Elektrischer Stromkreis\n- **Spannung U** (Volt): Antrieb für Ladungen\n- **Stromstärke I** (Ampere): Ladungsfluss pro Zeit\n- **Widerstand R** (Ohm): Hemmung des Stromflusses\n\n## Ohmsches Gesetz\nU = R × I → R = U/I → I = U/R\n\n## Schaltungen\n**Reihenschaltung:**\n- Strom überall gleich: I₁=I₂\n- Spannung teilt sich auf: U = U₁+U₂\n- Gesamtwiderstand: R = R₁+R₂\n\n**Parallelschaltung:**\n- Spannung überall gleich: U₁=U₂\n- Strom teilt sich auf: I = I₁+I₂\n- 1/R = 1/R₁ + 1/R₂\n\n## Elektrische Leistung & Energie\n- P = U × I (Watt)\n- W = P × t = U × I × t (Joule oder kWh)\n- 1 kWh = 3.600.000 J\n\n## Magnetismus\n- Elektrischer Strom erzeugt Magnetfeld (Elektromagnet)\n- Sich änderndes Magnetfeld erzeugt Strom (Induktion)`,
    flashcards: [
      { front: "Was besagt das Ohmsche Gesetz?", back: "U = R × I\nSpannung = Widerstand × Stromstärke\nU in Volt (V), R in Ohm (Ω), I in Ampere (A)" },
      { front: "Wie unterscheiden sich Reihen- und Parallelschaltung?", back: "Reihenschaltung: Strom gleich, Spannung teilt sich, R = R₁+R₂\nParallelschaltung: Spannung gleich, Strom teilt sich, 1/R = 1/R₁+1/R₂\nParallel → Gesamtwiderstand kleiner als kleinster Einzelwiderstand" },
      { front: "Wie berechnet man elektrische Leistung?", back: "P = U × I (Leistung in Watt)\nP = U²/R = I²×R (alternative Formen)\nBeispiel: 230 V, 2 A → P = 460 W" },
      { front: "Was ist elektrische Energie und wie wird sie berechnet?", back: "W = P × t\nIn kWh (Kilowattstunden) bei Haushaltsgeräten\n1 kWh = 1000 W × 1 Stunde\nKostenberechnung: kWh × Preis pro kWh" },
    ],
    quiz: [
      { q: "Widerstand=100Ω, Spannung=12V. Wie groß ist der Strom?", opts: ["1200 A", "0,12 A", "8,3 A", "12 A"], correct: 1, exp: "I = U/R = 12/100 = 0,12 A" },
      { q: "Zwei Widerstände 4Ω und 6Ω in Reihe. Gesamtwiderstand?", opts: ["2,4 Ω", "5 Ω", "10 Ω", "24 Ω"], correct: 2, exp: "Reihe: R = R₁+R₂ = 4+6 = 10 Ω" },
      { q: "Welche Leistung hat ein Gerät mit U=230V und I=0,5A?", opts: ["460 W", "115 W", "230 W", "0,5 W"], correct: 1, exp: "P = U×I = 230×0,5 = 115 W" },
    ],
  },

  PHYS_11_QUANTEN: {
    studyGuide: `# Quantenphysik – Grundideen\n\n## Welle-Teilchen-Dualismus\nLicht und Materie zeigen je nach Experiment Wellen- ODER Teilchenverhalten.\n- **Photoelektrischer Effekt** (Einstein): Licht besteht aus Photonen (Teilchen)\n- **Doppelspaltexperiment**: Elektronen erzeugen Interferenzmuster (Wellen)\n\n## Plancksche Quantenhypothese\nEnergie wird in diskreten Paketen (Quanten) übertragen:\nE = h × f (h = 6,626×10⁻³⁴ Js, Plancksches Wirkungsquantum)\n\n## Heisenbergsche Unschärferelation\nΔx × Δp ≥ ħ/2\nOrt und Impuls eines Teilchens können nicht gleichzeitig beliebig genau bestimmt werden.\n\n## Atommodell nach Bohr\n- Elektronen auf festen Bahnen (Energieniveaus)\n- Lichtemission beim Übergang zu niedrigerem Niveau\n- Quantenzahl n bestimmt Energieniveau\n\n## Schrödingergleichung\nBeschreibt zeitliche Entwicklung der Wellenfunktion ψ\nψ² gibt Aufenthaltswahrscheinlichkeit an`,
    flashcards: [
      { front: "Was ist der Welle-Teilchen-Dualismus?", back: "Licht und Materie verhalten sich je nach Experiment wie Wellen ODER Teilchen.\nWellen: Interferenz, Beugung\nTeilchen: Photoeffekt, zählbare Photonen\nBeides gehört zur vollständigen Beschreibung." },
      { front: "Was bewies der Photoelektrische Effekt?", back: "Einstein 1905: Licht ist gequantelt – besteht aus Photonen.\nEin Photon der Energie E=hf schlägt ein Elektron aus Metall heraus.\nNobel für Einstein 1921\nBeweis: Wellenbild allein reicht nicht aus." },
      { front: "Was besagt die Heisenbergsche Unschärferelation?", back: "Δx × Δp ≥ ħ/2\nOrt (Δx) und Impuls (Δp) können nie gleichzeitig beliebig genau bekannt sein.\nKeine Messtechnik kann das überwinden – es ist fundamental.\n→ Quantenwelt ist grundsätzlich unscharf." },
      { front: "Was ist ein Quantensprung?", back: "Elektronen wechseln diskret zwischen Energieniveaus.\nBeim Sprung nach unten: Photon mit E=hf wird emittiert.\nBeim Sprung nach oben: Photon mit E=hf wird absorbiert.\nErklärt Spektrallinien von Atomen." },
    ],
    quiz: [
      { q: "Was zeigte der Photoelektrische Effekt?", opts: ["Licht ist eine Welle", "Licht besteht aus diskreten Photonen", "Elektronen sind Wellen", "Atome sind teilbar"], correct: 1, exp: "Photoeffekt beweist den Teilchencharakter des Lichts (Photonen mit E=hf)." },
      { q: "Was beschreibt die Heisenbergsche Unschärferelation?", opts: ["Ungenauigkeit von Messgeräten", "Fundamentale Grenze: Ort und Impuls nicht gleichzeitig exakt bestimmbar", "Fehler in Schrödingers Gleichung", "Unschärfe nur bei Licht"], correct: 1, exp: "Unschärfe ist fundamental (kein Messproblem) – Ort und Impuls sind nicht gleichzeitig scharf." },
      { q: "E = h × f beschreibt was?", opts: ["Kinetische Energie", "Energie eines Photons", "Bindungsenergie", "Potenzielle Energie"], correct: 1, exp: "E=hf: Energie eines Photons = Plancksches Wirkungsquantum × Frequenz" },
    ],
  },

  HIST_11_KALTER_KRIEG: {
    studyGuide: `# Der Kalte Krieg (1947–1991)\n\n## Was war der Kalte Krieg?\nSystemkonflikt zwischen USA (Kapitalismus/Demokratie) und UdSSR (Kommunismus) – kein direkter Krieg, aber permanente Spannung.\n\n## Ursachen (1945)\n- Zwei gegensätzliche Ideologien\n- Atomwaffen-Rüstungswettlauf\n- Sowjetische Expansion in Osteuropa\n- Truman-Doktrin (1947): Eindämmung des Kommunismus\n\n## Phasen\n- **1947–53**: Beginn – Berliner Blockade, NATO-Gründung\n- **1953–62**: Entstalinisierung – Korea-Krieg\n- **1962**: Kuba-Krise – Höhepunkt (fast Atomkrieg!)\n- **1962–79**: Entspannung (Détente)\n- **1979–85**: Neue Eskalation – Afghanistan\n- **1985–91**: Gorbatschow, Perestroika, Auflösung\n\n## Wichtige Ereignisse\n- Marshallplan (1948): US-Wirtschaftshilfe für Europa\n- Mauerbau Berlin (1961)\n- Mondlandung (1969): Wettlauf ins All\n- Fall der Berliner Mauer (1989)\n- Auflösung der UdSSR (1991)\n\n## Ende des Kalten Krieges\nGorbatschows Reformen (Glasnost + Perestroika) + wirtschaftlicher Kollaps der UdSSR`,
    flashcards: [
      { front: "Was war die Kuba-Krise (1962)?", back: "UdSSR stationierte Atomraketen auf Kuba (90 km vor USA).\n13 Tage lang drohte nuklearer Krieg.\nEnde: UdSSR zieht Raketen ab, USA verspricht, Kuba nicht anzugreifen.\nNächste der Welt je an einem Atomkrieg." },
      { front: "Was ist die Truman-Doktrin?", back: "1947: US-Präsident Truman erklärt die Eindämmung des Kommunismus zur US-Außenpolitik.\n'Containment Policy' – communism must not spread.\nBegründete die US-Interventionspolitik im Kalten Krieg." },
      { front: "Was bedeutete die Berliner Mauer (1961–1989)?", back: "Gebaut 12.8.1961 von der DDR um den Flüchtlingsstrom zu stoppen.\nSymbol der Teilung Europas und des Kalten Krieges.\nFall am 9.11.1989 → Symbol des Endes des Kalten Krieges und der deutschen Einigung." },
      { front: "Was waren Glasnost und Perestroika?", back: "Gorbatschows Reformen ab 1985:\nGlasnost = Offenheit, Transparenz (freiere Medien, weniger Zensur)\nPerestroika = Umbau (wirtschaftliche und politische Reformen)\nFührten unbeabsichtigt zum Zerfall der UdSSR 1991." },
    ],
    quiz: [
      { q: "Wann begann offiziell der Kalte Krieg?", opts: ["1939", "1945", "1947", "1950"], correct: 2, exp: "1947: Truman-Doktrin markiert den Beginn des Kalten Krieges (Ende der Zusammenarbeit)." },
      { q: "Was war der Höhepunkt des Kalten Krieges?", opts: ["Berliner Blockade 1948", "Kuba-Krise 1962", "Vietnamkrieg 1965", "Mondlandung 1969"], correct: 1, exp: "Kuba-Krise 1962: Nächste die Welt je an einem Atomkrieg war." },
      { q: "Wann fiel die Berliner Mauer?", opts: ["1985", "1987", "1989", "1991"], correct: 2, exp: "9. November 1989 – Mauerfall, Symbol des Endes des Kalten Krieges." },
    ],
  },

  PHIL_11_ETHIK: {
    studyGuide: `# Ethik – Moralphilosophie\n\n## Was ist Ethik?\nPhilosophische Disziplin, die fragt: Was soll ich tun? Was ist moralisch richtig?\n\n## Drei Hauptpositionen\n\n### 1. Konsequentialismus (Utilitarismus)\nEine Handlung ist gut, wenn sie die besten Konsequenzen hat.\n**Vertreter:** Bentham, Mill\n**Prinzip:** „Das größte Glück der größten Zahl"\n**Kritik:** Rechtfertigt evtl. Opferung Einzelner für die Mehrheit\n\n### 2. Deontologie (Pflichtethik)\nEine Handlung ist gut, wenn sie einer moralischen Pflicht entspricht.\n**Vertreter:** Kant\n**Kategorischer Imperativ:** „Handle nur nach der Maxime, durch die du zugleich wollen kannst, dass sie allgemeines Gesetz werde."\n**Kritik:** Zu starr, keine Ausnahmen\n\n### 3. Tugendethik\nNicht die Handlung, sondern der Charakter zählt.\n**Vertreter:** Aristoteles\n**Prinzip:** Strebe nach Arete (Tugend) und Eudaimonia (Glück/Blüte)\n**Kritik:** Keine klaren Handlungsanweisungen\n\n## Trolley-Problem\nKlassisches Dilemma: Utilitarismus vs. Deontologie\nZug → 5 Menschen, Weiche stellen rettet 5, tötet 1\nUtilitarist: Weiche stellen (5 > 1)\nKantaner: Nicht handeln (Mensch nicht als Mittel nutzen)`,
    flashcards: [
      { front: "Was ist der Kategorische Imperativ Kants?", back: 'Handle nur nach der Maxime, die du auch als allgemeines Gesetz wollen kannst.\nPruefung: Koennte ich wollen, dass alle so handeln?\nBeispiel: Luegen - waere allgemeines Luegen moeglich? Nein -> Luegen ist unmoralisch.' },
      { front: "Was ist das Grundprinzip des Utilitarismus?", back: "Das größte Glück (Nutzen) für die größte Anzahl von Menschen.\nHandlungen werden nach ihren Konsequenzen bewertet.\nVertreter: Bentham (Glückskalkül), Mill (Qualitäten der Freude)\nKritik: Minderheitenrechte können geopfert werden." },
      { front: "Was ist Tugendethik nach Aristoteles?", back: "Nicht die Handlung, sondern der Charakter des Handelnden entscheidet.\nZiel: Arete (Tugend/Exzellenz) und Eudaimonia (Glück/Blüte)\nTugenden: Mut, Gerechtigkeit, Mäßigung, Klugheit\nMittelweg zwischen Extremen (Goldene Mitte)" },
      { front: "Was ist das Trolley-Problem?", back: "Klassisches ethisches Dilemma:\nTrolley → 5 Personen. Weiche stellen → 1 Person stirbt, 5 werden gerettet.\nUtilitarist: Ja, umlenken (5>1)\nKantaner: Nein, Mensch darf nicht instrumentalisiert werden\nZeigt Konflikt zwischen Konsequentialismus und Deontologie." },
    ],
    quiz: [
      { q: "Wer ist der Hauptvertreter der Pflichtethik/Deontologie?", opts: ["Aristoteles", "John Stuart Mill", "Immanuel Kant", "Jeremy Bentham"], correct: 2, exp: "Immanuel Kant entwickelte die Pflichtethik mit dem Kategorischen Imperativ." },
      { q: "Was ist das Grundprinzip des Utilitarismus?", opts: ["Handeln nach Pflicht", "Tugend als Ziel", "Größtes Glück für größte Zahl", "Vernunftprinzip"], correct: 2, exp: "Utilitarismus (Bentham, Mill): moralisch gut = größten Nutzen/Glück für die meisten." },
      { q: "Was untersucht die Ethik?", opts: ["Die Natur des Seins", "Was moralisch richtig ist und wie wir handeln sollen", "Die Struktur von Argumenten", "Die Natur der Erkenntnis"], correct: 1, exp: "Ethik = Moralphilosophie: Was soll ich tun? Was ist richtiges Handeln?" },
    ],
  },

  GEO_12_STADTENTWICKLUNG: {
    studyGuide: `# Stadtentwicklung & Urbanisierung\n\n## Verstädterung weltweit\n- 2007: erstmals mehr Menschen in Städten als auf dem Land\n- 2050: ca. 68% der Weltbevölkerung urban (UNO-Prognose)\n- Megastädte: > 10 Mio. Einwohner (Tokio, Delhi, Shanghai...)\n\n## Stadtstruktur\n**Konzentrisches Ringmodell (Burgess):**\nKern (CBD) → Übergang → Arbeiterschicht → Mittelschicht → Pendler\n\n**Sektorenmodell (Hoyt):**\nSektoren (Industrie, Wohnquartiere) strahlenförmig vom Kern\n\n## Gentrifizierung\nAufwertung von Stadtvierteln → Verdrängung ärmerer Bewohner\nPhasen: Pioniere → Yuppies → Massenzuzug → Aufwertung\nKritik: Soziale Verdrängung, steigende Mieten\n\n## Suburbanisierung\nBevölkerungsabwanderung aus Stadt ins Umland\nUrsachen: Platzmangel, hohe Mieten, Wunsch nach Grün\nFolge: Pendlerverkehr, Zersiedelung\n\n## Nachhaltige Stadtentwicklung\n- Kompakte Stadt (short distances)\n- ÖPNV-Ausbau\n- Grünflächen und Biodiversität\n- Quartiersmischung (Wohnen + Arbeit + Freizeit)`,
    flashcards: [
      { front: "Was ist Gentrifizierung?", back: "Aufwertung eines Stadtviertels durch Zuzug wohlhabenderer Gruppen → steigende Mieten → Verdrängung ärmerer Bewohner.\nPhasen: Pioniere (Künstler) → Yuppies → Kommerzialisierung\nBeispiele: Prenzlauer Berg Berlin, Hamburg Schanzenviertel" },
      { front: "Was ist Suburbanisierung?", back: "Abwanderung der Bevölkerung (oft Mittelschicht) aus der Kernstadt ins Umland.\nUrsachen: hohe Mieten, Platzwunsch, Grün\nFolgen: Pendlerverkehr, Zersiedelung der Landschaft, schrumpfende Städte" },
      { front: "Was sind Megastädte?", back: "Städte mit mehr als 10 Millionen Einwohnern.\nBeispiele: Tokio (37 Mio.), Delhi (33 Mio.), Shanghai (29 Mio.)\nHerausforderungen: Slums, Infrastruktur, Umweltverschmutzung, Wasserversorgung" },
      { front: "Was bedeutet nachhaltige Stadtentwicklung?", back: "Städte so gestalten, dass sie ökologisch, sozial und wirtschaftlich langfristig funktionieren:\n- Kompakte Bauweise (kurze Wege)\n- ÖPNV statt Autos\n- Soziale Mischung der Quartiere\n- Grünflächen und Stadtbäume" },
    ],
    quiz: [
      { q: "Wann überstieg die städtische Bevölkerung erstmals die ländliche?", opts: ["1950", "1980", "2007", "2020"], correct: 2, exp: "2007 lebten erstmals mehr Menschen in Städten als auf dem Land." },
      { q: "Was ist Gentrifizierung?", opts: ["Stadtflucht", "Aufwertung + Verdrängung in Stadtvierteln", "Industrieansiedlung", "Bevölkerungsschrumpfung"], correct: 1, exp: "Gentrifizierung: Viertel wird attraktiver → Mieten steigen → ärmere Bewohner ziehen weg." },
      { q: "Was ist eine Megastadt?", opts: ["> 1 Million", "> 5 Millionen", "> 10 Millionen", "> 20 Millionen"], correct: 2, exp: "Megastädte haben mehr als 10 Millionen Einwohner (z.B. Tokio, Delhi, Shanghai)." },
    ],
  },


  EN_A2_VOCAB_BUILDER: {
    studyGuide: `# English Vocabulary – A2 Level\n\n## Daily Life Topics\n\n### Family & Relationships\nmother, father, sister, brother, grandparents, cousin, aunt, uncle\n\n### Food & Drink\nbreakfast, lunch, dinner, vegetable, fruit, meat, drink, hungry, thirsty\n\n### School & Work\nclassroom, homework, teacher, lesson, exam, office, colleague, meeting\n\n### Time & Dates\nMonday–Sunday, January–December, yesterday, today, tomorrow, last week, next month\n\n### Numbers & Quantities\nhundred, thousand, million, some, many, few, enough, too much\n\n## Useful Phrases\n- Could you repeat that, please?\n- I don't understand.\n- How do you spell that?\n- What does ... mean?\n- Can I have..., please?\n\n## Grammar Tips (A2)\n- Present Simple: I work, she works\n- Present Continuous: I am working now\n- Simple Past: I worked yesterday\n- Going to future: I am going to study`,
    flashcards: [
      { front: "How do you say 'Geschwister' in English?", back: "siblings (allgemein)\nbrother (Bruder), sister (Schwester)\n'I have two siblings – a brother and a sister.'" },
      { front: "What is the difference between 'much' and 'many'?", back: "much → mit unzählbaren Nomen: much water, much time\nmany → mit zählbaren Nomen: many books, many friends\nBoth mean 'viel/viele'" },
      { front: "How do you form Simple Past of regular verbs?", back: "Add -ed to the base form:\nwork → worked\nlook → looked\nplay → played\nIrregular: go → went, have → had, see → saw" },
      { front: "How to politely ask for something in English?", back: "Could I have a glass of water, please?\nWould you mind...?\nMay I ask you something?\nI'd like... (formal and polite)" },
      { front: "Days of the week in English?", back: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday\nMnemonic: My Two Wet Thursdays Feel Somewhat Special" },
    ],
    quiz: [
      { q: "Which sentence is correct?", opts: ["I have many homeworks.", "I have a lot of homework.", "I have much homeworks.", "I have many homework."], correct: 1, exp: "'homework' is uncountable → 'a lot of homework' or 'much homework' (not plural)" },
      { q: "Past tense of 'go'?", opts: ["goed", "went", "gone", "going"], correct: 1, exp: "'go' is irregular: go → went → gone" },
      { q: "What does 'Could you repeat that?' mean?", opts: ["Kannst du das wiederholen?", "Wie ist dein Name?", "Woher kommst du?", "Wie spät ist es?"], correct: 0, exp: "'Could you repeat that?' = 'Könnten Sie das wiederholen?' – sehr nützliche Phrase!" },
    ],
  },

  EN_B1_GRAMMAR_FIX: {
    studyGuide: `# English Grammar – B1 Common Mistakes\n\n## Present Perfect vs Simple Past\n**Present Perfect**: Vergangenheit mit Bezug zur Gegenwart\nI **have seen** that movie. (schon mal, Resultat jetzt relevant)\n\n**Simple Past**: abgeschlossene Vergangenheit mit Zeitangabe\nI **saw** that movie yesterday.\n\n## Conditional Sentences\n| Typ | If-Satz | Hauptsatz |\n|-----|---------|----------|\n| 0 | Present Simple | Present Simple |\n| 1 | Present Simple | will + Inf |\n| 2 | Past Simple | would + Inf |\n| 3 | Past Perfect | would have + PP |\n\n## Passive Voice\nSubjekt + be + Past Participle\nThe book **was written** by Goethe.\n\n## Reported Speech\n\"I am tired\" → She said she **was** tired.\nZeit-Backshift: am→was, will→would, have→had\n\n## Articles: a / an / the / no article\n- a/an: erstmalige Erwähnung, allgemein\n- the: bereits bekannt, spezifisch\n- no article: Pluralformen allgemein, Sprachen, Ländernamen`,
    flashcards: [
      { front: "When do you use Present Perfect vs Simple Past?", back: "Present Perfect: Verbindung zur Gegenwart, keine genaue Zeitangabe\n'I have lived here for 5 years.' (noch immer)\nSimple Past: Abgeschlossen, Zeitangabe vorhanden\n'I lived there in 2010.'" },
      { front: "How does a Type 2 Conditional work?", back: "Hypothetische Gegenwart/Zukunft:\nIf + Past Simple, would + infinitive\n'If I had more time, I would study more.'\n(Ich habe aber nicht mehr Zeit → hypothetisch)" },
      { front: "How to form the Passive Voice?", back: "Subject + be (correct tense) + past participle\nActive: They built this house in 1900.\nPassive: This house was built in 1900.\nFokus auf Handlung, nicht auf Handelnden." },
      { front: "How does Reported Speech work?", back: "Backshift der Zeitformen:\nPresent → Past: 'I am' → she said she was\nPast → Past Perfect: 'I went' → she said she had gone\nWill → Would: 'I will' → she said she would" },
    ],
    quiz: [
      { q: "Which is correct: 'I have seen him yesterday' or 'I saw him yesterday'?", opts: ["I have seen him yesterday", "I saw him yesterday", "Both correct", "I had seen him yesterday"], correct: 1, exp: "'Yesterday' = specific time → Simple Past. Present Perfect cannot be used with specific past time." },
      { q: "Complete: 'If it rains, I ___ stay home.'", opts: ["would", "will", "stayed", "had stayed"], correct: 1, exp: "Type 1 Conditional (real possibility): If + Present Simple, will + infinitive" },
      { q: "Passive of: 'She writes the report'?", opts: ["The report is written by her.", "The report writes by her.", "The report was written by her.", "The report has been write by her."], correct: 0, exp: "Present Simple Passive: is/am/are + past participle → 'is written'" },
    ],
  },

  FR_A1_STARTER: {
    studyGuide: `# Français – Premiers Pas (A1)\n\n## Grüßen & Vorstellen\n- Bonjour ! / Salut ! (Hallo!)\n- Comment tu t'appelles ? (Wie heißt du?)\n- Je m'appelle... (Ich heiße...)\n- J'ai ... ans. (Ich bin ... Jahre alt.)\n- Je suis de... / J'habite à... (Ich komme aus / Ich wohne in...)\n\n## Zahlen 1–20\n1 un, 2 deux, 3 trois, 4 quatre, 5 cinq\n6 six, 7 sept, 8 huit, 9 neuf, 10 dix\n11 onze, 12 douze, 13 treize, 14 quatorze, 15 quinze\n16 seize, 17 dix-sept, 18 dix-huit, 19 dix-neuf, 20 vingt\n\n## Artikel\n| | Maskulin | Feminin | Plural |\n|--|---------|---------|--------|\n| bestimmt | le | la | les |\n| unbestimmt | un | une | des |\n\n## Verben être (sein) & avoir (haben)\n| je suis | j'ai |\n| tu es | tu as |\n| il/elle est | il/elle a |\n| nous sommes | nous avons |\n| vous êtes | vous avez |\n| ils/elles sont | ils/elles ont |\n\n## Nützliche Sätze\n- S'il vous plaît / Merci beaucoup\n- Je ne comprends pas. (Ich verstehe nicht.)\n- Répétez, s'il vous plaît. (Bitte wiederholen.)`,
    flashcards: [
      { front: "Wie stellt man sich auf Französisch vor?", back: "Bonjour, je m'appelle [Name].\nJ'ai [Alter] ans.\nJ'habite à [Stadt].\nJe suis [Nationalität].\nJe suis élève au collège." },
      { front: "Was ist der Unterschied zwischen 'le', 'la', 'les'?", back: "le: bestimmter Artikel maskulin (le garçon)\nla: bestimmter Artikel feminin (la fille)\nl': vor Vokal/h (l'ami, l'heure)\nles: Plural (les enfants)\nMerken: Genus auswendig lernen!" },
      { front: "Konjugation von 'être' (sein)?", back: "je suis, tu es, il/elle est\nnous sommes, vous êtes, ils/elles sont\nHäufigstes unregelmäßiges Verb im Französischen!" },
      { front: "Wie sagt man 1-10 auf Französisch?", back: "1 un, 2 deux, 3 trois, 4 quatre, 5 cinq\n6 six, 7 sept, 8 huit, 9 neuf, 10 dix" },
    ],
    quiz: [
      { q: "Comment dit-on 'Ich heiße Anna' auf Französisch?", opts: ["Je suis Anna", "Je m'appelle Anna", "Mon nom est Anna", "J'ai Anna"], correct: 1, exp: "Je m'appelle = ich heiße (wörtlich: Ich nenne mich)" },
      { q: "Welcher Artikel gehört zu 'livre' (Buch, maskulin)?", opts: ["la", "le", "les", "l'"], correct: 1, exp: "livre ist maskulin → le livre (bestimmt) / un livre (unbestimmt)" },
      { q: "Konjugation von avoir: nous...?", opts: ["avons", "avez", "ont", "as"], correct: 0, exp: "nous avons (wir haben) – avoir ist unregelmäßig, auswendig lernen!" },
    ],
  },

  ES_B1_CONVERSATION: {
    studyGuide: `# Español B1 – Conversación\n\n## Opiniones y Debates\n- En mi opinión... / Creo que... / Pienso que...\n- Por un lado... Por otro lado...\n- Estoy de acuerdo / No estoy de acuerdo\n- Sin embargo / No obstante (However)\n- Además / También (Also, furthermore)\n\n## Pretérito Indefinido (Simple Past)\n-ar Verben: hablé, hablaste, habló, hablamos, hablasteis, hablaron\n-er/-ir Verben: comí, comiste, comió, comimos, comisteis, comieron\nUnregelmäßig: ser/ir→ fui, fuiste, fue; tener→ tuve; hacer→ hice\n\n## Pretérito Imperfecto (Imperfect)\n-ar: hablaba, hablabas, hablaba...\n-er/-ir: comía, comías, comía...\nNutzung: wiederholte Handlungen, Beschreibungen in der Vergangenheit\n\n## Subjuntivo (Konjunktiv)\nNach: querer que, esperar que, es importante que...\nFormung: 3. Person Plural Präsens, -e/-a anhängen\nHablar → hable; comer → coma\n\n## Alltagsgespräche\n- ¿Qué tal? ¿Cómo estás? (Wie geht's?)\n- Tengo ganas de... (Ich freue mich auf / Ich möchte gern...)\n- ¡Qué pena! (Wie schade!) ¡Qué bueno! (Wie toll!)`,
    flashcards: [
      { front: "Was ist der Unterschied zwischen Indefinido und Imperfecto?", back: "Indefinido: abgeschlossene Handlung mit konkretem Zeitpunkt\n'Ayer comí pizza.' (Gestern aß ich Pizza.)\nImperfecto: wiederholte/gewohnheitsmäßige Handlungen, Beschreibungen\n'De niño comía pizza todos los viernes.'" },
      { front: "Wie drückt man Meinungen auf Spanisch aus?", back: "Creo que... / Pienso que... / En mi opinión...\n(Ich glaube dass... / Ich denke dass... / Meiner Meinung nach...)\nMit Subjuntivo nach: Espero que, Quiero que, Es importante que" },
      { front: "Konjugation 'hablar' im Indefinido?", back: "yo hablé\ntú hablaste\nél/ella habló\nnosotros hablamos\nvosotros hablasteis\nellos hablaron" },
      { front: "Wann verwendet man den Subjuntivo?", back: "Nach Ausdrücken des Wunsches, Zweifel, Emotions:\nQuiero que vengas. (Ich möchte, dass du kommst.)\nEs importante que estudies.\nDudo que sea verdad." },
    ],
    quiz: [
      { q: "Welcher Satz verwendet Imperfecto korrekt?", opts: ["Ayer fui al cine.", "De niño iba al cine cada semana.", "Mañana voy al cine.", "Iré al cine pronto."], correct: 1, exp: "Imperfecto für Gewohnheiten in der Vergangenheit: 'De niño iba...'" },
      { q: "Wie sagt man 'Ich stimme zu' auf Spanisch?", opts: ["No entiendo", "Estoy de acuerdo", "Tengo razón", "Me parece mal"], correct: 1, exp: "Estoy de acuerdo = Ich stimme zu / Ich bin einverstanden" },
      { q: "Subjuntivo von 'hablar' (yo)?", opts: ["hablo", "hablé", "hable", "hablaré"], correct: 2, exp: "Subjuntivo Präsens: hable, hables, hable, hablemos, habléis, hablen" },
    ],
  },

  LATIN_VOCAB_CORE: {
    studyGuide: `# Latein – Grundvokabular\n\n## Wichtigste Vokabeln\n\n### Verben\n- amare (lieben), esse (sein), habere (haben)\n- venire (kommen), ire (gehen), dare (geben)\n- dicere (sagen), videre (sehen), facere (machen)\n- posse (können), velle (wollen), debere (müssen)\n\n### Nomen (wichtigste)\n- homo, hominis m. (Mensch), deus, dei m. (Gott)\n- rex, regis m. (König), pater, patris m. (Vater)\n- mater, matris f. (Mutter), terra, terrae f. (Erde)\n- bellum, belli n. (Krieg), tempus, temporis n. (Zeit)\n\n### Verbindungswörter\n- et/atque (und), sed (aber), quia/quod (weil)\n- si (wenn), cum (als/wenn/obwohl)\n\n## Fallsystem (Kasus)\n| Kasus | Funktion | Frage |\n|-------|----------|-------|\n| Nominativ | Subjekt | Wer? Was? |\n| Genitiv | Besitz | Wessen? |\n| Dativ | indirektes Obj. | Wem? |\n| Akkusativ | direktes Obj. | Wen? Was? |\n| Ablativ | Umstandsangaben | Wodurch? Womit? |\n\n## Verbkonjugation (Präsens, amare)\nam-o, am-as, am-at, am-amus, am-atis, am-ant`,
    flashcards: [
      { front: "Was bedeuten: amare, esse, habere, venire?", back: "amare = lieben\nesse = sein\nhabere = haben\nvenire = kommen\n(4 wichtigste lateinische Grundverben)" },
      { front: "Welche Funktion hat der Akkusativ?", back: "Akkusativ = direktes Objekt (Wen? Was?)\nBeispiel: Puellam video. (Ich sehe das Mädchen.)\nAuch nach vielen Präpositionen: ad, per, inter, ante, post" },
      { front: "Wie konjugiert man 'amare' im Präsens?", back: "am-o (ich liebe)\nam-as (du liebst)\nam-at (er/sie liebt)\nam-amus (wir lieben)\nam-atis (ihr liebt)\nam-ant (sie lieben)" },
      { front: "Was bedeuten: rex, pater, mater, bellum?", back: "rex, regis = König\npater, patris = Vater\nmater, matris = Mutter\nbellum, belli = Krieg\n(Stammform wichtig für Deklination!)" },
    ],
    quiz: [
      { q: "Was bedeutet 'tempus' auf Latein?", opts: ["Tempel", "Zeit", "Tempo", "Feuer"], correct: 1, exp: "tempus, temporis n. = die Zeit (davon: temporal, Tempus)" },
      { q: "Welcher Kasus ist 'das Subjekt'?", opts: ["Genitiv", "Dativ", "Akkusativ", "Nominativ"], correct: 3, exp: "Nominativ = Subjekt (Wer/Was tut etwas?)" },
      { q: "'Amant' ist welche Person/Numerus?", opts: ["1. Sg.", "2. Pl.", "3. Pl.", "3. Sg."], correct: 2, exp: "am-ant = 3. Person Plural Präsens Aktiv (sie lieben)" },
    ],
  },

  POL_12_WIRTSCHAFT: {
    studyGuide: `# Wirtschaft & Politik – Grundkonzepte\n\n## Wirtschaftssysteme\n**Marktwirtschaft (liberal):**\nFreier Markt, Angebot und Nachfrage bestimmen Preise\nVorteile: Effizienz, Innovation, Wahlfreiheit\nNachteile: soziale Ungleichheit, Marktversagen\n\n**Planwirtschaft (sozialistisch):**\nStaat kontrolliert Produktion und Preise\nVorteile: Gleichheit, kein Wettbewerb\nNachteile: Ineffizienz, mangelnde Innovation\n\n**Soziale Marktwirtschaft (DE):**\nMarktwirtschaft + sozialer Ausgleich (Ludwig Erhard, 1949)\n\n## Konjunkturzyklus\nAufschwung → Hochkonjunktur → Abschwung → Rezession\n\n## Inflation\nPreisanstieg = Kaufkraftverlust\nHyperinflation: DE 1923 (Briefmarke kostete Milliarden!)\n\n## EU & Globalisierung\n- Binnenmarkt: freier Waren-, Personen-, Dienstleistungs-, Kapitalverkehr\n- Euro: gemeinsame Währung (seit 2002)\n- WTO, IWF, Weltbank: globale Wirtschaftsorganisationen`,
    flashcards: [
      { front: "Was ist die soziale Marktwirtschaft?", back: "Deutsches Wirtschaftsmodell (Ludwig Erhard, 1949):\nMarktwirtschaft + soziale Absicherung\nFreier Markt MIT staatlichem Sozialausgleich (Mindestlohn, Sozialversicherung, Kartellrecht)\nWeder reiner Kapitalismus noch Planwirtschaft" },
      { front: "Was ist der Konjunkturzyklus?", back: "Regelmäßige Schwankungen der Wirtschaftsleistung:\nAufschwung → Boom/Hochkonjunktur → Abschwung → Rezession → (wieder Aufschwung)\nRezession: 2 Quartale negatives BIP-Wachstum in Folge" },
      { front: "Was ist Inflation?", back: "Allgemeiner, anhaltender Preisanstieg → Kaufkraftverlust des Geldes.\nGemessen am Verbraucherpreisindex (VPI)\nEZB-Ziel: ~2% Inflation pro Jahr\nHyperinflation: Deutschland 1923 (Briefmarke: Milliarden Mark)" },
      { front: "Was sind die vier Grundfreiheiten des EU-Binnenmarkts?", back: "1. Freier Warenverkehr\n2. Freier Personenverkehr (Arbeitnehmerfreizügigkeit)\n3. Freier Dienstleistungsverkehr\n4. Freier Kapitalverkehr\n(Seit 1993 / Vertrag von Maastricht)" },
    ],
    quiz: [
      { q: "Was unterscheidet soziale Marktwirtschaft von reiner Marktwirtschaft?", opts: ["Kein Unterschied", "Staatlicher Sozialausgleich bei freiem Markt", "Planwirtschaft mit Kapitalismus", "Nur Staatsunternehmen"], correct: 1, exp: "Soziale Marktwirtschaft = Freier Markt + sozialer Schutz (Mindestlohn, Sozialversicherungen)" },
      { q: "Was ist eine Rezession?", opts: ["Hohe Inflation", "2 Quartale negatives BIP-Wachstum", "Steigende Aktienkurse", "Vollbeschäftigung"], correct: 1, exp: "Rezession: 2 aufeinanderfolgende Quartale mit negativem Wirtschaftswachstum (BIP sinkt)." },
      { q: "Was ist Inflation?", opts: ["Preisstabilität", "Anhaltender Preisanstieg = Kaufkraftverlust", "Günstigere Waren", "Wirtschaftswachstum"], correct: 1, exp: "Inflation = allgemeiner Preisanstieg → gleiches Geld kauft weniger." },
    ],
  },


  MATH_ABITUR_FORMELN: {
    studyGuide: `# Abitur-Formeln Mathe – Alles auf einen Blick\n\n## Analysis\n- Ableitung: (xn)' = n*xn-1, (ex)' = ex, (ln x)' = 1/x\n- Kettenregel: (f(g(x)))' = f'(g(x))*g'(x)\n- Integral: Int(xn dx) = xn+1/(n+1) + C\n- Flaeche: Int[a,b] f(x) dx = F(b) - F(a)\n\n## Stochastik\n- Binomial: P(X=k) = C(n,k)*pk*(1-p)n-k\n- Erwartungswert: E(X) = n*p\n- Standardabw.: sigma = sqrt(n*p*(1-p))\n- Normalverteilung: phi(z) Tabelle\n\n## Analytische Geometrie\n- Geradengleichung: g: x = a + t*b\n- Ebenengleichung: n*(x-a) = 0 (Normalenform)\n- Abstand Punkt-Ebene: d = |n*a - d| / |n|\n- Skalarprodukt: a*b = a1b1 + a2b2 + a3b3\n\n## Trigonometrie\n- sin2 + cos2 = 1\n- Sinussatz: a/sin(alpha) = b/sin(beta)\n- Kosinussatz: a2 = b2 + c2 - 2bc*cos(alpha)`,
    flashcards: [
      { front: "Was ist die Produktregel der Ableitung?", back: "(f*g)' = f'*g + f*g'\nBeispiel: (x2 * sin x)' = 2x*sin x + x2*cos x" },
      { front: "Formel fuer den Erwartungswert der Binomialverteilung?", back: "E(X) = n*p\nBeispiel: 20 Wuerfe, p=0,5 -> E(X) = 20*0,5 = 10" },
      { front: "Wie berechnet man den Abstand Punkt P von Ebene E?", back: "d = |n*OP - d| / |n|\nn = Normalenvektor, d = Abstand der Ebene vom Ursprung\nBei Normalenform: Punkt einsetzen, dividieren durch |n|" },
      { front: "Was ist das Skalarprodukt und wann ist es 0?", back: "a*b = a1*b1 + a2*b2 + a3*b3\nSkalarprodukt = 0 genau dann wenn a und b senkrecht stehen\nKosinussatz: a*b = |a|*|b|*cos(phi)" },
    ],
    quiz: [
      { q: "Ableitung von f(x) = e^(3x)?", opts: ["e^(3x)", "3e^(3x)", "3e^x", "e^x/3"], correct: 1, exp: "Kettenregel: (e^(3x))' = e^(3x) * 3 = 3e^(3x)" },
      { q: "Standardabweichung von B(100, 0,25)?", opts: ["2,5", "4,33", "6,25", "25"], correct: 1, exp: "sigma = sqrt(n*p*(1-p)) = sqrt(100*0,25*0,75) = sqrt(18,75) ≈ 4,33" },
      { q: "Was prueft das Skalarprodukt?", opts: ["Laenge der Vektoren", "Parallele Vektoren", "Senkrechte Vektoren (Produkt=0)", "Flaeche eines Dreiecks"], correct: 2, exp: "a*b = 0 genau dann, wenn a und b senkrecht (orthogonal) sind." },
    ],
  },

  CHEM_12_ORGANIK: {
    studyGuide: `# Organische Chemie – Grundlagen\n\n## Kohlenwasserstoffe\n- Alkane: CnH2n+2, gesaettigt, Einfachbindungen\n  Methan CH4, Ethan C2H6, Propan C3H8\n- Alkene: CnH2n, eine Doppelbindung\n  Ethen C2H4, Propen C3H6\n- Alkine: CnH2n-2, eine Dreifachbindung\n  Ethin (Acetylen) C2H2\n\n## Funktionelle Gruppen\n| Gruppe | Verbindungsklasse | Beispiel |\n|--------|------------------|----------|\n| -OH | Alkohole | Ethanol C2H5OH |\n| -COOH | Carbonsaeuren | Essigsaeure CH3COOH |\n| -CHO | Aldehyde | Ethanal CH3CHO |\n| -CO- | Ketone | Aceton CH3COCH3 |\n| -NH2 | Amine | Methylamin CH3NH2 |\n\n## Isomerie\n- Strukturisomere: gleiche Formel, verschiedene Struktur\n- Stereoisomere: gleiche Bindungen, verschiedene Raumordnung\n- Enantiomere: Spiegelbildisomere (chiral)\n\n## Reaktionstypen\n- Substitution (SR): Alkan + Halogen\n- Addition (AR): Alken + H2 oder Halogen\n- Eliminierung: Alkohol -> Alken + H2O`,
    flashcards: [
      { front: "Was ist der Unterschied zwischen Alkanen, Alkenen und Alkinen?", back: "Alkane: nur Einfachbindungen, CnH2n+2 (gesaettigt)\nAlkene: eine C=C Doppelbindung, CnH2n\nAlkine: eine C-C Dreifachbindung, CnH2n-2" },
      { front: "Was ist eine funktionelle Gruppe?", back: "Atomgruppe, die die chemischen Eigenschaften organischer Verbindungen bestimmt.\n-OH: Alkohole (hydrophil, Wasserstoffbruecken)\n-COOH: Carbonsaeuren (sauer, pH<7)\n-NH2: Amine (basisch)" },
      { front: "Was ist der Unterschied zwischen Additions- und Substitutionsreaktion?", back: "Addition: zwei Stoffe verbinden sich zu einem (bei Doppelbindungen)\nEthen + H2 -> Ethan\nSubstitution: ein Atom/Gruppe wird ersetzt\nMethan + Cl2 -> Chlormethan + HCl" },
      { front: "Was sind Enantiomere?", back: "Spiegelbildisomere - chemisch gleich aufgebaut, aber spiegelsymmetrisch und nicht deckungsgleich.\nWichtig bei Aminosaeuren, Pharmaka (L- und D-Formen)\nKoennen unterschiedliche biologische Wirkung haben." },
    ],
    quiz: [
      { q: "Allgemeine Formel der Alkane?", opts: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"], correct: 1, exp: "Alkane: CnH2n+2 (gesaettigte Kohlenwasserstoffe, nur Einfachbindungen)" },
      { q: "Welche Verbindungsklasse hat die funktionelle Gruppe -COOH?", opts: ["Alkohole", "Aldehyde", "Carbonsaeuren", "Ester"], correct: 2, exp: "-COOH = Carboxylgruppe -> Carbonsaeuren (z.B. Essigsaeure, Ameisensaeure)" },
      { q: "Bei welchem Kohlenwasserstoff laeuft eine Additionsreaktion ab?", opts: ["Alkanen", "Alkenen", "Cykloalkanen", "Edelgasen"], correct: 1, exp: "Alkene haben eine C=C Doppelbindung -> Additionsreaktionen (z.B. Hydrierung, Halogenierung)" },
    ],
  },

  DE_09_TEXTANALYSE: {
    studyGuide: `# Textanalyse – Schritt fuer Schritt\n\n## Analyse vs. Interpretation\n- Analyse: Was steht im Text? (Fakten, Struktur, Stilmittel)\n- Interpretation: Was bedeutet es? (Absicht, Wirkung, Aussage)\n\n## Aufbau einer Textanalyse\n1. Einleitung: Autor, Titel, Erscheinungsjahr, Textsorte, Thema, Hauptaussage\n2. Inhaltsangabe: kurz, praesens, objektiv\n3. Strukturanalyse: Aufbau, Gliederung, Gedankengang\n4. Stilanalyse: Stilmittel und ihre Wirkung\n5. Schluss: Gesamtbeurteilung, Wirkung auf Leser\n\n## Wichtige Stilmittel\n| Stilmittel | Definition | Beispiel |\n|-----------|-----------|----------|\n| Metapher | Bildlicher Vergleich ohne 'wie' | Lebensfluss |\n| Vergleich | mit 'wie' | schnell wie der Wind |\n| Personifikation | Vermenschlichung | Die Sonne lacht |\n| Anapher | Wortwiederholung am Satzanfang | Kein Weg... kein Ziel... |\n| Klimax | Steigerung | muede, erschoepft, am Ende |\n| Rhetorische Frage | Keine Antwort erwartet | Wer haette das gedacht? |\n| Ironie | Das Gegenteil ist gemeint | Das war ja toll! |\n\n## Inhaltsangabe schreiben\n- Praesens verwenden\n- Indirekte Rede (Konjunktiv I)\n- Objektiv bleiben (keine Meinung)\n- Kurz halten (ca. 1/4 des Originaltexts)`,
    flashcards: [
      { front: "Was ist der Unterschied zwischen Metapher und Vergleich?", back: "Vergleich: mit 'wie' oder 'als'\n'Er ist stark wie ein Bär'\nMetapher: direkter bildlicher Ausdruck ohne 'wie'\n'Er ist ein Bär von einem Mann'" },
      { front: "Was sind die 5 Schritte einer Textanalyse?", back: "1. Einleitung (Autor, Titel, Thema)\n2. Inhalt (Inhaltsangabe)\n3. Struktur (Aufbau, Gliederung)\n4. Sprache (Stilmittel und Wirkung)\n5. Schluss (Gesamtbewertung)" },
      { front: "Was ist eine Anapher?", back: "Wiederholung desselben Wortes oder derselben Wortgruppe am Anfang aufeinanderfolgender Saetze.\nBeispiel: 'Kein Frieden ohne Recht. Kein Recht ohne Frieden.'\nWirkung: Betonung, Eindringlichkeit, Rhythmus" },
      { front: "Welche Zeitform verwendet man in der Inhaltsangabe?", back: "Praesens (Gegenwartsform)!\nFalsch: 'Der Protagonist ging...' (Praeteritum)\nRichtig: 'Der Protagonist geht...' (Praesens)\nAuch: Indirekte Rede im Konjunktiv I ('Er sagt, er sei muede.')" },
    ],
    quiz: [
      { q: "Was ist eine Klimax?", opts: ["Einleitungsformel", "Steigerung vom Schwachen zum Starken", "Wiederholung am Satzanfang", "Personifikation"], correct: 1, exp: "Klimax = rhetorische Steigerung: 'er kam, sah, siegte'" },
      { q: "Was gehoert NICHT in eine Inhaltsangabe?", opts: ["Handlung im Praesens", "Die eigene Meinung", "Hauptfiguren", "Ort der Handlung"], correct: 1, exp: "Inhaltsangabe ist objektiv - keine eigene Meinung, keine Wertung!" },
      { q: "'Die Sonne lacht' ist ein Beispiel fuer...?", opts: ["Metapher", "Personifikation", "Anapher", "Vergleich"], correct: 1, exp: "Personifikation: der Sonne werden menschliche Eigenschaften zugeschrieben (lachen)." },
    ],
  },

  'DE_11_ERÖTERUNG': {
    studyGuide: `# Eröterung schreiben\n\n## Was ist eine Eroerterung?\nSachliche Auseinandersetzung mit einer strittigen Frage oder These.\nZiel: Pro- und Contra-Argumente abwaegen und zu einem Ergebnis kommen.\n\n## Aufbau\n1. Einleitung: Thema einleiten, These oder Fragestellung nennen\n2. Hauptteil: Argumente mit Belegen und Beispielen\n3. Schluss: Fazit ziehen, eigene Position begruenden\n\n## Argumentationsstruktur (Sandwich-Methode)\n1. Behauptung (These)\n2. Begruendung (Warum?)\n3. Beispiel/Beleg (Konkret!)\n4. Schlussfolgerung (Zurueck zum Thema)\n\n## Tipps\n- Stärkste Argumente am Anfang oder Ende (nicht in der Mitte!)\n- Gegenargumente erwaehnen und entkraeften\n- Sachliche Sprache (keine Umgangssprache)\n- Abwechslungsreiche Konnektoren nutzen\n\n## Nuetzliche Konnektoren\n- Zunaechst / Erstens / Zum einen\n- Zudem / Darueber hinaus / Ausserdem\n- Dennoch / Jedoch / Andererseits\n- Zusammenfassend / Abschliessend / Insgesamt`,
    flashcards: [
      { front: "Was ist die Sandwich-Methode in der Eroerterung?", back: "1. Behauptung (These aufstellen)\n2. Begruendung (Warum ist das so?)\n3. Beispiel/Beleg (konkreter Fall)\n4. Schlussfolgerung (Bezug zurueck zur These)\nJedes Argument hat diese 4-teilige Struktur." },
      { front: "Wo platziert man das staerkste Argument?", back: "Am Anfang oder Ende des Hauptteils - nicht in der Mitte!\nLeser erinnern sich am besten an Anfang (Primacy-Effekt) und Ende (Recency-Effekt).\nSchwache Argumente in die Mitte." },
      { front: "Was ist der Unterschied zwischen linearer und dialektischer Eroerterung?", back: "Linear: nur Pro oder nur Contra (eine Seite wird untersucht)\nDialektisch: Pro- und Contra-Argumente werden gegeneinander abgewogen -> ausgewogener\nMeist dialektisch gefordert in der Schule" },
      { front: "Was gehoert in den Schluss einer Eroerterung?", back: "Fazit: eigene Position klar und begruendet\nZusammenfassung der Hauptargumente\nKein neues Argument im Schluss!\nZukunftsausblick oder Appell moeglich" },
    ],
    quiz: [
      { q: "In welcher Reihenfolge stehen die Argumente idealerweise?", opts: ["Schwach-Mittel-Stark", "Stark-Schwach-Mittelstark", "Zufaellig", "Immer von Pro zu Contra"], correct: 1, exp: "Stärkstes Argument am Anfang oder Ende; schwache Argumente in die Mitte (Gliederungsprinzip)." },
      { q: "Was MUSS jedes Argument in der Eroerterung haben?", opts: ["Eine rhetorische Frage", "Behauptung, Begruendung und Beispiel", "Zitate aus Zeitungen", "Einen Absatz"], correct: 1, exp: "Sandwich-Methode: These -> Begruendung -> Beleg/Beispiel -> Schlussfolgerung" },
      { q: "Was darf NICHT im Schluss der Eroerterung stehen?", opts: ["Fazit", "Eigene Position", "Ein neues Argument", "Zusammenfassung"], correct: 2, exp: "Im Schluss keine neuen Argumente! Nur Fazit, Position und evtl. Ausblick." },
    ],
  },

  EN_C1_ACADEMIC: {
    studyGuide: `# English C1 – Academic & Advanced\n\n## Academic Vocabulary\n- analyze / examine / investigate\n- hypothesis / assumption / premise\n- consequently / furthermore / nevertheless\n- significant / substantial / negligible\n- contradict / corroborate / substantiate\n\n## Complex Sentence Structures\n- Cleft sentences: It is education that matters most.\n- Inversion: Not only did he fail, but he also...\n- Participle clauses: Having studied for weeks, she passed.\n\n## Hedging Language\nAcademic writing avoids absolutes:\n- It appears that... / It seems likely that...\n- Evidence suggests... / Research indicates...\n- This may imply... / One could argue...\n\n## Essay Structure (C1)\n1. Introduction: Hook + context + thesis\n2. Body 1: Main point + evidence + analysis\n3. Body 2: Counter-argument + rebuttal\n4. Conclusion: Synthesis + wider implications\n\n## Common C1 Grammar Points\n- Subjunctive: I suggest that he be present.\n- Mixed conditionals: If I had studied harder, I would be fluent.\n- Nominalization: The implementation of... (not: implementing...)`,
    flashcards: [
      { front: "What is nominalization and why use it in academic writing?", back: "Converting verbs/adjectives into nouns:\n'implement' -> 'implementation'\n'develop' -> 'development'\nMakes writing more formal and impersonal.\n'The implementation of the policy was successful.'" },
      { front: "What is hedging language? Give 3 examples.", back: "Hedging = using cautious language to avoid overgeneralizing in academic writing:\n'It appears that...'\n'Evidence suggests...'\n'This may indicate...'\nAcademic writing avoids absolute statements." },
      { front: "What is an inverted sentence? Give an example.", back: "Inversion: subject and auxiliary verb swap positions for emphasis.\nNormal: He rarely made mistakes.\nInverted: Rarely did he make mistakes.\nOther triggers: Not only, Never, Hardly, Seldom, Only then" },
      { front: "What is a mixed conditional?", back: "Combines past and present time frames:\nIf I had studied law (past - didn't), I would be a lawyer now (present result).\nPast unreal condition + present consequence\nContrast: Type 3 is all past." },
    ],
    quiz: [
      { q: "Which sentence uses hedging correctly?", opts: ["AI will definitely replace all jobs.", "AI may significantly impact employment.", "AI never replaces humans.", "AI always creates more jobs."], correct: 1, exp: "'May significantly impact' hedges the claim appropriately for academic writing." },
      { q: "What is nominalization?", opts: ["Using passive voice", "Converting verbs to nouns", "Using complex sentences", "Adding formal connectors"], correct: 1, exp: "Nominalization: convert 'analyze' -> 'analysis', 'develop' -> 'development' for formal writing." },
      { q: "Correct inverted sentence after 'Not only'?", opts: ["Not only he failed...", "Not only did he fail...", "Not only he did fail...", "Not only failed he..."], correct: 1, exp: "Inversion after 'Not only': auxiliary verb + subject: 'Not only did he fail...'" },
    ],
  },


  CODE_WEB_HTMLCSS: {
    studyGuide: `# HTML & CSS – Webentwicklung Grundlagen\n\n## HTML Grundstruktur\n<!DOCTYPE html>\n<html lang="de">\n  <head><title>Seite</title></head>\n  <body>Inhalt hier</body>\n</html>\n\n## Wichtige HTML-Tags\n- <h1> bis <h6>: Ueberschriften\n- <p>: Absatz, <a href="...">: Link\n- <img src="..." alt="...">: Bild\n- <ul>, <ol>, <li>: Listen\n- <div>: Bereich, <span>: Inline-Element\n- <form>, <input>, <button>: Formulare\n\n## CSS Selektoren\n- Element: p { color: red; }\n- Klasse: .card { background: blue; }\n- ID: #header { font-size: 24px; }\n- Kombination: .card h1 { ... }\n\n## CSS Box-Modell\nContent -> Padding -> Border -> Margin\n\n## Flexbox\ndisplay: flex;\nflex-direction: row/column\njustify-content: center/space-between\nalign-items: center/flex-start\n\n## Responsive Design\n@media (max-width: 768px) {\n  .container { flex-direction: column; }\n}`,
    flashcards: [
      { front: "Was ist der Unterschied zwischen id und class in HTML/CSS?", back: "id: eindeutig, nur EINMAL pro Seite -> #header\nclass: mehrfach verwendbar -> .card\nCSS: # fuer id, . fuer class\nFaustregel: class bevorzugen (flexibler)" },
      { front: "Was ist das CSS Box-Modell?", back: "Jedes Element hat 4 Bereiche:\n1. Content (eigentlicher Inhalt)\n2. Padding (Innenabstand)\n3. Border (Rahmen)\n4. Margin (Aussenabstand)\nGesamtbreite = width + padding + border + margin" },
      { front: "Wie funktioniert Flexbox?", back: "display: flex; am Elternelement\nflex-direction: row (nebeneinander) oder column (untereinander)\njustify-content: Ausrichtung in Hauptachse\nalign-items: Ausrichtung in Querachse" },
      { front: "Was ist ein Media Query?", back: "@media (max-width: 768px) { ... }\nCSS wird nur angewendet wenn Bedingung (Bildschirmbreite) erfuellt.\nMobil-first: kleinste Geraete zuerst stylen, dann groessere" },
    ],
    quiz: [
      { q: "Welcher CSS-Selektor zielt auf die Klasse 'btn'?", opts: ["#btn { }", ".btn { }", "btn { }", "*btn { }"], correct: 1, exp: "Klassen-Selektor = Punkt: .btn { }" },
      { q: "Was macht display: flex?", opts: ["Element unsichtbar machen", "Kind-Elemente flexibel anordnen", "Hintergrundfarbe aendern", "Schriftgroesse setzen"], correct: 1, exp: "Flexbox: parent bekommt display:flex, Kinder werden flex-items die flexibel angeordnet werden." },
      { q: "Was ist der Zweck des alt-Attributs bei Bildern?", opts: ["Bildgroesse", "Alternativtext fuer Screenreader und wenn Bild nicht laedt", "Bildformat", "Bildpfad"], correct: 1, exp: "alt='...' beschreibt das Bild fuer Screenreader (Barrierefreiheit) und bei nicht geladenem Bild." },
    ],
  },

  ALGORITHM_THINKING: {
    studyGuide: `# Algorithmisches Denken\n\n## Was ist ein Algorithmus?\nEine eindeutige, endliche Folge von Anweisungen zur Loesung eines Problems.\nEigenschaften: Eindeutig, endlich, ausfuehrbar, deterministisch\n\n## Wichtige Algorithmen\n\n### Suche\n- Lineare Suche: Element fuer Element, O(n)\n- Binaere Suche: Nur bei sortierter Liste, O(log n)\n\n### Sortierung\n- Bubble Sort: Vergleiche Nachbarn, tausche, O(n2)\n- Selection Sort: Kleinstes Element suchen, O(n2)\n- Merge Sort: Teile-und-herrsche, O(n log n)\n\n## Big-O Notation\nO(1): konstant (Array-Zugriff)\nO(log n): logarithmisch (binaere Suche)\nO(n): linear (lineare Suche)\nO(n2): quadratisch (Bubble Sort)\n\n## Pseudocode\nAlgorithmus beschreiben ohne bestimmte Sprache:\nFUER jedes Element IN Liste:\n  WENN Element == Ziel:\n    GEBE Element ZURUECK\n\n## Flussdiagramme\nSymbole: Oval=Start/Ende, Rechteck=Prozess, Raute=Entscheidung, Pfeil=Verbindung`,
    flashcards: [
      { front: "Was ist Big-O Notation?", back: "Beschreibt, wie die Laufzeit eines Algorithmus mit der Eingabegroesse waechst.\nO(1): immer gleich schnell\nO(n): linear mit n\nO(n2): quadratisch - wird mit vielen Daten sehr langsam\nNur den dominanten Term behalten!" },
      { front: "Wie funktioniert binaere Suche?", back: "Voraussetzung: sortierte Liste!\n1. Mitte pruefen\n2. Ist Ziel kleiner? -> linke Haelfte\n3. Ist Ziel groesser? -> rechte Haelfte\n4. Wiederholen bis gefunden oder nicht vorhanden\nLaufzeit: O(log n) - sehr effizient!" },
      { front: "Was sind die 4 Eigenschaften eines Algorithmus?", back: "1. Eindeutigkeit: jeder Schritt ist klar\n2. Endlichkeit: terminiert nach endlicher Zeit\n3. Ausfuehrbarkeit: jeder Schritt ist durchfuehrbar\n4. Determiniertheit: gleiches Ergebnis bei gleicher Eingabe" },
      { front: "Was ist Teile-und-herrsche (divide and conquer)?", back: "Problem rekursiv in kleinere Teilprobleme aufteilen:\n1. Teile: Problem aufteilen\n2. Loesung: Teilprobleme loesen\n3. Fuege zusammen: Teilergebnisse verbinden\nBeispiel: Merge Sort, Binaere Suche" },
    ],
    quiz: [
      { q: "Welche Suche ist effizienter bei sortierten Daten?", opts: ["Lineare Suche O(n)", "Binaere Suche O(log n)", "Beide gleich", "Bubble Sort"], correct: 1, exp: "Binaere Suche O(log n) ist deutlich schneller als lineare Suche O(n) bei sortierten Listen." },
      { q: "Was ist O(1)?", opts: ["Sehr langsam", "Konstante Laufzeit, unabhaengig von n", "Einmal ausfuehren", "O wie Null"], correct: 1, exp: "O(1) = konstante Laufzeit. Egal wie gross die Eingabe: immer gleich schnell (z.B. Array-Zugriff)." },
      { q: "Welches Sortierverfahren ist O(n log n)?", opts: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], correct: 2, exp: "Merge Sort hat O(n log n) - effizienter als O(n2)-Algorithmen bei grossen Datenmenggen." },
    ],
  },

  DATA_PRIVACY_KIT: {
    studyGuide: `# Datenschutz – DSGVO & Persoenliche Daten\n\n## Was sind personenbezogene Daten?\nAlle Informationen, die eine natuerliche Person identifizieren koennen:\n- Direkt: Name, Adresse, Ausweisnummer\n- Indirekt: IP-Adresse, Cookie-ID, GPS-Daten, Fotos\n\n## DSGVO – Die wichtigsten Grundsaetze\n1. Rechtmaessigkeit: Daten nur mit Rechtsgrundlage verarbeiten\n2. Zweckbindung: Nur fuer angegebenen Zweck nutzen\n3. Datensparsamkeit: So wenig Daten wie noetig\n4. Richtigkeit: Daten muessen korrekt sein\n5. Speicherbegrenzung: Nicht laenger als noetig\n\n## Betroffenenrechte (DSGVO)\n- Auskunftsrecht: Was wird gespeichert?\n- Recht auf Loeschung (Recht auf Vergessenwerden)\n- Recht auf Berichtigung\n- Widerspruchsrecht\n- Recht auf Datenuebertragbarkeit\n\n## Einwilligung\nMuss: Freiwillig, Informiert, Eindeutig, Widerrufbar\nVor-angekreuzte Kaestechen sind NICHT erlaubt!\n\n## Datenpannen\nBei Datenschutzverletzung: Behoerde binnen 72 Stunden informieren!`,
    flashcards: [
      { front: "Was sind personenbezogene Daten?", back: "Alle Informationen, die eine Person identifizieren koennen:\nDirekt: Name, Adresse, Geburtsdatum\nIndirekt: IP-Adresse, Cookies, GPS, Fotos\nAuch Kombinationen: Vor-/Nachname + PLZ kann ausreichen!" },
      { front: "Was sind die 5 Grundsaetze der DSGVO?", back: "1. Rechtmaessigkeit (Rechtsgrundlage erforderlich)\n2. Zweckbindung (nur fuer angegebenen Zweck)\n3. Datensparsamkeit (so wenig wie noetig)\n4. Richtigkeit (aktuelle, korrekte Daten)\n5. Speicherbegrenzung (Loeschung wenn nicht mehr benoetigt)" },
      { front: "Was ist das Recht auf Vergessenwerden?", back: "Art. 17 DSGVO: Betroffene koennen Loeschung ihrer Daten verlangen.\nGilt wenn: Daten nicht mehr benoetigt, Einwilligung widerrufen, Daten unrechtmaessig verarbeitet.\nGrenzen: Meinungsfreiheit, wissenschaftliche Zwecke" },
      { front: "Wann ist eine Einwilligung gueltig (DSGVO)?", back: "Muss sein:\n- Freiwillig (kein Nachteil bei Ablehnung)\n- Informiert (Zweck muss klar sein)\n- Eindeutig (aktive Handlung, nicht vorangekreuzt!)\n- Widerrufbar (jederzeit zurueckziehbar)" },
    ],
    quiz: [
      { q: "Ist eine IP-Adresse ein personenbezogenes Datum?", opts: ["Nein, ist nur eine Nummer", "Ja, kann Person identifizieren", "Nur bei statischen IPs", "Nur im Kombination"], correct: 1, exp: "IP-Adressen gelten als personenbezogene Daten, da sie zur Identifizierung einer Person genutzt werden koennen." },
      { q: "Wie lange hat ein Unternehmen nach Datenpanne Zeit die Behoerde zu informieren?", opts: ["24 Stunden", "48 Stunden", "72 Stunden", "1 Woche"], correct: 2, exp: "Art. 33 DSGVO: Datenschutzbehoerde muss binnen 72 Stunden informiert werden." },
      { q: "Was macht eine Einwilligung ungueltig?", opts: ["Schriftliche Form", "Vorangekreuztes Haekchen", "Datum der Einwilligung", "Digitale Einwilligung"], correct: 1, exp: "Vorangekreuzte Kaestchen sind nicht erlaubt - Einwilligung muss aktiv gegeben werden." },
    ],
  },

  DIGITAL_WELLBEING: {
    studyGuide: `# Digitales Wohlbefinden – Balance finden\n\n## Was ist digitales Wohlbefinden?\nBewusster und gesunder Umgang mit digitalen Medien.\nZiel: Technologie als Werkzeug nutzen, nicht von ihr kontrolliert werden.\n\n## Anzeichen fuer problematischen Medienkonsum\n- Vernachlaessigung anderer Aktivitaeten\n- Reizbarkeit ohne Bildschirm\n- Schlafstoerungen durch Abendsurfen\n- Fear of Missing Out (FOMO)\n- Vergleich mit Social-Media-Idealbildern\n\n## Strategien\n### Zeitmanagement\n- Bildschirmzeit-App nutzen (iOS/Android)\n- App-Limits setzen\n- Handyfreie Zeiten (Essenszeit, 1 h vor Schlaf)\n- Offline-Stunden planen\n\n### Notification Detox\n- Alle Push-Benachrichtigungen deaktivieren ausser wichtige\n- Spezifische Check-Zeiten fuer Social Media\n\n### Schlaf & Bildschirm\n- Blaues Licht hemmt Melatonin-Produktion -> Einschlafstoerungen\n- Handy nicht ins Schlafzimmer\n- Night-Mode-Funktion nutzen\n\n## Social Media & Selbstbild\n- Instagram/TikTok zeigen keine Realitaet\n- Algorithmen verstaerken extreme Inhalte\n- Followage bewusst gestalten: inspirierend statt neidisch`,
    flashcards: [
      { front: "Was ist FOMO und wie beeintraechtigt es das Wohlbefinden?", back: "FOMO = Fear of Missing Out (Angst, etwas zu verpassen)\nGefuehlt man koennte etwas Wichtiges verpassen wenn man offline ist.\nFuehrt zu: zwanghaftem Checken, Angst, Schlafproblemen\nGegenmittel: JOMO (Joy of Missing Out) - bewusstes offline sein" },
      { front: "Warum ist Bildschirmzeit vor dem Schlafen schaedlich?", back: "Blaues Licht von Bildschirmen hemmt die Melatonin-Produktion.\nMelatonin = Schlafhormon, das muede macht.\nFolge: Einschlafstoerungen, schlechtere Schlafqualitaet.\nEmpfehlung: 1 Stunde vor Schlaf kein Bildschirm." },
      { front: "Was ist eine gesunde Strategie gegen zu viel Handynutzung?", back: "1. Bildschirmzeit-Apps nutzen (iOS Bildschirmzeit / Android Digital Wellbeing)\n2. App-Limits setzen (z.B. max. 30 Min. TikTok/Tag)\n3. Push-Nachrichten deaktivieren\n4. Handyfreie Zeiten einhalten" },
    ],
    quiz: [
      { q: "Was ist FOMO?", opts: ["Eine Handy-App", "Angst etwas zu verpassen, wenn offline", "Eine Medienform", "Soziales Netzwerk"], correct: 1, exp: "FOMO = Fear of Missing Out. Gefuehl, wichtige Ereignisse zu verpassen wenn man nicht staendig online ist." },
      { q: "Warum stoert Handy vor dem Schlaf den Schlaf?", opts: ["Durch Lautstaerke", "Blaues Licht hemmt Melatonin-Ausschüttung", "Durch Strahlung", "Durch Nachrichten-Stress"], correct: 1, exp: "Blaues Licht unterdrueckt Melatonin (Schlafhormon) -> schlechteres Einschlafen." },
      { q: "Was zeigt Social Media hauptsaechlich?", opts: ["Den realen Alltag aller Menschen", "Sorgfaeltig ausgewaehlte Highlight-Momente", "Nachrichten", "Nur Werbung"], correct: 1, exp: "Social Media zeigt kuratierte Highlights - keine realistische Darstellung des Alltags." },
    ],
  },

  PRESENTATION_TECH: {
    studyGuide: `# Praesentationstechnik\n\n## Die 10-20-30-Regel (Guy Kawasaki)\n- Maximal 10 Folien\n- Maximal 20 Minuten\n- Mindestens Schriftgroesse 30\n\n## Aufbau einer Praesentation\n1. Einstieg: Hook (interessanter Einstieg), Relevanz zeigen\n2. Hauptteil: 3-5 Hauptpunkte, logischer Aufbau\n3. Schluss: Kernaussage, Call-to-Action\n\n## Koerperhaltung & Stimme\n- Gerade stehen, nicht vor der Leinwand stehen\n- Blickkontakt zu verschiedenen Personen im Publikum\n- Laut und deutlich sprechen, Pausen nutzen\n- Nicht ablesen! (Stichpunkte auf Karten)\n- Haende ruhig halten, Gestik bewusst einsetzen\n\n## Foliengestaltung\n- 1 Kernaussage pro Folie\n- Wenig Text, viel Bild/Grafik\n- Kontrastreiche Farben, lesbare Schrift\n- Keine animierten Uebergaenge ablenken lassen\n\n## Nervositaet\n- Vorbereitung reduziert Angst am starksten\n- Tief atmen vor dem Start\n- Langsamer sprechen als normal (Nervositaet beschleunigt)\n- Publikum ist wohlgesonnen - nicht gegen dich`,
    flashcards: [
      { front: "Was ist die 10-20-30-Regel?", back: "10 Folien maximal\n20 Minuten maximal\n30 Punkt Schriftgroesse mindestens\n(Guy Kawasaki) Zwingt zur Fokussierung auf das Wesentliche." },
      { front: "Was sind die wichtigsten Koerpersprache-Tipps bei Praesentationen?", back: "Blickkontakt halten (zu verschiedenen Personen)\nGerade stehen, nicht wippen/schaukeln\nNicht ablesen (Stichwortkarten nutzen)\nHaende sichtbar, nicht in Taschen\nLangsam und deutlich sprechen" },
      { front: "Wie gestaltet man effektive Folien?", back: "1 Kernaussage pro Folie\nWenig Text (Stichpunkte, keine Saetze)\nGrosse Bilder und Grafiken\nHoher Kontrast (dunkel auf hell oder hell auf dunkel)\nKeine Ablenkung durch Animationen" },
    ],
    quiz: [
      { q: "Wie viele Folien empfiehlt die 10-20-30-Regel?", opts: ["5", "10", "20", "30"], correct: 1, exp: "10-20-30: 10 Folien, 20 Minuten, 30pt Schrift (Guy Kawasaki)" },
      { q: "Was ist der haufigste Fehler bei Praesentationen?", opts: ["Zu viel Blickkontakt", "Text vom Slide ablesen", "Zu laut sprechen", "Zu viele Bilder"], correct: 1, exp: "Text ablesen ist der verbreitetste Fehler - Publikum kann selbst lesen, Praesentator soll erkaeren." },
      { q: "Wie bekaempft man Nervositaet beim Praesentieren am effektivsten?", opts: ["Wenig schlafen vorher", "Viel Kaffee trinken", "Gruendliche Vorbereitung + Ueben", "Publikum ignorieren"], correct: 2, exp: "Vorbereitung ist das wirksamste Mittel gegen Prasentationsangst. Mehrfach laut ueben!" },
    ],
  },

  GROUP_STUDY_KIT: {
    studyGuide: `# Gruppenlernen – Effektiv und ohne Chaos\n\n## Warum Gruppenlernen?\n- Erklaeren festigt Wissen (Lerneffekt beim Lehren: 90%!)\n- Verschiedene Perspektiven und Loesungsansaetze\n- Gegenseitige Motivation und Kontrolle\n- Luecken werden aufgedeckt\n\n## Effektive Gruppengroesse\n3-5 Personen: optimal\nZu klein: wenig Perspektiven\nZu gross: Chaotisch, Ablenkung\n\n## Rollen in der Lerngruppe\n- Moderator: haelt Fokus, Zeitmanagement\n- Erklaerer: erklaert Konzepte den anderen\n- Pruefender: stellt Fragen und prueft Verstaendnis\n- Protokollant: haelt Ergebnisse fest\n\n## Struktur einer Lernsession\n1. Ziel definieren (was soll heute gelernt werden?)\n2. Lernphase: Jeder bereitet einen Bereich vor\n3. Erklaerphase: Jeder erklaert seiner/seinem Bereich\n4. Diskussionsphase: Fragen klaren, Unklarheiten besprechen\n5. Abschlusstest: Kurzes Quiz gegenseitig stellen\n\n## Ablenkung vermeiden\n- Feste Zeit und Ort festlegen\n- Handys auf lautlos\n- Klare Regeln (keine Ablenkungsgespraeche)`,
    flashcards: [
      { front: "Welchen Lerneffekt hat Erklaeren gegenueber anderen Methoden?", back: "Lernerfolg nach Methode (Learning Pyramid):\n90% durch Lehren und Erklaeren\n75% durch Ueben\n50% durch Diskutieren\n30% durch Demonstration\n20% durch audiovisuelle Mittel\n10% durch Lesen" },
      { front: "Was ist die optimale Gruppengroesse zum Lernen?", back: "3-5 Personen\nZu wenige (1-2): wenig Perspektiven, kein Lehreffekt\nZu viele (6+): schwer zu koordinieren, Trittbrettfahrer, Ablenkung" },
      { front: "Wie strukturiert man eine effektive Lerngruppenssitzung?", back: "1. Ziel klären (was soll heute gelernt werden?)\n2. Jeder bereitet Teilbereich vor\n3. Erklärungsrunde (jeder lehrt seinen Teil)\n4. Diskussion + Fragen klären\n5. Abschlusstest (gegenseitig Fragen stellen)" },
    ],
    quiz: [
      { q: "Welche Methode hat den hoechsten Lerneffekt?", opts: ["Lesen", "Zuhoeren", "Lehren und Erklaeren", "Bilder anschauen"], correct: 2, exp: "Anderen etwas erklaeren hat ~90% Lerneffekt - man muss Stoff wirklich verstehen um ihn zu erklaeren." },
      { q: "Wie viele Personen sind ideal in einer Lerngruppe?", opts: ["1-2", "3-5", "6-8", "Mehr als 10"], correct: 1, exp: "3-5 Personen: Genug Perspektiven, noch koordinierbar, kein Trittbrettfahrer-Problem." },
      { q: "Was sollte am Anfang jeder Gruppenlernsitzung definiert werden?", opts: ["Wer der Beste ist", "Das Lernziel der Sitzung", "Die Pausen", "Die Sitzordnung"], correct: 1, exp: "Klares Lernziel am Anfang: 'Heute lernen wir Kapitel 3 komplett' verhindert zielloses Chatten." },
    ],
  },

  ADHD_FOCUS_KIT: {
    studyGuide: `# Fokus mit ADHS – Strategien die funktionieren\n\n## Was ist ADHS?\nAufmerksamkeits-Defizit-Hyperaktivitaetsstoerung\nMerkmale: Schwierigkeiten bei Aufmerksamkeit, Impulskontrolle, manchmal Hyperaktivitaet.\nNICHT: Faulheit oder schlechter Wille!\n\n## Lernstrategien bei ADHS\n\n### Umgebung\n- Ruhiger, reizarmer Platz (keine Ablenkungen)\n- Handy in anderen Raum oder App-Blocker\n- Kopfhoerer mit Musik ohne Text oder weisses Rauschen\n- Aufgeraeumter Schreibtisch (Unordnung = Ablenkung)\n\n### Zeitstruktur\n- Kurze Lerneinheiten: 15-20 Minuten (statt 45)\n- Haeufige Pausen: alle 15 Min. 5 Min. Bewegungspause\n- Timer nutzen (Pomodoro angepasst)\n- Tagestruktur durch feste Routinen\n\n### Aufgabenmanagement\n- Grosse Aufgaben in Mini-Schritte zerlegen\n- Checklisten (Dopamin durch Abhaken!)\n- Eine Aufgabe nach der anderen\n- Start-Ritual: immer gleich beginnen (konditioniert Gehirn)\n\n## Staerken bei ADHS\n- Hyperfokus: wenn interessiert, unglaubliche Konzentration\n- Kreativitaet und Querdenken\n- Begeisterungsfaehigkeit und Energie`,
    flashcards: [
      { front: "Welche Umgebung foerdert Fokus bei ADHS?", back: "Reizarm: kein TV, kein Handy sichtbar\nRuhig: Bibliothek, eigenes Zimmer, Kopfhoerer\nAufgeraeumt: nur das Notwendige auf dem Schreibtisch\nKomfortabel: gutes Licht, angenehme Temperatur" },
      { front: "Wie sollte man Lerneinheiten bei ADHS strukturieren?", back: "Kuerzer als normal: 15-20 Minuten (statt 25-45)\nMehr Pausen: alle 15 Min. kurze Bewegungspause\nTimer nutzen (gibt klare Struktur)\nEine Aufgabe zuerst, dann naechste" },
      { front: "Was ist der Hyperfokus bei ADHS?", back: "Faehigkeit bei interessanten Themen extrem intensiv zu konzentrieren.\nGegenteil des ADHS-Stereotyps!\nNutzung: Interessen finden, Verbindung zu Lernstoff herstellen\n'Wie haengt das Thema mit meinem Interesse zusammen?'" },
    ],
    quiz: [
      { q: "Was hilft am meisten bei ADHS gegen Ablenkung?", opts: ["Mehr Koffein", "Reizarme Lernumgebung + kurze Einheiten", "Laengere Lernzeit am Stueck", "Musik mit Text hoeren"], correct: 1, exp: "Reizarme Umgebung (Handy weg, ruhig) und kurze Lernblöcke (15-20 Min.) passen zu ADHS." },
      { q: "ADHS bedeutet...", opts: ["Faulheit", "Aufmerksamkeitsstoerung - kein Wille- oder Intelligenzproblem", "Niedrige Intelligenz", "Sehschwaeche"], correct: 1, exp: "ADHS ist eine neurologische Stoerung der Aufmerksamkeitsregulation - kein Charakter- oder Willensproblem." },
      { q: "Was ist eine ADHS-gerechte Pomodoro-Variante?", opts: ["50 Min. lernen, 10 Pause", "25 Min. lernen, 5 Pause", "15 Min. lernen, 5 Pause", "60 Min. ohne Pause"], correct: 2, exp: "Bei ADHS: kuezer - 15 Min. lernen, 5 Min. Pause, haeufiger Wechsel foerdert Fokus." },
    ],
  },

  CAREER_ORIENTATION_KIT: {
    studyGuide: `# Berufsorientierung – Was kommt nach der Schule?\n\n## Wege nach der Schule\n\n### Ausbildung (Duales System)\n- 2-3 Jahre, Wechsel Betrieb/Berufsschule\n- Verguetung bereits waehrend Ausbildung\n- Ueber 320 anerkannte Ausbildungsberufe in DE\n- Gute Karrierechancen durch Meister/Techniker\n\n### Studium\n- Bachelor: 3-4 Jahre\n- Master: 1-2 Jahre darauf\n- Voraussetzung: Abitur oder FH-Reife\n- NC-Faech: Zulassung durch Numerus Clausus\n\n### Freiwilligenjahr\n- FSJ, BFD, Europaeischer Freiwilligendienst\n- Orientierung sammeln, Erfahrungen machen\n\n## Berufstest & Interessen\n- RIASEC-Modell (Holland): Realistic, Investigative, Artistic, Social, Enterprising, Conventional\n- Berufsberatung: Bundesagentur fuer Arbeit (kostenlos!)\n- Praktika: beste Methode um Berufe wirklich kennen zu lernen\n\n## Bewerbung\n- Lebenslauf: tabellarisch, rueckwaerts chronologisch\n- Anschreiben: Interesse + Eignung + Mehrwert fuer Betrieb\n- Online-Praesenzen bereinigen (was sieht der Arbeitgeber?)`,
    flashcards: [
      { front: "Was ist das duale Ausbildungssystem?", back: "Lernorte: Betrieb (Praxis) + Berufsschule (Theorie)\nDauer: 2-3 Jahre, Verguetung waehrend der Ausbildung\nVorteil: Praxisnah, direkt ins Berufsleben, guter Verdienst\nMehr als 320 anerkannte Ausbildungsberufe in Deutschland" },
      { front: "Was ist das RIASEC-Modell (Holland)?", back: "Berufsinteressen-Modell mit 6 Typen:\nR - Realistic (handwerklich)\nI - Investigative (forschend)\nA - Artistic (kuenstlerisch)\nS - Social (sozial)\nE - Enterprising (unternehmerisch)\nC - Conventional (ordnend)\nMeisten Menschen: Mix aus 2-3 Typen" },
      { front: "Was ist wichtig bei einem guten Lebenslauf?", back: "Tabellarisch, rueckwaerts chronologisch (neuestes zuerst)\nKein Foto Pflicht (aber ueblich in DE)\nLuecken erklaeren\nRelevante Erfahrungen betonen\nMaximal 2 Seiten\nFehlerlos! (Rechtschreibung checken)" },
    ],
    quiz: [
      { q: "Was ist ein Vorteil der Ausbildung gegenueber dem Studium?", opts: ["Immer hoehere Gehaelter", "Bereits waehrend der Ausbildung Verguetung erhalten", "Mehr Prestige", "Kuerzer"], correct: 1, exp: "Azubis bekommen eine Ausbildungsverguetung - kein Studienkredit noetig." },
      { q: "Was bedeutet NC bei einem Studienfach?", opts: ["Natuerliche Chemie", "Numerus Clausus - Zulassungsbeschraenkung durch Noten", "Neues Curriculum", "Keine Computerkenntnisse"], correct: 1, exp: "NC = Numerus Clausus - Studiengaenge mit beschraenkten Plaetzen, vergeben nach Abiturnote." },
      { q: "Welches ist die beste Methode um einen Beruf wirklich kennenzulernen?", opts: ["Berufe-Wiki lesen", "Podcast hoeren", "Praktikum machen", "Berufsberatung"], correct: 2, exp: "Praktika: direkte Berufserfahrung im echten Arbeitsumfeld - unersetzlich fuer Berufsorientierung." },
    ],
  },

  PARENT_GUIDE_KIT: {
    studyGuide: `# Elternguide – Lernunterstuetzung zu Hause\n\n## Was Eltern wirklich helfen koennen\n- Ruhige Lernumgebung schaffen\n- Feste Lernzeiten etablieren\n- Interesse zeigen ohne zu kontrollieren\n- Bei Schwierigkeiten nicht sofort Loesung geben\n\n## Motivation vs. Druck\nZu viel Druck: Pruefungsangst, Versagensangst, Rebellion\nZu wenig: kein Ehrgeiz\nRichtig: Angemessene Erwartungen + Lob fuer Aufwand, nicht nur Ergebnis\n\n## Lernschwierigkeiten erkennen\n- Haelt nicht mit Lehrplan mit\n- Vermeidet Hausaufgaben auffaellig\n- Schlechte Noten trotz Arbeit\n- -> Foerderung, Nachhilfe, Schulpsychologin einschalten\n\n## Gesunde Routine\n- Schlafen: 9-11 h fuer Grundschueler, 8-10 h fuer Teenager\n- Sport: mind. 60 Min./Tag Bewegung\n- Mahlzeiten: Fruehstueck ist wichtig (Konzentration!)\n- Bildschirmzeit regulieren\n\n## Kommunikation mit der Schule\n- Regelmaessige Elternabende besuchen\n- Bei Problemen fruehzeitig Lehrerin kontaktieren\n- Schulpsychologin kennen`,
    flashcards: [
      { front: "Wie koennen Eltern Lernen zu Hause am besten unterstuetzen?", back: "Ruhigen Platz bereitstellen\nFeste Lernzeiten (nach Schule, nicht spaet abends)\nInteresse zeigen (Wie war die Schule?)\nNICHT: sofort Hausaufgaben erledigen, staendige Kontrolle" },
      { front: "Was ist der Unterschied zwischen Lob fuer Leistung und Lob fuer Aufwand?", back: "Leistungslob: 'Du bist so klug!' -> fuehrt zu Angst vor Misserfolg\nAufwandlob: 'Du hast so hart gearbeitet!' -> foerdert Growth Mindset\nKinder mit Aufwandlob sind resilenter und lernbereiter (Carol Dweck)" },
      { front: "Wie viel Schlaf brauchen Kinder und Jugendliche?", back: "Grundschueler (6-12): 9-11 Stunden\nJugendliche (13-18): 8-10 Stunden\nErwachsene: 7-9 Stunden\nSchlafmangel = schlechtere Konzentration, Gedaechtnisleistung, Stimmung" },
    ],
    quiz: [
      { q: "Was foerdert nachhaltige Motivation am besten?", opts: ["Belohnung fuer gute Noten", "Druck und Kontrolle", "Lob fuer Aufwand und Prozess", "Vergleich mit Geschwistern"], correct: 2, exp: "Aufwandlob (Lob fuer Anstrengung) foerdert Growth Mindset - intrinsische Motivation." },
      { q: "Wie viel Schlaf brauchen Jugendliche (13-18)?", opts: ["6-7 Stunden", "7-8 Stunden", "8-10 Stunden", "11-12 Stunden"], correct: 2, exp: "Jugendliche brauchen 8-10 Stunden Schlaf fuer optimale Lern- und Gedaechtnisleistung." },
      { q: "Was sollten Eltern bei Lernschwierigkeiten ZUERST tun?", opts: ["Strafe androhen", "Schulpsychologen ignorieren", "Fruehzeitig mit Lehrerin sprechen", "Schule wechseln"], correct: 2, exp: "Fruehzeitiger Kontakt zur Lehrkraft ermoeglicht schnelle, massgeschneiderte Hilfe." },
    ],
  },

  DYSLEXIA_FRIENDLY_KIT: {
    studyGuide: `# Lesen & Schreiben mit LRS – Hilfreiche Strategien\n\n## Was ist LRS/Legasthenie?\nLese-Rechtschreib-Schwaeche ist eine Stoerung der Verarbeitung von Schriftsprache.\nNICHT: Mangelnde Intelligenz oder Faulheit\nUrsache: Unterschied in Hirnverarbeitung von Buchstaben-Laut-Zuordnung\n\n## Hilfreiche Techniken\n\n### Beim Lesen\n- Lineal oder Finger unter die Zeile halten\n- Farbige Folie ueber Text legen\n- Groessere Schrift (mind. 12-14pt), serifenlose Schrift (Arial, OpenDyslexic)\n- Text-to-Speech-Tools nutzen\n\n### Beim Schreiben\n- Woerter in Silben sprechen beim Schreiben\n- Diktatuebungen mit sofortigem Feedback\n- Sprachassistenten/Diktierfunktion nutzen\n\n### Lernen\n- Mehr visuelle und auditive Methoden\n- Mindmaps statt Texte\n- Tonaufnahmen statt Mitschreiben\n- Lernstoff als Podcast anhoeren\n\n## Rechtliche Absicherung\n- Nachteilsausgleich beantragen (Schule/Amt)\n- Mehr Zeit bei Klausuren\n- Alternative Pruefungsformen moeglich\n- LRS-Attest beim Kinderarzt/Schulpsychologen`,
    flashcards: [
      { front: "Was ist LRS (Legasthenie)?", back: "Lese-Rechtschreib-Schwaeche: neurologisch bedingte Schwierigkeit beim Verarbeiten von Schrift.\nNicht: Faulheit, geringe Intelligenz oder schlechte Erziehung.\nBetrifft ca. 5-10% der Bevoelkerung.\nViele Betroffene sind sehr kreativ und intelligent." },
      { front: "Welche Schriftarten helfen bei LRS?", back: "Serifenlose Schriften (Arial, Verdana, OpenDyslexic)\nGroessere Schriftgroesse: mind. 12-14pt\nMehr Zeilenabstand\nOpenDyslexic: kostenlose Schrift speziell fuer Legastheniker" },
      { front: "Was ist ein Nachteilsausgleich?", back: "Rechtliche Anpassung fuer Schueler mit LRS:\n- Mehr Zeit bei Pruefungen (1,25x - 1,5x)\n- Alternative Pruefungsformen\n- Rechtschreibung wird anders bewertet\nBeantragung: Eltern + Schule + Attest vom Arzt/Psychologen" },
    ],
    quiz: [
      { q: "Was ist die Hauptursache von LRS?", opts: ["Faulheit", "Niedrige Intelligenz", "Neurologische Unterschiede in der Schriftverarbeitung", "Schlechte Eltern"], correct: 2, exp: "LRS ist eine neurologisch bedingte Stoerung - kein Wille- oder Intelligensproblem." },
      { q: "Was hilft beim Lesen mit LRS?", opts: ["Schneller lesen", "Schrift kleiner machen", "Farbige Folie und Finger unter Zeile", "Im Dunkeln lesen"], correct: 2, exp: "Farbige Folie, Finger als Linienfuehrung und groessere Schrift erleichtern das Lesen bei LRS." },
      { q: "Was ist ein Nachteilsausgleich?", opts: ["Befreiung vom Lesen", "Rechtliche Anpassung wie mehr Zeit bei Pruefungen", "Extra-Unterricht", "Notenverdoppelung"], correct: 1, exp: "Nachteilsausgleich = legale Unterstuetzung fuer LRS-Betroffene, z.B. Zeitzuschlag bei Klausuren." },
    ],
  },

  BILINGUAL_LEARN_KIT: {
    studyGuide: `# Bilinguales Lernen – Zwei Sprachen, doppelte Chance\n\n## Was ist bilinguales Lernen?\nLernen von Fachinhalt in einer Fremdsprache (Content and Language Integrated Learning - CLIL)\nBeispiel: Geschichte auf Englisch lernen\n\n## Vorteile\n- Fachinhalte + Sprache gleichzeitig\n- Authentischer Sprachkontext (kein kuenstliches Uebersetzen)\n- Bessere Sprachkompetenz durch Anwendung\n- Vorbereitung auf internationale Studium/Karriere\n\n## Strategien fuer bilingualen Unterricht\n- Vokabeln im Fachkontext lernen (z.B. 'osmosis' in Bio-Stunde)\n- Code-Switching erlaubt: wenn Deutsch hilft, Deutsch nutzen\n- Bildwoerterbuecher und Glossare anlegen\n- Fachtexte in Originalsprache lesen\n\n## Sprachlernen mit Medien\n- Serien in Originalsprache mit Untertiteln\n- Podcasts auf Englisch/Franzoesisch\n- Buecher: erst Kinderbuecher in Zielsprache\n- Social Media folgen in Zielsprache\n\n## Tipps fuer zu Hause\n- 15 Minuten/Tag Sprache aktiv nutzen\n- Sprachpartner oder Tandem suchen\n- Language Exchange Apps (Tandem, HelloTalk)`,
    flashcards: [
      { front: "Was ist CLIL (bilinguales Lernen)?", back: "Content and Language Integrated Learning\nFachinhalt (z.B. Biologie, Geschichte) wird in Fremdsprache (meist Englisch) unterrichtet.\nVorteil: Sprache wird in echtem Kontext genutzt, nicht kuenstlich.\nSehr verbreitet in europaischen Gymnasien." },
      { front: "Welche Medien helfen beim Sprachenlernen?", back: "Serien: in Originalsprache mit Untertiteln der Zielsprache\nPodcasts: Slow News, 6 Minute English (BBC)\nBuecher: Niveau angepasst beginnen\nApps: Duolingo (Basis), Anki (Vokabeln), HelloTalk (Sprachpartner)" },
    ],
    quiz: [
      { q: "Was bedeutet CLIL?", opts: ["Computer Language Integration Learning", "Content and Language Integrated Learning", "Comprehensive Language Instruction Level", "Collaborative Interactive Language Learning"], correct: 1, exp: "CLIL = Fachinhalt in der Fremdsprache lernen (z.B. Bio auf Englisch)" },
      { q: "Was ist ein effektiver Tipp fuer taeglich Sprachuebung?", opts: ["Nur in Ferien lernen", "15 Min./Tag aktive Anwendung", "Grammatikbuecher auswendig lernen", "Filme ohne Untertitel"], correct: 1, exp: "Regelmaessige kurze Einheiten (15 Min.) besser als seltenes intensives Lernen (Retention!)." },
    ],
  },

  ROBOTICS_CONCEPTS: {
    studyGuide: `# Robotik – Grundkonzepte\n\n## Was ist ein Roboter?\nMaschine, die programmiert ist, Aufgaben selbstaendig auszufuehren.\nKomponenten: Sensoren (Input), Prozessor (Verarbeitung), Aktoren (Output)\n\n## Sensoren & Aktoren\n**Sensoren** nehmen Umwelt wahr:\n- Abstandssensor, Kamera, Temperatursensor, Lagesensor (IMU)\n\n**Aktoren** wirken auf Umwelt:\n- Motoren, Servos, LEDs, Lautsprecher\n\n## Programmierparadigmen in der Robotik\n- Sequenziell: Schritte nacheinander\n- Bedingt: if-Sensorwert-then-Aktion\n- Schleife: Aktion wiederholen bis Bedingung\n- Parallelitaet: mehrere Aufgaben gleichzeitig\n\n## Bekannte Plattformen\n- LEGO Mindstorms / LEGO Spike\n- Arduino (Mikrocontroller, C/C++)\n- Raspberry Pi (Mini-Computer, Python)\n- ROS (Robot Operating System)\n\n## Anwendungsgebiete\n- Industrie: Montageroboter (Automobilindustrie)\n- Medizin: Da Vinci Chirurgieroboter\n- Erkundung: NASA-Rover auf Mars\n- Haushalt: Saugroboter (Roomba)\n\n## KI in der Robotik\nMaschinelles Lernen ermoeglicht adaptive Roboter\nBeispiel: Roboter lernt durch Versuche laufen (Reinforcement Learning)`,
    flashcards: [
      { front: "Was ist der Unterschied zwischen Sensor und Aktor?", back: "Sensor: nimmt Informationen aus der Umwelt auf (Input)\nBeispiele: Kamera, Abstandssensor, Mikrofon\nAktor: veraendert die Umwelt (Output)\nBeispiele: Motor, LED, Lautsprecher, Greifarm" },
      { front: "Welche Programmierplattform eignet sich fuer Einsteiger in der Robotik?", back: "LEGO Mindstorms/Spike: einfachster Einstieg, visuelle Programmierung\nArduino: Mikrocontroller, C/C++, sehr verbreitet\nRaspberry Pi: Mini-Computer, Python\nAlle haben grosse Communities und viele Tutorials" },
      { front: "Was ist Reinforcement Learning in der Robotik?", back: "Lernmethode: Roboter lernt durch Versuch und Irrtum\nPositive Handlung -> Belohnung -> Verhalten wird wiederholt\nBeispiel: Roboter lernt laufen ohne explizite Programmierung\nWird fuer komplexe Bewegungsaufgaben genutzt" },
    ],
    quiz: [
      { q: "Was ist ein Sensor?", opts: ["Gibt Signale aus", "Nimmt Umweltinformationen auf", "Steuert Motoren", "Speichert Programme"], correct: 1, exp: "Sensoren sind Input-Geraete: Kamera, Mikrofon, Abstandssensor, Temperatursensor." },
      { q: "Welche Sprache wird oft bei Arduino genutzt?", opts: ["Python", "Java", "C/C++", "Scratch"], correct: 2, exp: "Arduino basiert auf C/C++ (vereinfachte Version) - weit verbreitet in Embedded Systems." },
      { q: "Was macht ein Aktor?", opts: ["Misst Temperatur", "Nimmt Bild auf", "Veraendert die Umwelt (z.B. dreht Motor)", "Verarbeitet Daten"], correct: 2, exp: "Aktoren sind Output-Geraete: Motoren, Servos, LEDs, Lautsprecher." },
    ],
  },

  APP_IDEATION_KIT: {
    studyGuide: `# App-Ideen entwickeln – Vom Problem zur Loesung\n\n## Design Thinking Prozess\n1. Empathize: Nutzer verstehen (Interviews, Beobachtung)\n2. Define: Problem klar formulieren (Problem Statement)\n3. Ideate: Ideen generieren (Brainstorming, Keine Bewertung!)\n4. Prototype: Prototyp bauen (Papier, Figma, Code)\n5. Test: Mit echten Nutzern testen, Feedback einholen\n\n## Problem Statement\n'Wie koennen wir [Zielgruppe] helfen, [Problem] zu loesen, damit sie [Ergebnis] erreichen?'\nBeispiel: 'Wie koennen wir Schueler helfen, Lernstoff zu organisieren, damit sie weniger Stress haben?'\n\n## User Persona erstellen\nName, Alter, Beruf/Klasse\nZiele, Frustrations (Pain Points)\nDigitale Gewohnheiten\nMotto/Zitat\n\n## MVP (Minimum Viable Product)\nKleinste Version der App, die den Kernnutzen liefert.\nWas ist das EINE Kernproblem, das wir loesen?\nAlles andere: spaeter!\n\n## Ideen-Bewertung (Impact/Effort Matrix)\n|  | Geringer Aufwand | Hoher Aufwand |\n|--|-----------------|---------------|\n| Grosser Impact | Quick Wins! | Strategisch |\n| Kleiner Impact | Fuell auf | Vermeiden |`,
    flashcards: [
      { front: "Was sind die 5 Schritte des Design Thinking?", back: "1. Empathize (Nutzer verstehen)\n2. Define (Problem formulieren)\n3. Ideate (Ideen generieren)\n4. Prototype (Prototyp erstellen)\n5. Test (mit Nutzern testen)\nIterativer Prozess - oft zurueck zu frueheren Schritten!" },
      { front: "Was ist ein MVP?", back: "Minimum Viable Product\nKleinste, einfachste Version eines Produkts, das den Kernnutzen liefert.\nZiel: So schnell wie moeglich testen ob Idee funktioniert\nAlle extra Features: nur wenn MVP funktioniert!" },
      { front: "Was ist eine User Persona?", back: "Fiktiver, typischer Nutzer deines Produkts.\nEnthaelt: Name, Alter, Ziele, Frustrationen (Pain Points), Gewohnheiten\nHilft: Design-Entscheidungen auf echte Menschen auszurichten\nNicht: Ein Stereotyp, sondern basierend auf echten Interviews!" },
    ],
    quiz: [
      { q: "Was bedeutet MVP in der App-Entwicklung?", opts: ["Most Valuable Player", "Minimum Viable Product", "Maximum Value Product", "Mobile Version Preview"], correct: 1, exp: "MVP = Minimum Viable Product: kleinste Version die Kernnutzen liefert." },
      { q: "In welchem Design-Thinking-Schritt generiert man Ideen ohne Bewertung?", opts: ["Empathize", "Define", "Ideate", "Prototype"], correct: 2, exp: "Ideate-Phase: Brainstorming ohne sofortige Bewertung - Quantitaet vor Qualitaet!" },
      { q: "Was ist ein Problem Statement?", opts: ["Technische Spezifikation", "Klare Formulierung des zu loesenden Problems", "Marketingtext", "App-Name"], correct: 1, exp: "Problem Statement: 'Wie koennen wir [Nutzer] helfen [Problem] zu loesen damit [Ergebnis]?'" },
    ],
  },

  TEACHER_RESOURCE_KIT: {
    studyGuide: `# Lehrerressourcen – Unterricht digital & modern\n\n## Aktive Lernmethoden\n- Think-Pair-Share: Erst allein, dann Partnerarbeit, dann Klasse\n- Flipped Classroom: Video zuhause, Uebung in der Stunde\n- Jigsaw: Jede Gruppe lernt Teilbereich, erklaert dann anderen\n- Exit Ticket: 1 Frage am Ende der Stunde zur Lernkontrolle\n\n## Digitale Tools\n- Kahoot/Quizlet: Gamified Quiz-Abfragen\n- Padlet: Digitale Pinnwand fuer Schuelerarbeiten\n- Mentimeter: Live-Abstimmungen und Wordclouds\n- Google Classroom / Moodle: LMS\n\n## Differenzierung\nAlle Schueler haben unterschiedliche Lerntempos:\n- Grundaufgaben: alle Schueler\n- Erweiterungsaufgaben: fuer Schnelle\n- Unterstuetzungsmaterial: fuer Langsamere\n\n## Feedback-Methoden\n- Ampel-Feedback: Rot/Gelb/Gruen Karten\n- One-Minute-Paper: Was hast du gelernt? Was ist unklar?\n- Peer-Review: Schueler bewerten gegenseitig\n\n## Classroom Management\n- Klare Regeln von Anfang an\n- Positive Verstaerkung vor Sanktionen\n- Stundenbeginn mit Ritual`,
    flashcards: [
      { front: "Was ist die Flipped Classroom Methode?", back: "Umgekehrter Unterricht:\nZuhause: Theorie durch Videos aneignen (statt Frontalunterricht)\nIn der Schule: Aufgaben, Diskussion, Praxis (statt Hausaufgaben)\nVorteil: Mehr aktive Lernzeit im Unterricht, Lehrer als Coach" },
      { front: "Was ist ein Exit Ticket?", back: "Kurze Lernkontrolle am Ende der Stunde (1-2 Minuten):\n'Was habe ich heute gelernt?'\n'Was ist mir noch unklar?'\nGibt Lehrer sofortiges Feedback und zeigt Luecken auf." },
      { front: "Was bedeutet Differenzierung im Unterricht?", back: "Anpassung des Unterrichts an verschiedene Lerntempos und -niveaus:\nGrundaufgaben: alle bearbeiten\nErweiterung: Schnelle/Interessierte\nUnterstuetzung: Brauchen mehr Hilfe\nZiel: Alle Schueler foerdern und fordern." },
    ],
    quiz: [
      { q: "Was ist Flipped Classroom?", opts: ["Unterricht im Stehen", "Theorie zuhause, Praxis in der Schule", "Praxis zuhause, Theorie in der Schule", "Online-Unterricht"], correct: 1, exp: "Flipped Classroom: Schueler schauen Videos zuhause, in der Stunde wird geuebt und diskutiert." },
      { q: "Was ist Think-Pair-Share?", opts: ["Einzelarbeit bis Ende", "Erst allein denken, dann Paar besprechen, dann Klasse", "Gruppenarbeit von 4 Personen", "Lehrervortrag"], correct: 1, exp: "Think-Pair-Share: Erst selbst nachdenken, dann mit Partner, dann mit der ganzen Klasse teilen." },
      { q: "Was ist ein Exit Ticket?", opts: ["Eintrittskarte", "Kurze Lernkontrolle am Stundenende", "Hausaufgabenzettel", "Notenblatt"], correct: 1, exp: "Exit Ticket: 1-2 Fragen am Stundenende - gibt Lehrer Feedback ueber Lernstand der Klasse." },
    ],
  },

  DEBATE_PREP_KIT: {
    studyGuide: `# Debatten vorbereiten und gewinnen\n\n## Debattenstruktur (Oxford-Format)\n1. These vorstellen (2 Min.)\n2. Pro-Argumente (6 Min.)\n3. Contra-Argumente (6 Min.)\n4. Rebuttal: Gegenargumente widerlegen (3 Min.)\n5. Closing Statement (2 Min.)\n\n## Argumente aufbauen (PEEL)\n- Point: Hauptaussage\n- Evidence: Beleg/Beweis\n- Explanation: Erklaerung warum das relevant ist\n- Link: Zurueck zur These\n\n## Rhetorik-Techniken\n- Ethos: Glaubwuerdigkeit (Erfahrung, Kompetenz)\n- Pathos: Emotion (Geschichte, Mitgefuehl)\n- Logos: Logik (Fakten, Statistiken)\n\n## Gegenargumente entkraeften (Rebuttal)\n1. Anerkenne das Gegenargument (Fairness)\n2. Zeige den Fehler/die Schwaeche\n3. Widerlege mit Beleg\n4. Komme zurueck zu deiner Position\n\n## Koerpersprache im Debate\n- Aufrechte Haltung = Autoritat\n- Augenkontakt = Verbindung\n- Langsam sprechen = Sicherheit\n- Pausen nutzen = Gewicht`,
    flashcards: [
      { front: "Was ist die PEEL-Methode fuer Argumente?", back: "P - Point (Hauptaussage/These)\nE - Evidence (Beleg, Beweis, Statistik)\nE - Explanation (Warum ist das relevant?)\nL - Link (Zurueck zur zentralen These)\nJedes Argument hat diese 4-teilige Struktur." },
      { front: "Was sind Ethos, Pathos, Logos?", back: "Aristoteles' rhetorische Ueberzeugunsstrategien:\nEthos: Glaubwuerdigkeit des Sprechers (Expertise, Erfahrung)\nPathos: Emotionale Ansprache (Geschichten, Mitgefuehl)\nLogos: Logische Argumentation (Fakten, Statistiken)\nAlle drei kombinieren = starke Rede" },
      { front: "Wie baut man ein Rebuttal (Gegenargument) auf?", back: "1. Anerkenne das Argument des Gegners (fairness)\n2. Identifiziere den Fehler/die Schwaeche\n3. Widerlege mit konkretem Beleg\n4. Link zurueck zu deiner Position\n'Das stimmt zwar, ABER...' als Einstieg" },
    ],
    quiz: [
      { q: "Was steht 'E' in der PEEL-Methode?", opts: ["Ende", "Evidence (Beleg)", "Einleitung", "Ethos"], correct: 1, exp: "PEEL: Point, Evidence (Beleg/Beweis), Explanation, Link" },
      { q: "Was ist Pathos?", opts: ["Logische Argumentation", "Emotionale Ansprache des Publikums", "Fachkompetenz des Sprechers", "Statistiken nutzen"], correct: 1, exp: "Pathos = emotionale Ansprache (Aristoteles) - Geschichten, Mitgefuehl, Betroffenheit erzeugen." },
    ],
  },

  SOURCE_ANALYSIS_KIT: {
    studyGuide: `# Quellenanalyse - Geschichte & Politik\n\n## Was ist eine historische Quelle?\nAlle Ueberreste der Vergangenheit:\n- Schriftquellen: Briefe, Gesetze, Zeitungen, Tagebuecher\n- Bildquellen: Fotos, Gemaelde, Karikaturen\n- Sachquellen: Artefakte, Gebaude\n- Muendliche Quellen: Zeitzeugenberichte\n\n## Unterschied: Quelle vs. Darstellung\n- Quelle: Zeitgenoessisches Dokument (entstand damals)\n- Darstellung: Spaetere Interpretation (z.B. Geschichtsbuch)\n\n## Schema der Quellenanalyse\n1. Einordnung: Was? Wer? Wann? Wo? Fuer wen?\n2. Inhalt: Worum geht es? (Inhaltsangabe)\n3. Analyse: Standpunkt, Intention, Quellenart\n4. Einordnung in Kontext: Historischer Hintergrund\n5. Kritik: Quellenkritik (Glaubwuerdigkeit, Einseitigkeit, Luecken)\n\n## Quellenkritik\n- Wer hat die Quelle erstellt? (Interessen?)\n- Wann wurde sie erstellt? (Zeitgenoessisch oder spaeter?)\n- Fuer wen wurde sie erstellt? (Oeffenlich vs. privat)\n- Wie ist die Quelle ueberliefert? (Original oder Abschrift?)\n\n## Karikaturen analysieren\n1. Bildebene: Was ist zu sehen?\n2. Zeichenebene: Symbole, Uebertreibungen, Stereotypen\n3. Botschaft: Was kritisiert/befuerwortet der Zeichner?`,
    flashcards: [
      { front: "Was ist der Unterschied zwischen Quelle und Darstellung?", back: "Quelle: Zeitgenoessisches Zeugnis der Vergangenheit (entstand damals)\nBsp: Hitlers Tagebuch, Weimarer Verfassung\nDarstellung: Spaetere Interpretation durch Historiker\nBsp: Geschichtsbuch, Dokumentarfilm\nBeide sind wichtig, aber unterschiedlich zu bewerten!" },
      { front: "Was sind die 5 Schritte der Quellenanalyse?", back: "1. Einordnung: Autor, Zeit, Ort, Adressat\n2. Inhalt: Zusammenfassung\n3. Analyse: Standpunkt, Intention\n4. Kontext: Einordnung ins historische Umfeld\n5. Quellenkritik: Glaubwuerdigkeit, Einseitigkeit, Luecken" },
      { front: "Was ist Quellenkritik?", back: "Kritische Bewertung der Zuverlaessigkeit einer Quelle:\n- Wer hat sie verfasst? (Interessen, Bias)\n- Wann? (Zeitgenoessisch = direkter, spaeter = veraendert?)\n- Fuer wen? (Oeffentlich vs. privat)\n- Wie ueberliefert? (Original vs. Abschrift)\nKeine Quelle ist 100% objektiv!" },
    ],
    quiz: [
      { q: "Was ist eine historische Quelle?", opts: ["Ein Geschichtsbuch", "Ein Zeitgenoessisches Dokument", "Eine Wikipedia-Seite", "Ein Lehrervortrag"], correct: 1, exp: "Quelle = zeitgenoessisches Zeugnis (entstand damals, z.B. Gesetz, Brief, Zeitung aus der Zeit)." },
      { q: "Warum ist Quellenkritik wichtig?", opts: ["Um Quelle zu vernichten", "Keine Quelle ist 100% objektiv - Bias erkennen", "Um Noten zu verbessern", "Nur bei Karikaturen noetig"], correct: 1, exp: "Jede Quelle hat einen Standpunkt. Quellenkritik hilft Verzerrungen, Luecken und Interessen zu erkennen." },
    ],
  },

  PRONUNCIATION_KIT: {
    studyGuide: `# Aussprache verbessern – Englisch & mehr\n\n## Warum Aussprache wichtig ist\nFluessige Aussprache erhoehe Verstaendlichkeit und Selbstvertrauen.\nFehler in Aussprache koennen Missverstaendnisse verursachen.\n\n## Englisch Aussprache – Haeufige Fehler\n\n### Vokale\n- 'ea': read /riːd/ vs. read /rɛd/ (je nach Bedeutung!)\n- 'ou': through /θruː/, though /ðoʊ/, tough /tʌf/\n\n### Konsonanten\n- 'th': stimmhaft /ð/ (the, this) vs. stimmlos /θ/ (think, thank)\n- 'w' vs 'v': wine /waɪn/ vs. vine /vaɪn/\n\n### Wortbetonung\n- Englisch: erste Silbe oft betont (PREsent vs. preSENT)\n- Verbform: preSENT (to present)\n- Nomenform: PREsent (a present)\n\n## Uebungen\n- Minimal pairs: pairs of words differing by one sound\n  ship/sheep, hat/hot, live/leave\n- Shadow reading: Sprecher nachahmen\n- Aufnahme: sich selbst aufnehmen und vergleichen\n- IPA Grundlagen lernen: /θ/, /ð/, /æ/, /ə/`,
    flashcards: [
      { front: "Wie spricht man 'th' im Englischen aus?", back: "Zwei Varianten:\n/θ/ stimmlos: think, thank, three, through (Zungenspitze zwischen die Zaehne)\n/ð/ stimmhaft: the, this, that, there (mit Vibration)\nDeutscher macht oft 'd' oder 's' stattdessen - Ueben!" },
      { front: "Was sind Minimal Pairs und wie helfen sie?", back: "Woertpaare, die sich nur in einem Laut unterscheiden:\nship/sheep, hat/hot, sit/seat, live/leave\nUebung: Beide Woerter laut sagen, Unterschied spueren\nHilft das Hoersystem zu trainieren und Aussprachefehler zu finden" },
      { front: "Wie beeinflusst Wortbetonung die Bedeutung im Englischen?", back: "Gleiche Buchstaben, verschiedene Betonung = verschiedene Wortart:\nPRE-sent (Nomen: Geschenk)\npre-SENT (Verb: praesentieren)\nRE-cord (Nomen: Aufnahme)\nre-CORD (Verb: aufnehmen)" },
    ],
    quiz: [
      { q: "Wie spricht man 'the' aus?", opts: ["/θiː/", "/ðə/ oder /ðiː/", "/dɛ/", "/ziː/"], correct: 1, exp: "'the' hat zwei Aussprachen: /ðə/ vor Konsonanten (the book), /ðiː/ vor Vokalen (the apple)" },
      { q: "Was sind Minimal Pairs?", opts: ["Kleinste Saetze", "Woerter die sich in einem Laut unterscheiden", "Synonyme", "Antonyme"], correct: 1, exp: "Minimal Pairs: ship/sheep, hat/hot - unterscheiden sich in einem einzigen Phonem." },
    ],
  },

  MATH_BUNDESWETTBEWERB: {
    studyGuide: `# Mathematik-Wettbewerb – Olympiade-Training\n\n## Wichtige Themenbereiche\n- Zahlentheorie: Teilerfremdheit, Primzahlen, Kongruenzen\n- Kombinatorik: Permutationen, Kombinationen\n- Geometrie: Kreisgeometrie, Dreiecke, Beweise\n- Algebra: Polynome, Ungleichungen\n\n## Beweistechniken\n- Direkter Beweis: A -> B\n- Widerspruchsbeweis: Annahme not-B fuehrt zu Widerspruch\n- Vollstaendige Induktion: Basis + Induktionsschritt\n- Konstruktiver Beweis: Objekt explizit angeben\n\n## Vollstaendige Induktion\n1. Induktionsanfang: Aussage fuer n=1 zeigen\n2. Induktionsvoraussetzung: Aussage gilt fuer n=k\n3. Induktionsschritt: Zeige Aussage gilt fuer n=k+1\n\n## Klassische Olympiade-Probleme\n- Teilbarkeitsbeweise\n- Extremalprinzip: Betrachte Maximum/Minimum\n- Invarianten: Groesse die sich nicht aendert\n- Pigeonhole-Prinzip: n+1 Tauben in n Loechern\n\n## Uebungsstrategie\n- Alte Wettbewerbsaufgaben loesen (bundeswettbewerb.de)\n- Wenn feststeckend: 5 Minuten Pause, dann frisch\n- Spezialfaelle testen (n=1, n=2) um Muster zu finden`,
    flashcards: [
      { front: "Wie funktioniert vollstaendige Induktion?", back: "Beweistechnik fuer Aussagen ueber alle natuerlichen Zahlen:\n1. Induktionsanfang: Zeige Aussage fuer n=1\n2. Induktionsvoraussetzung: Nehme an, gilt fuer n=k\n3. Induktionsschritt: Zeige, gilt auch fuer n=k+1\n-> Gilt fuer alle n >= 1" },
      { front: "Was ist das Schubfachprinzip (Pigeonhole)?", back: "Wenn n+1 Objekte auf n Schubladen verteilt werden, enthaelt mindestens eine Schublade >= 2 Objekte.\nAnwendung: 367 Menschen -> mind. 2 mit gleichem Geburtstag\nOft in Olympiade-Aufgaben: 'Es existiert eine Gruppe von...' beweisen" },
      { front: "Was ist der Widerspruchsbeweis?", back: "Man nimmt an, die Aussage ist falsch (not-B) und zeigt dass das zu einem Widerspruch fuehrt.\nDaraus folgt: Die Annahme war falsch -> Die Aussage stimmt.\nBeispiel: Beweis dass sqrt(2) irrational ist" },
    ],
    quiz: [
      { q: "Was beweist man mit vollstaendiger Induktion?", opts: ["Einzelne Faelle", "Aussagen die fuer alle natuerlichen Zahlen gelten", "Nur Summenformeln", "Geometrische Saetze"], correct: 1, exp: "Vollstaendige Induktion: zeigt eine Eigenschaft gilt fuer ALLE n in N." },
      { q: "Was besagt das Schubfachprinzip?", opts: ["Schubladen sind immer voll", "Bei n+1 Objekten in n Schubladen gibt es eine mit >= 2", "Schubladen koennen leer sein", "Alle Schubladen sind gleich"], correct: 1, exp: "Pigeonhole: n+1 Objekte in n Behaelter -> mindestens ein Behaelter hat >= 2 Objekte." },
    ],
  },

};
