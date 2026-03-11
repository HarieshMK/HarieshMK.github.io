// assets/js/auth-check.js

async function updateAuthUI(session) {
    const authBtn = document.getElementById('auth-btn'); // The "Sign In" button
    const profileBox = document.getElementById('user-profile-box'); // The new container
    const nameDisplay = document.getElementById('user-display-name'); // The "Hey, Name" div

    if (session) {
        // Logged In: Hide button, Show profile stack
        authBtn.style.display = 'none';
        profileBox.style.display = 'flex'; // matches our flex-direction: column CSS
        
        const fullName = session.user.user_metadata.full_name || "Member";
        nameDisplay.textContent = `Hey, ${fullName}`;
    } else {
        // Logged Out: Show button, Hide profile stack
        authBtn.style.display = 'inline-block';
        profileBox.style.display = 'none';
    }
}

// Attach the listener
window.supabase.auth.onAuthStateChange((event, session) => {
    updateAuthUI(session);
});

// Initial load check
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    window.supabase.auth.getSession().then(({ data }) => {
        updateAuthUI(data.session);
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabase.auth.signOut();
            window.location.href = '/'; 
        });
    }
});
