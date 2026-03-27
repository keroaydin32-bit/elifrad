const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdd() {
  const { data: dbData } = await supabase.from('shop_settings').select('settings').eq('id', 1).single();
  const docs = dbData.settings.legalDocs || [];
  
  docs.push({ id: 'test_123', label: 'Test Label', content: '' });
  
  const newSettings = { ...dbData.settings, legalDocs: docs };
  
  const { error } = await supabase.from('shop_settings').upsert({ id: 1, settings: newSettings }, { onConflict: 'id' });
  if (error) {
    console.error("UPSERT ERROR:", error.message);
    return;
  }
  
  // verify
  const { data: verifyData } = await supabase.from('shop_settings').select('settings').eq('id', 1).single();
  console.log("Current docs:");
  verifyData.settings.legalDocs.forEach(d => console.log(d.id, d.label));
}
testAdd();
