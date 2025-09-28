import { createClient } from '@/lib/supabase/client'

export class AudioProcessingService {
  private supabase = createClient()

  async downloadAudioFromSupabase(audioUrl: string): Promise<Blob> {
    try {
      console.log('Downloading audio from Supabase:', audioUrl)
      
      // Extract the file path from the Supabase URL
      const url = new URL(audioUrl)
      const pathParts = url.pathname.split('/')
      const bucket = pathParts[pathParts.length - 3] // Usually 'recordings'
      const fileName = pathParts[pathParts.length - 1] // The actual file name
      
      console.log('Extracted bucket:', bucket, 'fileName:', fileName)
      
      // Download the file from Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(fileName)
      
      if (error) {
        throw new Error(`Failed to download audio: ${error.message}`)
      }
      
      if (!data) {
        throw new Error('No audio data received from Supabase')
      }
      
      console.log('Audio downloaded successfully, size:', data.size)
      return data
    } catch (error) {
      console.error('Error downloading audio:', error)
      throw error
    }
  }

  async uploadToAssemblyAI(audioBlob: Blob): Promise<string> {
    try {
      console.log('Uploading audio to AssemblyAI...')
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      
      // Upload to AssemblyAI's upload endpoint
      const response = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || ''
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AssemblyAI upload failed: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Audio uploaded to AssemblyAI:', result.upload_url)
      return result.upload_url
    } catch (error) {
      console.error('Error uploading to AssemblyAI:', error)
      throw error
    }
  }

  async processAudioForTranscription(audioUrl: string): Promise<string> {
    try {
      // Step 1: Download audio from Supabase
      const audioBlob = await this.downloadAudioFromSupabase(audioUrl)
      
      // Step 2: Upload to AssemblyAI
      const assemblyAIUrl = await this.uploadToAssemblyAI(audioBlob)
      
      return assemblyAIUrl
    } catch (error) {
      console.error('Error processing audio:', error)
      throw error
    }
  }
}
