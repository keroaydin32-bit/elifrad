
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diag() {
    console.log('=== MANUFACTURER DIAGNOSTIC ===');
    const { data: manus, error } = await supabase.from('manufacturers').select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${manus.length} manufacturers:`);
    manus.forEach((m, i) => {
        console.log(`${i + 1}. Name: ${m.name}, Active: ${m.is_active}, Logo: ${m.logo_url ? 'YES' : 'NO'}`);
    });
}

diag();
