/* ==========================================
   1. THEME TOGGLE & PERSISTENCE
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const iconContainer = document.getElementById('theme-icon');
    const html = document.documentElement;

    // PREMIUM SUN: Minimalist, clean strokes, no "cartoon" feel
    const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    
    // PREMIUM MOON: A sleek, balanced crescent
    const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            // Logic: We are in DARK, so show the SUN to switch to light
            if (iconContainer) {
                iconContainer.innerHTML = sunSVG;
                iconContainer.querySelector('svg').style.stroke = "#fbbf24"; // Golden Sun
            }
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark-theme');
            // Logic: We are in LIGHT, so show the MOON to switch to dark
            if (iconContainer) {
                iconContainer.innerHTML = moonSVG;
                iconContainer.querySelector('svg').style.stroke = "#64748b"; // Sleek Grey Moon
            }
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
