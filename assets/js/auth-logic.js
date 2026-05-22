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
            
            // FIX: Remove direct link location so browser doesn't skip the click logic
            authBtn.removeAttribute('href');
            authBtn.style.cursor = 'pointer';
            
            // Save current page path and navigate manually safely
            authBtn.onclick = (e) => {
                e.preventDefault();
                const currentPath = window.location.pathname;
                
                if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                    sessionStorage.setItem('auth_redirect_target', currentPath);
                    console.log("Saved redirection target safely to storage:", currentPath);
                }
                
                window.location.href = "/login";
            };
        }
        if (profileBox) profileBox.style.display = 'none';
    }
}

// =================================================================
// UPDATED GLOBAL AUTH STATE MONITOR ENGINE & STORAGE INTERCEPTOR
// =================================================================
window.supabase.auth.onAuthStateChange((event, session) => {
    console.log("System Auth Event Fired:", event);
    updateAuthUI(session);

    if (event === "SIGNED_IN") {
        const destination = sessionStorage.getItem('auth_redirect_target');

        if (destination) {
            console.log("🔥 Storage Interceptor found target:", destination);
            
            // Erase memory immediately to prevent redirect loops
            sessionStorage.removeItem('auth_redirect_target');
            
            // Clean paths if they have accidental trailing slashes for GitHub pages
            let cleanDestination = destination;
            if (cleanDestination.endsWith('/') && cleanDestination !== '/') {
                cleanDestination = cleanDestination.slice(0, -1);
            }

            window.location.replace(cleanDestination);
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
        
        sessionStorage.setItem('auth_redirect_target', window.location.pathname);
        window.location.href = '/login';
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
