const express = require('express')
const { analyzeContractStructured } = require('../services/geminiService')
const { calculateRisk } = require('../utils/riskCalculator')

const router = express.Router()

/**
 * POST /analyze
 * Body: { "text": "..." }
 */
router.post('/', async (req, res, next) => {
  try {
    const { text } = req.body || {}

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Request body must include a non-empty string field "text"',
      })
    }

    const trimmed = text.trim()
    if (trimmed.length < 50) {
      return res.status(400).json({
        error: 'Text too short',
        message: 'Provide at least ~50 characters of contract text for analysis',
      })
    }

    console.log('[analyze] chars:', trimmed.length)

    const ai = await analyzeContractStructured(trimmed)
    const risk = calculateRisk(trimmed)

    return res.json({
      data: {
        summary: ai.summary,
        clauses: ai.clauses,
        risks: ai.risks,
        deadlines: ai.deadlines,
        obligations: ai.obligations,
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        risk_keywords: risk.keyword_hits,
        risk_reasons: risk.reasons,
        confidence_score: ai.confidence_score ?? null,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
