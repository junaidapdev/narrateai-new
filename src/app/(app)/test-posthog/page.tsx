'use client'

import { useState } from 'react'
import { usePostHog } from '@/lib/hooks/usePostHog'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react'

export default function TestPostHogPage() {
  const { user } = useAuth()
  const { isLoaded, capture, identify, setPersonProperties, reset } = usePostHog()
  const [testEvent, setTestEvent] = useState('test_event')
  const [testProperties, setTestProperties] = useState('{"test_property": "test_value"}')
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const testBasicEvent = () => {
    try {
      // Parse JSON properties with better error handling
      let properties = {}
      if (testProperties.trim()) {
        try {
          properties = JSON.parse(testProperties)
        } catch (jsonError) {
          addResult(`❌ Invalid JSON format: ${jsonError}`, 'error')
          return
        }
      }
      
      capture(testEvent, properties)
      addResult(`✅ Event "${testEvent}" captured successfully`, 'success')
    } catch (error) {
      addResult(`❌ Error capturing event: ${error}`, 'error')
    }
  }

  const testUserIdentification = () => {
    try {
      if (user) {
        identify(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name || 'Unknown',
          created_at: user.created_at,
        })
        addResult(`✅ User identified: ${user.email}`, 'success')
      } else {
        addResult('❌ No user logged in', 'error')
      }
    } catch (error) {
      addResult(`❌ Error identifying user: ${error}`, 'error')
    }
  }

  const testPersonProperties = () => {
    try {
      setPersonProperties({
        subscription_plan: 'pro',
        last_login: new Date().toISOString(),
        test_property: 'test_value',
      })
      addResult('✅ Person properties set successfully', 'success')
    } catch (error) {
      addResult(`❌ Error setting person properties: ${error}`, 'error')
    }
  }

  const testPageView = () => {
    try {
      capture('$pageview', {
        $current_url: window.location.href,
        page_title: document.title,
      })
      addResult('✅ Page view captured successfully', 'success')
    } catch (error) {
      addResult(`❌ Error capturing page view: ${error}`, 'error')
    }
  }

  const testCustomEvent = () => {
    try {
      capture('button_clicked', {
        button_name: 'test_posthog_button',
        page: 'test_posthog',
        timestamp: new Date().toISOString(),
      })
      addResult('✅ Custom event captured successfully', 'success')
    } catch (error) {
      addResult(`❌ Error capturing custom event: ${error}`, 'error')
    }
  }

  const testReset = () => {
    try {
      reset()
      addResult('✅ PostHog reset successfully', 'success')
    } catch (error) {
      addResult(`❌ Error resetting PostHog: ${error}`, 'error')
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">PostHog Test Dashboard</h1>
        <p className="text-muted-foreground">
          Test and verify your PostHog integration
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            PostHog Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {isLoaded ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  PostHog Loaded
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <Badge variant="destructive">
                  PostHog Not Loaded
                </Badge>
              </>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>PostHog Key: {process.env.NEXT_PUBLIC_POSTHOG_KEY ? '✅ Set' : '❌ Not Set'}</p>
            <p>PostHog Host: {process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Event Testing</CardTitle>
            <CardDescription>
              Test custom events and properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                placeholder="test_event"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-properties">Event Properties (JSON)</Label>
              <Textarea
                id="event-properties"
                value={testProperties}
                onChange={(e) => setTestProperties(e.target.value)}
                placeholder='{"property": "value"}'
                rows={3}
                className={(() => {
                  try {
                    if (testProperties.trim()) {
                      JSON.parse(testProperties)
                    }
                    return ""
                  } catch {
                    return "border-red-500"
                  }
                })()}
              />
              {(() => {
                try {
                  if (testProperties.trim()) {
                    JSON.parse(testProperties)
                    return <p className="text-sm text-green-600">✅ Valid JSON</p>
                  }
                  return null
                } catch (error) {
                  return <p className="text-sm text-red-600">❌ Invalid JSON: {error.message}</p>
                }
              })()}
              
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Examples:</p>
                <p>• <code>{"{}"}</code> - Empty object</p>
                <p>• <code>{"{\"key\": \"value\"}"}</code> - Simple property</p>
                <p>• <code>{"{\"user_id\": \"123\", \"action\": \"click\"}"}</code> - Multiple properties</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={testBasicEvent} className="flex-1">
                Test Custom Event
              </Button>
              <Button 
                onClick={() => setTestProperties('{"test_property": "test_value"}')} 
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Testing */}
        <Card>
          <CardHeader>
            <CardTitle>User Testing</CardTitle>
            <CardDescription>
              Test user identification and properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current User: {user ? user.email : 'Not logged in'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={testUserIdentification} className="w-full">
                Test User Identification
              </Button>
              <Button onClick={testPersonProperties} className="w-full">
                Test Person Properties
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
          <CardDescription>
            Test common PostHog functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testPageView} variant="outline">
              Test Page View
            </Button>
            <Button onClick={testCustomEvent} variant="outline">
              Test Button Click
            </Button>
            <Button onClick={testReset} variant="outline">
              Reset PostHog
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            View the results of your PostHog tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No tests run yet. Click the buttons above to test PostHog.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm font-mono ${
                    result.includes('✅') ? 'bg-green-50 text-green-800' :
                    result.includes('❌') ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How to Verify PostHog is Working
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Check PostHog Dashboard</h4>
            <p className="text-sm text-muted-foreground">
              Go to your PostHog dashboard and look for events in the "Events" tab.
              You should see events appearing in real-time.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Check Browser Console</h4>
            <p className="text-sm text-muted-foreground">
              Open browser dev tools and check the console for PostHog logs.
              Look for messages like "PostHog loaded" or event capture confirmations.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. Check Network Tab</h4>
            <p className="text-sm text-muted-foreground">
              In the Network tab, look for requests to PostHog endpoints.
              You should see requests to your PostHog host with event data.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">4. Test Different Events</h4>
            <p className="text-sm text-muted-foreground">
              Try different event types: page views, button clicks, user identification.
              Each should appear in your PostHog dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
