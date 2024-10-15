import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pdvoevmrstwuksruvkes.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdm9ldm1yc3R3dWtzcnV2a2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwOTMzOTgsImV4cCI6MjA0MzY2OTM5OH0.PTexzCYLyjAYFyTEq47PUgIvx6rnxwe5qK1m6QV-PvI";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;