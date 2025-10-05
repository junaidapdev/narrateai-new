import OpenAI from 'openai'

export class ContentGenerationService {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    console.log('OpenAI API Key check:', apiKey ? 'Found' : 'Not found')
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.')
    }
    this.client = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true
    })
  }

  async generatePostFromTranscription(
    transcription: string, 
    userContext?: { 
      linkedinGoal?: string; 
      backStory?: string; 
    }
  ): Promise<{ title: string; hook: string; body: string; call_to_action: string }> {
    try {
      console.log('=== CONTENT GENERATION START ===')
      console.log('Input transcription:', transcription)
      console.log('Transcription length:', transcription.length)
      console.log('User context:', userContext)
      
      // Build personalized system prompt
      let systemPrompt = `You are an expert LinkedIn content strategist who transforms voice transcriptions into high-engagement posts. You MUST respond with valid JSON only.`
      
      if (userContext?.linkedinGoal || userContext?.backStory) {
        systemPrompt += `\n\nPERSONALIZATION CONTEXT:`
        
        if (userContext.linkedinGoal) {
          const goalDescriptions = {
            'brand': 'building a personal brand and establishing thought leadership',
            'hire': 'attracting and recruiting top talent',
            'raise': 'connecting with investors and securing funding',
            'sell': 'generating leads and driving sales'
          }
          systemPrompt += `\n- User's LinkedIn goal: ${goalDescriptions[userContext.linkedinGoal as keyof typeof goalDescriptions] || userContext.linkedinGoal}`
        }
        
        if (userContext.backStory) {
          systemPrompt += `\n- User's background: ${userContext.backStory}`
        }
        
        systemPrompt += `\n\nUse this context to tailor the content style, tone, and messaging to align with the user's goals and background. Make the content feel authentic to their voice and professional journey.`
      }
      
      const userPrompt = `Transform this voice transcription into a viral LinkedIn post following these exact rules:

CRITICAL: You MUST respond with ONLY a valid JSON object. No other text before or after.

${userContext?.linkedinGoal || userContext?.backStory ? `
## PERSONALIZATION REQUIREMENTS
- Tailor the content to align with the user's LinkedIn goals and professional background
- Use language and examples that resonate with their industry and experience level
- Ensure the tone matches their professional voice and journey
- Make the content feel authentic to their specific situation and goals
` : ''}

## STYLE RULES

Hook Requirements:
- Bold, contrarian, or emotionally charged first line
- Maximum 100 characters
- NO "This week I learned..." or "I want to talk about..."
- Examples: "Most people are stuck." / "I left $500K on the table." / "Nobody takes you seriously yet."

Body Structure:
- Short sentences. One idea per line.
- Use \\n\\n for paragraph breaks
- Maximum 3-4 lines per paragraph
- Include specific numbers and details from transcription
- Use "→" for bullet points

Language Patterns:
- "Here's the truth..." / "I spent [X] years..." / "Everyone wants... Nobody wants..."
- Short. Punchy. Then longer contextual sentences.

Call-to-Action:
- Maximum 50 characters
- Rhetorical question format
- Examples: "What rate are you too scared to charge?" / "What chapter are you stuck on?"

## FORMAT (Choose Best Fit)

Format A - Transformation:
[Bold hook]
[Past struggle]
[Turning point]
[Results with →]
[Lesson]
[Question]

Format B - Contrarian:
[Myth statement]
For [time], we were told: "[advice]"
Meanwhile, [reality]
[Your evidence]
[Reframe]
[Question]

Format C - Wrong Race:
[Wasted effort opening]
I did this for [time].
[Hollow wins]
Then [realization]
The worst part? [validation]
But [emotional truth]
The right path: [new way]
[Question]

INPUT TRANSCRIPTION:
"${transcription}"

OUTPUT FORMAT (RESPOND WITH THIS EXACT JSON STRUCTURE):
{
  "title": "Catchy title under 60 chars",
  "hook": "Compelling first line under 100 chars",
  "body": "2-3 paragraphs with \\n\\n breaks and proper formatting",
  "call_to_action": "Engaging question under 50 chars"
}

EXAMPLE OUTPUT:
{
  "title": "The pricing mistake that cost me $500K",
  "hook": "I left $500,000 on the table because I was scared.",
  "body": "For 5 years, I charged $75/hour.\\n\\nI was terrified to raise rates.\\nThought clients would leave.\\nThought I wasn't worth more.\\n\\nThen I tested $300/hour.\\n\\nNobody blinked. They paid it.\\n\\nSame work. Same me. 4x the price.\\n\\nNow $500/hour with a waitlist.\\n\\nWe don't underprice because the market says so.\\nWe underprice because fear says so.",
  "call_to_action": "What rate are you too scared to charge?"
}

NOW GENERATE THE POST. RESPOND WITH JSON ONLY.`

      console.log('Sending request to OpenAI...')

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      
      console.log('=== RAW OPENAI RESPONSE ===')
      console.log(response)
      console.log('=== END RAW RESPONSE ===')

      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse JSON
      let parsedResponse
      try {
        parsedResponse = JSON.parse(response)
        console.log('=== PARSED JSON ===')
        console.log(JSON.stringify(parsedResponse, null, 2))
        console.log('=== END PARSED JSON ===')
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response that failed to parse:', response)
        throw new Error('Failed to parse OpenAI response as JSON')
      }

      // Validate required fields
      if (!parsedResponse.hook || !parsedResponse.body || !parsedResponse.call_to_action) {
        console.error('Missing required fields in response:', parsedResponse)
        throw new Error('OpenAI response missing required fields')
      }
      
      const result = {
        title: parsedResponse.title || 'LinkedIn Post',
        hook: parsedResponse.hook,
        body: parsedResponse.body,
        call_to_action: parsedResponse.call_to_action
      }

      console.log('=== FINAL RESULT ===')
      console.log(JSON.stringify(result, null, 2))
      console.log('=== CONTENT GENERATION END ===')
      
      return result

    } catch (error) {
      console.error('=== CONTENT GENERATION ERROR ===')
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      console.error('Full error:', error)
      console.error('=== END ERROR ===')
      
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateAlternativeTitles(
    transcription: string, 
    count: number = 3,
    userContext?: { 
      linkedinGoal?: string; 
      backStory?: string; 
    }
  ): Promise<string[]> {
    try {
      // Build personalized title generation prompt
      let titleSystemPrompt = "You create engaging LinkedIn post titles. Respond with JSON only."
      let titleUserPrompt = `Generate ${count} alternative catchy titles (max 60 chars each) for this transcription:

"${transcription}"`

      if (userContext?.linkedinGoal || userContext?.backStory) {
        titleSystemPrompt += `\n\nPERSONALIZATION: Tailor titles to match the user's LinkedIn goals and professional background.`
        
        if (userContext.linkedinGoal) {
          const goalDescriptions = {
            'brand': 'personal branding and thought leadership',
            'hire': 'talent acquisition and recruitment',
            'raise': 'fundraising and investor relations',
            'sell': 'sales and lead generation'
          }
          titleUserPrompt += `\n\nUser's LinkedIn goal: ${goalDescriptions[userContext.linkedinGoal as keyof typeof goalDescriptions] || userContext.linkedinGoal}`
        }
        
        if (userContext.backStory) {
          titleUserPrompt += `\nUser's background: ${userContext.backStory}`
        }
        
        titleUserPrompt += `\n\nMake titles relevant to their specific goals and professional context.`
      }

      titleUserPrompt += `\n\nRespond with JSON: {"titles": ["title1", "title2", "title3"]}`

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: titleSystemPrompt
          },
          {
            role: "user",
            content: titleUserPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 300
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const parsed = JSON.parse(response)
      return parsed.titles || ['LinkedIn Post', 'Voice Recording', 'New Content']
    } catch (error) {
      console.error('Title generation error:', error)
      return ['LinkedIn Post', 'Voice Recording', 'New Content']
    }
  }
}