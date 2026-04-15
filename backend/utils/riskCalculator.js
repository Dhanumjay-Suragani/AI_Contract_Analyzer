/**
 * Heuristic risk score from contract text (keyword density + presence).
 * Complements AI analysis; deterministic and fast.
 */

const KEYWORDS = [
  { word: 'penalty', weight: 12 },
  { word: 'penalties', weight: 10 },
  { word: 'termination', weight: 14 },
  { word: 'terminate', weight: 10 },
  { word: 'liability', weight: 12 },
  { word: 'indemnif', weight: 11 },
  { word: 'breach', weight: 14 },
  { word: 'default', weight: 8 },
  { word: 'liquidated damages', weight: 15 },
  { word: 'unlimited liability', weight: 18 },
  { word: 'sole discretion', weight: 9 },
  { word: 'without cause', weight: 11 },
  { word: 'waiver', weight: 6 },
  { word: 'limitation of liability', weight: 7 },
]

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Extract percent values like "5%" from nearby penalty/late-fee language.
 * @param {string} normalized
 * @returns {number[]} percentages found (0-100)
 */
function extractPenaltyPercents(normalized) {
  const out = []
  // Look for patterns like "late fee of 5%" or "penalty ... 3%"
  const re = /\b(?:penalt(?:y|ies)|late fee|late-fee|interest)\b[\s\S]{0,80}?(\d{1,2}(?:\.\d+)?)\s*%/gi
  let m
  while ((m = re.exec(normalized))) {
    const p = Number(m[1])
    if (Number.isFinite(p)) out.push(p)
    if (out.length >= 6) break
  }
  return out
}

/**
 * @param {string} normalized
 */
function detectLiabilityCap(normalized) {
  // crude but effective: "capped at", "limit(ation) of liability", "fees paid", "12 months"
  const signals = [
    /limitation of liability/i,
    /\bliabilit(y|ies)\b[\s\S]{0,60}?\bcap(ped)?\b/i,
    /\bcap(ped)?\b[\s\S]{0,40}?\bfees paid\b/i,
    /\bcap(ped)?\b[\s\S]{0,40}?\bmonths?\b/i,
  ]
  return signals.some((r) => r.test(normalized))
}

/**
 * @param {string} text
 * @returns {{ risk_score: number, risk_level: 'Low' | 'Medium' | 'High', keyword_hits: Record<string, number>, reasons: {title: string, points: number, why: string}[] }}
 */
function calculateRisk(text) {
  if (!text || typeof text !== 'string') {
    return { risk_score: 0, risk_level: 'Low', keyword_hits: {}, reasons: [] }
  }

  const normalized = text.toLowerCase()
  let score = 8
  /** @type {Record<string, number>} */
  const keyword_hits = {}
  /** @type {{title: string, points: number, why: string}[]} */
  const reasons = []

  for (const { word, weight } of KEYWORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped, 'gi')
    const matches = normalized.match(re)
    const count = matches ? matches.length : 0
    if (count > 0) {
      keyword_hits[word] = count
      score += Math.min(count * weight, weight * 4)
    }
  }

  // Calibration heuristics (more realistic signal-based scoring)
  const percents = extractPenaltyPercents(normalized)
  const maxPenalty = percents.length ? Math.max(...percents) : null
  if (maxPenalty !== null) {
    if (maxPenalty > 3) {
      score += 15
      reasons.push({
        title: `Late payment / penalty rate (${maxPenalty}%)`,
        points: 15,
        why: 'Higher than common industry ranges (~1–2%); can materially increase total cost.',
      })
    } else if (maxPenalty > 0) {
      score += 6
      reasons.push({
        title: `Late payment / penalty rate (${maxPenalty}%)`,
        points: 6,
        why: 'Penalties exist; confirm calculation method, compounding, and grace periods.',
      })
    }
  }

  if (detectLiabilityCap(normalized)) {
    score += 20
    reasons.push({
      title: 'Liability cap detected',
      points: 20,
      why: 'Caps can shift risk to your organization; verify scope, carve-outs, and whether it covers data/security incidents.',
    })
  }

  const risk_score = clamp(Math.round(score), 0, 100)
  let risk_level = 'Low'
  if (risk_score >= 66) risk_level = 'High'
  else if (risk_score >= 33) risk_level = 'Medium'

  return { risk_score, risk_level, keyword_hits, reasons }
}

module.exports = { calculateRisk, KEYWORDS }
