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

    const { data, error } = await window.supabase.auth.signUp({
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
        showAuthMessage("We can't guess your e-mail bro. Please type your email.");
        return;
    }
    if (!password) {
        showAuthMessage("Pssst... You don't want your account to be secure? Set a good password");
        return;
    }

    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showAuthMessage(error.message);
        } else {
            showAuthMessage("Login successful! Redirecting...", false);
        }
    } catch (err) {
        console.error("Critical Auth Error:", err);
        showAuthMessage("Connection error. Check console.");
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Target the actual Form elements instead of just the buttons
    const loginForm = document.getElementById('login-form') || document.querySelector('form');
    const loginBtn = document.getElementById('btn-login');
    const signupBtn = document.getElementById('btn-signup');

    // Robust Handler for the entire Login Form context
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // CRUCIAL: Stops the native HTML browser page reload!
            
            const emailField = document.getElementById('login-email');
            const passField = document.getElementById('login-password');
            
            if (emailField && passField) {
                handleLogin(emailField.value, passField.value);
            }
        });
    }

    // Fallback click listener for the button if it lives outside a form container
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            handleLogin(email, pass);
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;
            const name = document.getElementById('signup-name').value;
            handleSignup(email, pass, name);
        });
    }
});

// ==========================================
// UNIFIED AUTH UI & PROFILE STATE CONTROLLER
// ==========================================
async function updateAuthUI(session) {
    const authBtn = document.getElementById('auth-btn'); 
    const profileBox = document.getElementById('user-profile-box'); 
    const nameDisplay = document.getElementById('user-display-name'); 

    if (session) {
        const user = session.user;
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Member";
        
        if (authBtn) {
            authBtn.style.display = 'none';
            authBtn.textContent = `Hi, ${fullName}`;
            authBtn.href = "/dashboard";
        }
        if (profileBox) profileBox.style.display = 'flex'; 
        if (nameDisplay) nameDisplay.textContent = `Hey, ${fullName}`;
    } else {
        if (authBtn) {
            authBtn.style.display = 'inline-block';
            authBtn.textContent = 'Sign In / Register';
            
            // Clean up old click overrides completely
            authBtn.onclick = null;
            authBtn.removeAttribute('onclick');
            
            // Explicitly grab the active path from the URL bar
            const currentPath = window.location.pathname; 
            
            // Forcefully stitch the string together
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                authBtn.href = `/login/?return_to=${encodeURIComponent(currentPath)}`;
            } else {
                authBtn.href = "/login/";
            }
        }
        if (profileBox) profileBox.style.display = 'none';
    }
}

// Global execution state tracking variable
let isRedirecting = false;

// =================================================================
// LOCKED GLOBAL AUTH STATE MONITOR ENGINE (PRODUCTION READY)
// =================================================================
window.supabase.auth.onAuthStateChange((event, session) => {
    console.log("System Auth Event Fired:", event);
    updateAuthUI(session);

    if (event === "SIGNED_IN") {
        // 1. If we are already processing a redirect from a previous loop fire, STOP immediately.
        if (isRedirecting) {
            console.log("🔒 Event blocked to prevent multi-fire hijacking.");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const destination = urlParams.get('return_to');

        if (destination) {
            // 2. Set the execution lock open immediately
            isRedirecting = true;
            
            let cleanDestination = decodeURIComponent(destination);
            console.log("🎯 Dynamic redirect target captured! Moving to:", cleanDestination);
            
            // Instantly shift page views safely
            window.location.assign(cleanDestination);
        }
    }
});

// Runtime Initialization Hooks
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    // Immediate Initial Load Status Check
    window.supabase.auth.getSession().then(({ data }) => {
        updateAuthUI(data.session);
    });

    // Log Out Interaction Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabase.auth.signOut();
            window.location.href = '/'; 
        });
    }
});

// ==========================================
// TAX CALCULATOR BACKEND DATA COORDINATOR
// ==========================================
async function saveTaxData(taxPayload) {
    console.log("DEBUG: saveTaxData triggered with payload:", taxPayload);
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session) {
        alert("Please log in to save your tax calculations to your profile!");
        
        // STABLE FIX: Send them to the login stream using URL variables instead of blocked sessionStorage
        const currentPath = window.location.pathname;
        window.location.href = `/login/?return_to=${encodeURIComponent(currentPath)}`;
        return { error: "User not authenticated" };
    }

    const user = session.user;

    const { data, error } = await window.supabase
        .from('user_tax_records')
        .upsert({
            user_id: user.id,
            financial_year: taxPayload.financial_year || "2026-27",
            tax_data: taxPayload,
            updated_at: new Date().toISOString()
        }, { on_conflict: 'user_id, financial_year' });

    if (error) {
        console.error("Supabase Save Error:", error.message);
        return { error: error.message };
    }

    console.log("Tax data saved successfully to Supabase profile!");
    return { success: true, data: data };
}

// Global Bridge Export
window.saveTaxData = saveTaxData;
