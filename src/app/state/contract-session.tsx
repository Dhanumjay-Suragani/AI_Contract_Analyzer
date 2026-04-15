import * as React from 'react'

export type ContractInsight = {
  label: string
  value: string
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
}

export type Clause = {
  id: string
  title: string
  summary: string
  risk: 'low' | 'medium' | 'high'
  tags: string[]
}

export type ContractAnalysis = {
  summary: string
  riskScore: number
  confidenceScore?: number
  insights: ContractInsight[]
  deadlines: string[]
  obligations: string[]
  metrics: {
    clauseCount: number
    wordCount: number
    riskLevel: 'Low' | 'Medium' | 'High'
  }
  clauses: Clause[]
  riskReasons?: { title: string; points: number; why: string }[]
}

export type ContractFile = {
  name: string
  size: number
  type: string
}

export type ContractHistoryItem = {
  id: string
  name: string
  uploadedAt: number
  extractedText: string
  analysis: any
}

type ContractSession = {
  file: ContractFile | null
  extractedText: string
  analysis: ContractAnalysis | null
  history: ContractHistoryItem[]
  chat: { id: string; role: 'user' | 'assistant'; content: string; ts: number }[]
}

type ContractSessionApi = ContractSession & {
  setFile: (file: ContractFile | null) => void
  generateMockAnalysis: () => void
  setExtractedText: (text: string) => void
  setAnalysis: (analysis: ContractAnalysis | null) => void
  setHistory: React.Dispatch<React.SetStateAction<ContractHistoryItem[]>>
  clearHistory: () => void
  appendChat: (role: 'user' | 'assistant', content: string) => void
  reset: () => void
  sendMessage: (content: string) => Promise<void>
}

const ContractSessionContext = React.createContext<ContractSessionApi | null>(null)

function pickRisk(score: number): ContractAnalysis['metrics']['riskLevel'] {
  if (score >= 75) return 'High'
  if (score >= 45) return 'Medium'
  return 'Low'
}

function mockAnalysis(fileName: string): ContractAnalysis {
  const base = Math.round(40 + Math.random() * 45)
  const riskScore = Math.min(92, Math.max(18, base))
  const clauseCount = Math.round(18 + Math.random() * 22)
  const wordCount = Math.round(1200 + Math.random() * 3200)
  const riskLevel = pickRisk(riskScore)

  const clauses: Clause[] = [
    {
      id: 'cl-termination',
      title: 'Termination & Renewal',
      summary:
        'Auto-renewal triggers unless cancellation is submitted within 30 days; termination fees apply for early exit.',
      risk: riskScore > 65 ? 'high' : 'medium',
      tags: ['Auto-renewal', 'Fees', 'Notice period'],
    },
    {
      id: 'cl-liability',
      title: 'Limitation of Liability',
      summary:
        'Liability is capped at fees paid in the last 3 months; excludes certain indirect damages.',
      risk: 'medium',
      tags: ['Cap', 'Indirect damages'],
    },
    {
      id: 'cl-ip',
      title: 'IP Ownership',
      summary:
        'Customer retains ownership of deliverables; provider receives a limited license for service operation.',
      risk: 'low',
      tags: ['License', 'Deliverables'],
    },
    {
      id: 'cl-data',
      title: 'Data Processing & Security',
      summary:
        'Security controls are described at a high level; breach notification window is 72 hours.',
      risk: riskScore > 55 ? 'high' : 'medium',
      tags: ['Breach notice', 'Controls'],
    },
    {
      id: 'cl-payment',
      title: 'Payment Terms',
      summary:
        'Net-15 with late fees; provider may suspend services after 10 days of non-payment.',
      risk: 'medium',
      tags: ['Late fees', 'Suspension'],
    },
  ]

  const risky = clauses.filter((c) => c.risk === 'high').length

  return {
    summary:
      `For ${fileName}, the agreement is generally standard but includes renewal, data security, and termination provisions that require attention. ` +
      `Top risk drivers: auto-renewal windows, liability cap scope, and operational suspension triggers.`,
    riskScore,
    insights: [
      {
        label: 'Negotiation leverage',
        value: 'High on renewal + breach notice terms; moderate on liability cap expansion.',
        tone: 'neutral',
      },
      {
        label: 'Urgent review items',
        value: risky ? `${risky} clause(s) flagged as high risk for immediate legal review.` : 'No high-risk clauses detected.',
        tone: risky ? 'danger' : 'success',
      },
      {
        label: 'Hidden costs',
        value: 'Early termination fee + late-payment penalties could materially increase total cost.',
        tone: 'warning',
      },
    ],
    metrics: {
      clauseCount,
      wordCount,
      riskLevel,
    },
    clauses: clauses.slice(0, Math.max(3, Math.min(clauses.length, clauseCount > 20 ? 5 : 4))),
  }
}

function id() {
  return Math.random().toString(16).slice(2)
}

export function ContractSessionProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = React.useState<ContractFile | null>(null)
  const [extractedText, setExtractedText] = React.useState(() => {
    try {
      return localStorage.getItem('contractText') || ''
    } catch {
      return ''
    }
  })
  const [analysis, setAnalysis] = React.useState<ContractAnalysis | null>(null)
  const [history, setHistory] = React.useState<ContractHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('contract_history')
      return stored ? (JSON.parse(stored) as ContractHistoryItem[]) : []
    } catch {
      return []
    }
  })
  const [chat, setChat] = React.useState<ContractSession['chat']>([
    {
      id: id(),
      role: 'assistant',
      content:
        'Upload a contract and ask me anything — I can summarize terms, highlight risks, and explain clauses in plain English.',
      ts: Date.now(),
    },
  ])

  const reset = React.useCallback(() => {
    setFile(null)
    setExtractedText('')
    setAnalysis(null)
    setChat([
      {
        id: id(),
        role: 'assistant',
        content:
          'Upload a contract and ask me anything — I can summarize terms, highlight risks, and explain clauses in plain English.',
        ts: Date.now(),
      },
    ])
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem('contractText', extractedText)
    } catch {
      // ignore storage failures (private mode, denied, etc)
    }
  }, [extractedText])

  React.useEffect(() => {
    try {
      localStorage.setItem('contract_history', JSON.stringify(history))
    } catch {
      // ignore storage failures
    }
  }, [history])

  const clearHistory = React.useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem('contract_history')
    } catch {
      // ignore
    }
  }, [])

  const appendChat = React.useCallback((role: 'user' | 'assistant', content: string) => {
    setChat((c) => [...c, { id: id(), role, content, ts: Date.now() }])
  }, [])

  const generateMockAnalysis = React.useCallback(() => {
    const name = file?.name ?? 'your contract'
    setAnalysis(mockAnalysis(name))
  }, [file?.name])

  const sendMessage = React.useCallback(
    async (content: string) => {
      const now = Date.now()
      const user = { id: id(), role: 'user' as const, content, ts: now }
      setChat((c) => [...c, user])

      const contractName = file?.name ?? 'this contract'
      const hasAnalysis = Boolean(analysis)

      await new Promise((r) => setTimeout(r, 650 + Math.random() * 450))

      const assistantContent =
        content.toLowerCase().includes('risk')
          ? `Risk-wise, the biggest red flags in ${contractName} are typically renewal/termination windows and liability caps. ${
              hasAnalysis
                ? `Your current risk score is ${analysis?.riskScore}/100, driven mainly by termination + security clauses.`
                : 'Run analysis first and I’ll quantify the risk score.'
            }`
          : content.toLowerCase().includes('summar')
            ? `Here’s the plain-English summary: ${hasAnalysis ? analysis?.summary : `Upload ${contractName} and I’ll generate a structured summary with key obligations, timelines, and carve-outs.`}`
            : `I can help with ${contractName}: ask about renewal dates, termination rights, liability limits, data security, or payment terms. Want a quick summary or a specific clause explained?`

      setChat((c) => [
        ...c,
        { id: id(), role: 'assistant' as const, content: assistantContent, ts: Date.now() },
      ])
    },
    [analysis, file?.name],
  )

  const value = React.useMemo<ContractSessionApi>(
    () => ({
      file,
      extractedText,
      analysis,
      history,
      chat,
      setFile,
      generateMockAnalysis,
      setExtractedText,
      setAnalysis,
      setHistory,
      clearHistory,
      appendChat,
      reset,
      sendMessage,
    }),
    [
      analysis,
      chat,
      extractedText,
      generateMockAnalysis,
      reset,
      sendMessage,
      file,
      appendChat,
      history,
      clearHistory,
    ],
  )

  return (
    <ContractSessionContext.Provider value={value}>
      {children}
    </ContractSessionContext.Provider>
  )
}

export function useContractSession() {
  const ctx = React.useContext(ContractSessionContext)
  if (!ctx) throw new Error('useContractSession must be used within ContractSessionProvider')
  return ctx
}

