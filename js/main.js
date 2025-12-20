document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    injectSwitchers();
});

// --- Theme Logic ---

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const btn = document.getElementById('theme-switcher-btn');
    if (!btn) return;

    // Sun icon for light mode (shows when dark mode is active to switch to light)
    // Moon icon for dark mode (shows when light mode is active to switch to dark)
    // Actually usually you show the icon of the mode you will switch TO, or the current mode.
    // Let's show the CURRENT mode icon, or a toggle.
    // Let's just swap icons.

    const sunSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
    const moonSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>';

    btn.innerHTML = isDark ? sunSvg : moonSvg;
}

// --- Language Logic ---

const supportedLanguages = {
    'cs': { flag: '🇨🇿', name: 'Čeština' },
    'en': { flag: '🇬🇧', name: 'English' },
    'de': { flag: '🇩🇪', name: 'Deutsch' },
    'es': { flag: '🇪🇸', name: 'Español' },
    'ru': { flag: '🇷🇺', name: 'Русский' }
};

function initLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    const savedLang = localStorage.getItem('language');

    let targetLang = 'cs';
    if (langParam && supportedLanguages[langParam]) {
        targetLang = langParam;
    } else if (savedLang && supportedLanguages[savedLang]) {
        targetLang = savedLang;
    }

    if (targetLang !== 'cs') {
        loadLanguage(targetLang);
    } else {
        updateHreflangs();
    }
}

async function loadLanguage(lang) {
    if (!supportedLanguages[lang]) return;

    try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) throw new Error(`Could not load ${lang} translations`);
        const translations = await response.json();
        applyTranslations(translations);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        updateHreflangs();
    } catch (e) {
        console.error(e);
    }
}

function applyTranslations(translations) {
    // Menu Items
    setText('#menu-item-292 .menu-text', translations.menu_home);
    setText('#menu-item-293 .menu-text', translations.menu_shop);
    setText('#menu-item-294 .menu-text', translations.menu_about);
    setText('#menu-item-295 .menu-text', translations.menu_blog);
    setText('#menu-item-296 .menu-text', translations.menu_contact);
    setText('#menu-item-2303 .menu-text', translations.menu_domitoo);
    setText('#menu-item-2317 .menu-text', translations.menu_account);

    // Content - Specific Selectors based on index.html structure
    // Hero Title
    const heroTitle = document.querySelector('.uagb-ifb-title');
    if (heroTitle && translations.hero_title) heroTitle.innerText = translations.hero_title;

    // Hero Subtitle/Desc
    const heroDesc = document.querySelector('.uagb-ifb-desc strong');
    if (heroDesc && translations.hero_subtitle) heroDesc.innerText = translations.hero_subtitle;

    // CTA Button
    const cta = document.querySelector('.uagb-infobox-cta-link .uagb-inline-editing');
    if (cta && translations.cta_more) cta.innerText = translations.cta_more;
}

function setText(selector, text) {
    if (!text) return;
    const el = document.querySelector(selector);
    if (el) el.innerText = text;
}

function updateHreflangs() {
    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    const baseUrl = window.location.origin + window.location.pathname;

    // Add hreflang tags for all supported languages
    for (const code of Object.keys(supportedLanguages)) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = code;
        link.href = `${baseUrl}?lang=${code}`;
        document.head.appendChild(link);
    }
}

// --- Injection Logic ---

function injectSwitchers() {
    // Container
    const container = document.createElement('div');
    container.id = 'custom-switchers';

    // Theme Switcher
    const themeBtn = document.createElement('button');
    themeBtn.id = 'theme-switcher-btn';
    themeBtn.title = "Toggle Dark/Light Mode";
    themeBtn.onclick = toggleTheme;
    container.appendChild(themeBtn);

    // Language Switcher
    const langSelect = document.createElement('select');
    langSelect.id = 'lang-switcher-select';
    langSelect.onchange = (e) => loadLanguage(e.target.value);

    for (const [code, info] of Object.entries(supportedLanguages)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${info.flag} ${code.toUpperCase()}`;
        if (code === (localStorage.getItem('language') || 'cs')) {
            option.selected = true;
        }
        langSelect.appendChild(option);
    }
    container.appendChild(langSelect);

    // Insert into Header
    // Target: .site-header-primary-section-right or .ast-site-header-cart
    // Try to insert before the cart if possible
    const target = document.querySelector('.site-header-primary-section-right');
    if (target) {
        // Prepend to the right section so it sits to the left of the cart (if flex direction is row)
        // or just append if we want it on the far right.
        // Usually right section has the cart. Let's put it before the cart.
        if (target.firstChild) {
            target.insertBefore(container, target.firstChild);
        } else {
            target.appendChild(container);
        }
    } else {
        // Fallback: fixed position
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';
        document.body.appendChild(container);
    }

    // Initialize icon
    updateThemeIcon(document.body.classList.contains('dark-mode'));
}
