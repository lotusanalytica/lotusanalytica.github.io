/**
 * Lotus Analytica - Main JavaScript
 * Handles language switching, animations, and interactions
 */

(function() {
  'use strict';

  // DOM Elements
  const header = document.querySelector('.header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const langBtns = document.querySelectorAll('.lang-btn');

  // Language configuration
  const LANG_CONFIG = {
    en: {
      path: '/',
      altPath: '/ja/',
      label: 'EN'
    },
    ja: {
      path: '/ja/',
      altPath: '/',
      label: 'JP'
    }
  };

  /**
   * Initialize all functionality
   */
  function init() {
    setupDarkMode();
    setupHeader();
    setupMobileMenu();
    setupLanguageSwitcher();
    setupScrollAnimations();
    setupSmoothScroll();
    setupFormHandling();
    createFloatingPetals();
    setupAnimatedCounters();
    setupKonamiCode();
    setupRippleEffect();
    setup3DTiltEffect();
  }

  /**
   * Dark mode functionality
   */
  function setupDarkMode() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Create floating lotus petals in hero section
   */
  function createFloatingPetals() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Create petal container
    const petalContainer = document.createElement('div');
    petalContainer.className = 'petal-container';
    hero.appendChild(petalContainer);

    // Create petals
    const petalCount = 15;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'floating-petal';

      // Random properties
      const size = Math.random() * 20 + 10;
      const left = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = Math.random() * 10 + 15;
      const rotation = Math.random() * 360;

      petal.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        --rotation: ${rotation}deg;
      `;

      petalContainer.appendChild(petal);
    }
  }

  /**
   * Animated counter for stats
   */
  function setupAnimatedCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
  }

  /**
   * Animate a counter element
   */
  function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/^([\d.]+)(.*)/);
    if (!match) return;

    const target = parseFloat(match[1]);
    const suffix = match[2] || '';
    const isDecimal = text.includes('.');
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;

    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = (target / steps) * step;

      if (step >= steps) {
        current = target;
        clearInterval(timer);
      }

      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - (step / steps), 3);
      const easedValue = target * easedProgress;

      if (isDecimal) {
        element.textContent = easedValue.toFixed(1) + suffix;
      } else {
        element.textContent = Math.round(easedValue) + suffix;
      }
    }, duration / steps);
  }

  /**
   * Header scroll behavior
   */
  function setupHeader() {
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 100;

    function handleScroll() {
      const currentScroll = window.pageYOffset;

      // Add scrolled class for styling
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }

    window.addEventListener('scroll', throttle(handleScroll, 10));
  }

  /**
   * Mobile menu toggle
   */
  function setupMobileMenu() {
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');

      // Toggle aria-expanded
      const isExpanded = nav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Language switcher functionality
   */
  function setupLanguageSwitcher() {
    langBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const targetLang = this.dataset.lang;
        switchLanguage(targetLang);
      });
    });

    // Set active language based on current URL
    updateActiveLangButton();
  }

  /**
   * Switch to target language
   */
  function switchLanguage(targetLang) {
    const currentPath = window.location.pathname;
    const currentPage = getCurrentPage(currentPath);
    let newPath;

    if (targetLang === 'ja') {
      // Switch to Japanese
      if (currentPath.includes('/ja/')) {
        return; // Already on Japanese
      }
      newPath = '/ja/' + currentPage;
    } else {
      // Switch to English
      if (!currentPath.includes('/ja/')) {
        return; // Already on English
      }
      newPath = '/' + currentPage;
    }

    // For static hosting, construct proper path
    const basePath = getBasePath();
    window.location.href = basePath + newPath;
  }

  /**
   * Get current page name from path
   */
  function getCurrentPage(path) {
    // Remove base path and language prefix
    let page = path
      .replace(/^\/ja\//, '/')
      .replace(/^\//, '')
      .replace(/\.html$/, '');

    // Handle index pages
    if (!page || page === 'index') {
      return 'index.html';
    }

    return page + '.html';
  }

  /**
   * Get base path for GitHub Pages or local hosting
   */
  function getBasePath() {
    // For GitHub Pages with custom domain or local development
    const host = window.location.host;

    // Check if we're on GitHub Pages with project path
    if (window.location.pathname.startsWith('/lotusanalytica.com/')) {
      return '/lotusanalytica.com';
    }

    return '';
  }

  /**
   * Update active language button
   */
  function updateActiveLangButton() {
    const isJapanese = window.location.pathname.includes('/ja/');

    langBtns.forEach(btn => {
      const lang = btn.dataset.lang;
      if ((lang === 'ja' && isJapanese) || (lang === 'en' && !isJapanese)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Scroll animations using Intersection Observer
   */
  function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for multiple elements
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * Smooth scroll for anchor links
   */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();

          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
          }
        }
      });
    });
  }

  /**
   * Contact form handling (for static site)
   */
  function setupFormHandling() {
    const contactForm = document.querySelector('.contact-form form');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      // For static site, we'll construct a mailto link
      const subject = encodeURIComponent(`[Lotus Analytica] Contact from ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || 'N/A'}\n\nMessage:\n${data.message}`
      );

      const mailtoLink = `mailto:lotusanalytica@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
    });
  }

  /**
   * Konami code easter egg
   */
  function setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          activatePartyMode();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  /**
   * Party mode easter egg effect
   */
  function activatePartyMode() {
    document.body.classList.add('party-mode');

    // Create confetti
    const colors = ['#c026d3', '#06b6d4', '#f472b6', '#6366f1', '#22d3ee', '#a855f7'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 3}s;
        animation-duration: ${Math.random() * 2 + 3}s;
      `;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }

    // Show fun message
    const message = document.createElement('div');
    message.className = 'party-message';
    message.innerHTML = 'You found the secret! Have some confetti!';
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
      document.body.classList.remove('party-mode');
    }, 5000);
  }

  /**
   * Ripple effect for buttons
   */
  function setupRippleEffect() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /**
   * 3D tilt effect for cards
   */
  function setup3DTiltEffect() {
    const cards = document.querySelectorAll('.feature-card, .team-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  /**
   * Utility: Throttle function
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Utility: Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for potential external use
  window.LotusAnalytica = {
    switchLanguage,
    getCurrentPage,
    getBasePath
  };

})();
