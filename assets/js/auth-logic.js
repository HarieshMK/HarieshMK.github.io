// assets/js/auth-logic.js

// --- SIGN UP FUNCTION ---
async function handleSignup(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) {
        alert("Error signing up: " + error.message);
    } else {
        alert("Check your email for the confirmation link!");
    }
}

// --- LOGIN FUNCTION ---
async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login failed: " + error.message);
    } else {
        window.location.href = '/'; // Redirect to home on success
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-login');
    const signupBtn = document.getElementById('btn-signup');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            handleLogin(email, pass);
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;
            const name = document.getElementById('signup-name').value;
            handleSignup(email, pass, name);
        });
    }
});
