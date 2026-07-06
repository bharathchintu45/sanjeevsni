/* Sanjeevani Hospital — shared behaviour
   Mobile nav, scroll reveals, 3D animation layer (floating shapes, card tilt,
   counters). Everything respects prefers-reduced-motion and degrades to a
   fully usable static page without JS. */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var onHeaderScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ---------- Hero carousel ---------- */
  var carousel = document.getElementById('hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-carousel__slide'));
    if (slides.length > 1) {
      var active = 0;
      var timer = null;

      var dots = carousel.querySelector('.hero-carousel__dots');
      if (!dots) {
        dots = document.createElement('div');
        dots.className = 'hero-carousel__dots';
        carousel.appendChild(dots);
      }
      while (dots.children.length < slides.length) {
        dots.appendChild(document.createElement('button'));
      }
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.type = 'button';
        d.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + slides.length);
        d.addEventListener('click', function () { show(i); restart(); });
      });

      var show = function (i) {
        active = (i + slides.length) % slides.length;
        slides.forEach(function (s, j) { s.classList.toggle('is-active', j === active); });
        Array.prototype.forEach.call(dots.children, function (d, j) {
          d.setAttribute('aria-current', j === active ? 'true' : 'false');
          d.classList.toggle('is-active', j === active);
        });
      };
      var restart = function () {
        if (timer) clearInterval(timer);
        if (!reducedMotion) timer = setInterval(function () { show(active + 1); }, 4500);
      };
      carousel.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
      carousel.addEventListener('mouseleave', restart);
      show(0);
      restart();
    } else if (slides.length === 1) {
      slides[0].classList.add('is-active');
    }
  }

  /* ---------- Scroll reveal (staggered) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window && !reducedMotion) {
    var seen = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.transitionDelay = Math.min(seen++ % 6, 5) * 50 + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 3D floating shapes in hero bands ---------- */
  // Medical cross, capsule and pulse-ring shapes floating with CSS 3D rotation.
  // Skipped for reduced-motion users; hidden from assistive tech.
  var shapes = [
    { svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>', size: 64, top: '12%', left: '6%', deep: false },
    { svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="m8.4 7.2 7.2 9.6" /></svg>', size: 90, top: '62%', left: '3%', deep: true },
    { svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M4 12h4l2-4 3 8 2-4h5"/></svg>', size: 72, top: '18%', left: '88%', deep: true },
    { svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>', size: 40, top: '72%', left: '92%', deep: false }
  ];
  document.querySelectorAll('.hero, .page-hero').forEach(function (band) {
    if (reducedMotion) return;
    shapes.forEach(function (s, i) {
      var el = document.createElement('div');
      el.className = 'fx-shape' + (s.deep ? ' fx-shape--deep' : '');
      el.setAttribute('aria-hidden', 'true');
      el.style.width = s.size + 'px';
      el.style.height = s.size + 'px';
      el.style.top = s.top;
      el.style.left = s.left;
      el.style.animationDelay = (i * -2.2) + 's';
      el.innerHTML = s.svg;
      band.appendChild(el);
    });

    // Depth parallax: shapes drift subtly as the user scrolls past the band.
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var rect = band.getBoundingClientRect();
        var progress = -rect.top / Math.max(rect.height, 1);
        band.querySelectorAll('.fx-shape').forEach(function (el, i) {
          var depth = el.classList.contains('fx-shape--deep') ? 30 : 60;
          el.style.marginTop = (progress * depth * (i % 2 ? 1 : -1)) + 'px';
        });
        ticking = false;
      });
    }, { passive: true });
  });

  /* ---------- 3D tilt on cards (desktop, fine pointer only) ---------- */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.card, .hero__card').forEach(function (card) {
      var zone = card.parentElement;
      if (zone && !zone.classList.contains('tilt-zone')) zone.classList.add('tilt-zone');
      card.classList.add('tilt');
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;  // max ±3°
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.classList.add('is-tilting');
        card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* ---------- Animated counters (hero stats) ---------- */
  var stats = document.querySelectorAll('.hero__stats strong');
  if (stats.length && !reducedMotion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var text = el.textContent;
        var num = parseFloat(text);
        if (isNaN(num)) return;
        var suffix = text.replace(String(num), '');
        var start = null;
        var dur = 900;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = num * eased;
          el.textContent = (num % 1 ? val.toFixed(1) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = text;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Trust-bar counters ---------- */
  var trustNums = document.querySelectorAll('.trust-bar__number[data-count]');
  if (trustNums.length && 'IntersectionObserver' in window && !reducedMotion) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        tio.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        var finalText = el.textContent;
        if (isNaN(target)) return;
        var start = null;
        var dur = 1200;
        (function step(ts) {
          if (!start) start = ts || performance.now();
          var p = Math.min(((ts || performance.now()) - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('en-IN') + '+';
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = finalText;
        })();
      });
    }, { threshold: 0.6 });
    trustNums.forEach(function (el) { tio.observe(el); });
  }

  /* ---------- Testimonial carousel (scroll-snap + dots + gentle auto-advance) ---------- */
  var tCarousel = document.getElementById('testimonial-carousel');
  if (tCarousel) {
    var tTrack = tCarousel.querySelector('.testimonial-carousel__track');
    var tCards = Array.prototype.slice.call(tTrack.children);
    var tNav = document.getElementById('testimonial-nav') || tCarousel.querySelector('.testimonial-carousel__nav');
    if (tCards.length > 1 && tNav) {
      tCards.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show review ' + (i + 1) + ' of ' + tCards.length);
        b.addEventListener('click', function () {
          tTrack.scrollTo({ left: tCards[i].offsetLeft - tTrack.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
        });
        tNav.appendChild(b);
      });

      var setActiveDot = function () {
        var mid = tTrack.scrollLeft + 10;
        var idx = 0;
        tCards.forEach(function (c, i) { if (c.offsetLeft - tTrack.offsetLeft <= mid) idx = i; });
        Array.prototype.forEach.call(tNav.children, function (d, j) {
          d.classList.toggle('is-active', j === idx);
        });
        return idx;
      };
      tTrack.addEventListener('scroll', function () { requestAnimationFrame(setActiveDot); }, { passive: true });
      setActiveDot();

      if (!reducedMotion) {
        var tTimer = setInterval(function () {
          var idx = setActiveDot();
          var next = (idx + 1) % tCards.length;
          tTrack.scrollTo({ left: tCards[next].offsetLeft - tTrack.offsetLeft, behavior: 'smooth' });
        }, 6000);
        ['mouseenter', 'touchstart', 'focusin'].forEach(function (ev) {
          tCarousel.addEventListener(ev, function () { clearInterval(tTimer); }, { passive: true, once: true });
        });
      }
    }
  }

  /* ---------- Booking form → WhatsApp ---------- */
  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var lines = [
        'Namaste, I would like to book an appointment at Sanjeevani Hospital.',
        'Patient name: ' + v('b-name'),
        'Phone: ' + v('b-phone'),
        'Doctor: ' + (v('b-doctor') || 'Any available doctor'),
        'Date: ' + v('b-date'),
        'Time: ' + v('b-time')
      ];
      if (v('b-reason')) lines.push('Reason: ' + v('b-reason'));
      window.open('https://wa.me/919010590108?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var figures = Array.prototype.slice.call(document.querySelectorAll('.gallery-grid figure'));
  if (figures.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.hidden = true;
    lb.innerHTML =
      '<button class="lb-btn lightbox__close" aria-label="Close photo viewer">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lb-btn lightbox__prev" aria-label="Previous photo">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<img class="lightbox__img" alt="">' +
      '<div class="lightbox__caption" aria-live="polite"></div>' +
      '<div class="lightbox__count"></div>' +
      '<button class="lb-btn lightbox__next" aria-label="Next photo">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('.lightbox__img');
    var lbCaption = lb.querySelector('.lightbox__caption');
    var lbCount = lb.querySelector('.lightbox__count');
    var btnClose = lb.querySelector('.lightbox__close');
    var btnPrev = lb.querySelector('.lightbox__prev');
    var btnNext = lb.querySelector('.lightbox__next');
    var current = 0;
    var lastFocus = null;

    if (figures.length < 2) { btnPrev.hidden = true; btnNext.hidden = true; }

    function render(i) {
      current = (i + figures.length) % figures.length;
      var img = figures[current].querySelector('img');
      var cap = figures[current].querySelector('figcaption');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = cap ? cap.textContent : '';
      lbCount.textContent = (current + 1) + ' / ' + figures.length;
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      render(i);
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      document.body.classList.add('lb-open');
      btnClose.focus();
    }
    function closeLb() {
      lb.classList.remove('is-open');
      document.body.classList.remove('lb-open');
      window.setTimeout(function () { lb.hidden = true; }, reducedMotion ? 0 : 200);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    figures.forEach(function (fig, i) {
      var cap = fig.querySelector('figcaption');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'View photo: ' + (cap ? cap.textContent : 'gallery image ' + (i + 1)));
      fig.addEventListener('click', function () { openLb(i); });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
      });
    });

    btnClose.addEventListener('click', closeLb);
    btnPrev.addEventListener('click', function () { render(current - 1); });
    btnNext.addEventListener('click', function () { render(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') render(current - 1);
      else if (e.key === 'ArrowRight') render(current + 1);
    });

    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) render(current + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ---------- Contact form → WhatsApp ---------- */
  var form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('#f-name') || {}).value || '';
      var phone = (form.querySelector('#f-phone') || {}).value || '';
      var msg = (form.querySelector('#f-msg') || {}).value || '';
      var text = 'Namaste, I am ' + name + ' (' + phone + ').\n' + msg;
      window.open('https://wa.me/919010590108?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

  /* ---------- Booking form → WhatsApp ---------- */
  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    // Set min date to today
    var dateInput = bookingForm.querySelector('#b-date');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
      dateInput.value = today;
    }
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (bookingForm.querySelector('#b-name') || {}).value || '';
      var phone = (bookingForm.querySelector('#b-phone') || {}).value || '';
      var doctor = (bookingForm.querySelector('#b-doctor') || {}).value || 'Any available doctor';
      var date = (bookingForm.querySelector('#b-date') || {}).value || '';
      var time = (bookingForm.querySelector('#b-time') || {}).value || '';
      var reason = (bookingForm.querySelector('#b-reason') || {}).value || '';
      var text = 'Namaste, I want to book an appointment at Sanjeevani Hospital.\n\n' +
        'Name: ' + name + '\n' +
        'Phone: ' + phone + '\n' +
        'Doctor: ' + doctor + '\n' +
        'Date: ' + date + '\n' +
        'Time: ' + time + '\n' +
        (reason ? 'Reason: ' + reason + '\n' : '') +
        '\nPlease confirm my appointment. Thank you.';
      window.open('https://wa.me/919010590108?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

  /* ---------- Hero image carousel ---------- */
  var heroCarousel = document.getElementById('hero-carousel');
  if (heroCarousel && !reducedMotion) {
    var track = heroCarousel.querySelector('.hero-carousel__track');
    var dots = heroCarousel.querySelectorAll('.hero-carousel__dot');
    var slides = heroCarousel.querySelectorAll('.hero-carousel__slide');
    var currentSlide = 0;
    var slideCount = slides.length;
    var autoInterval = null;

    function goToSlide(i) {
      currentSlide = ((i % slideCount) + slideCount) % slideCount;
      track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === currentSlide);
      });
    }

    function startAuto() {
      autoInterval = setInterval(function () { goToSlide(currentSlide + 1); }, 4000);
    }
    function stopAuto() { clearInterval(autoInterval); }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () { stopAuto(); goToSlide(idx); startAuto(); });
    });

    heroCarousel.addEventListener('mouseenter', stopAuto);
    heroCarousel.addEventListener('mouseleave', startAuto);

    // Touch swipe
    var hcTouchX = null;
    heroCarousel.addEventListener('touchstart', function (e) { hcTouchX = e.changedTouches[0].clientX; stopAuto(); }, { passive: true });
    heroCarousel.addEventListener('touchend', function (e) {
      if (hcTouchX === null) return;
      var dx = e.changedTouches[0].clientX - hcTouchX;
      if (Math.abs(dx) > 40) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
      hcTouchX = null;
      startAuto();
    }, { passive: true });

    startAuto();
  }

  /* ---------- Trust-bar animated counters ---------- */
  var trustNumbers = document.querySelectorAll('.trust-bar__number[data-count]');
  if (trustNumbers.length && !reducedMotion && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        tio.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.textContent.replace(/[\d,]/g, '');
        var start = null;
        var dur = 1200;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.textContent = val.toLocaleString('en-IN') + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString('en-IN') + suffix;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    trustNumbers.forEach(function (el) { tio.observe(el); });
  }
})();
