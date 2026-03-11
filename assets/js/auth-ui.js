// Function to update the UI based on User state
function updateAuthUI(user) {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    if (user) {
        // User is logged in
        const firstName = user.user_metadata?.full_name || user.email.split('@')[0];
        authBtn.textContent = `Hi, ${firstName}`;
        authBtn.href = "/dashboard"; // Change the link to the dashboard
    } else {
        // User is logged out
        authBtn.textContent = 'Sign In / Register';
        authBtn.href = "/login";
    }
}

// 1. Check status immediately on page load
const initAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    updateAuthUI(user);
};

// 2. Listen for changes (Login/Logout events)
// This is the "Engine" that detects if a user just signed in
supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event);
    updateAuthUI(session?.user ?? null);
});

initAuth();
