(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var CONSENT_KEY = 'tp_consent';

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var header = document.querySelector('.header');
  function syncHeader() {
    var open = burger && burger.getAttribute('aria-expanded') === 'true';
    header.classList.toggle('is-solid', open || window.scrollY > 24);
  }
  if (header) {
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    syncHeader();
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Самопроверка ---------- */
  var form = document.getElementById('check-form');
  var result = document.getElementById('check-result');
  var text = document.getElementById('check-text');
  var copyBtn = document.getElementById('check-copy');
  var topics = {
    self: 'самореализация',
    career: 'карьерные развилки',
    role: 'роль руководителя',
    talk: 'сложные разговоры'
  };

  function checked() {
    return Array.prototype.slice.call(form.querySelectorAll('input:checked'));
  }

  if (form && result) {
    form.addEventListener('change', function () {
      var items = checked();
      if (!items.length) { result.hidden = true; return; }
      var count = {};
      items.forEach(function (i) { count[i.dataset.topic] = (count[i.dataset.topic] || 0) + 1; });
      var top = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
      text.textContent = 'Отмечено: ' + items.length + '. Ближе всего тема «' + topics[top] +
        '». Этого достаточно, чтобы начать разговор: скопируйте отмеченное и пришлите мне одним сообщением.';
      result.hidden = false;
    });

    copyBtn.addEventListener('click', function () {
      var lines = checked().map(function (i) { return '— ' + i.nextElementSibling.textContent; });
      var message = 'Здравствуйте, Игорь. Мне знакомо:\n' + lines.join('\n');
      var done = function () {
        copyBtn.textContent = 'Скопировано';
        setTimeout(function () { copyBtn.textContent = 'Скопировать отмеченное'; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = message;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
      goal('check_copy');
    });
  }

  /* ---------- Аналитика: загружается только после согласия ---------- */
  var analyticsOn = false;
  var hasAnalytics = !!(cfg.yandexMetrikaId || cfg.ga4Id || cfg.googleAdsId);

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function startAnalytics() {
    if (analyticsOn || !hasAnalytics) return;
    analyticsOn = true;

    if (cfg.yandexMetrikaId) {
      window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
      window.ym.l = Date.now();
      loadScript('https://mc.yandex.ru/metrika/tag.js');
      window.ym(cfg.yandexMetrikaId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }

    var gtagId = cfg.ga4Id || cfg.googleAdsId;
    if (gtagId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
      window.gtag('js', new Date());
      if (cfg.ga4Id) window.gtag('config', cfg.ga4Id);
      if (cfg.googleAdsId) window.gtag('config', cfg.googleAdsId);
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gtagId));
    }
  }

  /* Цель: название одинаково в Метрике (reachGoal) и в GA4 (event) */
  function goal(name) {
    if (!analyticsOn) return;
    if (cfg.yandexMetrikaId && window.ym) window.ym(cfg.yandexMetrikaId, 'reachGoal', name);
    if (window.gtag) {
      window.gtag('event', name);
      if (name.indexOf('tg_') === 0) {
        window.gtag('event', 'generate_lead', { method: 'telegram', source: name });
        if (cfg.googleAdsId && cfg.googleAdsConversionLabel) {
          window.gtag('event', 'conversion', { send_to: cfg.googleAdsId + '/' + cfg.googleAdsConversionLabel });
        }
      }
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-goal]');
    if (!el) return;
    goal(el.dataset.goal);
    if (el.dataset.goal.indexOf('tg_') === 0) goal('tg_click');
  });

  /* ---------- Баннер cookie ---------- */
  var banner = document.getElementById('cookie');
  var consent = store(CONSENT_KEY);
  if (hasAnalytics) {
    if (consent === 'yes') {
      startAnalytics();
    } else if (consent !== 'no' && banner) {
      banner.hidden = false;
      banner.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-consent]');
        if (!btn) return;
        store(CONSENT_KEY, btn.dataset.consent);
        banner.hidden = true;
        if (btn.dataset.consent === 'yes') startAnalytics();
      });
    }
  }
})();
