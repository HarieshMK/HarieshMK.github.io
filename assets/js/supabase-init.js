// Do NOT call createClient again. It's already done by the CDN.
// Just attach the existing 'supabase' to 'window' for safety.
window.supabase = supabase; 
console.log("Supabase library ready for use.");
