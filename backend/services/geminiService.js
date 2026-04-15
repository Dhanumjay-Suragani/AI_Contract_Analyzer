const { GoogleGenerativeAI } = require('@google/generative-ai')

// Default model (matches what your project exposes in AI Studio)
const MODEL_NAME = 'gemini-flash-latest'

const DEFAULT_MODEL_CANDIDATES = [
  MODEL_NAME,
  // Common alternates across API rollouts / projects
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-pro-latest',
]

let genAI = null

function getModelCandidates() {
  const forced = (process.env.GEMINI_MODEL || '').trim()
  const list = forced
    ? [forced, ...DEFAULT_MODEL_CANDIDATES.filter((m) => m !== forced)]
    : DEFAULT_MODEL_CANDIDATES

  // AI Studio may show names like "models/gemini-flash-latest"
  // The SDK accepts both forms, but we normalize to be safe.
  return list.map((m) => String(m).replace(/^models\//, ''))
}

function getModel() {
  const key = process.env.GEMINI_API_KEY
  if (!key || key === 'your_api_key_here') {
    throw new Error('GEMINI_API_KEY is not set or is invalid')
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(key)
  }
  // Return the client; model selection happens per-request with fallback.
  return genAI
}

/**
 * Strip markdown code fences if present and parse JSON.
 */
function parseJsonFromModelOutput(raw) {
  let s = (raw || '').trim()

  // Remove ```json ``` wrappers if present
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m
  const m = s.match(fence)
  if (m) s = m[1].trim()

  try {
    return JSON.parse(s)
  } catch (e) {
    // Fallback: extract JSON manually
    const start = s.indexOf('{')
    const end = s.lastIndexOf('}')
    if (start !== -1 && end > start) {
      return JSON.parse(s.slice(start, end + 1))
    }
    throw e
  }
}

function extractRetryDelaySeconds(err) {
  try {
    const details = err?.errorDetails || err?.response?.errorDetails || []
    const retry = Array.isArray(details)
      ? details.find((d) => d && d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')
      : null
    const rawDelay = String(retry?.retryDelay || '')
    const m = rawDelay.match(/(\d+)\s*s/)
    if (m) return Number(m[1])
  } catch {
    // ignore
  }
  // Fallback: parse "Please retry in 20.5s"
  try {
    const msg = String(err?.message || '')
    const m = msg.match(/Please retry in\s+([\d.]+)s/i)
    if (m) return Math.max(1, Math.round(Number(m[1])))
  } catch {
    // ignore
  }
  return null
}

/**
 * Analyze contract using Gemini
 */
async function analyzeContractStructured(contractText) {
  const client = getModel()

  const prompt = `You are an expert commercial contracts attorney and AI product analyst.

Analyze the contract below and return ONLY valid JSON (no markdown, no explanation) in this exact format:

{
  "summary": "Clear 2-4 sentence business summary",
  "clauses": ["Clause name — short explanation"],
  "risks": ["Specific legal or financial risk"],
  "risk_explanations": [
    { "risk": "Late payment penalty (5%)", "why": "Higher than common industry ranges (~1–2%)." }
  ],
  "deadlines": ["Date or time-bound obligation"],
  "obligations": ["Responsibility of a party"],
  "confidence_score": number (0-100),
  "risk_score": number (0-100),
  "risk_level": "Low" | "Medium" | "High"
}

Rules:
- Be precise and structured
- confidence_score: your confidence in the extracted structure/accuracy given the text quality
- risk_score must be calculated based on severity of risks
- risk_level:
  - 0–30 → Low
  - 31–70 → Medium
  - 71–100 → High
- Do NOT include any text outside JSON

CONTRACT TEXT:
---
${contractText.slice(0, 120000)}
---
`

  try {
    let lastErr = null
    let text = ''
    const candidates = getModelCandidates()

    for (const modelName of candidates) {
      try {
        const model = client.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = result.response
        text = response.text()
        console.log('[geminiService] model used:', modelName)
        lastErr = null
        break
      } catch (e) {
        lastErr = e
        const status = e?.status || e?.response?.status
        const msg = String(e?.message || '')
        console.warn('[geminiService] model failed:', modelName, 'status:', status, msg.slice(0, 160))
        // try next model
      }
    }

    if (lastErr) throw lastErr

    console.log('[geminiService] response length:', text?.length)

    const parsed = parseJsonFromModelOutput(text)

    const required = [
      'summary',
      'clauses',
      'risks',
      'deadlines',
      'obligations',
      'risk_score',
      'risk_level',
    ]

    for (const k of required) {
      if (parsed[k] === undefined) {
        throw new Error(`Model JSON missing field: ${k}`)
      }
    }

    return {
      summary: String(parsed.summary),
      clauses: Array.isArray(parsed.clauses) ? parsed.clauses.map(String) : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      risk_explanations: Array.isArray(parsed.risk_explanations)
        ? parsed.risk_explanations
            .filter((x) => x && typeof x === 'object')
            .map((x) => ({
              risk: String(x.risk || ''),
              why: String(x.why || ''),
            }))
            .filter((x) => x.risk.trim() && x.why.trim())
        : [],
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines.map(String) : [],
      obligations: Array.isArray(parsed.obligations) ? parsed.obligations.map(String) : [],
      confidence_score: Number(parsed.confidence_score),
      risk_score: Number(parsed.risk_score) || 0,
      risk_level: String(parsed.risk_level || 'Unknown'),
    }
  } catch (err) {
    console.error('[geminiService] analyze error:', err)
    const status = err?.status || err?.response?.status
    if (status === 429) {
      const retryAfter = extractRetryDelaySeconds(err)
      const e = new Error(
        retryAfter
          ? `Gemini rate limit / quota exceeded. Please retry in ${retryAfter}s.`
          : 'Gemini rate limit / quota exceeded. Please retry shortly.',
      )
      e.status = 429
      if (retryAfter) e.retryAfter = retryAfter
      throw e
    }

    const e = new Error('Gemini analysis failed')
    e.status = status || 503
    throw e
  }
}

/**
 * Chat with contract
 */
async function answerContractQuestion(question, contextContractText) {
  const client = getModel()

  const prompt = `You are a professional contract AI assistant.

Answer the user's question strictly based on the contract provided.

Rules:
- Be concise and clear
- Do NOT hallucinate
- If unsure, say "This is not specified in the contract"

QUESTION:
${question}

CONTRACT TEXT:
---
${(contextContractText || '').slice(0, 120000)}
---
`

  try {
    let lastErr = null
    let text = ''
    const candidates = getModelCandidates()

    for (const modelName of candidates) {
      try {
        const model = client.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = result.response
        text = response.text()
        console.log('[geminiService] chat model used:', modelName)
        lastErr = null
        break
      } catch (e) {
        lastErr = e
        const status = e?.status || e?.response?.status
        const msg = String(e?.message || '')
        console.warn('[geminiService] chat model failed:', modelName, 'status:', status, msg.slice(0, 160))
      }
    }

    if (lastErr) throw lastErr

    return (text || '').trim()
  } catch (err) {
    console.error('[geminiService] chat error:', err)
    return 'Unable to process your request right now. Please try again.'
  }
}

module.exports = {
  getModel,
  analyzeContractStructured,
  answerContractQuestion,
  getModelCandidates,
}