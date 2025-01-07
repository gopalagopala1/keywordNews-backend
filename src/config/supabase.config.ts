import { createClient } from "@supabase/supabase-js";
import env from "./env.config";


const supabaseUrl = env.SUPABASE_URL;
const supabaseApiKey = env.SUPABASE_API_KEY;


if (!supabaseUrl || !supabaseApiKey) {
  throw new Error("SUPABASE_URL and SUPABASE_API_KEY must be set");
}

const supabase = createClient(supabaseUrl, supabaseApiKey);

export default supabase;