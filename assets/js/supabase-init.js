if (typeof window.supabase === 'undefined') {
  const supabaseUrl = 'https://verivhhyvwvahmxibwkz.supabase.co';
  const supabaseKey = 'sb_publishable_CqlRq_Y5c1Em2JneO-Z13A_ZpC2RE9K'; // Double-check this is your ANON key!

  // Use the lowercase 'supabase' as provided by the CDN
  window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
  
  console.log("Supabase initialized successfully!");
  console.log("Supabase Client:", window.supabase);
}
