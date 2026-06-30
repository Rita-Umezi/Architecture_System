// ─── AI Floor Plan Generator ───────────────────────────────────────────────
// Producers of command JSON — never touch the SceneGraph directly.

import type { IAITask, IFloorPlanAIData, AIProvider } from '../../types/ai.types'
import { generateId } from '../../utils/id'
import { useAIStore } from '../../store/index'

// ─── Prompt Builder ────────────────────────────────────────────────────────

export function buildFloorPlanPrompt(
  description: string,
  buildingType: string,
  totalAreaM2?: number
): string {
  return `You are an expert architect. Generate a detailed floor plan JSON for the following brief:

Building Type: ${buildingType}
Description: ${description}
${totalAreaM2 ? `Target Area: ${totalAreaM2} m²` : ''}

Return a valid JSON object matching this TypeScript interface exactly:
{
  totalArea: number,          // total m²
  buildingType: string,
  rooms: Array<{
    name: string,
    programType: string,      // bedroom|bathroom|kitchen|living|dining|office|corridor
    width: number,            // mm
    height: number,           // mm  
    x: number,                // mm from origin
    y: number,                // mm from origin
    connections: string[]     // connected room names
  }>,
  walls: Array<{
    startX: number, startY: number,
    endX: number, endY: number,
    thickness: number,        // mm, typically 200
    wallType: string          // interior|exterior
  }>
}

Return ONLY the JSON object. No markdown, no explanation.`
}

// ─── AI Generator ─────────────────────────────────────────────────────────

export class FloorPlanGenerator {
  private apiKey: string | null = null
  private provider: AIProvider = 'openai'

  configure(apiKey: string, provider: AIProvider = 'openai'): void {
    this.apiKey = apiKey
    this.provider = provider
  }

  async generate(
    description: string,
    buildingType: string,
    totalAreaM2?: number
  ): Promise<IFloorPlanAIData | null> {
    const store = useAIStore.getState()

    const task: IAITask = {
      id: generateId(),
      type: 'floorplan',
      provider: this.provider,
      prompt: description,
      status: 'running',
      progress: 10,
      createdAt: new Date().toISOString(),
    }
    store.setActiveTask(task)

    try {
      if (!this.apiKey) {
        throw new Error('AI API key not configured. Go to Settings to add your OpenAI or Anthropic API key.')
      }

      const prompt = buildFloorPlanPrompt(description, buildingType, totalAreaM2)

      store.setActiveTask({ ...task, progress: 40 })

      let rawResponse = ''

      if (this.provider === 'openai') {
        rawResponse = await this.callOpenAI(prompt)
      } else if (this.provider === 'anthropic') {
        rawResponse = await this.callAnthropic(prompt)
      } else {
        throw new Error(`Provider '${this.provider}' not yet supported`)
      }

      store.setActiveTask({ ...task, progress: 80 })

      // Parse the JSON response
      const parsed = this.parseResponse(rawResponse)
      store.setActiveTask({ ...task, status: 'complete', progress: 100 })
      return parsed
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown AI error'
      store.setError(msg)
      store.setActiveTask({ ...task, status: 'error', error: msg })
      return null
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })
    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic API error: ${res.statusText}`)
    const data = await res.json()
    return data.content?.[0]?.text ?? ''
  }

  private parseResponse(raw: string): IFloorPlanAIData {
    // Strip markdown code fences if present
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    try {
      return JSON.parse(clean) as IFloorPlanAIData
    } catch {
      throw new Error('AI response was not valid JSON. Try again or refine your description.')
    }
  }
}

export const floorPlanGenerator = new FloorPlanGenerator()
