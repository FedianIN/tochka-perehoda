// ===== Единственная настройка: ссылка на Telegram =====
// [ЗАПОЛНИТЬ: ссылка на Telegram], например "https://t.me/username".
// Пока здесь не https-ссылка, все кнопки ведут к финальному блоку страницы.
const TELEGRAM_URL = "[ЗАПОЛНИТЬ: ссылка на Telegram]";

(function () {
  if (/^https:\/\//.test(TELEGRAM_URL)) {
    document.querySelectorAll(".js-tg").forEach(function (a) {
      a.href = TELEGRAM_URL;
      a.target = "_blank";
      a.rel = "noopener";
    });
    document.querySelectorAll(".js-tg-placeholder").forEach(function (el) { el.hidden = true; });
  }
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // шапка прозрачная поверх фото и плотная после прокрутки
  var header = document.querySelector(".site-header");
  if (header && document.body.classList.contains("has-hero")) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // подсветка текущего раздела в навигации; скролл не перехватывается
  var links = document.querySelectorAll(".nav-links a");
  if (!("IntersectionObserver" in window) || !links.length) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute("aria-current"); });
      var a = byId[e.target.id];
      if (a) a.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(byId).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) io.observe(s);
  });
})();
