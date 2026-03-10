// Only initialize if it hasn't been done yet
if (typeof supabase === 'undefined') {
  const supabaseUrl = 'https://verivhhyvwvahmxibwkz.supabase.co';
  const supabaseKey = 'sb_publishable_CqlRq_Y5c1Em2JneO-Z13A_ZpC2RE9K';

  // Make sure you have the window.supabase or just supabase accessible
  window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
  
  console.log("Supabase initialized successfully!");
} else {
  console.log("Supabase was already initialized.");
}
