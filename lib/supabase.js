const {createClient}  = require('@supabase/supabase-js')

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SB_PROJECT, process.env.SB_SECRET_KEY)

module.exports = supabase