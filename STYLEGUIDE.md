# Styleguide — Portfolio-Website (Moritz Bertz)

Referenzdokument für die Weiterentwicklung dieser Seite. Ziel: "VS Code / Linux Terminal"-Ästhetik konsequent und konsistent halten. Bei neuen Komponenten hier zuerst nachschlagen, bevor neue Muster erfunden werden.

## Grundprinzipien

- **Kein Framework, kein Build-Step.** Reines HTML/CSS/Vanilla-JS. `script.js` ist eine Sammlung von `initializeX()`-Funktionen, alle am Ende in einem `DOMContentLoaded`-Listener aufgerufen.
- **Immer direkt in den Live-Dateien arbeiten** (`index.html`, `stylesheet.css`, `script.js`), nicht in separaten Prototyp-Dateien — der Nutzer testet über Live Server gegen die echten Dateien.
- **Animationen ausschließlich mit `transform`/`opacity`** wo möglich (GPU-beschleunigt). Zähl-/Tipp-Animationen laufen über `requestAnimationFrame()`, nie über `setInterval()`.
- **`prefers-reduced-motion: reduce` immer respektieren** — jede neue Animation braucht eine Media-Query, die sie abschaltet oder durch einen Sprung zum Endzustand ersetzt.
- Vor jeder Auslieferung: Playwright-Verifikation gegen den lokalen Static-Server (Desktop **und** Mobile-Viewport, Light **und** Dark Mode, 0 Konsolenfehler), danach erst melden.

## Farbsystem

Zwei parallele Variablen-Familien in `stylesheet.css`, beide über `:root` (Light-Default) und `body.dark` (Dark-Override) definiert:

- **`--bg` / `--text` / `--accent` / `--accent-rgb`** — die allgemeinen Seitenfarben. `--accent` ist bewusst **identisch** in Light und Dark (`#00bcd4`, Cyan) — kein separates Orange im Light Mode mehr.
- **`--ide-*`** — das VS-Code-Farbsystem für alle Terminal-/Editor-Boxen (`--ide-bg`, `--ide-bg-elevated`, `--ide-bg-sidebar`, `--ide-bg-activitybar`, `--ide-text`, `--ide-text-dim`, `--ide-green`, `--ide-cyan`, `--ide-orange`, `--ide-purple`, `--ide-glass-bg`, `--ide-glass-border`). Invertieren mit dem Theme-Toggle (Dark+-Palette `#1e1e1e`/`#252526`/`#333333`, Light+-Palette `#ffffff`/`#f3f3f3`/`#ececec`).

**Ausnahme — High-Contrast-Fenster:** Das Projekt-Explorer-Fenster (`.ide-window-overlay`) ist bewusst **fest** schwarz/cyan/weiß gestylt, unabhängig vom Theme-Toggle. Lokale Custom Properties `--hc-bg` (`#000`), `--hc-line` (`var(--accent)`), `--hc-text` (`#fff`), `--hc-text-dim` (`#b3b3b3`) werden auf `.ide-window-overlay` gesetzt und vererben sich an alle Kind-Elemente. Wenn eine neue High-Contrast-Komponente gebraucht wird: denselben `--hc-*`-Ansatz auf dem äußeren Container definieren, nicht die globalen `--ide-*`-Variablen anfassen (die müssen für Hero/Timeline/Skills theme-reaktiv bleiben).

**Zweite Ausnahme — CRT-Monitor (im Header, `#crtMonitor`):** eigener, dritter Token-Satz `--crt-*` (`--crt-bezel`, `--crt-bezel-edge`, `--crt-screen`, `--crt-phosphor`, `--crt-phosphor-dim`, `--crt-phosphor-mut`, `--crt-error`), ebenfalls fest/nicht theme-reaktiv, nur in `:root` definiert (kein `body.dark`-Override nötig, da bewusst überall gleich). Phosphor-Grün (`#4ade80`, dieselbe Grün-Familie wie `.ps1-user`/`.status-dot`) statt Amber — Amber wirkte gegen das sonst cyan-dominierte Farbschema der Seite zu warm/unpassend.

**Nie mehr:** eigene hartcodierte Orange-Töne (`hsl(29,89%,...)`, `rgb(255,140,0)`) — überall durch `var(--accent)`-Äquivalente (`hsl(192,100%,...)`, `rgba(0,188,212,...)`) ersetzt.

**`--grid-texture-opacity`:** eigene Variable (`:root`/`body.dark`) für die Deckkraft des `body::before`-Punkt-/Linienrasters. Läuft als **fixer, seitenweiter Hintergrund-Layer** (`position:fixed; z-index:-1`) hinter der gesamten Seite, nicht mehr nur hinter `#skills` (frühere `.grid-texture`-Klasse, per Section aktiviert, ist entfallen — der Effekt braucht dafür kein `position:relative`/`z-index` mehr auf Section-Inhalten, ein negativer z-index auf dem fixed Pseudo-Element reicht). Light Mode braucht einen deutlich höheren Wert (`0.16`) als Dark Mode (`0.09`), da dieselbe Cyan-Linie auf Weiß viel schwächer wirkt als auf Dunkel — beim Nachjustieren immer **beide** Modi per Screenshot vergleichen, nicht nur den einen, an dem gerade gearbeitet wird.

## Typografie

- **`JetBrains Mono`** — für alles, was wie Code/Terminal aussieht (Standard-Font der meisten Komponenten).
- **`Sora`** — für große Überschriften (`h1`, `h2`, `.section-eyebrow`, `.ide-md-h1`).
- **`Inter`** — für Fließtext/Prosa (Absätze, Listen außerhalb von Terminal-Kontexten).
- **`Press Start 2P`** wird nicht mehr verwendet (war nur für das alte Profilfoto-Badge da, entfernt zusammen mit dem alten About-Layout) — auch aus dem Google-Fonts-`<link>` im `<head>` entfernt.

## Section-Header-Konvention

Jede Hauptsektion hat **genau eine** Überschrift im Code-Kommentar-Stil, keine doppelte Eyebrow+H2-Kombination mehr:

```html
<h2 class="section-eyebrow mb-4">// Experience</h2>
```

**Linksbündig statt zentriert:** `.section-eyebrow` ist standardmäßig `text-align: left` und sitzt auf Höhe des Fenster-Inhalts darunter (kein `text-center` mehr in der HTML-Klasse). Sections, deren eigentlicher Inhalt schmaler als die Section selbst und unabhängig zentriert ist (`#skills` → `.accordion-list{max-width:800px}`, `#contact` → `#contact-form{max-width:600px}`), brauchen dafür eine eigene `#id .section-eyebrow{max-width:...; margin:0 auto; text-align:left;}`-Regel, damit beide Kanten bündig sind — **Achtung:** bestehende `#skills h2`/`#contact h2`-Regeln setzen dort selbst `text-align:center` mit Element+ID-Spezifität; die eigene Override-Regel muss `text-align: left` deshalb explizit wiederholen, sonst gewinnt die alte Regel. Auf Mobile (`@media max-width:768px`) wird wieder zentriert, wie alles andere dort auch.

Nav-Label und Section-Header müssen denselben Begriff tragen (Nav zeigt `/experience` als Pfad, Header `// Experience` als Kommentar — gleiches Wort, unterschiedliche Formatierung ist ok). Aktuelle Reihenfolge (Nav **und** DOM müssen übereinstimmen): **About (im Header) → Experience → Education → Skills → Projects → Contact**. About ist keine eigene scrollbare Section mehr — der Nav-Link `/about` zeigt auf `<header id="about">` (siehe CRT-Monitor-Abschnitt unten). Skills/Projects sitzen als kompaktes Duo nebeneinander (siehe `.skills-projects-row` unten) — Skills links, Projects rechts, deshalb auch in der Nav in dieser Reihenfolge.

## Komponentenmuster

### Terminal-Fenster (`.terminal-window`)
Basis-Baustein für alle IDE-artigen Boxen: `.terminal-titlebar` (Tab-Leiste, optional `.terminal-window-controls` mit `.win-ctrl` für dekorative − □ × Symbole) + `.terminal-body`. Wird von Hero-Terminal, Sidekick-Panel, Git-Timeline-Karte, Education-Topology-Panel und Pod-Inspector-HUD geteilt.

### Floating Overlay / Modal (etabliertes Muster, mehrfach verwendet)
Jedes neue Popup/Overlay folgt demselben Grundgerüst:
1. `<div class="X-backdrop" hidden></div>` + `<div class="X-overlay" hidden>...</div>` im HTML.
2. CSS: `opacity`/`transform: scale()`-Transition, `.open`-Klasse triggert den Endzustand, `[hidden] { display: none; }`.
3. JS: `openX()` setzt `hidden = false`, erzwingt Reflow (`void el.offsetWidth`), fügt per `requestAnimationFrame` die `.open`-Klasse hinzu, sperrt `document.body` (Klasse `ide-overlay-open` bzw. `k8s-hud-locked`, beide setzen `overflow: hidden`), registriert Escape-Listener. `closeX()` entfernt `.open`, entsperrt den Body, setzt `hidden = true` nach der Transition-Dauer per `setTimeout`.
4. Schließen-Buttons nutzen `.ide-win-btn.ide-win-close` mit **rotem Hover** (`#e81123`) — Windows-typisches Signal "dieser Button schließt etwas". `.ide-win-btn`/`.ide-window-controls` ist die EINE gemeinsame Fenstersteuerung-Komponente für alle Overlays (Größe/Abstand einheitlich 46×34px) — nicht pro Komponente neu erfinden, sonst driften Größe/Spacing auseinander (genau das ist beim Pod-Inspector-HUD passiert und musste nachträglich vereinheitlicht werden). Nur Icon-/Hover-**Farben** dürfen pro Komponente überschrieben werden (Projekt-Fenster: fest schwarz/weiß/cyan über `--hc-*`; Pod-Inspector-HUD: theme-reaktiv über `--ide-*`, siehe `.k8s-hud .ide-win-btn`-Regeln).
5. `.ide-window-controls` braucht `margin-left: auto`, damit sie in JEDER Titelleiste (auch `.terminal-titlebar` ohne `justify-content: space-between`) zuverlässig ganz nach rechts rutscht, statt mittig neben einem langen Tab-Namen zu hängen.
6. Backdrop-Klick UND Escape schließen immer zusätzlich zum expliziten Close-Button.

Beispiele dieses Musters: Projekt-VS-Code-Fenster (`ideWindowOverlay`), Pod-Inspector-HUD (`k8sHud`), die drei klassischen Modals (`abschlussprojektModal`, `dokuModal`, `iframeModal`).

### Docker-Pull-Accordion (`.accordion-item`)
Segmentierte Balken (`repeating-linear-gradient`, **kein** weicher Gradient) mit `transition: width 900ms steps(12, end)` für die "stotternde" Download-Optik. Prozentzahl zählt im selben 12-Schritte-Takt synchron mit (`animatePercent()` in `initializeSkillsAccordion()`). Nur **ein** Accordion-Item gleichzeitig offen (Klick auf ein anderes schließt das vorherige automatisch).

### Git-Timeline Diff-Flash (`#gitDiffFlash`)
Der grüne "+ Added: ..."-Hinweis bleibt nach dem Aufblitzen bewusst **dauerhaft stehen** (kein Auto-Hide-Timer mehr) — wirkt wie ein permanenter "Added"-Haken über der Commit-Beschreibung, nicht wie eine flüchtige Toast-Nachricht. Beim Wechsel auf einen anderen Commit wird er nur kurz zurückgesetzt (Reflow-Trick) und sofort wieder eingeblendet, nie versteckt gehalten.

### Datengetriebene Listen (Git-Timeline, Projekt-Dateibaum)
Inhalte stecken als `data-*`-Attribute direkt in den HTML-Buttons (nicht in einem JS-Array) — JS liest nur aus, baut keine Inhalte. Ausnahme: Projekt-READMEs liegen als `<template id="tpl-...">`-Blöcke im HTML und werden per `cloneNode(true)` in den Editor geklont.

### CRT-Monitor mit Menü-Navigation (im Header, `#crtMonitor`, `initializeAboutCrtMonitor()`)
Sitzt **direkt im Header** (linke Spalte, ersetzt das frühere `whoami.sh`-Fenster; `current_status.yml` bleibt als rechte Spalte daneben) — es gibt keine separate `#about`-Section mehr, `<header id="about">` trägt die ID für den Nav-Anker. Permanent sichtbare, **fest dimensionierte** Terminal-Box (`.crt-screen { height: 300px }` Desktop / `400px` Mobile, niemals am Inhalt wachsend — Überlauf scrollt intern via `overflow-y: auto`). Menü-Punkte sind echte `<button class="crt-menu-item">`-Elemente (klickbar UND per `#crtTerminalInput`-Eingabefeld per Tastatur erreichbar — beide Wege müssen bei jedem neuen Menüpunkt funktionieren).

Jede "Seite" (`renderMenu()`/`renderAbout()`/`renderStack()`/`renderContact()`/`startScan()`) leert den Screen komplett (`clearScreen()`) und baut neu — kein Diffing nötig, da die Inhalte kurz sind. Statische Seiten setzen am Ende explizit `screen.scrollTop = 0` (nicht dem Auto-Scroll-ans-Ende aus `addLine()`/`addNode()` überlassen, das ist nur für den live mitlaufenden Scan gedacht — sonst zeigt eine Seite, die länger als die feste Screen-Höhe ist, beim Aufruf sofort das Ende statt den Anfang). `startScan()` läuft über dieselbe Timer-Queue wie vorher (Pacing-Konstanten `FAST`/`TABLE`/`PAUSE`/`QUICK`), `clearScreen()` räumt alle offenen Timer UND `requestAnimationFrame`-IDs ab (`scanTimers`/`scanRafs`-Arrays) — Escape/Power-Button müssen jederzeit, auch mitten im Scan, sofort zurück ins Menü kommen.

Der Power-On-Flash + die Boot-Sequenz (`playBootSequence()`, zeichenweises Eintippen der Boot-Zeilen per `requestAnimationFrame`, wie beim alten `whoami`-Boot) laufen einmal beim Init (Monitor ist ja jetzt sofort sichtbar, kein Scroll-Trigger nötig) und zusätzlich jedes Mal, wenn `powerOn()` nach einem `powerOff()` erneut aufgerufen wird. `powerOff()`/`powerOn()` sind ein **echter Ein-/Aus-Schalter** (nicht nur "zurück zum Menü"): Aus-Klick spielt eine `crt-power-off`-Kollaps-Animation (Bild → waagrechte Linie → Punkt → schwarz, Spiegelbild von `crt-power-on`), setzt `.powered-off` (Screen-Inhalt/Input per `visibility:hidden` ausgeblendet, LED gedimmt), Ein-Klick spielt Power-On + Boot-Sequenz erneut ab.

**Header-Grid-Aufteilung (`.header-content`):** Monitor bekommt den ganzen Restplatz (`minmax(0,1fr)`), die `current_status.yml`-Card eine **feste** Spalte (`minmax(440px,520px)` — doppelt so breit wie die ursprünglichen `220–260px`) statt eines fr-Anteil-Verhältnisses. Eigener Zwischen-Breakpoint bei `960px` (zusätzlich zum allgemeinen `768px`-Mobile-Umbruch), da eine feste Spalte sich sonst im Bereich 768–1160px unbrauchbar schmal neben den Monitor quetschen würde.

**CRT-Monitor-Größe (Desktop only, `@media(min-width:961px)`, bewusst derselbe 960px-Grid-Umbruch wie oben):** `.crt-screen` bekommt dort `height:600px` + `aspect-ratio:4/3` (doppelte Höhe der Basis-Regel `300px`, echte Röhrenmonitor-Optik statt Widescreen), `.crt-monitor--inline` entsprechend `width:min(100%,844px)` (= `800px`-Screen + die `2×22px`-Bezel-Innenabstände, damit das Gehäuse nicht lose neben dem Screen sitzt). `.header-content` bekommt in derselben Query `width:min(100%,1560px)` (statt `1160px`, sonst reicht der Platz für Monitor+verdoppelte Card nicht mehr nebeneinander) und `align-items:center` (statt `start`), damit die jetzt viel höhere Röhre vertikal mittig neben der deutlich niedrigeren Card steht. Unterhalb von 961px (gestapeltes Tablet-/Mobile-Layout) bleiben die alten, kleineren Werte unverändert — dort stehen Monitor und Card ohnehin nicht mehr nebeneinander.

### Status-Card (`current_status.yml`, `initializeStatusCardReveal()`)
Inhalt nach Recruiter-Relevanz sortiert (Headline → Status-Badge → Stack-Chips → Verfügbarkeit/Location → Sprachen gedämpft → CV-Button), komplett aus `ABOUT_ME` befüllt (kein zweites Datenmodell — `ABOUT_ME.stack` ist dieselbe Quelle wie der CRT-`renderStack()`-Screen). Chips nutzen bewusst die bestehende `.git-badge`-Komponente statt einer eigenen Chip-Klasse (ein Tag-Look für die ganze Seite). Badge/Dot-Puls nutzt das bereits vorhandene `status-pulse`-Keyframe (dasselbe wie `.status-dot`/`.k8s-live-dot`).

### Gemeinsame Zeilen-Reinflug-Animation (`.reveal-line`, `revealLines()`)
`.crt-line` und `.reveal-line` teilen sich dasselbe `@keyframes crt-line-fade-in` (Opacity + leichter `translateY`). Zwei Nutzungsarten für denselben visuellen Effekt, je nachdem ob der Inhalt live über die Zeit aufgebaut wird oder schon komplett im DOM steht:
- **CRT-Screen**: Elemente werden nacheinander per `setTimeout` angehängt (`addLine()`/`addNode()`), jedes bekommt beim Einfügen automatisch die Animation.
- **Statische Blöcke** (Status-Card): alle Kind-Elemente stehen schon im DOM, `revealLines(elements, stepMs)` (in `script.js`, oben bei den globalen Helpers) vergibt nur gestaffelte `animation-delay`-Werte (`i * stepMs`) und respektiert `prefers-reduced-motion` (Animation aus, `opacity:1` sofort). Bei neuen Komponenten mit "Zeile für Zeile einfliegen"-Optik: `revealLines()` wiederverwenden statt eine dritte Timing-Variante zu bauen.

### Skills + Projects nebeneinander (`.skills-projects-row`)
`#skills` und `#projects` bleiben echte `<section>`-Elemente mit eigener ID (Scroll-Spy/`scrollIntoView` unverändert), stecken aber als Flex-Kinder in einem gemeinsamen `.skills-projects-row`-Wrapper (Skills `flex:1.15`, Projects `flex:1`, beide `max-width:none;margin:0`, da die globalen `section{}`/`#skills{}`/`#projects{}`-Breiten-Regeln hier gezielt überschrieben werden müssen). Projects zeigt in dieser Spalte nur den kompakten Launcher (`.ide-launcher-hint` wird container-basiert ausgeblendet, `.skills-projects-row .ide-launcher-hint{display:none}`) — der Klick öffnet weiterhin denselben `.ide-window-overlay`, keine zweite Explorer-Variante. Unter `960px` (bzw. `1100px` für dieses Wrapper-Paar) stapeln beide wieder untereinander (`flex-direction:column`). **DOM-Reihenfolge** bestimmt die visuelle Links-Rechts-Reihenfolge in Flex-Row — wer zuerst im HTML steht, steht links.

## Icons

`bootstrap-icons` ist bereits eingebunden (`<i class="bi bi-...">`). Für neue VS-Code-artige UI-Elemente (Explorer, Activity Bar, Dateitypen) bevorzugt Bootstrap-Icons-Klassen statt neuer Emoji/SVGs, für visuelle Konsistenz mit dem bereits gebauten Projekt-Explorer.

## Responsive/Mobile-Konventionen (für das Multi-Agent-Redesign)

Analyse-Stand: 24 `@media`-Queries in `stylesheet.css`, Viewport-Meta korrekt gesetzt (`width=device-width, initial-scale=1.0`). Bevor neue Mobile-Regeln geschrieben werden, hier nachlesen — das verhindert, dass mehrere parallel arbeitende Agents widersprüchliche Breakpoints erfinden oder sich gegenseitig überschreiben.

### Grundregel: Media-Query bleibt bei der Komponente

Es gibt **kein separates Mobile-Stylesheet** und soll auch keins geben. Jede `@media`-Regel steht direkt hinter der Basis-Regel der Komponente, die sie anpasst (Beispiel: `.crt-screen{}`-Basis um Zeile 2900, zugehörige `@media(max-width:768px){ .crt-screen{ height:400px } }` direkt danach um Zeile 2976). Neue Mobile-Anpassungen genauso einsortieren — nicht an einer zentralen Stelle sammeln. Das hält Komponenten in sich geschlossen und verhindert, dass zwei Agents dieselbe globale Media-Query-Stelle gleichzeitig bearbeiten.

### Breakpoints sind bewusst pro Komponente gewählt — nicht vereinheitlichen

Es gibt **kein** einzelnes globales Breakpoint-Raster. Aktuell im Einsatz, jeweils dort gesetzt, wo genau dieses eine Layout bricht:

| Breakpoint | Verwendet für |
|---|---|
| `768px` | Standard-Phone-Umbruch: Section-Eyebrow, Header, Accordion, IDE-Mobile-Explorer-Button, Prompt-Nav→Burger, CRT-Monitor |
| `700px` | k8s-Node-Chain (Ausbildung) — bricht als Einzige schon etwas früher |
| `767px` | IDE-Editor-Container-Grid (Sidebar/Output stapeln) — 1px unter dem Standard, vermutlich historisch, funktional aber gleichwertig zu 768 |
| `900px` | IDE-Sidebar-Breite (Zwischenstufe) |
| `960px` | Header-Grid (Monitor + Status-Card) — bewusst eigener Zwischen-Breakpoint, siehe Kommentar bei `.header-content` in STYLEGUIDE.md oben |
| `1100px` | `.skills-projects-row` (Skills/Projects nebeneinander → gestapelt) |
| `1200px` | `#skills` Max-Breite |

**Für neue Mobile-Arbeit:** `768px` ist der Standard-Phone-Breakpoint — neue Phone-Anpassungen dort einhängen, außer eine Komponente braucht nachweislich einen eigenen Zwischenwert (wie Header bei 960px). Wenn ein Agent einen neuen eigenen Breakpoint einführt, **muss** ein Kurzkommentar dabeistehen, der begründet, warum der Standardwert nicht reicht (Konvention aus Zeile zum Header-Grid oben) — sonst häufen sich wieder zufällige Werte wie 700/767 an.

**Keine Spacing-/Breakpoint-Custom-Properties einführen** (kein `--bp-mobile`, `--space-md` etc.) — das wäre eine Architekturänderung, die nicht zum bestehenden "harte Werte pro Regel"-Stil passt und quer zu allen bestehenden Regeln stünde. Ausnahme nur nach expliziter Absprache mit dem Nutzer.

### Ownership-Zuschnitt für parallele Agents (nach Selektor-Präfix, nicht nach Zeilenbereich)

Zeilenbereiche verschieben sich bei jeder Änderung — Ownership läuft über CSS-Klassen-/ID-Präfixe und HTML-IDs, die pro Section eindeutig sind:

| Section | Owner-Präfixe (CSS) | HTML-Anker |
|---|---|---|
| Header/Nav | `.crt-*`, `.header-*`, `.prompt-bar*`, `.burger-btn`, `.mobile-dropdown`, `.status-*` | `header#about`, `nav.prompt-bar` |
| Timeline | `.git-*`, `.vtimeline-*` | `#timeline` |
| Ausbildung | `.k8s-*` (außer `.k8s-hud*`, siehe unten) | `#ausbildung` |
| Skills | `.accordion-*` | `#skills` |
| Projects | `.ide-*` (außer die geteilten Basis-Klassen unten) | `#projects` |
| Contact/Footer | `#contact-form`, `.socials`, `footer`-Regeln | `#contact`, `footer` |

**Geteilt/nur vom Lead-Durchgang anfassen, nicht von einzelnen Section-Agents** (sonst Konflikte, da mehrfach verwendet):
- `:root`/`body.dark` Farbvariablen (Zeilen 1–155)
- `section{}`-Basisregel (Padding/Max-Width/`scroll-margin-top`) — Zeile 545
- `.terminal-window`/`.terminal-titlebar`/`.terminal-tab`/`.terminal-body` (geteiltes Fenster-Grundgerüst, siehe Komponentenmuster oben)
- `.ide-win-btn`/`.ide-window-controls` (geteilte Fenstersteuerung, wird auch von `.k8s-hud` genutzt)
- `.modal-overlay`/`.modal-content` Basis (für die drei klassischen Modals)
- `:where(button:hover)` und generische `button{}`-Regel

**`.skills-projects-row`** ist eine Sonderzone: gehört Skills UND Projects gemeinsam (Flex-Wrapper). Änderungen daran nur im Lead-Merge-Pass, nicht durch den Skills- oder Projects-Agenten allein.

### Touch-Ziele

Interaktive Elemente auf `max-width:768px` brauchen **mindestens 44×44px** effektive Klickfläche (Padding zählt mit). Bekannter Verstoß, den der Header/Nav-Agent beheben sollte: `.burger-btn` hat aktuell nur ~30×24px (Zeile 1783, `padding:0.3rem 0.6rem` bei `font-size:0.9rem`) — Padding erhöhen oder `min-width`/`min-height:44px` setzen, ohne die optische Größe der sichtbaren `[=]`-Glyphe zu verändern.

### Referenzmuster für "Desktop-Layout → Mobile-Layout"

Diese drei bereits gebauten Lösungen sind das Vorbild für neue Anpassungen, nicht neu erfinden:
- **Fixe Höhe, interner Scroll statt Wachsen:** `.crt-screen` (300px Desktop → 400px Mobile, `overflow-y:auto`) — Vorbild für jedes andere Widget mit fester Boxgröße.
- **Sidebar → Overlay statt Nebeneinander:** `.ide-sidebar`/`ideMobileExplorerBtn` (Button blendet Sidebar als `.mobile-open`-Overlay ein/aus, schließt bei Außenklick oder Dateiauswahl unter 768px, siehe `script.js` Zeile ~397–421).
- **Grid/Flex-Row → Stack:** `.editor-container` und `.k8s-node-chain` (`grid-template-columns:1fr` bzw. `flex-direction:column` unter ihrem jeweiligen Breakpoint).

### Testen

Zusätzlich zum bestehenden Verifikations-Workflow unten: mobile Prüfung explizit bei **375px** (kleines Phone), **390px** (iPhone-Standardbreite) und **768px** (Tablet-Grenze) durchführen, nicht nur bei einer Breite — mehrere der o.g. Breakpoints (700/767/768) liegen dicht beieinander und ein einzelner Test-Viewport kann eine Lücke dazwischen verdecken.

## Bekannte Stolperfallen (aus tatsächlich gefundenen Bugs)

- **`<span>`/`<div>` ohne `display: block/flex`** ignorieren `width`/`height` komplett (CSS-Spezifikation für inline-Elemente). Bei jeder neuen Balken-/Box-Komponente `display` explizit setzen — sonst rendert die Füllung unsichtbar (0×0), wie beim Skill-Bar-Bug.
- **Globale `button:hover`-Regel** (`stylesheet.css`, ganz oben) ist inzwischen in `:where(button:hover)` / `:where(body.dark button:hover)` eingepackt — dadurch hat sie IMMER Spezifität (0,0,0) und verliert garantiert gegen jede komponenteneigene Hover-Regel mit mindestens einer Klasse. **Nicht wieder auf ein nacktes `button:hover` zurückbauen** — das führte wiederholt zu ungewollt grellen Cyan-Hover-Effekten (`.git-commit`, `.accordion-header`, `.k8s-node`, `.ide-launch-trigger` waren betroffen, `body.dark button:hover` gewann wegen zweier Element-Selektoren gegen scheinbar "spezifischere" `.klasse:hover`-Regeln). Neue Buttons mit eigenem Hover brauchen trotzdem weiterhin eine eigene `background-color`-Deklaration — die `:where()`-Regel liefert nur den *Fallback* für Buttons ganz ohne eigenen Stil.
- **Bilder in dynamisch nachgeladenem Content** (z. B. Projekt-READMEs) haben beim ersten Messen (`scrollHeight`) noch keine finale Höhe, wenn sie nicht bereits im Browser-Cache sind. Wer Layout-abhängige Werte (Zeilennummern, Höhenberechnungen) aus so einem Container berechnet, muss zusätzlich auf das `load`-Event der `<img>`-Elemente neu rechnen.
- **Firmenweite HTML-`class`-Duplikate vermeiden**: Wenn ein Ordner-Button in HTML schon `class="... open"` trägt, muss die zugehörige `.ide-folder-contents` auch `class="... expanded"` tragen (oder JS synct es defensiv beim Init) — sonst zeigt der Button einen Zustand, den das zugehörige Element nicht wirklich hat.
- **Datenschutz:** nie private Adresse/Telefonnummer/Geburtsdatum aus der privaten Bewerbungsmappe auf die öffentliche Seite übernehmen, auch wenn die Quelle sie enthält. Nur öffentlich-sichere/berufliche Fakten.
- **Edit-Tool bei sehr langen `old_string`-Blöcken mit Sonderzeichen (Pfeile `→`, Gedankenstriche `—`)**: Ein einzelner riesiger Such-Ersetze-Block über mehrere hundert Zeilen kann mit "String to replace not found" fehlschlagen, obwohl der angezeigte Text exakt übereinstimmt (vermutlich Unicode-Normalisierungs-Differenz an einer Stelle, nicht direkt lokalisierbar). Lösung: Funktion zunächst per kleinem Edit umbenennen (z. B. `...OLD`) um sie sicher zu isolieren, dann per kleinem Node-Skript (`fs.readFileSync().split('\n')`, `Array.splice(startIdx, count)`, `writeFileSync`) über exakte Zeilennummern löschen, statt den ganzen alten Code-Block als `old_string` zu übergeben. Kleinere Edits (einzelne Funktionssignaturen, kurze Blöcke) sind davon nicht betroffen.

## Verifikations-Workflow

1. Lokalen Static-Server prüfen (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8934/index.html` sollte `200` liefern; falls nicht, neu starten).
2. Playwright-Skript im Scratchpad-Verzeichnis schreiben, das die neue Funktionalität gezielt testet (Klicks, Theme-Toggle, Konsolenfehler, Screenshots).
3. `final-smoke2.js` (volles Durchscrollen + Theme-Toggle + CRT-Easter-Egg + Explorer-Interaktion) am Ende jeder Runde erneut laufen lassen, um Regressionen an unveränderten Bereichen auszuschließen.
4. Screenshots visuell gegenlesen, nicht nur auf "0 Konsolenfehler" vertrauen — mehrere echte Bugs (Skill-Bar-Bug, Button-Hover-Bug, Zeilennummern-Bug) waren nur im Screenshot sichtbar, nicht in der Konsole.
