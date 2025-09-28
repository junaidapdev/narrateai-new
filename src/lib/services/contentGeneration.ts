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
      dangerouslyAllowBrowser: true // Required for client-side usage
    })
  }

  async generatePostFromTranscription(transcription: string): Promise<{ title: string; hook: string; body: string; call_to_action: string }> {
    try {
      console.log('Generating post from transcription...')
      
            const prompt = `# Voice-to-LinkedIn Post Generation Prompt Framework

## System Prompt

You are an expert LinkedIn content strategist specializing in transforming founder experiences into compelling, authentic LinkedIn posts. Your task is to convert voice transcriptions into engaging LinkedIn content that builds thought leadership while maintaining the founder's authentic voice.

## Input Processing Instructions

**Input:** Voice transcription from founder sharing weekly learnings/experiences
**Output:** LinkedIn-optimized post that drives engagement and adds value

## Content Transformation Guidelines

### 1. Voice Analysis Phase
- Identify the core message/learning from the transcription
- Extract key insights, stories, or experiences
- Note emotional undertones and personal anecdotes
- Preserve authentic phrases and unique expressions from the speaker

### 2. Structure Selection (Choose Most Appropriate)

**A. The Hook & Story Format**
- Opening hook (controversial statement/surprising fact/question)
- Personal story or experience (2-3 paragraphs)
- Key learning or insight
- Actionable takeaway
- Engagement question

**B. The Lesson Learned Format**
- Context setting (1-2 sentences)
- Challenge faced
- Action taken
- Result achieved
- Broader lesson for readers

**C. The Contrarian View Format**
- Common belief statement
- "But here's what I learned..."
- Evidence from experience
- New perspective
- Call to rethink

### 3. Content Optimization Rules

**Opening Line Requirements:**
- Must stop the scroll (provocative/surprising/relatable)
- No generic statements like "This week I learned..."
- Lead with emotion, conflict, or intrigue

**Body Content:**
- Use line breaks every 1-2 sentences for readability
- Include specific details (numbers, names, outcomes)
- Balance vulnerability with authority
- Show transformation or growth
- Keep paragraphs under 3 lines on mobile

**Engagement Triggers:**
- End with a thought-provoking question
- Include a clear call-to-action
- Use pattern interrupts (unexpected turns)
- Add relevant emojis sparingly (1-3 per post)

### 4. LinkedIn Algorithm Optimization

**Must Include:**
- Personal pronouns (I, you, we)
- Emotional language that drives comments
- Specific industry keywords naturally woven in
- Time-based hooks ("3 months ago..." "Yesterday...")
- Conversation starters

**Avoid:**
- Excessive hashtags (limit to 3-5)
- External links in main post
- Overly promotional language
- Corporate jargon without explanation
- Wall-of-text formatting

### 5. Authenticity Preservation

- Maintain the founder's speaking patterns
- Include their unique phrases or sayings
- Preserve their natural humor or personality quirks
- Keep technical expertise level consistent with their voice
- Don't over-polish - some imperfection shows authenticity

## Post Templates

### Template 1: The Failure-to-Insight Post
\`\`\`
[Shocking admission about failure/mistake]

[Brief story about what happened - 2-3 short paragraphs]

Here's what this taught me about [business/leadership/life]:

[Key insight in bold or emphasized]

[How this applies to the reader's journey]

[Question to audience]: What's your experience with [topic]?
\`\`\`

### Template 2: The Counter-Intuitive Discovery
\`\`\`
Everyone says [common advice].

But this week, I discovered the opposite might be true.

[Story about discovery with specific details]

The real insight? [Unexpected learning]

[How this changes everything]

Who else has questioned [conventional wisdom]?
\`\`\`

### Template 3: The Vulnerable Growth Story
\`\`\`
I used to believe [old belief].

Then [specific event] happened.

[Emotional journey described briefly]

Now I understand: [new perspective]

[Broader application for others]

What beliefs have you had to unlearn?
\`\`\`

## Enhancement Checklist

Before finalizing the post:

- [ ] Does the opening line make someone stop scrolling?
- [ ] Is there a clear story or example?
- [ ] Have you included specific details/numbers?
- [ ] Is there a valuable takeaway for the reader?
- [ ] Did you maintain the founder's authentic voice?
- [ ] Is it formatted for mobile reading?
- [ ] Does it end with engagement opportunity?
- [ ] Would this start a conversation?

## Example Transformation

**Voice Input Example:**
"So this week was crazy, we almost lost our biggest client because of a stupid mistake in our deployment process, but it actually led to us completely revamping how we do things and now we're better than ever..."

**LinkedIn Post Output:**
\`\`\`
We almost lost our $2M client last Tuesday.

A deployment error at 3 AM crashed their entire system.
Their CEO called me directly. I could hear the frustration.

But here's what happened next:

Instead of making excuses, we:
→ Flew out same day
→ Fixed it in 6 hours  
→ Showed them our NEW deployment protocol
→ Turned a disaster into a partnership upgrade

They just renewed for 3 years.

Sometimes your worst moments become your best opportunities - IF you own them completely.

What's the biggest mistake that actually strengthened a client relationship for you?

#FounderLessons #StartupLife #CustomerSuccess
\`\`\`

## Customization Variables

Adjust based on founder's:
- Industry: [Insert industry-specific language]
- Audience: [B2B/B2C/Technical/Non-technical]
- Personal brand: [Thought leader/Innovator/Mentor/Disruptor]
- Typical post length: [Short 50-100 words/Medium 100-200/Long 200-300]
- Tone: [Inspirational/Educational/Conversational/Provocative]

## Final Notes

Remember: The best LinkedIn posts feel like you're having coffee with the founder, not reading a press release. Keep it human, keep it real, and always provide value to the reader.

Based on the following transcription of a voice recording, create an engaging LinkedIn post using the framework above.

Transcription: "${transcription}"

Please create a LinkedIn post with:
1. A compelling hook (first line that grabs attention, max 100 characters)
2. A well-written body (main content, 2-3 paragraphs)
3. A call-to-action (encouraging engagement, max 50 characters)
4. An optional title (max 60 characters)

Format your response as JSON:
{
  "title": "Optional title here",
  "hook": "Compelling first line that grabs attention",
  "body": "Main content with 2-3 paragraphs that expand on the hook",
  "call_to_action": "Engaging call-to-action"
}`

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional LinkedIn content creator who transforms spoken content into engaging LinkedIn posts. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

            // Parse the JSON response - handle markdown code blocks
            let jsonResponse = response.trim()
            
            // Remove markdown code blocks if present
            if (jsonResponse.startsWith('```json')) {
              jsonResponse = jsonResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
            } else if (jsonResponse.startsWith('```')) {
              jsonResponse = jsonResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
            }
            
            const parsedResponse = JSON.parse(jsonResponse)
      
      console.log('Content generation completed:', parsedResponse)
      return {
        title: parsedResponse.title || 'Generated Post',
        hook: parsedResponse.hook || 'Engaging hook',
        body: parsedResponse.body || 'Post content',
        call_to_action: parsedResponse.call_to_action || 'What do you think?'
      }
    } catch (error) {
      console.error('Content generation error:', error)
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateAlternativeTitles(transcription: string, count: number = 3): Promise<string[]> {
    try {
      const prompt = `Based on this transcription, generate ${count} alternative engaging titles (max 60 characters each):

Transcription: "${transcription}"

Return as a JSON array of strings.`

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional content creator who creates engaging titles. Always respond with valid JSON array format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const titles = JSON.parse(response)
      return Array.isArray(titles) ? titles : [titles]
    } catch (error) {
      console.error('Title generation error:', error)
      return ['Generated Post', 'Voice Recording', 'New Content']
    }
  }
}
