import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qonggvnhgcmvhxfuqwve.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbmdndm5oZ2Ntdmh4ZnVxd3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyMzIzMjAsImV4cCI6MjA0OTgwODMyMH0.vWw8GGjIzrEfAzKK3OX3Gc9oDEuE9C4EQTxNR2yDxgo";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;