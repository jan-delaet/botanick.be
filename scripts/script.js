
// i18next init
i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng: 'nl',
        supportedLngs: ['nl', 'en', 'fr'],
        nonExplicitSupportedLngs: true,
        backend: { loadPath: 'botanick.be/locales/{{lng}}.json' },
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'botanick-lang',
            caches: ['localStorage']
        }
    }, function () { renderAll(); document.body.classList.remove('i18n-loading'); });

function renderAll() {
    const lng = i18next.language;
    document.documentElement.lang = lng;
    document.title = i18next.t('page.title');

    // Sync all lang buttons (nav + drawer)
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lng);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const raw = el.getAttribute('data-i18n');
        raw.split(';').map(s => s.trim()).forEach(binding => {
            const m = binding.match(/^\[(\w+)\](.+)$/);
            const modifier = m ? m[1] : 'text';
            const key = m ? m[2] : binding;
            const value = i18next.t(key);
            if (modifier === 'html') el.innerHTML = value;
            else if (modifier === 'placeholder') el.placeholder = value;
            else el.textContent = value;
        });
    });
}

// Language buttons — all of them (nav + drawer share same handler)
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        i18next.changeLanguage(btn.dataset.lang, renderAll);
    });
});

// Nav scroll
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 50);
});

// Fade-up on scroll
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

// Occasion tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// Hamburger / drawer
const hamburgerBtn = document.getElementById('hamburger');
const drawer = document.getElementById('mobile-drawer');

hamburgerBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeDrawer() {
    drawer.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

// Instagram mock grid
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
          <div class="insta-overlay">&#8599;</div>`;
        grid.appendChild(post);
    }
}

// LIVE FEED — uncomment when proxy is ready:
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
                     <div class="insta-overlay">&#8599;</div>`;
      grid.appendChild(a);
    });
  } catch (e) { buildMockGrid(); }
}
loadInstagramFeed();
*/
buildMockGrid();

// Contact form
function handleFormSubmit(e) {
    e.preventDefault();
    alert(i18next.t('form.successMsg'));
}