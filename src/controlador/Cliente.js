import {createClient} from "@supabase/supabase-js";

export const supabase = createClient(
    'https://pdvoevmrstwuksruvkes.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdm9ldm1yc3R3dWtzcnV2a2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwOTMzOTgsImV4cCI6MjA0MzY2OTM5OH0.PTexzCYLyjAYFyTEq47PUgIvx6rnxwe5qK1m6QV-PvI'
);