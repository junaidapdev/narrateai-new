'use client'

export function EnvCheck() {
  const assemblyaiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">Environment Variables Check:</h3>
      <p className="text-sm text-yellow-700">
        AssemblyAI Key: {assemblyaiKey ? '✅ Found' : '❌ Missing'}
      </p>
      <p className="text-sm text-yellow-700">
        OpenAI Key: {openaiKey ? '✅ Found' : '❌ Missing'}
      </p>
      {!assemblyaiKey && (
        <p className="text-xs text-red-600 mt-2">
          Add NEXT_PUBLIC_ASSEMBLYAI_API_KEY to your .env.local file
        </p>
      )}
      {!openaiKey && (
        <p className="text-xs text-red-600 mt-2">
          Add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file
        </p>
      )}
    </div>
  )
}
