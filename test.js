require('dotenv').config({path: 'frontend/.env'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
async function test() {
    const { data, error } = await supabase.from('manufacturers').select('*').limit(1);
    console.log("Data:", data, "Error:", error);
}
test();
