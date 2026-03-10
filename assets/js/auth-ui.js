// assets/js/auth-ui.js

const authBtn = document.getElementById('auth-btn');

// Check current user status
const checkUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // If logged in, show user email or name
    authBtn.textContent = user.email.split('@')[0]; // Simple way to show name
    authBtn.onclick = () => window.location.href = '/dashboard'; // Redirect to their area
  } else {
    // If not logged in, show Sign In
    authBtn.textContent = 'Sign In / Register';
    authBtn.onclick = () => window.location.href = '/login'; // Point to your login page
  }
};

checkUser();
