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
    showAuthMessage(""); // Clear previous messages

    if (!email || !password) {
        showAuthMessage("Please enter your email and password.");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        // This will now show "Invalid login credentials" in red on the page
        showAuthMessage(error.message); 
    } else {
        showAuthMessage("Login successful! Redirecting...", false);
        // Delay slightly so they can see the success message
        setTimeout(() => {
            window.location.href = '/'; 
        }, 1000);
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
