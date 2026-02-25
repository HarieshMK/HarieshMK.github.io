/* ==========================================
   1. THEME TOGGLE & PERSISTENCE
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const iconContainer = document.getElementById('theme-icon');
    const html = document.documentElement;

    // Clean SVG Icons
    const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            if (iconContainer) iconContainer.innerHTML = sunSVG;
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark-theme');
            if (iconContainer) iconContainer.innerHTML = moonSVG;
            localStorage.setItem('theme', 'light');
        }
        
        if (window.CUSDIS) {
            window.CUSDIS.setTheme(theme);
        }
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Click Event
    if (toggleBtn) {
        toggleBtn.onclick = function() {
            const isDark = html.classList.contains('dark-theme');
            applyTheme(isDark ? 'light' : 'dark');
        };
    }
});

/* ==========================================
   2. PROGRESS BAR LOGIC
   ========================================== */
window.onscroll = function() {
    const bar = document.getElementById("myBar");
    if (!bar) return;
    const container = document.querySelector('.progress-container');
    const article = document.querySelector('.entry-content');
    
    if (!article) return;

    const rect = article.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollable = rect.height - windowHeight;
    let progress = (Math.abs(rect.top) / totalScrollable) * 100;

    if (rect.top > 0) progress = 0;
    
    if (rect.top < 100 && rect.bottom > 0) {
        container.style.opacity = "1";
    } else {
        container.style.opacity = "0";
    }

    bar.style.width = Math.min(Math.max(progress, 0), 100) + "%";
};

/* ==========================================
   3. EXTERNAL WIDGET FIXES (CUSDIS)
   ========================================== */
window.addEventListener('load', function() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    if (window.CUSDIS) {
        window.CUSDIS.setTheme(isDark ? 'dark' : 'light');
    }
});
