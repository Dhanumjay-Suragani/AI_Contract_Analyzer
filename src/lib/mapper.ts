export function mapAnalysis(apiData: any, extractedText?: string) {
  const summary = String(apiData.summary || '')
  const textForWords = String(extractedText || '').trim()
  const riskExplanations = Array.isArray(apiData.risk_explanations) ? apiData.risk_explanations : []
  const riskWhyByLabel = new Map<string, string>()
  for (const item of riskExplanations) {
    const risk = String(item?.risk || '').trim()
    const why = String(item?.why || '').trim()
    if (risk && why) riskWhyByLabel.set(risk, why)
  }

  const heuristicReasons = Array.isArray(apiData.risk_reasons) ? apiData.risk_reasons : []
  return {
    summary,
    riskScore: apiData.risk_score,
    confidenceScore:
      typeof apiData.confidence_score === 'number' && Number.isFinite(apiData.confidence_score)
        ? Math.max(0, Math.min(100, Math.round(apiData.confidence_score)))
        : undefined,

    insights: (apiData.risks || []).map((r: string) => ({
      label: r,
      value:
        riskWhyByLabel.get(String(r)) ||
        'Potential legal/financial risk detected',
      tone: 'danger',
    })),

    deadlines: Array.isArray(apiData.deadlines) ? apiData.deadlines.map(String) : [],
    obligations: Array.isArray(apiData.obligations) ? apiData.obligations.map(String) : [],

    metrics: {
      clauseCount: (apiData.clauses || []).length,
      wordCount: textForWords ? textForWords.split(/\s+/).length : summary.trim() ? summary.trim().split(/\s+/).length : 0,
      riskLevel: apiData.risk_level,
    },

    clauses: (apiData.clauses || []).map((c: string, i: number) => ({
      id: String(i),
      title: c.split('—')[0] || 'Clause',
      summary: c,
      risk: apiData.risk_level === 'High' ? 'high' : apiData.risk_level === 'Medium' ? 'medium' : 'low',
      tags: [],
    })),

    // Keep optional extra data for future UI, without breaking current pages
    riskReasons: heuristicReasons,
  }
}