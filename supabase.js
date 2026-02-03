import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://lnzufmexrqfpwebdroyl.supabase.co";
const supabaseKey = "sb_publishable_da_S9WKHzGdyV816zhlfZQ_RquY_02Z";

export const supabase = createClient(supabaseUrl, supabaseKey);