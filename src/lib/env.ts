import { z } from 'zod'

// Environment validation schema - more flexible for build time
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').optional(),
  ASSEMBLYAI_API_KEY: z.string().min(1, 'AssemblyAI API key is required').optional(),
  
  // Payment
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1, 'LemonSqueezy webhook secret is required').optional(),
  LEMONSQUEEZY_API_KEY: z.string().min(1, 'LemonSqueezy API key is required').optional(),
  NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_URL: z.string().url('Invalid monthly checkout URL').optional(),
  NEXT_PUBLIC_LEMONSQUEEZY_YEARLY_URL: z.string().url('Invalid yearly checkout URL').optional(),
  
  // LinkedIn
  LINKEDIN_CLIENT_ID: z.string().min(1, 'LinkedIn client ID is required').optional(),
  LINKEDIN_CLIENT_SECRET: z.string().min(1, 'LinkedIn client secret is required').optional(),
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Rate Limiting (optional - will use in-memory fallback if not provided)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Cron Jobs
  CRON_SECRET: z.string().min(1, 'Cron secret is required').optional(),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      console.warn(`Environment validation warnings:\n${missingVars.join('\n')}`)
      // Return a partial environment object instead of throwing
      return envSchema.partial().parse(process.env)
    }
    throw error
  }
}

// Export validated environment
export const env = validateEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Feature flags based on environment
export const features = {
  rateLimiting: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  analytics: isProduction,
  debugMode: isDevelopment,
  hotReload: isDevelopment,
}

// Security configuration
export const security = {
  cors: {
    origin: isProduction ? ['https://www.trynarrate.com'] : ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    enabled: features.rateLimiting,
    fallbackToMemory: !features.rateLimiting,
  },
  headers: {
    hsts: isProduction,
    csp: true,
    xssProtection: true,
  },
}

// API endpoints configuration
export const api = {
  baseUrl: env.NEXT_PUBLIC_APP_URL,
  timeout: 30000, // 30 seconds
  retries: 3,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
}

// Database configuration
export const database = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  maxConnections: 10,
  connectionTimeout: 10000,
}

// External services configuration
export const services = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1',
    timeout: 60000,
  },
  assemblyai: {
    apiKey: env.ASSEMBLYAI_API_KEY,
    baseUrl: 'https://api.assemblyai.com/v2',
    timeout: 300000, // 5 minutes for transcription
  },
  linkedin: {
    clientId: env.LINKEDIN_CLIENT_ID,
    clientSecret: env.LINKEDIN_CLIENT_SECRET,
    baseUrl: 'https://api.linkedin.com/v2',
    timeout: 30000,
  },
  lemonsqueezy: {
    apiKey: env.LEMONSQUEEZY_API_KEY,
    webhookSecret: env.LEMONSQUEEZY_WEBHOOK_SECRET,
    baseUrl: 'https://api.lemonsqueezy.com/v1',
    timeout: 30000,
  },
}

// Logging configuration
export const logging = {
  level: isDevelopment ? 'debug' : 'info',
  format: isProduction ? 'json' : 'pretty',
  enableConsole: isDevelopment,
  enableFile: isProduction,
}

// Export environment validation function for runtime checks
export function validateEnvironment(): boolean {
  try {
    validateEnv()
    return true
  } catch (error) {
    console.error('Environment validation failed:', error)
    return false
  }
}
