
// ═══════════════════════════════════════════════════════
// i18next INITIALISATION
// ═══════════════════════════════════════════════════════
i18next
    .use(i18nextHttpBackend)          // loads /locales/{lng}.json
    .use(i18nextBrowserLanguageDetector) // reads browser language
    .init({
        fallbackLng: 'nl',             // default to Dutch if unrecognised
        supportedLngs: ['nl', 'en', 'fr'],
        nonExplicitSupportedLngs: true, // 'nl-BE' → 'nl', 'fr-BE' → 'fr'
        backend: {
            loadPath: '/locales/{{lng}}.json'
        },
        detection: {
            // Check localStorage first (manual override), then browser language
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'botanick-lang',
            caches: ['localStorage']
        }
    }, onI18nReady);

// ═══════════════════════════════════════════════════════
// RENDER — called once on load and on every language change
// ═══════════════════════════════════════════════════════
function onI18nReady() {
    renderAll();
    document.body.classList.remove('i18n-loading');
}

function renderAll() {
    const lng = i18next.language;

    // Update <html lang> and <title>
    document.documentElement.lang = lng;
    document.title = i18next.t('page.title');

    // Update switcher button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lng);
    });

    // Translate every data-i18n element
    // Supports modifiers: [html], [placeholder], bare (textContent)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const raw = el.getAttribute('data-i18n');

        // Parse out multiple bindings separated by ';'
        // e.g. data-i18n="[placeholder]form.namePh" or "[html]hero.title"
        const bindings = raw.split(';').map(s => s.trim());
        bindings.forEach(binding => {
            const match = binding.match(/^\[(\w+)\](.+)$/) || [null, 'text', binding];
            const modifier = match[1];
            const key = match[2];
            const value = i18next.t(key);

            if (modifier === 'html') el.innerHTML = value;
            else if (modifier === 'placeholder') el.placeholder = value;
            else el.textContent = value;
        });
    });
}

// ═══════════════════════════════════════════════════════
// LANGUAGE SWITCHER
// ═══════════════════════════════════════════════════════
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        i18next.changeLanguage(btn.dataset.lang, renderAll);
    });
});

// ═══════════════════════════════════════════════════════
// NAV SCROLL
// ═══════════════════════════════════════════════════════
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 50);
});

// ═══════════════════════════════════════════════════════
// FADE-UP ON SCROLL
// ═══════════════════════════════════════════════════════
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

// ═══════════════════════════════════════════════════════
// OCCASION TABS
// ═══════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ═══════════════════════════════════════════════════════
// INSTAGRAM MOCK GRID
// ═══════════════════════════════════════════════════════
function buildMockGrid() {
    const grid = document.getElementById('ig-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const post = document.createElement('div');
        post.className = 'insta-post';
        post.innerHTML = `
          <div class="insta-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7a8c6a" stroke-width="1.2">
              <rect x="3" y="3" width="18" height="18" rx="4"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17" cy="7" r="1.2" fill="#7a8c6a" stroke="none"/>
            </svg>
          </div>
          <div class="insta-overlay">↗</div>`;
        grid.appendChild(post);
    }
}

// LIVE FEED — uncomment when your serverless proxy is ready:
/*
async function loadInstagramFeed() {
  const grid = document.getElementById('ig-grid');
  try {
    const res  = await fetch('/api/instagram');
    const data = await res.json();
    (data.data || []).slice(0, 10).forEach(post => {
      const img = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
      const a   = document.createElement('a');
      a.className = 'insta-post';
      a.href = post.permalink; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:cover" loading="lazy"/>
                     <div class="insta-overlay">↗</div>`;
      grid.appendChild(a);
    });
  } catch (e) { buildMockGrid(); }
}
loadInstagramFeed();
*/
buildMockGrid();

// ═══════════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════════
function handleFormSubmit(e) {
    e.preventDefault();
    alert(i18next.t('form.successMsg'));
}