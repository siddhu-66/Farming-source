import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnmmvpjxejekvrkjzlou.supabase.co';
const supabaseKey = 'sb_publishable_p3_VO7-WLB1otU3bnj_S-Q_HEK7oe65';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: user, error: uErr } = await supabase.from('users').select('*').eq('email', '2303031460006@paruluniversity.ac.in').maybeSingle();
  console.log('User:', user, uErr);
  if (user) {
    const { data: farmer, error: fErr } = await supabase.from('farmers').select('*').eq('user_id', user.id);
    console.log('Farmers:', farmer, fErr);
  }
}
check();
