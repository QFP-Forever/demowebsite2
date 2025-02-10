import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: { 'x-application-name': 'budgetease' }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Enhanced retry function with exponential backoff
export async function withRetries<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Only retry on network errors or 5xx server errors
      if (!isRetryableError(lastError)) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      if (attempt < maxRetries - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 100, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

function isRetryableError(error: Error): boolean {
  return (
    error.message === 'Failed to fetch' ||
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    /^5\d{2}$/.test(error.message) // 5xx server errors
  );
}

// Connection status monitoring with WeakRef to prevent memory leaks
const connectionListeners = new Set<(connected: boolean) => void>();
let connectionCheckTimeout: number | null = null;

export function onConnectionChange(listener: (connected: boolean) => void) {
  connectionListeners.add(listener);
  return () => {
    connectionListeners.delete(listener);
    if (connectionListeners.size === 0 && connectionCheckTimeout) {
      window.clearTimeout(connectionCheckTimeout);
      connectionCheckTimeout = null;
    }
  };
}

// Use requestAnimationFrame for smoother connection checks
async function checkConnection() {
  try {
    const { error } = await supabase.from('pricing_votes').select('count').limit(0);
    const isConnected = !error;
    connectionListeners.forEach(listener => listener(isConnected));
  } catch (error) {
    connectionListeners.forEach(listener => listener(false));
  }

  // Schedule next check only if we have listeners
  if (connectionListeners.size > 0) {
    connectionCheckTimeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => checkConnection());
    }, 30000);
  }
}

// Start connection monitoring only when needed
export function startConnectionMonitoring() {
  if (!connectionCheckTimeout && connectionListeners.size > 0) {
    checkConnection();
  }
}

// Clean up on page unload
window.addEventListener('unload', () => {
  if (connectionCheckTimeout) {
    window.clearTimeout(connectionCheckTimeout);
  }
  connectionListeners.clear();
});