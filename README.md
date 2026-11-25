# Точка перехода — сайт

Статический сайт для GitHub Pages: без сборки, без зависимостей, без внешних запросов. Шрифт Manrope (лицензия OFL) лежит в `assets/fonts/`. Открывается на домене `igor-fedianin.com`.

Оформление следует скиллу landing-page-design: один шрифт, размеры только по шкале Tailwind (12, 14, 16, 18, 20, 24, 30, 36, 48, 60 px), отступы только 2 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 px, радиусы Tailwind, фоны без градиентов, без курсива, анимации на кривой `cubic-bezier(.22, 1, .36, 1)`. Названия текстовых стилей (Heading 1, Body 3, Caption 3 и т. д.) подписаны в комментариях в `css/style.css`.

## Что где лежит

| Файл | Зачем |
| --- | --- |
| `index.html` | Главная страница: весь текст, SEO-теги, разметка Schema.org |
| `oferta.html` | Условия работы (место под публичную оферту) |
| `privacy.html` | Политика конфиденциальности |
| `404.html` | Страница «не найдено» |
| `css/style.css` | Оформление: цвета и шрифты заданы в начале файла |
| `js/config.js` | **Номера счётчиков** Метрики, GA4 и Google Ads |
| `js/main.js` | Меню, самопроверка, баннер cookie, цели аналитики |
| `robots.txt`, `sitemap.xml` | Для поисковиков |
| `llms.txt` | Краткое описание практики для ИИ-ассистентов |
| `CNAME` | Привязка домена `igor-fedianin.com` |
| `.nojekyll` | Отдаёт файлы как есть, без обработки Jekyll |
| `assets/` | Иконки и картинка для превью в соцсетях |

## Публикация на GitHub Pages

Сайт уже привязан к репозиторию `FedianIN/tochka-perehoda`. Чтобы заменить старую версию:

1. Скопируйте всё содержимое этой папки в репозиторий (кроме `.claude/` и `README.md`, они сайту не нужны) с заменой файлов.
2. Сделайте коммит и отправьте в ветку, из которой публикуется Pages (обычно `main`).
3. В репозитории откройте Settings → Pages и проверьте: источник — ветка `main`, папка `/ (root)`, домен `igor-fedianin.com`, включён Enforce HTTPS.
4. Через 1–2 минуты откройте https://igor-fedianin.com и обновите страницу с Ctrl+F5.

## Как вставить свои фото

На главной два места под фото, помечены комментариями `ФОТО 1` и `ФОТО 2`. Пока фото нет, на первом экране стоит иллюстрация, а блок «Кто ведёт сессии» показывает квалификацию плитками вместо портрета.

1. Сохраните фото в `assets/` в формате WebP (качество 80) и JPG как запасной:
   - главное фото первого экрана: `portrait.webp` и `portrait.jpg`, 1200×1500 px, лучше на тёмном или нейтральном фоне;
   - небольшой портрет для блока «Кто ведёт сессии»: `coach.webp` и `coach.jpg`, 800×1000 px.
2. **Фото 1.** Внутри блока `<div class="hero__visual" ...>` удалите весь тег `<svg>...</svg>`, а на его место вставьте код ниже. Две плавающие карточки `<span class="float ...">` оставьте. У самого блока замените `aria-label="Место для портрета Игоря"` на `aria-label="Игорь, коуч"`.

```html
<picture>
  <source srcset="assets/portrait.webp" type="image/webp">
  <img src="assets/portrait.jpg" width="1200" height="1500" alt="" fetchpriority="high" decoding="async">
</picture>
```

3. **Фото 2.** На место комментария `ФОТО 2` вместо плиток `<ul class="coach__creds">` вставьте код ниже:

```html
<picture>
  <source srcset="assets/coach.webp" type="image/webp">
  <img class="photo" src="assets/coach.jpg" width="800" height="1000"
       alt="Игорь, коуч" loading="lazy" decoding="async">
</picture>
```

Атрибуты `width` и `height` обязательны: без них страница «прыгает» при загрузке.

## Аналитика и реклама

Откройте `js/config.js` и впишите идентификаторы. Пока они пустые, счётчики не грузятся и баннер cookie не показывается.

- **Яндекс Метрика.** Создайте счётчик на metrika.yandex.ru, впишите номер в `yandexMetrikaId`. В Метрике добавьте цели типа «JavaScript-событие» с идентификаторами из таблицы ниже.
- **Google Analytics 4.** Впишите `G-XXXXXXXXXX` в `ga4Id`. Событие `generate_lead` отметьте как ключевое.
- **Google Ads.** Впишите `AW-XXXXXXXXX` в `googleAdsId` и ярлык конверсии в `googleAdsConversionLabel`. Учтите: Google Ads не показывает рекламу в России, он пригодится для русскоязычных за рубежом. Для России используйте Яндекс Директ, цели берутся из Метрики.

| Цель | Когда срабатывает |
| --- | --- |
| `tg_click` | Любой клик по кнопке или ссылке на Telegram (главная конверсия) |
| `tg_header`, `tg_hero`, `tg_check`, `tg_final`, `tg_footer` | Клик в конкретном месте страницы |
| `tg_price_intro`, `tg_price_single`, `tg_price_4`, `tg_price_8` | Клик в карточке формата |
| `check_copy` | Скопирован список в блоке самопроверки |

В рекламных ссылках используйте UTM-метки, например `https://igor-fedianin.com/?utm_source=yandex&utm_medium=cpc&utm_campaign=coaching`.

## Индексация: сейчас сайт закрыт

Сайт временно скрыт от поисковиков и ИИ. Чтобы открыть:

1. В `index.html`, `oferta.html` и `privacy.html` замените строку `<meta name="robots" content="noindex, nofollow, noarchive">` на `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`.
2. В `robots.txt` у списка ИИ-ботов замените `Disallow: /` на `Allow: /` и добавьте в конец строку `Sitemap: https://igor-fedianin.com/sitemap.xml`.

## Поисковики

1. **Яндекс Вебмастер** (webmaster.yandex.ru): добавьте сайт, вставьте код в закомментированный тег `yandex-verification` в `index.html`, отправьте `sitemap.xml`, укажите регион.
2. **Google Search Console**: то же самое с тегом `google-site-verification`.
3. **Bing Webmaster Tools**: можно импортировать сайт из Search Console. Поиск ChatGPT и Copilot опирается на индекс Bing.

## Что нужно дописать

- [ ] Реквизиты в `privacy.html` (помечено цветом на странице) и текст оферты в `oferta.html`.
- [ ] Фото вместо двух заглушек.
- [ ] Номера счётчиков в `js/config.js`.
- [ ] Коды подтверждения Вебмастера и Search Console в `index.html`.
- [ ] Отзывы: блок готов и закомментирован в `index.html`, включайте только с реальными отзывами и согласием клиентов.
- [ ] При каждой правке текста обновляйте дату в `sitemap.xml`, `llms.txt` и поле `dateModified` в `index.html`. Цены и ответы на вопросы повторяются в трёх местах: в тексте страницы, в блоке JSON-LD и в `llms.txt` — меняйте везде сразу.
