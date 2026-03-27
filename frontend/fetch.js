const { createClient } = require('@supabase/supabase-js');

// Set these variables before running
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hhnrosczgggxelnbrhlk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-key-here'; // need to replace this or look it up

async function run() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log(error ? 'Error: ' + JSON.stringify(error) : 'Data: typeof data ' + typeof data);
}

// this is just to check if table structure was actually modified. We'll verify table columns instead.
