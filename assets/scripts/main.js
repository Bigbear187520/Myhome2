/* ============================================================
   main.js — Linear/Modern Design System
   Shared interactive behavior for xiongfei.me personal site
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. Ambient Background Blobs
     Inject backdrop layers + animated gradient blobs into DOM
     ========================================================== */
  function initBackground() {
    const body = document.body;

    // Base gradient layer
    const base = document.createElement('div');
    base.className = 'bg-layer bg-layer-base';
    body.prepend(base);

    // Noise texture layer
    const noise = document.createElement('div');
    noise.className = 'bg-layer bg-layer-noise';
    body.prepend(noise);

    // Grid overlay
    const grid = document.createElement('div');
    grid.className = 'bg-layer bg-layer-grid';
    body.prepend(grid);

    // Animated blobs (skip if prefers-reduced-motion)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const blobs = [
        'bg-blob--primary',
        'bg-blob--secondary',
        'bg-blob--tertiary',
        'bg-blob--accent',
      ];
      blobs.forEach(function (modifier) {
        const blob = document.createElement('div');
        blob.className = 'bg-blob ' + modifier;
        body.prepend(blob);
      });
    }

    // Re-check on motion preference change
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      var existing = document.querySelectorAll('.bg-blob');
      if (e.matches) {
        existing.forEach(function (b) { b.remove(); });
      } else if (existing.length === 0) {
        ['bg-blob--primary', 'bg-blob--secondary', 'bg-blob--tertiary', 'bg-blob--accent'].forEach(function (m) {
          var blob = document.createElement('div');
          blob.className = 'bg-blob ' + m;
          body.prepend(blob);
        });
      }
    });
  }

  /* ==========================================================
     2. Navigation
     - Highlight active page link
     - Mobile hamburger toggle
     - Close mobile menu on Escape / outside click
     ========================================================== */
  function initNavigation() {
    var navbar = document.querySelector('.navbar');
    var navToggle = navbar ? navbar.querySelector('.nav-toggle') : null;
    var mobileMenu = document.querySelector('.nav-mobile-menu');

    // --- Active page detection ---
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    var links = document.querySelectorAll('.nav-link');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // --- Mobile menu toggle ---
    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = mobileMenu.classList.contains('is-open');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close on link click
      mobileMenu.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          closeMobileMenu();
        });
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
          closeMobileMenu();
          navToggle.focus();
        }
      });

      // Close on click outside
      document.addEventListener('click', function (e) {
        if (mobileMenu.classList.contains('is-open') &&
            !mobileMenu.contains(e.target) &&
            e.target !== navToggle &&
            !navToggle.contains(e.target)) {
          closeMobileMenu();
        }
      });
    }

    function openMobileMenu() {
      mobileMenu.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      // Swap hamburger to X
      var svg = navToggle.querySelector('svg');
      if (svg) {
        svg.innerHTML = '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>';
      }
    }

    function closeMobileMenu() {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      // Restore hamburger
      var svg = navToggle.querySelector('svg');
      if (svg) {
        svg.innerHTML = '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="16" x2="20" y2="16"/>';
      }
    }
  }

  /* ==========================================================
     3. Mouse-Tracking Spotlight Effect
     Cards with .card-spotlight get a radial gradient that
     follows the cursor position
     ========================================================== */
  function initSpotlight() {
    var cards = document.querySelectorAll('.card-spotlight');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--spotlight-x', x + 'px');
        card.style.setProperty('--spotlight-y', y + 'px');
        card.classList.add('is-spotlit');
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-spotlit');
      });
    });
  }

  /* ==========================================================
     4. Scroll Effects
     - Hero parallax (opacity + scale fade on scroll)
     - Entrance animations via IntersectionObserver
     ========================================================== */
  function initScrollEffects() {
    // --- Hero parallax ---
    var hero = document.querySelector('.hero-parallax');
    if (hero) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            updateParallax(hero);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      // Initial call
      updateParallax(hero);
    }

    // --- Entrance animations ---
    var animatedElements = document.querySelectorAll('.animate-in');
    if (animatedElements.length > 0) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, { threshold: 0.15 });

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  function updateParallax(hero) {
    var scrollY = window.pageYOffset || window.scrollY;
    var heroHeight = hero.offsetHeight;
    if (heroHeight === 0) return;

    var progress = Math.min(scrollY / (heroHeight * 0.8), 1);

    var opacity = 1 - progress;
    var scale = 1 - (progress * 0.05);
    var translateY = progress * 60;

    hero.style.opacity = opacity;
    hero.style.transform = 'scale(' + scale + ') translateY(' + translateY + 'px)';
  }

  /* ==========================================================
     5. Smooth Scroll for Anchor Links
     ========================================================== */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ==========================================================
     Boot
     ========================================================== */
  function boot() {
    initBackground();
    initNavigation();
    initSpotlight();
    initScrollEffects();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
