// assets/js/supabase-init.js

const supabaseUrl = 'https://verivhhyvwvahmxibwkz.supabase.co';
const supabaseKey = 'sb_publishable_CqlRq_Y5c1Em2JneO-Z13A_ZpC2RE9K';

// We initialize the client using the globally available 'supabase' library
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase successfully connected to your project!");
