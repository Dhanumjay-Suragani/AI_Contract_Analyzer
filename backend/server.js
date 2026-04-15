require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')

const uploadRoutes = require('./routes/upload')
const analyzeRoutes = require('./routes/analyze')
const chatRoutes = require('./routes/chat')

const PORT = Number(process.env.PORT) || 5000

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ai-contract-analyzer-api', ts: new Date().toISOString() })
})

app.use('/upload', uploadRoutes)
app.use('/analyze', analyzeRoutes)
app.use('/chat', chatRoutes)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err?.name, err?.message)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large', message: 'Max size is 25MB' })
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Upload error', message: err.message })
  }

  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({ error: 'Invalid file type', message: err.message })
  }

  if (err.message && err.message.includes('GEMINI_API_KEY')) {
    return res.status(503).json({ error: 'Configuration', message: err.message })
  }

  if (err.message && err.message.includes('API key')) {
    return res.status(503).json({ error: 'Configuration', message: err.message })
  }

  const status = err.status || 500
  return res.status(status).json({
    error: err.name || 'Error',
    message: err.message || 'Internal server error',
    retryAfter: typeof err.retryAfter === 'number' ? err.retryAfter : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`[server] AI Contract Analyzer API listening on http://localhost:${PORT}`)
  console.log(`[server] Health: GET http://localhost:${PORT}/health`)
})
