const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const env = {
  ANTHROPIC_API_KEY
} as const 