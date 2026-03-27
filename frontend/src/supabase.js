import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hhnrosczgggxelnbrhlk.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobnJvc2N6Z2dneGVsbmJyaGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDM5MDEsImV4cCI6MjA4NjA3OTkwMX0.1U1UNpiwBUPCSiBRlg7r2KayQodJfTWULqO7xgCUq_s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
