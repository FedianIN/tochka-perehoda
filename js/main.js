(function () {
  'use strict';

  window.__mainOk = true; /* см. запасной показ блоков в <head> */
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
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Один обработчик прокрутки на всё, не чаще одного раза за кадр */
  var scrollTasks = [];
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      scrollTasks.slice().forEach(function (fn) { fn(); });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  function syncHeader() {
    header.classList.toggle('is-solid', window.scrollY > 24);
  }
  if (header) {
    scrollTasks.push(syncHeader);
    syncHeader();
  }
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
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

  /* ---------- Закреплённая кнопка записи: после первого экрана, скрыта у финального призыва и подвала ---------- */
  var sticky = document.getElementById('stickyCta');
  if (sticky && 'IntersectionObserver' in window) {
    var seen = { hero: true, contact: false, footer: false };
    function syncSticky() {
      sticky.classList.toggle('is-on', !seen.hero && !seen.contact && !seen.footer);
    }
    var stickyIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { seen[entry.target.dataset.stickyWatch] = entry.isIntersecting; });
      syncSticky();
    });
    [['.hero', 'hero'], ['#contact', 'contact'], ['.footer', 'footer']].forEach(function (pair) {
      var el = document.querySelector(pair[0]);
      if (el) { el.dataset.stickyWatch = pair[1]; stickyIo.observe(el); }
    });
  }

  /* ---------- Текущий раздел в меню ---------- */
  if (nav && 'IntersectionObserver' in window) {
    var navLinks = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { navLinks[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navLinks).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- Крупная фраза: слова проявляются по одному (включается атрибутом data-words, сейчас не используется) ---------- */
  document.querySelectorAll('[data-words]').forEach(function (block) {
    var words = [];
    var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(/( +)/);
      if (parts.length === 1 && !parts[0].trim()) return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (!part) return;
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        var span = document.createElement('span');
        span.className = 'w';
        span.textContent = part;
        frag.appendChild(span);
        words.push(span);
      });
      node.parentNode.replaceChild(frag, node);
    });

    if (reduceMotion) {
      words.forEach(function (w) { w.classList.add('is-on'); });
      return;
    }
    var next = 0;
    function update() {
      var trigger = window.innerHeight * 0.72;
      while (next < words.length && words[next].getBoundingClientRect().top < trigger) {
        words[next].classList.add('is-on');
        next++;
      }
      if (next >= words.length) {
        var i = scrollTasks.indexOf(update);
        if (i > -1) scrollTasks.splice(i, 1);
      }
    }
    scrollTasks.push(update);
    update();
  });

  /* ---------- Счётчики: от 0 до значения при появлении ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var easeOutExpo = function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); };
    var runCounter = function (el) {
      var target = parseInt(el.dataset.count, 10);
      var duration = 1600;
      var start = null;
      var step = function (now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        el.textContent = String(Math.round(target * easeOutExpo(t)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      /* Страховка: если вкладка в фоне и кадры не идут, показываем итог */
      setTimeout(function () { el.textContent = String(target); }, duration + 300);
    };
    counters.forEach(function (el) { el.textContent = '0'; });
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterIo.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterIo.observe(el); });
  }

  /* ---------- Параллакс: элемент с data-speed отстаёт от прокрутки ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('[data-speed]').forEach(function (el) {
      var speed = parseFloat(el.dataset.speed) || 1;
      scrollTasks.push(function () {
        var y = window.scrollY;
        if (y > window.innerHeight * 1.5) return;
        el.style.transform = 'translate3d(0,' + (y * (1 - speed)).toFixed(1) + 'px,0)';
      });
    });
  }

  /* ---------- Линия прогресса в блоке «Как это работает» ---------- */
  var processSteps = document.querySelector('.process__steps');
  if (processSteps) {
    var line = processSteps.querySelector('.process__line');
    var syncLine = function () {
      var r = processSteps.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / r.height;
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    if (reduceMotion) line.style.setProperty('--p', '1');
    else { scrollTasks.push(syncLine); syncLine(); }
  }

  /* ---------- Самопроверка ---------- */
  var form = document.getElementById('check-form');
  var result = document.getElementById('check-result');
  var text = document.getElementById('check-text');
  var copyBtn = document.getElementById('check-copy');
  var tgBtn = document.getElementById('check-tg');
  var TG = 'https://t.me/igor_fedianin';
  var tgBase = TG;
  var MAX_URL = 1500; /* длиннее — часть клиентов Telegram обрезает ссылку */

  /* Готовое сообщение для каждой кнопки записи: Игорь сразу видит, что выбрано */
  var tgMessages = {
    trial: 'Привет, Игорь. Хочу записаться на пробную сессию (50 минут).',
    single: 'Привет, Игорь. Хочу записаться на разовую сессию (60 минут).',
    pack: 'Привет, Игорь. Хочу записаться на «Перезагрузку» (5 сессий).',
    program: 'Привет, Игорь. Хочу записаться в программу Breaking Changes (8 сессий).'
  };
  document.querySelectorAll('[data-tg]').forEach(function (a) {
    var msg = tgMessages[a.dataset.tg];
    if (msg) a.setAttribute('href', TG + '?text=' + encodeURIComponent(msg));
  });

  var topics = {
    soft: 'soft skills, которые AI сделал важными',
    lead: 'управление агентами и людьми',
    role: 'новый вид специалиста',
    self: 'не потерять себя'
  };

  function checked() {
    return Array.prototype.slice.call(form.querySelectorAll('input:checked'));
  }

  function buildMessage() {
    var lines = checked().map(function (i) { return '— ' + i.nextElementSibling.textContent; });
    return 'Привет, Игорь. Мне знакомо:\n' + lines.join('\n');
  }

  if (form && result) {
    form.addEventListener('change', function () {
      var items = checked();
      if (!items.length) {
        result.hidden = true;
        if (tgBtn) tgBtn.setAttribute('href', TG + '?text=' + encodeURIComponent(tgMessages.trial));
        return;
      }
      var count = {};
      items.forEach(function (i) { count[i.dataset.topic] = (count[i.dataset.topic] || 0) + 1; });
      var top = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
      text.textContent = 'Отмечено: ' + items.length + '. Ближе всего опора «' + topics[top] +
        '». Этого достаточно, чтобы начать разговор: кнопка «Записаться» откроет Telegram с отмеченным уже в сообщении.';
      if (tgBtn) {
        var url = tgBase + '?text=' + encodeURIComponent(buildMessage());
        /* Слишком длинное сообщение режем до названия опоры: полный текст остаётся в «Скопировать» */
        if (url.length > MAX_URL) {
          url = tgBase + '?text=' + encodeURIComponent('Привет, Игорь. Хочу записаться на пробную сессию. Ближе всего опора «' + topics[top] + '».');
        }
        tgBtn.setAttribute('href', url);
      }
      result.hidden = false;
    });

    copyBtn.addEventListener('click', function () {
      var message = buildMessage();
      var done = function () {
        copyBtn.textContent = 'Скопировано';
        setTimeout(function () { copyBtn.textContent = 'Скопировать отмеченное'; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(done, function () {
          copyBtn.textContent = 'Не удалось скопировать';
          setTimeout(function () { copyBtn.textContent = 'Скопировать отмеченное'; }, 2500);
        });
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
