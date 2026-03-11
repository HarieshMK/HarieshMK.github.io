// assets/js/supabase-init.js
const supabaseUrl = 'https://verivhhyvwvahmxibwkz.supabase.co';
const supabaseKey = 'sb_publishable_CqlRq_Y5c1Em2JneO-Z13A_ZpC2RE9K';

// Initialize and attach to window
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
console.log("Supabase initialized and attached to window.");
