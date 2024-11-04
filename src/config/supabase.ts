import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY;


if (!supabaseUrl || !supabaseApiKey) {
  throw new Error("SUPABASE_URL and SUPABASE_API_KEY must be set");
}

const supabase = createClient(supabaseUrl, supabaseApiKey);

export default supabase;