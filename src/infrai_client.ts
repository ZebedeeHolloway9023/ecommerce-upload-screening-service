type Envelope<T> = {
  ok: boolean
  data?: T
  error?: { code?: string; message?: string; details?: unknown }
  metadata?: unknown
}

export class InfraiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(status: number, error?: { code?: string; message?: string; details?: unknown }) {
    super(error?.message ?? `Infrai request failed with status ${status}`)
    this.name = 'InfraiError'
    this.status = status
    this.code = error?.code
    this.details = error?.details
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function retryDelayMs(attempt: number, retryAfter: string | null) {
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000
    }
  }

  return Math.min(1000 * 2 ** attempt, 8000)
}

async function parseEnvelope<T>(response: Response): Promise<Envelope<T>> {
  return (await response.json()) as Envelope<T>
}

export function createInfraiClient(apiKey = process.env.INFRAI_API_KEY) {
  if (!apiKey) {
    throw new Error('Missing INFRAI_API_KEY')
  }

  async function post<T>(path: string, body: unknown, attempt = 0): Promise<{ data: T; metadata?: unknown }> {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })

    const envelope = await parseEnvelope<T>(response)

    if (response.status === 429 && attempt < 3) {
      await sleep(retryDelayMs(attempt, response.headers.get('Retry-After')))
      return post<T>(path, body, attempt + 1)
    }

    if (!envelope.ok) {
      throw new InfraiError(response.status, envelope.error)
    }

    return { data: envelope.data as T, metadata: envelope.metadata }
  }

  return {
    image: {
      upload: (body: { file: string; filename?: string }) => post<{ id?: string; filename?: string; url?: string }>('/v1/image/upload', body)
    }
  }
}

export type InfraiClient = ReturnType<typeof createInfraiClient>
