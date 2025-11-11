import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hyiltuyvydprzaxcrwnb.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5aWx0dXl2eWRwcnpheGNyd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzI4NTIsImV4cCI6MjA3NzIwODg1Mn0.RjrJ0OSHL-LrflBnfrAqxItLqgsFgYAqYukt0gq_Guc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
