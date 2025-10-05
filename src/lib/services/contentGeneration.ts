// import OpenAI from 'openai'

// export class ContentGenerationService {
//   private client: OpenAI

//   constructor() {
//     const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
//     console.log('OpenAI API Key check:', apiKey ? 'Found' : 'Not found')
//     if (!apiKey) {
//       throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.')
//     }
//     this.client = new OpenAI({ 
//       apiKey,
//       dangerouslyAllowBrowser: true
//     })
//   }

//   async generatePostFromTranscription(
//     transcription: string, 
//     userContext?: { 
//       linkedinGoal?: string; 
//       backStory?: string; 
//     }
//   ): Promise<{ title: string; hook: string; body: string; call_to_action: string }> {
//     try {
//       console.log('=== CONTENT GENERATION START ===')
//       console.log('Input transcription:', transcription)
//       console.log('Transcription length:', transcription.length)
//       console.log('User context:', userContext)
      
//       // Build personalized system prompt
//       let systemPrompt = `You are an expert LinkedIn content strategist who transforms voice transcriptions into high-engagement posts. You MUST respond with valid JSON only.`
      
//       if (userContext?.linkedinGoal || userContext?.backStory) {
//         systemPrompt += `\n\nPERSONALIZATION CONTEXT:`
        
//         if (userContext.linkedinGoal) {
//           const goalDescriptions = {
//             'brand': 'building a personal brand and establishing thought leadership',
//             'hire': 'attracting and recruiting top talent',
//             'raise': 'connecting with investors and securing funding',
//             'sell': 'generating leads and driving sales'
//           }
//           systemPrompt += `\n- User's LinkedIn goal: ${goalDescriptions[userContext.linkedinGoal as keyof typeof goalDescriptions] || userContext.linkedinGoal}`
//         }
        
//         if (userContext.backStory) {
//           systemPrompt += `\n- User's background: ${userContext.backStory}`
//         }
        
//         systemPrompt += `\n\nUse this context to tailor the content style, tone, and messaging to align with the user's goals and background. Make the content feel authentic to their voice and professional journey.`
//       }
      
//       const userPrompt = `Transform this voice transcription into a viral LinkedIn post following these exact rules:

// CRITICAL: You MUST respond with ONLY a valid JSON object. No other text before or after.

// ${userContext?.linkedinGoal || userContext?.backStory ? `
// ## PERSONALIZATION REQUIREMENTS
// - Tailor the content to align with the user's LinkedIn goals and professional background
// - Use language and examples that resonate with their industry and experience level
// - Ensure the tone matches their professional voice and journey
// - Make the content feel authentic to their specific situation and goals
// ` : ''}

// ## STYLE RULES

// Hook Requirements:
// - Bold, contrarian, or emotionally charged first line
// - Maximum 100 characters
// - NO "This week I learned..." or "I want to talk about..."
// - Examples: "Most people are stuck." / "I left $500K on the table." / "Nobody takes you seriously yet."

// Body Structure:
// - Short sentences. One idea per line.
// - Use \\n\\n for paragraph breaks
// - Maximum 3-4 lines per paragraph
// - Include specific numbers and details from transcription
// - Use "→" for bullet points

// Language Patterns:
// - "Here's the truth..." / "I spent [X] years..." / "Everyone wants... Nobody wants..."
// - Short. Punchy. Then longer contextual sentences.

// Call-to-Action:
// - Maximum 50 characters
// - Rhetorical question format
// - Examples: "What rate are you too scared to charge?" / "What chapter are you stuck on?"

// ## FORMAT (Choose Best Fit)

// Format A - Transformation:
// [Bold hook]
// [Past struggle]
// [Turning point]
// [Results with →]
// [Lesson]
// [Question]

// Format B - Contrarian:
// [Myth statement]
// For [time], we were told: "[advice]"
// Meanwhile, [reality]
// [Your evidence]
// [Reframe]
// [Question]

// Format C - Wrong Race:
// [Wasted effort opening]
// I did this for [time].
// [Hollow wins]
// Then [realization]
// The worst part? [validation]
// But [emotional truth]
// The right path: [new way]
// [Question]

// INPUT TRANSCRIPTION:
// "${transcription}"

// OUTPUT FORMAT (RESPOND WITH THIS EXACT JSON STRUCTURE):
// {
//   "title": "Catchy title under 60 chars",
//   "hook": "Compelling first line under 100 chars",
//   "body": "2-3 paragraphs with \\n\\n breaks and proper formatting",
//   "call_to_action": "Engaging question under 50 chars"
// }

// EXAMPLE OUTPUT:
// {
//   "title": "The pricing mistake that cost me $500K",
//   "hook": "I left $500,000 on the table because I was scared.",
//   "body": "For 5 years, I charged $75/hour.\\n\\nI was terrified to raise rates.\\nThought clients would leave.\\nThought I wasn't worth more.\\n\\nThen I tested $300/hour.\\n\\nNobody blinked. They paid it.\\n\\nSame work. Same me. 4x the price.\\n\\nNow $500/hour with a waitlist.\\n\\nWe don't underprice because the market says so.\\nWe underprice because fear says so.",
//   "call_to_action": "What rate are you too scared to charge?"
// }

// NOW GENERATE THE POST. RESPOND WITH JSON ONLY.`

//       console.log('Sending request to OpenAI...')

//       const completion = await this.client.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//           {
//             role: "system",
//             content: systemPrompt
//           },
//           {
//             role: "user",
//             content: userPrompt
//           }
//         ],
//         response_format: { type: "json_object" },
//         temperature: 0.7,
//         max_tokens: 1500
//       })

//       const response = completion.choices[0]?.message?.content
      
//       console.log('=== RAW OPENAI RESPONSE ===')
//       console.log(response)
//       console.log('=== END RAW RESPONSE ===')

//       if (!response) {
//         throw new Error('No response from OpenAI')
//       }

//       // Parse JSON
//       let parsedResponse
//       try {
//         parsedResponse = JSON.parse(response)
//         console.log('=== PARSED JSON ===')
//         console.log(JSON.stringify(parsedResponse, null, 2))
//         console.log('=== END PARSED JSON ===')
//       } catch (parseError) {
//         console.error('JSON Parse Error:', parseError)
//         console.error('Response that failed to parse:', response)
//         throw new Error('Failed to parse OpenAI response as JSON')
//       }

//       // Validate required fields
//       if (!parsedResponse.hook || !parsedResponse.body || !parsedResponse.call_to_action) {
//         console.error('Missing required fields in response:', parsedResponse)
//         throw new Error('OpenAI response missing required fields')
//       }
      
//       const result = {
//         title: parsedResponse.title || 'LinkedIn Post',
//         hook: parsedResponse.hook,
//         body: parsedResponse.body,
//         call_to_action: parsedResponse.call_to_action
//       }

//       console.log('=== FINAL RESULT ===')
//       console.log(JSON.stringify(result, null, 2))
//       console.log('=== CONTENT GENERATION END ===')
      
//       return result

//     } catch (error) {
//       console.error('=== CONTENT GENERATION ERROR ===')
//       console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
//       console.error('Error message:', error instanceof Error ? error.message : String(error))
//       console.error('Full error:', error)
//       console.error('=== END ERROR ===')
      
//       throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`)
//     }
//   }

//   async generateAlternativeTitles(
//     transcription: string, 
//     count: number = 3,
//     userContext?: { 
//       linkedinGoal?: string; 
//       backStory?: string; 
//     }
//   ): Promise<string[]> {
//     try {
//       // Build personalized title generation prompt
//       let titleSystemPrompt = "You create engaging LinkedIn post titles. Respond with JSON only."
//       let titleUserPrompt = `Generate ${count} alternative catchy titles (max 60 chars each) for this transcription:

// "${transcription}"`

//       if (userContext?.linkedinGoal || userContext?.backStory) {
//         titleSystemPrompt += `\n\nPERSONALIZATION: Tailor titles to match the user's LinkedIn goals and professional background.`
        
//         if (userContext.linkedinGoal) {
//           const goalDescriptions = {
//             'brand': 'personal branding and thought leadership',
//             'hire': 'talent acquisition and recruitment',
//             'raise': 'fundraising and investor relations',
//             'sell': 'sales and lead generation'
//           }
//           titleUserPrompt += `\n\nUser's LinkedIn goal: ${goalDescriptions[userContext.linkedinGoal as keyof typeof goalDescriptions] || userContext.linkedinGoal}`
//         }
        
//         if (userContext.backStory) {
//           titleUserPrompt += `\nUser's background: ${userContext.backStory}`
//         }
        
//         titleUserPrompt += `\n\nMake titles relevant to their specific goals and professional context.`
//       }

//       titleUserPrompt += `\n\nRespond with JSON: {"titles": ["title1", "title2", "title3"]}`

//       const completion = await this.client.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//           {
//             role: "system",
//             content: titleSystemPrompt
//           },
//           {
//             role: "user",
//             content: titleUserPrompt
//           }
//         ],
//         response_format: { type: "json_object" },
//         temperature: 0.8,
//         max_tokens: 300
//       })

//       const response = completion.choices[0]?.message?.content
//       if (!response) {
//         throw new Error('No response from OpenAI')
//       }

//       const parsed = JSON.parse(response)
//       return parsed.titles || ['LinkedIn Post', 'Voice Recording', 'New Content']
//     } catch (error) {
//       console.error('Title generation error:', error)
//       return ['LinkedIn Post', 'Voice Recording', 'New Content']
//     }
//   }
// }


import OpenAI from 'openai'

export class ContentGenerationService {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    // console.log('OpenAI API Key check:', apiKey ? 'Found' : 'Not found')
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
      // console.log('=== CONTENT GENERATION START ===')
      // console.log('Input transcription:', transcription)
      // console.log('Transcription length:', transcription.length)
      // console.log('User context:', userContext)
      
      // Build personalized system prompt
      let systemPrompt = `You are an expert LinkedIn content strategist who transforms voice transcriptions into high-engagement posts. You specialize in the storytelling style of top LinkedIn creators who have built 6-8 figure businesses through personal branding. Always respond with valid JSON format.`
      
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
          systemPrompt += `\n\nIMPORTANT: Deeply integrate this background into the content. Use their specific experiences, metrics, and professional journey to make the post feel authentically theirs.`
        }
      }
      
      const userPrompt = `You are transforming a voice transcription into a viral LinkedIn post. Follow these rules precisely:

## STYLE RULES

### Hook (First Line) Requirements:
- Start with a bold, contrarian, or emotionally charged statement
- Use pattern interrupts that challenge conventional wisdom
- Examples: "Most people are stuck." / "The specialist era is dying." / "Nobody takes you seriously yet."
- Maximum 100 characters
- NO generic openings like "This week I learned..." or "I want to talk about..."

### Body Structure (2-3 paragraphs):
- SHORT sentences. One idea per line.
- Use single-line paragraphs frequently
- Maximum 3-4 lines per paragraph
- Add white space generously
- Include specific numbers, timeframes, emotions from the transcription
- Use bullet points with "→" or "•" for lists

### Language Patterns to Use:
- "Here's the truth..." / "Most people think... But..."
- "I spent [X] years thinking... Turns out..."
- "Everyone wants... Nobody wants..."
- "The real [X] isn't... It's..."
- Short. Punchy. Direct sentences.
- Then longer contextual sentences for depth.

### Credibility Markers:
- Specific numbers: "$10M+ business" / "in 6 years" / "790K+ followers"
- Time markers: "Last Tuesday" / "3 months ago" / "At age 38"
- Before/after contrast: "from [bad state] to [good state]"

### Call-to-Action Rules:
- Maximum 50 characters
- Rhetorical questions that make readers reflect
- Examples: "What chapter are you stuck on?" / "Ready to design your own Tuesdays?"
- Make it conversational, not salesy

## CONTENT TRANSFORMATION PROCESS

### Step 1: Extract from Transcription
- Identify the core message/learning
- Find personal story or transformation
- Note emotional moments and specific details
- Preserve authentic phrases from speaker

### Step 2: Apply PAS Framework
**Problem**: What pain point or struggle is mentioned?
**Agitation**: Why does this problem matter? What's the cost?
**Solution**: What's the insight or way forward?

### Step 3: Format Selection (Choose Best Fit)

**Format A - Transformation Story:**
[Bold hook about the change]

[Past struggle - 2-3 short lines]

[Turning point moment]

[New reality with specific results]
→ Result 1
→ Result 2  
→ Result 3

[The core lesson]

[Reflective question for engagement]

**Format B - Contrarian Take:**
[Myth/common belief statement]

And [emotional reaction].

For [timeframe], we were told:
"[Bad advice 1]"
"[Bad advice 2]"

Meanwhile, [contrasting reality].

[Your personal evidence]

[Reframe weakness as strength]

[Call to action question]

**Format C - The Wrong Race:**
[Opening about wasted effort]

I did this for [timeframe].

[List of hollow achievements]

Then [realization].

The worst part?
[What others said/social validation]

But I was [emotional truth].

Because [real problem].

The right path looks different:
[New definition of success]

[Question to reader]

## STRICT FORMATTING RULES

✅ DO:
- Use line breaks every 1-2 sentences
- Keep mobile-readable (short paragraphs)
- Include specific details from transcription
- Use "→" or "•" for bullet points
- Add emotional language
- End with engaging question
- Maintain speaker's authentic voice

❌ DON'T:
- Start with "I want to talk about..."
- Create dense paragraphs
- Use generic advice without personal context
- Add multiple CTAs
- Use apologetic language
- Add hashtags (leave that out)
- Use emojis (keep it clean)

## OUTPUT FORMAT

You must respond with ONLY valid JSON in this exact format:

{
  "title": "Optional catchy title (max 60 chars)",
  "hook": "Compelling first line (max 100 chars)",
  "body": "Main content with proper line breaks and formatting (2-3 paragraphs)",
  "call_to_action": "Engaging question or statement (max 50 chars)"
}

## EXAMPLE

### Input Transcription:
"I spent five years charging $75 an hour. Was scared to raise rates. Then tested $300. Nobody batted an eye. Now at $500 with a waitlist. We underprice out of fear, not reality."

### Output JSON:
{
  "title": "The pricing lesson that changed everything",
  "hook": "I left $500,000 on the table because I was scared.",
  "body": "For 5 years, I charged $75/hour for consulting.\\n\\nI was terrified to raise my rates.\\nThought clients would leave.\\nThought I wasn't worth more.\\n\\nThen I tested $300/hour with new clients.\\n\\nNobody blinked. They just paid it.\\n\\nSame work. Same me. Different price.\\n\\nNow I'm at $500/hour with a waitlist.\\n\\nThe truth?\\n\\nWe don't underprice because the market says so.\\nWe underprice because fear says so.\\n\\nThe market will tell you when you're too expensive.\\nMost of us never even test it.",
  "call_to_action": "What rate are you too scared to charge?"
}

---

Now, transform this transcription into a LinkedIn post:

Transcription: "${transcription}"

Remember: 
- Extract the core story and emotion
- Use short, punchy sentences
- Add specific details from the transcription
- Follow one of the three formats
- End with an engaging question
- Output ONLY valid JSON`

      // console.log('Sending request to OpenAI...')

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
      
      // console.log('=== RAW OPENAI RESPONSE ===')
      // console.log(response)
      // console.log('=== END RAW RESPONSE ===')

      if (!response) {
        throw new Error('No response from OpenAI')
      }

      let parsedResponse
      try {
        parsedResponse = JSON.parse(response)
        // console.log('=== PARSED JSON ===')
        // console.log(JSON.stringify(parsedResponse, null, 2))
        // console.log('=== END PARSED JSON ===')
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response that failed to parse:', response)
        throw new Error('Failed to parse OpenAI response as JSON')
      }

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

      // console.log('=== FINAL RESULT ===')
      // console.log(JSON.stringify(result, null, 2))
      // console.log('=== CONTENT GENERATION END ===')
      
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