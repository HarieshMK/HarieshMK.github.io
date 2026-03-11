// assets/js/supabase-init.js

if (typeof window.supabase === 'undefined') {
  const supabaseUrl = 'https://verivhhyvwvahmxibwkz.supabase.co';
  const supabaseKey = 'sb_publishable_CqlRq_Y5c1Em2JneO-Z13A_ZpC2RE9K'; // Ensure this is your actual ANON key

  // The library uses 'Supabase' (capital S) to create the client
  window.supabase = Supabase.createClient(supabaseUrl, supabaseKey);
  
  console.log("Supabase initialized successfully!");
} else {
  console.log("Supabase was already initialized.");
}
