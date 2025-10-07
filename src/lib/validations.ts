import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  url: z.string().url('Invalid URL format'),
  timestamp: z.string().datetime('Invalid timestamp format'),
}

// Authentication schemas
export const authSchemas = {
  signup: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  }),
  
  signin: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
  
  resetPassword: z.object({
    email: commonSchemas.email,
  }),
  
  updatePassword: z.object({
    password: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
}

// Recording schemas
export const recordingSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    audioUrl: z.string().url('Invalid audio URL'),
    duration: z.number().min(0, 'Duration must be positive').max(7200, 'Duration too long'), // 2 hours max
  }),
  
  update: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
  }),
}

// Post schemas
export const postSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
    recordingId: commonSchemas.uuid.optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  }),
  
  update: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long').optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
  
  schedule: z.object({
    scheduledAt: z.string().datetime('Invalid scheduled time format'),
    visibility: z.enum(['PUBLIC', 'CONNECTIONS']).default('PUBLIC'),
  }),
}

// LinkedIn schemas
export const linkedinSchemas = {
  post: z.object({
    text: z.string().min(1, 'Post text is required').max(3000, 'Post too long'),
    visibility: z.enum(['PUBLIC', 'CONNECTIONS']).default('PUBLIC'),
    postId: commonSchemas.uuid.optional(),
  }),
  
  connect: z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().optional(),
  }),
}

// Subscription schemas
export const subscriptionSchemas = {
  cancel: z.object({
    reason: z.string().min(1, 'Cancellation reason is required').max(100, 'Reason too long'),
    feedback: z.string().max(1000, 'Feedback too long').optional(),
  }),
  
  feedback: z.object({
    feedback: z.string().min(1, 'Feedback is required').max(1000, 'Feedback too long'),
  }),
  
  test: z.object({
    email: commonSchemas.email,
    subscriptionPlan: z.enum(['monthly', 'yearly']).default('monthly'),
  }),
}

// Profile schemas
export const profileSchemas = {
  update: z.object({
    fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long').optional(),
    linkedinGoal: z.string().max(500, 'Goal description too long').optional(),
    backStory: z.string().max(1000, 'Back story too long').optional(),
    referralSource: z.string().max(100, 'Referral source too long').optional(),
  }),
}

// Webhook schemas
export const webhookSchemas = {
  lemonsqueezy: z.object({
    meta: z.object({
      event_name: z.string(),
      custom_data: z.record(z.any()).optional(),
    }),
    data: z.object({
      type: z.string(),
      id: z.string(),
      attributes: z.record(z.any()),
    }),
  }),
}

// Validation helper function
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Invalid request data']
    }
  }
}

// API response helper
export function createValidationErrorResponse(errors: string[]) {
  return {
    error: 'Validation failed',
    details: errors,
    status: 400
  }
}
