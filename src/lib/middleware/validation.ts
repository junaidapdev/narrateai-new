import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequest, createValidationErrorResponse } from '@/lib/validations'

// Validation middleware for API routes
export async function withValidation<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const result = validateRequest(schema, body)
    
    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          createValidationErrorResponse(result.errors),
          { status: 400 }
        )
      }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Validation middleware error:', error)
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }
  }
}

// Validation middleware for query parameters
export async function withQueryValidation<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryObject = Object.fromEntries(searchParams.entries())
    
    const result = validateRequest(schema, queryObject)
    
    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          createValidationErrorResponse(result.errors),
          { status: 400 }
        )
      }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Query validation middleware error:', error)
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid query parameters',
          message: 'Query parameters must be valid'
        },
        { status: 400 }
      )
    }
  }
}

// Validation middleware for headers
export async function withHeaderValidation<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const headers = Object.fromEntries(request.headers.entries())
    
    const result = validateRequest(schema, headers)
    
    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          createValidationErrorResponse(result.errors),
          { status: 400 }
        )
      }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Header validation middleware error:', error)
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid headers',
          message: 'Request headers must be valid'
        },
        { status: 400 }
      )
    }
  }
}

// Combined validation middleware
export async function withFullValidation<TBody, TQuery, THeaders>(
  request: NextRequest,
  bodySchema?: z.ZodSchema<TBody>,
  querySchema?: z.ZodSchema<TQuery>,
  headerSchema?: z.ZodSchema<THeaders>
): Promise<{
  success: true;
  data: {
    body?: TBody;
    query?: TQuery;
    headers?: THeaders;
  }
} | {
  success: false;
  response: NextResponse;
}> {
  const results: any = {}
  
  // Validate body if schema provided
  if (bodySchema) {
    const bodyResult = await withValidation(request, bodySchema)
    if (!bodyResult.success) {
      return bodyResult
    }
    results.body = bodyResult.data
  }
  
  // Validate query if schema provided
  if (querySchema) {
    const queryResult = await withQueryValidation(request, querySchema)
    if (!queryResult.success) {
      return queryResult
    }
    results.query = queryResult.data
  }
  
  // Validate headers if schema provided
  if (headerSchema) {
    const headerResult = await withHeaderValidation(request, headerSchema)
    if (!headerResult.success) {
      return headerResult
    }
    results.headers = headerResult.data
  }
  
  return { success: true, data: results }
}

// Request size validation
export async function withSizeValidation(
  request: NextRequest,
  maxSize: number = 1024 * 1024 // 1MB default
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Request too large',
          message: `Request size exceeds ${maxSize} bytes`
        },
        { status: 413 }
      )
    }
  }
  
  return { success: true }
}

// Content type validation
export async function withContentTypeValidation(
  request: NextRequest,
  allowedTypes: string[] = ['application/json']
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Missing content type',
          message: 'Content-Type header is required'
        },
        { status: 400 }
      )
    }
  }
  
  const isValidType = allowedTypes.some(type => contentType.includes(type))
  
  if (!isValidType) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid content type',
          message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
        },
        { status: 415 }
      )
    }
  }
  
  return { success: true }
}
