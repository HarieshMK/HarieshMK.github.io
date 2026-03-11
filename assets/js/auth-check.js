// assets/js/auth-check.js

window.supabase.auth.onAuthStateChange((event, session) => {
    const authBtn = document.getElementById('auth-btn');
    if (session) {
        // User is logged in!
        const fullName = session.user.user_metadata.full_name;
        authBtn.textContent = fullName; // Change text to their name
        authBtn.href = '/dashboard';    // Link to their dashboard
    } else {
        // User is logged out
        authBtn.textContent = 'Sign In / Register';
        authBtn.href = '/login';
    }
});
