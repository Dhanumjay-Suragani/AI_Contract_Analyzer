import * as React from 'react'
import { motion } from 'framer-motion'
import { FileText, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useContractSession } from '@/app/state/contract-session'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

function bytes(n: number) {
  const kb = n / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const ACCEPT = ['application/pdf', 'text/plain']

export function UploadPage() {
  const nav = useNavigate()
  const { file, setFile, reset, setExtractedText } = useContractSession()
  const [drag, setDrag] = React.useState(false)
  const [progress, setProgress] = React.useState<number>(file ? 100 : 0)
  const inputId = React.useId()
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string>('')

  React.useEffect(() => {
    if (!file) return
    setProgress(100)
  }, [file])

  const onPick = (f: File) => {
    setFile({ name: f.name, size: f.size, type: f.type || 'application/octet-stream' })
    setSelectedFile(f)
    setError('')
    setProgress(0)
    const t0 = Date.now()
    const tick = () => {
      const p = Math.min(100, (Date.now() - t0) / 12)
      setProgress(p)
      if (p < 100) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const handleUploadAndGo = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      setError('')
      const formData = new FormData()
      formData.append('file', selectedFile)

      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${base}/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || 'Upload failed')

      setExtractedText(String(data.text || ''))
      nav('/processing')
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    if (f.type && !ACCEPT.includes(f.type)) return
    onPick(f)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Upload
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Drag & drop your contract
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          PDF or text. We’ll simulate analysis and generate a premium dashboard experience.
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <Card
          className={[
            'relative overflow-hidden rounded-2xl',
            drag ? 'ring-2 ring-indigo-400/70 shadow-glow' : '',
          ].join(' ')}
        >
          <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.6),transparent_55%)] dark:opacity-20" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
              Upload zone
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div
              onDragEnter={(e) => {
                e.preventDefault()
                setDrag(true)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={[
                'group grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-white/20 bg-white/40 p-8 text-center shadow-sm backdrop-blur-xl transition-all dark:bg-white/[0.03]',
                drag ? 'bg-white/60 dark:bg-white/[0.06]' : '',
              ].join(' ')}
            >
              <div className="max-w-md">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/[0.06]">
                  <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="mt-4 text-base font-semibold tracking-tight">
                  Drop your contract here
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  PDF (.pdf) or plain text (.txt). Max size: 25MB.
                </div>

                <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <input
                    id={inputId}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) onPick(f)
                    }}
                  />
                  <Button asChild size="lg">
                    <label htmlFor={inputId} className="cursor-pointer">
                      Choose file
                    </label>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      reset()
                      setProgress(0)
                    }}
                  >
                    Clear
                  </Button>
                </div>

                <div className="mt-6">
                  <Progress value={progress} />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {progress >= 100 ? 'Ready to analyze.' : 'Uploading…'}
                  </div>
                  {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
                </div>
              </div>
            </div>

            {file ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"
              >
                <div className="glass rounded-2xl p-4">
                  <div className="text-sm font-semibold tracking-tight">File preview</div>
                  <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                    <div>
                      <span className="text-foreground/80">Name:</span> {file.name}
                    </div>
                    <div>
                      <span className="text-foreground/80">Size:</span> {bytes(file.size)}
                    </div>
                    <div>
                      <span className="text-foreground/80">Type:</span> {file.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  <Button
                    size="lg"
                    onClick={() => void handleUploadAndGo()}
                    disabled={progress < 100 || uploading || !selectedFile}
                  >
                    {uploading ? 'Uploading…' : 'Analyze Contract'}
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

