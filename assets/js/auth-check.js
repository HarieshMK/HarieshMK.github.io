// assets/js/auth-check.js

// 1. Logic to run when the page loads to set the initial UI
async function updateAuthUI(session) {
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (session) {
        authBtn.textContent = session.user.user_metadata.full_name || "Account";
        authBtn.href = '/dashboard';
        if (logoutBtn) logoutBtn.style.display = 'inline';
    } else {
        authBtn.textContent = 'Sign In / Register';
        authBtn.href = '/login';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// 2. Attach the listener once
window.supabase.auth.onAuthStateChange((event, session) => {
    updateAuthUI(session);
});

// 3. Attach the Logout button listener once
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    // Check current session immediately on load
    window.supabase.auth.getSession().then(({ data }) => {
        updateAuthUI(data.session);
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabase.auth.signOut();
            window.location.href = '/'; // Redirect home after logout
        });
    }
});
