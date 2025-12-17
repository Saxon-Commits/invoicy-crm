import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchLatestDoc() {
    const { data, error } = await supabase
        .from('editor_documents')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching document:', error);
        return;
    }

    console.log('Latest Document:', JSON.stringify(data, null, 2));
    console.log('Content Type:', typeof data.content);
    console.log('Content Preview:', data.content.substring(0, 200));
}

fetchLatestDoc();
