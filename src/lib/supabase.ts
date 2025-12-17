import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://vifuuyzobgrcmtpuxxfn.supabase.co';
const supabaseKey = 'sb_publishable_9lSqpifpi9ulkMMkuVGa3w_xQBM0d5k';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };