import { createClient } from "@supabase/supabase-js"

export const supabase = createClient("https://vzwuqvejyxofboghgqol.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d3VxdmVqeXhvZmJvZ2hncW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTA0ODIsImV4cCI6MjA4OTc2NjQ4Mn0.e3dBkH1M8pQ4tfeNge6a3IqBZLmvGwInahJvesOqmMY");