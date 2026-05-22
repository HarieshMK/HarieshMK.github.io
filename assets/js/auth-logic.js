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
        showAuthMessage("We can't guess your e-mail bro. Please type your email.");
        return;
    }
    if (!password) {
        showAuthMessage("Pssst... You don't want your account to be secure? Set a good password");
        return;
    }

    // Now proceed with the actual call
   try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showAuthMessage(error.message);
        } else {
            showAuthMessage("Login successful! Redirecting...", false);
            
            // 1. Extract the parameters directly
            const urlParams = new URLSearchParams(window.location.search);
            let destination = urlParams.get('return_to'); 
            
            console.log("Captured Return Destination:", destination); // Debug log

            if (destination) {
                // Fix for absolute vs relative path setups on GitHub Pages
                destination = decodeURIComponent(destination);
                
                // If it points to an index folder path, let's clean it or ensure compatibility
                if (destination === '/tax-calculator/') {
                    // Try targeting the direct filename if GitHub Pages is choking on the pretty URL trailing slash
                    destination = '/tax-calculator'; 
                }
                
                window.location.assign(destination);
            } else {
                window.location.assign('/');
            }
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

// =================================================================
// UPDATE ONLY THIS LOWER PORTION OF YOUR AUTH-LOGIC.JS FILE
// =================================================================

async function updateAuthUI(session) {
    const authBtn = document.getElementById('auth-btn'); 
    const profileBox = document.getElementById('user-profile-box'); 
    const nameDisplay = document.getElementById('user-display-name'); 

    if (session) {
        const user = session.user;
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Member";
        
        // Logged In State Controls
        if (authBtn) {
            authBtn.style.display = 'none';
            authBtn.textContent = `Hi, ${fullName}`;
            authBtn.href = "/dashboard";
        }
        if (profileBox) profileBox.style.display = 'flex'; 
        if (nameDisplay) nameDisplay.textContent = `Hey, ${fullName}`;
    } else {
        // Logged Out State Controls
        if (authBtn) {
            authBtn.style.display = 'inline-block';
            authBtn.textContent = 'Sign In / Register';
            
            // --- CHANGE 1: Automatically attach the return path to the login button link ---
            const currentPath = window.location.pathname;
            
            // Prevent recursive loop if they are already browsing the login or signup views
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                authBtn.href = `/login/?return_to=${encodeURIComponent(currentPath)}`;
            } else {
                authBtn.href = "/login";
            }
        }
        if (profileBox) profileBox.style.display = 'none';
    }
}

// Global Auth State Monitor Engine
window.supabase.auth.onAuthStateChange((event, session) => {
    console.log("System Auth Event Fired:", event);
    updateAuthUI(session);
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
        // --- CHANGE 2: Send them to the login screen with a return parameter if they attempt to save data while logged out ---
        const currentPath = window.location.pathname;
        alert("Please log in to save your tax calculations to your profile!");
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
