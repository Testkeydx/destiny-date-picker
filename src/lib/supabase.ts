import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzgkrezflvwezmjakdyv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6Z2tyZXpmbHZ3ZXptamFrZHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzNjUxODUsImV4cCI6MjA0MTk0MTE4NX0.yaf5EXrqzIb72lwqUm_P9LKnhH9ff4BBCXR29sZydUI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
