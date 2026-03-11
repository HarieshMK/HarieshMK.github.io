console.log("Auth Logic has loaded!");

// assets/js/auth-logic.js

// --- HELPER: Display messages to the user ---
function showAuthMessage(msg, isError = true) {
    const msgDiv = document.getElementById('auth-msg');
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.style.color = isError ? "#ef4444" : "#10b981"; // Red if error, Green if success
    }
}

// --- SIGN UP FUNCTION ---
async function handleSignup(email, password, fullName) {
    showAuthMessage(""); // Clear previous messages
    
    if (!email || !password || !fullName) {
        showAuthMessage("All fields are required.");
        return;
    }

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
        showAuthMessage(error.message);
    } else {
        // If email confirmation is ON in Supabase, they see this:
        showAuthMessage("Account created! Check your email for a link.", false);
    }
}

// --- LOGIN FUNCTION ---
async function handleLogin(email, password) {
    showAuthMessage(""); 

    // Playful validation logic
    if (!email && !password) {
        showAuthMessage("Empty fields? We can't log you in if you're a ghost. 👻");
        return;
    }
    if (!email) {
        showAuthMessage("Don't forget your email! How will we know it's you?");
        return;
    }
    if (!password) {
        showAuthMessage("Pssst... you forgot the password!");
        return;
    }

    // Now proceed with the actual call
    const { data, error } = await window.supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        // Supabase error messages are technical; let's make them readable
        if (error.message === "Invalid login credentials") {
            showAuthMessage("That email/password combo doesn't exist. Check your spelling?");
        } else {
            showAuthMessage(error.message);
        }
    } else {
        showAuthMessage("Welcome back! Redirecting...", false);
        setTimeout(() => { window.location.href = '/'; }, 1000);
    }
}
// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-login');
    const signupBtn = document.getElementById('btn-signup');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent page reload
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            handleLogin(email, pass);
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent page reload
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;
            const name = document.getElementById('signup-name').value;
            handleSignup(email, pass, name);
        });
    }
});
