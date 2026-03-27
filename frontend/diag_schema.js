
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diag() {
    console.log('=== MANUFACTURER SCHEMA DIAGNOSTIC ===');
    const { data: manus, error } = await supabase.from('manufacturers').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (manus.length > 0) {
        console.log('Columns found:', Object.keys(manus[0]).join(', '));
    } else {
        console.log('No manufacturers found to check schema.');
    }
}

diag();
