
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diag() {
    const { data: manus, error } = await supabase.from('manufacturers').select('name, logo_url');
    if (error) return console.error(error);
    manus.forEach(m => console.log(`${m.name}: ${m.logo_url}`));
}

diag();
