import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, FileText, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useContractSession } from '@/app/state/contract-session'
import { apiRequest } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[min(720px,92%)] rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur dark:bg-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">AI is typing</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
          </span>
        </div>
      </div>
    </div>
  )
}

function Bubble({
  role,
  children,
}: {
  role: 'user' | 'assistant'
  children: React.ReactNode
}) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(720px,92%)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur',
          isUser
            ? 'bg-[linear-gradient(135deg,rgba(99,102,241,0.95),rgba(59,130,246,0.88),rgba(168,85,247,0.75))] text-white'
            : 'border border-white/10 bg-white/70 text-foreground dark:bg-white/[0.06]',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function ChatPage() {
  const nav = useNavigate()
  const { analysis, file, chat, extractedText, appendChat } = useContractSession()
  const [value, setValue] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.length])

  const onSend = async () => {
    const v = value.trim()
    if (!v || sending) return
    setValue('')
    setSending(true)
    try {
      if (!extractedText?.trim()) {
        appendChat('assistant', 'No contract context found. Please upload and analyze a contract first.')
        return
      }
      appendChat('user', v)
      const res = await apiRequest('/chat', {
        method: 'POST',
        body: JSON.stringify({ question: v, context: extractedText }),
      })
      appendChat('assistant', String(res.answer || ''))
    } catch (err) {
      console.error(err)
      appendChat('assistant', 'Error: Unable to respond right now. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Chat
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Ask your contract anything
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Context-aware assistance{file ? ` for ${file.name}` : ''}.
          </p>
        </div>
        {!analysis ? (
          <Button variant="outline" onClick={() => nav('/upload')}>
            <FileText className="h-4 w-4" />
            Upload & analyze first
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground">
            Risk score: <span className="text-foreground/80">{analysis.riskScore}/100</span>
          </div>
        )}
      </div>

      <Card className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.6),transparent_55%)] dark:opacity-15" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            Smart Agreement Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="h-[52vh] min-h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-white/40 p-4 backdrop-blur-xl dark:bg-white/[0.03]">
            <div className="grid gap-3">
              <AnimatePresence initial={false}>
                {chat.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Bubble role={m.role}>{m.content}</Bubble>
                  </motion.div>
                ))}
              </AnimatePresence>
              {sending ? (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TypingIndicator />
                </motion.div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/50 p-3 backdrop-blur-xl dark:bg-white/[0.04]">
            <div className="flex items-end gap-2">
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask about renewal windows, termination, liability caps, data security, payment terms…"
                className="min-h-[44px] flex-1"
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void onSend()
                  }
                }}
              />
              <Button
                size="icon"
                className="h-11 w-11 rounded-xl"
                onClick={() => void onSend()}
                disabled={!value.trim() || sending}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Press Enter to send • Shift+Enter for newline
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

