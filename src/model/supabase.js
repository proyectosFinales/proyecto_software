import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan las variables REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_KEY en el entorno (.env o Netlify)."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;