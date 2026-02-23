/* ==========================================
   1. THEME TOGGLE LOGIC
   ========================================== */
const toggleBtn = document.getElementById('theme-toggle');
const icon = document.getElementById('theme-icon');
const html = document.documentElement;

if (toggleBtn) {
    toggleBtn.onclick = function() {
        html.classList.toggle('dark-theme');
        const isDark = html.classList.contains('dark-theme');
        
        // Update Cusdis Theme
        if (window.CUSDIS) { 
            window.CUSDIS.setTheme(isDark ? 'dark' : 'light'); 
        }
        
        // Save Preference & Update Icon
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            icon.innerText = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            icon.innerText = '🌙';
        }
    }
}

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
