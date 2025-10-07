'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLinkedIn } from '@/lib/hooks/useLinkedIn'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function TestLinkedInPage() {
  const { user, loading: authLoading } = useAuth()
  const { connection: linkedinConnection, loading: linkedinLoading } = useLinkedIn()
  const [testText, setTestText] = useState('This is a test post from NarrateAI! 🚀')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS'>('PUBLIC')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [postResult, setPostResult] = useState<any>(null)

  const testConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/linkedin/test')
      const data = await response.json()
      setTestResult(data)
      
      if (data.success) {
        toast.success('LinkedIn connection test successful!')
      } else {
        toast.error(data.message || 'LinkedIn connection test failed')
      }
    } catch (error) {
      console.error('Test error:', error)
      toast.error('Failed to test LinkedIn connection')
      setTestResult({ success: false, error: 'Network error' })
    } finally {
      setIsTesting(false)
    }
  }

  const postToLinkedIn = async () => {
    if (!testText.trim()) {
      toast.error('Please enter some text to post')
      return
    }

    setIsPosting(true)
    setPostResult(null)

    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          visibility: visibility
        })
      })

      const data = await response.json()
      setPostResult(data)
      
      if (data.success) {
        toast.success('Successfully posted to LinkedIn!')
      } else {
        toast.error(data.error || 'Failed to post to LinkedIn')
      }
    } catch (error) {
      console.error('Post error:', error)
      toast.error('Failed to post to LinkedIn')
      setPostResult({ success: false, error: 'Network error' })
    } finally {
      setIsPosting(false)
    }
  }

  if (authLoading || linkedinLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">LinkedIn Integration Test</h1>
            <p className="text-muted-foreground">
              Test your LinkedIn connection and posting functionality
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Connection Status
                  {linkedinConnection ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Current LinkedIn connection status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {linkedinConnection ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Connected as: {linkedinConnection.linkedin_profile_data?.name || 'Unknown'}
                    </p>
                    <Button onClick={testConnection} disabled={isTesting} className="w-full">
                      {isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No LinkedIn connection found
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/api/auth/linkedin/connect'}
                      className="w-full"
                    >
                      Connect LinkedIn
                    </Button>
                  </div>
                )}

                {testResult && (
                  <Alert className={`mt-4 ${testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {testResult.success ? 'Connection Test Passed' : 'Connection Test Failed'}
                        </p>
                        {testResult.message && (
                          <p className="text-sm">{testResult.message}</p>
                        )}
                        {testResult.profile && (
                          <div className="text-sm">
                            <p><strong>Name:</strong> {testResult.profile.firstName} {testResult.profile.lastName}</p>
                            <p><strong>Token Valid:</strong> {testResult.tokenValid ? 'Yes' : 'No'}</p>
                          </div>
                        )}
                        {testResult.error && (
                          <p className="text-sm text-red-600">{testResult.error}</p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Post Test */}
            <Card>
              <CardHeader>
                <CardTitle>Post Test</CardTitle>
                <CardDescription>
                  Test posting content to LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Post Text</label>
                  <Textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter your test post content..."
                    className="mt-1"
                    rows={4}
                    maxLength={3000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {testText.length}/3000 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <Select value={visibility} onValueChange={(value: 'PUBLIC' | 'CONNECTIONS') => setVisibility(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="CONNECTIONS">Connections Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={postToLinkedIn} 
                  disabled={isPosting || !linkedinConnection || !testText.trim()}
                  className="w-full"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    'Post to LinkedIn'
                  )}
                </Button>

                {postResult && (
                  <Alert className={`${postResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">
                          {postResult.success ? 'Post Successful' : 'Post Failed'}
                        </p>
                        {postResult.success && postResult.linkedinPostId && (
                          <div className="text-sm">
                            <p><strong>LinkedIn Post ID:</strong> {postResult.linkedinPostId}</p>
                            <a 
                              href={`https://www.linkedin.com/feed/update/${postResult.linkedinPostId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              View Post <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {postResult.error && (
                          <p className="text-sm text-red-600">{postResult.error}</p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Make sure you have a LinkedIn connection in your settings</p>
                  <p>2. Test the connection first to verify everything is working</p>
                  <p>3. Enter some test content and try posting to LinkedIn</p>
                  <p>4. Check the results and any error messages</p>
                  <p className="text-red-600 font-medium">
                    ⚠️ This will post real content to your LinkedIn profile!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}