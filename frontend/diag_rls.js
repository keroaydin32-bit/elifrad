
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diag() {
    console.log('=== RLS VERIFICATION ===');
    const { data, error } = await supabase.from('manufacturers').select('count');
    if (error) {
        console.error('RLS Error:', error);
    } else {
        console.log('RLS Check successful, count:', data);
    }
}

diag();
