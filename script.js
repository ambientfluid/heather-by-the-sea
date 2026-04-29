(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header scroll state ---------- */
  const header = $('#siteHeader');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const navToggle = $('#navToggle');
  const mobileNav = $('#mobileNav');
  if (navToggle && mobileNav) {
    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
      header.classList.remove('menu-open');
    };
    const openMenu = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      mobileNav.hidden = false;
      header.classList.add('menu-open');
    };
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('in'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- stat counter ---------- */
  const stats = $$('.stat-num[data-count]');
  if (stats.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target) + (target >= 25 ? '+' : '');
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); so.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    stats.forEach((el) => so.observe(el));
  }

  /* ---------- hero parallax ---------- */
  const heroImg = $('.hero-bg img');
  if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = `scale(1.08) translate3d(0, ${y * 0.18}px, 0)`;
      }
      raf = 0;
    };
    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
  }

  /* ---------- gallery render + lightbox ---------- */
  const TOTAL = 31;
  const PREVIEW_COUNT = 12;
  const masonry = $('#masonry');
  const viewAllBtn = $('#viewAllBtn');

  const galleryItems = [];
  if (masonry) {
    for (let i = 1; i <= TOTAL; i++) {
      const num = String(i).padStart(2, '0');
      const src = `gallery/${num}.jpg`;
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'masonry-item' + (i > PREVIEW_COUNT ? ' hidden-extra' : '');
      item.setAttribute('aria-label', `Open photo ${i} of ${TOTAL}`);
      item.dataset.index = String(i - 1);
      item.innerHTML = `
        <img src="${src}" alt="Salon work — photo ${i}" loading="lazy" decoding="async" />
        <span class="zoom-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>
          </svg>
        </span>`;
      masonry.appendChild(item);
      galleryItems.push({ src, index: i - 1 });
    }

    if ('IntersectionObserver' in window) {
      const mo = new IntersectionObserver((entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            const i = Array.from(masonry.children).indexOf(e.target);
            setTimeout(() => e.target.classList.add('in'), Math.min(i, 12) * 60);
            mo.unobserve(e.target);
          }
        });
      }, { threshold: 0.05 });
      $$('.masonry-item', masonry).forEach((el) => mo.observe(el));
    } else {
      $$('.masonry-item', masonry).forEach((el) => el.classList.add('in'));
    }
  }

  if (viewAllBtn && masonry) {
    viewAllBtn.addEventListener('click', () => {
      const expanded = masonry.classList.toggle('expanded');
      viewAllBtn.classList.toggle('expanded', expanded);
      const label = viewAllBtn.querySelector('span');
      if (label) label.textContent = expanded ? 'Show fewer photos' : `View all ${TOTAL} photos`;
      if (expanded) {
        const newItems = $$('.masonry-item.hidden-extra', masonry).filter(el => !el.classList.contains('in'));
        newItems.forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 40));
      }
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbClose = $('#lbClose');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');
  let lbIndex = 0;

  const openLightbox = (idx) => {
    lbIndex = idx;
    showLightbox();
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('open'));
    document.body.style.overflow = 'hidden';
  };
  const showLightbox = () => {
    const item = galleryItems[lbIndex];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = `Salon work — photo ${lbIndex + 1}`;
    lbCap.textContent = `${lbIndex + 1} / ${galleryItems.length}`;
  };
  const closeLightbox = () => {
    lb.classList.remove('open');
    setTimeout(() => { lb.hidden = true; lbImg.src = ''; }, 250);
    document.body.style.overflow = '';
  };
  const next = () => { lbIndex = (lbIndex + 1) % galleryItems.length; showLightbox(); };
  const prev = () => { lbIndex = (lbIndex - 1 + galleryItems.length) % galleryItems.length; showLightbox(); };

  if (masonry) {
    masonry.addEventListener('click', (e) => {
      const item = e.target.closest('.masonry-item');
      if (!item) return;
      openLightbox(parseInt(item.dataset.index, 10));
    });
  }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', prev);
  if (lbNext) lbNext.addEventListener('click', next);
  if (lb) {
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  }
  document.addEventListener('keydown', (e) => {
    if (lb && !lb.hidden) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }
  });

  /* swipe nav on mobile */
  if (lb) {
    let touchStartX = 0;
    lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    });
  }
})();
