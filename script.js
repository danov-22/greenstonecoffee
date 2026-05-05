/* =========================================================
   BREWNSTONE — script.js
   Vanilla JavaScript only, no dependencies
   ========================================================= */

/* ── Navbar: scroll behaviour & active links ───────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.navbar__link');

  /* Scroll: add .scrolled class */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveSection();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger toggle */
  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close mobile menu when a link is clicked */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Highlight active nav link based on scroll position */
  function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
})();


/* ── Scroll-reveal animations ──────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();


/* ── Menu tabs ─────────────────────────────────────────── */
(function initMenuTabs() {
  const tabs  = document.querySelectorAll('.menu__tab');
  const cards = document.querySelectorAll('.menu__card');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const cat = tab.getAttribute('data-category');

      /* Update tabs */
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      /* Show/hide cards with a small fade */
      cards.forEach(function (card) {
        if (card.getAttribute('data-category') === cat) {
          card.style.display = '';
          /* Trigger reflow to re-run animation */
          card.classList.remove('visible');
          void card.offsetWidth;
          card.classList.add('visible');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* Make initial cards visible */
  cards.forEach(function (card) {
    if (card.getAttribute('data-category') === 'espresso') {
      card.style.display = '';
    }
  });
})();


/* ── Testimonials slider ───────────────────────────────── */
(function initTestimonials() {
  const track   = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('testimonialDots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial__card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  /* Determine visible count from viewport */
  function getVisible() {
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  /* Build dots */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = Math.ceil(total / getVisible());
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.testimonials__dot');
    const page = Math.floor(current / getVisible());
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === page);
    });
  }

  function goTo(index) {
    const visible = getVisible();
    const maxIndex = total - visible;
    current = Math.max(0, Math.min(index, maxIndex));
    const pct = (100 / total) * current;
    track.style.transform = 'translateX(-' + pct + '%)';
    updateDots();
  }

  prevBtn.addEventListener('click', function () {
    clearTimeout(autoTimer);
    goTo(current - getVisible());
    scheduleAuto();
  });

  nextBtn.addEventListener('click', function () {
    clearTimeout(autoTimer);
    const visible = getVisible();
    const next = current + visible >= total ? 0 : current + visible;
    goTo(next);
    scheduleAuto();
  });

  function scheduleAuto() {
    autoTimer = setTimeout(function () {
      const visible = getVisible();
      const next = current + visible >= total ? 0 : current + visible;
      goTo(next);
      scheduleAuto();
    }, 5000);
  }

  function reset() {
    current = 0;
    track.style.transform = 'translateX(0)';
    buildDots();
    updateDots();
  }

  window.addEventListener('resize', function () {
    reset();
  });

  buildDots();
  scheduleAuto();
})();


/* ── Contact form validation ───────────────────────────── */
(function initContactForm() {
  const form         = document.getElementById('contactForm');
  if (!form) return;

  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError    = document.getElementById('nameError');
  const emailError   = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const successBox   = document.getElementById('formSuccess');

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function clearErrors() {
    nameError.textContent    = '';
    emailError.textContent   = '';
    messageError.textContent = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    successBox.textContent = '';

    let valid = true;

    if (!nameInput.value.trim()) {
      nameError.textContent = 'Please enter your name.';
      valid = false;
    }
    if (!validateEmail(emailInput.value)) {
      emailError.textContent = 'Please enter a valid email address.';
      valid = false;
    }
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      messageError.textContent = 'Message must be at least 10 characters.';
      valid = false;
    }

    if (!valid) return;

    /* Simulate send — in production, replace with fetch() to your endpoint */
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(function () {
      form.reset();
      btn.disabled = false;
      btn.textContent = 'Send Message';
      successBox.textContent = 'Message received — we\'ll get back to you shortly.';
    }, 1200);
  });

  /* Inline validation on blur */
  nameInput.addEventListener('blur', function () {
    nameError.textContent = nameInput.value.trim() ? '' : 'Please enter your name.';
  });
  emailInput.addEventListener('blur', function () {
    emailError.textContent = validateEmail(emailInput.value) ? '' : 'Please enter a valid email.';
  });
  messageInput.addEventListener('blur', function () {
    messageError.textContent =
      messageInput.value.trim().length >= 10 ? '' : 'Message must be at least 10 characters.';
  });
})();


/* ── Footer year ────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ── Smooth scroll for anchor links (fallback) ──────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
