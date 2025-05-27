// Dark Mode Toggle
function toggleDarkMode() {
  const body = document.body;
  const darkModeButton = document.querySelector('.static-menu a[onclick="toggleDarkMode()"]');

  body.classList.toggle('dark');
  const isDarkMode = body.classList.contains('dark');
  
  // Update button text based on the mode
  darkModeButton.textContent = isDarkMode ? 'Light Theme' : 'Dark Theme';

  // Save the mode in localStorage
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');

  // Dynamically update timeline styles if needed
  const timelineDots = document.querySelectorAll('.timeline-item .timeline-dot');
  const timelineLabels = document.querySelectorAll('.timeline-item .timeline-label');
  timelineDots.forEach(dot => {
    dot.style.background = isDarkMode ? '#00bcd4' : 'hsl(29, 89%, 43%)';
    dot.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    resetAnimation(dot); // Reset animation
  });
  timelineLabels.forEach(label => {
    label.style.color = isDarkMode ? '#00bcd4' : 'hsl(29, 89%, 43%)';
    label.style.transition = 'color 0.3s ease';
    resetAnimation(label); // Reset animation
  });

  // Update modal content styles
  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    modalContent.style.backgroundColor = isDarkMode ? '#111' : '#ffffff';
    modalContent.style.color = isDarkMode ? '#fff' : '#000';
  }

  // Dynamically update hover styles
  const styleSheet = document.styleSheets[0];
  const hoverRuleIndex = Array.from(styleSheet.cssRules).findIndex(rule =>
    rule.selectorText === 'button:hover' || rule.selectorText === '#about .btn-arrow:hover'
  );

  if (hoverRuleIndex !== -1) {
    const hoverRule = styleSheet.cssRules[hoverRuleIndex];
    hoverRule.style.backgroundColor = isDarkMode ? 'hsl(192, 100%, 45%)' : 'hsl(29, 89%, 53%)';
  }
}

// Function to reset animations
function resetAnimation(element) {
  element.style.animation = 'none'; // Remove the animation
  void element.offsetWidth; // Trigger reflow to reset the animation
  element.style.animation = ''; // Reapply the animation
}

// Tech List Functionality
function initializeTechList() {
  const techListItems = document.querySelectorAll('.tech-list li');
  const techTitle = document.getElementById('tech-title');
  const techDetails = document.getElementById('tech-details');

  // Beschreibungen für die Technologien
  const techDescriptions = {
    netzwerk: "Fundiertes Wissen in der Planung, Konfiguration und Administration von Netzwerkinfrastrukturen (LAN, VLAN, DHCP, DNS). Erfahrung im Umgang mit Cisco-Geräten, Firewall-Systemen sowie Netzwerküberwachung und -sicherheit.",
    programmierung: "Erfahrung in objektorientierter und skriptbasierter Programmierung, insbesondere mit Python, PowerShell und JavaScript. Entwicklung automatisierter Abläufe und kleiner Tools zur Effizienzsteigerung im Systembetrieb.",
    webentwicklung: "Kompetenz in der Umsetzung responsiver Webanwendungen mit HTML5, CSS3, JavaScript und Frameworks wie React oder Vue. Berücksichtigung von Usability, Barrierefreiheit und Performance-Optimierung.",
    datenbanken: "Sicherer Umgang mit relationalen Datenbanksystemen wie MySQL und Microsoft SQL Server. Kenntnisse in Datenmodellierung, Abfrageoptimierung (SQL) sowie Backup- und Recovery-Konzepten.",
    cloud: "Praxiswissen in der Nutzung und Verwaltung von Cloud-Diensten wie Microsoft Azure oder AWS. Erfahrung mit virtuellen Maschinen, Speicherlösungen, IAM (Identity and Access Management) und Automatisierung über IaC-Tools wie Terraform oder ARM-Templates."
  };

  // Event-Listener für Klicks auf die Liste
  techListItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      techListItems.forEach(i => i.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');

      const techKey = item.getAttribute('data-tech');
      techTitle.textContent = item.textContent;
      techDetails.textContent = techDescriptions[techKey] || "Keine Beschreibung verfügbar.";
    });
  });

  // Initialisiere den ersten Eintrag beim Laden der Seite
  const firstTechKey = techListItems[0].getAttribute('data-tech');
  techListItems[0].classList.add('active');
  techTitle.textContent = techListItems[0].textContent;
  techDetails.textContent = techDescriptions[firstTechKey] || "Keine Beschreibung verfügbar.";
}

// Initialize skill bars
function initializeSkillBars() {
  const skillBars = document.querySelectorAll('#skills .bar');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const percent = bar.getAttribute('data-percent');
        const barDiv = bar.querySelector('div');
        
        // Set the target width for the animation
        barDiv.style.setProperty('--target-width', percent + '%');
        
        // Start the animation
        barDiv.classList.add('animate');
        
        // Animate the percentage number
        let currentPercent = 0;
        const duration = 1500; // Match the bar animation duration
        const startTime = performance.now();
        
        function updatePercent(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease out function for smoother animation
          const easeOut = 1 - Math.pow(1 - progress, 3);
          currentPercent = Math.round(easeOut * percent);
          
          barDiv.textContent = currentPercent + '%';
          
          if (progress < 1) {
            requestAnimationFrame(updatePercent);
          } else {
            barDiv.textContent = percent + '%'; // Ensure we end at the exact target value
          }
        }
        
        requestAnimationFrame(updatePercent);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  // Start observing each skill bar
  skillBars.forEach(bar => {
    observer.observe(bar);
  });
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tech list
  initializeTechList();
  
  // Initialize skill bars
  initializeSkillBars();

  // Other initializations...
  const body = document.body;
  const darkModeButton = document.querySelector('.static-menu a[onclick="toggleDarkMode()"]');

  if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark');
    darkModeButton.textContent = 'Light Theme';
  } else {
    darkModeButton.textContent = 'Dark Theme';
  }

  // Auto-scroll functionality
  document.querySelectorAll('.static-menu a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Contact form submission logic
  const contactForm = document.getElementById('contact-form');
  const formMsg = document.getElementById('form-msg');

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Wird gesendet...';
    formMsg.textContent = '';
    
    // Submit the form
    fetch(this.action, {
      method: 'POST',
      body: new FormData(this),
      headers: {
        'Accept': 'application/json'
      }
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
    .catch(error => {
      formMsg.textContent = 'Fehler beim Senden der Nachricht. Bitte versuche es später erneut.';
      formMsg.style.color = 'red';
    })
    .finally(() => {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = 'Senden';
    });
  });

  // Carousel functionality
  const carouselItems = document.querySelectorAll('.carousel-item');
  carouselItems.forEach((item) => {
    const caption = item.querySelector('.carousel-caption');
    item.addEventListener('click', () => {
      if (caption.style.bottom === '0px') {
        caption.style.bottom = '-100%';
      } else {
        caption.style.bottom = '0';
      }
    });
  });

  // Progress bar functionality
  const progressBar = document.querySelector('.carousel-progress-bar');
  const carousel = document.querySelector('#carouselExampleCaptions');

  carousel.addEventListener('slid.bs.carousel', () => {
    const activeIndex = document.querySelector('.carousel-item.active').getAttribute('data-bs-slide-to');
    const totalSlides = document.querySelectorAll('.carousel-item').length;
    const progress = ((parseInt(activeIndex) + 1) / totalSlides) * 100;
    progressBar.style.width = `${progress}%`;
  });

  // Paragraph slider functionality
  const paragraphs = document.querySelectorAll('#paragraph-slider .paragraph');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let currentIndex = 0;

  function updateParagraphs() {
    paragraphs.forEach((p, index) => {
      p.classList.toggle('active', index === currentIndex);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + paragraphs.length) % paragraphs.length;
        updateParagraphs();
      });

      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % paragraphs.length;
        updateParagraphs();
      });
    } else {
      console.error('Navigation buttons not found in the DOM.');
    }
  });

  updateParagraphs();
});

// Toggle burger menu
function toggleMenu() {
  const menu = document.querySelector('.static-menu ul');
  const burger = document.querySelector('.burger-menu');
  menu.classList.toggle('active');
  burger.classList.toggle('active');
}

// Close burger menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.querySelector('.static-menu ul');
  const burger = document.querySelector('.burger-menu');
  if (menu.classList.contains('active') && !menu.contains(e.target) && !burger.contains(e.target)) {
    menu.classList.remove('active');
    burger.classList.remove('active');
  }
});

function revealDetails(card) {
  const items = card.querySelectorAll('.detail-list li');
  let delay = 0;

  items.forEach((item, index) => {
    item.classList.remove('visible'); // reset
    setTimeout(() => {
      item.classList.add('visible');
    }, delay);
    delay += 300;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const techSlider = document.getElementById('techSlider');

  // Event listener for when the carousel slide changes
  techSlider.addEventListener('slid.bs.carousel', () => {
    const activeCard = techSlider.querySelector('.carousel-item.active .tech-card');
    if (activeCard) {
      revealDetails(activeCard); // Start the animation for the active card
    }
  });

  // Trigger the animation for the first card on page load
  const firstCard = techSlider.querySelector('.carousel-item.active .tech-card');
  if (firstCard) {
    revealDetails(firstCard);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const techSlider = document.getElementById('techSlider');
  const paragraphElement = document.querySelector('#tech-carousel .col-md-6 p');

  // Paragraph-Inhalte für die jeweiligen Slides
  const paragraphContents = [
    "Netzwerktechnologie ist die Grundlage moderner IT-Infrastrukturen. Sie umfasst Protokolle wie DHCP, DNS, TCP/IP sowie Technologien wie VLANs, das OSI-Modell und Virtualisierungstools wie Docker und Hyper-V.",
    "Programmierung ist die Kunst, Softwarelösungen zu entwickeln. Sie umfasst Sprachen wie JavaScript, Python, PHP und Frameworks wie React, die für moderne Web- und Anwendungsentwicklung genutzt werden."
    // Füge hier weitere Inhalte für zusätzliche Slides hinzu
  ];

  // Event listener für das Umschalten der Slides
  techSlider.addEventListener('slid.bs.carousel', () => {
    const activeIndex = Array.from(techSlider.querySelectorAll('.carousel-item')).findIndex(item =>
      item.classList.contains('active')
    );

    // Aktualisiere den Paragraphen basierend auf dem aktiven Slide
    if (paragraphContents[activeIndex]) {
      // Entferne die Animation und setze sie zurück
      paragraphElement.classList.remove('visible');
      void paragraphElement.offsetWidth; // Trigger reflow, um die Animation zurückzusetzen
      paragraphElement.textContent = paragraphContents[activeIndex];
      paragraphElement.classList.add('visible'); // Füge Animation hinzu
    }
  });

  // Initialisiere den Paragraphen beim Laden der Seite
  const initialIndex = Array.from(techSlider.querySelectorAll('.carousel-item')).findIndex(item =>
    item.classList.contains('active')
  );
  if (paragraphContents[initialIndex]) {
    paragraphElement.textContent = paragraphContents[initialIndex];
    paragraphElement.classList.add('visible'); // Füge Animation hinzu
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const techSlider = document.getElementById('techSlider');
  const paragraphElement = document.querySelector('#tech-carousel .col-md-6 p');

  // Paragraph-Inhalte für die jeweiligen Slides
  const paragraphContents = [
    "Netzwerktechnologie ist die Grundlage moderner IT-Infrastrukturen. Sie umfasst Protokolle wie DHCP, DNS, TCP/IP sowie Technologien wie VLANs, das OSI-Modell und Virtualisierungstools wie Docker und Hyper-V.",
    "Programmierung ist die Kunst, Softwarelösungen zu entwickeln. Sie umfasst Sprachen wie JavaScript, Python, PHP und Frameworks wie React, die für moderne Web- und Anwendungsentwicklung genutzt werden."
    // Füge hier weitere Inhalte für zusätzliche Slides hinzu
  ];

  // Event listener für den Start der Slide-Animation
  techSlider.addEventListener('slide.bs.carousel', () => {
    // Blende die Einträge aus, während die Animation läuft
    const activeCard = techSlider.querySelector('.carousel-item.active .tech-card');
    if (activeCard) {
      const items = activeCard.querySelectorAll('.detail-list li');
      items.forEach(item => item.classList.remove('visible'));
    }

    // Blende den Paragraphen aus
    paragraphElement.classList.remove('visible');
  });

  // Event listener für das Ende der Slide-Animation
  techSlider.addEventListener('slid.bs.carousel', () => {
    const activeCard = techSlider.querySelector('.carousel-item.active .tech-card');
    if (activeCard) {
      revealDetails(activeCard); // Starte die Animation für die Einträge
    }

    // Aktualisiere den Paragraphen basierend auf dem aktiven Slide
    const activeIndex = Array.from(techSlider.querySelectorAll('.carousel-item')).findIndex(item =>
      item.classList.contains('active')
    );

    if (paragraphContents[activeIndex]) {
      paragraphElement.textContent = paragraphContents[activeIndex];
      paragraphElement.classList.add('visible'); // Füge Animation hinzu
    }
  });

  // Initialisiere die Einträge und den Paragraphen beim Laden der Seite
  const firstCard = techSlider.querySelector('.carousel-item.active .tech-card');
  if (firstCard) {
    revealDetails(firstCard);
  }

  const initialIndex = Array.from(techSlider.querySelectorAll('.carousel-item')).findIndex(item =>
    item.classList.contains('active')
  );
  if (paragraphContents[initialIndex]) {
    paragraphElement.textContent = paragraphContents[initialIndex];
    paragraphElement.classList.add('visible');
  }
});

// Timeline-Interaktion
const timelineItems = document.querySelectorAll('.timeline-item');
const modal = new bootstrap.Modal(document.getElementById('timelineModal'));
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

// Ensure dot animations are reset after modal interactions
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('timelineModal');
  const timelineDots = document.querySelectorAll('.timeline-item .timeline-dot');

  modal.addEventListener('hidden.bs.modal', () => {
    timelineDots.forEach(dot => resetAnimation(dot)); // Reset dot animations after closing the modal
  });
});

// Skill bars interaction
document.addEventListener('DOMContentLoaded', function() {
  const skillBars = document.querySelectorAll('#skills .bar');
  let activeDetails = null;
  let activeSkill = null;

  skillBars.forEach(bar => {
    bar.addEventListener('click', function() {
      const skill = this.parentElement;
      const skillDetails = skill.querySelector('.skill-details');
      
      // If clicking the same skill bar, close it
      if (activeDetails === skillDetails) {
        skillDetails.classList.remove('active');
        skill.classList.remove('expanded');
        activeDetails = null;
        activeSkill = null;
        return;
      }
      
      // Close any open details
      if (activeDetails) {
        activeDetails.classList.remove('active');
        activeSkill.classList.remove('expanded');
      }
      
      // Open the clicked details
      skillDetails.classList.add('active');
      skill.classList.add('expanded');
      activeDetails = skillDetails;
      activeSkill = skill;

      // Reset and animate list items
      const listItems = skillDetails.querySelectorAll('li');
      listItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
      });

      // Trigger animation for list items
      setTimeout(() => {
        listItems.forEach(item => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        });
      }, 300); // Wait for the container animation to start
    });
  });

  // Close details when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.skill')) {
      if (activeDetails) {
        activeDetails.classList.remove('active');
        activeSkill.classList.remove('expanded');
        activeDetails = null;
        activeSkill = null;
      }
    }
  });
});

// Card flipping functionality
document.querySelectorAll('.card-container').forEach(container => {
  container.addEventListener('click', function(e) {
    // Don't flip if clicking on scroll buttons
    if (e.target.closest('.nav-bar')) {
      return;
    }
    this.querySelector('.card').classList.toggle('flipped');
  });
});

// Scroll content function
function scrollContent(amount, event) {
  if (event) {
    event.stopPropagation(); // Prevent card flip when clicking scroll buttons
  }
  const scrollBox = event.target.closest('.card-back').querySelector('.scroll-content');
  scrollBox.scrollTop += amount;
}

// Skill-Balken Funktionalität
document.querySelectorAll('.skill .bar').forEach(bar => {
    bar.addEventListener('click', function() {
        // Verstecke den Tooltip nur für die erste Skill-Bar
        const isFirstSkill = this.parentElement === document.querySelector('.skill');
        if (isFirstSkill) {
            const tooltip = this.parentElement.querySelector('.mobile-tooltip');
            if (tooltip) {
                tooltip.classList.add('hidden');
            }
        }
        
        // Toggle die Details
        const details = this.parentElement.querySelector('.skill-details');
        const skill = this.parentElement;
        
        // Schließe alle anderen Details
        document.querySelectorAll('.skill-details.active').forEach(activeDetail => {
            if (activeDetail !== details) {
                activeDetail.classList.remove('active');
                activeDetail.parentElement.classList.remove('expanded');
            }
        });
        
        // Toggle die Details für den geklickten Skill
        details.classList.toggle('active');
        skill.classList.toggle('expanded');
        
        // Animierte Details
        const listItems = details.querySelectorAll('li');
        listItems.forEach((item, index) => {
            if (details.classList.contains('active')) {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(-10px)';
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const contactForm = document.getElementById('contact-form');
  const techSlider = document.getElementById('techSlider');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + paragraphs.length) % paragraphs.length;
      updateParagraphs();
    });
  } else {
    console.error('prev-btn not found in the DOM.');
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % paragraphs.length;
      updateParagraphs();
    });
  } else {
    console.error('next-btn not found in the DOM.');
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formMsg.textContent = 'Bitte füllen Sie alle Felder aus.';
        formMsg.style.color = 'red';
        return;
      }

      formMsg.textContent = 'Nachricht erfolgreich gesendet!';
      formMsg.style.color = 'green';
      contactForm.reset();
    });
  } else {
    console.error('contact-form not found in the DOM.');
  }

  if (techSlider) {
    techSlider.addEventListener('slid.bs.carousel', () => {
      const activeCard = techSlider.querySelector('.carousel-item.active .tech-card');
      if (activeCard) {
        revealDetails(activeCard);
      }
    });
  } else {
    console.error('techSlider not found in the DOM.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const paragraphs = document.querySelectorAll('#paragraph-slider .paragraph');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  let currentIndex = 0;

  function updateParagraphs() {
    paragraphs.forEach((p, index) => {
      p.classList.toggle('active', index === currentIndex);
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
  } else {
    console.error('Paragraph slider buttons not found in the DOM.');
  }

  // Initialize the first paragraph as active
  updateParagraphs();
});

document.addEventListener('DOMContentLoaded', () => {
  const skillBars = document.querySelectorAll('#skills .bar');

  skillBars.forEach(bar => {
    const skill = bar.parentElement;
    const descriptionSpan = skill.querySelector('span');

    if (descriptionSpan) {
      // Move the description span into the bar
      bar.appendChild(descriptionSpan);
      descriptionSpan.style.position = 'absolute';
      descriptionSpan.style.left = '10px';
      descriptionSpan.style.top = '50%';
      descriptionSpan.style.transform = 'translateY(-50%)'; // Center vertically
      descriptionSpan.style.opacity = '0'; // Initially hidden
      descriptionSpan.style.transition = 'opacity 0.5s ease-in-out';
    }

    // Listen for the animation end event
    const barDiv = bar.querySelector('div');
    barDiv.addEventListener('animationend', () => {
      if (descriptionSpan) {
        descriptionSpan.style.opacity = '1'; // Make the span visible after animation
      }
    });
  });
});
function openModal() {
  document.getElementById("iframeModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("iframeModal").style.display = "none";
}




