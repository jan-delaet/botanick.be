
// i18next
i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        // fallbackLng: 'nl', supportedLngs: ['nl', 'en', 'fr'], nonExplicitSupportedLngs: true,
        fallbackLng: 'nl', supportedLngs: ['nl', 'en'], nonExplicitSupportedLngs: true,
        backend: { loadPath: './locales/{{lng}}.json' },
        detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: 'botanick-lang', caches: ['localStorage'] }
    }, function () { renderAll(); document.body.classList.remove('i18n-loading'); });

function renderAll() {
    const lng = i18next.language;
    document.documentElement.lang = lng;
    document.title = i18next.t('page.title');
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lng));
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.getAttribute('data-i18n').split(';').map(s => s.trim()).forEach(binding => {
            const m = binding.match(/^\[(\w+)\](.+)$/);
            const mod = m ? m[1] : 'text', key = m ? m[2] : binding, val = i18next.t(key);
            if (mod === 'html') el.innerHTML = val;
            else if (mod === 'placeholder') el.placeholder = val;
            else el.textContent = val;
        });
    });
    // const labels = { nl: 'Sluiten', en: 'Close', fr: 'Fermer' };
    const labels = { nl: 'Sluiten', en: 'Close' };
    document.getElementById('lb-close-label').textContent = labels[lng] || 'Sluiten';
    // If lightbox is open, re-render caption in new language
    if (document.getElementById('lightbox').classList.contains('open')) renderSlide();
}

document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => i18next.changeLanguage(btn.dataset.lang, renderAll))
);

// Nav scroll
window.addEventListener('scroll', () =>
    document.getElementById('main-nav').classList.toggle('scrolled', scrollY > 50)
);

// Fade-up
const fadeObs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
);
document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

// Occasion tabs
document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
}));

// Hamburger
const hbBtn = document.getElementById('hamburger');
const drawer = document.getElementById('mobile-drawer');
hbBtn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    hbBtn.classList.toggle('open', open);
    hbBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
});
function closeDrawer() {
    drawer.classList.remove('open'); hbBtn.classList.remove('open');
    hbBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
}

// ── LIGHTBOX ──────────────────────────────────────────────────────────────
//
// HOW CAPTIONS WORK
// -----------------
// Each [data-lightbox] element can carry a data-caption-i18n attribute
// containing an i18next key (e.g. "portfolio.wedding.title").
// renderSlide() calls i18next.t(key) at display time, so the caption
// automatically updates when the visitor switches language — even while
// the lightbox is open. No hardcoded strings anywhere.
//
// If no data-caption-i18n is set, the lightbox falls back to the <img>
// alt attribute (useful for Instagram posts with real images).
//
const lb = document.getElementById('lightbox');
const lbWrap = document.getElementById('lb-img-wrap');
const lbCap = document.getElementById('lb-caption');
const lbCount = document.getElementById('lb-counter');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

let lbGroup = [];
let lbIdx = 0;

document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-lightbox]');
    if (!trigger || lb.contains(e.target)) return;
    const groupName = trigger.dataset.lightbox;
    lbGroup = Array.from(document.querySelectorAll('[data-lightbox="' + groupName + '"]'));
    lbIdx = lbGroup.indexOf(trigger);
    openLb();
});

function openLb() {
    renderSlide();
    lb.classList.add('open');
    lb.classList.toggle('single', lbGroup.length <= 1);
    document.body.style.overflow = 'hidden';
    lb.focus();
}

function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lbGroup[lbIdx]) lbGroup[lbIdx].focus();
}

function renderSlide() {
    const el = lbGroup[lbIdx];
    const img = el ? el.querySelector('img') : null;
    const src = img ? img.src : '';

    // Resolve caption: i18n key on element takes priority over img alt
    const captionKey = el && el.dataset.captionI18n ? el.dataset.captionI18n : null;
    const caption = captionKey
        ? i18next.t(captionKey)
        : (img && img.alt ? img.alt : '');

    lbWrap.innerHTML = '';

    if (src) {
        const i = document.createElement('img');
        i.src = src; i.alt = caption;
        lbWrap.appendChild(i);
    } else {
        lbWrap.innerHTML =
            '<div class="lightbox-placeholder">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#b8c4a8" stroke-width="1">' +
            '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
            '<circle cx="8.5" cy="8.5" r="1.5"/>' +
            '<polyline points="21 15 16 10 5 21"/>' +
            '</svg>' +
            '<p>' + i18next.t('hero.imgHint') + '</p>' +
            '</div>';
    }

    lbCap.textContent = caption;
    lbCount.textContent = lbGroup.length > 1 ? (lbIdx + 1) + ' / ' + lbGroup.length : '';
}

function lbGo(dir) {
    lbIdx = (lbIdx + dir + lbGroup.length) % lbGroup.length;
    lbWrap.style.opacity = '0';
    setTimeout(function () { renderSlide(); lbWrap.style.opacity = '1'; }, 150);
}
lbWrap.style.transition = 'opacity .15s ease';

lbPrev.addEventListener('click', function () { lbGo(-1); });
lbNext.addEventListener('click', function () { lbGo(1); });
document.getElementById('lb-backdrop').addEventListener('click', closeLb);
document.getElementById('lb-close').addEventListener('click', closeLb);

document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) {
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') lbGo(-1);
        if (e.key === 'ArrowRight') lbGo(1);
    } else {
        if (e.key === 'Escape') closeDrawer();
    }
});

var tx = 0;
lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1);
}, { passive: true });

// Instagram grid
function buildMockGrid() {
    var grid = document.getElementById('ig-grid');
    grid.innerHTML = '';
    for (var i = 0; i < 10; i++) {
        var post = document.createElement('div');
        post.className = 'insta-post';
        post.setAttribute('data-lightbox', 'instagram');
        // Instagram posts use img alt for caption (no i18n key needed — it's a photo caption)
        post.innerHTML =
            '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#7a8c6a" stroke-width="1.2" width="28" height="28" style="opacity:.2">' +
            '<rect x="3" y="3" width="18" height="18" rx="4"/>' +
            '<circle cx="12" cy="12" r="4"/>' +
            '<circle cx="17" cy="7" r="1.2" fill="#7a8c6a" stroke="none"/>' +
            '</svg>' +
            '</div>' +
            '<div class="lb-zoom">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#3d4a2e" stroke-width="2" width="14" height="14">' +
            '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
            '<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>' +
            '</svg>' +
            '</div>';
        grid.appendChild(post);
    }
}

/*
// LIVE INSTAGRAM FEED
async function loadInstagramFeed() {
  var grid = document.getElementById('ig-grid');
  try {
    var data = await fetch('/api/instagram').then(function(r) { return r.json(); });
    (data.data || []).slice(0, 10).forEach(function(post) {
      var src = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
      var el  = document.createElement('div');
      el.className = 'insta-post';
      el.setAttribute('data-lightbox', 'instagram');
      el.innerHTML = '<img src="' + src + '" alt="@botanick" />' +
        '<div class="lb-zoom"><svg viewBox="0 0 24 24" fill="none" stroke="#3d4a2e" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div>';
      grid.appendChild(el);
    });
  } catch(e) { buildMockGrid(); }
}
loadInstagramFeed();
*/

buildMockGrid();

function handleFormSubmit(e) {
    e.preventDefault();
    alert(i18next.t('form.successMsg'));
}