export const APP_CONFIG = {
  name: 'Narrate',
  description: 'Transform your voice into engaging content',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0',
} as const

export const ROUTES = {
  home: '/',
  signin: '/signin',
  signup: '/signup',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  recording: '/recording',
  posts: '/posts',
  settings: '/settings',
  pricing: '/pricing',
  about: '/about',
} as const

export const API_ROUTES = {
  auth: {
    signin: '/api/auth/signin',
    signup: '/api/auth/signup',
    signout: '/api/auth/signout',
    resetPassword: '/api/auth/reset-password',
  },
  recordings: {
    list: '/api/recordings',
    create: '/api/recordings',
    get: (id: string) => `/api/recordings/${id}`,
    update: (id: string) => `/api/recordings/${id}`,
    delete: (id: string) => `/api/recordings/${id}`,
  },
  posts: {
    list: '/api/posts',
    create: '/api/posts',
    get: (id: string) => `/api/posts/${id}`,
    update: (id: string) => `/api/posts/${id}`,
    delete: (id: string) => `/api/posts/${id}`,
  },
  subscription: {
    get: '/api/subscription',
    create: '/api/subscription',
    update: '/api/subscription',
    cancel: '/api/subscription/cancel',
  },
} as const

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '3 recordings per month',
      'Basic transcription',
      'Standard support',
    ],
    limits: {
      recordings: 3,
      duration: 10, // minutes
    },
  },
  pro: {
    name: 'Pro',
    price: 17,
    features: [
      'Unlimited recordings',
      'Advanced transcription',
      'AI content generation',
      'Priority support',
      'Export options',
    ],
    limits: {
      recordings: -1, // unlimited
      duration: 60, // minutes
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
      'Team collaboration',
    ],
    limits: {
      recordings: -1, // unlimited
      duration: 120, // minutes
    },
  },
} as const

export const RECORDING_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const FILE_UPLOAD = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'],
  ALLOWED_EXTENSIONS: ['.mp3', '.wav', '.m4a', '.mp4'],
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
} as const

