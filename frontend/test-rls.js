require('dotenv').config({ path: 'frontend/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
async function test() {
    const { data: policies, error } = await supabase.from('manufacturers').select('*').limit(1);
    console.log("Got row:", policies, "Error:", error);

    // Attempt update
    const { error: updErr, data: updData, status } = await supabase.from('manufacturers').update({ name: 'Magura Try' }).eq('id', policies[0].id).select();
    console.log("Update try:", updData, updErr, status);
}
test();
