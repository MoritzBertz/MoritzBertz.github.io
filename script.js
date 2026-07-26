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

  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    modalContent.style.backgroundColor = isDarkMode ? '#111' : '#ffffff';
    modalContent.style.color = isDarkMode ? '#fff' : '#000';
  }
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
  initializeSkillBars();
  initializeSkillBarDetails();
  initializeSkillLabels();
  initializeParagraphSlider();
  initializeContactForm();
  initializeProjectCards();
  initializeAusbildungReveal();
  initializeNavScroll();
});
