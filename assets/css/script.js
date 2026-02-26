/* ==========================================
   1. THEME TOGGLE & PERSISTENCE
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const iconContainer = document.getElementById('theme-icon');
    const html = document.documentElement;

    // PROFESSIONAL SUN: Bold center with sharp, clean triangular rays (Matches image_daf303.png)
    const proSunSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#fbbf24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37a.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06a.996.996 0 000-1.41zM7.05 18.36a.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06a.996.996 0 000-1.41z"/></svg>`;
    
    // PROFESSIONAL MOON: Clean crescent without the dots/stars (Matches the shape of image_daf2de.png)
    const proMoonSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="#64748b"><path d="M12.1,22c-4.8,0-9-3.4-9.8-8.2c-1.1-6,2.8-11.7,8.8-12.7c0.6-0.1,1.1,0.4,1.1,1c0,0.4-0.2,0.8-0.6,0.9c-3.9,1.5-6,5.9-4.7,10s5.5,6.5,9.6,5.4c0.4-0.1,0.9,0.1,1.1,0.5c0.2,0.5,0.1,1.1-0.4,1.4C15.6,21.3,13.8,22,12.1,22z"/></svg>`;

    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            // DARK MODE -> Show SUN to switch back
            if (iconContainer) iconContainer.innerHTML = proSunSVG;
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark-theme');
            // LIGHT MODE -> Show MOON to switch back
            if (iconContainer) iconContainer.innerHTML = proMoonSVG;
            localStorage.setItem('theme', 'light');
        }
        
        if (window.CUSDIS) {
            window.CUSDIS.setTheme(theme);
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.onclick = function() {
            const isDark = html.classList.contains('dark-theme');
            applyTheme(isDark ? 'light' : 'dark');
        };
    }
});

/* PROGRESS BAR & CUSDIS LOAD (Keep independent) */
window.onscroll = function() {
    const bar = document.getElementById("myBar");
    const article = document.querySelector('.entry-content');
    if (!bar || !article) return;
    const rect = article.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    let progress = (Math.abs(rect.top) / totalScrollable) * 100;
    if (rect.top > 0) progress = 0;
    bar.style.width = Math.min(Math.max(progress, 0), 100) + "%";
};

window.addEventListener('load', function() {
    if (window.CUSDIS) {
        const isDark = document.documentElement.classList.contains('dark-theme');
        window.CUSDIS.setTheme(isDark ? 'dark' : 'light');
    }
});
