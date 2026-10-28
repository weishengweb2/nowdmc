(() => {
  'use strict';
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuBtn');
  const closeMenu = () => {
    menu?.classList.add('hidden');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  toggle?.addEventListener('click', () => {
    const hidden = menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!hidden));
  });
  menu?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const consentKey = 'nowdmc-analytics-choice-v1';
  const measurementId = 'G-RM4L7LFDEV';
  const disableKey = 'ga-disable-' + measurementId;
  const isLive = ['nowdmc.com', 'www.nowdmc.com'].includes(location.hostname);
  let consent = null;
  let analyticsStarted = false;
  try { consent = localStorage.getItem(consentKey); } catch (_) { /* Session-only choice still works. */ }
  function startAnalytics() {
    if (!isLive || analyticsStarted) return;
    analyticsStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }
  function track(name, data) {
    if (consent === 'accepted' && isLive && typeof window.gtag === 'function') {
      window.gtag('event', name, data);
    }
  }
  function clearAnalyticsCookies() {
    const cookies = document.cookie.split(';').map(item => item.trim().split('=')[0]);
    for (const name of cookies.filter(name => /^_ga(?:_|$)/.test(name))) {
      for (const domain of ['', location.hostname, '.' + location.hostname]) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
      }
    }
  }
  const banner = document.getElementById('cookieBanner');
  function chooseAnalytics(choice) {
    consent = choice;
    try { localStorage.setItem(consentKey, choice); } catch (_) { /* Keep the current choice in memory. */ }
    window[disableKey] = choice !== 'accepted';
    if (choice === 'accepted') {
      startAnalytics();
      if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
    }
    banner?.classList.add('hidden');
  }
  document.querySelectorAll('[data-analytics-choice]').forEach(button => {
    button.addEventListener('click', () => chooseAnalytics(button.dataset.analyticsChoice));
  });
  document.getElementById('cookieSettings')?.addEventListener('click', () => {
    banner?.classList.remove('hidden');
    banner?.querySelector('button')?.focus();
  });
  if (consent === 'accepted' || consent === 'declined') chooseAnalytics(consent);
  else banner?.classList.remove('hidden');

  document.querySelectorAll('[data-video-id]').forEach(button => {
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = 'https://player.vimeo.com/video/' + button.dataset.videoId + '?autoplay=1&playsinline=1&title=0&byline=0&portrait=0';
      frame.title = button.dataset.videoTitle;
      frame.allow = 'autoplay; fullscreen; picture-in-picture';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.className = 'video-frame';
      button.replaceWith(frame);
      frame.focus();
      track('video_start', { video_id: button.dataset.videoId });
    });
  });

  // Legacy case-study bookmarks remain usable; new links go to standalone pages.
  function revealLegacyCase() {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    document.querySelectorAll('.case-detail').forEach(section => section.classList.add('hidden'));
    if (target?.classList.contains('case-detail')) {
      target.classList.remove('hidden');
      target.scrollIntoView();
    }
  }
  revealLegacyCase();
  window.addEventListener('hashchange', revealLegacyCase);
  document.querySelectorAll('.case-close').forEach(button => {
    button.addEventListener('click', () => { location.hash = 'case-studies'; });
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('mailto:')) track('contact_click', { method: 'email' });
    if (href.startsWith('https://wa.me/')) track('contact_click', { method: 'whatsapp' });
    if (link.dataset.case) track('select_content', { content_type: 'case_study', item_id: link.dataset.case });
  });

  const form = document.getElementById('enquiryForm');
  const status = document.getElementById('formStatus');
  if (form && window.fetch && window.FormData) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      if (button.disabled) return;
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const destination = data.get('destination');
      button.disabled = true;
      button.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: data, headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          status.className = 'form-status form-error';
          status.textContent = 'Your enquiry was not accepted. Your details are still here. Please try again or use the email or WhatsApp links below.';
          return;
        }
        status.className = 'form-status form-success';
        status.textContent = 'Thank you — your enquiry has been received by our form service for the NowDMC team. We’ll follow up using the email you provided.';
        track('generate_lead', { form: 'contact_form', destination });
        form.reset();
      } catch (_) {
        status.className = 'form-status form-error';
        status.textContent = 'We could not confirm receipt. Your details are still here. Please email or WhatsApp us before retrying, to avoid a duplicate enquiry.';
      } finally {
        button.disabled = false;
        button.textContent = 'Send Enquiry';
        form.removeAttribute('aria-busy');
        status.focus();
      }
    });
  }
})();
