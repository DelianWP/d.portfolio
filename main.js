/* ============================================================
   DELS PAGE — main.js
   Vanilla JavaScript, no libraries needed
   ============================================================ */

/* ──────────────────────────────────────────
   1. YEAR in footer
────────────────────────────────────────── */
document.querySelectorAll('#year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* ──────────────────────────────────────────
   2. THEME — dark / light toggle
   Saves preference to localStorage
────────────────────────────────────────── */
const html = document.documentElement;

// Load saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('#theme-icon, #theme-icon-mob');
  icons.forEach(icon => {
    icon.textContent = theme === 'dark' ? '☀' : '☾';
  });
}

function toggleTheme() {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

// Attach to all theme buttons
document.querySelectorAll('#theme-btn, #theme-btn-mob').forEach(btn => {
  btn.addEventListener('click', toggleTheme);
});

/* ──────────────────────────────────────────
   3. HEADER — add .scrolled class on scroll
────────────────────────────────────────── */
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ──────────────────────────────────────────
   4. HAMBURGER MENU (mobile)
────────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
  });
}

/* ──────────────────────────────────────────
   5. CUSTOM CURSOR (desktop only)
────────────────────────────────────────── */
const ring = document.getElementById('cursor-ring');
const dot  = document.getElementById('cursor-dot');

// Only run on non-touch devices
if (ring && dot && window.matchMedia('(pointer: fine)').matches) {
  let ringX = 0, ringY = 0;
  let dotX  = 0, dotY  = 0;
  let mouseX = -100, mouseY = -100;

  // Track actual mouse
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth follow with RAF
  function animateCursor() {
    // Dot follows fast
    dotX  += (mouseX - dotX)  * 0.7;
    dotY  += (mouseY - dotY)  * 0.7;
    // Ring follows slower (spring effect)
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    dot.style.left  = dotX  + 'px';
    dot.style.top   = dotY  + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Pointer state on interactive elements
  document.addEventListener('mouseover', e => {
    const target = e.target;
    const isInteractive =
      target.tagName === 'A'      ||
      target.tagName === 'BUTTON' ||
      target.closest('a')         ||
      target.closest('button');

    ring.classList.toggle('pointer', !!isInteractive);
    dot.classList.toggle('pointer',  !!isInteractive);
  });

  // Hide when leaving window
  document.documentElement.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity  = '0';
  });
  document.documentElement.addEventListener('mouseenter', () => {
    ring.style.opacity = '';
    dot.style.opacity  = '';
  });
}

/* ──────────────────────────────────────────
   6. SCROLL REVEAL
   Adds .visible when element enters viewport
────────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const index    = siblings.indexOf(entry.target);
        const delay    = Math.min(index * 0.07, 0.35);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay * 1000);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-40px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   7. LANGUAGE BARS
   Animate width when bar enters viewport
────────────────────────────────────────── */
function initLanguageBars() {
  const bars = document.querySelectorAll('.lang-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const pct = bar.getAttribute('data-pct');
        bar.style.width = pct + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

/* ──────────────────────────────────────────
   8. PRELOADER (Home page only)
────────────────────────────────────────── */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // If this isn't the home page, skip
  const isHome = !!document.querySelector('.page-home');
  if (!isHome) {
    preloader.style.display = 'none';
    return;
  }

  const countEl  = document.getElementById('preloader-count');
  const barEl    = document.getElementById('preloader-bar');
  const goldEl   = document.getElementById('curtain-gold');
  const bgEl     = document.getElementById('curtain-bg');

  let count      = 0;
  const duration = 1800; // ms
  const steps    = 100;
  const interval = duration / steps;

  const timer = setInterval(() => {
    count++;
    if (countEl) countEl.textContent = String(count).padStart(3, '0');
    if (barEl)   barEl.style.width   = count + '%';

    if (count >= 100) {
      clearInterval(timer);

      // Play curtain wipe
      setTimeout(() => {
        if (goldEl) goldEl.classList.add('rise');
        if (bgEl)   bgEl.classList.add('rise');
      }, 150);

      // Hide preloader
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 900);
    }
  }, interval);
}

/* ──────────────────────────────────────────
   9. HOME PAGE PARALLAX (mouse move)
────────────────────────────────────────── */
function initParallax() {
  const photoWrap = document.getElementById('photo-wrap');
  if (!photoWrap) return;

  document.addEventListener('mousemove', e => {
    const { innerWidth, innerHeight } = window;
    const x = ((e.clientX - innerWidth  / 2) / innerWidth)  * 18;
    const y = ((e.clientY - innerHeight / 2) / innerHeight) * 14;
    photoWrap.style.transform = `translate(${x}px, ${y}px)`;
  });
}

/* ──────────────────────────────────────────
   10. RUN EVERYTHING
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollReveal();
  initLanguageBars();
  initParallax();
});
