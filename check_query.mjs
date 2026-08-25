import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnmmvpjxejekvrkjzlou.supabase.co';
const supabaseKey = 'sb_publishable_p3_VO7-WLB1otU3bnj_S-Q_HEK7oe65';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const farmerId = 'some-id'; 
  try {
      const res = await supabase.from('offers').select('*, buyer_id:users!buyer_id(name:full_name, avatar:avatar_url)').eq('farmer_id', farmerId).eq('status', 'pending').limit(1);
      console.log('Query with alias:', res.error);
  } catch (err) {
      console.error(err);
  }
}
check();
