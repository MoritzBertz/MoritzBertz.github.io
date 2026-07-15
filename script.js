// ========================= //
// Dark Mode Toggle
// ========================= //
function toggleDarkMode() {
  const body = document.body;
  const darkModeButton = document.querySelector('.static-menu a[onclick="toggleDarkMode()"]');

  body.classList.toggle('dark');
  const isDarkMode = body.classList.contains('dark');

  darkModeButton.textContent = isDarkMode ? 'Light Theme' : 'Dark Theme';
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');

  const timelineDots = document.querySelectorAll('.timeline-item .timeline-dot');
  const timelineLabels = document.querySelectorAll('.timeline-item .timeline-label');
  timelineDots.forEach(dot => {
    dot.style.background = isDarkMode ? '#00bcd4' : 'hsl(29, 89%, 43%)';
    dot.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    resetAnimation(dot);
  });
  timelineLabels.forEach(label => {
    label.style.color = isDarkMode ? '#00bcd4' : 'hsl(29, 89%, 43%)';
    label.style.transition = 'color 0.3s ease';
    resetAnimation(label);
  });

  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    modalContent.style.backgroundColor = isDarkMode ? '#111' : '#ffffff';
    modalContent.style.color = isDarkMode ? '#fff' : '#000';
  }
}

function resetAnimation(element) {
  element.style.animation = 'none';
  void element.offsetWidth; // Trigger reflow to reset the animation
  element.style.animation = '';
}

// ========================= //
// Tech List (Grundlagen-Section)
// ========================= //
function initializeTechList() {
  const techListItems = document.querySelectorAll('.tech-list li');
  const techTitle = document.getElementById('tech-title');
  const techDetails = document.getElementById('tech-details');

  const techDescriptions = {
    itGrundlagen: `Ich habe ein solides Fundament in den IT-Basics aufgebaut. Dazu gehörten Themen wie die Funktionsweise von Betriebssystemen (Windows 10/11, Windows Server 2022, Linux Ubuntu), Dateisysteme (NTFS, FAT32), Virtualisierung mit Hyper-V, sowie der Aufbau von Client-Server-Strukturen. Besonders hilfreich war der Umgang mit PowerShell zur grundlegenden Systemsteuerung sowie das Verständnis der ITIL-Grundlagen zur Strukturierung von IT-Diensten.`,
    netzwerk: `Ich habe Netzwerke geplant, eingerichtet und erste Fehleranalysen durchgeführt. In Übungen habe ich IP-Adressierung, Subnetting und VLAN-Konzepte mit Switches und Routern simuliert, u. a. mit Packet Tracer. Auch DHCP- und DNS-Dienste habe ich mit Windows Server 2022 eingerichtet. Mit Tools wie Wireshark konnte ich den Netzwerkverkehr analysieren. Die praktische Umsetzung des OSI-Modells und die Konfiguration kleiner LAN-Strukturen gehören jetzt zu meinem Repertoire.`,
    sicherheit: `Mein Einstieg in die IT-Sicherheit erfolgte über Benutzerrechte, Gruppenrichtlinien (GPOs) und das Prinzip der minimalen Berechtigungen. Ich habe gelernt, wie man mit Windows Defender, BitLocker und Firewall-Regeln grundlegende Schutzmaßnahmen etabliert. Auch Themen wie Zwei-Faktor-Authentifizierung, Verschlüsselung (TLS/SSL) und Datenschutz nach DSGVO habe ich behandelt. Tools wie SecPol.msc und AD-Gruppenrichtlinien kamen regelmäßig zum Einsatz.`,
    programmieren: `Ich habe erste Automatisierungsskripte mit PowerShell geschrieben, z. B. für das Anlegen von Benutzerkonten oder das Erstellen von Backup-Routinen. In Python konnte ich kleinere Programme mit if-Bedingungen, Schleifen und Funktionen schreiben. Auch JavaScript habe ich verwendet – zunächst im Kontext einfacher Webseiteninteraktion (DOM-Manipulation). Visual Studio Code war dabei meine zentrale Entwicklungsumgebung. Git habe ich für Versionskontrolle in kleinen Projekten ausprobiert.`,
    datenbanken: `Ich habe relationale Datenbanken wie MySQL und Microsoft SQL Server kennengelernt. Erste Erfahrungen sammelte ich mit dem Anlegen von Tabellen, dem Setzen von Primär- und Fremdschlüsseln sowie dem Schreiben einfacher SQL-Abfragen (SELECT, JOIN, INSERT). Mit phpMyAdmin und SSMS konnte ich Datenbanken grafisch verwalten. Zusätzlich habe ich gelernt, wie man Backups erstellt, Benutzerrechte verwaltet und Datenbankmodelle dokumentiert – z. B. mit MySQL Workbench.`
  };

  techListItems.forEach(item => {
    item.addEventListener('click', () => {
      techListItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const techKey = item.getAttribute('data-tech');
      techTitle.textContent = item.textContent;
      techDetails.textContent = techDescriptions[techKey] || "Keine Beschreibung verfügbar.";
    });
  });

  const firstTechKey = techListItems[0].getAttribute('data-tech');
  techListItems[0].classList.add('active');
  techTitle.textContent = techListItems[0].textContent;
  techDetails.textContent = techDescriptions[firstTechKey] || "Keine Beschreibung verfügbar.";
}

// ========================= //
// Skill Bars (Füllstand-Animation beim Scrollen ins Bild)
// ========================= //
function initializeSkillBars() {
  const skillBars = document.querySelectorAll('#skills .bar');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const percent = bar.getAttribute('data-percent');
        const barDiv = bar.querySelector('div');

        barDiv.style.setProperty('--target-width', percent + '%');
        barDiv.classList.add('animate');

        let currentPercent = 0;
        const duration = 1500;
        const startTime = performance.now();

        function updatePercent(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          currentPercent = Math.round(easeOut * percent);
          barDiv.textContent = currentPercent + '%';

          if (progress < 1) {
            requestAnimationFrame(updatePercent);
          } else {
            barDiv.textContent = percent + '%';
          }
        }

        requestAnimationFrame(updatePercent);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => observer.observe(bar));
}

// Klick auf eine Skill-Bar öffnet/schließt die Detail-Liste darunter
function initializeSkillBarDetails() {
  const skillBars = document.querySelectorAll('#skills .bar');
  let activeDetails = null;
  let activeSkill = null;

  skillBars.forEach(bar => {
    bar.addEventListener('click', function () {
      const skill = this.parentElement;
      const details = skill.querySelector('.skill-details');

      // Mobile-Tooltip nur bei der ersten Skill-Bar ausblenden
      const tooltip = skill.querySelector('.mobile-tooltip');
      if (tooltip) {
        tooltip.classList.add('hidden');
      }

      // Bereits geöffnete Details desselben Skills schließen
      if (activeDetails === details) {
        details.classList.remove('active');
        skill.classList.remove('expanded');
        activeDetails = null;
        activeSkill = null;
        return;
      }

      // Andere geöffnete Details schließen
      if (activeDetails) {
        activeDetails.classList.remove('active');
        activeSkill.classList.remove('expanded');
      }

      details.classList.add('active');
      skill.classList.add('expanded');
      activeDetails = details;
      activeSkill = skill;
    });
  });

  // Details schließen, wenn außerhalb geklickt wird
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.skill') && activeDetails) {
      activeDetails.classList.remove('active');
      activeSkill.classList.remove('expanded');
      activeDetails = null;
      activeSkill = null;
    }
  });
}

// Verschiebt das Skill-Label in die Bar hinein und blendet es nach der Füll-Animation ein
function initializeSkillLabels() {
  document.querySelectorAll('#skills .bar').forEach(bar => {
    const skill = bar.parentElement;
    const descriptionSpan = skill.querySelector('span');

    if (descriptionSpan) {
      bar.appendChild(descriptionSpan);
      descriptionSpan.style.position = 'absolute';
      descriptionSpan.style.left = '10px';
      descriptionSpan.style.top = '50%';
      descriptionSpan.style.transform = 'translateY(-50%)';
      descriptionSpan.style.opacity = '0';
      descriptionSpan.style.transition = 'opacity 0.5s ease-in-out';
    }

    const barDiv = bar.querySelector('div');
    barDiv.addEventListener('animationend', () => {
      if (descriptionSpan) {
        descriptionSpan.style.opacity = '1';
      }
    });
  });
}

// ========================= //
// Paragraph-Slider (Über Mich)
// ========================= //
function initializeParagraphSlider() {
  const paragraphs = document.querySelectorAll('#paragraph-slider .paragraph');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dotsContainer = document.getElementById('slider-dots');
  let currentIndex = 0;

  // Indikator-Punkte dynamisch entsprechend der Anzahl der Absätze erzeugen
  if (dotsContainer) {
    paragraphs.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Abschnitt ${index + 1} anzeigen`);
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateParagraphs();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

  function updateParagraphs() {
    paragraphs.forEach((p, index) => {
      p.classList.toggle('active', index === currentIndex);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + paragraphs.length) % paragraphs.length;
      updateParagraphs();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % paragraphs.length;
      updateParagraphs();
    });
  }

  updateParagraphs();
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
// Burger-Menü
// ========================= //
function toggleMenu() {
  const menu = document.querySelector('.static-menu ul');
  const burger = document.querySelector('.burger-menu');
  menu.classList.toggle('active');
  burger.classList.toggle('active');
}

document.addEventListener('click', (e) => {
  const menu = document.querySelector('.static-menu ul');
  const burger = document.querySelector('.burger-menu');
  if (menu.classList.contains('active') && !menu.contains(e.target) && !burger.contains(e.target)) {
    menu.classList.remove('active');
    burger.classList.remove('active');
  }
});

// ========================= //
// Modals
// ========================= //
function openModal() {
  document.getElementById("iframeModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("iframeModal").style.display = "none";
}

function openAbschlussModal(event) {
  if (event) event.stopPropagation(); // Verhindert, dass die Projektkarte gleichzeitig zurückflippt
  document.getElementById("abschlussprojektModal").style.display = "flex";
}

function closeAbschlussModal() {
  document.getElementById("abschlussprojektModal").style.display = "none";
}

function openDokuModal(event) {
  if (event) event.stopPropagation();
  document.getElementById("dokuModal").style.display = "flex";
}

function closeDokuModal() {
  document.getElementById("dokuModal").style.display = "none";
}

// ========================= //
// Projekt-Karten (Flip)
// ========================= //
function initializeProjectCards() {
  document.querySelectorAll('.card-container').forEach(container => {
    container.addEventListener('click', function (e) {
      if (e.target.closest('.nav-bar')) return;
      this.querySelector('.card').classList.toggle('flipped');
    });
  });
}

// ========================= //
// Timeline (Meilensteine)
// ========================= //
function initializeTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  const modalEl = document.getElementById('timelineModal');
  if (!modalEl || timelineItems.length === 0) return;

  const modal = new bootstrap.Modal(modalEl);
  const modalTitle = document.getElementById('timelineModalLabel');
  const modalBody = document.getElementById('timelineModalBody');

  timelineItems.forEach(item => {
    item.addEventListener('click', () => {
      const year = item.getAttribute('data-year');
      const title = item.getAttribute('data-title');
      const description = item.getAttribute('data-description');

      modalTitle.textContent = `${year} – ${title}`;
      modalBody.textContent = description;
      modal.show();
    });
  });

  const timelineDots = document.querySelectorAll('.timeline-item .timeline-dot');
  modalEl.addEventListener('hidden.bs.modal', () => {
    timelineDots.forEach(dot => resetAnimation(dot));
  });
}

// ========================= //
// Umschulungsverlauf (Scroll-Reveal)
// ========================= //
function initializeAusbildungReveal() {
  const items = document.querySelectorAll('.ausbildungs-item');
  if (items.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => observer.observe(item));
}

// ========================= //
// Smooth-Scroll Navigation
// ========================= //
function initializeNavScroll() {
  document.querySelectorAll('.static-menu a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ========================= //
// Dark-Mode-Status beim Laden wiederherstellen
// ========================= //
function initializeDarkModeState() {
  const body = document.body;
  const darkModeButton = document.querySelector('.static-menu a[onclick="toggleDarkMode()"]');

  // Dark Mode ist der Standard, außer der Nutzer hat aktiv auf Light Theme umgeschaltet
  if (localStorage.getItem('darkMode') !== 'disabled') {
    body.classList.add('dark');
    darkModeButton.textContent = 'Light Theme';
  } else {
    darkModeButton.textContent = 'Dark Theme';
  }
}

// ========================= //
// Initialisierung
// ========================= //
document.addEventListener('DOMContentLoaded', () => {
  initializeDarkModeState();
  initializeTechList();
  initializeSkillBars();
  initializeSkillBarDetails();
  initializeSkillLabels();
  initializeParagraphSlider();
  initializeContactForm();
  initializeProjectCards();
  initializeTimeline();
  initializeAusbildungReveal();
  initializeNavScroll();
});
