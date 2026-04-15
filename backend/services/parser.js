const pdfParse = require('pdf-parse')

/**
 * Extract plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, numPages?: number }>}
 */
async function extractTextFromPdf(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('PDF input must be a Buffer')
  }
  const data = await pdfParse(buffer)
  const text = (data.text || '').trim()
  return { text, numPages: data.numpages }
}

/**
 * Decode TXT file buffer as UTF-8 string.
 * @param {Buffer} buffer
 * @returns {string}
 */
function extractTextFromTxt(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('TXT input must be a Buffer')
  }
  return buffer.toString('utf8').replace(/\uFEFF/g, '').trim()
}

/**
 * @param {Buffer} buffer
 * @param {'application/pdf' | 'text/plain' | string} mimetype
 * @param {string} [originalname]
 */
async function extractTextFromFile(buffer, mimetype, originalname = '') {
  const name = (originalname || '').toLowerCase()

  if (mimetype === 'application/pdf' || name.endsWith('.pdf')) {
    return extractTextFromPdf(buffer)
  }

  if (
    mimetype === 'text/plain' ||
    mimetype === 'text/plain; charset=utf-8' ||
    name.endsWith('.txt')
  ) {
    return { text: extractTextFromTxt(buffer) }
  }

  throw new Error(`Unsupported file type: ${mimetype || 'unknown'}`)
}

module.exports = {
  extractTextFromPdf,
  extractTextFromTxt,
  extractTextFromFile,
}
