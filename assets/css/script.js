/* ==========================================
   1. THEME TOGGLE & PERSISTENCE
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const iconContainer = document.getElementById('theme-icon');
    const html = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            // Reverting to the "Bulky" Yellow Moon Emoji
            if (iconContainer) iconContainer.innerHTML = '🌙'; 
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark-theme');
            // Reverting to the Bright Sun Emoji
            if (iconContainer) iconContainer.innerHTML = '☀️';
            localStorage.setItem('theme', 'light');
        }
        
        if (window.CUSDIS) {
            window.CUSDIS.setTheme(theme);
        }
    }

    // Initialize
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (toggleBtn) {
        toggleBtn.onclick = function() {
            const isDark = html.classList.contains('dark-theme');
            applyTheme(isDark ? 'light' : 'dark');
        };
    }
});

/* PROGRESS BAR LOGIC */
window.onscroll = function() {
    const bar = document.getElementById("myBar");
    if (!bar) return;
    const container = document.querySelector('.progress-container');
    const article = document.querySelector('.entry-content');
    
    if (!article) return;

    const rect = article.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    let progress = (Math.abs(rect.top) / totalScrollable) * 100;

    if (rect.top > 0) progress = 0;
    
    if (rect.top < 100 && rect.bottom > 0) {
        container.style.opacity = "1";
    } else {
        container.style.opacity = "0";
    }

    bar.style.width = Math.min(Math.max(progress, 0), 100) + "%";
};

window.addEventListener('load', function() {
    if (window.CUSDIS) {
        const isDark = document.documentElement.classList.contains('dark-theme');
        window.CUSDIS.setTheme(isDark ? 'dark' : 'light');
    }
});
