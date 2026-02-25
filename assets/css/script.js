/* ==========================================
   1. THEME TOGGLE & PERSISTENCE
   ========================================== */
// We wrap this in a function that waits for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const html = document.documentElement;

    // 1. Function to apply theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-theme');
            if (icon) icon.innerText = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark-theme');
            if (icon) icon.innerText = '🌙';
            localStorage.setItem('theme', 'light');
        }
        
        // Update Cusdis if it exists
        if (window.CUSDIS) {
            window.CUSDIS.setTheme(theme);
        }
    }

    // 2. Check for saved theme immediately on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // 3. Toggle click event
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
    const container = document.querySelector('.progress-container');
    const article = document.querySelector('.entry-content');
    
    if (!bar || !article) return;

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
