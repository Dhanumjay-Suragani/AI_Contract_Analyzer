const express = require('express')
const multer = require('multer')
const { extractTextFromFile } = require('../services/parser')

const router = express.Router()

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ok =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'text/plain; charset=utf-8' ||
      /\.pdf$/i.test(file.originalname || '') ||
      /\.txt$/i.test(file.originalname || '')

    if (!ok) {
      cb(new Error('Invalid file type: only PDF and TXT are allowed'))
      return
    }
    cb(null, true)
  },
})

/**
 * POST /upload
 * multipart/form-data field name: file
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Provide a PDF or TXT file using field name "file"',
      })
    }

    const { buffer, mimetype, originalname } = req.file
    console.log('[upload] received:', originalname, mimetype, buffer?.length)

    const { text, numPages } = await extractTextFromFile(buffer, mimetype, originalname)

    if (!text || text.length < 10) {
      return res.status(422).json({
        error: 'Empty or unreadable document',
        message: 'Could not extract meaningful text from the file',
      })
    }

    return res.json({
      ok: true,
      filename: originalname,
      mimetype,
      numPages: numPages ?? null,
      text,
      charCount: text.length,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
