const express = require('express')
const { answerContractQuestion } = require('../services/geminiService')

const router = express.Router()

/**
 * POST /chat
 * Body: { "question": "...", "context": "contract text" }
 */
router.post('/', async (req, res, next) => {
  try {
    const { question, context } = req.body || {}

    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Field "question" is required and must be a non-empty string',
      })
    }

    if (typeof context !== 'string' || !context.trim()) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Field "context" is required (contract text the assistant should use)',
      })
    }

    console.log('[chat] question length:', question.length, 'context chars:', context.length)

    const answer = await answerContractQuestion(question.trim(), context.trim())

    if (!answer) {
      return res.status(502).json({
        error: 'Empty response',
        message: 'The model returned no answer',
      })
    }

    return res.json({ answer })
  } catch (err) {
    next(err)
  }
})

module.exports = router
