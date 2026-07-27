// ========================= //
// Zentrale About-Me-Fakten — einzige Quelle für die whoami-Boot-Sequenz UND
// den CRT-Pentest-Scan (".well-known/about-me"-Payload). Keine zweite Kopie.
// ========================= //
const ABOUT_ME = {
  name: 'Moritz Bertz',
  role: 'Fachinformatiker für Systemintegration',
  focus: ['Netzwerke', 'Automatisierung', 'IaC'],
  stack: ['Terraform', 'PowerShell', 'Active Directory', 'GitLab CI/CD'],
  status: 'open_to_work',
  availableFrom: 'sofort',
  location: 'Remote (DE) / Ludwigshafen',
};

const ABOUT_LINES = [
  'Fachinformatiker für Systemintegration.',
  'Fokus: Netzwerke, Automatisierung, digitale Infrastruktur.',
  'Praxis: Windows-Server, Active Directory, Virtualisierung, IT-Sicherheit.',
  'Kommunikativ, kundenorientiert, teamfähig — inkl. 1st-/2nd-Level-Support.',
  'Ziel: sichere, automatisierte Infrastrukturen konsequent weiterdenken.',
];

// ========================= //
// Gemeinsame Zeilen-Reinflug-Animation (.reveal-line / .crt-line teilen sich
// dasselbe @keyframes crt-line-fade-in) — für Elemente, die bereits alle im
// DOM stehen und nur nacheinander gestaffelt eingeblendet werden sollen,
// statt wie im CRT-Screen zeitversetzt per setTimeout angehängt zu werden.
// ========================= //
function revealLines(elements, stepMs) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  elements.forEach((el, i) => {
    el.classList.add('reveal-line');
    if (reduceMotion) {
      el.style.animation = 'none';
      el.style.opacity = '1';
    } else {
      el.style.animationDelay = (i * stepMs) + 'ms';
    }
  });
}

// ========================= //
// Status-Card (current_status.yml) — Inhalt aus ABOUT_ME befüllen und mit
// derselben Zeilen-Reinflug-Optik wie der CRT-Screen einblenden.
// ========================= //
function initializeStatusCardReveal() {
  const body = document.getElementById('statusCardBody');
  if (!body) return;

  const nameEl = document.getElementById('statusName');
  const roleEl = document.getElementById('statusRole');
  const badgeTextEl = document.getElementById('statusBadgeText');
  const chipsEl = document.getElementById('statusChips');
  const availableEl = document.getElementById('statusAvailable');
  const locationEl = document.getElementById('statusLocation');

  if (nameEl) nameEl.textContent = ABOUT_ME.name;
  if (roleEl) roleEl.textContent = ABOUT_ME.role;
  if (badgeTextEl) badgeTextEl.textContent = ABOUT_ME.status === 'open_to_work' ? 'open to work' : ABOUT_ME.status;
  if (availableEl) availableEl.textContent = '"' + ABOUT_ME.availableFrom + '"';
  if (locationEl) locationEl.textContent = '"' + ABOUT_ME.location + '"';

  if (chipsEl) {
    ABOUT_ME.stack.forEach((tech) => {
      const chip = document.createElement('span');
      chip.className = 'git-badge';
      chip.textContent = tech;
      chipsEl.appendChild(chip);
    });
  }

  revealLines(Array.from(body.children), 90);
}

// ========================= //
// Dark Mode Toggle
// ========================= //
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark');
  const isDarkMode = body.classList.contains('dark');

  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');

  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    modalContent.style.backgroundColor = isDarkMode ? '#111' : '#ffffff';
    modalContent.style.color = isDarkMode ? '#fff' : '#000';
  }
}

// ========================= //
// Skills-Accordion — "Docker Pull"-Optik
// ========================= //
function initializeSkillsAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  function closeItem(item) {
    item.classList.remove('open');
    const header = item.querySelector('.accordion-header');
    header.setAttribute('aria-expanded', 'false');
    const icon = item.querySelector('.accordion-icon');
    if (icon) icon.textContent = '[+]';
  }

  function openItem(item) {
    item.classList.add('open');
    const header = item.querySelector('.accordion-header');
    header.setAttribute('aria-expanded', 'true');
    const icon = item.querySelector('.accordion-icon');
    if (icon) icon.textContent = '[-]';
  }

  // Immer nur ein Modul gleichzeitig offen: Klick auf ein anderes fährt das
  // vorher geöffnete automatisch wieder ein.
  let currentOpen = null;
  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      if (currentOpen && currentOpen !== item) {
        closeItem(currentOpen);
      }
      if (wasOpen) {
        closeItem(item);
        currentOpen = null;
      } else {
        openItem(item);
        currentOpen = item;
      }
    });
  });

  // Segmentierte Balken springen erst beim Sichtbarwerden auf ihren Zielwert;
  // die steps()-Transition (siehe CSS) sorgt für die "stotternde" Download-Optik.
  // Die %-Zahl daneben zählt im selben Takt (12 Schritte, 900ms) synchron mit.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BAR_DURATION_MS = 900;
  const BAR_STEPS = 12;

  function animatePercent(el, target) {
    if (reduceMotion) {
      el.textContent = target + '%';
      return;
    }
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / BAR_DURATION_MS, 1);
      const steppedProgress = Math.floor(progress * BAR_STEPS) / BAR_STEPS;
      el.textContent = Math.round(steppedProgress * target) + '%';
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + '%';
      }
    }
    requestAnimationFrame(tick);
  }

  const bars = document.querySelectorAll('.skill-bar');
  bars.forEach((bar) => {
    const percentEl = bar.parentElement.querySelector('.skill-percent');
    if (percentEl) percentEl.textContent = '0%';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const target = parseInt(bar.dataset.percent, 10);
          const fill = bar.querySelector('.skill-bar-fill');
          fill.style.width = target + '%';
          const percentEl = bar.parentElement.querySelector('.skill-percent');
          if (percentEl) animatePercent(percentEl, target);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.6 }
  );
  bars.forEach((bar) => observer.observe(bar));
}

// ========================= //
// Kontaktformular (Formspree)
// ========================= //
function initializeContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formMsg = document.getElementById('form-msg');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Wird gesendet...';
    formMsg.textContent = '';

    fetch(this.action, {
      method: 'POST',
      body: new FormData(this),
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          formMsg.textContent = 'Nachricht erfolgreich gesendet!';
          formMsg.style.color = 'green';
          this.reset();
        } else {
          throw new Error('Netzwerk-Antwort war nicht ok');
        }
      })
      .catch(() => {
        formMsg.textContent = 'Fehler beim Senden der Nachricht. Bitte versuche es später erneut.';
        formMsg.style.color = 'red';
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Senden';
      });
  });
}

// ========================= //
// Modals — Windows-Fenster-Look mit Scale/Fade-Öffnen-Animation
// ========================= //
const modalCloseTimers = {};

function openOverlayModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  clearTimeout(modalCloseTimers[id]);
  overlay.hidden = false;
  document.body.classList.add('ide-overlay-open'); // sperrt die Hintergrundseite, wie bei den anderen Overlays
  void overlay.offsetWidth; // Reflow erzwingen, damit die Öffnen-Transition sicher greift
  requestAnimationFrame(() => overlay.classList.add('open'));

  function onKeydown(e) {
    if (e.key === 'Escape') closeOverlayModal(id);
  }
  overlay._onKeydown = onKeydown;
  document.addEventListener('keydown', onKeydown);

  if (!overlay._backdropBound) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlayModal(id);
    });
    overlay._backdropBound = true;
  }
}

function closeOverlayModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.classList.remove('ide-overlay-open');
  if (overlay._onKeydown) {
    document.removeEventListener('keydown', overlay._onKeydown);
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  modalCloseTimers[id] = setTimeout(() => {
    overlay.hidden = true;
  }, reduceMotion ? 0 : 250);
}

function openModal() {
  openOverlayModal('iframeModal');
}

function closeModal() {
  closeOverlayModal('iframeModal');
}

function openAbschlussModal(event) {
  if (event) event.stopPropagation(); // Verhindert, dass die Projektkarte gleichzeitig zurückflippt
  openOverlayModal('abschlussprojektModal');
}

function closeAbschlussModal() {
  closeOverlayModal('abschlussprojektModal');
}

function openDokuModal(event) {
  if (event) event.stopPropagation();
  openOverlayModal('dokuModal');
}

function closeDokuModal() {
  closeOverlayModal('dokuModal');
}

// ========================= //
// Projekt-Sektion: VS-Code-Explorer-Klon
// ========================= //
function initializeVsCodeExplorer() {
  const tree = document.getElementById('ideFileTree');
  const editorContent = document.getElementById('ideEditorContent');
  const lineNumbers = document.getElementById('ideLineNumbers');
  const breadcrumbFolder = document.getElementById('ideBreadcrumbFolder');
  const tabModified = document.getElementById('ideTabModified');
  if (!tree || !editorContent) return;

  // Ordner: rein visuelles Auf-/Zuklappen der enthaltenen README.md
  const folderButtons = tree.querySelectorAll('.ide-folder');
  folderButtons.forEach((folder) => {
    const contents = folder.nextElementSibling;
    const chevron = folder.querySelector('.ide-chevron');
    const folderIcon = folder.querySelector('.ide-folder-icon');
    // Defensiver Sync beim Laden: falls ein Ordner-Button bereits mit der
    // Klasse "open" ausgezeichnet ist, muss seine Datei-Liste das auch sein
    // (sonst wirkt der Ordner optisch offen, obwohl die README.md verborgen bleibt).
    if (folder.classList.contains('open')) {
      contents.classList.add('expanded');
    }
    folder.addEventListener('click', () => {
      const isOpen = folder.classList.toggle('open');
      folder.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      contents.classList.toggle('expanded', isOpen);
      if (chevron) chevron.className = 'bi ide-chevron ' + (isOpen ? 'bi-chevron-down' : 'bi-chevron-right');
      if (folderIcon) folderIcon.className = 'bi ide-folder-icon ' + (isOpen ? 'bi-folder2-open' : 'bi-folder');
    });
  });

  // Zeilennummern grob passend zur gerenderten Inhaltshöhe erzeugen (echte
  // Editoren zeigen eine Nummer pro Textzeile — bei gerendertem "Markdown"
  // approximieren wir das über die Content-Höhe, statt echten Umbruch zu zählen).
  // Die tatsächliche Zeilenhöhe wird gemessen statt hartcodiert geschätzt
  // (sonst endet die Nummerierung — wie zuvor beobachtet — vor dem Textende,
  // weil font-size/line-height der Zeilennummern nicht exakt der Annahme
  // entsprachen), plus ein kleiner Sicherheitspuffer.
  function renderLineNumbers() {
    const targetHeight = editorContent.scrollHeight;
    lineNumbers.innerHTML = '';
    const probe = document.createElement('div');
    probe.textContent = '1';
    lineNumbers.appendChild(probe);
    const rowHeight = probe.getBoundingClientRect().height || 18;
    const lineCount = Math.max(12, Math.ceil(targetHeight / rowHeight) + 3);
    lineNumbers.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= lineCount; i++) {
      const row = document.createElement('div');
      row.textContent = i;
      frag.appendChild(row);
    }
    lineNumbers.appendChild(frag);
  }

  const fileButtons = Array.from(tree.querySelectorAll('.ide-file'));
  function openFile(fileBtn, { focus = false } = {}) {
    const projectId = fileBtn.dataset.project;
    const template = document.getElementById('tpl-' + projectId);
    if (!template) return;

    fileButtons.forEach((btn) => btn.classList.toggle('active', btn === fileBtn));

    editorContent.innerHTML = '';
    editorContent.appendChild(template.content.cloneNode(true));
    renderLineNumbers();

    // Bilder laden asynchron nach eigenem Tempo — die erste Messung passiert,
    // bevor sie ihre endgültige Höhe eingenommen haben, sonst enden die
    // Zeilennummern zu früh. Nach jedem Bild-Load daher neu berechnen.
    editorContent.querySelectorAll('img').forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', renderLineNumbers, { once: true });
    });

    const folderLabel = fileBtn.closest('.ide-tree-item').querySelector('.ide-folder').textContent.trim();
    if (breadcrumbFolder) breadcrumbFolder.textContent = folderLabel;

    // kurzes "modified"-Aufblitzen beim Öffnen einer anderen Datei, wie ein
    // ungespeicherter Tab in VS Code
    if (tabModified) {
      tabModified.style.opacity = '1';
      clearTimeout(openFile._t);
      openFile._t = setTimeout(() => { tabModified.style.opacity = '0.35'; }, 900);
    }

    if (focus) fileBtn.focus({ preventScroll: true });
  }

  fileButtons.forEach((btn) => {
    btn.addEventListener('click', () => openFile(btn));
  });

  // Editor-Inhalt kommt ausschließlich aus den <template>-Blöcken, das HTML
  // lässt #ideEditorContent bewusst leer — die erste (bereits als "active"
  // markierte) Datei muss beim Laden also explizit geöffnet werden.
  const initialFile = tree.querySelector('.ide-file.active') || fileButtons[0];
  if (initialFile) openFile(initialFile);
  window.addEventListener('resize', renderLineNumbers);

  // Mobile: Explorer als Overlay ein-/ausblenden
  const sidebar = document.getElementById('ideSidebar');
  const mobileBtn = document.getElementById('ideMobileExplorerBtn');
  if (sidebar && mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('mobile-open');
      mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Datei-Auswahl auf Mobile schließt den Explorer wieder
    fileButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('mobile-open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth > 768) return;
      if (!sidebar.classList.contains('mobile-open')) return;
      if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// ========================= //
// Launcher-Boot-Sequenz: tippt ein paar Fake-Zeilen ins launcher.sh-Terminal,
// bevor die "load projects?"-Bestätigung erscheint — gleiche Zeichen-für-
// Zeichen-Technik wie playBootSequence() im CRT-Monitor (rAF statt
// setInterval, respektiert prefers-reduced-motion).
// ========================= //
function initializeLauncherBoot() {
  const linesEl = document.getElementById('ideLauncherLines');
  const trigger = document.getElementById('ideLaunchTrigger');
  if (!linesEl || !trigger) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BOOT_LINES = [
    { text: '$ ls -la ./projects', cls: '' },
    { text: 'drwxr-xr-x  8 folders found', cls: 'ide-punct' },
    { text: '$ checking dependencies...', cls: '' },
    { text: '[OK] explorer module ready', cls: 'ide-ok' },
  ];

  function revealTrigger() {
    trigger.hidden = false;
    trigger.focus({ preventScroll: true });
  }

  if (reduceMotion) {
    BOOT_LINES.forEach(({ text, cls }) => {
      const div = document.createElement('div');
      div.className = 'ide-line' + (cls ? ' ' + cls : '');
      div.textContent = text;
      linesEl.appendChild(div);
    });
    revealTrigger();
    return;
  }

  const CHAR_MS = 14;
  const LINE_GAP_MS = 220;
  let lineIndex = 0;

  function typeNextLine() {
    if (lineIndex >= BOOT_LINES.length) {
      setTimeout(revealTrigger, LINE_GAP_MS);
      return;
    }
    const { text, cls } = BOOT_LINES[lineIndex];
    const div = document.createElement('div');
    div.className = 'ide-line' + (cls ? ' ' + cls : '');
    linesEl.appendChild(div);
    let charIndex = 0;
    let start = null;
    function frame(ts) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const target = Math.min(text.length, Math.floor(elapsed / CHAR_MS));
      if (target > charIndex) {
        charIndex = target;
        div.textContent = text.slice(0, charIndex);
      }
      if (charIndex < text.length) {
        requestAnimationFrame(frame);
      } else {
        lineIndex++;
        setTimeout(typeNextLine, LINE_GAP_MS);
      }
    }
    requestAnimationFrame(frame);
  }

  typeNextLine();
}

// ========================= //
// Projekt-Sektion: Launcher-Terminal öffnet das VS-Code-Fenster als Overlay
// ========================= //
function initializeProjectsLauncher() {
  const trigger = document.getElementById('ideLaunchTrigger');
  const overlay = document.getElementById('ideWindowOverlay');
  const backdrop = document.getElementById('ideOverlayBackdrop');
  const closeBtn = document.getElementById('ideWinCloseBtn');
  if (!trigger || !overlay || !backdrop || !closeBtn) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLOSE_ANIMATION_MS = reduceMotion ? 0 : 280;
  let closeTimer = null;

  function openWindow() {
    clearTimeout(closeTimer);
    overlay.hidden = false;
    backdrop.hidden = false;
    // Hintergrundseite sperren: verhindert, dass die Seite hinter dem Overlay
    // mitscrollt, und macht das Fenster sofort per Mausrad scrollbar, ohne
    // dass man vorher erst hineinklicken muss.
    document.body.classList.add('ide-overlay-open');
    // Reflow erzwingen, damit die hidden -> sichtbar Umschaltung nicht mit der
    // anschließenden .open-Transition verschmilzt (sonst kein Scale/Fade zu sehen).
    void overlay.offsetWidth;
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      backdrop.classList.add('open');
    });
    document.addEventListener('keydown', onKeydown);
    closeBtn.focus({ preventScroll: true });
  }

  function closeWindow() {
    overlay.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('ide-overlay-open');
    document.removeEventListener('keydown', onKeydown);
    closeTimer = setTimeout(() => {
      overlay.hidden = true;
      backdrop.hidden = true;
    }, CLOSE_ANIMATION_MS);
    trigger.focus({ preventScroll: true });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeWindow();
  }

  trigger.addEventListener('click', openWindow);
  closeBtn.addEventListener('click', closeWindow);
  backdrop.addEventListener('click', closeWindow);
}

// ========================= //
// Split-Pane-Timeline (Berufserfahrung) — Git-Log (links) + Terminal-Output (rechts)
// ========================= //
// Die Stationen werden nicht in JS gehalten, sondern per data-* Attribute direkt
// an den Buttons in #gitLogList definiert (siehe index.html) — die Liste ist damit
// nur logisch (per Klick/JS), nicht physisch mit dem rechten Panel verknüpft.
function initializeGitTimeline() {
  const list = document.getElementById('gitLogList');
  const fileEl = document.getElementById('gitTimelineFilename');
  const titleEl = document.getElementById('gitTimelineTitle');
  const orgEl = document.getElementById('gitTimelineOrg');
  const badgesEl = document.getElementById('gitTimelineBadges');
  const descEl = document.getElementById('gitTimelineDesc');
  const diffEl = document.getElementById('gitDiffFlash');
  if (!list || !fileEl || !titleEl || !orgEl || !badgesEl || !descEl || !diffEl) return;

  const buttons = Array.from(list.querySelectorAll('.git-commit'));
  if (!buttons.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let typeTimer = null;
  let typeStartTimer = null;

  // Tippt den Beschreibungstext zeichenweise ein (Terminal-/Log-Gefühl). Die
  // blinkende Schreibmarke (.is-typing) bleibt bewusst auch nach Abschluss des
  // Tippens am Satzende stehen (echter Terminal-Cursor-Look), statt nach dem
  // letzten Zeichen zu verschwinden.
  function typewriter(el, text) {
    clearTimeout(typeTimer);
    el.classList.add('is-typing');
    if (reduceMotion) {
      el.textContent = text;
      return;
    }
    el.textContent = '';
    let i = 0;
    const CHARS_PER_TICK = 3;
    function tick() {
      i += CHARS_PER_TICK;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        typeTimer = setTimeout(tick, 10);
      }
    }
    tick();
  }

  function activate(btn, { focus = false } = {}) {
    buttons.forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('active', isActive);
      if (isActive) {
        b.setAttribute('aria-current', 'true');
      } else {
        b.removeAttribute('aria-current');
      }
    });

    fileEl.textContent = btn.dataset.file || '';
    titleEl.textContent = btn.dataset.title || '';
    orgEl.textContent = `${btn.dataset.org || ''} · ${btn.dataset.period || ''}`;

    badgesEl.innerHTML = '';
    (btn.dataset.badges || '').split(',').filter(Boolean).forEach((label) => {
      const span = document.createElement('span');
      span.className = 'git-badge';
      span.textContent = `[${label.trim()}]`;
      badgesEl.appendChild(span);
    });

    // Diff-Effekt: grüner "+ Added: ..."-Hinweis blitzt auf und bleibt danach
    // dauerhaft stehen (wie ein "Added"-Haken über der Beschreibung), statt
    // nach kurzer Zeit wieder zu verschwinden.
    clearTimeout(typeStartTimer);
    diffEl.textContent = btn.dataset.diff || '';
    diffEl.classList.remove('is-visible');
    void diffEl.offsetWidth; // Reflow erzwingen, damit die Transition bei schnellem Wechsel neu startet
    diffEl.classList.add('is-visible');

    const desc = btn.dataset.desc || '';
    if (reduceMotion) {
      descEl.textContent = desc;
    } else {
      typeStartTimer = setTimeout(() => typewriter(descEl, desc), 300);
    }

    if (focus) btn.focus({ preventScroll: true });
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => activate(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activate(buttons[Math.min(buttons.length - 1, i + 1)], { focus: true });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activate(buttons[Math.max(0, i - 1)], { focus: true });
      }
    });
  });

  activate(buttons[0]);
}

// ========================= //
// Education: Kubernetes Cluster Topology — Pod Inspector HUD
// ========================= //
function initializeK8sTopology() {
  const nodes = document.querySelectorAll('.k8s-node');
  const hud = document.getElementById('k8sHud');
  const hudBackdrop = document.getElementById('k8sHudBackdrop');
  const hudClose = document.getElementById('k8sHudClose');
  const hudTab = document.getElementById('k8sHudTab');
  const hudYaml = document.getElementById('k8sHudYaml');
  if (!nodes.length || !hud || !hudBackdrop || !hudClose || !hudTab || !hudYaml) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLOSE_ANIMATION_MS = reduceMotion ? 0 : 250;
  let closeTimer = null;
  let lastTrigger = null;

  function addYamlLine(key, value, indent) {
    const div = document.createElement('div');
    div.className = 'k8s-yaml-line' + (indent ? ' indent' : '');
    const keyEl = document.createElement('span');
    keyEl.className = 'yaml-key';
    keyEl.textContent = key;
    const punctEl = document.createElement('span');
    punctEl.className = 'yaml-punct';
    punctEl.textContent = ': ';
    const valueEl = document.createElement('span');
    valueEl.className = 'yaml-string';
    valueEl.textContent = value;
    div.append(keyEl, punctEl, valueEl);
    hudYaml.appendChild(div);
    return div;
  }

  function renderPod(btn) {
    const d = btn.dataset;
    hudTab.textContent = d.node + '.yaml';
    hudYaml.innerHTML = '';

    // Prominente Kopfzeile: Titel, Institution und Zeitraum sollen auf einen
    // Blick erkennbar sein, statt zwischen gleich formatierten YAML-Zeilen
    // unterzugehen — dafür eigene, größere/hellere Darstellung oberhalb des
    // restlichen YAML-Blocks.
    const headline = document.createElement('div');
    headline.className = 'k8s-hud-headline';

    const titleEl = document.createElement('div');
    titleEl.className = 'k8s-hud-headline-title';
    titleEl.textContent = d.title;

    const metaRow = document.createElement('div');
    metaRow.className = 'k8s-hud-headline-meta';

    const orgEl = document.createElement('span');
    orgEl.innerHTML = '<i class="bi bi-building"></i> ';
    orgEl.append(d.org);

    const periodEl = document.createElement('span');
    periodEl.innerHTML = '<i class="bi bi-calendar3"></i> ';
    periodEl.append(d.period);

    metaRow.append(orgEl, periodEl);
    headline.append(titleEl, metaRow);
    hudYaml.appendChild(headline);

    addYamlLine('apiVersion', 'v1');
    addYamlLine('kind', 'Pod');

    const metaLine = document.createElement('div');
    metaLine.className = 'k8s-yaml-line';
    const metaKey = document.createElement('span');
    metaKey.className = 'yaml-key';
    metaKey.textContent = 'metadata';
    const metaPunct = document.createElement('span');
    metaPunct.className = 'yaml-punct';
    metaPunct.textContent = ':';
    metaLine.append(metaKey, metaPunct);
    hudYaml.appendChild(metaLine);

    addYamlLine('name', d.node, true);

    const statusLine = document.createElement('div');
    statusLine.className = 'k8s-yaml-line';
    const statusKey = document.createElement('span');
    statusKey.className = 'yaml-key';
    statusKey.textContent = 'status';
    const statusPunct = document.createElement('span');
    statusPunct.className = 'yaml-punct';
    statusPunct.textContent = ': ';
    const statusValue = document.createElement('span');
    statusValue.className = 'k8s-status-value';
    statusValue.textContent = d.status;
    statusLine.append(statusKey, statusPunct, statusValue);
    hudYaml.appendChild(statusLine);

    const logLine = document.createElement('div');
    logLine.className = 'k8s-log-line';
    logLine.textContent = '> ' + d.details;
    hudYaml.appendChild(logLine);
  }

  function openHud(btn) {
    lastTrigger = btn;
    renderPod(btn);
    clearTimeout(closeTimer);
    hud.hidden = false;
    hudBackdrop.hidden = false;
    document.body.classList.add('k8s-hud-locked');
    void hud.offsetWidth;
    requestAnimationFrame(() => {
      hud.classList.add('open');
      hudBackdrop.classList.add('open');
    });
    document.addEventListener('keydown', onKeydown);
    hudClose.focus({ preventScroll: true });
  }

  function closeHud() {
    hud.classList.remove('open');
    hudBackdrop.classList.remove('open');
    document.body.classList.remove('k8s-hud-locked');
    document.removeEventListener('keydown', onKeydown);
    closeTimer = setTimeout(() => {
      hud.hidden = true;
      hudBackdrop.hidden = true;
    }, CLOSE_ANIMATION_MS);
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeHud();
  }

  nodes.forEach((btn) => btn.addEventListener('click', () => openHud(btn)));
  hudClose.addEventListener('click', closeHud);
  hudBackdrop.addEventListener('click', closeHud);
}

// ========================= //
// Smooth-Scroll Navigation
// ========================= //
function initializePromptBar() {
  const navLinks = document.querySelectorAll('.nav-link');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDropdown = document.getElementById('mobileDropdown');

  // Function-Deklaration (gehoistet), damit sowohl der Smooth-Scroll-Handler weiter
  // unten als auch die Burger-Logik dieselbe Funktion referenzieren können.
  function closeMobileDropdown() {
    if (!burgerBtn || !mobileDropdown) return;
    mobileDropdown.hidden = true;
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.textContent = '[=]';
  }

  function openMobileDropdown() {
    mobileDropdown.hidden = false;
    burgerBtn.setAttribute('aria-expanded', 'true');
    burgerBtn.textContent = '[x]';
  }

  // Smooth-Scroll zu den Sektionen (Desktop-Pfade + Mobile-Dropdown-Pfade)
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      closeMobileDropdown();
    });
  });

  // Scroll-Spy: aktiven Pfad per IntersectionObserver setzen (data-target statt href,
  // damit Desktop- und Mobile-Liste unabhängig von der aktuell sichtbaren Variante
  // synchron bleiben)
  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const isActive = link.dataset.target === id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  const sections = document.querySelectorAll('#about, #timeline, #skills, #ausbildung, #projects, #contact');
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((section) => navObserver.observe(section));

  // Mobile: Burger-Dropdown
  if (!burgerBtn || !mobileDropdown) return;

  burgerBtn.addEventListener('click', () => {
    const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMobileDropdown(); else openMobileDropdown();
  });

  document.addEventListener('click', (e) => {
    const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen && !mobileDropdown.contains(e.target) && !burgerBtn.contains(e.target)) {
      closeMobileDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
      closeMobileDropdown();
      burgerBtn.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileDropdown();
  });
}

// ========================= //
// CRT-Monitor / About-Section — permanenter Terminal-Bildschirm mit
// Menue-Navigation (klicken oder tippen) + Live-Pentest-Scan als Easter Egg.
// ========================= //
function initializeAboutCrtMonitor() {
  const monitor = document.getElementById('crtMonitor');
  const screen = document.getElementById('crtScreen');
  const termInput = document.getElementById('crtTerminalInput');
  const statusbar = document.getElementById('crtStatusbar');
  const powerBtn = document.getElementById('crtPowerBtn');
  if (!monitor || !screen || !termInput) return;

  const POWER_ON_MS = 620;
  let scanTimers = [];
  let scanRafs = [];
  let scanning = false;

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clearScreen() {
    scanTimers.forEach(clearTimeout);
    scanTimers = [];
    scanRafs.forEach((id) => cancelAnimationFrame(id));
    scanRafs = [];
    scanning = false;
    screen.textContent = '';
  }

  function addLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'crt-line' + (cls ? ' ' + cls : '');
    div.textContent = text === '' ? ' ' : text;
    screen.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
    return div;
  }

  function addNode(node) {
    node.classList.add('crt-line');
    screen.appendChild(node);
    screen.scrollTop = screen.scrollHeight;
    return node;
  }

  function addMenuItem(key, label, hint, onSelect) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'crt-menu-item';
    btn.textContent = '  ' + key + ') ' + label + (hint ? '    - ' + hint : '');
    btn.addEventListener('click', onSelect);
    addNode(btn);
    return btn;
  }

  function addBackHint() {
    addLine('');
    addMenuItem('0', 'menu', 'zurueck', renderMenu);
  }

  // Tippt die Boot-Zeilen zeichenweise ein (rAF-gesteuert, wie beim
  // whoami-Boot im Header) statt sie als ganze Zeile einblenden zu lassen —
  // soll wie ein echtes bootendes Terminal wirken.
  function playBootSequence(onDone) {
    clearScreen();
    if (reduceMotion()) {
      onDone();
      return;
    }
    const bootLines = [
      'BERTZ-IAC TERMINAL v1.0',
      '[ OK ] display initialized',
      '[ OK ] shell loaded',
      '[ OK ] session established',
    ];
    const CHAR_MS = 12;
    const LINE_GAP_MS = 130;
    let lineIndex = 0;

    function typeNextLine() {
      if (lineIndex >= bootLines.length) {
        const t = setTimeout(onDone, LINE_GAP_MS + 150);
        scanTimers.push(t);
        return;
      }
      const text = bootLines[lineIndex];
      const div = addLine('', lineIndex === 0 ? '' : 'crt-dim');
      let charIndex = 0;
      let start = null;
      function frame(ts) {
        if (start === null) start = ts;
        const elapsed = ts - start;
        const target = Math.min(text.length, Math.floor(elapsed / CHAR_MS));
        if (target > charIndex) {
          charIndex = target;
          div.textContent = text.slice(0, charIndex);
        }
        if (charIndex < text.length) {
          scanRafs.push(requestAnimationFrame(frame));
        } else {
          lineIndex++;
          const t = setTimeout(typeNextLine, LINE_GAP_MS);
          scanTimers.push(t);
        }
      }
      scanRafs.push(requestAnimationFrame(frame));
    }

    typeNextLine();
  }

  function renderMenu() {
    clearScreen();
    if (statusbar) statusbar.textContent = 'status: idle';
    addLine('$ whoami');
    addLine('name = "' + ABOUT_ME.name + '"', 'crt-dim');
    addLine('role = "' + ABOUT_ME.role + '"', 'crt-dim');
    addLine('');
    addLine('menu:');
    addMenuItem('1', 'about', 'wer ich bin', renderAbout);
    addMenuItem('2', 'stack', 'worauf ich mich fokussiere', renderStack);
    addMenuItem('3', 'contact', 'kurz Kontakt aufnehmen', renderContact);
    addMenuItem('4', 'scan', 'nmap bertz-iac.dev', startScan);
    addLine('');
    addLine("// type 'help' for commands", 'crt-dim');
    addLine('');
    const warn = document.createElement('button');
    warn.type = 'button';
    warn.className = 'crt-menu-item crt-dim';
    const warnTag = document.createElement('span');
    warnTag.className = 'crt-error';
    warnTag.textContent = '[warn]';
    warn.appendChild(warnTag);
    warn.append(' unattended session detected: nmap bertz-iac.dev (pid 1337)');
    warn.addEventListener('click', startScan);
    addNode(warn);
    screen.scrollTop = 0; // Statische Ansicht: von oben zeigen, nicht ans Ende auto-scrollen
  }

  function renderAbout() {
    clearScreen();
    addLine('$ cat about.txt');
    ABOUT_LINES.forEach((line) => addLine(line));
    addBackHint();
    screen.scrollTop = 0;
  }

  function renderStack() {
    clearScreen();
    addLine('$ cat stack.yml');
    addLine('stack = [' + ABOUT_ME.stack.map((s) => '"' + s + '"').join(', ') + ']', 'crt-dim');
    addLine('focus = [' + ABOUT_ME.focus.map((f) => '"' + f + '"').join(', ') + ']', 'crt-dim');
    addBackHint();
    screen.scrollTop = 0;
  }

  function renderContact() {
    clearScreen();
    addLine('$ cat contact.txt');
    addLine('Kurz eine Nachricht?');
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'crt-menu-item';
    link.textContent = '>_ zum Kontaktformular';
    link.addEventListener('click', () => {
      const contactSection = document.getElementById('contact');
      const nameField = document.getElementById('name');
      if (contactSection) contactSection.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
      if (nameField) nameField.focus();
    });
    addNode(link);
    addBackHint();
    screen.scrollTop = 0;
  }

  function buildCvLink() {
    const a = document.createElement('a');
    a.className = 'crt-cv-link';
    a.href = 'assets/cv/Moritz_Bertz_CV.pdf';
    a.setAttribute('download', '');
    a.textContent = '>_ ./resume.pdf herunterladen';
    return a;
  }

  function sendMessageToContactForm(text) {
    const messageField = document.getElementById('message');
    const contactSection = document.getElementById('contact');
    const nameField = document.getElementById('name');
    if (messageField) messageField.value = text;
    renderMenu();
    if (contactSection) {
      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
        if (nameField) nameField.focus();
      }, 300);
    }
  }

  function buildMessageLine() {
    const wrap = document.createElement('div');
    wrap.className = 'crt-msg-line';
    const label = document.createElement('span');
    label.textContent = '>';
    const msgInput = document.createElement('input');
    msgInput.type = 'text';
    msgInput.className = 'crt-msg-input';
    msgInput.setAttribute('aria-label', 'Nachricht an Moritz Bertz');
    msgInput.placeholder = 'type a message to reach the human behind this box_';
    wrap.appendChild(label);
    wrap.appendChild(msgInput);
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && msgInput.value.trim()) {
        sendMessageToContactForm(msgInput.value.trim());
      }
    });
    return { wrap, input: msgInput };
  }

  function startScan() {
    clearScreen();
    scanning = true;
    if (statusbar) statusbar.textContent = 'status: scan laeuft...';

    const FAST = 70;
    const TABLE = 130;
    const PAUSE = 750;
    const QUICK = 90;

    const steps = [
      ['$ nmap -sV bertz-iac.dev', '', 0],
      ['', '', FAST],
      ['Starting scan... 1000 ports', 'crt-dim', FAST],
      ['', '', 250],
      ['PORT      STATE     SERVICE', 'crt-dim', TABLE],
      ['22/tcp    open      ssh         OpenSSH 9.2, key-only auth', '', TABLE],
      ['80/tcp    open      http        nginx -> redirects to :443', '', TABLE],
      ['443/tcp   open      https       TLS 1.3, HSTS enabled', '', TABLE],
      ['3389/tcp  closed    rdp', 'crt-error', TABLE],
      ['5432/tcp  filtered  postgres', 'crt-error', TABLE],
      ['  -> password login disabled seit 2023. kein Grund, das zu aendern.', 'crt-finding', PAUSE],
      ['', '', 400],
      ['$ curl https://bertz-iac.dev/.well-known/about-me', '', PAUSE],
      ['', '', QUICK],
      ['{', 'crt-dim', QUICK],
      ['  "name": "' + ABOUT_ME.name + '",', 'crt-dim', QUICK],
      ['  "role": "' + ABOUT_ME.role + '",', 'crt-dim', QUICK],
      ['  "focus": [' + ABOUT_ME.focus.map((f) => '"' + f + '"').join(', ') + '],', 'crt-dim', QUICK],
      ['  "status": "' + ABOUT_ME.status + '",', 'crt-dim', QUICK],
      ['  "location": "' + ABOUT_ME.location + '"', 'crt-dim', QUICK],
      ['}', 'crt-dim', QUICK],
      ['', '', 400],
      ['$ curl -s https://bertz-iac.dev/resume.pdf -o /dev/null -w "%{http_code}\\n"', '', PAUSE],
      ['200', 'crt-dim', QUICK],
      ['', '', QUICK],
      ['[found] resume.pdf - nicht versteckt, war nie versteckt.', 'crt-finding', PAUSE],
      ['__CV_LINK__', '', 300],
      ['', '', 400],
      ['$ sqlmap --url="bertz-iac.dev/contact" --level=3', '', PAUSE],
      ['[blocked] parameterized queries. nichts zu holen.', 'crt-finding crt-error', PAUSE],
      ['', '', 500],
      ['scan complete. 2 open, 1 closed, 1 filtered, 0 exploitable.', 'crt-dim', PAUSE],
      ['', '', QUICK],
      ['das Einzige, was hier offenlag, war absichtlich offen.', '', QUICK],
      ['', '', QUICK],
      ['__MSG_INPUT__', '', 300],
    ];

    let elapsed = 0;
    steps.forEach(([text, cls, delay]) => {
      elapsed += reduceMotion() ? 0 : delay;
      const t = setTimeout(() => {
        if (text === '__CV_LINK__') {
          addNode(buildCvLink());
        } else if (text === '__MSG_INPUT__') {
          const { wrap, input: msgInput } = buildMessageLine();
          addNode(wrap);
          if (statusbar) statusbar.textContent = 'status: scan abgeschlossen';
          msgInput.focus();
        } else {
          addLine(text, cls);
        }
      }, elapsed);
      scanTimers.push(t);
    });
  }

  function backToMenu() {
    if (scanning) {
      clearScreen();
      renderMenu();
    } else if (screen.firstChild) {
      renderMenu();
    }
  }

  const POWER_OFF_MS = 520; // muss zur @keyframes crt-power-off-Dauer in stylesheet.css passen
  let poweredOn = true;

  function powerOff() {
    if (!poweredOn) return;
    poweredOn = false;
    clearScreen();
    termInput.disabled = true;
    termInput.blur();
    if (statusbar) statusbar.textContent = 'status: off';
    if (!reduceMotion()) {
      monitor.classList.add('powering-off');
      setTimeout(() => {
        monitor.classList.remove('powering-off');
        monitor.classList.add('powered-off');
      }, POWER_OFF_MS);
    } else {
      monitor.classList.add('powered-off');
    }
  }

  function powerOn() {
    if (poweredOn) return;
    poweredOn = true;
    monitor.classList.remove('powered-off');
    termInput.disabled = false;
    if (!reduceMotion()) {
      monitor.classList.add('powering-on');
      setTimeout(() => monitor.classList.remove('powering-on'), POWER_ON_MS);
    }
    playBootSequence(renderMenu);
  }

  function togglePower() {
    if (poweredOn) powerOff();
    else powerOn();
  }

  termInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const cmd = termInput.value.trim().toLowerCase();
    termInput.value = '';
    if (!cmd) return;
    if (cmd === '1' || cmd === 'about') renderAbout();
    else if (cmd === '2' || cmd === 'stack') renderStack();
    else if (cmd === '3' || cmd === 'contact') renderContact();
    else if (cmd === '4' || cmd === 'scan' || cmd === 'nmap' || cmd === 'nmap bertz-iac.dev') startScan();
    else if (cmd === '0' || cmd === 'menu' || cmd === 'back') renderMenu();
    else if (cmd === 'help') addLine("verfuegbare befehle: about, stack, contact, scan, menu, help", 'crt-mut');
    else addLine('command not found: ' + cmd + " (type 'help')", 'crt-error');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === termInput) {
      backToMenu();
    }
  });

  if (powerBtn) powerBtn.addEventListener('click', togglePower);

  // Der Monitor sitzt jetzt direkt im Header — sofort sichtbar beim Laden,
  // kein Warten auf ein Scroll-Ereignis mehr nötig.
  if (!reduceMotion()) {
    monitor.classList.add('powering-on');
    setTimeout(() => monitor.classList.remove('powering-on'), POWER_ON_MS);
  }
  playBootSequence(renderMenu);

  window.__crtMonitor = { startScan, renderMenu, powerOff, powerOn, togglePower, playBootSequence };
}

// ========================= //
// Header-Terminal-Input (Prompt-Bar) — echte Befehlszeile
// ========================= //
function initializeHeaderPrompt() {
  const input = document.getElementById('ps1Input');
  const line = input ? input.closest('.ps1-line') : null;
  if (!input || !line) return;

  const output = document.createElement('div');
  output.className = 'ps1-output';
  output.hidden = true;
  line.appendChild(output);

  const HELP_LINES = ["verfügbare befehle: help, clear, whoami, ls, history, nmap bertz-iac.dev"];

  const history = [];
  let historyIndex = -1;
  let hintShown = false;

  function showOutput(lines) {
    output.textContent = '';
    lines.forEach((text) => {
      const row = document.createElement('div');
      row.textContent = text;
      output.appendChild(row);
    });
    output.hidden = false;
  }

  function hideOutput() {
    output.hidden = true;
    output.textContent = '';
  }

  function runCommand(raw) {
    const cmd = raw.trim();
    input.value = '';
    if (!cmd) return;

    history.push(cmd);
    historyIndex = history.length;

    const normalized = cmd.toLowerCase();
    if (normalized === 'help') {
      showOutput(HELP_LINES);
    } else if (normalized === 'clear') {
      hideOutput();
    } else if (normalized === 'whoami') {
      showOutput([`moritz — ${ABOUT_ME.role}`]);
    } else if (normalized === 'ls') {
      showOutput(['about  experience  education  projects  skills  contact  resume.pdf']);
    } else if (normalized === 'history') {
      showOutput(history.length > 1 ? history.slice(0, -1) : ['(leer)']);
    } else if (normalized === 'nmap bertz-iac.dev') {
      hideOutput();
      input.blur();
      const aboutSection = document.getElementById('about');
      const reduceMotionHeader = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (aboutSection) aboutSection.scrollIntoView({ behavior: reduceMotionHeader ? 'auto' : 'smooth' });
      setTimeout(() => {
        if (window.__crtMonitor) window.__crtMonitor.startScan();
      }, reduceMotionHeader ? 0 : 450);
    } else {
      showOutput([`command not found: ${cmd} (type 'help')`]);
    }
  }

  input.addEventListener('focus', () => {
    if (!hintShown) {
      hintShown = true;
      showOutput(["type 'help' for available commands"]);
    }
  });

  input.addEventListener('blur', hideOutput);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input.value);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || '';
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || '';
    } else if (e.key === 'Escape') {
      hideOutput();
      input.blur();
    }
  });
}

// ========================= //
// Dark-Mode-Status beim Laden wiederherstellen
// ========================= //
function initializeDarkModeState() {
  // Dark Mode ist der Standard, außer der Nutzer hat aktiv auf Light Theme umgeschaltet
  if (localStorage.getItem('darkMode') !== 'disabled') {
    document.body.classList.add('dark');
  }
}

// ========================= //
// Initialisierung
// ========================= //
document.addEventListener('DOMContentLoaded', () => {
  initializeDarkModeState();
  initializeSkillsAccordion();
  initializeContactForm();
  initializeVsCodeExplorer();
  initializeProjectsLauncher();
  initializeLauncherBoot();
  initializeGitTimeline();
  initializeK8sTopology();
  initializePromptBar();
  initializeAboutCrtMonitor();
  initializeHeaderPrompt();
  initializeStatusCardReveal();
});
