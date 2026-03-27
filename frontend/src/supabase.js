import { createClient } from '@supabase/supabase-js'
import { supabaseStorage } from './lib/storage'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env file.')
}

/**
 * In-memory mutex lock — Web Locks API'yi tamamen bypass eder.
 * "Lock broken by another request with the 'steal' option" hatasını önler.
 * Her anahtar için bir Promise zinciri tutar; işlemler sıraya girer.
 */
const memoryLocks = {}

function memoryLock(name, acquireTimeout, fn) {
    if (!memoryLocks[name]) {
        memoryLocks[name] = Promise.resolve()
    }

    const run = memoryLocks[name].then(() => fn())
    // Hata olsa bile zinciri bozmamak için catch ekle
    memoryLocks[name] = run.catch(() => {})
    return run
}

// Singleton pattern — tek bir client instance garantilenir
let _supabaseInstance = null

function getSupabaseClient() {
    if (_supabaseInstance) return _supabaseInstance

    _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: supabaseStorage,
            persistSession: true,
            storageKey: 'electrive-auth-token',
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            lock: memoryLock,
        }
    })

    return _supabaseInstance
}

export const supabase = getSupabaseClient()

